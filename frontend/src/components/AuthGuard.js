"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // allow login page
    if (pathname === "/login") {
      setAuthorized(true);
      return;
    }

    const token = localStorage.getItem("madarej_token");
    if (!token) {
      setAuthorized(false);
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized && pathname !== "/login") {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return children;
}
