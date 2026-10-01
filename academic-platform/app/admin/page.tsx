import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/security/guards";

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();
  const tables = ["profiles", "levels", "semesters", "courses", "content_items", "content_materials"];
  const counts = await Promise.all(
    tables.map(async (t) => {
      const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
      return count ?? 0;
    })
  );
  const cards = [
    { label: "الطلاب", value: counts[0] },
    { label: "المستويات", value: counts[1] },
    { label: "الفصول", value: counts[2] },
    { label: "المقررات", value: counts[3] },
    { label: "محاور المحتوى", value: counts[4] },
    { label: "المواد", value: counts[5] },
  ];
  return (
    <>
      <PageHeader title="نظرة عامة" subtitle="حالة المنصة الحالية." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="text-center">
            <p className="text-2xl font-extrabold text-brand-800">{c.value}</p>
            <CardTitle className="mt-1 text-sm">{c.label}</CardTitle>
          </Card>
        ))}
      </div>
    </>
  );
}
