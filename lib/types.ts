export type Role = "student" | "admin";
export type Status = "draft" | "published" | "archived";

export interface Profile {
  id: string;
  full_name: string;
  university_id: string | null;
  role: Role;
  level_id: string | null;
  semester_id: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: string; name: string; order_index: number;
  created_at: string; updated_at: string;
}

export interface Semester {
  id: string; level_id: string; name: string; order_index: number;
  created_at: string; updated_at: string;
}

export interface Course {
  id: string; semester_id: string; name: string; code: string;
  description: string; order_index: number; status: Status;
  created_at: string; updated_at: string;
}

export interface ContentItem {
  id: string; course_id: string; title: string; description: string;
  order_index: number; status: Status;
  created_at: string; updated_at: string;
}

export interface MaterialKind {
  id: string; code: string; name: string; description: string;
}

export interface ContentMaterial {
  id: string; content_item_id: string; material_kind_id: string;
  title: string; description: string; storage_path: string | null;
  status: Status; order_index: number; created_by: string | null;
  created_at: string; updated_at: string;
  article: unknown | null;
}

export const MATERIAL_KIND_META: Record<string, { label: string; badge: "official" | "student" }> = {
  official_professor_pdf: { label: "رسمي — من الأستاذ", badge: "official" },
  student_summary_pdf: { label: "ملخص طالب — PDF", badge: "student" },
  student_summary_image: { label: "ملخص طالب — صور", badge: "student" },
};
