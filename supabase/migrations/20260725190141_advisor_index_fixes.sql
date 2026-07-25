-- Cover foreign-key columns used by joins and cascading relationship checks.
-- The Supabase database advisor reports these explicitly on a fresh project.

create index if not exists inventory_ledger_location_idx
  on public.inventory_ledger (location_id);

create index if not exists inventory_reservations_location_idx
  on public.inventory_reservations (location_id);

create index if not exists returns_requested_by_idx
  on public.returns (requested_by)
  where requested_by is not null;

create index if not exists shipping_quotes_location_idx
  on public.shipping_quotes (location_id);

create index if not exists store_settings_updated_by_idx
  on public.store_settings (updated_by)
  where updated_by is not null;
