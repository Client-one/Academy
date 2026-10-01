export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink-800">
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
