import { ActionForm } from "@/components/action-form";
import { MoveButtons } from "@/components/admin-table-actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { upsertSemesterAction } from "@/app/admin/actions/academics";
import { listLevels, listSemesters } from "@/lib/data/academics";
import { requireAdmin } from "@/lib/security/guards";

export default async function AdminSemestersPage() {
  const { supabase } = await requireAdmin();
  const [levels, semesters] = await Promise.all([listLevels(supabase), listSemesters(supabase)]);
  return (
    <>
      <PageHeader title="الفصول الدراسية" />
      <Card className="mb-6">
        <CardTitle className="mb-4">إضافة فصل</CardTitle>
        <ActionForm action={upsertSemesterAction}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="المستوى">
              <Select name="level_id" required>
                {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </Field>
            <Field label="اسم الفصل"><Input name="name" required /></Field>
          </div>
        </ActionForm>
      </Card>
      <ul className="space-y-2">
        {semesters.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-xl border border-ink-100 bg-white p-3 shadow-card">
            <span className="font-bold text-ink-900">{s.name} <span className="text-sm font-normal text-ink-500">({s.level_name})</span></span>
            <MoveButtons kind="semester" id={s.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
