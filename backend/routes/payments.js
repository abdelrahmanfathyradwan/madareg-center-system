const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Student = require('../models/Student');

// GET or CREATE payments for a group for a given month
router.post('/init', async (req, res) => {
  try {
    const { groupId, month } = req.body;
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid or missing groupId' });
    }
    // Default to current month if not provided
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const students = await Student.find({ groupId }).lean();

    // Check existing payment records
    const studentIds = students.map(s => s._id);
    const existing = await Payment.find({
      studentId: { $in: studentIds },
      month: targetMonth
    }).lean();

    const existingMap = {};
    existing.forEach(p => {
      existingMap[p.studentId.toString()] = p;
    });

    // Create missing payment records atomically using bulkWrite
    const bulkOps = [];
    for (const student of students) {
      if (!existingMap[student._id.toString()]) {
        bulkOps.push({
          updateOne: {
            filter: { studentId: student._id, month: targetMonth },
            update: { $setOnInsert: { studentId: student._id, month: targetMonth, status: 'unpaid' } },
            upsert: true
          }
        });
      }
    }
    if (bulkOps.length > 0) {
      try {
        await Payment.bulkWrite(bulkOps, { ordered: false });
      } catch (e) {
        if (e.code !== 11000 && (!e.message || !e.message.includes('11000'))) {
          throw e;
        }
      }
    }

    // Fetch all payment records
    const payments = await Payment.find({
      studentId: { $in: studentIds },
      month: targetMonth
    }).populate('studentId', 'name').lean();

    res.json({
      month: targetMonth,
      payments: payments
        .filter(p => p.studentId) // Null-safe check
        .map(p => ({
          _id: p._id,
          studentId: p.studentId._id,
          studentName: p.studentId.name,
          status: p.status
        }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE payment status (instant toggle)
router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }
    const { status } = req.body;
    if (!['paid', 'unpaid', 'contacted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: 'Not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
