"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";

export default function AllGroupsPage() {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getGroups();
        setGroups(data);
      } catch (err) {
        setError("تعذّر تحميل الحلقات");
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
      <div className="max-w-xl mx-auto mt-20 card bg-red-50 border-red-200 text-center py-10 text-red-700">
        {error}
      </div>
    );

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-black text-slate-800 mb-8">كل الحلقات</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.map((group) => (
          <Link key={group._id} href={`/groups/${group._id}`} className="block">
            <div className="card h-full flex flex-col justify-between border-2 border-transparent hover:border-blue-200 hover:shadow-md transition-all">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{group.name}</h3>
                <div className="flex flex-col gap-2 text-sm text-slate-500">
                  <div className="flex justify-between">
                    <span>الأيام</span>
                    <span className="font-medium text-slate-700">{group.days.join(" - ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الوقت</span>
                    <span className="font-medium text-slate-700">{group.time}</span>
                  </div>
                  {group.teacher && (
                    <div className="flex justify-between">
                      <span>المعلم</span>
                      <span className="font-medium text-slate-700">{group.teacher}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-blue-600 font-bold text-lg">{group.studentCount} طالب</span>
                <HiArrowLeft className="text-slate-300 text-2xl group-hover:text-blue-500" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
