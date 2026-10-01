export function Spinner({ label = "جارٍ التحميل…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" aria-hidden />
      <span className="text-sm font-medium text-ink-600">{label}</span>
    </div>
  );
}
