"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiChevronLeft,
  HiCalendar,
  HiUsers,
  HiCheckCircle,
  HiExclamationTriangle,
  HiMinusCircle,
} from "react-icons/hi2";

export default function GroupMonthlyOverviewPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Current month state format: YYYY-MM
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });

  useEffect(() => {
    async function fetchMonthlyData() {
      setLoading(true);
      try {
        const result = await api.getGroupMonthlyRecord(id, month);
        setData(result);
      } catch (err) {
        console.error(err);
        setError("فشل تحميل السجل الشهري للحلقة.");
      } finally {
        setLoading(false);
      }
    }
    fetchMonthlyData();
  }, [id, month]);

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-20 card text-center py-10 text-red-600">
        {error}
      </div>
    );
  }

  const { group, records } = data || { group: {}, records: [] };

  // Calculate quick overview metrics
  const total = records.length;
  const committed = records.filter(r => r.commitment === 'committed').length;
  const average = records.filter(r => r.commitment === 'average').length;
  const atRisk = records.filter(r => r.commitment === 'at risk').length;

  const currentMonthLabel = new Date(month + "-02").toLocaleDateString("ar-EG", {
    month: "long",
    year: "numeric"
  });

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10 flex flex-col gap-8 md:gap-10">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600">الرئيسية</Link>
        <span>/</span>
        <Link href="/groups" className="hover:text-slate-600">الحلقات</Link>
        <span>/</span>
        <Link href={`/groups/${id}`} className="hover:text-slate-600">{group.name || "الحلقة"}</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">السجل الشهري المجمع</span>
      </div>

      {/* Header section with Month Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">السجل الشهري المجمع</h1>
          <p className="text-slate-500 font-semibold">حلقة: {group.name} • لشهر {currentMonthLabel}</p>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-sm shrink-0">
          <label className="text-xs font-bold text-slate-400">تغيير الشهر:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border-none focus:outline-none focus:ring-0 text-slate-700 font-bold text-sm cursor-pointer"
          />
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <div className="card p-6 flex items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <HiUsers className="text-2xl" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400">إجمالي طلاب الحلقة</span>
            <span className="text-2xl font-black text-slate-800">{total} طالب</span>
          </div>
        </div>

        {/* Committed */}
        <div className="card p-6 flex items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <HiCheckCircle className="text-2xl" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400">الطلاب الملتزمون</span>
            <span className="text-2xl font-black text-slate-800">{committed} طلاب</span>
          </div>
        </div>

        {/* Average */}
        <div className="card p-6 flex items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <HiMinusCircle className="text-2xl" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400">الطلاب المتوسطون</span>
            <span className="text-2xl font-black text-slate-800">{average} طلاب</span>
          </div>
        </div>

        {/* At-Risk */}
        <div className="card p-6 flex items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <HiExclamationTriangle className="text-2xl" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400">معرضون للفصل</span>
            <span className="text-2xl font-black text-slate-800">{atRisk} طلاب</span>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="card p-0 overflow-hidden border border-slate-200 bg-white shadow-sm rounded-2xl">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
          <h3 className="font-black text-slate-800 text-lg">سجل تفصيلي لأداء الطلاب التراكمي</h3>
          <span className="text-xs text-slate-400 font-bold">انقر على اسم الطالب لعرض الملف الشخصي الكامل</span>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-semibold">
            لا توجد سجلات طلاب مضافة لهذه الحلقة بعد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">اسم الطالب</th>
                  <th className="px-6 py-4">نسبة الحضور</th>
                  <th className="px-6 py-4 text-center">اشتراك الشهر ({currentMonthLabel})</th>
                  <th className="px-6 py-4 text-center">مستوى الالتزام</th>
                  <th className="px-6 py-4 text-center">الملف التعليمي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => {
                  let commitmentBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      ملتزم
                    </span>
                  );
                  if (r.commitment === "average") {
                    commitmentBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        متوسط
                      </span>
                    );
                  } else if (r.commitment === "at risk") {
                    commitmentBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        معرض للفصل
                      </span>
                    );
                  }

                  return (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors group">
                      
                      {/* Name clickable to Profile */}
                      <td className="px-6 py-5">
                        <Link href={`/students/${r._id}`} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 text-xs shrink-0">
                            {r.name.split(" ").slice(0, 2).map(w => w[0]).join("")}
                          </div>
                          <span className="text-slate-800 font-bold group-hover:text-blue-600 transition-colors text-base">
                            {r.name}
                          </span>
                        </Link>
                      </td>

                      {/* Attendance Performance */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                r.attendanceRate >= 80
                                  ? "bg-emerald-500"
                                  : r.attendanceRate >= 60
                                  ? "bg-blue-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${r.attendanceRate}%` }}
                            />
                          </div>
                          <span className="text-slate-700 font-bold text-sm">
                            {r.attendanceRate}%
                          </span>
                        </div>
                      </td>

                      {/* Payment Status for Selected Month */}
                      <td className="px-6 py-5 text-center">
                        {r.paymentStatus === "paid" ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                            مدفوع
                          </span>
                        ) : r.paymentStatus === "contacted" ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                            تم التواصل
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
                            غير مدفوع
                          </span>
                        )}
                      </td>

                      {/* Commitment status tag */}
                      <td className="px-6 py-5 text-center">
                        {commitmentBadge}
                      </td>

                      {/* File Details button */}
                      <td className="px-6 py-5 text-center">
                        <Link
                          href={`/students/${r._id}`}
                          className="btn btn-outline py-1 px-3 text-xs"
                        >
                          عرض الملف الكامل
                        </Link>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </main>
  );
}
