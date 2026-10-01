import { describe, expect, it } from "vitest";
import { parseArticle } from "@/lib/articles/schema";

const valid = {
  schemaVersion: 1,
  title: "مقدمة في الشبكات",
  blocks: [
    { type: "heading", level: 2, text: "ما هي الشبكة؟" },
    { type: "paragraph", text: "الشبكة هي مجموعة عقد مترابطة." },
    { type: "list", ordered: false, items: ["عقدة", "رابط", "بروتوكول"] },
    { type: "definition", term: "البروتوكول", definition: "اتفاقية قواعد الاتصال بين الأنظمة." },
    { type: "note", tone: "warning", text: "انتبه لهذا المفهوم." },
    { type: "example", title: "شبكة منزلية", text: "مثال توضيحي بسيط." },
  ],
};

describe("parseArticle", () => {
  it("accepts a valid article with all V1 block types", () => {
    expect(parseArticle(JSON.stringify(valid)).ok).toBe(true);
  });
  it("rejects unknown block types (fails safely, no silent fallback)", () => {
    const bad = { ...valid, blocks: [{ type: "iframe", src: "https://evil.example" }] };
    expect(parseArticle(JSON.stringify(bad)).ok).toBe(false);
  });
  it("rejects invalid JSON text", () => {
    expect(parseArticle("{not json").ok).toBe(false);
  });
  it("rejects wrong schemaVersion", () => {
    expect(parseArticle(JSON.stringify({ ...valid, schemaVersion: 2 })).ok).toBe(false);
  });
  it("keeps HTML-looking text as inert text (renderer escapes it via React)", () => {
    const xss = { ...valid, blocks: [{ type: "paragraph", text: "<script>alert(1)</script>" }] };
    const r = parseArticle(JSON.stringify(xss));
    expect(r.ok).toBe(true);
  });
});
