/**
 * Single, shared escaping implementation for user input embedded into
 * Supabase/PostgREST filter strings (.or(...) / .ilike(...)).
 *
 * Threat model: a raw term like `x),status.eq.published` or `a%,or(...)`
 * must never be able to add, modify, or terminate a filter clause.
 * We therefore escape, at the value level:
 *   - "\\" first (escape character itself)
 *   - "%" and "_" (LIKE wildcards)
 *   - ",", "(" and ")" (.or() clause separators / grouping)
 *
 * Column names are NEVER interpolated from user input — only from a fixed
 * allowlist supplied by the caller to buildOrFilter().
 */
import { escapeLike } from "@/lib/validation/arabic";

export function escapeOrValue(term: string): string {
  return escapeLike(term).replace(/[,()]/g, (ch) => `\\${ch}`);
}

export function ilikePattern(term: string): string {
  return `%${escapeOrValue(term)}%`;
}

/**
 * Builds a comma-joined `col.ilike.%term%` filter string for .or().
 * `columns` must be a fixed allowlist, never user-controlled.
 */
export function buildOrFilter(columns: readonly string[], term: string): string {
  const value = ilikePattern(term);
  return columns.map((c) => `${c}.ilike.${value}`).join(",");
}
