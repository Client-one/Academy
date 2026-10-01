import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listContentItems } from "@/lib/data/academics";
import { requireStudent } from "@/lib/security/guards";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { supabase, profile } = await requireStudent();

  // Authorization is enforced by RLS; .maybeSingle() returns null for
  // cross-semester/draft/archived IDs — treated identically as not found.
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) notFound();

  const items = await listContentItems(supabase, courseId);
  const published = items.filter((i) => i.status === "published");

  return (
    <>
      <PageHeader
        title={(course as { name: string }).name}
        subtitle={`رمز المقرر: ${(course as { code: string }).code}`}
      />
      {published.length === 0 ? (
        <EmptyState title="لم تُنشر محاور بعد" hint="ستُضاف محاور المقرر هنا فور اعتمادها." />
      ) : (
        <ol className="space-y-2">
          {published.map((item, idx) => (
            <li key={item.id}>
              <Link
                href={`/courses/${courseId}/${item.id}`}
                className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card transition-colors hover:border-brand-300"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-800">
                  {idx + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-ink-900">{item.title}</span>
                  {item.description && (
                    <span className="block truncate text-sm text-ink-500">{item.description}</span>
                  )}
                </span>
                <Badge tone="neutral">مُنشَر</Badge>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
