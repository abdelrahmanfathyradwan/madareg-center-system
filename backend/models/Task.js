const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

// Index for fetching tasks by date efficiently
taskSchema.index({ date: 1 });

module.exports = mongoose.model('Task', taskSchema);
