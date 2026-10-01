-- ============================================================================
-- 0002_search_normalization.sql
--
-- Adds canonical Arabic normalization at the DATABASE level so that the
-- normalized query (lib/validation/arabic.ts) matches stored text regardless
-- of which equivalent form was used when the content was written.
--
-- Approach (smallest safe change):
--   1. One IMMUTABLE SQL function implementing the SAME rules as the TS
--      normalizeArabic(): strip diacritics/tatweel, fold أإآٱ→ا, ى→ي, ة→ه,
--      collapse whitespace, lowercase.
--   2. STORED GENERATED columns on the student-searchable text fields.
--      Generated columns are computed by PostgreSQL itself: existing rows are
--      backfilled automatically on ALTER, and future INSERT/UPDATE are kept
--      in sync automatically — no triggers, no application writes needed.
--   3. Plain btree indexes on the new columns (justified: they are the
--      lookup target for ILIKE prefix-less scans filtered by RLS).
--
-- Original/display columns are untouched.
-- ============================================================================

begin;

create or replace function public.normalize_arabic(p_value text)
returns text
language sql
immutable
as $$
  select lower(
    trim(both ' ' from
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(coalesce(p_value, ''),
                '[\u064B-\u0652\u0670\u0640]', '', 'g'),      -- harakat + dagger alef + tatweel
              '[أإآٱ]', 'ا', 'g'),
            'ى', 'ي', 'g'),
          'ة', 'ه', 'g'),
        '[[:space:]]+', ' ', 'g'))
  );
$$;

comment on function public.normalize_arabic(text) is
  'Canonical Arabic normalization — must stay in sync with lib/validation/arabic.ts (TS).';

-- courses
alter table public.courses
  add column name_normalized text generated always as (public.normalize_arabic(name)) stored,
  add column description_normalized text generated always as (public.normalize_arabic(description)) stored;

-- content_items
alter table public.content_items
  add column title_normalized text generated always as (public.normalize_arabic(title)) stored,
  add column description_normalized text generated always as (public.normalize_arabic(description)) stored;

-- content_materials
alter table public.content_materials
  add column title_normalized text generated always as (public.normalize_arabic(title)) stored,
  add column description_normalized text generated always as (public.normalize_arabic(description)) stored;

-- Indexes (backfilled automatically by stored generated columns)
create index courses_name_normalized_idx on public.courses (name_normalized);
create index courses_description_normalized_idx on public.courses (description_normalized);
create index content_items_title_normalized_idx on public.content_items (title_normalized);
create index content_items_description_normalized_idx on public.content_items (description_normalized);
create index content_materials_title_normalized_idx on public.content_materials (title_normalized);
create index content_materials_description_normalized_idx on public.content_materials (description_normalized);

commit;
