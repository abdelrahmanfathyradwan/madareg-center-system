const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// GET or CREATE today's session for a group, returns session + attendance records
router.post('/start', async (req, res) => {
  try {
    const { groupId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create session
    let session = await Session.findOne({ groupId, date: today });
    if (!session) {
      session = await Session.create({ groupId, date: today });
    }

    // Get all students in the group
    const students = await Student.find({ groupId }).lean();

    // Get existing attendance records for this session
    const existingAttendance = await Attendance.find({ sessionId: session._id }).lean();
    const attendanceMap = {};
    existingAttendance.forEach(a => {
      attendanceMap[a.studentId.toString()] = a;
    });

    // Create missing attendance records (default absent)
    const newRecords = [];
    for (const student of students) {
      if (!attendanceMap[student._id.toString()]) {
        newRecords.push({
          sessionId: session._id,
          studentId: student._id,
          status: 'absent'
        });
      }
    }
    if (newRecords.length > 0) {
      await Attendance.insertMany(newRecords);
    }

    // Fetch all attendance for this session
    const attendance = await Attendance.find({ sessionId: session._id })
      .populate('studentId', 'name')
      .lean();

    res.json({
      session,
      attendance: attendance.map(a => ({
        _id: a._id,
        studentId: a.studentId._id,
        studentName: a.studentId.name,
        status: a.status
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE attendance status (instant toggle)
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!attendance) return res.status(404).json({ error: 'Not found' });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET attendance history for a group (last N sessions)
router.get('/history/:groupId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sessions = await Session.find({ groupId: req.params.groupId })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    const sessionIds = sessions.map(s => s._id);
    const attendance = await Attendance.find({ sessionId: { $in: sessionIds } })
      .populate('studentId', 'name')
      .lean();

    res.json({ sessions, attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
