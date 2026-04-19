const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacher: { type: String, default: '' },
  days: [{ type: String }],
  time: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
