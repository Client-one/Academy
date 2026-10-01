"use client";

import { useActionState } from "react";
import { adminLogin, type AuthFormState } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(adminLogin, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <Field label="البريد الإلكتروني" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="username" dir="ltr" className="text-right" />
      </Field>
      <Field label="كلمة المرور" htmlFor="password">
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "جارٍ الدخول…" : "دخول المدير"}
      </Button>
    </form>
  );
}
