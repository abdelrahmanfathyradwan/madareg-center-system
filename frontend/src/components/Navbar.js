"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiUserGroup, HiExclamationTriangle } from "react-icons/hi2";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/",       label: "الرئيسية",     icon: HiHome },
    { href: "/groups", label: "الحلقات",       icon: HiUserGroup },
    { href: "/risk",   label: "متابعة الطلاب", icon: HiExclamationTriangle },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-100 shadow-sm group-hover:ring-blue-300 transition-all duration-200">
            <Image src="/logo.jfif" alt="شعار مدارج" fill className="object-cover" />
          </div>
          <span className="font-black text-lg text-slate-800 group-hover:text-blue-700 transition-colors duration-200">
            مدارج
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`text-base ${active ? "text-blue-600" : "text-slate-400"}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
