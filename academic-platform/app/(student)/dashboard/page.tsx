import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listCoursesForSemester } from "@/lib/data/academics";
import { searchStudentContent } from "@/lib/data/search";
import { requireStudent } from "@/lib/security/guards";
import { searchQuerySchema } from "@/lib/validation/schemas";
import { MATERIAL_KIND_META } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { supabase, profile } = await requireStudent();
  const { q } = await searchParams;
  const semesterId = profile.semester_id!;

  const courses = await listCoursesForSemester(supabase, semesterId);

  const search = searchQuerySchema.safeParse(q ?? "");
  const results = search.success ? await searchStudentContent(supabase, search.data) : null;
  const hasQuery = typeof q === "string" && q.trim().length > 0;

  const totalResults = results
    ? results.courses.length + results.contentItems.length + results.materials.length
    : 0;

  return (
    <>
      <PageHeader
        title={`أهلاً، ${profile.full_name}`}
        subtitle="تصفح مقررات فصلك الدراسي وابحث في المواد المعتمدة."
      />

      <form action="/dashboard" method="GET" className="mb-6 flex gap-2" role="search">
        <Input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="ابحث في المقررات والعناوين والمواد…"
          aria-label="بحث"
        />
        <Button type="submit" variant="secondary">بحث</Button>
      </form>

      {hasQuery && (
        <section className="mb-8">
          {search.success === false && (
            <p className="text-sm font-medium text-red-700">{search.error.issues[0]?.message}</p>
          )}
          {results && totalResults === 0 && (
            <EmptyState title="لا توجد نتائج مطابقة" hint="جرّب كلمات مختلفة أو تحقق من الإملاء." />
          )}
          {results && totalResults > 0 && (
            <div className="space-y-2">
              {results.courses.map((c) => (
                <Link key={c.id} href={`/courses/${c.id}`}
                  className="block rounded-xl border border-ink-100 bg-white p-3 shadow-card hover:border-brand-300">
                  <span className="font-bold text-ink-900">{c.name}</span>
                  <span className="mr-2 text-xs text-ink-500" dir="ltr">{c.code}</span>
                </Link>
              ))}
              {results.contentItems.map((i) => (
                <Link key={i.id} href={`/courses/${i.course_id}/${i.id}`}
                  className="block rounded-xl border border-ink-100 bg-white p-3 shadow-card hover:border-brand-300">
                  <span className="font-bold text-ink-900">{i.title}</span>
                  <span className="mr-2 text-xs text-ink-500">عنوان محتوى</span>
                </Link>
              ))}
              {results.materials.map((m) => (
                <Link key={m.id} href={`/read/${m.id}`}
                  className="block rounded-xl border border-ink-100 bg-white p-3 shadow-card hover:border-brand-300">
                  <span className="font-bold text-ink-900">{m.title}</span>
                  <span className="mr-2 text-xs text-ink-500">
                    {MATERIAL_KIND_META[m.kind_code ?? ""]?.label ?? "مادة"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink-900">مقررات الفصل الحالي</h2>
        {courses.length === 0 ? (
          <EmptyState title="لا توجد مقررات منشورة بعد" hint="ستظهر مقررات فصلك هنا فور اعتمادها من الإدارة." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="h-full transition-colors hover:border-brand-300">
                  <CardTitle>{course.name}</CardTitle>
                  <p className="mt-1 text-sm text-ink-500" dir="ltr">{course.code}</p>
                  {course.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-ink-600">{course.description}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
