import { describe, expect, it } from "vitest";
import { escapeOrValue, ilikePattern, buildOrFilter } from "@/lib/validation/postgrest-escaping";

describe("escapeOrValue", () => {
  it("leaves a normal Arabic/Latin term untouched", () => {
    expect(escapeOrValue("الشبكات")).toBe("الشبكات");
    expect(escapeOrValue("CS101")).toBe("CS101");
  });
  it("escapes LIKE wildcards", () => {
    expect(escapeOrValue("100%")).toBe("100\\%");
    expect(escapeOrValue("under_score")).toBe("under\\_score");
  });
  it("escapes the escape character itself", () => {
    expect(escapeOrValue("a\\b")).toBe("a\\\\b");
  });
  it("escapes .or() clause separators and grouping", () => {
    expect(escapeOrValue("a,b")).toBe("a\\,b");
    expect(escapeOrValue("(x)")).toBe("\\(x\\)");
  });
  it("neutralizes malicious filter-like input", () => {
    const malicious = "x),status.eq.published,(";
    const escaped = escapeOrValue(malicious);
    expect(escaped).not.toContain("),status");
    expect(escaped).toBe("x\\)\\,status\\.eq\\.published\\,\\(".replace(/\\\./g, "."));
  });
  it("keeps dots literal (PostgREST value-level dots are safe)", () => {
    expect(escapeOrValue("v1.2")).toBe("v1.2");
  });
});

describe("ilikePattern", () => {
  it("wraps in % and escapes specials", () => {
    expect(ilikePattern(" networks_101 ")).toBe("% networks\\_101 %");
  });
});

describe("buildOrFilter", () => {
  it("builds a comma-joined ilike clause over the allowlist", () => {
    expect(buildOrFilter(["name", "code"], "شبكات")).toBe("name.ilike.%شبكات%,code.ilike.%شبكات%");
  });
  it("escapes the term consistently across every clause", () => {
    const filter = buildOrFilter(["a", "b"], "x%),(y");
    expect(filter.split(",")).toHaveLength(2); // term did not create extra clauses
    expect(filter).toBe("a.ilike.%x\\%\\)\\,\\(y%,b.ilike.%x\\%\\)\\,\\(y%");
  });
  it("handles very long input without breaking structure", () => {
    const long = "ن".repeat(5000);
    const filter = buildOrFilter(["title"], long);
    expect(filter.startsWith("title.ilike.%")).toBe(true);
    expect(filter.endsWith("%")).toBe(true);
  });
});
