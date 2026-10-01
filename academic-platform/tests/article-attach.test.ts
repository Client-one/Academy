import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { attachArticle } from "@/lib/data/materials";

const VALID_ARTICLE = JSON.stringify({
  schemaVersion: 1,
  title: "ملخص تجريبي",
  blocks: [{ type: "paragraph", text: "نص تجريبي." }],
});

interface StubOptions {
  selectRow?: { id: string } | null;
  updateRows?: { id: string }[];
  updateError?: { message: string } | null;
}

/** Minimal chain stub matching the exact supabase-js call shape used. */
function makeClientStub(opts: StubOptions): SupabaseClient {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: opts.selectRow ?? null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () =>
            Promise.resolve({
              data: opts.updateRows ?? [],
              error: opts.updateError ?? null,
            }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
}

const MATERIAL_ID = "11111111-1111-4111-8111-111111111111";

describe("attachArticle", () => {
  it("rejects an invalid material ID before touching the database", async () => {
    let called = false;
    const client = makeClientStub({});
    const orig = client.from;
    client.from = ((...args: unknown[]) => { called = true; return orig(...args); }) as never;
    const r = await attachArticle({ client, materialId: "not-a-uuid", jsonText: VALID_ARTICLE });
    expect(r.ok).toBe(false);
    expect(called).toBe(false);
  });

  it("rejects invalid article JSON before the database update", async () => {
    const client = makeClientStub({ selectRow: { id: MATERIAL_ID }, updateRows: [{ id: MATERIAL_ID }] });
    const r = await attachArticle({ client, materialId: MATERIAL_ID, jsonText: "{broken" });
    expect(r.ok).toBe(false);
  });

  it("rejects an article with an unknown block type", async () => {
    const client = makeClientStub({ selectRow: { id: MATERIAL_ID } });
    const bad = JSON.stringify({ schemaVersion: 1, title: "x", blocks: [{ type: "iframe" }] });
    const r = await attachArticle({ client, materialId: MATERIAL_ID, jsonText: bad });
    expect(r.ok).toBe(false);
  });

  it("reports failure when the material does not exist", async () => {
    const client = makeClientStub({ selectRow: null });
    const r = await attachArticle({ client, materialId: MATERIAL_ID, jsonText: VALID_ARTICLE });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("غير موجودة");
  });

  it("succeeds on a valid article and a confirmed row update", async () => {
    const client = makeClientStub({ selectRow: { id: MATERIAL_ID }, updateRows: [{ id: MATERIAL_ID }] });
    const r = await attachArticle({ client, materialId: MATERIAL_ID, jsonText: VALID_ARTICLE });
    expect(r).toEqual({ ok: true });
  });

  it("reports failure on a zero-row update (no false success)", async () => {
    const client = makeClientStub({ selectRow: { id: MATERIAL_ID }, updateRows: [] });
    const r = await attachArticle({ client, materialId: MATERIAL_ID, jsonText: VALID_ARTICLE });
    expect(r.ok).toBe(false);
  });

  it("reports failure when the update is denied (RLS/authorization)", async () => {
    const client = makeClientStub({
      selectRow: { id: MATERIAL_ID },
      updateError: { message: "row-level security" },
    });
    const r = await attachArticle({ client, materialId: MATERIAL_ID, jsonText: VALID_ARTICLE });
    expect(r.ok).toBe(false);
  });
});
