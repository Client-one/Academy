import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listCoursesForSemester } from "@/lib/data/academics";
import { requireStudent } from "@/lib/security/guards";

export default async function CoursesPage() {
  const { supabase, profile } = await requireStudent();
  const courses = await listCoursesForSemester(supabase, profile.semester_id!);

  return (
    <>
      <PageHeader title="المقررات" subtitle="مقررات فصلك الدراسي الحالي فقط." />
      {courses.length === 0 ? (
        <EmptyState title="لا توجد مقررات منشورة بعد" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="h-full transition-colors hover:border-brand-300">
                <CardTitle>{course.name}</CardTitle>
                <p className="mt-1 text-sm text-ink-500" dir="ltr">{course.code}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
