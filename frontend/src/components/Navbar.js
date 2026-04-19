"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiUserGroup, HiExclamationTriangle } from "react-icons/hi2";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "الرئيسية", icon: HiHome },
    { href: "/groups", label: "الحلقات", icon: HiUserGroup },
    { href: "/risk", label: "متابعة الطلاب", icon: HiExclamationTriangle },
  ];

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-slate-100 bg-white/95 backdrop-blur-xl transition-all duration-300 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4 md:gap-8">
          
          {/* Enhanced Logo Section - Responsive Sizes */}
          <Link 
            href="/" 
            className="group flex items-center gap-3 md:gap-4 transition-transform active:scale-95 shrink-0"
          >
            <div className="relative flex h-10 w-10 md:h-14 md:w-14 items-center justify-center overflow-hidden rounded-xl md:rounded-2xl bg-white shadow-md md:shadow-lg ring-1 ring-slate-100 transition-all group-hover:shadow-blue-200 group-hover:ring-blue-100">
              <Image 
                src="/logo.jfif" 
                alt="مدارج" 
                fill 
                className="object-contain p-0.5 md:p-1 transition-transform duration-500 group-hover:scale-110"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-black tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
                مركز مـدارج
              </span>
              <span className="hidden sm:block text-[8px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-blue-500 mt-0.5">
                نظام إدارة الحلقات
              </span>
            </div>
          </Link>

          {/* Navigation Links - Responsive Spacing */}
          <div className="flex items-center gap-1 md:gap-2">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={`relative flex items-center gap-2 rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-2.5 text-sm font-bold transition-all duration-300 ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <Icon className={`text-xl md:text-2xl ${active ? "scale-110" : "opacity-80 font-bold"}`} />
                  <span className="hidden lg:block">{label}</span>
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </nav>
  );
}
