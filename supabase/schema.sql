-- Run this once in the Supabase SQL Editor for the Wander Bike project.
create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 40),
  email text not null check (char_length(email) between 3 and 160),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  adult_bikes smallint not null default 0 check (adult_bikes between 0 and 20),
  kids_bikes smallint not null default 0 check (kids_bikes between 0 and 20),
  trailers smallint not null default 0 check (trailers between 0 and 20),
  notes text check (char_length(notes) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_time_order check (ends_at > starts_at),
  constraint booking_has_item check (adult_bikes + kids_bikes + trailers > 0)
);

create index if not exists bookings_starts_at_idx on public.bookings (starts_at);
create index if not exists bookings_status_idx on public.bookings (status);

create or replace function public.set_booking_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_booking_updated_at();

revoke execute on function public.set_booking_updated_at() from public, anon, authenticated;

alter table public.bookings enable row level security;
revoke all on table public.bookings from anon, authenticated;
grant all on table public.bookings to service_role;

comment on table public.bookings is 'Private Wander Bike online booking requests. Accessed only by trusted server routes.';

-- Customer accounts and staff authorization roles.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant all on table public.profiles to service_role;

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
    nullif(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      updated_at = now();
  return new;
end;
$$;

revoke execute on function private.sync_auth_user_profile() from public, anon, authenticated;

drop trigger if exists sync_auth_user_profile on auth.users;
create trigger sync_auth_user_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function private.sync_auth_user_profile();

insert into public.profiles (id, email, full_name)
select id, coalesce(email, ''), nullif(coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', ''), '')
from auth.users
on conflict (id) do nothing;

alter table public.bookings
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.bookings alter column user_id set not null;
create index if not exists bookings_user_id_idx on public.bookings (user_id);

comment on table public.profiles is 'Private application profiles and authorization roles. Server access only.';
comment on column public.profiles.role is 'Authorization role managed by trusted staff only.';
