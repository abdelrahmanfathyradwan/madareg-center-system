const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['present', 'absent', 'contacted'], default: 'absent' },
}, { timestamps: true });

// Prevent duplicate attendance records
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
// Optimize queries by studentId
attendanceSchema.index({ studentId: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
