import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import { logError } from "@/lib/security/logger";
import { buildOrFilter } from "@/lib/validation/postgrest-escaping";

const INTERNAL_DOMAIN = "students.internal";

/**
 * Provision a student:
 *  1. Create the Supabase Auth user with a server-generated internal email
 *     (never derived from the university number).
 *  2. Insert the profile row using the ADMIN SESSION (RLS), not service role.
 *  3. On partial failure: roll back the Auth user so no orphan remains.
 */
export async function provisionStudent(params: {
  adminClient: ReturnType<typeof createAdminClient>; // admin-session client (RLS)
  fullName: string;
  universityId: string;
  password: string;
  semesterId: string;
  adminProfileId: string;
}): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const internalEmail = `${randomUUID()}@${INTERNAL_DOMAIN}`;

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: internalEmail,
    password: params.password,
    email_confirm: true,
    user_metadata: { full_name: params.fullName },
  });
  if (authError || !authData.user) {
    logError("student_provision_auth_failed", { message: authError?.message });
    return { ok: false, error: "تعذر إنشاء حساب المصادقة." };
  }

  const { error: profileError } = await params.adminClient.from("profiles").insert({
    id: authData.user.id,
    full_name: params.fullName,
    university_id: params.universityId,
    role: "student",
    semester_id: params.semesterId,
    level_id: (
      await params.adminClient
        .from("semesters")
        .select("level_id")
        .eq("id", params.semesterId)
        .single()
    ).data?.level_id,
    is_active: true,
    created_by: params.adminProfileId,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    logError("student_provision_profile_failed", { message: profileError.message });
    return { ok: false, error: "تعذر إنشاء الملف الشخصي (ربما رقم الجامعة مستخدم لطالب نشط)." };
  }

  return { ok: true, userId: authData.user.id };
}

export async function listStudents(
  adminClient: SupabaseClient,
  options: { page: number; search?: string }
): Promise<{ students: (Profile & { level_name: string | null; semester_name: string | null })[]; count: number }> {
  const pageSize = 25;
  let query = adminClient
    .from("profiles")
    .select(
      "*, semesters(name), levels(name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(options.page * pageSize, options.page * pageSize + pageSize - 1);

  if (options.search) {
    query = query.or(buildOrFilter(["full_name", "university_id"], options.search));
  }

  const { data, count } = await query;
  const students = (data ?? []).map((row: Record<string, unknown>) => {
    const semesters = row.semesters as { name: string } | null;
    const levels = row.levels as { name: string } | null;
    const { semesters: _s, levels: _l, ...profile } = row;
    return {
      ...(profile as unknown as Profile),
      level_name: levels?.name ?? null,
      semester_name: semesters?.name ?? null,
    };
  });
  return { students, count: count ?? 0 };
}

/** Deactivate = deny future protected operations immediately (Auth ban). */
export async function setStudentActive(
  studentAuthId: string,
  active: boolean
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(studentAuthId, {
    ban_duration: active ? "0s" : "876000h",
  });
  if (error) {
    logError("student_set_active_failed", { message: error.message });
    return { ok: false, error: "تعذر تحديث حالة الحساب." };
  }
  return { ok: true };
}

export async function resetStudentPassword(
  studentAuthId: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(studentAuthId, {
    password: newPassword,
  });
  if (error) return { ok: false, error: "تعذر إعادة تعيين كلمة المرور." };
  return { ok: true };
}
