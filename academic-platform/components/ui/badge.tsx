type Tone = "official" | "student" | "draft" | "archived" | "published" | "neutral";

const tones: Record<Tone, string> = {
  official: "bg-sky-100 text-sky-900 border-sky-300",
  student: "bg-amber-100 text-amber-900 border-amber-300",
  draft: "bg-ink-100 text-ink-600 border-ink-300",
  archived: "bg-ink-200 text-ink-700 border-ink-300",
  published: "bg-emerald-100 text-emerald-900 border-emerald-300",
  neutral: "bg-brand-50 text-brand-900 border-brand-200",
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export const statusTone = (status: string): Tone =>
  status === "published" ? "published" : status === "archived" ? "archived" : "draft";

export const statusLabel = (status: string): string =>
  status === "published" ? "منشور" : status === "archived" ? "مؤرشف" : "مسودة";
