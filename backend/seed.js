const mongoose = require('mongoose');
require('dotenv').config();
const Group = require('./models/Group');
const Student = require('./models/Student');

const GROUPS_DATA = [
  {
    name: 'أبي بن كعب',
    teacher: '',
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
    teacher: '',
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
    name: 'أبو بكر الصديق',
    teacher: '',
    days: ['الاحد', 'الخميس'],
    time: '2-4',
    students: [
      'محمد أشرف علي',
      'يوسف عماد الدين',
      'أنس محمد سعيد',
      'عبدالله حسن أحمد',
      'طارق إبراهيم حسين',
      'بلال عمرو فؤاد',
      'خالد محمود سامي',
      'رامي ياسر خالد',
      'سامي وائل محمد',
      'صهيب عبدالرحمن'
    ]
  },
  {
    name: 'عثمان بن عفان',
    teacher: '',
    days: ['الاحد', 'الخميس'],
    time: '3-5',
    students: [
      'محمد تامر عبداللطيف',
      'أيمن خالد حسن',
      'عبدالملك سعد',
      'فارس أحمد محمود',
      'زكريا عبدالله محمد',
      'حاتم إسماعيل',
      'ماجد عبدالغني',
      'نبيل حسام خالد',
      'وسام طارق',
      'جمال الدين يحيى'
    ]
  },
  {
    name: 'علي بن ابي طالب',
    teacher: '',
    days: ['الاحد', 'الخميس'],
    time: '5-7',
    students: [
      'عمار بن سالم',
      'حمد ناصر العلي',
      'ياسين مصطفى أحمد',
      'تميم عبدالرحمن',
      'براء محمد خالد',
      'معاذ سعيد حسن',
      'أسامة عادل',
      'هيثم محمود',
      'شهاب الدين وليد',
      'عبدالواحد إبراهيم'
    ]
  },
  {
    name: 'زيد بن ثابت',
    teacher: 'د محمد',
    days: ['الاحد', 'الخميس'],
    time: '4-6',
    students: [
      'رائد أحمد صالح',
      'منصور خالد حسين',
      'عبدالقادر محمد',
      'سراج الدين علي',
      'نور الدين أحمد',
      'ريان عبدالله',
      'أمجد حسام',
      'بشار ياسر',
      'خليل إبراهيم محمد',
      'صالح عبدالرزاق'
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
