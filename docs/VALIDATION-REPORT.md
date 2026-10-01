# Final Validation Report — V1

## Implemented (code complete)

- Full Next.js 15 App Router project (TypeScript strict, Tailwind, Zod, Vitest)
- Database schema + migrations: hierarchy, constraints, partial unique index,
  deferrable ordering, FK consistency (semester↔level), audit columns
- RLS on all 7 tables + Storage policies on private bucket `content-files`
- Private university-number → internal email lookup (restricted schema,
  service-role-only EXECUTE, safe search_path)
- Student + admin authentication with rate limiting, generic errors, server-side
  role/active verification
- Admin dashboard: students (provision/edit/activate/ban/reset password),
  levels, semesters, courses, content items, materials (upload w/ magic-byte
  validation, publish/archive, reorder), article JSON attach with Zod validation
- Student UI: dashboard, courses, content, material reading (article renderer +
  original file via 120s signed URLs), authorized Arabic-normalized search
- Security logging with secret redaction; CSP + security headers in next.config
- Unit tests: article schema, upload validation, Arabic normalization, Zod schemas
- Negative RLS test playbook (`tests/rls.test.sql`)

## Implemented but NOT executed in this environment

The build environment here has no Node runtime and no network access, so the
following must be run locally/CI and verified there:

- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run test` (unit tests — should pass as written)
- `npm run build`
- Applying `supabase/migrations/0001_init.sql` + `seed.sql` to a real project
- Executing `tests/rls.test.sql` negative scenarios against a test project

## Requires manual configuration

- Supabase project + the 3 environment variables
- First admin account (documented in README + DEPLOYMENT.md)
- Optional: Supabase CLI codegen for typed DB clients (the app uses
  hand-written interfaces in `lib/types.ts`)

## Known limitations (accepted for V1)

- Rate limiter is per-instance memory (single instance). Use Upstash Redis
  when scaling beyond one instance.
- Confirmation dialogs are native `window.confirm`.
- Search uses normalized `ILIKE` (PostgreSQL), not full-text tsvector —
  adequate for V1 volumes on the free tier.
- No PWA/offline (explicitly out of V1 scope).

## Not implemented (excluded by spec)

Exams, question banks, quizzes, public registration, public file sharing,
student messaging, payments, ads, AI APIs / auto PDF conversion, social
features, previous-level archives, "latest additions" sections.
