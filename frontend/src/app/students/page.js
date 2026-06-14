"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TableSkeletonRows } from '@/components/skeletons/TableSkeletonRows';
import Link from "next/link";
import {
  HiMagnifyingGlass,
  HiFunnel,
  HiPhone,
  HiAcademicCap,
  HiEnvelopeOpen,
  HiUserCircle,
  HiChevronLeft,
  HiPlus,
} from "react-icons/hi2";

export default function StudentsDirectoryPage() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsData, groupsData] = await Promise.all([
          api.getStudents(),
          api.getGroups(),
        ]);
        setStudents(studentsData);
        setGroups(groupsData);
      } catch (err) {
        console.error(err);
        setError("فشل تحميل بيانات الطلاب. يرجى التحقق من اتصالك بالخادم.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Loading will be handled within the table body



  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-20 card text-center py-10 text-red-600">
        {error}
      </div>
    );
  }

  // Filter & Search Logic
  const filteredStudents = students.filter((s) => {
    const nameMatch = s.name.toLowerCase().includes(search.toLowerCase());
    const phoneMatch = s.phone ? s.phone.includes(search) : false;
    const groupName = s.groupId?.name || "";
    const groupMatch = groupName.toLowerCase().includes(search.toLowerCase());

    const matchesSearch = nameMatch || phoneMatch || groupMatch;

    const matchesGroup =
      selectedGroup === "all" || s.groupId?._id === selectedGroup;

    const matchesStatus =
      selectedStatus === "all" || s.visualStatus === selectedStatus;

    const matchesPayment =
      selectedPayment === "all" || s.paymentStatus === selectedPayment;

    return matchesSearch && matchesGroup && matchesStatus && matchesPayment;
  });

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col gap-8 md:gap-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">دليل الطلاب العام</h1>
          <p className="text-slate-500 font-medium">إدارة ومتابعة جميع طلاب المركز في مكان واحد</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-blue-50 text-blue-700 px-5 py-3 rounded-2xl font-bold flex items-center gap-2">
            <HiAcademicCap className="text-2xl text-blue-500" />
            <span>إجمالي الطلاب: {students.length} طالب</span>
          </div>
          <Link href="/students/create" className="btn btn-primary px-5 py-3 rounded-2xl shadow-sm flex items-center gap-2">
             <HiPlus className="text-xl" /> إضافة طالب
          </Link>
        </div>
      </div>

      {/* Modern Search and Filter Panel */}
      <div className="card p-6 md:p-8 flex flex-col gap-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        
        {/* Search Input */}
        <div className="relative">
          <HiMagnifyingGlass className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن طالب بالاسم، أو رقم الهاتف، أو اسم الحلقة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-semibold"
          />
        </div>

        {/* Minimal Subtle Filter Options */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm shrink-0">
            <HiFunnel className="text-lg text-slate-400" />
            <span>تصفية حسب:</span>
          </div>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">كل الحلقات</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">كل الحالات الإلتزامية</option>
            <option value="committed">ملتزم</option>
            <option value="average">متوسط</option>
            <option value="at risk">معرض للفصل</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">كل حالات الاشتراك</option>
            <option value="paid">مسدد الاشتراك</option>
            <option value="unpaid">غير مسدد</option>
          </select>

          {/* Reset Filters */}
          {(search || selectedGroup !== "all" || selectedStatus !== "all" || selectedPayment !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedGroup("all");
                setSelectedStatus("all");
                setSelectedPayment("all");
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              إعادة تعيين التصفية
            </button>
          )}
        </div>
      </div>

      {/* Directory Table / Cards */}
      <div className="card p-0 overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold">
            لم يتم العثور على طلاب يطابقون خيارات البحث أو التصفية الحالية.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">اسم الطالب</th>
                  <th className="px-6 py-4">الحلقة</th>
                  <th className="px-6 py-4">نسبة الحضور</th>
                  <th className="px-6 py-4 text-center">الاشتراك المالي</th>
                  <th className="px-6 py-4 text-center">حالة الالتزام</th>
                  <th className="px-6 py-4 text-center">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <TableSkeletonRows columns={6} rows={5} />
                ) : (
                  filteredStudents.map((student) => {
                    // Subtle indicators
                    let statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        ملتزم
                      </span>
                    );
                    if (student.visualStatus === "average") {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          متوسط
                        </span>
                      );
                    } else if (student.visualStatus === "at risk") {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          معرض للفصل
                        </span>
                      );
                    }

                    const phoneUrl = student.phone
                      ? `https://wa.me/${student.phone.replace(/[^0-9]/g, "")}`
                      : null;

                    return (
                      <tr
                        key={student._id}
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      >
                        {/* Name & Photo */}
                        <td className="px-6 py-5">
                          <Link href={`/students/${student._id}`} className="flex items-center gap-3">
                            {student.avatar ? (
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-10 h-10 rounded-full object-cover border border-blue-100 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 text-sm tracking-wider uppercase shrink-0">
                                {student.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="block text-slate-800 font-bold group-hover:text-blue-600 transition-colors text-base">
                                {student.name}
                              </span>
                              {student.phone && (
                                <span className="block text-slate-400 text-xs font-semibold mt-0.5">
                                  {student.phone}
                                </span>
                              )}
                            </div>
                          </Link>
                        </td>

                        {/* الحلقة */}
                        <td className="px-6 py-5 text-slate-700 font-semibold text-sm">
                          {student.groupId?.name || "بدون حلقة"}
                        </td>

                        {/* نسبة الحضور */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  student.attendancePercentage >= 80
                                    ? "bg-emerald-500"
                                    : student.attendancePercentage >= 60
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${student.attendancePercentage}%` }}
                              />
                            </div>
                            <span className="text-slate-700 font-bold text-sm">
                              {student.attendancePercentage}%
                            </span>
                          </div>
                        </td>

                        {/* الاشتراك المالي */}
                        <td className="px-6 py-5 text-center">
                          {student.paymentStatus === "paid" ? (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                              مدفوع
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
                              غير مدفوع
                            </span>
                          )}
                        </td>

                        {/* حالة الالتزام */}
                        <td className="px-6 py-5 text-center">
                          {statusBadge}
                        </td>

                        {/* إجراءات سريعة */}
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {phoneUrl && (
                              <a
                                href={phoneUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition-colors"
                              >
                                <HiPhone className="text-sm" /> واتساب
                              </a>
                            )}
                            <Link
                              href={`/students/${student._id}`}
                              className="btn btn-outline py-1.5 px-3 text-xs"
                            >
                              عرض الملف
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
