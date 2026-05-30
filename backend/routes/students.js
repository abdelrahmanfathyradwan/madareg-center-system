const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Session = require('../models/Session');

// GET students by group
router.get('/group/:groupId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    const students = await Student.find({ groupId: req.params.groupId }).select('-avatar').lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student details (Section 1, 2, 3, 4, 5 data)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    const student = await Student.findById(req.params.id).populate('groupId', 'name').lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Fetch attendance history
    const attendanceRecords = await Attendance.find({ studentId: student._id }).lean();
    
    // Fetch associated sessions to get the dates
    const sessionIds = attendanceRecords.map(a => a.sessionId);
    const sessions = await Session.find({ _id: { $in: sessionIds } }).lean();
    const sessionMap = {};
    sessions.forEach(s => { sessionMap[s._id.toString()] = s.date; });

    // Construct detailed attendance history
    const attendanceHistory = attendanceRecords.map(a => ({
      _id: a._id,
      sessionId: a.sessionId,
      status: a.status,
      date: sessionMap[a.sessionId.toString()] || null,
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate attendance percentage
    const totalSessions = attendanceHistory.length;
    const presentSessions = attendanceHistory.filter(a => a.status === 'present').length;
    const lateSessions = attendanceHistory.filter(a => a.status === 'late' || a.status === 'contacted').length; // let's treat contacted as absent, but present is present
    const attendancePercentage = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

    // Fetch payments history
    const payments = await Payment.find({ studentId: student._id }).sort({ month: -1 }).lean();

    // Determine visual status indicator: committed, average, at risk
    // committed: present >= 80%, average: present >= 60% and < 80%, at risk: < 60%
    let visualStatus = 'committed';
    if (attendancePercentage < 60) {
      visualStatus = 'at risk';
    } else if (attendancePercentage < 80) {
      visualStatus = 'average';
    }

    res.json({
      ...student,
      attendancePercentage,
      attendanceHistory,
      payments,
      visualStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all students
router.get('/', async (req, res) => {
  try {
    // Exclude avatar from the query to avoid large payloads
    const students = await Student.find().select('-avatar').populate('groupId', 'name').lean();
    
    // Fetch all attendance & payments to calculate visual indicators
    const allAttendance = await Attendance.find().lean();
    const allPayments = await Payment.find().lean();
    
    // Group records by student
    const attMap = {};
    allAttendance.forEach(a => {
      const sid = a.studentId.toString();
      if (!attMap[sid]) attMap[sid] = { total: 0, present: 0 };
      attMap[sid].total++;
      if (a.status === 'present') attMap[sid].present++;
    });

    const currentMonth = new Date().toISOString().slice(0, 7);
    const unpaidSet = new Set(
      allPayments.filter(p => p.month === currentMonth && p.status === 'unpaid').map(p => p.studentId.toString())
    );

    const result = students.map(s => {
      const sid = s._id.toString();
      const att = attMap[sid] || { total: 0, present: 0 };
      const attPct = att.total > 0 ? Math.round((att.present / att.total) * 100) : 100;
      const unpaid = unpaidSet.has(sid);

      let visualStatus = 'committed';
      if (attPct < 60 || unpaid) {
        visualStatus = 'at risk';
      } else if (attPct < 80) {
        visualStatus = 'average';
      }

      return {
        ...s,
        attendancePercentage: attPct,
        paymentStatus: unpaid ? 'unpaid' : 'paid',
        visualStatus
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update student details
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    const { name, phone, age, avatar, educationalPlan, groupId } = req.body;
    if (groupId && !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (name !== undefined) student.name = name;
    if (phone !== undefined) student.phone = phone;
    if (age !== undefined) student.age = age;
    if (avatar !== undefined) student.avatar = avatar;
    if (educationalPlan !== undefined) {
      student.educationalPlan = {
        target: educationalPlan.target ?? student.educationalPlan.target,
        future3Months: educationalPlan.future3Months ?? student.educationalPlan.future3Months,
        progress: educationalPlan.progress ?? student.educationalPlan.progress
      };
    }
    if (groupId !== undefined) student.groupId = groupId;

    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add note to student notes timeline
router.post('/:id/notes', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    const { text, tag } = req.body;
    if (!text) return res.status(400).json({ error: 'Note text is required' });

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.notes.push({ text, tag: tag || 'General' });
    await student.save();

    res.status(201).json(student.notes[student.notes.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a note from student timeline
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.noteId)) {
      return res.status(400).json({ error: 'Invalid student or note ID' });
    }
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.notes = student.notes.filter(n => n._id.toString() !== req.params.noteId);
    await student.save();

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

