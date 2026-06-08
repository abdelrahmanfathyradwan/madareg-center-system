"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiChevronLeft,
  HiClipboardDocumentList,
  HiBanknotes,
  HiCalendarDays,
  HiClock,
  HiAcademicCap,
  HiUsers,
  HiTrash,
} from "react-icons/hi2";

export default function GroupPage({ params }) {
  const { id }  = use(params);
  const router  = useRouter();
  const [group, setGroup]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteGroup = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه الحلقة؟ سيتم حذفها نهائياً.")) return;
    setDeleting(true);
    try {
      await api.deleteGroup(id);
      router.push("/groups");
    } catch (err) {
      alert("فشل حذف الحلقة: " + (err.message || ""));
      setDeleting(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getGroup(id);
        setGroup(data);
      } catch (err) {
        setError(err.message || "فشل تحميل بيانات الحلقة");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    );

  if (error || !group)
    return (
      <div className="max-w-xl mx-auto mt-20 card text-center py-10 text-red-600">
        {error || "لم يتم العثور على الحلقة"}
      </div>
    );

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-600">الرئيسية</Link>
        <span>/</span>
        <Link href="/groups" className="hover:text-slate-600">الحلقات</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">{group.name}</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1 className="text-3xl font-black text-slate-800">{group.name}</h1>
          <button
            onClick={handleDeleteGroup}
            disabled={deleting}
            className="btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors"
          >
            <HiTrash className="text-base" />
            <span>{deleting ? "جاري الحذف..." : "حذف الحلقة"}</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
            <HiCalendarDays className="text-slate-400 text-base" />
            {group.days.join(" - ")}
          </span>
          {group.timePeriod && (
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
              <HiClock className="text-slate-400 text-base" />
              {group.timePeriod === 'Morning' ? 'صباحية (8 ص - 1 م)' : 'مسائية (2 م - 6 م)'}
            </span>
          )}
          {group.teacher && (
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
              <HiAcademicCap className="text-slate-400 text-base" />
              {group.teacher}
            </span>
          )}
          <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700 font-semibold">
            <HiUsers className="text-blue-400 text-base" />
            {group.studentCount} طالب
          </span>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href={`/groups/${id}/attendance`}>
          <div className="card flex flex-col items-center text-center py-10 gap-4 border-2 border-transparent hover:border-blue-200 hover:shadow-md cursor-pointer transition-all h-full justify-between">
            <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-md shrink-0">
              <HiClipboardDocumentList className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">تسجيل الحضور</h2>
              <p className="text-slate-400 text-sm mt-1">حضور وغياب طلاب اليوم</p>
            </div>
          </div>
        </Link>

        <Link href={`/groups/${id}/payments`}>
          <div className="card flex flex-col items-center text-center py-10 gap-4 border-2 border-transparent hover:border-slate-200 hover:shadow-md cursor-pointer transition-all h-full justify-between">
            <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center shadow-md shrink-0">
              <HiBanknotes className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">إدارة المدفوعات</h2>
              <p className="text-slate-400 text-sm mt-1">متابعة الاشتراكات الشهرية</p>
            </div>
          </div>
        </Link>

        <Link href={`/groups/${id}/monthly`}>
          <div className="card flex flex-col items-center text-center py-10 gap-4 border-2 border-transparent hover:border-purple-200 hover:shadow-md cursor-pointer transition-all h-full justify-between">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center shadow-md shrink-0">
              <HiCalendarDays className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">السجل الشهري المجمع</h2>
              <p className="text-slate-400 text-sm mt-1">التقرير الشهري العام ومستويات التزام الطلاب</p>
            </div>
          </div>
        </Link>
      </div>
    </main>
  );
}
