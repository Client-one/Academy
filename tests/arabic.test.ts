import { describe, expect, it } from "vitest";
import { normalizeArabic, escapeLike } from "@/lib/validation/arabic";

describe("normalizeArabic", () => {
  it("normalizes alef variants", () => {
    expect(normalizeArabic("أإآٱ")).toBe("اااا");
  });
  it("normalizes yeh/taa-marbuta", () => {
    expect(normalizeArabic("رحى هامة")).toBe("رحي هامه");
  });
  it("strips diacritics and tatweel", () => {
    expect(normalizeArabic("كـتــابٌ")).toBe("كتاب");
  });
  it("collapses whitespace and lowercases", () => {
    expect(normalizeArabic("  AbC   def ")).toBe("abc def");
  });
});

describe("escapeLike", () => {
  it("escapes % and _ wildcards", () => {
    expect(escapeLike("100%_done\\")).toBe("100\\%\\_done\\\\");
  });
});
