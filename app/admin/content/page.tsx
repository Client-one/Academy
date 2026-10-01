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
import { upsertContentItemAction } from "@/app/admin/actions/academics";
import { listContentItems, listCoursesForSemester, listSemesters } from "@/lib/data/academics";
import { requireAdmin } from "@/lib/security/guards";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const semesters = await listSemesters(supabase);
  const semesterId = semesters[0]?.id ?? "";
  const courses = semesterId ? await listCoursesForSemester(supabase, semesterId) : [];
  const courseId = sp.course ?? courses[0]?.id ?? "";
  const items = courseId ? await listContentItems(supabase, courseId) : [];

  return (
    <>
      <PageHeader title="محتوى المقررات" subtitle="محاور الدروس/المواضيع داخل كل مقرر." />

      <form method="GET" className="mb-4 flex max-w-xs items-center gap-2">
        <Select name="course" defaultValue={courseId}>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Button type="submit" variant="secondary">تحديث</Button>
      </form>

      {courseId && (
        <Card className="mb-6">
          <CardTitle className="mb-4">إضافة محور</CardTitle>
          <ActionForm action={upsertContentItemAction}>
            <input type="hidden" name="course_id" value={courseId} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="العنوان"><Input name="title" required /></Field>
              <Field label="الوصف"><Textarea name="description" rows={2} /></Field>
            </div>
          </ActionForm>
        </Card>
      )}

      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-100 bg-white p-3 shadow-card">
            <span className="font-bold text-ink-900">
              {i.title} <Badge tone={statusTone(i.status)}>{statusLabel(i.status)}</Badge>
            </span>
            <span className="flex items-center gap-2">
              <MoveButtons kind="content_item" id={i.id} />
              <StatusButtons kind="content_item" id={i.id} status={i.status} />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
