const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  month: { type: String, required: true }, // e.g. "2026-04"
  status: { type: String, enum: ['paid', 'unpaid', 'contacted'], default: 'unpaid' },
}, { timestamps: true });

// One payment record per student per month
paymentSchema.index({ studentId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
