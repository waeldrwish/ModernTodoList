import "./globals.css";
import type { Metadata } from "next";
import { Tajawal } from "next/font/google";

export const metadata: Metadata = {
  title: "Todo App",
  description: "Tasks with auth (Next.js + Express)",
};

const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.className} min-h-screen bg-gray-50 text-gray-900`}>        
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}
