const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');
const Student = require('./models/Student');
const Session = require('./models/Session');
const Attendance = require('./models/Attendance');

const GROUPS_DATA = [
  {
    name: 'أبو بكر الصديق',
    teacher: 'عبدالرحمن فتحي',
    days: ['السبت', 'الاثنين', 'الأربعاء'],
    time: '12 م - 2 م',
    students: [
      'أسامة محمد إبراهيم',
      'عمر محمد ابراهيم',
      'خالد أحمد عثمان',
      'عبدالرحمن عبداللطيف',
      'عبدالله ناجي',
      'عبدالرحمن عبدالسلام',
      'محمد اسماعيل',
      'محمد أحمد عبدالرحمن',
      'محمد رضا عبدالحفيظ',
      'عمر أحمد عبدالرحمن'
    ]
  },

  {
    name: 'سلمان الفارسي',
    teacher: 'عبدالرحمن فتحي',
    days: ['السبت', 'الاثنين', 'الأربعاء'],
    time: '2 م - 4 م',
    students: [
      'السيد أحمد السيد',
      'أحمد وائل',
      'أحمد مصطفي سمير',
      'أحمد مصطفي عبدالعزيز',
      'عمر عبده',
      'خالد رضا',
      'إياد رضا',
      'أحمد جمال',
      'خالد أشرف'
    ]
  },

  {
    name: 'أبي بن كعب',
    teacher: 'عبدالرحمن فتحي',
    days: ['السبت', 'الاثنين', 'الأربعاء'],
    time: '4 م - 6 م',
    students: [
      'يوسف هاني',
      'يونس هاني',
      'زياد عبدالرؤوف',
      'أحمد عبدالرؤوف',
      'معتصم أحمد عثمان',
      'مالك سعيد',
      'محمد سعيد',
      'عبدالعزيز ممدوح',
      'أنس حازم',
      'خالد أحمد عبدالرحمن',
      'عبدالله محمد عبدالله',
      'يوسف محمد عبداللطيف',
      'عمرو شحته',
      'آدم شحته'
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Group.deleteMany({});
    await Student.deleteMany({});
    await Session.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    for (const groupData of GROUPS_DATA) {
      const group = await Group.create({
        name: groupData.name,
        teacher: groupData.teacher,
        days: groupData.days,
        time: groupData.time
      });
      console.log(`Created group: ${group.name}`);

      const studentDocs = groupData.students.map(name => ({
        name,
        groupId: group._id
      }));
      await Student.insertMany(studentDocs);
      console.log(`  Added ${studentDocs.length} students`);
    }

    console.log('\n✅ Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
