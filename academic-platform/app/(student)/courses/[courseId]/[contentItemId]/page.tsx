import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listMaterials } from "@/lib/data/academics";
import { requireStudent } from "@/lib/security/guards";
import { MATERIAL_KIND_META } from "@/lib/types";

export default async function ContentItemPage({
  params,
}: {
  params: Promise<{ courseId: string; contentItemId: string }>;
}) {
  const { courseId, contentItemId } = await params;
  const { supabase } = await requireStudent();

  const { data: item } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", contentItemId)
    .maybeSingle();
  if (!item || (item as { status: string }).status !== "published") notFound();

  const materials = (await listMaterials(supabase, contentItemId)).filter(
    (m) => m.status === "published"
  );

  return (
    <>
      <PageHeader title={(item as { title: string }).title} subtitle="اختر المادة التي تريد الاطلاع عليها." />
      {materials.length === 0 ? (
        <EmptyState title="لا توجد مواد منشورة في هذا المحور بعد" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {materials.map((m) => {
            const meta = MATERIAL_KIND_META[m.kind_code ?? ""];
            return (
              <Link key={m.id} href={`/read/${m.id}`}>
                <div className="h-full rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition-colors hover:border-brand-300">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge tone={meta?.badge === "official" ? "official" : "student"}>
                      {meta?.label ?? "مادة"}
                    </Badge>
                    {m.article && (
                      <Badge tone="published">نسخة للقراءة</Badge>
                    )}
                  </div>
                  <p className="font-bold text-ink-900">{m.title}</p>
                  {m.description && <p className="mt-1 text-sm text-ink-500">{m.description}</p>}
                  <p className="mt-3 text-sm font-semibold text-brand-700">
                    {m.article ? "اقرأ الآن ←" : "افتح الملف ←"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-sm">
        <Link href={`/courses/${courseId}`} className="font-semibold text-ink-600 hover:underline">
          → العودة إلى المقرر
        </Link>
      </p>
    </>
  );
}
