"use client";

import { useActionState, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export type FormAction = (formData: FormData) => Promise<{ error?: string; success?: string } | void>;

/**
 * Generic server-action form wrapper: pending state, error/success feedback.
 * Lets admin pages stay Server Components while getting client UX.
 */
export function ActionForm({
  action,
  children,
  submitLabel = "حفظ",
  className = "",
}: {
  action: FormAction;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string }, formData: FormData) =>
      (await action(formData)) ?? {},
    {}
  );

  return (
    <form action={formAction} className={`space-y-4 ${className}`}>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      {children}
      <Button type="submit" disabled={pending}>
        {pending ? "جارٍ الحفظ…" : submitLabel}
      </Button>
    </form>
  );
}
