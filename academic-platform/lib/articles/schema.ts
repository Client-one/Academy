import { z } from "zod";

/**
 * V1 article blocks. Future blocks (image/table/code/quote/reference) are
 * intentionally NOT implemented. Unknown blocks fail validation — no silent
 * rendering of untrusted structures, and never rendered as raw HTML.
 */

const baseBlock = { id: z.string().min(1).max(64).optional() };

export const headingBlockSchema = z.object({
  ...baseBlock,
  type: z.literal("heading"),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  text: z.string().min(1).max(500),
});

export const paragraphBlockSchema = z.object({
  ...baseBlock,
  type: z.literal("paragraph"),
  text: z.string().min(1).max(10_000),
});

export const listBlockSchema = z.object({
  ...baseBlock,
  type: z.literal("list"),
  ordered: z.boolean(),
  items: z.array(z.string().min(1).max(2_000)).min(1).max(300),
});

export const definitionBlockSchema = z.object({
  ...baseBlock,
  type: z.literal("definition"),
  term: z.string().min(1).max(300),
  definition: z.string().min(1).max(5_000),
});

export const noteBlockSchema = z.object({
  ...baseBlock,
  type: z.literal("note"),
  tone: z.enum(["info", "warning", "tip"]),
  text: z.string().min(1).max(5_000),
});

export const exampleBlockSchema = z.object({
  ...baseBlock,
  type: z.literal("example"),
  title: z.string().max(200).optional(),
  text: z.string().min(1).max(10_000),
});

export const articleBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  listBlockSchema,
  definitionBlockSchema,
  noteBlockSchema,
  exampleBlockSchema,
]);

export const articleSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().min(1).max(300),
  blocks: z.array(articleBlockSchema).min(1).max(2_000),
});

export type Article = z.infer<typeof articleSchema>;
export type ArticleBlock = z.infer<typeof articleBlockSchema>;

/** Parse untrusted JSON text; returns a discriminated result, never throws. */
export function parseArticle(jsonText: string): { ok: true; article: Article } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: "الملف ليس JSON صالحاً." };
  }
  const result = articleSchema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: `مخطط المقال غير صالح: ${first ? `${first.path.join(".")} — ${first.message}` : "خطأ غير معروف"}`,
    };
  }
  return { ok: true, article: result.data };
}
