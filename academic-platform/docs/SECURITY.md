# Security Model — Academic Platform V1

## Defense layers (in order of trust)

1. **PostgreSQL RLS** — the primary authorization boundary. Every table is
   RLS-enabled; policies check `is_admin()` / active-student status and
   semester ownership via `security definer` helpers (`search_path = ''`).
2. **Server-side guards** — `requireAdmin()` / `requireStudent()` run on every
   protected page and Server Action. Middleware only refreshes sessions and
   does coarse redirects; it is never the security mechanism.
3. **Zod validation** — every form input, route param usage, and article JSON
   is validated server-side. Mass assignment is prevented because inserts
   use explicit column lists built from parsed data only.
4. **Storage policies** — private bucket `content-files`; reads require
   `path_authorized_for_student(path)` which re-checks the full published
   chain and the student's own semester. Signed URLs live 120s.
5. **Defense in depth extras** — in-memory rate limiting on both logins,
   trigger blocking non-admin edits to role/university_id/level/semester/
   is_active, partial unique index on active university numbers.

## Authentication design

- Students log in with `university_id` + password. The mapping to the real
  Supabase Auth email happens only server-side through
  `app_private.student_auth_email()` — `EXECUTE` granted exclusively to
  `service_role`, inside a restricted schema with a safe `search_path`.
- Internal emails are random UUIDs at `@students.internal` — never derived
  from the university number.
- Identical generic error for wrong number / inactive account / wrong
  password (no account enumeration).
- Admins use a separate email+password login; role and active status are
  re-verified server-side after every sign-in.
- Deactivation sets `is_active = false` AND bans the Auth user
  (`ban_duration`), so existing sessions stop working immediately.
- DOCUMENTED LIMITATION: the Auth ban and the DB flag live in two systems
  and cannot be updated atomically. The flow changes Auth FIRST and only
  then the DB flag; if the DB write fails, the Auth change is compensated
  (reverted) and the admin gets an explicit failure — never a false
  success. A residual crash-between-the-two window can leave Auth banned
  while `is_active` is stale; recovery is to retry the toggle from the
  admin UI (reactivation unbans). Server-side checks consult the DB flag
  on every request, and RLS uses `is_active_student()`, so a stale DB flag
  can only keep a deactivated user blocked — never the reverse.

## Upload security

- Extension allowlist (pdf/jpg/jpeg/png/webp), 20MB cap, and magic-byte
  signature verification — browser MIME is never trusted.
- Two-phase commit: insert row (path='pending') → upload → update path.
  Failure at any step cleans up the other side (no orphan files/rows).
- Path format `{course_id}/{content_item_id}/{material_id}.{ext}` with UUID
  components validated implicitly by FK/RLS checks.

## Articles

- JSON is validated with a strict Zod discriminated union; unknown block
  types are rejected (fail-safe, no fallback rendering).
- Rendering is pure React JSX from validated data — `dangerouslySetInnerHTML`
  is never used anywhere in the codebase.
- Articles are re-validated defensively at read time before rendering.

## Logging

- Central `logInfo`/`logError` JSON logger with key-name redaction
  (password/token/secret/authorization/cookie/service-role/signed-url) and
  JWT-like string scrubbing. No stack traces or SQL internals go to the
  client; user-facing errors are generic Arabic messages.

## Known V1 limitations (documented, not hidden)

- Rate limiter is in-memory per instance → single-instance deployments only;
  move to Upstash Redis for multi-instance/serverless scaling.
- Confirmation dialogs use native `window.confirm`.
- No PWA/offline support (future scope per spec).
- Integration/RLS tests are provided as SQL/unit tests but must be executed
  against a real test Supabase project — they cannot run in CI here.
