import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleRenderer } from "@/lib/articles/renderer";
import { getMaterialForStudent } from "@/lib/data/materials";
import { requireStudent } from "@/lib/security/guards";
import { MATERIAL_KIND_META } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ReadMaterialPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;
  const { supabase, profile } = await requireStudent();

  const result = await getMaterialForStudent(supabase, materialId, profile.semester_id!);
  if (!result.ok) notFound();

  const { material, kindCode, article, fileUrl } = result;
  const meta = MATERIAL_KIND_META[kindCode];

  return (
    <div className="py-4">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge tone={meta?.badge === "official" ? "official" : "student"}>
          {meta?.label ?? "مادة"}
        </Badge>
        <h1 className="text-xl font-bold text-ink-950">{material.title}</h1>
      </div>
      {material.description && <p className="mb-6 text-sm text-ink-600">{material.description}</p>}

      {article && (
        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-8">
          <ArticleRenderer article={article} />
        </section>
      )}

      {fileUrl && (
        <section className={article ? "mt-6" : ""}>
          {article && <p className="mb-2 text-sm font-semibold text-ink-600">الملف الأصلي:</p>}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <p className="mb-3 text-sm text-ink-500">
              روابط الملفات تنتهي صلاحيتها بعد دقيقتين لحماية المحتوى.
            </p>
            {/* Signed URL is intentionally not persisted anywhere */}
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <Button>فتح الملف الأصلي (PDF/صور)</Button>
            </a>
          </div>
        </section>
      )}

      {!article && !fileUrl && <p className="text-sm text-ink-500">هذه المادة غير متاحة للعرض.</p>}

      <p className="mt-6 text-sm">
        <Link href="/courses" className="font-semibold text-ink-600 hover:underline">
          → العودة إلى المقررات
        </Link>
      </p>
    </div>
  );
}
