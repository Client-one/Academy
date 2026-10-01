import "server-only";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export interface SessionContext {
  supabase: SupabaseClient;
  user: User;
  profile: Profile;
}

async function loadContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    await supabase.auth.signOut();
    return null;
  }
  if (!profile.is_active) {
    await supabase.auth.signOut();
    return null;
  }
  return { supabase, user, profile: profile as Profile };
}

export async function requireUser(): Promise<SessionContext> {
  const ctx = await loadContext();
  if (!ctx) redirect("/login");
  return ctx;
}

export async function requireStudent(): Promise<SessionContext> {
  const ctx = await requireUser();
  if (ctx.profile.role !== "student" || !ctx.profile.semester_id || !ctx.profile.level_id) {
    redirect("/admin");
  }
  return ctx;
}

export async function requireAdmin(): Promise<SessionContext> {
  const ctx = await requireUser();
  if (ctx.profile.role !== "admin") redirect("/admin-login");
  return ctx;
}
