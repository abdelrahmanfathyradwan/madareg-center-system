"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  HiChevronLeft,
  HiCheckCircle,
  HiXCircle,
  HiPhone,
} from "react-icons/hi2";

const STATUS_CYCLE = ["absent", "present", "contacted"];

const STATUS_CONFIG = {
  present:   { label: "حاضر",   icon: HiCheckCircle, cls: "status-present"   },
  absent:    { label: "غائب",   icon: HiXCircle,     cls: "status-absent"    },
  contacted: { label: "تواصل",  icon: HiPhone,       cls: "status-contacted" },
};

export default function AttendancePage({ params }) {
  const { id }  = use(params);
  const router  = useRouter();
  const [data, setData]   = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupData, attendanceData] = await Promise.all([
          api.getGroup(id),
          api.startAttendance(id),
        ]);
        setGroup(groupData);
        setData(attendanceData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const toggleStatus = async (recordId, currentStatus) => {
    const nextStatus =
      STATUS_CYCLE[(STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length];
    setData((prev) => ({
      ...prev,
      attendance: prev.attendance.map((a) =>
        a._id === recordId ? { ...a, status: nextStatus } : a
      ),
    }));
    setSaving((s) => ({ ...s, [recordId]: true }));
    try {
      await api.updateAttendance(recordId, nextStatus);
    } catch {
      setData((prev) => ({
        ...prev,
        attendance: prev.attendance.map((a) =>
          a._id === recordId ? { ...a, status: currentStatus } : a
        ),
      }));
    } finally {
      setSaving((s) => ({ ...s, [recordId]: false }));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    );

  const present   = data?.attendance?.filter((a) => a.status === "present").length   ?? 0;
  const absent    = data?.attendance?.filter((a) => a.status === "absent").length    ?? 0;
  const contacted = data?.attendance?.filter((a) => a.status === "contacted").length ?? 0;
  const total     = data?.attendance?.length ?? 0;

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <HiChevronLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">تسجيل الحضور</h1>
            <p className="text-sm text-slate-400">{group?.name}</p>
          </div>
        </div>
        {/* Live counters */}
        <div className="flex gap-2 flex-wrap justify-end">
          <span className="flex items-center gap-1.5 text-sm font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            <HiCheckCircle className="text-blue-500" /> {present}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full">
            <HiXCircle className="text-red-400" /> {absent}
          </span>
          {contacted > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full">
              <HiPhone className="text-amber-400" /> {contacted}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-5 py-4 text-sm font-bold text-slate-400 w-10">#</th>
              <th className="px-4 py-4 text-sm font-bold text-slate-500">اسم الطالب</th>
              <th className="px-4 py-4 text-sm font-bold text-slate-500 text-center w-36">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.attendance?.map((record, i) => {
              const cfg = STATUS_CONFIG[record.status];
              return (
                <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-slate-300 text-sm">{i + 1}</td>
                  <td className="px-4 py-4 text-base font-semibold text-slate-800">{record.studentName}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleStatus(record._id, record.status)}
                      disabled={saving[record._id]}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-75 active:scale-95 disabled:opacity-60 ${cfg.cls}`}
                    >
                      <cfg.icon className="text-base" />
                      {cfg.label}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: total > 0 ? `${(present / total) * 100}%` : "0%" }}
          />
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          {present} من {total} حاضر • انقر للتغيير
        </p>
      </div>
    </main>
  );
}
