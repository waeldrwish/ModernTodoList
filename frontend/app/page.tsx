"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredToken, me } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      router.replace("/tasks");
      return;
    }
    me().then((u) => {
      if (u) router.replace("/tasks");
    }).catch(() => {});
  }, [router]);

  return (
    <main className="mx-auto max-w-3xl">
      <section className="rounded-2xl bg-white p-8 shadow-lg shadow-gray-200/60 ring-1 ring-gray-200">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">مرحبًا بك في تطبيق المهام</h1>
        <p className="mt-2 text-gray-600">سجّل دخولك أو أنشئ حسابًا للبدء.</p>
        <div className="mt-6 flex gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-2.5 text-sm font-medium text-white shadow-md-elev hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 active:scale-[0.98] transition"
            href="/login"
          >
            تسجيل الدخول
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400 active:scale-[0.98] transition"
            href="/signup"
          >
            إنشاء حساب
          </Link>
        </div>
      </section>
    </main>
  );
}
