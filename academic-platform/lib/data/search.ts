import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeArabic } from "@/lib/validation/arabic";
import { buildOrFilter } from "@/lib/validation/postgrest-escaping";
import type { ContentItem, ContentMaterial, Course } from "@/lib/types";

export interface SearchResults {
  courses: Course[];
  contentItems: ContentItem[];
  materials: (ContentMaterial & { kind_code?: string })[];
}

const LIMIT = 20;

/**
 * Authorized search. RLS guarantees only published content from the
 * student's own semester is reachable.
 *
 * Matching runs against *_normalized generated columns (see migration
 * 0002_search_normalization.sql) which apply the SAME canonical Arabic
 * normalization as the query — so أ/إ/آ/ا, ى/ي, ة/ه and diacritics match
 * regardless of which equivalent form either side uses. Original/display
 * text is never modified.
 *
 * User input passes through the shared PostgREST escaping helper before it
 * is embedded into .or() filter strings.
 */
export async function searchStudentContent(
  client: SupabaseClient,
  rawQuery: string
): Promise<SearchResults> {
  const term = normalizeArabic(rawQuery);

  const [coursesRes, itemsRes, materialsRes] = await Promise.all([
    client
      .from("courses")
      .select("*")
      .or(buildOrFilter(["name_normalized", "code", "description_normalized"], term))
      .order("order_index")
      .limit(LIMIT),
    client
      .from("content_items")
      .select("*")
      .or(buildOrFilter(["title_normalized", "description_normalized"], term))
      .order("order_index")
      .limit(LIMIT),
    client
      .from("content_materials")
      .select("*, material_kinds(code)")
      .or(buildOrFilter(["title_normalized", "description_normalized"], term))
      .order("order_index")
      .limit(LIMIT),
  ]);

  return {
    courses: (coursesRes.data ?? []) as Course[],
    contentItems: (itemsRes.data ?? []) as ContentItem[],
    materials: ((materialsRes.data ?? []) as Record<string, unknown>[]).map((row) => {
      const kinds = row.material_kinds as { code: string } | null;
      const { material_kinds: _k, ...material } = row;
      return { ...(material as ContentMaterial), kind_code: kinds?.code ?? "" };
    }),
  };
}
