"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/api";

export default function NavBar({ userName }: { userName?: string }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <header className="sticky top-0 z-40 mb-6">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 shadow-xl shadow-primary-600/25 backdrop-blur-sm">
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          
          <div className="relative flex items-center justify-between px-6 py-4">
            {/* الشعار */}
            <Link 
              href="/tasks" 
              className="group flex items-center gap-2 transition-transform hover:scale-105"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md transition-all group-hover:bg-white/30 group-hover:rotate-6">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-wide text-white">مهامي</span>
            </Link>

            {/* منطقة المستخدم */}
            <div className="flex items-center gap-4">
              {userName && (
                <div className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md sm:flex">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">{userName}</span>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 transition-all hover:shadow-lg hover:shadow-white/30 focus:outline-none focus:ring-2 focus:ring-white/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-50 to-white opacity-0 transition-opacity group-hover:opacity-100"></span>
                
                {isLoggingOut ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="relative">جاري الخروج...</span>
                  </>
                ) : (
                  <>
                    <svg className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="relative">تسجيل الخروج</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </header>
  );
}