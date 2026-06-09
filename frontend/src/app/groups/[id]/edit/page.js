"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiUserGroup } from "react-icons/hi2";

export default function EditGroupPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [timePeriod, setTimePeriod] = useState("Evening");
  const [classroom, setClassroom] = useState("الأوضة الكبيرة");
  const [teacher, setTeacher] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const availableDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  useEffect(() => {
    async function fetchGroup() {
      try {
        const data = await api.getGroup(id);
        setName(data.name || "");
        setTimePeriod(data.timePeriod || "Evening");
        setClassroom(data.classroom || "الأوضة الكبيرة");
        setTeacher(data.teacher || "");
        setSelectedDays(data.days || []);
      } catch (err) {
        setError(err.message || "فشل تحميل بيانات الحلقة");
      } finally {
        setLoading(false);
      }
    }
    fetchGroup();
  }, [id]);

  const handleDayToggle = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (selectedDays.length === 0) {
        setError("الرجاء اختيار يوم واحد على الأقل.");
        setSaving(false);
        return;
      }

      await api.updateGroup(id, {
        name,
        timePeriod,
        classroom,
        teacher,
        days: selectedDays,
      });
      router.push(`/groups/${id}`);
    } catch (err) {
      setError(err.message || "فشل تحديث الحلقة.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-600">الرئيسية</Link>
        <span>/</span>
        <Link href="/groups" className="hover:text-slate-600">الحلقات</Link>
        <span>/</span>
        <Link href={`/groups/${id}`} className="hover:text-slate-600">{name || "تفاصيل الحلقة"}</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">تعديل الحلقة</span>
      </div>

      <div className="card p-6 md:p-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <HiUserGroup className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">تعديل الحلقة</h1>
            <p className="text-sm text-slate-500">تحديث تفاصيل الحلقة والمكان</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">اسم الحلقة</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: أبي بن كعب"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">معلم الحلقة</label>
             <input
              type="text"
              required
              value={teacher}
              onChange={e => setTeacher(e.target.value)}
              placeholder="مثال: الشيخ أحمد"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">أيام الحلقة</label>
              <div className="flex flex-wrap gap-2">
                {availableDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      selectedDays.includes(day)
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الفترة الزمنية</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer border transition-colors ${timePeriod === 'Morning' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-500'}`}>
                  <input type="radio" name="timePeriod" value="Morning" checked={timePeriod === 'Morning'} onChange={() => setTimePeriod('Morning')} className="hidden" />
                  صباحية (8 ص - 1 م)
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer border transition-colors ${timePeriod === 'Evening' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-500'}`}>
                  <input type="radio" name="timePeriod" value="Evening" checked={timePeriod === 'Evening'} onChange={() => setTimePeriod('Evening')} className="hidden" />
                  مسائية (2 م - 6 م)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">القاعة / الغرفة</label>
              <select
                value={classroom}
                onChange={e => setClassroom(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700"
              >
                <option value="الأوضة الكبيرة">الأوضة الكبيرة</option>
                <option value="الأوضة الصغيرة">الأوضة الصغيرة</option>
                <option value="الصالة">الصالة</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="btn btn-outline px-6 py-3">
              إلغاء
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary px-8 py-3 shadow-sm">
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
