const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Group = require('../models/Group');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');

// GET all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().lean();
    // Attach student count to each group
    const groupIds = groups.map(g => g._id);
    const counts = await Student.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $group: { _id: '$groupId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });
    const result = groups.map(g => ({
      ...g,
      studentCount: countMap[g._id.toString()] || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET today's groups (filtered by Arabic day name)
router.get('/today/active', async (req, res) => {
  try {
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    // Also handle alternate spellings
    const dayAlt = ['الاحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const todayIndex = new Date().getDay();
    const todayName = dayNames[todayIndex];
    const todayAlt = dayAlt[todayIndex];

    const groups = await Group.find({
      $or: [
        { days: todayName },
        { days: todayAlt }
      ]
    }).lean();

    // Attach student counts
    const groupIds = groups.map(g => g._id);
    const counts = await Student.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $group: { _id: '$groupId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });

    const result = groups.map(g => ({
      ...g,
      studentCount: countMap[g._id.toString()] || 0
    }));

    res.json({ day: todayName, groups: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single group
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    const group = await Group.findById(req.params.id).lean();
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const studentCount = await Student.countDocuments({ groupId: group._id });
    res.json({ ...group, studentCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET group monthly record
router.get('/:id/monthly', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    const groupId = req.params.id;
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    const group = await Group.findById(groupId).lean();
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const students = await Student.find({ groupId }).lean();

    // Fetch all sessions of the group
    const sessions = await Session.find({ groupId }).lean();
    const sessionIds = sessions.map(s => s._id);

    // Fetch attendance for these sessions
    const attendance = await Attendance.find({ sessionId: { $in: sessionIds } }).lean();

    // Fetch payments for this month
    const payments = await Payment.find({ studentId: { $in: students.map(s => s._id) }, month }).lean();

    // Map data per student
    const attendanceMap = {};
    attendance.forEach(a => {
      const sid = a.studentId.toString();
      if (!attendanceMap[sid]) attendanceMap[sid] = { total: 0, present: 0 };
      attendanceMap[sid].total++;
      if (a.status === 'present') attendanceMap[sid].present++;
    });

    const paymentMap = {};
    payments.forEach(p => {
      paymentMap[p.studentId.toString()] = p.status;
    });

    const records = students.map(s => {
      const sid = s._id.toString();
      const att = attendanceMap[sid] || { total: 0, present: 0 };
      const attendanceRate = att.total > 0 ? Math.round((att.present / att.total) * 100) : 100;
      const paymentStatus = paymentMap[sid] || 'unpaid';

      let commitment = 'committed';
      if (attendanceRate < 60 || paymentStatus === 'unpaid') {
        commitment = 'at risk';
      } else if (attendanceRate < 80) {
        commitment = 'average';
      }

      return {
        _id: s._id,
        name: s.name,
        phone: s.phone || '',
        age: s.age || null,
        attendanceRate,
        paymentStatus,
        commitment
      };
    });

    res.json({
      group,
      month,
      records
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
