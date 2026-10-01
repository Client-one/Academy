import { ActionForm } from "@/components/action-form";
import { MoveButtons } from "@/components/admin-table-actions";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { upsertLevelAction } from "@/app/admin/actions/academics";
import { listLevels } from "@/lib/data/academics";
import { requireAdmin } from "@/lib/security/guards";

export default async function AdminLevelsPage() {
  const { supabase } = await requireAdmin();
  const levels = await listLevels(supabase);
  return (
    <>
      <PageHeader title="المستويات" />
      <Card className="mb-6">
        <CardTitle className="mb-4">إضافة مستوى</CardTitle>
        <ActionForm action={upsertLevelAction}>
          <Field label="اسم المستوى"><Input name="name" required /></Field>
        </ActionForm>
      </Card>
      <ul className="space-y-2">
        {levels.map((l) => (
          <li key={l.id} className="flex items-center justify-between rounded-xl border border-ink-100 bg-white p-3 shadow-card">
            <span className="font-bold text-ink-900">{l.name}</span>
            <MoveButtons kind="level" id={l.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
