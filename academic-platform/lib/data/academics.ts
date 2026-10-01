import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentItem, ContentMaterial, Course, Level, MaterialKind, Semester } from "@/lib/types";

type Client = SupabaseClient;

export async function listLevels(client: Client): Promise<Level[]> {
  const { data } = await client.from("levels").select("*").order("order_index");
  return (data ?? []) as Level[];
}

export async function listSemesters(client: Client): Promise<(Semester & { level_name?: string })[]> {
  const { data } = await client
    .from("semesters")
    .select("*, levels(name)")
    .order("order_index");
  return (data ?? []).map((row: Record<string, unknown>) => {
    const levels = row.levels as { name: string } | null;
    const { levels: _l, ...semester } = row;
    return { ...(semester as Semester), level_name: levels?.name ?? "" };
  });
}

export async function listCoursesForSemester(client: Client, semesterId: string): Promise<Course[]> {
  const { data } = await client
    .from("courses")
    .select("*")
    .eq("semester_id", semesterId)
    .order("order_index");
  return (data ?? []) as Course[];
}

export async function listContentItems(client: Client, courseId: string): Promise<ContentItem[]> {
  const { data } = await client
    .from("content_items")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index");
  return (data ?? []) as ContentItem[];
}

export async function listMaterialKinds(client: Client): Promise<MaterialKind[]> {
  const { data } = await client.from("material_kinds").select("*").order("code");
  return (data ?? []) as MaterialKind[];
}

export async function listMaterials(client: Client, contentItemId: string): Promise<(ContentMaterial & { kind_code?: string })[]> {
  const { data } = await client
    .from("content_materials")
    .select("*, material_kinds(code)")
    .eq("content_item_id", contentItemId)
    .order("order_index");
  return (data ?? []).map((row: Record<string, unknown>) => {
    const kinds = row.material_kinds as { code: string } | null;
    const { material_kinds: _k, ...material } = row;
    return { ...(material as ContentMaterial), kind_code: kinds?.code ?? "" };
  });
}

export async function moveItem(
  client: Client,
  input: { kind: string; id: string; delta: 1 | -1 }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await client.rpc("move_item", input);
  if (error) return { ok: false, error: "تعذر إعادة الترتيب." };
  return { ok: true };
}
