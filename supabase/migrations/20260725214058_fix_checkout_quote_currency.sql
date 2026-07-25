-- The RETURNS TABLE output column `currency` is also a PL/pgSQL variable.
-- Qualify the shipping quote column so checkout can compile and run without an
-- ambiguous-column error. The guarded replacement keeps the forward migration
-- small while preserving the reviewed checkout transaction body byte-for-byte.
do $migration$
declare
  v_function regprocedure := to_regprocedure(
    'public.commerce_create_checkout_order(text,text,text,text,jsonb,uuid,text,text,uuid,text,jsonb,jsonb,uuid,bigint,bigint,text,timestamptz,text)'
  );
  v_definition text;
  v_fixed_definition text;
  v_ambiguous_clause constant text := 'and currency = ''CAD''';
  v_qualified_clause constant text :=
    'and public.shipping_quotes.currency = ''CAD''';
begin
  if v_function is null then
    raise exception 'commerce_create_checkout_order function is missing';
  end if;

  select pg_get_functiondef(v_function)
  into v_definition;

  if position(v_qualified_clause in v_definition) > 0 then
    return;
  end if;

  if position(v_ambiguous_clause in v_definition) = 0 then
    raise exception
      'Expected ambiguous shipping quote currency clause was not found';
  end if;

  v_fixed_definition := replace(
    v_definition,
    v_ambiguous_clause,
    v_qualified_clause
  );

  if position(v_ambiguous_clause in v_fixed_definition) > 0 then
    raise exception
      'Ambiguous shipping quote currency clause was not fully replaced';
  end if;

  execute v_fixed_definition;
end;
$migration$;
