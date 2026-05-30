"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiChevronLeft,
  HiPhone,
  HiCalendar,
  HiSparkles,
  HiFlag,
  HiPencilSquare,
  HiTrash,
  HiPlus,
  HiClock,
  HiAcademicCap,
  HiCurrencyDollar,
  HiUser,
  HiCheckCircle,
} from "react-icons/hi2";

export default function StudentProfilePage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Decoupled edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  // Profile Edit fields state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGroup, setEditGroup] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  // Plan Edit fields state
  const [editTarget, setEditTarget] = useState("");
  const [editFuture, setEditFuture] = useState("");
  const [editProgress, setEditProgress] = useState(0);

  // Notes state
  const [newNote, setNewNote] = useState("");
  const [noteTag, setNoteTag] = useState("جودة الحفظ");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        const [studentData, groupsData] = await Promise.all([
          api.getStudent(id),
          api.getGroups(),
        ]);
        setStudent(studentData);
        setGroups(groupsData);
  
        // Populate edit states
        setEditName(studentData.name || "");
        setEditPhone(studentData.phone || "");
        setEditAge(studentData.age || "");
        setEditGroup(studentData.groupId?._id || "");
        setEditAvatar(studentData.avatar || "");
        setEditTarget(studentData.educationalPlan?.target || "");
        setEditFuture(studentData.educationalPlan?.future3Months || "");
        setEditProgress(studentData.educationalPlan?.progress || 0);
      } catch (err) {
        console.error(err);
        setError("فشل تحميل بيانات الطالب الشخصية.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudentData();
  }, [id]);

  const refreshStudentData = async () => {
    try {
      const studentData = await api.getStudent(id);
      setStudent(studentData);
      
      // Update specific fields that might have changed
      setEditName(studentData.name || "");
      setEditPhone(studentData.phone || "");
      setEditAge(studentData.age || "");
      setEditGroup(studentData.groupId?._id || "");
      setEditAvatar(studentData.avatar || "");
      setEditTarget(studentData.educationalPlan?.target || "");
      setEditFuture(studentData.educationalPlan?.future3Months || "");
      setEditProgress(studentData.educationalPlan?.progress || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateStudent(id, {
        name: editName,
        phone: editPhone,
        age: editAge ? parseInt(editAge, 10) : null,
        groupId: editGroup || undefined,
        avatar: editAvatar,
      });
      setIsEditingProfile(false);
      refreshStudentData();
    } catch (err) {
      alert("حدث خطأ أثناء تحديث بيانات الطالب.");
    }
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      await api.updateStudent(id, {
        educationalPlan: {
          target: editTarget,
          future3Months: editFuture,
          progress: parseInt(editProgress, 10) || 0,
        },
      });
      setIsEditingPlan(false);
      refreshStudentData();
    } catch (err) {
      alert("حدث خطأ أثناء تحديث الخطة التعليمية.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      await api.addStudentNote(id, newNote, noteTag);
      setNewNote("");
      refreshStudentData();
    } catch (err) {
      alert("فشل إضافة الملاحظة.");
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه الملاحظة؟")) return;
    try {
      await api.deleteStudentNote(id, noteId);
      refreshStudentData();
    } catch (err) {
      alert("فشل حذف الملاحظة.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-xl mx-auto mt-20 card text-center py-10 text-red-600">
        {error || "لم يتم العثور على الطالب"}
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col gap-8 md:gap-10">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600">الرئيسية</Link>
        <span>/</span>
        <Link href="/students" className="hover:text-slate-600">دليل الطلاب</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">{student.name}</span>
      </div>

      {/* SECTION 1 — STUDENT HEADER CARD */}
      <div className="card p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-tr-2xl -z-10" />

        {isEditingProfile ? (
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">تعديل ملف الطالب الشخصي</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">اسم الطالب كامل</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">رقم الواتساب (مثال: 201012345678)</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">العمر</label>
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">الحلقة الدراسية</label>
                <select
                  value={editGroup}
                  onChange={(e) => setEditGroup(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر حلقة...</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Photo upload field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-500 mb-2">رفع صورة الطالب (تحميل صورة شخصية)</label>
                <div className="flex items-center gap-4">
                  {editAvatar && (
                    <img
                      src={editAvatar}
                      alt="Student Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-slate-500 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="btn btn-outline"
              >
                إلغاء
              </button>
              <button type="submit" className="btn btn-primary">
                حفظ التغييرات
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Left/Main Header Section */}
            <div className="flex items-center gap-4">
              
              {/* Photo Display / Initials fallback */}
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-blue-100 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 text-2xl tracking-wider uppercase shrink-0 shadow-sm">
                  {student.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </div>
              )}

              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
                  {student.name}
                  {student.visualStatus === "committed" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      ملتزم
                    </span>
                  )}
                  {student.visualStatus === "average" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      متوسط
                    </span>
                  )}
                  {student.visualStatus === "at risk" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      معرض للفصل
                    </span>
                  )}
                </h1>
                
                {/* Visual Details Badge bar */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 font-semibold mt-1">
                  <span className="flex items-center gap-1 text-slate-600">
                    <HiAcademicCap className="text-base text-slate-400" />
                    حلقة: {student.groupId?.name || "غير محدد"}
                  </span>
                  {student.age && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <HiCalendar className="text-base text-slate-400" />
                      العمر: {student.age} سنة
                    </span>
                  )}
                  {student.phone && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <HiPhone className="text-base text-slate-400" />
                      واتساب: {student.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Button bar */}
            <div className="flex flex-wrap gap-3 items-center shrink-0">
              {student.phone && (
                <a
                  href={`https://wa.me/${student.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/70"
                >
                  <HiPhone className="text-base" />
                  <span>تواصل بالواتساب</span>
                </a>
              )}
              <button
                onClick={() => setIsEditingProfile(true)}
                className="btn btn-outline"
              >
                <HiPencilSquare className="text-base text-slate-500" />
                <span>تعديل البيانات</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Dynamic Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2-cols wide) */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* SECTION 4 — EDUCATIONAL PLAN (VERY IMPORTANT) */}
          <div className="card p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            
            {isEditingPlan ? (
              <form onSubmit={handleUpdatePlan} className="flex flex-col gap-5">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <HiSparkles className="text-2xl text-blue-500" />
                    <span>تعديل الخطة التعليمية</span>
                  </h2>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">المستهدف التعليمي لهذا الشهر</label>
                  <input
                    type="text"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    placeholder="مثال: إتمام حفظ سورة الملك بنهاية الشهر الحالي"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">الخطة المستقبلية لـ 3 أشهر قادمة</label>
                  <textarea
                    rows={3}
                    value={editFuture}
                    onChange={(e) => setEditFuture(e.target.value)}
                    placeholder="اكتب أهداف الأشهر الثلاثة القادمة هنا..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">نسبة إنجاز مستهدف الشهر الحالي ({editProgress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editProgress}
                    onChange={(e) => setEditProgress(e.target.value)}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingPlan(false)}
                    className="btn btn-outline"
                  >
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary">
                    حفظ الخطة
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-6">
                
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <HiSparkles className="text-2xl text-blue-500" />
                    <span>الخطة التعليمية والمستهدف</span>
                  </h2>
                  <button
                    onClick={() => setIsEditingPlan(true)}
                    className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
                  >
                    <HiPencilSquare className="text-xs text-slate-500" />
                    <span>تعديل الخطة</span>
                  </button>
                </div>

                {/* Current Target Block */}
                <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2">
                    <HiFlag className="text-base" />
                    <span>المستهدف الحالي للشهر</span>
                  </div>
                  <p className="text-slate-800 font-bold text-lg">
                    {student.educationalPlan?.target || "لم يتم تعيين مستهدف تعليمي لشهرنا هذا بعد."}
                  </p>

                  {/* Elegant Custom Progress Bar */}
                  {student.educationalPlan?.target && (
                    <div className="mt-4 pt-2">
                      <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1.5">
                        <span>نسبة تقدم الخطة الشهرية</span>
                        <span className="text-blue-600">{student.educationalPlan?.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${student.educationalPlan?.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3-Month Plan Block */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 mb-2">خطة المتابعة المستقبلية (3 أشهر قادمة)</h3>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-5 font-semibold text-slate-600 leading-relaxed text-sm">
                    {student.educationalPlan?.future3Months ? (
                      <p className="whitespace-pre-line">{student.educationalPlan.future3Months}</p>
                    ) : (
                      <p className="text-slate-400 italic">لا توجد خطة 3 أشهر مسجلة حالياً.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* SECTION 2 — ATTENDANCE HISTORY */}
          <div className="card p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <HiClock className="text-2xl text-blue-500" />
                <span>سجل الحضور والغياب المجمع</span>
              </h2>
              <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold">
                نسبة الحضور العام: {student.attendancePercentage}%
              </div>
            </div>

            {student.attendanceHistory.length === 0 ? (
              <div className="text-center p-8 text-slate-400 font-semibold">
                لم يتم تسجيل أي حضور لهذا الطالب حتى الآن.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">تاريخ الحصة</th>
                      <th className="px-4 py-3 text-center">حالة الحضور</th>
                      <th className="px-4 py-3 text-center">الإجراء المتبع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {student.attendanceHistory.slice(0, 10).map((record) => {
                      let statusBadge = (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          حاضر
                        </span>
                      );
                      if (record.status === "absent") {
                        statusBadge = (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                            غائب
                          </span>
                        );
                      } else if (record.status === "late") {
                        statusBadge = (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                            متأخر
                          </span>
                        );
                      } else if (record.status === "contacted") {
                        statusBadge = (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                            تم التواصل
                          </span>
                        );
                      }

                      return (
                        <tr key={record._id} className="hover:bg-slate-50/20">
                          <td className="px-4 py-3 font-semibold text-slate-700 text-sm">
                            {new Date(record.date).toLocaleDateString("ar-EG", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {statusBadge}
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-medium text-slate-400">
                            {record.status === "contacted"
                              ? "تم الاتصال بولي الأمر لتنسيق الغياب"
                              : "سجل اعتيادي تلقائي"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 3 — PAYMENT HISTORY */}
          <div className="card p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
              <HiCurrencyDollar className="text-2xl text-blue-500" />
              <span>اشتراكات الطالب الشهرية</span>
            </h2>

            {student.payments.length === 0 ? (
              <div className="text-center p-8 text-slate-400 font-semibold">
                لا توجد سجلات اشتراك مسجلة لهذا الطالب حالياً.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-xs">
                      <th className="px-4 py-3">الشهر المستهدف</th>
                      <th className="px-4 py-3 text-center">حالة الاشتراك</th>
                      <th className="px-4 py-3">تاريخ التعديل الأخير</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {student.payments.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/20">
                        <td className="px-4 py-3 font-bold text-slate-800 text-sm">
                          {new Date(p.month + "-02").toLocaleDateString("ar-EG", {
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.status === "paid" ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                              مدفوع بالكامل
                            </span>
                          ) : p.status === "contacted" ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                              تم التذكير والتواصل
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
                              غير مدفوع
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {new Date(p.updatedAt).toLocaleDateString("ar-EG")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Sidebar timeline) */}
        <div className="flex flex-col gap-8">
          
          {/* SECTION 5 — TEACHER NOTES TIMELINE */}
          <div className="card p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-6">
            
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <HiUser className="text-2xl text-blue-500" />
                <span>ملاحظات المعلم التراكمية</span>
              </h2>
              <p className="text-xs text-slate-400">الذاكرة التعليمية والسلوكية التراكمية للطالب في الحلقات</p>
            </div>

            {/* Note addition Form */}
            <form onSubmit={handleAddNote} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">تصنيف الملاحظة</label>
                <select
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-bold"
                >
                  <option value="جودة الحفظ">جودة الحفظ والتلقين</option>
                  <option value="مراجعة وتثبيت">ضعف المراجعة والتثبيت</option>
                  <option value="سلوك وانضباط">السلوك والانضباط</option>
                  <option value="تميز وتفوق">تميز ومشاركة ممتازة</option>
                  <option value="أخرى">تصنيف عام آخر</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">نص الملاحظة</label>
                <textarea
                  rows={2}
                  placeholder="اكتب ملاحظتك التربوية أو التعليمية هنا..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 font-medium"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={addingNote}
                className="btn btn-primary w-full text-xs py-2 mt-1 shadow-sm"
              >
                <HiPlus className="text-sm" />
                <span>إضافة إلى السجل</span>
              </button>
            </form>

            {/* Notes List Timeline */}
            <div className="flex flex-col gap-4 relative pr-2">
              
              {/* Vertical line helper */}
              <div className="absolute right-3.5 top-2 bottom-2 w-0.5 bg-slate-100" />

              {student.notes && student.notes.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-6">لا توجد ملاحظات تربوية مسجلة حتى الآن.</p>
              ) : (
                (student.notes || []).slice().reverse().map((note) => {
                  let tagStyle = "bg-slate-100 text-slate-700";
                  if (note.tag === "تميز وتفوق") tagStyle = "bg-emerald-50 text-emerald-700";
                  if (note.tag === "مراجعة وتثبيت") tagStyle = "bg-amber-50 text-amber-700";
                  if (note.tag === "سلوك وانضباط") tagStyle = "bg-purple-50 text-purple-700";

                  return (
                    <div key={note._id} className="relative flex gap-3 pr-6 group/item">
                      
                      {/* Circle Timeline Bullet */}
                      <span className="absolute right-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50/50" />

                      <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-100 flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${tagStyle}`}>
                            {note.tag}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(note.createdAt).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                          {note.text}
                        </p>
                        
                        {/* Note Delete Quick Action */}
                        <div className="flex justify-end pt-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDeleteNote(note._id)}
                            className="text-slate-400 hover:text-red-500 text-xs font-bold flex items-center gap-1.5"
                          >
                            <HiTrash className="text-xs" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
