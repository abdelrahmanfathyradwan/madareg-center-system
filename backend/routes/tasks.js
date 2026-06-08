const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');

// GET tasks for a specific date (defaults to today)
router.get('/', async (req, res) => {
  console.time('[Tasks] Total Execution');
  try {
    let date;
    if (req.query.date) {
      date = new Date(req.query.date);
    } else {
      date = new Date();
    }
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const tasks = await Task.find({
      date: { $gte: date, $lt: nextDay }
    }).sort({ createdAt: -1 }).lean();

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    res.json({ date: date.toISOString(), tasks, stats: { total, completed, pending } });
    console.timeEnd('[Tasks] Total Execution');
  } catch (err) {
    console.timeEnd('[Tasks] Total Execution');
    res.status(500).json({ error: err.message });
  }
});

// POST create a new task
router.post('/', async (req, res) => {
  try {
    const { title, date } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    let taskDate;
    if (date) {
      taskDate = new Date(date);
    } else {
      taskDate = new Date();
    }
    taskDate.setHours(0, 0, 0, 0);

    const task = await Task.create({ title: title.trim(), date: taskDate });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle task completion
router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    const { completed } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: !!completed },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
