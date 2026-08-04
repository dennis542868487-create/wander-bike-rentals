-- Wander Bike marketplace foundation.
-- Production migration timestamp: 20260729223000.
--
-- The existing commerce tables are intentionally left untouched in this
-- migration because they contain sandbox history and are referenced by the
-- already-applied migration chain. New application code uses only the
-- marketplace tables below. A later, separately approved archival migration
-- can remove legacy commerce data after a backup.

create extension if not exists btree_gist;

alter table public.profiles
  add column if not exists phone text,
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists marketplace_access_status text not null default 'active',
  add column if not exists marketplace_access_reason text,
  add column if not exists marketplace_access_changed_by uuid references auth.users(id) on delete set null,
  add column if not exists marketplace_access_changed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_phone_length'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_phone_length
      check (phone is null or char_length(phone) between 7 and 40);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_avatar_url_length'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_avatar_url_length
      check (avatar_url is null or char_length(avatar_url) <= 1000);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_bio_length'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_bio_length
      check (bio is null or char_length(bio) <= 500);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_marketplace_access_status'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_marketplace_access_status
      check (marketplace_access_status in ('active', 'suspended'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_marketplace_access_reason_length'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_marketplace_access_reason_length
      check (
        marketplace_access_reason is null
        or char_length(marketplace_access_reason) <= 1000
      );
  end if;
end
$$;

create index if not exists profiles_marketplace_suspended_idx
  on public.profiles (marketplace_access_changed_at desc)
  where marketplace_access_status = 'suspended';

-- Trusted Google identities receive their workspace role at sign-in. Keeping
-- this mapping server-side prevents a matching email/password signup from
-- gaining staff privileges.
create table if not exists private.marketplace_staff_allowlist (
  email text primary key check (email = lower(trim(email))),
  role text not null check (role in ('staff', 'admin')),
  created_at timestamptz not null default now()
);

revoke all on table private.marketplace_staff_allowlist
from public, anon, authenticated;
grant all on table private.marketplace_staff_allowlist to service_role;

insert into private.marketplace_staff_allowlist (email, role)
values
  ('zys1389@gmail.com', 'staff'),
  ('dennis18922182165@gmail.com', 'staff'),
  ('zyz18922182165@gmail.com', 'admin')
on conflict (email) do update set role = excluded.role;

create or replace function private.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowlisted_role text;
  signed_in_with_google boolean;
begin
  signed_in_with_google :=
    coalesce(new.raw_app_meta_data ->> 'provider', '') = 'google'
    or coalesce(new.raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google';

  if signed_in_with_google then
    select allowlist.role
    into allowlisted_role
    from private.marketplace_staff_allowlist allowlist
    where allowlist.email = lower(coalesce(new.email, ''));
  end if;

  insert into public.profiles (id, email, full_name, role)
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
    ),
    coalesce(allowlisted_role, 'customer')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      role = coalesce(allowlisted_role, public.profiles.role),
      updated_at = now();

  return new;
end;
$$;

revoke all on function private.sync_auth_user_profile()
from public, anon, authenticated;
grant execute on function private.sync_auth_user_profile() to service_role;

update public.profiles profile
set role = allowlist.role,
    updated_at = now()
from auth.users auth_user,
     private.marketplace_staff_allowlist allowlist
where profile.id = auth_user.id
  and allowlist.email = lower(coalesce(auth_user.email, ''))
  and (
    coalesce(auth_user.raw_app_meta_data ->> 'provider', '') = 'google'
    or coalesce(auth_user.raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google'
  );

create table public.bike_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'community'
    check (source in ('wander', 'community')),
  slug text not null unique
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,118}$'),
  title text not null
    check (char_length(title) between 3 and 120),
  short_description text
    check (short_description is null or char_length(short_description) <= 240),
  description text not null
    check (char_length(description) between 20 and 5000),
  bike_type text not null
    check (
      bike_type in (
        'cruiser',
        'hybrid',
        'mountain',
        'road',
        'electric',
        'kids',
        'cargo',
        'folding',
        'trailer',
        'other'
      )
    ),
  brand text check (brand is null or char_length(brand) <= 80),
  model text check (model is null or char_length(model) <= 100),
  frame_size text check (frame_size is null or char_length(frame_size) <= 60),
  condition text not null default 'good'
    check (condition in ('new', 'like_new', 'good', 'fair')),
  offer_mode text not null
    check (offer_mode in ('rent', 'sale', 'rent_sale')),
  rental_hourly_cents bigint
    check (rental_hourly_cents is null or rental_hourly_cents between 1 and 1000000),
  rental_daily_cents bigint
    check (rental_daily_cents is null or rental_daily_cents between 1 and 10000000),
  sale_price_cents bigint
    check (sale_price_cents is null or sale_price_cents between 1 and 100000000),
  currency text not null default 'CAD'
    check (currency = 'CAD'),
  minimum_rental_hours smallint not null default 1
    check (minimum_rental_hours between 1 and 168),
  pickup_area text not null
    check (char_length(pickup_area) between 2 and 120),
  city text not null default 'Richmond'
    check (char_length(city) between 2 and 100),
  province text not null default 'BC'
    check (char_length(province) between 2 and 80),
  approximate_latitude numeric(9, 6)
    check (
      approximate_latitude is null
      or approximate_latitude between -90 and 90
    ),
  approximate_longitude numeric(9, 6)
    check (
      approximate_longitude is null
      or approximate_longitude between -180 and 180
    ),
  available_from date,
  available_until date,
  availability_summary text
    check (availability_summary is null or char_length(availability_summary) <= 240),
  rental_rules text
    check (rental_rules is null or char_length(rental_rules) <= 2000),
  included_items text[] not null default '{}'::text[],
  status text not null default 'draft'
    check (
      status in (
        'draft',
        'active',
        'paused',
        'reserved',
        'sold',
        'archived'
      )
    ),
  featured boolean not null default false,
  management_note text
    check (management_note is null or char_length(management_note) <= 1000),
  managed_by uuid references auth.users(id) on delete set null,
  managed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bike_listings_price_mode check (
    (
      offer_mode = 'rent'
      and (rental_hourly_cents is not null or rental_daily_cents is not null)
      and sale_price_cents is null
    )
    or (
      offer_mode = 'sale'
      and rental_hourly_cents is null
      and rental_daily_cents is null
      and sale_price_cents is not null
    )
    or (
      offer_mode = 'rent_sale'
      and (rental_hourly_cents is not null or rental_daily_cents is not null)
      and sale_price_cents is not null
    )
  ),
  constraint bike_listings_available_date_order check (
    available_from is null
    or available_until is null
    or available_until >= available_from
  )
);

create index bike_listings_public_source_updated_idx
  on public.bike_listings (source, updated_at desc)
  where status = 'active';

create index bike_listings_owner_status_updated_idx
  on public.bike_listings (owner_id, status, updated_at desc);

create index bike_listings_paused_idx
  on public.bike_listings (updated_at desc)
  where status = 'paused';

create index bike_listings_offer_mode_idx
  on public.bike_listings (offer_mode)
  where status = 'active';

create index bike_listings_managed_by_idx
  on public.bike_listings (managed_by)
  where managed_by is not null;

create trigger bike_listings_set_updated_at
before update on public.bike_listings
for each row execute function private.set_updated_at();

create or replace function private.marketplace_sync_listing_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select listing.owner_id
  into new.owner_id
  from public.bike_listings listing
  where listing.id = new.listing_id;

  if not found then
    raise exception 'Bike listing does not exist'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create table public.bike_listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.bike_listings(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique
    check (
      storage_path ~ '^[0-9a-f-]{36}/'
      and storage_path !~ '(^|/)\.\.(/|$)'
    ),
  alt_text text not null
    check (char_length(alt_text) between 1 and 240),
  width integer check (width is null or width between 1 and 20000),
  height integer check (height is null or height between 1 and 20000),
  sort_order smallint not null default 0
    check (sort_order between 0 and 99),
  created_at timestamptz not null default now()
);

create index bike_listing_images_listing_sort_idx
  on public.bike_listing_images (listing_id, sort_order, created_at);

create index bike_listing_images_owner_idx
  on public.bike_listing_images (owner_id);

create trigger bike_listing_images_sync_owner
before insert or update of listing_id, owner_id
on public.bike_listing_images
for each row execute function private.marketplace_sync_listing_owner();

create table public.bike_listing_private_details (
  listing_id uuid primary key references public.bike_listings(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  pickup_address text not null
    check (char_length(pickup_address) between 5 and 240),
  postal_code text
    check (postal_code is null or char_length(postal_code) between 3 and 20),
  pickup_instructions text
    check (pickup_instructions is null or char_length(pickup_instructions) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bike_listing_private_owner_idx
  on public.bike_listing_private_details (owner_id);

create trigger bike_listing_private_sync_owner
before insert or update of listing_id, owner_id
on public.bike_listing_private_details
for each row execute function private.marketplace_sync_listing_owner();

create trigger bike_listing_private_set_updated_at
before update on public.bike_listing_private_details
for each row execute function private.set_updated_at();

create table public.marketplace_sensitive_terms (
  id bigint generated always as identity primary key,
  term text not null check (char_length(trim(term)) between 2 and 80),
  category text not null default 'sensitive_term'
    check (
      category in (
        'sensitive_term',
        'contact_details',
        'external_payment'
      )
    ),
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index marketplace_sensitive_terms_normalized_idx
  on public.marketplace_sensitive_terms (lower(trim(term)));

create index marketplace_sensitive_terms_active_idx
  on public.marketplace_sensitive_terms (category, term)
  where active;

create trigger marketplace_sensitive_terms_set_updated_at
before update on public.marketplace_sensitive_terms
for each row execute function private.set_updated_at();

insert into public.marketplace_sensitive_terms (term, category)
values
  ('gift card', 'external_payment'),
  ('cryptocurrency', 'external_payment'),
  ('bitcoin', 'external_payment'),
  ('wire transfer', 'external_payment'),
  ('western union', 'external_payment'),
  ('pay deposit first', 'external_payment'),
  ('e-transfer first', 'external_payment'),
  ('whatsapp', 'contact_details'),
  ('telegram', 'contact_details'),
  ('礼品卡', 'external_payment'),
  ('加密货币', 'external_payment'),
  ('比特币', 'external_payment'),
  ('先付定金', 'external_payment'),
  ('先转账', 'external_payment')
on conflict do nothing;

create table public.marketplace_safety_flags (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.bike_listings(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  image_id uuid references public.bike_listing_images(id) on delete set null,
  signal_source text not null
    check (signal_source in ('text_rule', 'image_provider')),
  provider text not null default 'wander-rules'
    check (char_length(provider) between 2 and 80),
  category text not null
    check (
      category in (
        'sensitive_term',
        'contact_details',
        'external_payment',
        'image_risk',
        'other'
      )
    ),
  details text not null check (char_length(details) between 2 and 1000),
  matched_terms text[] not null default '{}'::text[],
  field_names text[] not null default '{}'::text[],
  evidence jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence) = 'object'),
  dedupe_key text not null unique
    check (char_length(dedupe_key) between 8 and 240),
  status text not null default 'open'
    check (status in ('open', 'dismissed', 'actioned')),
  resolution_note text
    check (resolution_note is null or char_length(resolution_note) <= 1000),
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_safety_flags_image_shape check (
    signal_source <> 'image_provider' or image_id is not null
  )
);

create index marketplace_safety_flags_open_idx
  on public.marketplace_safety_flags (created_at desc)
  where status = 'open';

create index marketplace_safety_flags_listing_idx
  on public.marketplace_safety_flags (listing_id, created_at desc);

create index marketplace_safety_flags_owner_idx
  on public.marketplace_safety_flags (owner_id, created_at desc);

create trigger marketplace_safety_flags_sync_owner
before insert or update of listing_id, owner_id
on public.marketplace_safety_flags
for each row execute function private.marketplace_sync_listing_owner();

create trigger marketplace_safety_flags_set_updated_at
before update on public.marketplace_safety_flags
for each row execute function private.set_updated_at();

create table public.marketplace_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.bike_listings(id) on delete cascade,
  renter_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  intent text not null check (intent in ('rent', 'buy')),
  starts_at timestamptz,
  ends_at timestamptz,
  message text check (message is null or char_length(message) <= 1000),
  renter_name text not null check (char_length(renter_name) between 2 and 120),
  renter_email text not null check (char_length(renter_email) between 3 and 320),
  renter_phone text check (renter_phone is null or char_length(renter_phone) between 7 and 40),
  quoted_hourly_cents bigint,
  quoted_daily_cents bigint,
  quoted_sale_price_cents bigint,
  currency text not null default 'CAD' check (currency = 'CAD'),
  status text not null default 'pending'
    check (
      status in (
        'pending',
        'accepted',
        'declined',
        'cancelled',
        'completed',
        'no_show'
      )
    ),
  response_note text check (response_note is null or char_length(response_note) <= 1000),
  responded_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  pickup_reminder_queued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_requests_not_self check (renter_id <> owner_id),
  constraint marketplace_requests_time_shape check (
    (
      intent = 'rent'
      and starts_at is not null
      and ends_at is not null
      and ends_at > starts_at
    )
    or (
      intent = 'buy'
      and starts_at is null
      and ends_at is null
    )
  )
);

create index marketplace_requests_renter_status_starts_idx
  on public.marketplace_requests (renter_id, status, starts_at desc);

create index marketplace_requests_owner_status_created_idx
  on public.marketplace_requests (owner_id, status, created_at desc);

create index marketplace_requests_listing_status_starts_idx
  on public.marketplace_requests (listing_id, status, starts_at);

create index marketplace_requests_pending_idx
  on public.marketplace_requests (created_at)
  where status = 'pending';

create unique index marketplace_requests_one_accepted_purchase_idx
  on public.marketplace_requests (listing_id)
  where intent = 'buy' and status = 'accepted';

alter table public.marketplace_requests
  add constraint marketplace_requests_no_accepted_rental_overlap
  exclude using gist (
    listing_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (intent = 'rent' and status = 'accepted');

create trigger marketplace_requests_set_updated_at
before update on public.marketplace_requests
for each row execute function private.set_updated_at();

create or replace function private.marketplace_prepare_request()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  listing public.bike_listings%rowtype;
begin
  select *
  into listing
  from public.bike_listings
  where id = new.listing_id
    and status = 'active';

  if not found then
    raise exception 'Bike listing is not available'
      using errcode = 'P0002';
  end if;

  new.owner_id := listing.owner_id;
  new.currency := listing.currency;
  new.quoted_hourly_cents := listing.rental_hourly_cents;
  new.quoted_daily_cents := listing.rental_daily_cents;
  new.quoted_sale_price_cents := listing.sale_price_cents;

  if new.renter_id = listing.owner_id then
    raise exception 'Owners cannot request their own listing'
      using errcode = '23514';
  end if;

  if new.intent = 'rent' and listing.offer_mode not in ('rent', 'rent_sale') then
    raise exception 'This bike is not offered for rent'
      using errcode = '23514';
  end if;

  if new.intent = 'buy' and listing.offer_mode not in ('sale', 'rent_sale') then
    raise exception 'This bike is not offered for sale'
      using errcode = '23514';
  end if;

  if new.intent = 'rent' then
    if listing.available_from is not null
      and new.starts_at::date < listing.available_from
    then
      raise exception 'Requested time is before this bike is available'
        using errcode = '23514';
    end if;

    if listing.available_until is not null
      and new.ends_at::date > listing.available_until
    then
      raise exception 'Requested time is after this bike is available'
        using errcode = '23514';
    end if;

    if new.ends_at - new.starts_at
      < make_interval(hours => listing.minimum_rental_hours)
    then
      raise exception 'Requested rental is shorter than the minimum'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger marketplace_requests_prepare
before insert on public.marketplace_requests
for each row execute function private.marketplace_prepare_request();

create or replace function public.marketplace_set_user_access(
  p_user_id uuid,
  p_status text,
  p_reason text,
  p_actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('active', 'suspended') then
    raise exception 'Unsupported marketplace access status'
      using errcode = '22023';
  end if;
  if p_status = 'suspended' and nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'A suspension reason is required'
      using errcode = '22023';
  end if;

  update public.profiles
  set marketplace_access_status = p_status,
      marketplace_access_reason = case
        when p_status = 'suspended' then left(trim(p_reason), 1000)
        else null
      end,
      marketplace_access_changed_by = p_actor_id,
      marketplace_access_changed_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'Marketplace user not found'
      using errcode = 'P0002';
  end if;

  if p_status = 'suspended' then
    update public.bike_listings
    set status = 'paused',
        management_note = 'Paused when Site Admin suspended the owner account.',
        managed_by = p_actor_id,
        managed_at = now()
    where owner_id = p_user_id
      and status = 'active';
  end if;
end;
$$;

create table public.marketplace_notification_outbox (
  id bigint generated always as identity primary key,
  request_id uuid references public.marketplace_requests(id) on delete set null,
  listing_id uuid references public.bike_listings(id) on delete set null,
  channel text not null default 'email' check (channel = 'email'),
  template_key text not null
    check (
      template_key in (
        'listing_published',
        'safety_flag_created',
        'request_received',
        'request_sent',
        'request_accepted',
        'request_declined',
        'request_cancelled',
        'pickup_reminder'
      )
    ),
  dedupe_key text not null unique,
  recipient text not null check (char_length(recipient) between 3 and 320),
  payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  attempt_count integer not null default 0 check (attempt_count between 0 and 20),
  available_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_notification_source check (
    request_id is not null or listing_id is not null
  )
);

create index marketplace_notifications_ready_idx
  on public.marketplace_notification_outbox (available_at, id)
  where status in ('pending', 'failed');

create index marketplace_notifications_request_idx
  on public.marketplace_notification_outbox (request_id)
  where request_id is not null;

create index marketplace_notifications_listing_idx
  on public.marketplace_notification_outbox (listing_id)
  where listing_id is not null;

create trigger marketplace_notification_outbox_set_updated_at
before update on public.marketplace_notification_outbox
for each row execute function private.set_updated_at();

create or replace function public.marketplace_claim_notifications(
  p_limit integer default 20
)
returns setof public.marketplace_notification_outbox
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with claimed as (
    select id
    from public.marketplace_notification_outbox
    where status in ('pending', 'failed')
      and available_at <= now()
      and attempt_count < 10
    order by available_at, id
    limit greatest(1, least(coalesce(p_limit, 20), 100))
    for update skip locked
  )
  update public.marketplace_notification_outbox notification
  set status = 'sending',
      attempt_count = notification.attempt_count + 1,
      updated_at = now()
  from claimed
  where notification.id = claimed.id
  returning notification.*;
end;
$$;

create or replace function public.marketplace_finish_notification(
  p_notification_id bigint,
  p_status text,
  p_provider_message_id text default null,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('sent', 'failed') then
    raise exception 'Unsupported notification result'
      using errcode = '22023';
  end if;

  update public.marketplace_notification_outbox
  set status = p_status,
      provider_message_id = case
        when p_status = 'sent' then nullif(trim(p_provider_message_id), '')
        else provider_message_id
      end,
      last_error = case
        when p_status = 'failed'
          then left(coalesce(p_error, 'Email delivery failed'), 1000)
        else null
      end,
      sent_at = case when p_status = 'sent' then now() else sent_at end,
      available_at = case
        when p_status = 'failed'
          then now() + make_interval(mins => least(60, greatest(5, 5 * attempt_count)))
        else available_at
      end,
      updated_at = now()
  where id = p_notification_id
    and status = 'sending';

  if not found then
    raise exception 'Notification is not currently claimed'
      using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.marketplace_queue_pickup_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  queued_count integer;
begin
  with candidates as (
    select
      request.id,
      request.listing_id,
      request.renter_email,
      request.renter_name,
      request.starts_at,
      listing.title,
      listing.pickup_area
    from public.marketplace_requests request
    join public.bike_listings listing on listing.id = request.listing_id
    where request.intent = 'rent'
      and request.status = 'accepted'
      and request.pickup_reminder_queued_at is null
      and request.starts_at > now()
      and request.starts_at <= now() + interval '24 hours'
    order by request.starts_at
    limit 200
    for update of request skip locked
  ),
  inserted as (
    insert into public.marketplace_notification_outbox (
      request_id,
      listing_id,
      template_key,
      dedupe_key,
      recipient,
      payload
    )
    select
      candidate.id,
      candidate.listing_id,
      'pickup_reminder',
      'pickup-reminder:' || candidate.id::text,
      candidate.renter_email,
      jsonb_build_object(
        'request_id', candidate.id,
        'renter_name', candidate.renter_name,
        'bike_title', candidate.title,
        'starts_at', candidate.starts_at,
        'pickup_area', candidate.pickup_area
      )
    from candidates candidate
    on conflict (dedupe_key) do nothing
    returning request_id
  )
  update public.marketplace_requests request
  set pickup_reminder_queued_at = now()
  where request.id in (select inserted.request_id);

  get diagnostics queued_count = row_count;
  return queued_count;
end;
$$;

alter table public.bike_listings enable row level security;
alter table public.bike_listings force row level security;
alter table public.bike_listing_images enable row level security;
alter table public.bike_listing_images force row level security;
alter table public.bike_listing_private_details enable row level security;
alter table public.bike_listing_private_details force row level security;
alter table public.marketplace_sensitive_terms enable row level security;
alter table public.marketplace_sensitive_terms force row level security;
alter table public.marketplace_safety_flags enable row level security;
alter table public.marketplace_safety_flags force row level security;
alter table public.marketplace_requests enable row level security;
alter table public.marketplace_requests force row level security;
alter table public.marketplace_notification_outbox enable row level security;
alter table public.marketplace_notification_outbox force row level security;

create policy bike_listings_public_read
on public.bike_listings
for select
to anon, authenticated
using (status = 'active');

create policy bike_listings_owner_read
on public.bike_listings
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy bike_listings_staff_read
on public.bike_listings
for select
to authenticated
using (
  (select private.is_admin())
  or (
    (select private.is_staff())
    and source = 'wander'
  )
);

create policy bike_listing_images_public_read
on public.bike_listing_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.bike_listings listing
    where listing.id = bike_listing_images.listing_id
      and listing.status = 'active'
  )
);

create policy bike_listing_images_owner_read
on public.bike_listing_images
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy bike_listing_images_staff_read
on public.bike_listing_images
for select
to authenticated
using (
  (select private.is_admin())
  or (
    (select private.is_staff())
    and exists (
      select 1
      from public.bike_listings listing
      where listing.id = bike_listing_images.listing_id
        and listing.source = 'wander'
    )
  )
);

create policy bike_listing_private_owner_read
on public.bike_listing_private_details
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy bike_listing_private_accepted_renter_read
on public.bike_listing_private_details
for select
to authenticated
using (
  exists (
    select 1
    from public.marketplace_requests request
    where request.listing_id = bike_listing_private_details.listing_id
      and request.renter_id = (select auth.uid())
      and request.status in ('accepted', 'completed')
  )
);

create policy bike_listing_private_staff_read
on public.bike_listing_private_details
for select
to authenticated
using (
  (select private.is_admin())
  or (
    (select private.is_staff())
    and exists (
      select 1
      from public.bike_listings listing
      where listing.id = bike_listing_private_details.listing_id
        and listing.source = 'wander'
    )
  )
);

create policy marketplace_sensitive_terms_admin_read
on public.marketplace_sensitive_terms
for select
to authenticated
using ((select private.is_admin()));

create policy marketplace_safety_flags_admin_read
on public.marketplace_safety_flags
for select
to authenticated
using ((select private.is_admin()));

create policy marketplace_requests_participant_read
on public.marketplace_requests
for select
to authenticated
using (
  (select auth.uid()) = renter_id
  or (select auth.uid()) = owner_id
);

create policy marketplace_requests_staff_read
on public.marketplace_requests
for select
to authenticated
using (
  (select private.is_admin())
  or (
    (select private.is_staff())
    and exists (
      select 1
      from public.bike_listings listing
      where listing.id = marketplace_requests.listing_id
        and listing.source = 'wander'
    )
  )
);

revoke all on table
  public.bike_listings,
  public.bike_listing_images,
  public.bike_listing_private_details,
  public.marketplace_sensitive_terms,
  public.marketplace_safety_flags,
  public.marketplace_requests,
  public.marketplace_notification_outbox
from public, anon, authenticated;

grant select on table
  public.bike_listings,
  public.bike_listing_images
to anon, authenticated;

grant select on table
  public.bike_listing_private_details,
  public.marketplace_requests,
  public.marketplace_sensitive_terms,
  public.marketplace_safety_flags
to authenticated;

grant all on table
  public.bike_listings,
  public.bike_listing_images,
  public.bike_listing_private_details,
  public.marketplace_sensitive_terms,
  public.marketplace_safety_flags,
  public.marketplace_requests,
  public.marketplace_notification_outbox
to service_role;

grant usage, select on sequence
  public.marketplace_notification_outbox_id_seq,
  public.marketplace_sensitive_terms_id_seq
to service_role;

revoke all on function public.marketplace_claim_notifications(integer)
from public, anon, authenticated;
grant execute on function public.marketplace_claim_notifications(integer)
to service_role;

revoke all on function public.marketplace_finish_notification(bigint, text, text, text)
from public, anon, authenticated;
grant execute on function public.marketplace_finish_notification(bigint, text, text, text)
to service_role;

revoke all on function public.marketplace_queue_pickup_reminders()
from public, anon, authenticated;
grant execute on function public.marketplace_queue_pickup_reminders()
to service_role;

revoke all on function public.marketplace_set_user_access(uuid, text, text, uuid)
from public, anon, authenticated;
grant execute on function public.marketplace_set_user_access(uuid, text, text, uuid)
to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'bike-listing-images',
  'bike-listing-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy bike_listing_images_storage_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'bike-listing-images');

create policy bike_listing_images_storage_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'bike-listing-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

comment on table public.bike_listings is
  'One independently priced bike offered for rent, sale, or both.';
comment on table public.bike_listing_private_details is
  'Exact pickup details visible only to the owner, Wander staff, and accepted renters.';
comment on table public.marketplace_requests is
  'Offline rental reservations and purchase inquiries. No online payment is captured.';
comment on table public.marketplace_sensitive_terms is
  'Administrator-managed public listing text signals. Matches never auto-pause a listing.';
comment on table public.marketplace_safety_flags is
  'Text and image risk signals for Site Admin review. Signals never take automatic enforcement action.';
comment on table public.marketplace_notification_outbox is
  'Durable Resend email queue for marketplace activity and pickup reminders.';
