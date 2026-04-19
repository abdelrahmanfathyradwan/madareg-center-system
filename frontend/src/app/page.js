"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  HiCheckCircle,
  HiXCircle,
  HiUsers,
  HiExclamationTriangle,
  HiChevronLeft,
  HiClock,
  HiCalendarDays,
  HiAcademicCap,
} from "react-icons/hi2";

function StatCard({ label, value, color, icon: Icon, bg }) {
  return (
    <div className={`card border-r-4 ${color}`}>
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon className="text-xl text-white" />
      </div>
      <p className="text-slate-500 text-sm mb-1">{label}</p>
      <div className="text-3xl font-black text-slate-800">{value}</div>
    </div>
  );
}

function GroupCard({ group }) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{group.name}</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg">
            <HiClock className="text-slate-400" /> {group.time}
          </span>
          <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg">
            <HiCalendarDays className="text-slate-400" /> {group.days.join(" - ")}
          </span>
          {group.teacher && (
            <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg">
              <HiAcademicCap className="text-slate-400" /> {group.teacher}
            </span>
          )}
          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-semibold">
            <HiUsers className="text-blue-400 text-base" /> {group.studentCount} طالب
          </span>
        </div>
      </div>
      <Link href={`/groups/${group._id}`} className="btn btn-primary shrink-0">
        دخول <HiChevronLeft className="text-lg" />
      </Link>
    </div>
  );
}

export default function Home() {
  const [todayData, setTodayData] = useState(null);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [today, stats] = await Promise.all([
          api.getTodayGroups(),
          api.getDashboardSummary(),
        ]);
        setTodayData(today);
        setSummary(stats);
      } catch (err) {
        setError("تعذّر الاتصال بالخادم. تأكد من تشغيل الـ Backend.");
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
      <div className="max-w-xl mx-auto mt-20 card text-center py-10">
        <HiExclamationTriangle className="text-5xl text-red-400 mx-auto mb-3" />
        <p className="text-xl font-bold text-slate-700 mb-1">خطأ في الاتصال</p>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">لوحة التحكم</h1>
        <p className="text-slate-400 mt-1">
          {new Date().toLocaleDateString("ar-EG", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="حضور اليوم"           value={summary?.today?.present            ?? "–"} color="border-r-blue-500"   icon={HiCheckCircle}       bg="bg-blue-500"   />
        <StatCard label="غياب اليوم"            value={summary?.today?.absent             ?? "–"} color="border-r-red-400"    icon={HiXCircle}           bg="bg-red-400"    />
        <StatCard label="إجمالي الطلاب"         value={summary?.totalStudents             ?? "–"} color="border-r-slate-400"  icon={HiUsers}             bg="bg-slate-400"  />
        <StatCard label="طلاب معرضون للفصل"     value={summary?.atRiskStudents?.length    ?? "–"} color="border-r-amber-400"  icon={HiExclamationTriangle} bg="bg-amber-400" />
      </section>

      {/* Today's groups */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <HiCalendarDays className="text-blue-500" />
            حلقات اليوم
            {todayData?.day && (
              <span className="text-base font-semibold text-blue-600">({todayData.day})</span>
            )}
          </h2>
          <Link href="/groups" className="btn btn-outline text-sm">
            كل الحلقات <HiChevronLeft className="text-base" />
          </Link>
        </div>

        {todayData?.groups?.length === 0 ? (
          <div className="card text-center py-14">
            <HiCalendarDays className="text-5xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-lg">لا توجد حلقات مجدولة لليوم</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {todayData?.groups?.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </section>

      {/* At-risk banner */}
      {(summary?.atRiskStudents?.length ?? 0) > 0 && (
        <section className="mt-8">
          <Link href="/risk">
            <div className="card border-r-4 border-r-amber-400 bg-amber-50 flex items-center justify-between hover:bg-amber-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shrink-0">
                  <HiExclamationTriangle className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-amber-800 font-bold text-lg">
                    {summary.atRiskStudents.length} طالب يحتاج متابعة
                  </p>
                  <p className="text-amber-600 text-sm">غياب متكرر أو اشتراكات غير مدفوعة</p>
                </div>
              </div>
              <HiChevronLeft className="text-amber-400 text-2xl shrink-0" />
            </div>
          </Link>
        </section>
      )}
    </main>
  );
}
