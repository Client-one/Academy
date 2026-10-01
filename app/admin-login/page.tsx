import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/forms/admin-login-form";
import { Card, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold text-ink-950">لوحة الإدارة</h1>
          <p className="mt-1 text-sm text-ink-500">دخول خاص بالمسؤولين فقط.</p>
        </div>
        <Card>
          <CardTitle className="mb-4">دخول المدير</CardTitle>
          <AdminLoginForm />
        </Card>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            العودة لدخول الطالب
          </Link>
        </p>
      </div>
    </main>
  );
}
