/**
 * Upload validation: extension allowlist, size limit, and magic-byte
 * signature verification. The browser's MIME declaration is never trusted
 * and the filename extension alone is never sufficient — the detected
 * signature must exactly match the extension's declared kind.
 */

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // ~20 MB

export type DetectedKind = "pdf" | "jpg" | "png" | "webp";

/**
 * Strict, explicit extension → expected-signature mapping.
 * ".jpeg" and ".jpg" both declare JPEG content; nothing else is accepted.
 */
export const EXTENSION_TO_KIND: Record<string, DetectedKind> = {
  pdf: "pdf",
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

export const ALLOWED_EXTENSIONS: readonly string[] = Object.keys(EXTENSION_TO_KIND);

const MIME_BY_KIND: Record<DetectedKind, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function detectKind(bytes: Uint8Array): DetectedKind | null {
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "pdf";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

export type UploadValidation =
  | { ok: true; kind: DetectedKind }
  | { ok: false; error: string };

export function validateUpload(
  file: { name: string; size: number },
  bytes: Uint8Array
): UploadValidation {
  if (file.size <= 0) return { ok: false, error: "الملف فارغ." };
  if (file.size > MAX_FILE_BYTES) return { ok: false, error: "حجم الملف يتجاوز 20 ميغابايت." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const expectedKind = EXTENSION_TO_KIND[ext];
  if (!expectedKind) {
    return { ok: false, error: "صيغة الملف غير مسموحة (المسموح: PDF, JPG, PNG, WEBP)." };
  }

  const kind = detectKind(bytes);
  if (!kind) return { ok: false, error: "محتوى الملف غير معروف أو تالف." };
  if (kind !== expectedKind) {
    return { ok: false, error: "تعارض بين امتداد الملف ومحتواه الفعلي." };
  }
  return { ok: true, kind };
}

export function mimeForKind(kind: DetectedKind): string {
  return MIME_BY_KIND[kind];
}
