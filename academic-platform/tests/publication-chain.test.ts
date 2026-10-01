import { describe, expect, it } from "vitest";
import { chainAllowsStudent } from "@/lib/data/materials";

describe("chainAllowsStudent — required publication states", () => {
  it("case 1: course draft + content published + material published → denied", () => {
    expect(chainAllowsStudent("draft", "published", "published")).toBe(false);
  });
  it("case 2: course published + content draft + material published → denied", () => {
    expect(chainAllowsStudent("published", "draft", "published")).toBe(false);
  });
  it("case 3: course published + content published + material draft → denied", () => {
    expect(chainAllowsStudent("published", "published", "draft")).toBe(false);
  });
  it("case 4: all published → allowed", () => {
    expect(chainAllowsStudent("published", "published", "published")).toBe(true);
  });
  it("archived anywhere in the chain → denied", () => {
    expect(chainAllowsStudent("archived", "published", "published")).toBe(false);
    expect(chainAllowsStudent("published", "archived", "published")).toBe(false);
    expect(chainAllowsStudent("published", "published", "archived")).toBe(false);
  });
});
