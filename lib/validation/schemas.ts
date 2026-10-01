import { z } from "zod";

export const universityIdSchema = z
  .string()
  .trim()
  .min(2, "رقم الجامعة قصير جداً")
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, "رقم الجامعة يجب أن يحتوي أحرفاً وأرقاماً فقط");

export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور 8 أحرف على الأقل")
  .max(128);

export const studentLoginSchema = z.object({
  university_id: universityIdSchema,
  password: z.string().min(1, "أدخل كلمة المرور").max(128),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(254),
  password: z.string().min(1).max(128),
});

export const studentCreateSchema = z.object({
  full_name: z.string().trim().min(2).max(200),
  university_id: universityIdSchema,
  password: passwordSchema,
  semester_id: z.string().uuid(),
});

export const studentUpdateSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(200),
  university_id: universityIdSchema,
  semester_id: z.string().uuid(),
});

export const resetPasswordSchema = z.object({
  id: z.string().uuid(),
  password: passwordSchema,
});

export const levelSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
});

export const semesterSchema = z.object({
  id: z.string().uuid().optional(),
  level_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
});

export const courseSchema = z.object({
  id: z.string().uuid().optional(),
  semester_id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(32).regex(/^[A-Za-z0-9_-]+$/),
  description: z.string().trim().max(2000).default(""),
});

export const contentItemSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
});

export const materialSchema = z.object({
  id: z.string().uuid().optional(),
  content_item_id: z.string().uuid(),
  material_kind_id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
});

export const idSchema = z.object({ id: z.string().uuid() });

export const setStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "published", "archived"]),
});

export const moveSchema = z.object({
  kind: z.enum(["level", "semester", "course", "content_item", "material"]),
  id: z.string().uuid(),
  delta: z.union([z.literal(1), z.literal(-1)]),
});

export const searchQuerySchema = z
  .string()
  .trim()
  .min(1, "اكتب كلمة للبحث")
  .max(120);

export const articleUploadSchema = z.object({
  material_id: z.string().uuid(),
  json: z.string().min(10).max(400_000),
});

export type ActionResult = { error?: string; success?: string };
