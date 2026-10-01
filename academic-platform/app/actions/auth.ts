"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { adminLoginSchema, studentLoginSchema } from "@/lib/validation/schemas";

const GENERIC_AUTH_ERROR = "بيانات الدخول غير صحيحة أو الحساب غير نشط.";

export interface AuthFormState {
  error?: string;
}

export async function studentLogin(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = studentLoginSchema.safeParse({
    university_id: formData.get("university_id"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "تحقق من المدخلات." };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const uid = String(formData.get("university_id")).trim();

  // Defense in depth on top of Supabase Auth rate limiting.
  if (!rateLimit(clientKey("student-login", uid, ip), 8, 10 * 60_000)) {
    return { error: "محاولات كثيرة. حاول مرة أخرى بعد قليل." };
  }

  // Private lookup: university number → internal auth email (service role only,
  // never exposed to the browser). Same generic error whether missing/inactive.
  const admin = createAdminClient();
  const { data: internalEmail, error: lookupError } = await admin.rpc("student_auth_email", {
    p_university_id: uid,
  });
  if (lookupError || !internalEmail || typeof internalEmail !== "string") {
    return { error: GENERIC_AUTH_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: internalEmail,
    password: parsed.data.password,
  });
  if (error) {
    return { error: GENERIC_AUTH_ERROR };
  }

  redirect("/dashboard");
}

export async function adminLogin(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "تحقق من البريد الإلكتروني وكلمة المرور." };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!rateLimit(clientKey("admin-login", parsed.data.email, ip), 8, 10 * 60_000)) {
    return { error: "محاولات كثيرة. حاول مرة أخرى بعد قليل." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    return { error: GENERIC_AUTH_ERROR };
  }

  // Verify admin role + active status server-side (never trust the session alone).
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || (profile as { role: string }).role !== "admin" || !(profile as { is_active: boolean }).is_active) {
    await supabase.auth.signOut();
    return { error: GENERIC_AUTH_ERROR };
  }

  redirect("/admin");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
