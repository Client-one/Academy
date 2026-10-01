"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

/**
 * Confirmation-gated action button (native confirm dialog for V1 —
 * styled modal dialogs are a documented future refinement).
 */
export function ConfirmButton({
  action,
  confirmMessage,
  label,
  variant = "secondary",
  size = "sm",
}: {
  action: () => Promise<{ error?: string } | void>;
  confirmMessage: string;
  label: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={variant}
      size={size}
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(async () => {
            await action();
          });
        }
      }}
    >
      {pending ? "…" : label}
    </Button>
  );
}
