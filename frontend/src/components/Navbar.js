"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/",        label: "الرئيسية" },
    { href: "/groups",  label: "الحلقات" },
    { href: "/risk",    label: "متابعة الطلاب" },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-slate-800 shrink-0">
          <Image src="/logo.jfif" alt="Logo" width={80} height={80} />
          مـدـــ ا ـــرج
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname === link.href
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
