-- The RETURNS TABLE output column `amount_cents` is also a PL/pgSQL variable.
-- Qualify the refund table aggregate so refund preparation can calculate the
-- pending balance without an ambiguous-column error.
do $migration$
declare
  v_function regprocedure := to_regprocedure(
    'public.commerce_prepare_stripe_refund(bigint,bigint,text,boolean,jsonb,uuid,uuid)'
  );
  v_definition text;
  v_fixed_definition text;
  v_ambiguous_clause constant text :=
    'select coalesce(sum(amount_cents), 0)';
  v_qualified_clause constant text :=
    'select coalesce(sum(public.refunds.amount_cents), 0)';
begin
  if v_function is null then
    raise exception 'commerce_prepare_stripe_refund function is missing';
  end if;

  select pg_get_functiondef(v_function)
  into v_definition;

  if position(v_qualified_clause in v_definition) > 0 then
    return;
  end if;

  if position(v_ambiguous_clause in v_definition) = 0 then
    raise exception
      'Expected ambiguous refund amount aggregate was not found';
  end if;

  v_fixed_definition := replace(
    v_definition,
    v_ambiguous_clause,
    v_qualified_clause
  );

  if position(v_ambiguous_clause in v_fixed_definition) > 0 then
    raise exception
      'Ambiguous refund amount aggregate was not fully replaced';
  end if;

  execute v_fixed_definition;
end;
$migration$;
