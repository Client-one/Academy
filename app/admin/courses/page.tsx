import { ActionForm } from "@/components/action-form";
import { MoveButtons, StatusButtons } from "@/components/admin-table-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge, statusLabel, statusTone } from "@/components/ui/badge";
import { upsertCourseAction } from "@/app/admin/actions/academics";
import { listCoursesForSemester, listSemesters } from "@/lib/data/academics";
import { requireAdmin } from "@/lib/security/guards";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ semester?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const semesters = await listSemesters(supabase);
  const semesterId = sp.semester ?? semesters[0]?.id ?? "";
  const courses = semesterId ? await listCoursesForSemester(supabase, semesterId) : [];

  return (
    <>
      <PageHeader title="المقررات" />

      <form method="GET" className="mb-4 flex max-w-xs items-center gap-2">
        <Select name="semester" defaultValue={semesterId}>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>{s.level_name} — {s.name}</option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">تحديث</Button>
      </form>

      {semesterId && (
        <Card className="mb-6">
          <CardTitle className="mb-4">إضافة مقرر</CardTitle>
          <ActionForm action={upsertCourseAction}>
            <input type="hidden" name="semester_id" value={semesterId} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="اسم المقرر"><Input name="name" required /></Field>
              <Field label="الرمز"><Input name="code" required dir="ltr" className="text-right" /></Field>
              <Field label="الوصف"><Textarea name="description" rows={2} /></Field>
            </div>
          </ActionForm>
        </Card>
      )}

      <ul className="space-y-2">
        {courses.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-100 bg-white p-3 shadow-card">
            <span className="font-bold text-ink-900">
              {c.name}{" "}
              <span className="text-sm font-normal text-ink-500" dir="ltr">{c.code}</span>{" "}
              <Badge tone={statusTone(c.status)}>{statusLabel(c.status)}</Badge>
            </span>
            <span className="flex items-center gap-2">
              <MoveButtons kind="course" id={c.id} />
              <StatusButtons kind="course" id={c.id} status={c.status} />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
