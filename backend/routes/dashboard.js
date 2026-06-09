const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Group = require('../models/Group');

// Helper to time individual promises in parallel execution
async function timeQuery(label, promise) {
  console.time(label);
  try {
    const result = await promise;
    console.timeEnd(label);
    return result;
  } catch (err) {
    console.timeEnd(label);
    throw err;
  }
}

router.get('/', async (req, res) => {
  console.time('[Dashboard] 00. Total Execution');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = new Date().toISOString().slice(0, 7);

    // ── PHASE 1: Fire ALL independent queries in parallel ─────────
    console.time('[Dashboard] 01. Phase 1 (parallel block)');
    const [
      todaySessions,
      recentSessions,
      paymentAgg,
      unpaidPayments,
      totalStudents,
      totalGroups,
    ] = await Promise.all([
      timeQuery('[Dashboard] Query: Session.find(today)', Session.find({ date: today }).lean()),
      timeQuery('[Dashboard] Query: Session.find().sort().limit(20)', Session.find().sort({ date: -1 }).limit(20).lean()),
      timeQuery('[Dashboard] Query: Payment.aggregate(currentMonth)', Payment.aggregate([
        { $match: { month: currentMonth } },
        {
          $group: {
            _id: null,
            paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
            unpaid: { $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ])),
      timeQuery('[Dashboard] Query: Payment.find(unpaid)', Payment.find({ month: currentMonth, status: 'unpaid' }).select('studentId').lean()),
      timeQuery('[Dashboard] Query: Student.countDocuments()', Student.countDocuments()),
      timeQuery('[Dashboard] Query: Group.countDocuments()', Group.countDocuments()),
    ]);
    console.timeEnd('[Dashboard] 01. Phase 1 (parallel block)');

    // ── PHASE 2: Queries that depend on Phase 1 results ───────────
    console.time('[Dashboard] 02. Data Processing (Map Session Ids)');
    const sessionIds = todaySessions.map((s) => s._id);
    const recentSessionIds = recentSessions.map((s) => s._id);
    console.timeEnd('[Dashboard] 02. Data Processing (Map Session Ids)');

    console.time('[Dashboard] 03. Phase 2 (parallel block)');
    const [todayAttendance, recentAttendance] = await Promise.all([
      timeQuery('[Dashboard] Query: Attendance.find(today sessionIds)', Attendance.find({ sessionId: { $in: sessionIds } }).populate('studentId', '_id').lean()),
      timeQuery('[Dashboard] Query: Attendance.find(recent sessionIds)', Attendance.find({ sessionId: { $in: recentSessionIds } }).lean()),
    ]);
    console.timeEnd('[Dashboard] 03. Phase 2 (parallel block)');

    // ── Compute today stats (in-memory, instant) ─────────────────
    console.time('[Dashboard] 04. Data Processing (Today Stats)');
    
    // Deduplicate todayAttendance by studentId (prefer present over absent)
    const uniqueAttendanceMap = new Map();
    todayAttendance.forEach(a => {
      if (a.studentId) {
        const sid = a.studentId._id ? a.studentId._id.toString() : a.studentId.toString();
        if (!uniqueAttendanceMap.has(sid) || a.status === 'present') {
          uniqueAttendanceMap.set(sid, a);
        }
      }
    });
    const uniqueTodayAttendance = Array.from(uniqueAttendanceMap.values());

    const presentCount = uniqueTodayAttendance.filter((a) => a.status === 'present').length;
    const absentCount = uniqueTodayAttendance.filter((a) => a.status === 'absent').length;
    const contactedCount = uniqueTodayAttendance.filter((a) => a.status === 'absent' && a.isContacted).length;
    console.timeEnd('[Dashboard] 04. Data Processing (Today Stats)');

    // ── Compute payment stats (from aggregation) ─────────────────
    const payStats = paymentAgg[0] || { paid: 0, unpaid: 0, total: 0 };

    // ── Compute at-risk (in-memory, instant) ─────────────────────
    console.time('[Dashboard] 05. Data Processing (At-Risk Calculation)');
    const absenceCount = {};
    const contactCount = {};
    recentAttendance.forEach((a) => {
      const sid = a.studentId.toString();
      if (a.status === 'absent') absenceCount[sid] = (absenceCount[sid] || 0) + 1;
      if (a.status === 'absent' && a.isContacted) contactCount[sid] = (contactCount[sid] || 0) + 1;
    });

    const unpaidStudentIds = new Set(
      unpaidPayments.map((p) => p.studentId.toString())
    );

    const atRiskSet = new Set();
    Object.entries(absenceCount).forEach(([sid, n]) => { if (n >= 2) atRiskSet.add(sid); });
    Object.entries(contactCount).forEach(([sid, n]) => { if (n >= 2) atRiskSet.add(sid); });
    unpaidStudentIds.forEach((sid) => atRiskSet.add(sid));
    console.timeEnd('[Dashboard] 05. Data Processing (At-Risk Calculation)');

    // ── PHASE 3: At-risk populate (only if needed) ───────────────
    let atRiskStudents = [];
    if (atRiskSet.size > 0) {
      console.time('[Dashboard] 06. Phase 3 (at-risk populate block)');
      const students = await timeQuery('[Dashboard] Query: Student.find(at-risk set) + populate', 
        Student.find({ _id: { $in: Array.from(atRiskSet) } })
          .select('name groupId')
          .populate('groupId', 'name')
          .lean()
      );
      console.timeEnd('[Dashboard] 06. Phase 3 (at-risk populate block)');

      console.time('[Dashboard] 07. Data Processing (At-Risk Assembly)');
      atRiskStudents = students.map((s) => {
        const sid = s._id.toString();
        return {
          _id: s._id,
          name: s.name,
          groupId: s.groupId?._id ?? null,
          groupName: s.groupId?.name ?? '',
          absences: absenceCount[sid] || 0,
          contacts: contactCount[sid] || 0,
          unpaid: unpaidStudentIds.has(sid),
        };
      });

      atRiskStudents.sort((a, b) => b.absences - a.absences);
      console.timeEnd('[Dashboard] 07. Data Processing (At-Risk Assembly)');
    }

    console.time('[Dashboard] 08. Response Assembly');
    res.json({
      today: {
        present: presentCount,
        absent: absentCount,
        contacted: contactedCount,
        total: uniqueTodayAttendance.length,
      },
      payments: {
        paid: payStats.paid,
        unpaid: payStats.unpaid,
        total: payStats.total,
        month: currentMonth,
      },
      atRiskStudents,
      totalStudents,
      totalGroups,
    });
    console.timeEnd('[Dashboard] 08. Response Assembly');
    console.timeEnd('[Dashboard] 00. Total Execution');
  } catch (err) {
    console.timeEnd('[Dashboard] 00. Total Execution');
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
