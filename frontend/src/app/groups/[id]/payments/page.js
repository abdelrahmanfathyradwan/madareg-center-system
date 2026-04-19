"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  HiChevronLeft,
  HiBanknotes,
  HiXMark,
  HiPhone,
} from "react-icons/hi2";

const STATUS_CYCLE = ["unpaid", "paid", "contacted"];

const STATUS_CONFIG = {
  paid:      { label: "مدفوع",   icon: HiBanknotes, cls: "bg-blue-600 text-white"   },
  unpaid:    { label: "لم يدفع", icon: HiXMark,     cls: "bg-red-500 text-white"    },
  contacted: { label: "تواصل",   icon: HiPhone,     cls: "bg-amber-500 text-white"  },
};

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}
function formatMonth(monthStr) {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("ar-EG", {
    year: "numeric", month: "long",
  });
}

export default function PaymentsPage({ params }) {
  const { id }  = use(params);
  const router  = useRouter();
  const [data, setData]   = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState({});
  const [month, setMonth]     = useState(getCurrentMonth());

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupData, paymentData] = await Promise.all([
          api.getGroup(id),
          api.initPayments(id, month),
        ]);
        setGroup(groupData);
        setData(paymentData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, month]);

  const toggleStatus = async (recordId, currentStatus) => {
    const nextStatus =
      STATUS_CYCLE[(STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length];
    setData((prev) => ({
      ...prev,
      payments: prev.payments.map((p) =>
        p._id === recordId ? { ...p, status: nextStatus } : p
      ),
    }));
    setSaving((s) => ({ ...s, [recordId]: true }));
    try {
      await api.updatePayment(recordId, nextStatus);
    } catch {
      setData((prev) => ({
        ...prev,
        payments: prev.payments.map((p) =>
          p._id === recordId ? { ...p, status: currentStatus } : p
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

  const paid      = data?.payments?.filter((p) => p.status === "paid").length      ?? 0;
  const unpaid    = data?.payments?.filter((p) => p.status === "unpaid").length    ?? 0;
  const contacted = data?.payments?.filter((p) => p.status === "contacted").length ?? 0;
  const total     = data?.payments?.length ?? 0;

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <HiChevronLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">إدارة المدفوعات</h1>
            <p className="text-sm text-slate-400">{group?.name} • {formatMonth(month)}</p>
          </div>
        </div>
        {/* Month switcher */}
        <input
          type="month"
          value={month}
          onChange={(e) => { setMonth(e.target.value); setLoading(true); }}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 text-sm font-bold mb-6 flex-wrap">
        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
          <HiBanknotes className="text-blue-500" /> {paid} مدفوع
        </span>
        <span className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full">
          <HiXMark className="text-red-400" /> {unpaid} لم يدفع
        </span>
        {contacted > 0 && (
          <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full">
            <HiPhone className="text-amber-400" /> {contacted} تواصل
          </span>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-5 py-4 text-sm font-bold text-slate-400 w-10">#</th>
              <th className="px-4 py-4 text-sm font-bold text-slate-500">اسم الطالب</th>
              <th className="px-4 py-4 text-sm font-bold text-slate-500 text-center w-36">حالة الدفع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.payments?.map((record, i) => {
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
            style={{ width: total > 0 ? `${(paid / total) * 100}%` : "0%" }}
          />
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          {paid} من {total} سدّدوا الاشتراك • انقر للتغيير
        </p>
      </div>
    </main>
  );
}
