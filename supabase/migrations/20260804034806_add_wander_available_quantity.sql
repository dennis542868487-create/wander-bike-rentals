alter table public.bike_listings
  add column if not exists available_quantity integer;

alter table public.bike_listings
  alter column available_quantity set default 1;

update public.bike_listings
set available_quantity = 1
where available_quantity is null;

alter table public.bike_listings
  alter column available_quantity set not null;

alter table public.bike_listings
  drop constraint if exists bike_listings_available_quantity_range;

alter table public.bike_listings
  add constraint bike_listings_available_quantity_range
  check (available_quantity between 0 and 1000);

alter table public.bike_listings
  drop constraint if exists bike_listings_community_quantity_one;

alter table public.bike_listings
  add constraint bike_listings_community_quantity_one
  check (source = 'wander' or available_quantity = 1);

comment on column public.bike_listings.available_quantity is
  'Operator-managed available count for Wander inventory. Community listings remain one bike per listing.';
