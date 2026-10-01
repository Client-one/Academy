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
import { EmptyState } from "@/components/ui/empty-state";
import { uploadMaterialAction, attachArticleAction } from "@/app/admin/actions/materials";
import {
  listContentItems, listCoursesForSemester, listMaterialKinds,
  listMaterials, listSemesters,
} from "@/lib/data/academics";
import { requireAdmin } from "@/lib/security/guards";

export default async function AdminMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const [semesters, kinds] = await Promise.all([listSemesters(supabase), listMaterialKinds(supabase)]);
  const semesterId = semesters[0]?.id ?? "";
  const courses = semesterId ? await listCoursesForSemester(supabase, semesterId) : [];
  const courseId = courses[0]?.id ?? "";
  const items = courseId ? await listContentItems(supabase, courseId) : [];
  const itemId = sp.item ?? items[0]?.id ?? "";
  const materials = itemId ? await listMaterials(supabase, itemId) : [];

  return (
    <>
      <PageHeader title="المواد" subtitle="ارفع ملفاً ثم انشره؛ وأرفق نسخة قراءة JSON اختيارياً." />

      <form method="GET" className="mb-4 flex max-w-md items-center gap-2">
        <Select name="item" defaultValue={itemId}>
          {items.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
        </Select>
        <Button type="submit" variant="secondary">تحديث</Button>
      </form>

      {itemId && (
        <>
          <Card className="mb-6">
            <CardTitle className="mb-4">رفع مادة جديدة</CardTitle>
            <ActionForm action={uploadMaterialAction} submitLabel="رفع الملف">
              <input type="hidden" name="content_item_id" value={itemId} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="نوع المادة">
                  <Select name="material_kind_id" required>
                    {kinds.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                  </Select>
                </Field>
                <Field label="العنوان"><Input name="title" required /></Field>
                <Field label="الوصف"><Textarea name="description" rows={2} /></Field>
                <Field label="الملف (PDF/JPG/PNG/WEBP — حد أقصى 20MB)">
                  <Input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,.webp" />
                </Field>
              </div>
            </ActionForm>
          </Card>
        </>
      )}

      {materials.length === 0 ? (
        <EmptyState title="لا توجد مواد في هذا المحور بعد" />
      ) : (
        <ul className="space-y-3">
          {materials.map((m) => (
            <li key={m.id} className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-ink-900">
                  {m.title}{" "}
                  <Badge tone={statusTone(m.status)}>{statusLabel(m.status)}</Badge>
                  {m.article && <Badge tone="published">نسخة قراءة</Badge>}
                </span>
                <span className="flex items-center gap-2">
                  <MoveButtons kind="material" id={m.id} />
                  <StatusButtons kind="material" id={m.id} status={m.status} />
                </span>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-semibold text-brand-700">
                  إرفاق نسخة قراءة (مقال JSON)
                </summary>
                <ActionForm action={attachArticleAction} submitLabel="التحقق والحفظ" className="mt-3">
                  <input type="hidden" name="material_id" value={m.id} />
                  <Field label="JSON المقال (schemaVersion: 1)">
                    <Textarea name="json" rows={8} dir="ltr" className="font-mono text-xs" required />
                  </Field>
                </ActionForm>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
