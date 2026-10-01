-- ============================================================================
-- 0003_harden_move_item.sql
--
-- Hardens public.move_item against concurrent reorder operations:
--   * Row-level locks (FOR UPDATE) on the moved row and its neighbor, so two
--     concurrent swaps of the same rows serialize instead of interleaving.
--   * A transaction-scoped advisory lock per ordered list (derived from the
--     parent key), so two movers working on the SAME list serialize, while
--     disjoint lists stay fully concurrent.
--
-- The existing deferrable unique constraints remain the final correctness
-- guarantee: any interleaving that still produces a duplicate order_index
-- fails at COMMIT time, so the database can never persist invalid ordering.
-- The ordering system itself is unchanged (neighbor swap, +/-1 only).
-- ============================================================================

begin;

create or replace function public.move_item(p_kind text, p_id uuid, p_delta integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order integer;
  v_neighbor uuid;
  v_parent uuid;
begin
  if not public.is_admin() then
    raise exception 'not permitted';
  end if;
  if p_delta <> 1 and p_delta <> -1 then
    raise exception 'invalid delta';
  end if;

  if p_kind = 'level' then
    select order_index into v_order from public.levels where id = p_id for update;
    if v_order is null then raise exception 'not found'; end if;
    -- levels share one global list
    perform pg_advisory_xact_lock(hashtextextended('move:level', 0));
    select id into v_neighbor from public.levels
      where order_index = v_order + p_delta order by order_index limit 1 for update;
    if v_neighbor is null then return; end if;
    update public.levels set order_index = order_index + p_delta where id = p_id;
    update public.levels set order_index = order_index - p_delta where id = v_neighbor;
  elsif p_kind = 'semester' then
    select order_index, level_id into v_order, v_parent from public.semesters where id = p_id for update;
    if v_order is null then raise exception 'not found'; end if;
    perform pg_advisory_xact_lock(hashtextextended('move:semester:' || v_parent::text, 0));
    select id into v_neighbor from public.semesters
      where level_id = v_parent and order_index = v_order + p_delta limit 1 for update;
    if v_neighbor is null then return; end if;
    update public.semesters set order_index = order_index + p_delta where id = p_id;
    update public.semesters set order_index = order_index - p_delta where id = v_neighbor;
  elsif p_kind = 'course' then
    select order_index, semester_id into v_order, v_parent from public.courses where id = p_id for update;
    if v_order is null then raise exception 'not found'; end if;
    perform pg_advisory_xact_lock(hashtextextended('move:course:' || v_parent::text, 0));
    select id into v_neighbor from public.courses
      where semester_id = v_parent and order_index = v_order + p_delta limit 1 for update;
    if v_neighbor is null then return; end if;
    update public.courses set order_index = order_index + p_delta where id = p_id;
    update public.courses set order_index = order_index - p_delta where id = v_neighbor;
  elsif p_kind = 'content_item' then
    select order_index, course_id into v_order, v_parent from public.content_items where id = p_id for update;
    if v_order is null then raise exception 'not found'; end if;
    perform pg_advisory_xact_lock(hashtextextended('move:content_item:' || v_parent::text, 0));
    select id into v_neighbor from public.content_items
      where course_id = v_parent and order_index = v_order + p_delta limit 1 for update;
    if v_neighbor is null then return; end if;
    update public.content_items set order_index = order_index + p_delta where id = p_id;
    update public.content_items set order_index = order_index - p_delta where id = v_neighbor;
  elsif p_kind = 'material' then
    select order_index, content_item_id into v_order, v_parent from public.content_materials where id = p_id for update;
    if v_order is null then raise exception 'not found'; end if;
    perform pg_advisory_xact_lock(hashtextextended('move:material:' || v_parent::text, 0));
    select id into v_neighbor from public.content_materials
      where content_item_id = v_parent and order_index = v_order + p_delta limit 1 for update;
    if v_neighbor is null then return; end if;
    update public.content_materials set order_index = order_index + p_delta where id = p_id;
    update public.content_materials set order_index = order_index - p_delta where id = v_neighbor;
  else
    raise exception 'unknown kind';
  end if;
end;
$$;

commit;
