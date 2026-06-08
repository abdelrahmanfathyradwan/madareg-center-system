import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cairo",
});

export const metadata = {
  title: " مركز مدارج",
  description: "نظام إدارة الحضور والمدفوعات لمركز مدارج لتحفيظ القرآن الكريم",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 antialiased">
        <AuthGuard>
          <Navbar />
          <div className="flex-1">{children}</div>
        </AuthGuard>
      </body>
    </html>
  );
}
