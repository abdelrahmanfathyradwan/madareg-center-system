const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Student = require('../models/Student');

// GET all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().lean();
    // Attach student count to each group
    const groupIds = groups.map(g => g._id);
    const counts = await Student.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $group: { _id: '$groupId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });
    const result = groups.map(g => ({
      ...g,
      studentCount: countMap[g._id.toString()] || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single group
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).lean();
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const studentCount = await Student.countDocuments({ groupId: group._id });
    res.json({ ...group, studentCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET today's groups (filtered by Arabic day name)
router.get('/today/active', async (req, res) => {
  try {
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    // Also handle alternate spellings
    const dayAlt = ['الاحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const todayIndex = new Date().getDay();
    const todayName = dayNames[todayIndex];
    const todayAlt = dayAlt[todayIndex];

    const groups = await Group.find({
      $or: [
        { days: todayName },
        { days: todayAlt }
      ]
    }).lean();

    // Attach student counts
    const groupIds = groups.map(g => g._id);
    const counts = await Student.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $group: { _id: '$groupId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });

    const result = groups.map(g => ({
      ...g,
      studentCount: countMap[g._id.toString()] || 0
    }));

    res.json({ day: todayName, groups: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
