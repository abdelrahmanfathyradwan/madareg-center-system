const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// GET or CREATE today's session for a group, returns session + attendance records
router.post('/start', async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid or missing groupId' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create session atomically to prevent duplicate key errors (E11000)
    let session = await Session.findOneAndUpdate(
      { groupId, date: today },
      { $setOnInsert: { groupId, date: today } },
      { new: true, upsert: true }
    );

    // Get all students in the group
    const students = await Student.find({ groupId }).lean();

    // Get existing attendance records for this session
    const existingAttendance = await Attendance.find({ sessionId: session._id }).lean();
    const attendanceMap = {};
    existingAttendance.forEach(a => {
      attendanceMap[a.studentId.toString()] = a;
    });

    // Create missing attendance records (default absent) atomically using bulkWrite
    const bulkOps = [];
    for (const student of students) {
      if (!attendanceMap[student._id.toString()]) {
        bulkOps.push({
          updateOne: {
            filter: { sessionId: session._id, studentId: student._id },
            update: { $setOnInsert: { sessionId: session._id, studentId: student._id, status: 'absent' } },
            upsert: true
          }
        });
      }
    }
    if (bulkOps.length > 0) {
      try {
        await Attendance.bulkWrite(bulkOps, { ordered: false });
      } catch (e) {
        // Ignore duplicate key errors if concurrent requests still manage to trigger it during upserts
        if (e.code !== 11000 && (!e.message || !e.message.includes('11000'))) {
          throw e;
        }
      }
    }

    // Fetch all attendance for this session
    const attendance = await Attendance.find({ sessionId: session._id })
      .populate('studentId', 'name')
      .lean();

    res.json({
      session,
      attendance: attendance
        .filter(a => a.studentId) // Null-safe check
        .map(a => ({
          _id: a._id,
          studentId: a.studentId._id,
          studentName: a.studentId.name,
          studentGroup: a.studentId.groupId,
          studentPhone: a.studentId.phone,
          status: a.status,
          isContacted: a.isContacted
        }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE attendance status or contact status
router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid attendance ID' });
    }
    const { status, isContacted } = req.body;
    
    const updateData = {};
    if (status !== undefined) {
      if (!['present', 'absent'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updateData.status = status;
    }
    if (isContacted !== undefined) {
      updateData.isContacted = !!isContacted;
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    if (!mongoose.Types.ObjectId.isValid(req.params.groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
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

// GET today's absent students across all groups
router.get('/today/absent', async (req, res) => {
  console.time('[Attendance] /today/absent Total Execution');
  try {
    const today = new Date();
    // Parse optional date parameter, default to today
    if (req.query.date) {
      const parsedDate = new Date(req.query.date);
      if (!isNaN(parsedDate)) {
        today.setTime(parsedDate.getTime());
      }
    }
    today.setHours(0, 0, 0, 0);

    // Get all sessions for the given date
    console.time('[Attendance] /today/absent Fetch Sessions');
    const sessions = await Session.find({ date: today }).lean();
    console.timeEnd('[Attendance] /today/absent Fetch Sessions');
    
    const sessionIds = sessions.map(s => s._id);

    // Find all attendance records for these sessions
    console.time('[Attendance] /today/absent Fetch Absent Records');
    const allRecords = await Attendance.find({ 
      sessionId: { $in: sessionIds }
    }).populate({
      path: 'studentId',
      select: 'name phone groupId',
      populate: { path: 'groupId', select: 'name' }
    }).lean();
    console.timeEnd('[Attendance] /today/absent Fetch Absent Records');

    // Deduplicate records by studentId, keeping 'present' status over 'absent' if there are multiple
    const latestAttendanceMap = new Map();
    allRecords.forEach(a => {
      if (a.studentId) {
        const sid = a.studentId._id.toString();
        if (!latestAttendanceMap.has(sid) || a.status === 'present') {
          latestAttendanceMap.set(sid, a);
        }
      }
    });

    // Filter to only absent students
    const uniqueAbsentRecords = Array.from(latestAttendanceMap.values()).filter(a => a.status === 'absent');

    // Format response
    const result = uniqueAbsentRecords
      .map(a => ({
        _id: a._id,
        sessionId: a.sessionId,
        studentId: a.studentId._id,
        studentName: a.studentId.name,
        studentPhone: a.studentId.phone,
        groupName: a.studentId.groupId?.name || 'بدون حلقة',
        isContacted: a.isContacted
      }));

    res.json(result);
    console.timeEnd('[Attendance] /today/absent Total Execution');
  } catch (err) {
    console.timeEnd('[Attendance] /today/absent Total Execution');
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
