# Deployment Guide — Vercel + Supabase

## 0) Prerequisites

- Node.js 20+ and npm
- A Supabase account (Free tier works)
- A GitHub account + Vercel account

## 1) Supabase project setup

1. Create a new project at https://supabase.com (choose a strong DB password, store it).
2. Open **SQL Editor** and run, in order:
   1. The full contents of `supabase/migrations/0001_init.sql`
   2. Then `supabase/seed.sql`
3. Verify in **Table Editor**: `levels`, `semesters`, `courses`, `content_items`,
   `material_kinds`, `content_materials`, `profiles` exist, and
   `material_kinds` contains 3 rows.
4. Verify in **Storage**: a **private** bucket named `content-files` exists
   (created by the migration). Never toggle it public.

## 2) Auth configuration

1. **Authentication → Providers**: keep Email enabled.
2. **Settings → Auth**: you may disable "Confirm email" since admins provision
   accounts with `email_confirm: true` anyway.
3. No public signup exists in the app — but as extra hygiene you can leave
   "Allow new users to sign up" enabled in Supabase; orphaned Auth users
   without a `profiles` row cannot log in (guards reject them) and see
   nothing. Provisioning always creates both sides atomically.

## 3) Private university-number lookup

Already handled by the migration: `app_private.student_auth_email(text)`
with `EXECUTE` granted **only** to `service_role`. No dashboard step needed.

## 4) Environment variables

Copy `.env.example` → `.env.local` for local dev, and set the same three
variables in **Vercel → Project → Settings → Environment Variables**:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (secret!) |

Rules: never prefix the service key with `NEXT_PUBLIC_`, never commit real
values (`.gitignore` already excludes `.env*`), never log them.

## 5) Initial admin creation (manual, one time)

1. Supabase → Authentication → Users → **Add user** → create with a strong
   password (this is the real admin email used at `/admin-login`).
2. Copy the user's UUID, then in SQL Editor:

```sql
insert into public.profiles (id, full_name, role)
values ('<PASTE_UUID_HERE>', 'المدير العام', 'admin');
```

3. Log in at `https://your-app.vercel.app/admin-login`.

## 6) GitHub + Vercel deploy

1. Push the project to a GitHub repo (never push `.env.local`).
2. Vercel → **Add New Project** → import the repo. Framework preset: Next.js.
3. Add the three environment variables (all environments).
4. Deploy. Vercel runs `next build` automatically.

## 7) Post-deploy smoke tests

- [ ] `/login` rejects a wrong university number with a generic error
- [ ] Admin creates a student → student logs in → sees only own semester
- [ ] Student cannot open a course URL from another semester (404)
- [ ] Admin uploads a PDF → publishes → student opens it via signed link
- [ ] Student searches and gets no draft/archived results
- [ ] Deactivated student is denied immediately (session killed)
- [ ] Direct SQL as anon: `select app_private.student_auth_email('x')` → permission denied

## 8) Troubleshooting

- **"Invalid server environment variables"** → `SUPABASE_SERVICE_ROLE_KEY`
  missing locally or in Vercel.
- **RLS errors in admin UI** → you are not active/admin in `profiles`, or the
  migration did not run fully.
- **Upload fails** → bucket missing/private policy issue; check the migration
  applied and Storage shows `content-files` as private.
