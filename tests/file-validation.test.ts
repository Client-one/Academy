import { describe, expect, it } from "vitest";
import {
  detectKind,
  validateUpload,
  MAX_FILE_BYTES,
  EXTENSION_TO_KIND,
} from "@/lib/security/file-validation";

const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const webp = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const exe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);

describe("detectKind (magic bytes)", () => {
  it("detects PDF", () => expect(detectKind(pdf)).toBe("pdf"));
  it("detects JPEG", () => expect(detectKind(jpg)).toBe("jpg"));
  it("detects PNG", () => expect(detectKind(png)).toBe("png"));
  it("detects WEBP", () => expect(detectKind(webp)).toBe("webp"));
  it("returns null for unknown content", () => expect(detectKind(exe)).toBeNull());
  it("returns null for truncated input", () => expect(detectKind(new Uint8Array([0x25]))).toBeNull());
});

describe("validateUpload — supported combinations", () => {
  it.each([
    ["lecture.pdf", pdf, "pdf"],
    ["photo.jpg", jpg, "jpg"],
    ["photo.jpeg", jpg, "jpg"],
    ["image.png", png, "png"],
    ["image.webp", webp, "webp"],
  ] as const)("accepts %s with matching content", (name, bytes, kind) => {
    expect(validateUpload({ name, size: 1000 }, bytes)).toEqual({ ok: true, kind });
  });

  it("accepts uppercase extensions", () => {
    expect(validateUpload({ name: "LECTURE.PDF", size: 100 }, pdf).ok).toBe(true);
  });
});

describe("validateUpload — mismatches (must all be rejected)", () => {
  it.each([
    ["pdf-as-jpg.jpg", pdf],
    ["pdf-as-png.png", pdf],
    ["pdf-as-webp.webp", pdf],
    ["png-as-jpg.jpg", png],
    ["png-as-webp.webp", png],
    ["jpg-as-png.png", jpg],
    ["jpg-as-webp.webp", jpg],
    ["webp-as-jpg.jpg", webp],
    ["webp-as-png.png", webp],
  ] as const)("rejects %s", (name, bytes) => {
    expect(validateUpload({ name, size: 1000 }, bytes).ok).toBe(false);
  });
});

describe("validateUpload — unknown types", () => {
  it("rejects unknown extensions", () => {
    expect(validateUpload({ name: "a.exe", size: 100 }, pdf).ok).toBe(false);
    expect(validateUpload({ name: "a.svg", size: 100 }, png).ok).toBe(false);
    expect(validateUpload({ name: "a.gif", size: 100 }, jpg).ok).toBe(false);
    expect(validateUpload({ name: "noext", size: 100 }, pdf).ok).toBe(false);
  });
  it("rejects known extension with unknown signature", () => {
    expect(validateUpload({ name: "a.pdf", size: 100 }, exe).ok).toBe(false);
    expect(validateUpload({ name: "a.png", size: 100 }, exe).ok).toBe(false);
  });
});

describe("validateUpload — size rules (unchanged)", () => {
  it("rejects empty files", () => {
    expect(validateUpload({ name: "a.pdf", size: 0 }, pdf).ok).toBe(false);
  });
  it("rejects files over the 20MB limit", () => {
    expect(validateUpload({ name: "a.pdf", size: MAX_FILE_BYTES + 1 }, pdf).ok).toBe(false);
  });
  it("accepts files at the limit", () => {
    expect(validateUpload({ name: "a.pdf", size: MAX_FILE_BYTES }, pdf).ok).toBe(true);
  });
});

describe("EXTENSION_TO_KIND mapping", () => {
  it("contains exactly the five declared combinations", () => {
    expect(EXTENSION_TO_KIND).toEqual({ pdf: "pdf", jpg: "jpg", jpeg: "jpg", png: "png", webp: "webp" });
  });
});
