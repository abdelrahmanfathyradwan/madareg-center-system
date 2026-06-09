const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');
const Student = require('./models/Student');
const Session = require('./models/Session');
const Attendance = require('./models/Attendance');

const GROUPS_DATA = [
  {
    name: 'أبي بن كعب',
    teacher: 'خالد & مصطفى',
    days: ['الأحد', 'الثلاثاء', 'الخميس'],
    time: '8 ص - 1 م',
    students: [
      'ياسين أحمد إمام',
      'ياسين محمد زكريا',
      'مروان أحمد زكريا',
      'عمرو شحته',
      'أحمد عبد النبي',
      'أحمد عبد النبي',
      'أحمد عطاء',
      'أحمد محمود أحمد',
      'ياسين أحمد محمد الأنور',
      'علي محمود محمد الحسيني',
      'عمر محمود محمد حسين',
      'محمد أحمد علي',
      'علي محمود',
      'عبد الرحمن محمد عبد الرحمن'
    ]
  },

  {
    name: 'زيد بن ثابت',
    teacher: 'عبدالرحمن + محمد جمعة',
    days: ['الأحد', 'الثلاثاء', 'الخميس'],
    time: '8 ص - 1 م',
    students: [
      'محمد رضا سمير',
      'يوسف محمد زكريا',
      'معاذ ولاء',
      'مصطفى أحمد ضياء',
      'يوسف محمد عبد اللطيف',
      'يونس محمد عبد اللطيف',
      'آدم أحمد زكريا',
      'خالد أحمد محمد عبد الرحمن',
      'سامح بسام',
      'مازن شحته',
      'حسن خالد',
      'سامي محمد سامي',
      'مصطفى محمد أبو العزم',
      'زياد محمد عبد الرؤوف'
    ]
  },

  {
    name: 'عبدالله بن مسعود',
    teacher: 'الدكتور محمد عبدالرحيم',
    days: ['الأحد', 'الثلاثاء', 'الخميس'],
    time: '8 ص - 1 م',
    students: [
      'أحمد محمد عبد الرؤوف',
      'وليد رأفت',
      'ياسر حسام',
      'عمر أحمد إبراهيم',
      'عبد العزيز ممدوح',
      'عبد الله محمد عبد الله',
      'عادل رامي',
      'أحمد رضا',
      'مروان عمرو',
      'أحمد محمد سامي',
      'محمد ولاء',
      'معتصم أحمد عثمان',
      'عصام عمرو',
      'عبد المنعم'
    ]
  },

  {
    name: 'أبو بكر الصديق',
    teacher: 'عبد الرحمن',
    days: ['الأحد', 'الثلاثاء', 'الخميس'],
    time: '2 م - 6 م',
    students: [
      'عمر أحمد محمد عبد الرحمن',
      'خالد أحمد عثمان',
      'عمر أحمد محمد عبد الرحمن',
      'خالد أحمد عثمان',
      'محمد إسماعيل',
      'حمزة أحمد عبد التواب',
      'أسامة محمد إبراهيم',
      'عمر محمد إبراهيم',
      'أحمد هاني',
      'محمد هاني',
      'محمد رضا عبد الرشيد',
      'محمود حسن',
      'آدم محمد السيد',
      'آدم محمد السيد',
      'عبد الرحمن أحمد عبد السلام',
      'أحمد عادل'
    ]
  },

  {
    name: 'عمر بن الخطاب',
    teacher: 'أحمد حماده',
    days: ['الأحد', 'الثلاثاء', 'الخميس'],
    time: '2 م - 6 م',
    students: [
      'أحمد حماده',
      'سيف حازم',
      'محمد علي إمام',
      'مصطفى إسماعيل',
      'مصطفى إسماعيل',
      'عمر عبده',
      'حسن حسام',
      'إياد رضا',
      'أحمد محمد أحمد',
      'مصطفى محمد إبراهيم',
      'مازن أحمد أحمد'
    ]
  },

  {
    name: 'عثمان بن عفان',
    teacher: 'معلم',
    days: ['الأحد', 'الثلاثاء', 'الخميس'],
    time: '2 م - 6 م',
    students: [
      'أحمد مصطفى سمير',
      'آدم شحته',
      'خالد أشرف',
      'علي عبد اللطيف',
      'محمد تامر',
      'أحمد رضا لطفي',
      'عبد الله أحمد محمد',
      'إبراهيم رضا حسيني',
      'مازن أحمد هيكل',
      'معاذ أحمد ضياء'
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
