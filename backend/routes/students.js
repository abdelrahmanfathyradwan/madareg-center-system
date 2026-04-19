const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET students by group
router.get('/group/:groupId', async (req, res) => {
  try {
    const students = await Student.find({ groupId: req.params.groupId }).lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().populate('groupId', 'name').lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
