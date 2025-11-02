"use client";

import { FormEvent, useState } from "react";
import { login, me } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      await me();
      router.replace("/tasks");
    } catch (err: any) {
      setError(err?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      {/* خلفية متدرجة */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
      </div>

      <div className="w-full max-w-md">
        {/* الشعار والعنوان */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-600/30">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">مرحباً بك مجدداً</h1>
          <p className="mt-2 text-sm text-gray-600">قم بتسجيل الدخول للوصول إلى مهامك</p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-gray-200/50 ring-1 ring-gray-200/50 backdrop-blur-sm">
          {/* تأثير الإضاءة */}
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary-400/20 blur-3xl"></div>
          
          <div className="relative p-8">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl bg-gradient-to-r from-red-50 to-red-100/50 p-4 ring-1 ring-red-200/50">
                <svg className="h-5 w-5 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* حقل البريد الإلكتروني */}
              <div className="group">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="example@email.com"
                    className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pr-12 pl-4 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  />
                </div>
              </div>

              {/* حقل كلمة المرور */}
              <div className="group">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pr-12 pl-12 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* زر تسجيل الدخول */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-6 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:shadow-xl hover:shadow-primary-600/40 focus:outline-none focus:ring-4 focus:ring-primary-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 transition-opacity group-hover:opacity-100"></span>
                
                {loading ? (
                  <>
                    <svg className="relative h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="relative">جاري الدخول...</span>
                  </>
                ) : (
                  <>
                    <span className="relative">تسجيل الدخول</span>
                    <svg className="relative h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* رابط إنشاء حساب */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{" "}
                <Link 
                  className="font-semibold text-primary-700 transition-colors hover:text-primary-800 hover:underline underline-offset-4" 
                  href="/signup"
                >
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* نص قانوني */}
        <p className="mt-6 text-center text-xs text-gray-500">
          بتسجيل الدخول، أنت توافق على{" "}
          <a href="#" className="underline hover:text-gray-700">شروط الخدمة</a>
          {" "}و{" "}
          <a href="#" className="underline hover:text-gray-700">سياسة الخصوصية</a>
        </p>
      </div>
    </main>
  );
}