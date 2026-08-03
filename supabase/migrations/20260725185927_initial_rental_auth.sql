-- Wander Bike rental/auth baseline.
-- Commerce inventory is intentionally introduced in the following migration so
-- rental availability and retail stock can never be mutated by the same code.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
grant execute on function private.set_updated_at() to service_role;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer'
    check (role in ('customer', 'staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_length check (char_length(email) between 3 and 320),
  constraint profiles_full_name_length check (
    full_name is null or char_length(full_name) between 1 and 120
  )
);

create index if not exists profiles_role_idx
  on public.profiles (role)
  where role in ('staff', 'admin');

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create or replace function private.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      ),
      ''
    )
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      updated_at = now();

  return new;
end;
$$;

revoke all on function private.sync_auth_user_profile() from public, anon, authenticated;
grant execute on function private.sync_auth_user_profile() to service_role;

drop trigger if exists sync_auth_user_profile on auth.users;
create trigger sync_auth_user_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function private.sync_auth_user_profile();

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  phone text not null,
  email text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  adult_bikes smallint not null default 0,
  kids_bikes smallint not null default 0,
  trailers smallint not null default 0,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_customer_name_length
    check (char_length(customer_name) between 2 and 100),
  constraint bookings_phone_length check (char_length(phone) between 7 and 40),
  constraint bookings_email_length check (char_length(email) between 3 and 320),
  constraint bookings_adult_quantity check (adult_bikes between 0 and 20),
  constraint bookings_kids_quantity check (kids_bikes between 0 and 20),
  constraint bookings_trailer_quantity check (trailers between 0 and 20),
  constraint bookings_notes_length check (notes is null or char_length(notes) <= 1000),
  constraint bookings_time_order check (ends_at > starts_at),
  constraint bookings_has_item check (adult_bikes + kids_bikes + trailers > 0)
);

create index if not exists bookings_user_starts_idx
  on public.bookings (user_id, starts_at desc);
create index if not exists bookings_status_starts_idx
  on public.bookings (status, starts_at);

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function private.set_updated_at();

drop function if exists public.set_booking_updated_at();

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.bookings enable row level security;
alter table public.bookings force row level security;

revoke all on table public.profiles, public.bookings from public, anon, authenticated;
grant all on table public.profiles, public.bookings to service_role;

comment on table public.profiles is
  'Application profile and authorization role. Writes are server-only.';
comment on column public.profiles.role is
  'Authorization role managed by trusted Wander Bike administrators.';
comment on table public.bookings is
  'Private bike rental reservations. Retail inventory is stored separately.';
