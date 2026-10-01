export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-white/60 px-6 py-12 text-center">
      <div className="mb-2 text-4xl" aria-hidden>📚</div>
      <p className="font-bold text-ink-800">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-500">{hint}</p>}
    </div>
  );
}
