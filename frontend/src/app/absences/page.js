"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { HiPhone, HiCalendarDays, HiXCircle, HiUser } from "react-icons/hi2";
import Image from "next/image";

export default function AbsencesPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    async function fetchAbsences() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getTodayAbsent(date);
        setAbsences(data || []);
      } catch (err) {
        setError(err.message || "فشل تحميل بيانات الغياب");
      } finally {
        setLoading(false);
      }
    }
    fetchAbsences();
  }, [date]);

  const toggleContactStatus = async (recordId, currentStatus) => {
    const nextStatus = !currentStatus;
    
    // Optimistic update
    setAbsences(prev => prev.map(a => 
      a._id === recordId ? { ...a, isContacted: nextStatus } : a
    ));
    setSaving(s => ({ ...s, [recordId]: true }));

    try {
      await api.updateAttendance(recordId, undefined, nextStatus);
    } catch (err) {
      // Revert on error
      setAbsences(prev => prev.map(a => 
        a._id === recordId ? { ...a, isContacted: currentStatus } : a
      ));
      alert("فشل تحديث حالة التواصل");
    } finally {
      setSaving(s => ({ ...s, [recordId]: false }));
    }
  };

  const totalAbsent = absences.length;
  const contacted = absences.filter(a => a.isContacted).length;
  const notContacted = totalAbsent - contacted;

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <HiCalendarDays className="text-blue-500" /> غياب اليوم
          </h1>
          <p className="text-slate-500 mt-1">متابعة تواصل المعلمين مع الطلاب الغائبين</p>
        </div>
        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-bold"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center gap-4 border-r-4 border-r-slate-400">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <HiXCircle className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">عدد الغائبين</p>
            <p className="text-2xl font-black text-slate-800">{loading ? '-' : totalAbsent}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 border-r-4 border-r-amber-400">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <HiPhone className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">لم يتم التواصل</p>
            <p className="text-2xl font-black text-slate-800">{loading ? '-' : notContacted}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 border-r-4 border-r-emerald-500">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
            <HiPhone className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">تم التواصل</p>
            <p className="text-2xl font-black text-slate-800">{loading ? '-' : contacted}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold text-center">
          {error}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <div className="spinner"></div>
        </div>
      ) : absences.length === 0 ? (
        <div className="card text-center py-20">
          <HiXCircle className="text-5xl text-slate-200 mx-auto mb-3" />
          <p className="text-xl font-bold text-slate-500">لا يوجد طلاب غائبين في هذا اليوم</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {absences.map(student => (
            <div key={student._id} className="card p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between hover:shadow-md transition-shadow">
              
              {/* Student Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 border border-slate-200 shrink-0 font-bold text-lg">
                  {student.studentName?.charAt(0) || <HiUser className="text-2xl" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{student.studentName}</h3>
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                      {student.groupName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                {student.studentPhone && (
                  <a
                    href={`https://wa.me/${student.studentPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition-colors"
                  >
                    <HiPhone className="text-lg" /> واتساب
                  </a>
                )}
                
                <button
                  onClick={() => toggleContactStatus(student._id, student.isContacted)}
                  disabled={saving[student._id]}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all active:scale-95 border ${
                    student.isContacted 
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {student.isContacted ? 'تم التواصل' : 'لم يتم التواصل'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </main>
  );
}
