const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Group = require('../models/Group');

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ── Today's attendance ──────────────────────────────────────────
    const todaySessions = await Session.find({ date: today }).lean();
    const sessionIds = todaySessions.map((s) => s._id);
    const todayAttendance = await Attendance.find({ sessionId: { $in: sessionIds } }).lean();

    const presentCount   = todayAttendance.filter((a) => a.status === 'present').length;
    const absentCount    = todayAttendance.filter((a) => a.status === 'absent').length;
    const contactedCount = todayAttendance.filter((a) => a.status === 'contacted').length;

    // ── Current-month payments ───────────────────────────────────────
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthPayments = await Payment.find({ month: currentMonth }).lean();
    const paidCount   = monthPayments.filter((p) => p.status === 'paid').length;
    const unpaidCount = monthPayments.filter((p) => p.status === 'unpaid').length;

    // ── Students at risk ────────────────────────────────────────────
    // Last 20 sessions (all groups)
    const recentSessions = await Session.find().sort({ date: -1 }).limit(20).lean();
    const recentSessionIds = recentSessions.map((s) => s._id);

    const recentAttendance = await Attendance.find({
      sessionId: { $in: recentSessionIds },
    }).lean();

    const absenceCount = {};
    const contactCount = {};
    recentAttendance.forEach((a) => {
      const sid = a.studentId.toString();
      if (a.status === 'absent')    absenceCount[sid] = (absenceCount[sid] || 0) + 1;
      if (a.status === 'contacted') contactCount[sid]  = (contactCount[sid]  || 0) + 1;
    });

    // Unpaid students (current month)
    const unpaidStudentIds = new Set(
      monthPayments.filter((p) => p.status === 'unpaid').map((p) => p.studentId.toString())
    );

    // Build at-risk set
    const atRiskSet = new Set();
    Object.entries(absenceCount).forEach(([sid, n]) => { if (n >= 2) atRiskSet.add(sid); });
    Object.entries(contactCount).forEach(([sid, n]) => { if (n >= 2) atRiskSet.add(sid); });
    unpaidStudentIds.forEach((sid) => atRiskSet.add(sid));

    let atRiskStudents = [];
    if (atRiskSet.size > 0) {
      const students = await Student.find({ _id: { $in: Array.from(atRiskSet) } })
        .populate('groupId', 'name')
        .lean();

      atRiskStudents = students.map((s) => {
        const sid = s._id.toString();
        return {
          _id:       s._id,
          name:      s.name,
          groupId:   s.groupId?._id ?? null,
          groupName: s.groupId?.name ?? '',
          absences:  absenceCount[sid] || 0,
          contacts:  contactCount[sid] || 0,
          unpaid:    unpaidStudentIds.has(sid),
        };
      });

      atRiskStudents.sort((a, b) => b.absences - a.absences);
    }

    // ── Totals ───────────────────────────────────────────────────────
    const totalStudents = await Student.countDocuments();
    const totalGroups   = await Group.countDocuments();

    res.json({
      today: {
        present:   presentCount,
        absent:    absentCount,
        contacted: contactedCount,
        total:     todayAttendance.length,
      },
      payments: {
        paid:   paidCount,
        unpaid: unpaidCount,
        total:  monthPayments.length,
        month:  currentMonth,
      },
      atRiskStudents,
      totalStudents,
      totalGroups,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
