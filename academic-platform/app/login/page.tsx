import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { Card, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-2xl text-white shadow-card" aria-hidden>
            🎓
          </div>
          <h1 className="text-2xl font-extrabold text-ink-950">المنصة الأكاديمية</h1>
          <p className="mt-1 text-sm text-ink-500">موادك الدراسية، منظمة وآمنة، في مكان واحد.</p>
        </div>
        <Card>
          <CardTitle className="mb-4">تسجيل دخول الطالب</CardTitle>
          <LoginForm />
        </Card>
        <p className="mt-4 text-center text-xs text-ink-400">
          حسابك يُنشأ من إدارة الكلية — لا يوجد تسجيل ذاتي.
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/admin-login" className="font-semibold text-brand-700 hover:underline">
            دخول الإدارة
          </Link>
        </p>
      </div>
    </main>
  );
}
