# المنصة الأكاديمية — Academic Platform V1

منصة موارد أكاديمية خاصة وآمنة لطلبة تقنية المعلومات.
Next.js 15 (App Router) · TypeScript strict · Supabase (PostgreSQL + Auth + Storage) · Tailwind CSS · Zod · Vitest

## المزايا

- دخول الطالب برقم الجامعة + كلمة المرور (لا يوجد تسجيل ذاتي).
- دخول منفصل للمدير عبر `/admin-login`.
- كل طالب يرى مستواه وفصله فقط — الحماية بـ RLS على مستوى قاعدة البيانات.
- مقررات ← محاور ← مواد (ملفات PDF/صور رسمية وملخصات طلابية بتمييز واضح).
- قارئ مقالات داخل الموقع من JSON مُتحقق منه (الملف الأصلي يبقى متاحاً).
- بحث مفهرس بصلاحيات، مع تطبيع عربي محافظ.
- تخزين خاص مع روابط موقعة قصيرة العمر (120 ثانية) والتحقق من البايتات السحرية للملفات.
- واجهة عربية RTL، متجاوبة، خفيفة على الجوال والإنترنت الضعيف.

## التشغيل المحلي

```bash
npm install
cp .env.example .env.local   # ثم املأ القيم من لوحة Supabase
# نفّذ supabase/migrations/0001_init.sql ثم supabase/seed.sql في SQL Editor
npm run dev
```

## أوامر الجودة

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## إنشاء أول مدير (يدوي — مرة واحدة)

1. Supabase Dashboard → Authentication → Add user (بريد + كلمة مرور قوية).
2. في SQL Editor:

```sql
insert into public.profiles (id, full_name, role)
values ('<AUTH_USER_UUID>', 'المدير العام', 'admin');
```

3. ادخل عبر `/admin-login`.

## مخطط المقال (للتحويل الخارجي من PDF)

```json
{
  "schemaVersion": 1,
  "title": "عنوان الملخص",
  "blocks": [
    { "type": "heading", "level": 2, "text": "…" },
    { "type": "paragraph", "text": "…" },
    { "type": "list", "ordered": false, "items": ["…"] },
    { "type": "definition", "term": "…", "definition": "…" },
    { "type": "note", "tone": "info", "text": "…" },
    { "type": "example", "title": "…", "text": "…" }
  ]
}
```

ارفع JSON من `/admin/materials` (زر "إرفاق نسخة قراءة") بعد رفع الملف الأصلي.

## الوثائق

- `docs/DEPLOYMENT.md` — خطوات النشر على Vercel + Supabase بالتفصيل.
- `docs/SECURITY.md` — نموذج التهديد، قرارات الأمان، وحدود V1.
- `docs/VALIDATION-REPORT.md` — ما تم التحقق منه وما يبقى يدوياً.
