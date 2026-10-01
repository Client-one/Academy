import Link from "next/link";
import { requireStudent } from "@/lib/security/guards";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function StudentNav() {
  const { profile } = await requireStudent();
  const supabase = await createClient();
  const [{ data: level }, { data: semester }] = await Promise.all([
    profile.level_id
      ? supabase.from("levels").select("name").eq("id", profile.level_id).maybeSingle()
      : Promise.resolve({ data: null }),
    profile.semester_id
      ? supabase.from("semesters").select("name").eq("id", profile.semester_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-lg font-extrabold text-brand-800">
            المنصة الأكاديمية
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold text-ink-600">
            <Link href="/dashboard" className="rounded-lg px-3 py-1.5 hover:bg-ink-100">
              الرئيسية
            </Link>
            <Link href="/courses" className="rounded-lg px-3 py-1.5 hover:bg-ink-100">
              المقررات
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-left sm:block">
            <p className="text-sm font-bold text-ink-900">{profile.full_name}</p>
            <p className="text-xs text-ink-500">
              {level?.name ?? ""} — {semester?.name ?? ""}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
