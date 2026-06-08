"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiUsers } from "react-icons/hi2";

export default function CreateStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [groupId, setGroupId] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    api.getGroups().then(setGroups).catch(console.error);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId) {
      setError("يرجى اختيار الحلقة");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.createStudent({ name, phone, groupId, avatar });
      router.push("/students");
    } catch (err) {
      setError(err.message || "فشل تسجيل الطالب.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-600">الرئيسية</Link>
        <span>/</span>
        <Link href="/students" className="hover:text-slate-600">دليل الطلاب</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">طالب جديد</span>
      </div>

      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <HiUsers className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">طالب جديد</h1>
            <p className="text-sm text-slate-500">تسجيل بيانات طالب جديد وربطه بحلقة</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">اسم الطالب كامل</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف (الواتساب)</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                dir="ltr"
                placeholder="010..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الحلقة الدراسية</label>
            <select
              required
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="">اختر حلقة...</option>
              {groups.map(g => (
                <option key={g._id} value={g._id}>{g.name} - {g.teacher || 'بدون معلم'} ({g.time})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">صورة شخصية (اختياري)</label>
            <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
              {avatar ? (
                <img src={avatar} alt="Preview" className="w-16 h-16 rounded-xl object-cover shadow-sm border border-slate-200" />
              ) : (
                <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-300">
                  <HiUsers className="text-2xl" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-slate-500 text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="btn btn-outline px-6 py-3">
              إلغاء
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary px-8 py-3 shadow-sm">
              {loading ? "جاري الحفظ..." : "تسجيل الطالب"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
