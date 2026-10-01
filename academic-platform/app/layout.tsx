import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "المنصة الأكاديمية",
  description: "منصة موارد أكاديمية آمنة لطلبة تقنية المعلومات",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-ink-50 font-sans text-ink-900 antialiased">{children}</body>
    </html>
  );
}
