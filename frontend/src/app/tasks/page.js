"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  HiCheckCircle,
  HiTrash,
  HiPlus,
  HiClipboardDocumentList,
  HiCalendarDays,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // New task input
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const formatDateParam = (date) => date.toISOString().split("T")[0];

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api.getTasks(formatDateParam(selectedDate));
      setTasks(data.tasks || []);
      setStats(data.stats || { total: 0, completed: 0, pending: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await api.createTask(newTitle.trim(), formatDateParam(selectedDate));
      setNewTitle("");
      await fetchTasks();
    } catch (err) {
      alert("فشل إضافة المهمة.");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (task) => {
    try {
      await api.toggleTask(task._id, !task.completed);
      await fetchTasks();
    } catch (err) {
      alert("فشل تحديث المهمة.");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      await fetchTasks();
    } catch (err) {
      alert("فشل حذف المهمة.");
    }
  };

  const goDay = (offset) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + offset);
    setSelectedDate(next);
  };

  const isToday =
    formatDateParam(selectedDate) === formatDateParam(new Date());

  const dayLabel = selectedDate.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <a href="/" className="hover:text-slate-600">
          الرئيسية
        </a>
        <span>/</span>
        <span className="text-slate-600 font-medium">المهام</span>
      </div>

      {/* Page Title */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <HiClipboardDocumentList className="text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            المهام
          </h1>
          <p className="text-sm text-slate-500">
            إدارة المهام اليومية لمركز مدارج
          </p>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => goDay(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <HiChevronRight className="text-lg" />
          </button>
          <div className="flex items-center gap-2">
            <HiCalendarDays className="text-blue-500 text-lg" />
            <span className="font-bold text-slate-800 text-sm md:text-base">
              {dayLabel}
            </span>
            {isToday && (
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md">
                اليوم
              </span>
            )}
          </div>
          <button
            onClick={() => goDay(1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <HiChevronLeft className="text-lg" />
          </button>
        </div>

        {!isToday && (
          <button
            onClick={() => {
              const d = new Date();
              d.setHours(0, 0, 0, 0);
              setSelectedDate(d);
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            العودة لليوم
          </button>
        )}

        {/* Date input for direct picking */}
        <input
          type="date"
          value={formatDateParam(selectedDate)}
          onChange={(e) => {
            const d = new Date(e.target.value);
            if (!isNaN(d)) {
              d.setHours(0, 0, 0, 0);
              setSelectedDate(d);
            }
          }}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <p className="text-3xl font-black text-slate-800">{stats.total}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">مهام اليوم</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-black text-emerald-600">
            {stats.completed}
          </p>
          <p className="text-xs font-bold text-slate-400 mt-1">تم إنجازها</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">متبقي</p>
        </div>
      </div>

      {/* Quick Add Task */}
      <form
        onSubmit={handleAddTask}
        className="card p-4 md:p-5 mb-8 flex items-center gap-3"
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="أضف مهمة جديدة..."
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 placeholder-slate-400"
          required
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="btn btn-primary px-5 py-3 shrink-0 shadow-sm flex items-center gap-2"
        >
          <HiPlus className="text-lg" />
          <span className="hidden sm:block">إضافة</span>
        </button>
      </form>

      {/* Tasks List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="spinner" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-10 text-center">
          <HiClipboardDocumentList className="text-5xl text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-bold text-lg">
            لا توجد مهام لهذا اليوم
          </p>
          <p className="text-slate-400 text-sm mt-1">
            ابدأ بإضافة مهمة جديدة من الحقل أعلاه
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`card p-5 md:p-6 flex items-center gap-4 transition-all duration-300 ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              {/* Toggle Button */}
              <button
                onClick={() => handleToggle(task)}
                className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  task.completed
                    ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-200"
                    : "bg-slate-100 text-slate-400 border-2 border-slate-200 hover:border-blue-300 hover:text-blue-500"
                }`}
              >
                <HiCheckCircle
                  className={`text-2xl ${task.completed ? "" : "opacity-40"}`}
                />
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-bold text-base md:text-lg transition-all ${
                    task.completed
                      ? "line-through text-slate-400"
                      : "text-slate-800"
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {new Date(task.createdAt).toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(task._id)}
                className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <HiTrash className="text-lg" />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
