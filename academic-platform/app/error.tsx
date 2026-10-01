"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="mb-2 text-4xl" aria-hidden>⚠️</p>
        <h1 className="text-xl font-bold text-ink-950">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-sm text-ink-500">حاول مرة أخرى، وإن استمرت المشكلة تواصل مع الإدارة.</p>
        <Button className="mt-6" onClick={reset}>إعادة المحاولة</Button>
      </div>
    </main>
  );
}
