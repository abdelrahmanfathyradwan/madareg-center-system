const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Group = require('../models/Group');

router.get('/', async (req, res) => {
  console.time('[Dashboard] Total Execution');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = new Date().toISOString().slice(0, 7);

    // ── PHASE 1: Fire ALL independent queries in parallel ─────────
    console.time('[Dashboard] Phase 1 (parallel)');
    const [
      todaySessions,
      recentSessions,
      paymentAgg,
      unpaidPayments,
      totalStudents,
      totalGroups,
    ] = await Promise.all([
      Session.find({ date: today }).lean(),
      Session.find().sort({ date: -1 }).limit(20).lean(),
      Payment.aggregate([
        { $match: { month: currentMonth } },
        {
          $group: {
            _id: null,
            paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
            unpaid: { $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
      Payment.find({ month: currentMonth, status: 'unpaid' }).select('studentId').lean(),
      Student.countDocuments(),
      Group.countDocuments(),
    ]);
    console.timeEnd('[Dashboard] Phase 1 (parallel)');

    // ── PHASE 2: Queries that depend on Phase 1 results ───────────
    const sessionIds = todaySessions.map((s) => s._id);
    const recentSessionIds = recentSessions.map((s) => s._id);

    console.time('[Dashboard] Phase 2 (parallel)');
    const [todayAttendance, recentAttendance] = await Promise.all([
      Attendance.find({ sessionId: { $in: sessionIds } }).lean(),
      Attendance.find({ sessionId: { $in: recentSessionIds } }).lean(),
    ]);
    console.timeEnd('[Dashboard] Phase 2 (parallel)');

    // ── Compute today stats (in-memory, instant) ─────────────────
    const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
    const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;
    const contactedCount = todayAttendance.filter((a) => a.status === 'absent' && a.isContacted).length;

    // ── Compute payment stats (from aggregation) ─────────────────
    const payStats = paymentAgg[0] || { paid: 0, unpaid: 0, total: 0 };

    // ── Compute at-risk (in-memory, instant) ─────────────────────
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

    // ── PHASE 3: At-risk populate (only if needed) ───────────────
    let atRiskStudents = [];
    if (atRiskSet.size > 0) {
      console.time('[Dashboard] Phase 3 (at-risk populate)');
      const students = await Student.find({ _id: { $in: Array.from(atRiskSet) } })
        .select('name groupId')
        .populate('groupId', 'name')
        .lean();
      console.timeEnd('[Dashboard] Phase 3 (at-risk populate)');

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
    }

    res.json({
      today: {
        present: presentCount,
        absent: absentCount,
        contacted: contactedCount,
        total: todayAttendance.length,
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
    console.timeEnd('[Dashboard] Total Execution');
  } catch (err) {
    console.timeEnd('[Dashboard] Total Execution');
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
