const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacher: { type: String, default: '' },
  days: [{ type: String }],
  time: { type: String, default: '' },
  timePeriod: { type: String, enum: ['Morning', 'Evening'], default: 'Evening' },
  classroom: { type: String, enum: ['الأوضة الكبيرة', 'الأوضة الصغيرة', 'الصالة'], default: 'الأوضة الكبيرة' },
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
