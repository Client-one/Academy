import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="mb-2 text-4xl" aria-hidden>🔍</p>
        <h1 className="text-xl font-bold text-ink-950">الصفحة غير موجودة</h1>
        <Link href="/dashboard" className="mt-4 inline-block font-semibold text-brand-700 hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}
