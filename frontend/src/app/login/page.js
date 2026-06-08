"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login(password);
      if (res.token) {
        localStorage.setItem("madarej_token", res.token);
        router.replace("/");
      }
    } catch (err) {
      setError(err.message || "فشل تسجيل الدخول. تأكد من كلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen px-4">
      <div className="card w-full max-w-sm flex flex-col items-center py-10 px-8">
        <div className="relative w-20 h-20 mb-6 rounded-2xl overflow-hidden shadow-md ring-1 ring-slate-100">
          <Image src="/logo.jfif" alt="مدارج" fill className="object-contain p-1" priority />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">تسجيل الدخول</h1>
        <p className="text-sm text-slate-500 mb-8 text-center">أدخل كلمة المرور الخاصة بالنظام للمتابعة</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-lg mt-2 shadow-sm">
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
