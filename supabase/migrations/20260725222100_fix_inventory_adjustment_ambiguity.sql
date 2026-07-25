-- Qualify inventory columns that overlap with RETURNS TABLE output variables.
-- Without this, PostgreSQL resolves `variant_id` in ON CONFLICT ambiguously and
-- every staff adjustment fails before any inventory or ledger row is mutated.
create or replace function public.commerce_adjust_inventory(
  p_variant_id bigint,
  p_location_id bigint,
  p_delta_on_hand integer,
  p_reason text,
  p_actor_user_id uuid
)
returns table (
  variant_id bigint,
  location_id bigint,
  on_hand integer,
  reserved integer,
  available integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_level public.inventory_levels%rowtype;
begin
  if p_delta_on_hand = 0 then
    raise exception 'Inventory adjustment cannot be zero'
      using errcode = '22023';
  end if;

  if nullif(trim(p_reason), '') is null then
    raise exception 'Inventory adjustment reason is required'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.profiles as profile
    where profile.id = p_actor_user_id
      and profile.role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required'
      using errcode = '42501';
  end if;

  insert into public.inventory_levels (variant_id, location_id)
  values (p_variant_id, p_location_id)
  on conflict on constraint inventory_levels_pkey do nothing;

  select level.*
  into v_level
  from public.inventory_levels as level
  where level.variant_id = p_variant_id
    and level.location_id = p_location_id
  for update;

  if (v_level.on_hand + p_delta_on_hand) < 0
    or (
      not v_level.allow_backorder
      and (v_level.on_hand + p_delta_on_hand) < v_level.reserved
    )
  then
    raise exception 'Inventory adjustment would invalidate reservations'
      using errcode = '23514';
  end if;

  update public.inventory_levels as level
  set on_hand = level.on_hand + p_delta_on_hand
  where level.variant_id = p_variant_id
    and level.location_id = p_location_id
  returning level.* into v_level;

  insert into public.inventory_ledger (
    variant_id,
    location_id,
    actor_user_id,
    event_type,
    delta_on_hand,
    reason
  )
  values (
    p_variant_id,
    p_location_id,
    p_actor_user_id,
    'adjust',
    p_delta_on_hand,
    left(trim(p_reason), 500)
  );

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    after_state,
    metadata
  )
  values (
    p_actor_user_id,
    'inventory_adjusted',
    'product_variant',
    p_variant_id::text,
    jsonb_build_object(
      'location_id', p_location_id,
      'on_hand', v_level.on_hand,
      'reserved', v_level.reserved,
      'available', v_level.available
    ),
    jsonb_build_object(
      'delta_on_hand', p_delta_on_hand,
      'reason', left(trim(p_reason), 500)
    )
  );

  return query
  select
    v_level.variant_id,
    v_level.location_id,
    v_level.on_hand,
    v_level.reserved,
    v_level.available;
end;
$$;

revoke all on function public.commerce_adjust_inventory(
  bigint,
  bigint,
  integer,
  text,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_adjust_inventory(
  bigint,
  bigint,
  integer,
  text,
  uuid
) to service_role;
