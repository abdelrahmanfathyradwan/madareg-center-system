const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  phone: { type: String, default: '' },
  age: { type: Number, default: null },
  avatar: { type: String, default: '' }, // base64 encoded image
  educationalPlan: {
    target: { type: String, default: '' },
    future3Months: { type: String, default: '' },
    progress: { type: Number, default: 0 }
  },
  notes: [{
    text: { type: String, required: true },
    tag: { type: String, default: 'General' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

studentSchema.index({ groupId: 1 });

module.exports = mongoose.model('Student', studentSchema);


