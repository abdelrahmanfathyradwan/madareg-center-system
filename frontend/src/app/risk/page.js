"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  HiExclamationTriangle,
  HiChevronLeft,
  HiXCircle,
  HiBanknotes,
  HiPhone,
  HiCheckBadge,
} from "react-icons/hi2";

export default function RiskPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const stats = await api.getDashboardSummary();
        setData(stats);
      } catch (err) {
        setError("تعذّر تحميل البيانات");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-xl mx-auto mt-20 card text-center py-10 text-red-600">
        {error}
      </div>
    );

  const students = data?.atRiskStudents ?? [];

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-10">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-md shrink-0">
          <HiExclamationTriangle className="text-white text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">متابعة الطلاب</h1>
          <p className="text-slate-400 mt-0.5">طلاب تغيبوا مرتين أو أكثر، أو لم يسددوا الاشتراك</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiCheckBadge className="text-4xl text-blue-400" />
          </div>
          <p className="text-slate-500 text-lg font-semibold">لا يوجد طلاب يحتاجون متابعة حالياً</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {students.map((student) => (
            <div
              key={student._id}
              className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-r-4 border-r-amber-400"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-800">{student.name}</h3>
                <p className="text-slate-400 text-sm mb-3">{student.groupName}</p>
                <div className="flex flex-wrap gap-2">
                  {student.absences >= 2 && (
                    <span className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full font-bold">
                      <HiXCircle className="text-red-400 text-sm" />
                      غاب {student.absences} مرات
                    </span>
                  )}
                  {student.unpaid && (
                    <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full font-bold">
                      <HiBanknotes className="text-amber-400 text-sm" />
                      لم يسدد الاشتراك
                    </span>
                  )}
                  {student.contacts > 0 && (
                    <span className="flex items-center gap-1.5 text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-bold">
                      <HiPhone className="text-slate-400 text-sm" />
                      تواصل {student.contacts} مرات
                    </span>
                  )}
                </div>
              </div>
              {student.groupId && (
                <Link
                  href={`/groups/${student.groupId}`}
                  className="btn btn-outline shrink-0 flex items-center gap-2"
                >
                  عرض الحلقة
                  <HiChevronLeft className="text-base" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
