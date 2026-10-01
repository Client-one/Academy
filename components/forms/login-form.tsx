"use client";

import { useActionState } from "react";
import { studentLogin, type AuthFormState } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(studentLogin, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <Field label="رقم الجامعة" htmlFor="university_id">
        <Input
          id="university_id"
          name="university_id"
          required
          autoComplete="username"
          inputMode="text"
          placeholder="مثال: 20231234"
          dir="ltr"
          className="text-right"
        />
      </Field>
      <Field label="كلمة المرور" htmlFor="password">
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "جارٍ الدخول…" : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
