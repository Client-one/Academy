-- Idempotent seeds: material kinds only. No fake students, no fake content.
insert into public.material_kinds (code, name, description) values
  ('official_professor_pdf', 'ملف رسمي من الأستاذ', 'مادة رسمية يقدمها أستاذ المقرر بصيغة PDF.'),
  ('student_summary_pdf',  'ملخص طالب (PDF)',   'ملخص من إعداد الطلاب بصيغة PDF.'),
  ('student_summary_image','ملخص طالب (صور)',   'ملخصات مصورة أو ممسوحة ضوئياً من إعداد الطلاب.')
on conflict (code) do nothing;

-- Optional demo structure (levels/semesters) — uncomment if you want a quick
-- manual smoke test in a development project. Never use in production.
-- insert into public.levels (name, order_index) values ('المستوى الأول', 1)
--   on conflict do nothing;
-- insert into public.semesters (level_id, name, order_index)
--   select id, 'الفصل الأول', 1 from public.levels where name = 'المستوى الأول'
--   on conflict do nothing;
