const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

// Compound index to prevent duplicate sessions
sessionSchema.index({ groupId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Session', sessionSchema);
