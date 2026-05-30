const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');
const Student = require('./models/Student');
const Session = require('./models/Session');
const Attendance = require('./models/Attendance');

const GROUPS_DATA = [
  {
    name: 'أبي بن كعب',
    teacher: 'م/خالد & عبدالرحمن',
    days: ['السبت', 'الاربعاء'],
    time: '5-7',
    students: [
      'يوسف محمد عبدالله',
      'عمر أحمد حسن',
      'محمد خالد إبراهيم',
      'أحمد سعيد محمود',
      'عبدالرحمن طارق',
      'حمزة وليد',
      'إبراهيم فاروق',
      'سليمان جمال',
      'مصطفى عادل',
      'كريم حسام'
    ]
  },
  {
    name: 'عبدالله بن مسعود',
    teacher: 'م/خالد & عبدالرحمن',
    days: ['السبت', 'الاربعاء'],
    time: '3-5',
    students: [
      'وليد رأفت احمد فتحي',
      'احمد رضا احمد احمد',
      'ياسر حسام حسن ابراهيم',
      'احمد عبدالنبي عبدالرحمن',
      'مروان احمد زكريا',
      'عبدالله محمد عبدالله',
      'حسن حسام حسن',
      'زياد محمد عبدالرؤوف',
      'مازن محمد',
      'عبدالعزيز ممدوح محمد',
      'احمد محمد عبدالغني',
      'عمرو شحتة'
    ]
  },
  {
    name: 'زيد بن ثابت',
    teacher: 'د محمد',
    days: ['الاحد', 'الخميس'],
    time: '2-4',
    students: [
      'عبدالرحمن محمد عبداللطيف',
      'محمد فتحي',
      'حمزة حازم',
      'أحمد عبدالباسط',
      'أدهم',
    ]
  },
  {
    name: 'عثمان بن عفان',
    teacher: 'م/خالد & عبدالرحمن',
    days: ['الاحد', 'الخميس'],
    time: '3-5',
    students: [
      'عمر عبده',
      'مصطفي إسماعيل',
      'سامح بسام',
      'مصطفي محمد إبراهيم',
      'ياسين محمد زكريا',
      'آدم محمد زكريا',
      'يوسف محمد زكريا',
      'خالد أحمد عثمان',
      'عمر أحمد إبراهيم',
      'أحمد هاني',
      'محمد هاني',
      'معاذ أحمد ضياء',
    ]
  },
  {
    name: 'علي بن ابي طالب',
    teacher: 'م/خالد & عبدالرحمن',
    days: ['الاحد', 'الخميس'],
    time: '5-7',
    students: [
      'عمر أحمد محمد عبدالرحمن',
      'محمد رضا أحمد عبدالحفيظ',
      'حمزة أحمد محمد عبدالتواب',
      'محمد رضا عبدالرشيد',
      'عمر محمد إبراهيم',
      'أسامة محمد إبراهيم',
      'محمد إسماعيل',
      'آدم محمد السيد',
      'عبدالرحمن أحمد عبدالسلام',
      'محمود حسن'
    ]
  },
  {
    name: 'أبو بكر الصديق',
    teacher: 'م/خالد & عبدالرحمن',
    days: ['الاحد', 'الخميس'],
    time: '4-6',
    students: [
      'محمد تامر عبداللطيف',
      'مازن أحمد هيكل',
      'إبراهيم رضا حسيني',
      'عبدالله أحمد محمد',
      'أحمد رضا لطفي',
      'آدم شحته',
      'أحمد محمد أحمد',
      'محمد علي إمام',
      'حسن حسام حسن'
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
