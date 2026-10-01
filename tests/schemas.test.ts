import { describe, expect, it } from "vitest";
import {
  courseSchema, studentCreateSchema, universityIdSchema, searchQuerySchema,
} from "@/lib/validation/schemas";

describe("validation schemas", () => {
  it("accepts a valid university number", () => {
    expect(universityIdSchema.safeParse("2023-ABC_99").success).toBe(true);
  });
  it("rejects university numbers with unsafe characters", () => {
    expect(universityIdSchema.safeParse("12' OR '1'='1").success).toBe(false);
  });
  it("rejects short passwords", () => {
    expect(studentCreateSchema.safeParse({
      full_name: "طالب تجريبي", university_id: "2023001",
      password: "123", semester_id: crypto.randomUUID(),
    }).success).toBe(false);
  });
  it("rejects course codes outside the safe pattern", () => {
    expect(courseSchema.safeParse({
      semester_id: crypto.randomUUID(), name: "شبكات", code: "CS; DROP TABLE", description: "",
    }).success).toBe(false);
  });
  it("rejects empty search queries", () => {
    expect(searchQuerySchema.safeParse("").success).toBe(false);
  });
  it("accepts exactly at the 120-char boundary", () => {
    expect(searchQuerySchema.safeParse("x".repeat(120)).success).toBe(true);
  });
  it("rejects oversized (very long) search queries", () => {
    expect(searchQuerySchema.safeParse("x".repeat(121)).success).toBe(false);
    expect(searchQuerySchema.safeParse("ن".repeat(1000)).success).toBe(false);
  });
  it("trims whitespace-only queries to empty (rejected)", () => {
    expect(searchQuerySchema.safeParse("   ").success).toBe(false);
  });
});
