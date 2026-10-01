"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/security/guards";
import { provisionStudent, resetStudentPassword, setStudentActive } from "@/lib/data/students";
import { logError } from "@/lib/security/logger";
import {
  resetPasswordSchema,
  studentCreateSchema,
  studentUpdateSchema,
  idSchema,
  type ActionResult,
} from "@/lib/validation/schemas";

/** Convenience wrapper for ConfirmButton (bypasses FormData). */
export async function toggleStudentStatus(id: string, active: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  // Auth state is changed FIRST: if the ban/unban fails, nothing else has
  // been modified, so there is no inconsistent half-state and no false success.
  const ban = await setStudentActive(id, active);
  if (!ban.ok) return { error: ban.error ?? "تعذر تحديث جلسات الطالب." };

  // DB flag via the admin session + RLS (no service role for CRUD).
  const { error } = await supabase.from("profiles").update({ is_active: active }).eq("id", id);
  if (error) {
    // Non-atomic by necessity (two separate systems). Safest available
    // handling: compensate by reverting the Auth change, then report failure.
    await setStudentActive(id, !active);
    logError("student_status_db_failed", { id, active, message: error.message });
    return { error: "تعذر تحديث حالة الطالب في قاعدة البيانات." };
  }

  revalidatePath("/admin/students");
  return { success: active ? "تم تفعيل الطالب." : "تم تعطيل الطالب وإنهاء جلساته." };
}

export async function createStudentAction(formData: FormData): Promise<ActionResult> {
  const { supabase, profile } = await requireAdmin();
  const parsed = studentCreateSchema.safeParse({
    full_name: formData.get("full_name"),
    university_id: formData.get("university_id"),
    password: formData.get("password"),
    semester_id: formData.get("semester_id"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const result = await provisionStudent({
    adminClient: supabase,
    fullName: parsed.data.full_name,
    universityId: parsed.data.university_id,
    password: parsed.data.password,
    semesterId: parsed.data.semester_id,
    adminProfileId: profile.id,
  });
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/students");
  return { success: "تم إنشاء حساب الطالب بنجاح." };
}

export async function updateStudentAction(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = studentUpdateSchema.safeParse({
    id: formData.get("id"),
    full_name: formData.get("full_name"),
    university_id: formData.get("university_id"),
    semester_id: formData.get("semester_id"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // Academic assignment is set via the semester; level is derived server-side
  // so a client can never forge an inconsistent level/semester pair.
  const { data: semester } = await supabase
    .from("semesters")
    .select("level_id")
    .eq("id", parsed.data.semester_id)
    .maybeSingle();
  if (!semester) return { error: "الفصل الدراسي غير موجود." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      university_id: parsed.data.university_id,
      semester_id: parsed.data.semester_id,
      level_id: (semester as { level_id: string }).level_id,
    })
    .eq("id", parsed.data.id);

  if (error) return { error: "تعذر تحديث الطالب (ربما رقم الجامعة مستخدم لطالب نشط)." };
  revalidatePath("/admin/students");
  return { success: "تم تحديث بيانات الطالب." };
}

export async function setStudentStatusAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "معرّف غير صالح." };
  // Single hardened implementation (existence + auth ban + DB flag + compensation).
  return toggleStudentStatus(parsed.data.id, formData.get("active") === "true");
}

export async function resetStudentPasswordAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = resetPasswordSchema.safeParse({
    id: formData.get("id"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const result = await resetStudentPassword(parsed.data.id, parsed.data.password);
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/students");
  return { success: "تمت إعادة تعيين كلمة المرور." };
}
