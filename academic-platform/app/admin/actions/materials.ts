"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/security/guards";
import { attachArticle, uploadMaterialFile } from "@/lib/data/materials";
import { materialSchema, type ActionResult } from "@/lib/validation/schemas";

export async function uploadMaterialAction(formData: FormData): Promise<ActionResult> {
  const { supabase, profile } = await requireAdmin();
  const parsed = materialSchema.safeParse({
    content_item_id: formData.get("content_item_id"),
    material_kind_id: formData.get("material_kind_id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "اختر ملفاً للرفع." };
  }

  const result = await uploadMaterialFile({
    client: supabase,
    contentItemId: parsed.data.content_item_id,
    materialKindId: parsed.data.material_kind_id,
    title: parsed.data.title,
    description: parsed.data.description,
    file,
    adminProfileId: profile.id,
  });
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/materials");
  return { success: "تم رفع المادة (مسودة). انشرها لتظهر للطلاب." };
}

export async function attachArticleAction(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const materialId = String(formData.get("material_id") ?? "");
  const json = String(formData.get("json") ?? "");

  const result = await attachArticle({ client: supabase, materialId, jsonText: json });
  if (!result.ok) return { error: result.error ?? "تعذر حفظ المقال." };

  revalidatePath("/admin/materials");
  return { success: "تم حفظ نسخة القراءة بعد التحقق من المخطط." };
}
