export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: React.ReactNode }) {
  const cls =
    kind === "error"
      ? "border-red-300 bg-red-50 text-red-900"
      : kind === "success"
        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
        : "border-sky-300 bg-sky-50 text-sky-900";
  return (
    <div role="alert" className={`rounded-xl border p-3 text-sm font-medium ${cls}`}>
      {children}
    </div>
  );
}
