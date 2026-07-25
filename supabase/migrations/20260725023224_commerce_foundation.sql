-- Wander Bike commerce foundation.
-- All monetary values are integer minor units (CAD cents) to match Stripe and
-- eliminate floating-point rounding. Rental assets remain in public.bookings.

create table public.store_locations (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  phone text,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  province text not null,
  postal_code text not null,
  country_code text not null default 'CA' check (country_code ~ '^[A-Z]{2}$'),
  timezone text not null default 'America/Vancouver',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_locations_code_format check (code ~ '^[a-z0-9][a-z0-9-]{1,48}$')
);

insert into public.store_locations (
  code,
  name,
  phone,
  address_line_1,
  address_line_2,
  city,
  province,
  postal_code
)
values (
  'steveston',
  'Wander Bike — Steveston',
  '+17789521389',
  '12071 First Ave',
  '#101',
  'Richmond',
  'BC',
  'V7E 3M1'
);

create table public.product_categories (
  id bigint generated always as identity primary key,
  parent_id bigint references public.product_categories(id) on delete restrict,
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_categories_slug_format
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,78}$'),
  constraint product_categories_name_length
    check (char_length(name) between 1 and 100)
);

create index product_categories_parent_idx on public.product_categories (parent_id);
create index product_categories_active_sort_idx
  on public.product_categories (sort_order, name)
  where is_active;

insert into public.product_categories (slug, name, sort_order)
values
  ('bikes', 'Bikes', 10),
  ('accessories', 'Accessories', 20),
  ('parts', 'Parts', 30),
  ('apparel', 'Apparel', 40),
  ('services', 'Services', 50);

create table public.product_brands (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null unique,
  description text,
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_brands_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,78}$'),
  constraint product_brands_name_length check (char_length(name) between 1 and 100)
);

create table public.products (
  id bigint generated always as identity primary key,
  category_id bigint references public.product_categories(id) on delete restrict,
  brand_id bigint references public.product_brands(id) on delete set null,
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  product_type text not null default 'physical'
    check (product_type in ('physical', 'service', 'gift_card')),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  tags text[] not null default '{}',
  track_inventory boolean not null default true,
  requires_shipping boolean not null default true,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,118}$'),
  constraint products_name_length check (char_length(name) between 1 and 180),
  constraint products_short_description_length
    check (short_description is null or char_length(short_description) <= 320),
  constraint products_publish_state check (
    status <> 'active' or published_at is not null
  )
);

create index products_category_status_idx
  on public.products (category_id, status, published_at desc);
create index products_brand_status_idx
  on public.products (brand_id, status, published_at desc);
create index products_active_published_idx
  on public.products (published_at desc, id)
  where status = 'active';
create index products_tags_gin_idx on public.products using gin (tags);

create table public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  sku text not null unique,
  barcode text unique,
  title text not null default 'Default',
  option_values jsonb not null default '{}'::jsonb,
  price_cents bigint not null,
  compare_at_price_cents bigint,
  cost_cents bigint,
  weight_grams integer,
  length_cm numeric(8,2),
  width_cm numeric(8,2),
  height_cm numeric(8,2),
  pickup_eligible boolean not null default true,
  local_delivery_eligible boolean not null default true,
  canada_post_eligible boolean not null default true,
  shipping_profile text not null default 'standard',
  tax_code text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_sku_length check (char_length(sku) between 1 and 80),
  constraint product_variants_price_nonnegative check (price_cents >= 0),
  constraint product_variants_compare_price_valid check (
    compare_at_price_cents is null or compare_at_price_cents >= price_cents
  ),
  constraint product_variants_cost_nonnegative check (
    cost_cents is null or cost_cents >= 0
  ),
  constraint product_variants_weight_nonnegative check (
    weight_grams is null or weight_grams >= 0
  ),
  constraint product_variants_dimensions_nonnegative check (
    (length_cm is null or length_cm >= 0)
    and (width_cm is null or width_cm >= 0)
    and (height_cm is null or height_cm >= 0)
  ),
  constraint product_variants_shipping_profile_valid check (
    shipping_profile in ('standard', 'large', 'special')
  ),
  constraint product_variants_options_object check (jsonb_typeof(option_values) = 'object')
);

create index product_variants_product_active_idx
  on public.product_variants (product_id, sort_order, id)
  where is_active;

create table public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  variant_id bigint references public.product_variants(id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_images_product_path_unique unique (product_id, storage_path),
  constraint product_images_alt_length check (char_length(alt_text) between 1 and 240),
  constraint product_images_dimensions_positive check (
    (width is null or width > 0) and (height is null or height > 0)
  )
);

create index product_images_product_sort_idx
  on public.product_images (product_id, sort_order, id);
create index product_images_variant_idx on public.product_images (variant_id);

create table public.inventory_levels (
  variant_id bigint not null references public.product_variants(id) on delete cascade,
  location_id bigint not null references public.store_locations(id) on delete cascade,
  on_hand integer not null default 0,
  reserved integer not null default 0,
  reorder_point integer not null default 0,
  allow_backorder boolean not null default false,
  available integer generated always as (greatest(on_hand - reserved, 0)) stored,
  updated_at timestamptz not null default now(),
  primary key (variant_id, location_id),
  constraint inventory_levels_nonnegative check (
    on_hand >= 0 and reserved >= 0 and reorder_point >= 0
  ),
  constraint inventory_levels_reservation_limit check (
    allow_backorder or reserved <= on_hand
  )
);

create index inventory_levels_location_available_idx
  on public.inventory_levels (location_id, available, variant_id);
create index inventory_levels_reorder_idx
  on public.inventory_levels (location_id, on_hand)
  where on_hand <= reorder_point;

create table public.shipping_quotes (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('canada_post', 'manual')),
  location_id bigint not null references public.store_locations(id) on delete restrict,
  service_code text not null,
  service_name text not null,
  origin_postal_code text not null,
  destination_postal_code text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  currency text not null default 'CAD' check (currency = 'CAD'),
  estimated_transit_days integer,
  expected_delivery_date date,
  is_sandbox boolean not null default true,
  cart_items jsonb not null,
  package_details jsonb not null,
  request_fingerprint text not null,
  raw_response jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint shipping_quotes_transit_nonnegative check (
    estimated_transit_days is null or estimated_transit_days >= 0
  ),
  constraint shipping_quotes_cart_items_array check (
    jsonb_typeof(cart_items) = 'array' and jsonb_array_length(cart_items) > 0
  ),
  constraint shipping_quotes_package_details_object check (
    jsonb_typeof(package_details) = 'object'
  )
);

create index shipping_quotes_fingerprint_expiry_idx
  on public.shipping_quotes (request_fingerprint, expires_at desc);
create index shipping_quotes_expiry_idx on public.shipping_quotes (expires_at);

create sequence public.order_number_seq start with 1000 increment by 1;

create table public.orders (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  order_number text not null unique default (
    'WB-' ||
    to_char(clock_timestamp() at time zone 'UTC', 'YYMMDD') ||
    '-' ||
    lpad(nextval('public.order_number_seq')::text, 6, '0')
  ),
  user_id uuid references auth.users(id) on delete set null,
  location_id bigint not null references public.store_locations(id) on delete restrict,
  shipping_quote_id uuid references public.shipping_quotes(id) on delete set null,
  email text not null,
  customer_first_name text not null,
  customer_last_name text not null,
  phone text,
  status text not null default 'pending_payment'
    check (
      status in (
        'draft',
        'pending_payment',
        'payment_failed',
        'paid',
        'processing',
        'ready_for_pickup',
        'ready_to_ship',
        'shipped',
        'completed',
        'cancelled',
        'partially_refunded',
        'refunded'
      )
    ),
  payment_status text not null default 'unpaid'
    check (
      payment_status in (
        'unpaid',
        'pending',
        'paid',
        'failed',
        'cancelled',
        'partially_refunded',
        'refunded'
      )
    ),
  fulfillment_status text not null default 'unfulfilled'
    check (
      fulfillment_status in (
        'unfulfilled',
        'reserved',
        'preparing',
        'ready_for_pickup',
        'ready_to_ship',
        'shipped',
        'delivered',
        'picked_up',
        'returned',
        'cancelled'
      )
    ),
  fulfillment_method text not null
    check (fulfillment_method in ('pickup', 'local_delivery', 'canada_post')),
  currency text not null default 'CAD' check (currency = 'CAD'),
  subtotal_cents bigint not null default 0 check (subtotal_cents >= 0),
  discount_total_cents bigint not null default 0 check (discount_total_cents >= 0),
  shipping_total_cents bigint not null default 0 check (shipping_total_cents >= 0),
  tax_total_cents bigint not null default 0 check (tax_total_cents >= 0),
  total_cents bigint not null default 0 check (total_cents >= 0),
  refunded_total_cents bigint not null default 0 check (refunded_total_cents >= 0),
  shipping_address jsonb,
  billing_address jsonb,
  shipping_service_code text,
  customer_note text,
  internal_note text,
  guest_access_token_hash text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  checkout_expires_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_email_length check (char_length(email) between 3 and 320),
  constraint orders_first_name_length
    check (char_length(customer_first_name) between 1 and 100),
  constraint orders_last_name_length
    check (char_length(customer_last_name) between 1 and 100),
  constraint orders_phone_length
    check (phone is null or char_length(phone) between 7 and 40),
  constraint orders_total_math check (
    total_cents =
      subtotal_cents - discount_total_cents + shipping_total_cents + tax_total_cents
  ),
  constraint orders_discount_limit check (discount_total_cents <= subtotal_cents),
  constraint orders_refund_limit check (refunded_total_cents <= total_cents),
  constraint orders_guest_access check (
    user_id is not null or guest_access_token_hash is not null
  ),
  constraint orders_shipping_address_required check (
    fulfillment_method = 'pickup' or shipping_address is not null
  )
);

create index orders_user_created_idx
  on public.orders (user_id, created_at desc)
  where user_id is not null;
create index orders_status_created_idx
  on public.orders (status, created_at desc);
create index orders_fulfillment_status_created_idx
  on public.orders (fulfillment_status, created_at desc);
create index orders_payment_status_created_idx
  on public.orders (payment_status, created_at desc);
create index orders_pending_expiry_idx
  on public.orders (checkout_expires_at)
  where status = 'pending_payment';
create index orders_location_created_idx
  on public.orders (location_id, created_at desc);
create index orders_shipping_quote_idx on public.orders (shipping_quote_id);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  variant_id bigint references public.product_variants(id) on delete set null,
  sku text not null,
  product_name text not null,
  variant_title text not null,
  option_values jsonb not null default '{}'::jsonb,
  quantity integer not null check (quantity between 1 and 100),
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  line_subtotal_cents bigint not null check (line_subtotal_cents >= 0),
  line_discount_cents bigint not null default 0 check (line_discount_cents >= 0),
  line_tax_cents bigint not null default 0 check (line_tax_cents >= 0),
  line_total_cents bigint not null check (line_total_cents >= 0),
  weight_grams integer,
  created_at timestamptz not null default now(),
  constraint order_items_total_math check (
    line_subtotal_cents = unit_price_cents * quantity
    and line_total_cents =
      line_subtotal_cents - line_discount_cents + line_tax_cents
  ),
  constraint order_items_discount_limit check (
    line_discount_cents <= line_subtotal_cents
  )
);

create index order_items_order_idx on public.order_items (order_id, id);
create index order_items_product_idx on public.order_items (product_id);
create index order_items_variant_idx on public.order_items (variant_id);

create table public.inventory_reservations (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  variant_id bigint not null references public.product_variants(id) on delete restrict,
  location_id bigint not null references public.store_locations(id) on delete restrict,
  quantity integer not null check (quantity between 1 and 100),
  status text not null default 'active'
    check (status in ('active', 'converted', 'released', 'expired')),
  expires_at timestamptz not null,
  converted_at timestamptz,
  released_at timestamptz,
  release_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_reservations_order_variant_unique
    unique (order_id, variant_id, location_id),
  constraint inventory_reservations_status_timestamps check (
    (status <> 'converted' or converted_at is not null)
    and (status not in ('released', 'expired') or released_at is not null)
  )
);

create index inventory_reservations_order_status_idx
  on public.inventory_reservations (order_id, status);
create index inventory_reservations_variant_status_idx
  on public.inventory_reservations (variant_id, location_id, status);
create index inventory_reservations_active_expiry_idx
  on public.inventory_reservations (expires_at, order_id)
  where status = 'active';

create table public.inventory_ledger (
  id bigint generated always as identity primary key,
  variant_id bigint not null references public.product_variants(id) on delete restrict,
  location_id bigint not null references public.store_locations(id) on delete restrict,
  order_id bigint references public.orders(id) on delete set null,
  reservation_id bigint references public.inventory_reservations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null
    check (
      event_type in (
        'receive',
        'adjust',
        'reserve',
        'release',
        'sale',
        'return',
        'damage',
        'transfer_in',
        'transfer_out'
      )
    ),
  delta_on_hand integer not null default 0,
  delta_reserved integer not null default 0,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint inventory_ledger_has_delta check (
    delta_on_hand <> 0 or delta_reserved <> 0
  ),
  constraint inventory_ledger_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index inventory_ledger_variant_created_idx
  on public.inventory_ledger (variant_id, location_id, created_at desc);
create index inventory_ledger_order_idx on public.inventory_ledger (order_id);
create index inventory_ledger_reservation_idx
  on public.inventory_ledger (reservation_id);
create index inventory_ledger_actor_idx on public.inventory_ledger (actor_user_id);

create table public.payments (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete restrict,
  provider text not null default 'stripe' check (provider = 'stripe'),
  provider_checkout_session_id text unique,
  provider_payment_intent_id text unique,
  amount_cents bigint not null check (amount_cents >= 0),
  refunded_cents bigint not null default 0 check (refunded_cents >= 0),
  currency text not null default 'CAD' check (currency = 'CAD'),
  status text not null
    check (
      status in (
        'pending',
        'succeeded',
        'failed',
        'partially_refunded',
        'refunded',
        'cancelled'
      )
    ),
  failure_code text,
  failure_message text,
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_refund_limit check (refunded_cents <= amount_cents)
);

create index payments_order_created_idx
  on public.payments (order_id, created_at desc);
create index payments_status_created_idx
  on public.payments (status, created_at desc);

create table public.shipments (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete restrict,
  location_id bigint not null references public.store_locations(id) on delete restrict,
  provider text not null
    check (provider in ('canada_post', 'local_delivery', 'pickup', 'other')),
  idempotency_key uuid unique,
  customer_request_id text unique,
  provider_shipment_id text unique,
  provider_self_url text,
  provider_refund_url text,
  provider_refund_ticket text,
  refund_requested_at timestamptz,
  service_code text,
  service_name text,
  tracking_pin text,
  tracking_url text,
  label_artifact_url text,
  label_storage_path text,
  commercial_invoice_storage_path text,
  label_cost_cents bigint
    check (label_cost_cents is null or label_cost_cents >= 0),
  package_details jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (
      status in (
        'pending',
        'label_created',
        'ready',
        'in_transit',
        'delivered',
        'cancelled',
        'exception',
        'voided',
        'refund_pending',
        'refunded'
      )
    ),
  is_sandbox boolean not null default true,
  voided_at timestamptz,
  refunded_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipments_package_details_object
    check (jsonb_typeof(package_details) = 'object')
);

create index shipments_order_idx on public.shipments (order_id, created_at desc);
create index shipments_location_status_idx
  on public.shipments (location_id, status, created_at desc);
create index shipments_tracking_idx
  on public.shipments (tracking_pin)
  where tracking_pin is not null;
create unique index shipments_provider_tracking_unique
  on public.shipments (provider, tracking_pin)
  where tracking_pin is not null;

create table public.refunds (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete restrict,
  payment_id bigint not null references public.payments(id) on delete restrict,
  requested_by uuid references auth.users(id) on delete set null,
  idempotency_key uuid not null unique,
  provider_refund_id text unique,
  amount_cents bigint not null check (amount_cents > 0),
  reason text not null,
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'cancelled')),
  restock_items boolean not null default false,
  items jsonb not null default '[]'::jsonb,
  provider_response jsonb not null default '{}'::jsonb,
  failure_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint refunds_reason_length check (char_length(reason) between 2 and 500),
  constraint refunds_items_array check (jsonb_typeof(items) = 'array'),
  constraint refunds_provider_response_object
    check (jsonb_typeof(provider_response) = 'object')
);

create index refunds_order_created_idx on public.refunds (order_id, created_at desc);
create index refunds_payment_idx on public.refunds (payment_id);
create index refunds_requested_by_idx on public.refunds (requested_by);

create table public.returns (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete restrict,
  refund_id bigint references public.refunds(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  return_number text not null unique default (
    'WR-' ||
    to_char(clock_timestamp() at time zone 'UTC', 'YYMMDD') ||
    '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  status text not null default 'requested'
    check (
      status in (
        'requested',
        'approved',
        'received',
        'rejected',
        'completed',
        'cancelled'
      )
    ),
  reason text not null,
  resolution text,
  items jsonb not null default '[]'::jsonb,
  received_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint returns_items_array check (jsonb_typeof(items) = 'array'),
  constraint returns_reason_length check (char_length(reason) between 2 and 1000)
);

create index returns_order_created_idx on public.returns (order_id, created_at desc);
create index returns_refund_idx on public.returns (refund_id);
create index returns_status_created_idx
  on public.returns (status, created_at desc);

create table public.integration_events (
  id bigint generated always as identity primary key,
  provider text not null check (provider in ('stripe', 'canada_post', 'email')),
  external_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received'
    check (status in ('received', 'processed', 'ignored', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint integration_events_provider_external_unique
    unique (provider, external_event_id),
  constraint integration_events_payload_object check (jsonb_typeof(payload) = 'object')
);

create index integration_events_status_received_idx
  on public.integration_events (status, received_at)
  where status in ('received', 'failed');

create table public.notification_outbox (
  id bigint generated always as identity primary key,
  order_id bigint references public.orders(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  channel text not null check (channel in ('email')),
  template_key text not null,
  dedupe_key text unique,
  recipient text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  available_at timestamptz not null default now(),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_outbox_source check (
    order_id is not null or booking_id is not null
  ),
  constraint notification_outbox_payload_object check (jsonb_typeof(payload) = 'object')
);

create index notification_outbox_pending_idx
  on public.notification_outbox (available_at, id)
  where status in ('pending', 'failed');
create index notification_outbox_order_idx
  on public.notification_outbox (order_id);
create index notification_outbox_booking_idx
  on public.notification_outbox (booking_id);

create table public.store_settings (
  key text primary key,
  value jsonb not null,
  description text not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint store_settings_key_format check (key ~ '^[a-z][a-z0-9_.-]{1,98}$')
);

insert into public.store_settings (key, value, description)
values
  (
    'commerce.sandbox_mode',
    'true'::jsonb,
    'Keeps payment and shipping integrations in test mode.'
  ),
  (
    'commerce.checkout_enabled',
    'false'::jsonb,
    'Checkout remains disabled until the catalog, taxes, and fulfillment rules are approved.'
  ),
  (
    'store.profile',
    '{
      "display_name": "Wander Bike Rentals",
      "phone": "+1 778 952 1389",
      "customer_email": "",
      "address_line_1": "12071 First Ave",
      "address_line_2": "#101",
      "city": "Richmond",
      "province": "BC",
      "postal_code": "V7E3M1",
      "country": "CA"
    }'::jsonb,
    'Customer-facing store identity and pickup address.'
  ),
  (
    'store.hours',
    '{
      "timezone": "America/Vancouver",
      "note": "",
      "days": [
        {"day":"monday","closed":false,"open":"09:00","close":"22:00"},
        {"day":"tuesday","closed":false,"open":"09:00","close":"22:00"},
        {"day":"wednesday","closed":false,"open":"09:00","close":"22:00"},
        {"day":"thursday","closed":false,"open":"09:00","close":"22:00"},
        {"day":"friday","closed":false,"open":"09:00","close":"22:00"},
        {"day":"saturday","closed":false,"open":"09:00","close":"22:00"},
        {"day":"sunday","closed":false,"open":"09:00","close":"22:00"}
      ]
    }'::jsonb,
    'Weekly customer-facing hours in the Vancouver time zone.'
  ),
  (
    'fulfillment.pickup_enabled',
    'true'::jsonb,
    'Allow free pickup at the Steveston store.'
  ),
  (
    'fulfillment.pickup_instructions',
    '{
      "instructions": "Wait for the ready-for-pickup email, then bring your order number to the Steveston store."
    }'::jsonb,
    'Instructions displayed for Steveston order pickup.'
  ),
  (
    'fulfillment.sales_regions',
    '{"countries":["CA"],"provinces":["BC"]}'::jsonb,
    'Canadian provinces where sales and fulfillment are available.'
  ),
  (
    'fulfillment.local_delivery',
    '{"enabled": false, "fee_cents": 0, "postal_code_prefixes": []}'::jsonb,
    'Richmond local delivery rules. Must be reviewed before enabling.'
  ),
  (
    'fulfillment.canada_post_enabled',
    'false'::jsonb,
    'Canada Post sandbox rating and label creation toggle.'
  ),
  (
    'fulfillment.shipping_origin',
    '{
      "company": "Wander Bike Rentals",
      "contact": "Wander Bike",
      "phone": "+1 778 952 1389",
      "address_line_1": "12071 First Ave",
      "address_line_2": "#101",
      "city": "Richmond",
      "province": "BC",
      "postal_code": "V7E3M1",
      "country": "CA"
    }'::jsonb,
    'Origin address used for carrier rates and labels.'
  ),
  (
    'fulfillment.shipping_rules',
    '{
      "free_shipping_threshold_cents": null,
      "fixed_canada_post_fee_cents": null
    }'::jsonb,
    'Optional free-shipping threshold and fixed customer-facing Canada Post fee.'
  ),
  (
    'tax.mode',
    '{
      "provider": "manual",
      "enabled": false,
      "registration_number": "",
      "rates": []
    }'::jsonb,
    'Canadian tax rules. Must be configured and approved before checkout is enabled.'
  ),
  (
    'notifications.order_email',
    '{"email":""}'::jsonb,
    'Merchant inbox for order notifications and customer replies.'
  ),
  (
    'policy.shipping',
    '{"text":""}'::jsonb,
    'Customer-facing shipping policy.'
  ),
  (
    'policy.refund',
    '{"text":""}'::jsonb,
    'Customer-facing refund policy.'
  ),
  (
    'policy.return',
    '{"text":""}'::jsonb,
    'Customer-facing return policy.'
  );

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  request_id text,
  ip_hash text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_log_before_object check (
    before_state is null or jsonb_typeof(before_state) = 'object'
  ),
  constraint audit_log_after_object check (
    after_state is null or jsonb_typeof(after_state) = 'object'
  ),
  constraint audit_log_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index audit_log_entity_created_idx
  on public.audit_log (entity_type, entity_id, created_at desc);
create index audit_log_actor_created_idx
  on public.audit_log (actor_user_id, created_at desc);

create trigger store_locations_set_updated_at
before update on public.store_locations
for each row execute function private.set_updated_at();
create trigger product_categories_set_updated_at
before update on public.product_categories
for each row execute function private.set_updated_at();
create trigger product_brands_set_updated_at
before update on public.product_brands
for each row execute function private.set_updated_at();
create trigger products_set_updated_at
before update on public.products
for each row execute function private.set_updated_at();
create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function private.set_updated_at();
create trigger inventory_levels_set_updated_at
before update on public.inventory_levels
for each row execute function private.set_updated_at();
create trigger orders_set_updated_at
before update on public.orders
for each row execute function private.set_updated_at();
create trigger inventory_reservations_set_updated_at
before update on public.inventory_reservations
for each row execute function private.set_updated_at();
create trigger payments_set_updated_at
before update on public.payments
for each row execute function private.set_updated_at();
create trigger shipments_set_updated_at
before update on public.shipments
for each row execute function private.set_updated_at();
create trigger refunds_set_updated_at
before update on public.refunds
for each row execute function private.set_updated_at();
create trigger returns_set_updated_at
before update on public.returns
for each row execute function private.set_updated_at();
create trigger integration_events_set_updated_at
before update on public.integration_events
for each row execute function private.set_updated_at();
create trigger notification_outbox_set_updated_at
before update on public.notification_outbox
for each row execute function private.set_updated_at();
create trigger store_settings_set_updated_at
before update on public.store_settings
for each row execute function private.set_updated_at();

create or replace function private.reject_immutable_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is append-only', tg_table_name
    using errcode = '55000';
end;
$$;

revoke all on function private.reject_immutable_change() from public, anon, authenticated;
grant execute on function private.reject_immutable_change() to service_role;

create trigger inventory_ledger_is_immutable
before update or delete on public.inventory_ledger
for each row execute function private.reject_immutable_change();

create trigger audit_log_is_immutable
before update or delete on public.audit_log
for each row execute function private.reject_immutable_change();

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('staff', 'admin')
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_staff() from public, anon;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_staff(), private.is_admin() to authenticated, service_role;

create view public.storefront_inventory
with (security_invoker = true)
as
select
  il.variant_id,
  il.location_id,
  sl.code as location_code,
  il.available,
  (il.available > 0 or il.allow_backorder) as is_available,
  il.allow_backorder
from public.inventory_levels il
join public.store_locations sl on sl.id = il.location_id
where sl.is_active;

comment on view public.storefront_inventory is
  'Safe storefront inventory availability. Underlying RLS remains enforced.';

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'store_locations',
    'product_categories',
    'product_brands',
    'products',
    'product_variants',
    'product_images',
    'inventory_levels',
    'shipping_quotes',
    'orders',
    'order_items',
    'inventory_reservations',
    'inventory_ledger',
    'payments',
    'shipments',
    'refunds',
    'returns',
    'integration_events',
    'notification_outbox',
    'store_settings',
    'audit_log'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
  end loop;
end;
$$;

create policy store_locations_public_read
on public.store_locations
for select
to anon, authenticated
using (is_active);

create policy product_categories_public_read
on public.product_categories
for select
to anon, authenticated
using (is_active);

create policy product_brands_public_read
on public.product_brands
for select
to anon, authenticated
using (is_active);

create policy products_public_read
on public.products
for select
to anon, authenticated
using (
  status = 'active'
  and published_at is not null
  and published_at <= now()
);

create policy product_variants_public_read
on public.product_variants
for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.products
    where products.id = product_variants.product_id
      and products.status = 'active'
      and products.published_at is not null
      and products.published_at <= now()
  )
);

create policy product_images_public_read
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and products.status = 'active'
      and products.published_at is not null
      and products.published_at <= now()
  )
);

create policy inventory_levels_public_read
on public.inventory_levels
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.product_variants
    join public.products
      on products.id = product_variants.product_id
    where product_variants.id = inventory_levels.variant_id
      and product_variants.is_active
      and products.status = 'active'
      and products.published_at is not null
      and products.published_at <= now()
  )
);

create policy profiles_self_read
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy profiles_self_update
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy profiles_staff_read
on public.profiles
for select
to authenticated
using ((select private.is_staff()));

create policy profiles_admin_update
on public.profiles
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy orders_customer_read
on public.orders
for select
to authenticated
using (user_id = (select auth.uid()));

create policy order_items_customer_read
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
  )
);

create policy shipments_customer_read
on public.shipments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = shipments.order_id
      and orders.user_id = (select auth.uid())
  )
);

create policy returns_customer_read
on public.returns
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = returns.order_id
      and orders.user_id = (select auth.uid())
  )
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'store_locations',
    'product_categories',
    'product_brands',
    'products',
    'product_variants',
    'product_images',
    'inventory_levels',
    'shipping_quotes',
    'orders',
    'order_items',
    'inventory_reservations',
    'inventory_ledger',
    'payments',
    'shipments',
    'refunds',
    'returns',
    'integration_events',
    'notification_outbox',
    'store_settings',
    'audit_log'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select private.is_staff()))',
      table_name || '_staff_read',
      table_name
    );
  end loop;
end;
$$;

revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;

grant usage on schema public to anon, authenticated, service_role;

grant select on table
  public.store_locations,
  public.product_categories,
  public.product_brands,
  public.products,
  public.product_variants,
  public.product_images,
  public.inventory_levels,
  public.storefront_inventory
to anon, authenticated;

grant select on table
  public.profiles,
  public.shipping_quotes,
  public.orders,
  public.order_items,
  public.inventory_reservations,
  public.inventory_ledger,
  public.payments,
  public.shipments,
  public.refunds,
  public.returns,
  public.integration_events,
  public.notification_outbox,
  public.store_settings,
  public.audit_log
to authenticated;

grant update (full_name) on public.profiles to authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

create or replace function public.commerce_create_checkout_order(
  p_customer_email text,
  p_customer_first_name text,
  p_customer_last_name text,
  p_fulfillment_method text,
  p_items jsonb,
  p_guest_access_token_hash text,
  p_user_id uuid default null,
  p_phone text default null,
  p_shipping_address jsonb default null,
  p_billing_address jsonb default null,
  p_shipping_quote_id uuid default null,
  p_local_delivery_fee_cents bigint default 0,
  p_tax_total_cents bigint default 0,
  p_customer_note text default null,
  p_checkout_expires_at timestamptz default (now() + interval '30 minutes'),
  p_location_code text default 'steveston'
)
returns table (
  order_id bigint,
  public_id uuid,
  order_number text,
  subtotal_cents bigint,
  shipping_total_cents bigint,
  tax_total_cents bigint,
  total_cents bigint,
  currency text,
  checkout_expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_location_id bigint;
  v_shipping_total bigint := 0;
  v_shipping_service_code text;
  v_shipping_destination_postal_code text;
  v_shipping_cart_items jsonb;
  v_normalized_items jsonb;
  v_subtotal bigint := 0;
  v_order_id bigint;
  v_reservation_id bigint;
  v_item record;
  v_variant record;
  v_inventory record;
  v_shippable_unit_count integer := 0;
  v_order public.orders%rowtype;
begin
  if p_fulfillment_method not in ('pickup', 'local_delivery', 'canada_post') then
    raise exception 'Unsupported fulfillment method'
      using errcode = '22023';
  end if;

  if p_customer_email is null
    or char_length(trim(p_customer_email)) not between 3 and 320
    or p_customer_first_name is null
    or char_length(trim(p_customer_first_name)) not between 1 and 100
    or p_customer_last_name is null
    or char_length(trim(p_customer_last_name)) not between 1 and 100
  then
    raise exception 'Customer contact information is invalid'
      using errcode = '22023';
  end if;

  if p_user_id is null and nullif(trim(p_guest_access_token_hash), '') is null then
    raise exception 'Guest checkout token is required'
      using errcode = '22023';
  end if;

  if jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) < 1
    or jsonb_array_length(p_items) > 50
  then
    raise exception 'Cart must contain between 1 and 50 line items'
      using errcode = '22023';
  end if;

  if p_shipping_address is not null
    and jsonb_typeof(p_shipping_address) <> 'object'
  then
    raise exception 'Shipping address must be an object'
      using errcode = '22023';
  end if;

  if p_billing_address is not null
    and jsonb_typeof(p_billing_address) <> 'object'
  then
    raise exception 'Billing address must be an object'
      using errcode = '22023';
  end if;

  if p_fulfillment_method <> 'pickup' and p_shipping_address is null then
    raise exception 'A shipping address is required'
      using errcode = '22023';
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'variant_id',
      normalized_item.variant_id,
      'quantity',
      normalized_item.quantity
    )
    order by normalized_item.variant_id
  )
  into v_normalized_items
  from (
    select
      (item ->> 'variant_id')::bigint as variant_id,
      sum((item ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as item
    group by (item ->> 'variant_id')::bigint
  ) as normalized_item;

  if p_tax_total_cents < 0 or p_local_delivery_fee_cents < 0 then
    raise exception 'Order totals cannot be negative'
      using errcode = '22023';
  end if;

  if p_checkout_expires_at <= now()
    or p_checkout_expires_at > now() + interval '2 hours'
  then
    raise exception 'Checkout expiry is outside the allowed window'
      using errcode = '22023';
  end if;

  select id
  into v_location_id
  from public.store_locations
  where code = p_location_code
    and is_active;

  if v_location_id is null then
    raise exception 'Fulfillment location is unavailable'
      using errcode = 'P0002';
  end if;

  select coalesce(sum((item ->> 'quantity')::integer), 0)::integer
  into v_shippable_unit_count
  from jsonb_array_elements(v_normalized_items) as item
  join public.product_variants pv
    on pv.id = (item ->> 'variant_id')::bigint
  join public.products p
    on p.id = pv.product_id
  where p.requires_shipping;

  if p_fulfillment_method = 'canada_post' then
    select
      amount_cents,
      service_code,
      destination_postal_code,
      cart_items
    into
      v_shipping_total,
      v_shipping_service_code,
      v_shipping_destination_postal_code,
      v_shipping_cart_items
    from public.shipping_quotes
    where id = p_shipping_quote_id
      and provider = 'canada_post'
      and location_id = v_location_id
      and currency = 'CAD'
      and is_sandbox
      and expires_at > now();

    if not found then
      raise exception 'Canada Post shipping quote is missing or expired'
        using errcode = 'P0002';
    end if;

    if v_shipping_cart_items <> v_normalized_items then
      raise exception 'Canada Post shipping quote does not match this cart'
        using errcode = '22023';
    end if;

    if regexp_replace(
      upper(coalesce(p_shipping_address ->> 'postalCode', '')),
      '[^A-Z0-9]',
      '',
      'g'
    ) <> v_shipping_destination_postal_code then
      raise exception 'Canada Post shipping quote does not match this postal code'
        using errcode = '22023';
    end if;
  elsif p_fulfillment_method = 'local_delivery' then
    v_shipping_total := p_local_delivery_fee_cents;
    v_shipping_service_code := 'LOCAL';
  else
    v_shipping_total := 0;
    v_shipping_service_code := 'PICKUP';
  end if;

  insert into public.orders (
    user_id,
    location_id,
    shipping_quote_id,
    email,
    customer_first_name,
    customer_last_name,
    phone,
    status,
    payment_status,
    fulfillment_status,
    fulfillment_method,
    shipping_total_cents,
    tax_total_cents,
    total_cents,
    shipping_address,
    billing_address,
    shipping_service_code,
    customer_note,
    guest_access_token_hash,
    checkout_expires_at
  )
  values (
    p_user_id,
    v_location_id,
    p_shipping_quote_id,
    lower(trim(p_customer_email)),
    trim(p_customer_first_name),
    trim(p_customer_last_name),
    nullif(trim(p_phone), ''),
    'pending_payment',
    'pending',
    'reserved',
    p_fulfillment_method,
    v_shipping_total,
    p_tax_total_cents,
    v_shipping_total + p_tax_total_cents,
    p_shipping_address,
    coalesce(p_billing_address, p_shipping_address),
    v_shipping_service_code,
    nullif(trim(p_customer_note), ''),
    nullif(trim(p_guest_access_token_hash), ''),
    p_checkout_expires_at
  )
  returning id into v_order_id;

  for v_item in
    select
      (item ->> 'variant_id')::bigint as variant_id,
      sum((item ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as item
    group by (item ->> 'variant_id')::bigint
    order by (item ->> 'variant_id')::bigint
  loop
    if v_item.variant_id is null
      or v_item.quantity is null
      or v_item.quantity not between 1 and 100
    then
      raise exception 'Cart quantity is invalid'
        using errcode = '22023';
    end if;

    select
      pv.id,
      pv.product_id,
      pv.sku,
      pv.title,
      pv.option_values,
      pv.price_cents,
      pv.weight_grams,
      pv.pickup_eligible,
      pv.local_delivery_eligible,
      pv.canada_post_eligible,
      pv.shipping_profile,
      p.name as product_name,
      p.track_inventory,
      p.requires_shipping
    into v_variant
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = v_item.variant_id
      and pv.is_active
      and p.status = 'active'
      and p.published_at is not null
      and p.published_at <= now();

    if not found then
      raise exception 'A cart item is unavailable'
        using errcode = 'P0002';
    end if;

    if p_fulfillment_method = 'pickup'
      and not v_variant.pickup_eligible
    then
      raise exception 'SKU % is not available for store pickup', v_variant.sku
        using errcode = '23514';
    end if;

    if p_fulfillment_method = 'local_delivery'
      and not v_variant.local_delivery_eligible
    then
      raise exception 'SKU % is not available for local delivery', v_variant.sku
        using errcode = '23514';
    end if;

    if p_fulfillment_method = 'canada_post'
      and v_variant.requires_shipping
      and not v_variant.canada_post_eligible
    then
      raise exception 'SKU % is not available for Canada Post shipping', v_variant.sku
        using errcode = '23514';
    end if;

    if p_fulfillment_method = 'canada_post'
      and v_variant.requires_shipping
      and v_variant.shipping_profile = 'special'
    then
      raise exception 'SKU % requires special handling', v_variant.sku
        using errcode = '23514';
    end if;

    if p_fulfillment_method = 'canada_post'
      and v_variant.requires_shipping
      and v_variant.shipping_profile = 'large'
      and v_shippable_unit_count > 1
    then
      raise exception 'Large SKU % must ship alone', v_variant.sku
        using errcode = '23514';
    end if;

    if v_variant.track_inventory then
      select on_hand, reserved, allow_backorder
      into v_inventory
      from public.inventory_levels
      where variant_id = v_variant.id
        and location_id = v_location_id
      for update;

      if not found then
        raise exception 'Inventory is not configured for SKU %', v_variant.sku
          using errcode = 'P0002';
      end if;

      if not v_inventory.allow_backorder
        and (v_inventory.on_hand - v_inventory.reserved) < v_item.quantity
      then
        raise exception 'Insufficient inventory for SKU %', v_variant.sku
          using errcode = 'P0001';
      end if;

      update public.inventory_levels
      set reserved = reserved + v_item.quantity
      where variant_id = v_variant.id
        and location_id = v_location_id;

      insert into public.inventory_reservations (
        order_id,
        variant_id,
        location_id,
        quantity,
        expires_at
      )
      values (
        v_order_id,
        v_variant.id,
        v_location_id,
        v_item.quantity,
        p_checkout_expires_at
      )
      returning id into v_reservation_id;

      insert into public.inventory_ledger (
        variant_id,
        location_id,
        order_id,
        reservation_id,
        event_type,
        delta_reserved,
        reason
      )
      values (
        v_variant.id,
        v_location_id,
        v_order_id,
        v_reservation_id,
        'reserve',
        v_item.quantity,
        'Checkout inventory reservation'
      );
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      sku,
      product_name,
      variant_title,
      option_values,
      quantity,
      unit_price_cents,
      line_subtotal_cents,
      line_total_cents,
      weight_grams
    )
    values (
      v_order_id,
      v_variant.product_id,
      v_variant.id,
      v_variant.sku,
      v_variant.product_name,
      v_variant.title,
      v_variant.option_values,
      v_item.quantity,
      v_variant.price_cents,
      v_variant.price_cents * v_item.quantity,
      v_variant.price_cents * v_item.quantity,
      v_variant.weight_grams
    );

    v_subtotal := v_subtotal + (v_variant.price_cents * v_item.quantity);
  end loop;

  update public.orders
  set subtotal_cents = v_subtotal,
      total_cents = v_subtotal + v_shipping_total + p_tax_total_cents
  where id = v_order_id
  returning * into v_order;

  insert into public.audit_log (
    action,
    entity_type,
    entity_id,
    after_state,
    metadata
  )
  values (
    'checkout_order_created',
    'order',
    v_order.id::text,
    jsonb_build_object(
      'status', v_order.status,
      'payment_status', v_order.payment_status,
      'fulfillment_method', v_order.fulfillment_method,
      'total_cents', v_order.total_cents
    ),
    jsonb_build_object('sandbox', true)
  );

  return query
  select
    v_order.id,
    v_order.public_id,
    v_order.order_number,
    v_order.subtotal_cents,
    v_order.shipping_total_cents,
    v_order.tax_total_cents,
    v_order.total_cents,
    v_order.currency,
    v_order.checkout_expires_at;
end;
$$;

revoke all on function public.commerce_create_checkout_order(
  text,
  text,
  text,
  text,
  jsonb,
  text,
  uuid,
  text,
  jsonb,
  jsonb,
  uuid,
  bigint,
  bigint,
  text,
  timestamptz,
  text
) from public, anon, authenticated;
grant execute on function public.commerce_create_checkout_order(
  text,
  text,
  text,
  text,
  jsonb,
  text,
  uuid,
  text,
  jsonb,
  jsonb,
  uuid,
  bigint,
  bigint,
  text,
  timestamptz,
  text
) to service_role;

create or replace function public.commerce_attach_stripe_checkout(
  p_order_id bigint,
  p_checkout_session_id text,
  p_checkout_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated boolean;
begin
  if nullif(trim(p_checkout_session_id), '') is null then
    raise exception 'Stripe Checkout Session ID is required'
      using errcode = '22023';
  end if;

  update public.orders
  set stripe_checkout_session_id = p_checkout_session_id,
      checkout_expires_at = least(checkout_expires_at, p_checkout_expires_at)
  where id = p_order_id
    and status = 'pending_payment'
    and stripe_checkout_session_id is null;

  v_updated := found;

  if v_updated then
    update public.inventory_reservations
    set expires_at = least(expires_at, p_checkout_expires_at)
    where order_id = p_order_id
      and status = 'active';
  end if;

  return v_updated;
end;
$$;

revoke all on function public.commerce_attach_stripe_checkout(bigint, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.commerce_attach_stripe_checkout(bigint, text, timestamptz)
  to service_role;

create or replace function private.release_order_inventory(
  p_order_id bigint,
  p_reason text,
  p_reservation_status text default 'released'
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_status text;
  v_reservation record;
  v_released_count integer := 0;
begin
  if p_reservation_status not in ('released', 'expired') then
    raise exception 'Invalid reservation release status'
      using errcode = '22023';
  end if;

  select status
  into v_order_status
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found'
      using errcode = 'P0002';
  end if;

  -- Locks are acquired in variant/location order everywhere inventory moves.
  perform 1
  from public.inventory_levels il
  join public.inventory_reservations ir
    on ir.variant_id = il.variant_id
   and ir.location_id = il.location_id
  where ir.order_id = p_order_id
    and ir.status = 'active'
  order by il.variant_id, il.location_id
  for update of il;

  for v_reservation in
    select *
    from public.inventory_reservations
    where order_id = p_order_id
      and status = 'active'
    order by variant_id, location_id
    for update
  loop
    update public.inventory_levels
    set reserved = reserved - v_reservation.quantity
    where variant_id = v_reservation.variant_id
      and location_id = v_reservation.location_id
      and reserved >= v_reservation.quantity;

    if not found then
      raise exception 'Inventory reservation state is inconsistent for variant %',
        v_reservation.variant_id
        using errcode = '23514';
    end if;

    update public.inventory_reservations
    set status = p_reservation_status,
        released_at = now(),
        release_reason = left(coalesce(p_reason, 'Released'), 500)
    where id = v_reservation.id;

    insert into public.inventory_ledger (
      variant_id,
      location_id,
      order_id,
      reservation_id,
      event_type,
      delta_reserved,
      reason
    )
    values (
      v_reservation.variant_id,
      v_reservation.location_id,
      p_order_id,
      v_reservation.id,
      'release',
      -v_reservation.quantity,
      left(coalesce(p_reason, 'Order inventory released'), 500)
    );

    v_released_count := v_released_count + 1;
  end loop;

  if v_order_status in ('draft', 'pending_payment', 'payment_failed') then
    update public.orders
    set status = 'cancelled',
        payment_status = case
          when payment_status = 'pending' then 'failed'
          else payment_status
        end,
        fulfillment_status = 'cancelled',
        cancelled_at = coalesce(cancelled_at, now())
    where id = p_order_id;
  end if;

  insert into public.audit_log (
    action,
    entity_type,
    entity_id,
    after_state,
    metadata
  )
  values (
    'inventory_reservations_' || p_reservation_status,
    'order',
    p_order_id::text,
    jsonb_build_object(
      'reservation_status', p_reservation_status,
      'released_line_count', v_released_count
    ),
    jsonb_build_object('reason', p_reason)
  );

  return v_released_count;
end;
$$;

revoke all on function private.release_order_inventory(bigint, text, text)
  from public, anon, authenticated;
grant execute on function private.release_order_inventory(bigint, text, text)
  to service_role;

create or replace function public.commerce_cancel_checkout_order(
  p_order_id bigint,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_released integer;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if v_order.status not in ('draft', 'pending_payment', 'payment_failed') then
    return jsonb_build_object(
      'status',
      'ignored',
      'reason',
      'order_not_releasable',
      'order_id',
      v_order.id
    );
  end if;

  v_released := private.release_order_inventory(
    v_order.id,
    left(coalesce(nullif(trim(p_reason), ''), 'Checkout creation failed'), 500),
    'released'
  );

  return jsonb_build_object(
    'status',
    'cancelled',
    'order_id',
    v_order.id,
    'order_number',
    v_order.order_number,
    'released_line_count',
    v_released
  );
end;
$$;

revoke all on function public.commerce_cancel_checkout_order(bigint, text)
  from public, anon, authenticated;
grant execute on function public.commerce_cancel_checkout_order(bigint, text)
  to service_role;

create or replace function public.commerce_mark_stripe_checkout_pending(
  p_external_event_id text,
  p_event_type text,
  p_payload jsonb,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_amount_total_cents bigint,
  p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id bigint;
  v_order public.orders%rowtype;
  v_extended_until timestamptz := now() + interval '3 days';
begin
  insert into public.integration_events (
    provider,
    external_event_id,
    event_type,
    payload,
    attempt_count
  )
  values (
    'stripe',
    p_external_event_id,
    p_event_type,
    coalesce(p_payload, '{}'::jsonb),
    1
  )
  on conflict (provider, external_event_id) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return jsonb_build_object('status', 'duplicate');
  end if;

  select *
  into v_order
  from public.orders
  where stripe_checkout_session_id = p_checkout_session_id
  for update;

  if not found then
    update public.integration_events
    set status = 'failed',
        last_error = 'No order matches the pending Checkout Session.',
        processed_at = now()
    where id = v_event_id;

    return jsonb_build_object('status', 'failed', 'reason', 'order_not_found');
  end if;

  if v_order.payment_status in ('paid', 'partially_refunded', 'refunded') then
    update public.integration_events
    set status = 'ignored',
        processed_at = now()
    where id = v_event_id;

    return jsonb_build_object('status', 'already_paid', 'order_id', v_order.id);
  end if;

  if upper(coalesce(p_currency, '')) <> v_order.currency
    or p_amount_total_cents <> v_order.total_cents
  then
    update public.integration_events
    set status = 'failed',
        last_error = 'Stripe amount or currency did not match the server order.',
        processed_at = now()
    where id = v_event_id;

    return jsonb_build_object(
      'status',
      'failed',
      'reason',
      'amount_mismatch',
      'order_id',
      v_order.id
    );
  end if;

  update public.orders
  set payment_status = 'pending',
      checkout_expires_at = greatest(checkout_expires_at, v_extended_until),
      stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id)
  where id = v_order.id;

  update public.inventory_reservations
  set expires_at = greatest(expires_at, v_extended_until)
  where order_id = v_order.id
    and status = 'active';

  insert into public.payments (
    order_id,
    provider_checkout_session_id,
    provider_payment_intent_id,
    amount_cents,
    currency,
    status
  )
  values (
    v_order.id,
    p_checkout_session_id,
    p_payment_intent_id,
    p_amount_total_cents,
    upper(p_currency),
    'pending'
  )
  on conflict (provider_checkout_session_id) do update
  set provider_payment_intent_id = coalesce(
        excluded.provider_payment_intent_id,
        public.payments.provider_payment_intent_id
      ),
      status = case
        when public.payments.status = 'succeeded' then public.payments.status
        else 'pending'
      end;

  update public.integration_events
  set status = 'processed',
      processed_at = now()
  where id = v_event_id;

  return jsonb_build_object(
    'status',
    'processed',
    'order_id',
    v_order.id,
    'order_number',
    v_order.order_number,
    'reservation_expires_at',
    v_extended_until
  );
end;
$$;

revoke all on function public.commerce_mark_stripe_checkout_pending(
  text,
  text,
  jsonb,
  text,
  text,
  bigint,
  text
) from public, anon, authenticated;
grant execute on function public.commerce_mark_stripe_checkout_pending(
  text,
  text,
  jsonb,
  text,
  text,
  bigint,
  text
) to service_role;

create or replace function public.commerce_mark_stripe_checkout_paid(
  p_external_event_id text,
  p_event_type text,
  p_payload jsonb,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_amount_total_cents bigint,
  p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id bigint;
  v_order public.orders%rowtype;
  v_reservation record;
begin
  if jsonb_typeof(coalesce(p_payload, '{}'::jsonb)) <> 'object' then
    raise exception 'Stripe event payload must be an object'
      using errcode = '22023';
  end if;

  insert into public.integration_events (
    provider,
    external_event_id,
    event_type,
    payload,
    attempt_count
  )
  values (
    'stripe',
    p_external_event_id,
    p_event_type,
    coalesce(p_payload, '{}'::jsonb),
    1
  )
  on conflict (provider, external_event_id) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return jsonb_build_object('status', 'duplicate');
  end if;

  select *
  into v_order
  from public.orders
  where stripe_checkout_session_id = p_checkout_session_id
  for update;

  if not found then
    update public.integration_events
    set status = 'failed',
        last_error = 'No order matches the Checkout Session.',
        processed_at = now()
    where id = v_event_id;

    return jsonb_build_object('status', 'failed', 'reason', 'order_not_found');
  end if;

  if v_order.payment_status in ('paid', 'partially_refunded', 'refunded') then
    update public.integration_events
    set status = 'ignored',
        processed_at = now()
    where id = v_event_id;

    return jsonb_build_object(
      'status',
      'already_paid',
      'order_id',
      v_order.id,
      'order_number',
      v_order.order_number
    );
  end if;

  if upper(coalesce(p_currency, '')) <> v_order.currency
    or p_amount_total_cents <> v_order.total_cents
  then
    update public.integration_events
    set status = 'failed',
        last_error = 'Stripe amount or currency did not match the server order.',
        processed_at = now()
    where id = v_event_id;

    return jsonb_build_object(
      'status',
      'failed',
      'reason',
      'amount_mismatch',
      'order_id',
      v_order.id
    );
  end if;

  perform 1
  from public.inventory_levels il
  join public.inventory_reservations ir
    on ir.variant_id = il.variant_id
   and ir.location_id = il.location_id
  where ir.order_id = v_order.id
    and ir.status = 'active'
  order by il.variant_id, il.location_id
  for update of il;

  perform 1
  from public.inventory_reservations
  where order_id = v_order.id
    and status = 'active'
  order by variant_id, location_id
  for update;

  if exists (
    select 1
    from public.inventory_reservations ir
    join public.inventory_levels il
      on il.variant_id = ir.variant_id
     and il.location_id = ir.location_id
    where ir.order_id = v_order.id
      and ir.status = 'active'
      and (
        il.reserved < ir.quantity
        or (not il.allow_backorder and il.on_hand < ir.quantity)
      )
  ) then
    update public.integration_events
    set status = 'failed',
        last_error = 'Reserved inventory could not be converted to a sale.',
        processed_at = now()
    where id = v_event_id;

    return jsonb_build_object(
      'status',
      'failed',
      'reason',
      'inventory_inconsistent',
      'order_id',
      v_order.id
    );
  end if;

  for v_reservation in
    select *
    from public.inventory_reservations
    where order_id = v_order.id
      and status = 'active'
    order by variant_id, location_id
  loop
    update public.inventory_levels
    set on_hand = greatest(on_hand - v_reservation.quantity, 0),
        reserved = reserved - v_reservation.quantity
    where variant_id = v_reservation.variant_id
      and location_id = v_reservation.location_id;

    update public.inventory_reservations
    set status = 'converted',
        converted_at = now()
    where id = v_reservation.id;

    insert into public.inventory_ledger (
      variant_id,
      location_id,
      order_id,
      reservation_id,
      event_type,
      delta_on_hand,
      delta_reserved,
      reason,
      metadata
    )
    values (
      v_reservation.variant_id,
      v_reservation.location_id,
      v_order.id,
      v_reservation.id,
      'sale',
      -v_reservation.quantity,
      -v_reservation.quantity,
      'Stripe Checkout payment completed',
      jsonb_build_object('stripe_event_id', p_external_event_id)
    );
  end loop;

  update public.orders
  set status = 'paid',
      payment_status = 'paid',
      fulfillment_status = 'reserved',
      stripe_payment_intent_id = p_payment_intent_id,
      paid_at = now()
  where id = v_order.id;

  insert into public.payments (
    order_id,
    provider_checkout_session_id,
    provider_payment_intent_id,
    amount_cents,
    currency,
    status,
    captured_at
  )
  values (
    v_order.id,
    p_checkout_session_id,
    p_payment_intent_id,
    p_amount_total_cents,
    upper(p_currency),
    'succeeded',
    now()
  )
  on conflict (provider_checkout_session_id) do update
  set provider_payment_intent_id = excluded.provider_payment_intent_id,
      amount_cents = excluded.amount_cents,
      currency = excluded.currency,
      status = 'succeeded',
      captured_at = coalesce(public.payments.captured_at, excluded.captured_at);

  insert into public.notification_outbox (
    order_id,
    channel,
    template_key,
    dedupe_key,
    recipient,
    payload
  )
  values (
    v_order.id,
    'email',
    'order_confirmation',
    'order:' || v_order.id || ':payment:' || p_external_event_id,
    v_order.email,
    jsonb_build_object(
      'order_number', v_order.order_number,
      'public_id', v_order.public_id,
      'fulfillment_method', v_order.fulfillment_method
    )
  );

  insert into public.audit_log (
    action,
    entity_type,
    entity_id,
    before_state,
    after_state,
    metadata
  )
  values (
    'stripe_payment_captured',
    'order',
    v_order.id::text,
    jsonb_build_object(
      'status', v_order.status,
      'payment_status', v_order.payment_status
    ),
    jsonb_build_object(
      'status', 'paid',
      'payment_status', 'paid',
      'amount_cents', p_amount_total_cents
    ),
    jsonb_build_object(
      'stripe_event_id', p_external_event_id,
      'checkout_session_id', p_checkout_session_id
    )
  );

  update public.integration_events
  set status = 'processed',
      processed_at = now()
  where id = v_event_id;

  return jsonb_build_object(
    'status',
    'processed',
    'order_id',
    v_order.id,
    'order_number',
    v_order.order_number
  );
end;
$$;

revoke all on function public.commerce_mark_stripe_checkout_paid(
  text,
  text,
  jsonb,
  text,
  text,
  bigint,
  text
) from public, anon, authenticated;
grant execute on function public.commerce_mark_stripe_checkout_paid(
  text,
  text,
  jsonb,
  text,
  text,
  bigint,
  text
) to service_role;

create or replace function public.commerce_expire_stripe_checkout(
  p_external_event_id text,
  p_event_type text,
  p_payload jsonb,
  p_checkout_session_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id bigint;
  v_order_id bigint;
  v_order_number text;
  v_order_status text;
  v_order_email text;
  v_order_public_id uuid;
  v_released integer;
begin
  insert into public.integration_events (
    provider,
    external_event_id,
    event_type,
    payload,
    attempt_count
  )
  values (
    'stripe',
    p_external_event_id,
    p_event_type,
    coalesce(p_payload, '{}'::jsonb),
    1
  )
  on conflict (provider, external_event_id) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return jsonb_build_object('status', 'duplicate');
  end if;

  select id, order_number, status, email, public_id
  into
    v_order_id,
    v_order_number,
    v_order_status,
    v_order_email,
    v_order_public_id
  from public.orders
  where stripe_checkout_session_id = p_checkout_session_id
  for update;

  if not found then
    update public.integration_events
    set status = 'ignored',
        last_error = 'No order matches the expired Checkout Session.',
        processed_at = now()
    where id = v_event_id;

    return jsonb_build_object('status', 'ignored', 'reason', 'order_not_found');
  end if;

  if v_order_status not in ('draft', 'pending_payment', 'payment_failed') then
    update public.integration_events
    set status = 'ignored',
        processed_at = now()
    where id = v_event_id;

    return jsonb_build_object(
      'status',
      'ignored',
      'reason',
      'order_not_releasable',
      'order_id',
      v_order_id
    );
  end if;

  v_released := private.release_order_inventory(
    v_order_id,
    'Stripe Checkout Session expired',
    'expired'
  );

  update public.payments
  set status = case
        when p_event_type = 'checkout.session.async_payment_failed' then 'failed'
        else 'cancelled'
      end,
      failure_code = case
        when p_event_type = 'checkout.session.async_payment_failed'
          then 'async_payment_failed'
        else failure_code
      end,
      failure_message = case
        when p_event_type = 'checkout.session.async_payment_failed'
          then 'Stripe reported that the asynchronous payment failed.'
        else failure_message
      end
  where provider_checkout_session_id = p_checkout_session_id
    and status = 'pending';

  insert into public.notification_outbox (
    order_id,
    channel,
    template_key,
    dedupe_key,
    recipient,
    payload
  )
  values (
    v_order_id,
    'email',
    case
      when p_event_type = 'checkout.session.async_payment_failed'
        then 'payment_failed'
      else 'order_cancelled'
    end,
    'order:' || v_order_id || ':checkout:' || p_external_event_id,
    v_order_email,
    jsonb_build_object(
      'order_number', v_order_number,
      'public_id', v_order_public_id,
      'payment_status', 'failed'
    )
  )
  on conflict (dedupe_key) do nothing;

  update public.integration_events
  set status = 'processed',
      processed_at = now()
  where id = v_event_id;

  return jsonb_build_object(
    'status',
    'processed',
    'order_id',
    v_order_id,
    'order_number',
    v_order_number,
    'released_line_count',
    v_released
  );
end;
$$;

revoke all on function public.commerce_expire_stripe_checkout(text, text, jsonb, text)
  from public, anon, authenticated;
grant execute on function public.commerce_expire_stripe_checkout(text, text, jsonb, text)
  to service_role;

create or replace function public.commerce_expire_stale_orders(
  p_limit integer default 100
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order record;
  v_expired integer := 0;
begin
  if p_limit not between 1 and 500 then
    raise exception 'Limit must be between 1 and 500'
      using errcode = '22023';
  end if;

  for v_order in
    select id
    from public.orders
    where status = 'pending_payment'
      and checkout_expires_at < now()
    order by id
    for update skip locked
    limit p_limit
  loop
    perform private.release_order_inventory(
      v_order.id,
      'Checkout reservation expired',
      'expired'
    );
    v_expired := v_expired + 1;
  end loop;

  return v_expired;
end;
$$;

revoke all on function public.commerce_expire_stale_orders(integer)
  from public, anon, authenticated;
grant execute on function public.commerce_expire_stale_orders(integer)
  to service_role;

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
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required'
      using errcode = '42501';
  end if;

  insert into public.inventory_levels (variant_id, location_id)
  values (p_variant_id, p_location_id)
  on conflict (variant_id, location_id) do nothing;

  select *
  into v_level
  from public.inventory_levels
  where inventory_levels.variant_id = p_variant_id
    and inventory_levels.location_id = p_location_id
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

  update public.inventory_levels
  set on_hand = on_hand + p_delta_on_hand
  where inventory_levels.variant_id = p_variant_id
    and inventory_levels.location_id = p_location_id
  returning * into v_level;

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

comment on function public.commerce_create_checkout_order(
  text,
  text,
  text,
  text,
  jsonb,
  text,
  uuid,
  text,
  jsonb,
  jsonb,
  uuid,
  bigint,
  bigint,
  text,
  timestamptz,
  text
) is
  'Creates a server-priced order and reserves inventory atomically. Service role only.';
comment on function public.commerce_mark_stripe_checkout_paid(
  text,
  text,
  jsonb,
  text,
  text,
  bigint,
  text
) is
  'Idempotently records a verified Stripe event and converts reservations to sales.';

create or replace function public.commerce_update_order_fulfillment(
  p_order_id bigint,
  p_fulfillment_status text,
  p_internal_note text,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_next_order_status text;
  v_template_key text;
  v_released_reservations integer := 0;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required'
      using errcode = '42501';
  end if;

  if p_fulfillment_status not in (
    'unfulfilled',
    'reserved',
    'preparing',
    'ready_for_pickup',
    'ready_to_ship',
    'shipped',
    'delivered',
    'picked_up',
    'returned',
    'cancelled'
  ) then
    raise exception 'Unsupported fulfillment status'
      using errcode = '22023';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found'
      using errcode = 'P0002';
  end if;

  if v_order.payment_status not in ('paid', 'partially_refunded', 'refunded')
    and p_fulfillment_status not in ('cancelled', 'unfulfilled')
  then
    raise exception 'Only paid orders can be fulfilled'
      using errcode = '23514';
  end if;

  if p_fulfillment_status = 'cancelled'
    and v_order.payment_status in ('paid', 'partially_refunded')
  then
    raise exception 'Refund the paid order before cancelling fulfillment'
      using errcode = '23514';
  end if;

  if p_fulfillment_status = 'cancelled'
    and v_order.status in ('draft', 'pending_payment', 'payment_failed')
  then
    v_released_reservations := private.release_order_inventory(
      v_order.id,
      'Order cancelled by staff',
      'released'
    );
  end if;

  v_next_order_status := case p_fulfillment_status
    when 'preparing' then 'processing'
    when 'ready_for_pickup' then 'ready_for_pickup'
    when 'ready_to_ship' then 'ready_to_ship'
    when 'shipped' then 'shipped'
    when 'delivered' then 'completed'
    when 'picked_up' then 'completed'
    when 'returned' then 'completed'
    when 'cancelled' then 'cancelled'
    else v_order.status
  end;

  v_template_key := case p_fulfillment_status
    when 'preparing' then 'order_preparing'
    when 'ready_for_pickup' then 'order_ready_for_pickup'
    when 'ready_to_ship' then 'order_ready_to_ship'
    when 'shipped' then 'order_shipped'
    when 'delivered' then 'order_delivered'
    when 'picked_up' then 'order_picked_up'
    when 'returned' then 'return_status_updated'
    when 'cancelled' then 'order_cancelled'
    else null
  end;

  update public.orders
  set fulfillment_status = p_fulfillment_status,
      status = v_next_order_status,
      internal_note = case
        when p_internal_note is null then internal_note
        else nullif(left(trim(p_internal_note), 2000), '')
      end,
      completed_at = case
        when p_fulfillment_status in ('delivered', 'picked_up')
          then coalesce(completed_at, now())
        else completed_at
      end,
      cancelled_at = case
        when p_fulfillment_status = 'cancelled'
          then coalesce(cancelled_at, now())
        else cancelled_at
      end
  where id = v_order.id;

  if v_template_key is not null
    and v_order.fulfillment_status <> p_fulfillment_status
  then
    insert into public.notification_outbox (
      order_id,
      channel,
      template_key,
      dedupe_key,
      recipient,
      payload
    )
    values (
      v_order.id,
      'email',
      v_template_key,
      'order:' || v_order.id || ':fulfillment:' || p_fulfillment_status,
      v_order.email,
      jsonb_build_object(
        'order_number', v_order.order_number,
        'public_id', v_order.public_id,
        'fulfillment_status', p_fulfillment_status
      )
    )
    on conflict (dedupe_key) do nothing;
  end if;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_state,
    after_state
  )
  values (
    p_actor_user_id,
    'order_fulfillment_updated',
    'order',
    v_order.id::text,
    jsonb_build_object(
      'status', v_order.status,
      'fulfillment_status', v_order.fulfillment_status
    ),
    jsonb_build_object(
      'status', v_next_order_status,
      'fulfillment_status', p_fulfillment_status
    )
  );

  return jsonb_build_object(
    'status',
    'updated',
    'order_id',
    v_order.id,
    'order_status',
    v_next_order_status,
    'fulfillment_status',
    p_fulfillment_status,
    'released_reservations',
    v_released_reservations
  );
end;
$$;

revoke all on function public.commerce_update_order_fulfillment(
  bigint,
  text,
  text,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_update_order_fulfillment(
  bigint,
  text,
  text,
  uuid
) to service_role;

create or replace function public.commerce_add_manual_tracking(
  p_order_id bigint,
  p_provider text,
  p_service_name text,
  p_tracking_pin text,
  p_tracking_url text,
  p_idempotency_key uuid,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_shipment public.shipments%rowtype;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required'
      using errcode = '42501';
  end if;

  if p_provider not in ('canada_post', 'local_delivery', 'other') then
    raise exception 'Unsupported tracking provider'
      using errcode = '22023';
  end if;

  if nullif(trim(p_tracking_pin), '') is null then
    raise exception 'Tracking number is required'
      using errcode = '22023';
  end if;

  select *
  into v_shipment
  from public.shipments
  where idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'status',
      'duplicate',
      'shipment_id',
      v_shipment.id,
      'tracking_pin',
      v_shipment.tracking_pin
    );
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found'
      using errcode = 'P0002';
  end if;

  if v_order.payment_status not in ('paid', 'partially_refunded') then
    raise exception 'Tracking can only be added to a paid order'
      using errcode = '23514';
  end if;

  insert into public.shipments (
    order_id,
    location_id,
    provider,
    idempotency_key,
    service_code,
    service_name,
    tracking_pin,
    tracking_url,
    status,
    is_sandbox,
    shipped_at
  )
  values (
    v_order.id,
    v_order.location_id,
    p_provider,
    p_idempotency_key,
    case when p_provider = 'other' then 'EXTERNAL' else v_order.shipping_service_code end,
    nullif(left(trim(p_service_name), 120), ''),
    left(trim(p_tracking_pin), 80),
    nullif(left(trim(p_tracking_url), 1000), ''),
    'in_transit',
    true,
    now()
  )
  returning * into v_shipment;

  update public.orders
  set status = 'shipped',
      fulfillment_status = 'shipped'
  where id = v_order.id;

  insert into public.notification_outbox (
    order_id,
    channel,
    template_key,
    dedupe_key,
    recipient,
    payload
  )
  values (
    v_order.id,
    'email',
    'order_shipped',
    'shipment:' || v_shipment.id || ':tracking-created',
    v_order.email,
    jsonb_build_object(
      'order_number', v_order.order_number,
      'public_id', v_order.public_id,
      'tracking_pin', v_shipment.tracking_pin,
      'tracking_url', v_shipment.tracking_url,
      'service_name', v_shipment.service_name
    )
  )
  on conflict (dedupe_key) do nothing;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    after_state
  )
  values (
    p_actor_user_id,
    'manual_tracking_added',
    'shipment',
    v_shipment.id::text,
    jsonb_build_object(
      'order_id', v_order.id,
      'provider', v_shipment.provider,
      'tracking_pin', v_shipment.tracking_pin
    )
  );

  return jsonb_build_object(
    'status',
    'created',
    'shipment_id',
    v_shipment.id,
    'tracking_pin',
    v_shipment.tracking_pin
  );
end;
$$;

revoke all on function public.commerce_add_manual_tracking(
  bigint,
  text,
  text,
  text,
  text,
  uuid,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_add_manual_tracking(
  bigint,
  text,
  text,
  text,
  text,
  uuid,
  uuid
) to service_role;

create or replace function public.commerce_prepare_stripe_refund(
  p_order_id bigint,
  p_amount_cents bigint,
  p_reason text,
  p_restock_items boolean,
  p_items jsonb,
  p_idempotency_key uuid,
  p_actor_user_id uuid
)
returns table (
  refund_id bigint,
  payment_intent_id text,
  amount_cents bigint,
  order_number text,
  current_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_payment public.payments%rowtype;
  v_refund public.refunds%rowtype;
  v_pending_cents bigint;
  v_available_cents bigint;
  v_normalized_items jsonb := '[]'::jsonb;
  v_item record;
  v_order_quantity integer;
  v_already_restocked integer;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role = 'admin'
  ) then
    raise exception 'An admin actor is required for refunds'
      using errcode = '42501';
  end if;

  select *
  into v_refund
  from public.refunds
  where idempotency_key = p_idempotency_key;

  if found then
    select *
    into v_payment
    from public.payments
    where id = v_refund.payment_id;

    select *
    into v_order
    from public.orders
    where id = v_refund.order_id;

    return query
    select
      v_refund.id,
      v_payment.provider_payment_intent_id,
      v_refund.amount_cents,
      v_order.order_number,
      v_refund.status;
    return;
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Refund amount must be greater than zero'
      using errcode = '22023';
  end if;

  if nullif(trim(p_reason), '') is null then
    raise exception 'Refund reason is required'
      using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_items, '[]'::jsonb)) <> 'array' then
    raise exception 'Refund items must be an array'
      using errcode = '22023';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found'
      using errcode = 'P0002';
  end if;

  select *
  into v_payment
  from public.payments
  where order_id = v_order.id
    and status in ('succeeded', 'partially_refunded')
  order by id desc
  limit 1
  for update;

  if not found or v_payment.provider_payment_intent_id is null then
    raise exception 'A refundable Stripe payment was not found'
      using errcode = 'P0002';
  end if;

  perform 1
  from public.refunds
  where payment_id = v_payment.id
  order by id
  for update;

  select coalesce(sum(amount_cents), 0)
  into v_pending_cents
  from public.refunds
  where payment_id = v_payment.id
    and status = 'pending';

  v_available_cents :=
    v_payment.amount_cents - v_payment.refunded_cents - v_pending_cents;

  if p_amount_cents > v_available_cents then
    raise exception 'Refund amount exceeds the remaining refundable balance'
      using errcode = '23514';
  end if;

  if p_restock_items then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'variant_id',
          normalized.variant_id,
          'quantity',
          normalized.quantity
        )
        order by normalized.variant_id
      ),
      '[]'::jsonb
    )
    into v_normalized_items
    from (
      select
        (item ->> 'variant_id')::bigint as variant_id,
        sum((item ->> 'quantity')::integer)::integer as quantity
      from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) as item
      group by (item ->> 'variant_id')::bigint
    ) as normalized;

    if jsonb_array_length(v_normalized_items) = 0 then
      raise exception 'Choose at least one item to restock'
        using errcode = '22023';
    end if;

    for v_item in
      select
        (item ->> 'variant_id')::bigint as variant_id,
        (item ->> 'quantity')::integer as quantity
      from jsonb_array_elements(v_normalized_items) as item
    loop
      if v_item.variant_id is null or v_item.quantity not between 1 and 100 then
        raise exception 'A refund item quantity is invalid'
          using errcode = '22023';
      end if;

      select coalesce(sum(quantity), 0)
      into v_order_quantity
      from public.order_items
      where order_id = v_order.id
        and variant_id = v_item.variant_id;

      select coalesce(sum((refunded_item ->> 'quantity')::integer), 0)
      into v_already_restocked
      from public.refunds previous_refund
      cross join lateral jsonb_array_elements(previous_refund.items) refunded_item
      where previous_refund.order_id = v_order.id
        and previous_refund.status = 'succeeded'
        and previous_refund.restock_items
        and (refunded_item ->> 'variant_id')::bigint = v_item.variant_id;

      if v_item.quantity > (v_order_quantity - v_already_restocked) then
        raise exception 'Restock quantity exceeds the sold quantity'
          using errcode = '23514';
      end if;
    end loop;
  end if;

  insert into public.refunds (
    order_id,
    payment_id,
    requested_by,
    idempotency_key,
    amount_cents,
    reason,
    status,
    restock_items,
    items
  )
  values (
    v_order.id,
    v_payment.id,
    p_actor_user_id,
    p_idempotency_key,
    p_amount_cents,
    left(trim(p_reason), 500),
    'pending',
    p_restock_items,
    v_normalized_items
  )
  returning * into v_refund;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    after_state
  )
  values (
    p_actor_user_id,
    'stripe_refund_requested',
    'refund',
    v_refund.id::text,
    jsonb_build_object(
      'order_id', v_order.id,
      'amount_cents', v_refund.amount_cents,
      'restock_items', v_refund.restock_items
    )
  );

  return query
  select
    v_refund.id,
    v_payment.provider_payment_intent_id,
    v_refund.amount_cents,
    v_order.order_number,
    v_refund.status;
end;
$$;

revoke all on function public.commerce_prepare_stripe_refund(
  bigint,
  bigint,
  text,
  boolean,
  jsonb,
  uuid,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_prepare_stripe_refund(
  bigint,
  bigint,
  text,
  boolean,
  jsonb,
  uuid,
  uuid
) to service_role;

create or replace function public.commerce_finalize_stripe_refund(
  p_refund_id bigint,
  p_provider_refund_id text,
  p_status text,
  p_provider_response jsonb,
  p_failure_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_refund public.refunds%rowtype;
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_item record;
  v_new_refunded_cents bigint;
  v_is_full_refund boolean;
begin
  if p_status not in ('pending', 'succeeded', 'failed', 'cancelled') then
    raise exception 'Unsupported refund status'
      using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_provider_response, '{}'::jsonb)) <> 'object' then
    raise exception 'Provider response must be an object'
      using errcode = '22023';
  end if;

  select *
  into v_refund
  from public.refunds
  where id = p_refund_id
  for update;

  if not found then
    raise exception 'Refund not found'
      using errcode = 'P0002';
  end if;

  select *
  into v_payment
  from public.payments
  where id = v_refund.payment_id
  for update;

  select *
  into v_order
  from public.orders
  where id = v_refund.order_id
  for update;

  if v_refund.status = 'succeeded' and p_status = 'succeeded' then
    return jsonb_build_object(
      'status',
      'duplicate',
      'refund_id',
      v_refund.id,
      'order_id',
      v_order.id
    );
  end if;

  update public.refunds
  set provider_refund_id = coalesce(
        nullif(trim(p_provider_refund_id), ''),
        provider_refund_id
      ),
      status = p_status,
      provider_response = coalesce(p_provider_response, '{}'::jsonb),
      failure_message = nullif(left(coalesce(p_failure_message, ''), 1000), ''),
      processed_at = case
        when p_status in ('succeeded', 'failed', 'cancelled') then now()
        else processed_at
      end
  where id = v_refund.id;

  if p_status = 'succeeded' then
    if v_payment.refunded_cents + v_refund.amount_cents > v_payment.amount_cents then
      raise exception 'Refund would exceed the captured payment'
        using errcode = '23514';
    end if;

    v_new_refunded_cents :=
      v_payment.refunded_cents + v_refund.amount_cents;
    v_is_full_refund := v_new_refunded_cents = v_payment.amount_cents;

    update public.payments
    set refunded_cents = v_new_refunded_cents,
        status = case
          when v_is_full_refund then 'refunded'
          else 'partially_refunded'
        end
    where id = v_payment.id;

    update public.orders
    set refunded_total_cents = v_new_refunded_cents,
        payment_status = case
          when v_is_full_refund then 'refunded'
          else 'partially_refunded'
        end,
        status = case
          when v_is_full_refund then 'refunded'
          else 'partially_refunded'
        end
    where id = v_order.id;

    if v_refund.restock_items then
      for v_item in
        select
          (item ->> 'variant_id')::bigint as variant_id,
          (item ->> 'quantity')::integer as quantity
        from jsonb_array_elements(v_refund.items) as item
        order by (item ->> 'variant_id')::bigint
      loop
        insert into public.inventory_levels (
          variant_id,
          location_id,
          on_hand,
          reserved
        )
        values (
          v_item.variant_id,
          v_order.location_id,
          0,
          0
        )
        on conflict (variant_id, location_id) do nothing;

        update public.inventory_levels
        set on_hand = on_hand + v_item.quantity
        where variant_id = v_item.variant_id
          and location_id = v_order.location_id;

        insert into public.inventory_ledger (
          variant_id,
          location_id,
          order_id,
          actor_user_id,
          event_type,
          delta_on_hand,
          reason,
          metadata
        )
        values (
          v_item.variant_id,
          v_order.location_id,
          v_order.id,
          v_refund.requested_by,
          'return',
          v_item.quantity,
          'Refunded item returned to sellable inventory',
          jsonb_build_object('refund_id', v_refund.id)
        );
      end loop;
    end if;

    insert into public.notification_outbox (
      order_id,
      channel,
      template_key,
      dedupe_key,
      recipient,
      payload
    )
    values (
      v_order.id,
      'email',
      case when v_is_full_refund then 'refund_full' else 'refund_partial' end,
      'refund:' || v_refund.id || ':succeeded',
      v_order.email,
      jsonb_build_object(
        'order_number', v_order.order_number,
        'public_id', v_order.public_id,
        'refund_amount_cents', v_refund.amount_cents,
        'currency', v_order.currency,
        'is_full_refund', v_is_full_refund
      )
    )
    on conflict (dedupe_key) do nothing;
  end if;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_state,
    after_state
  )
  values (
    v_refund.requested_by,
    'stripe_refund_' || p_status,
    'refund',
    v_refund.id::text,
    jsonb_build_object('status', v_refund.status),
    jsonb_build_object(
      'status', p_status,
      'provider_refund_id', p_provider_refund_id,
      'amount_cents', v_refund.amount_cents
    )
  );

  return jsonb_build_object(
    'status',
    p_status,
    'refund_id',
    v_refund.id,
    'order_id',
    v_order.id,
    'amount_cents',
    v_refund.amount_cents
  );
end;
$$;

revoke all on function public.commerce_finalize_stripe_refund(
  bigint,
  text,
  text,
  jsonb,
  text
) from public, anon, authenticated;
grant execute on function public.commerce_finalize_stripe_refund(
  bigint,
  text,
  text,
  jsonb,
  text
) to service_role;

create or replace function public.commerce_reconcile_stripe_refund_event(
  p_external_event_id text,
  p_event_type text,
  p_payload jsonb,
  p_refund_id bigint,
  p_provider_refund_id text,
  p_status text,
  p_failure_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id bigint;
  v_result jsonb;
begin
  insert into public.integration_events (
    provider,
    external_event_id,
    event_type,
    payload,
    status,
    attempt_count
  )
  values (
    'stripe',
    p_external_event_id,
    p_event_type,
    coalesce(p_payload, '{}'::jsonb),
    'received',
    1
  )
  on conflict (provider, external_event_id) do update
  set payload = excluded.payload,
      event_type = excluded.event_type,
      status = 'received',
      attempt_count = public.integration_events.attempt_count + 1,
      last_error = null
  where public.integration_events.status <> 'processed'
  returning id into v_event_id;

  if v_event_id is null then
    return jsonb_build_object('status', 'duplicate');
  end if;

  v_result := public.commerce_finalize_stripe_refund(
    p_refund_id,
    p_provider_refund_id,
    p_status,
    coalesce(p_payload, '{}'::jsonb),
    p_failure_message
  );

  update public.integration_events
  set status = 'processed',
      processed_at = now()
  where id = v_event_id;

  return v_result;
end;
$$;

revoke all on function public.commerce_reconcile_stripe_refund_event(
  text,
  text,
  jsonb,
  bigint,
  text,
  text,
  text
) from public, anon, authenticated;
grant execute on function public.commerce_reconcile_stripe_refund_event(
  text,
  text,
  jsonb,
  bigint,
  text,
  text,
  text
) to service_role;

create or replace function public.commerce_upsert_product(
  p_product_id bigint,
  p_product jsonb,
  p_variants jsonb,
  p_images jsonb,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product public.products%rowtype;
  v_before jsonb;
  v_variant jsonb;
  v_variant_id bigint;
  v_submitted_variant_ids bigint[] := '{}';
  v_image jsonb;
  v_location_id bigint;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role = 'admin'
  ) then
    raise exception 'An admin actor is required for product management'
      using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_product, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_variants, '[]'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(p_images, '[]'::jsonb)) <> 'array'
  then
    raise exception 'Product payload is invalid'
      using errcode = '22023';
  end if;

  if jsonb_array_length(p_variants) < 1
    or jsonb_array_length(p_variants) > 50
  then
    raise exception 'A product requires between 1 and 50 variants'
      using errcode = '22023';
  end if;

  select id
  into v_location_id
  from public.store_locations
  where code = 'steveston'
    and is_active;

  if v_location_id is null then
    raise exception 'Steveston inventory location is unavailable'
      using errcode = 'P0002';
  end if;

  if p_product_id is not null then
    select *
    into v_product
    from public.products
    where id = p_product_id
    for update;

    if not found then
      raise exception 'Product not found'
        using errcode = 'P0002';
    end if;

    v_before := to_jsonb(v_product);

    update public.products
    set category_id = nullif(p_product ->> 'category_id', '')::bigint,
        brand_id = nullif(p_product ->> 'brand_id', '')::bigint,
        slug = p_product ->> 'slug',
        name = p_product ->> 'name',
        short_description = nullif(p_product ->> 'short_description', ''),
        description = nullif(p_product ->> 'description', ''),
        product_type = p_product ->> 'product_type',
        status = p_product ->> 'status',
        tags = array(
          select jsonb_array_elements_text(
            coalesce(p_product -> 'tags', '[]'::jsonb)
          )
        ),
        track_inventory = coalesce(
          (p_product ->> 'track_inventory')::boolean,
          true
        ),
        requires_shipping = coalesce(
          (p_product ->> 'requires_shipping')::boolean,
          true
        ),
        seo_title = nullif(p_product ->> 'seo_title', ''),
        seo_description = nullif(p_product ->> 'seo_description', ''),
        published_at = case
          when p_product ->> 'status' = 'active'
            then coalesce(published_at, now())
          else null
        end
    where id = p_product_id
    returning * into v_product;
  else
    insert into public.products (
      category_id,
      brand_id,
      slug,
      name,
      short_description,
      description,
      product_type,
      status,
      tags,
      track_inventory,
      requires_shipping,
      seo_title,
      seo_description,
      published_at
    )
    values (
      nullif(p_product ->> 'category_id', '')::bigint,
      nullif(p_product ->> 'brand_id', '')::bigint,
      p_product ->> 'slug',
      p_product ->> 'name',
      nullif(p_product ->> 'short_description', ''),
      nullif(p_product ->> 'description', ''),
      p_product ->> 'product_type',
      p_product ->> 'status',
      array(
        select jsonb_array_elements_text(
          coalesce(p_product -> 'tags', '[]'::jsonb)
        )
      ),
      coalesce((p_product ->> 'track_inventory')::boolean, true),
      coalesce((p_product ->> 'requires_shipping')::boolean, true),
      nullif(p_product ->> 'seo_title', ''),
      nullif(p_product ->> 'seo_description', ''),
      case
        when p_product ->> 'status' = 'active' then now()
        else null
      end
    )
    returning * into v_product;
  end if;

  for v_variant in
    select value
    from jsonb_array_elements(p_variants)
  loop
    v_variant_id := nullif(v_variant ->> 'id', '')::bigint;

    if v_variant_id is null then
      insert into public.product_variants (
        product_id,
        sku,
        barcode,
        title,
        option_values,
        price_cents,
        compare_at_price_cents,
        cost_cents,
        weight_grams,
        length_cm,
        width_cm,
        height_cm,
        pickup_eligible,
        local_delivery_eligible,
        canada_post_eligible,
        shipping_profile,
        tax_code,
        is_active,
        sort_order
      )
      values (
        v_product.id,
        v_variant ->> 'sku',
        nullif(v_variant ->> 'barcode', ''),
        coalesce(nullif(v_variant ->> 'title', ''), 'Default'),
        coalesce(v_variant -> 'option_values', '{}'::jsonb),
        (v_variant ->> 'price_cents')::bigint,
        nullif(v_variant ->> 'compare_at_price_cents', '')::bigint,
        nullif(v_variant ->> 'cost_cents', '')::bigint,
        nullif(v_variant ->> 'weight_grams', '')::integer,
        nullif(v_variant ->> 'length_cm', '')::numeric,
        nullif(v_variant ->> 'width_cm', '')::numeric,
        nullif(v_variant ->> 'height_cm', '')::numeric,
        coalesce((v_variant ->> 'pickup_eligible')::boolean, true),
        coalesce((v_variant ->> 'local_delivery_eligible')::boolean, true),
        coalesce((v_variant ->> 'canada_post_eligible')::boolean, true),
        coalesce(nullif(v_variant ->> 'shipping_profile', ''), 'standard'),
        nullif(v_variant ->> 'tax_code', ''),
        coalesce((v_variant ->> 'is_active')::boolean, true),
        coalesce((v_variant ->> 'sort_order')::integer, 0)
      )
      returning id into v_variant_id;

      insert into public.inventory_levels (
        variant_id,
        location_id,
        on_hand,
        reserved,
        reorder_point,
        allow_backorder
      )
      values (
        v_variant_id,
        v_location_id,
        coalesce((v_variant ->> 'initial_on_hand')::integer, 0),
        0,
        coalesce((v_variant ->> 'reorder_point')::integer, 0),
        coalesce((v_variant ->> 'allow_backorder')::boolean, false)
      );
    else
      update public.product_variants
      set sku = v_variant ->> 'sku',
          barcode = nullif(v_variant ->> 'barcode', ''),
          title = coalesce(nullif(v_variant ->> 'title', ''), 'Default'),
          option_values = coalesce(v_variant -> 'option_values', '{}'::jsonb),
          price_cents = (v_variant ->> 'price_cents')::bigint,
          compare_at_price_cents =
            nullif(v_variant ->> 'compare_at_price_cents', '')::bigint,
          cost_cents = nullif(v_variant ->> 'cost_cents', '')::bigint,
          weight_grams = nullif(v_variant ->> 'weight_grams', '')::integer,
          length_cm = nullif(v_variant ->> 'length_cm', '')::numeric,
          width_cm = nullif(v_variant ->> 'width_cm', '')::numeric,
          height_cm = nullif(v_variant ->> 'height_cm', '')::numeric,
          pickup_eligible = coalesce(
            (v_variant ->> 'pickup_eligible')::boolean,
            true
          ),
          local_delivery_eligible = coalesce(
            (v_variant ->> 'local_delivery_eligible')::boolean,
            true
          ),
          canada_post_eligible = coalesce(
            (v_variant ->> 'canada_post_eligible')::boolean,
            true
          ),
          shipping_profile = coalesce(
            nullif(v_variant ->> 'shipping_profile', ''),
            'standard'
          ),
          tax_code = nullif(v_variant ->> 'tax_code', ''),
          is_active = coalesce((v_variant ->> 'is_active')::boolean, true),
          sort_order = coalesce((v_variant ->> 'sort_order')::integer, 0)
      where id = v_variant_id
        and product_id = v_product.id;

      if not found then
        raise exception 'A submitted variant does not belong to this product'
          using errcode = '23514';
      end if;

      update public.inventory_levels
      set reorder_point = coalesce(
            (v_variant ->> 'reorder_point')::integer,
            reorder_point
          ),
          allow_backorder = coalesce(
            (v_variant ->> 'allow_backorder')::boolean,
            allow_backorder
          )
      where variant_id = v_variant_id
        and location_id = v_location_id;
    end if;

    v_submitted_variant_ids :=
      array_append(v_submitted_variant_ids, v_variant_id);
  end loop;

  update public.product_variants
  set is_active = false
  where product_id = v_product.id
    and not (id = any(v_submitted_variant_ids));

  delete from public.product_images
  where product_id = v_product.id;

  for v_image in
    select value
    from jsonb_array_elements(p_images)
  loop
    insert into public.product_images (
      product_id,
      storage_path,
      alt_text,
      width,
      height,
      sort_order
    )
    values (
      v_product.id,
      v_image ->> 'storage_path',
      v_image ->> 'alt_text',
      nullif(v_image ->> 'width', '')::integer,
      nullif(v_image ->> 'height', '')::integer,
      coalesce((v_image ->> 'sort_order')::integer, 0)
    );
  end loop;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_state,
    after_state
  )
  values (
    p_actor_user_id,
    case
      when p_product_id is null then 'product_created'
      else 'product_updated'
    end,
    'product',
    v_product.id::text,
    v_before,
    jsonb_build_object(
      'id', v_product.id,
      'slug', v_product.slug,
      'name', v_product.name,
      'status', v_product.status,
      'variant_count', jsonb_array_length(p_variants),
      'image_count', jsonb_array_length(p_images)
    )
  );

  return jsonb_build_object(
    'status',
    case when p_product_id is null then 'created' else 'updated' end,
    'product_id',
    v_product.id,
    'slug',
    v_product.slug
  );
end;
$$;

revoke all on function public.commerce_upsert_product(
  bigint,
  jsonb,
  jsonb,
  jsonb,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_upsert_product(
  bigint,
  jsonb,
  jsonb,
  jsonb,
  uuid
) to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'product-images',
    'product-images',
    true,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'shipping-labels',
    'shipping-labels',
    false,
    10485760,
    array['application/pdf']
  )
on conflict (id) do nothing;

create or replace function public.commerce_prepare_canada_post_shipment(
  p_order_id bigint,
  p_idempotency_key uuid,
  p_package_details jsonb,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_existing public.shipments%rowtype;
  v_shipment public.shipments%rowtype;
  v_package_number integer;
  v_package_count integer;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required to create shipping labels'
      using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_package_details, '{}'::jsonb)) <> 'object' then
    raise exception 'Package details must be an object'
      using errcode = '22023';
  end if;

  v_package_number := nullif(p_package_details ->> 'packageNumber', '')::integer;
  v_package_count := nullif(p_package_details ->> 'packageCount', '')::integer;
  if v_package_number is null
    or v_package_count is null
    or v_package_number not between 1 and 50
    or v_package_count not between 1 and 50
    or v_package_number > v_package_count
  then
    raise exception 'Package number and count are invalid'
      using errcode = '22023';
  end if;

  select *
  into v_existing
  from public.shipments
  where idempotency_key = p_idempotency_key;

  if found then
    if v_existing.order_id <> p_order_id then
      raise exception 'The idempotency key belongs to another order'
        using errcode = '23514';
    end if;

    return jsonb_build_object(
      'status', 'duplicate',
      'shipment', to_jsonb(v_existing)
    );
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found'
      using errcode = 'P0002';
  end if;

  if v_order.payment_status not in ('paid', 'partially_refunded') then
    raise exception 'A Canada Post label requires a paid order'
      using errcode = '23514';
  end if;

  if v_order.fulfillment_method <> 'canada_post'
    or v_order.shipping_address is null
    or v_order.shipping_service_code is null
  then
    raise exception 'The order is not eligible for Canada Post fulfillment'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.shipments
    where order_id = v_order.id
      and provider = 'canada_post'
      and status not in (
        'cancelled',
        'voided',
        'refund_pending',
        'refunded',
        'exception'
      )
      and (package_details ->> 'packageNumber')::integer = v_package_number
  ) then
    raise exception 'This package already has an active Canada Post shipment'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from public.shipments
    where order_id = v_order.id
      and provider = 'canada_post'
      and status not in (
        'cancelled',
        'voided',
        'refund_pending',
        'refunded',
        'exception'
      )
      and (package_details ->> 'packageCount')::integer <> v_package_count
  ) then
    raise exception 'Package count cannot change after label creation begins'
      using errcode = '23514';
  end if;

  insert into public.shipments (
    order_id,
    location_id,
    provider,
    idempotency_key,
    customer_request_id,
    service_code,
    package_details,
    status,
    is_sandbox
  )
  values (
    v_order.id,
    v_order.location_id,
    'canada_post',
    p_idempotency_key,
    left(
      'WB-' || v_order.id || '-' ||
      replace(p_idempotency_key::text, '-', ''),
      35
    ),
    v_order.shipping_service_code,
    p_package_details,
    'pending',
    true
  )
  returning * into v_shipment;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    after_state
  )
  values (
    p_actor_user_id,
    'canada_post_label_requested',
    'shipment',
    v_shipment.id::text,
    jsonb_build_object(
      'order_id', v_order.id,
      'service_code', v_shipment.service_code,
      'idempotency_key', v_shipment.idempotency_key,
      'package_details', v_shipment.package_details
    )
  );

  return jsonb_build_object(
    'status', 'prepared',
    'shipment', to_jsonb(v_shipment)
  );
end;
$$;

revoke all on function public.commerce_prepare_canada_post_shipment(
  bigint,
  uuid,
  jsonb,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_prepare_canada_post_shipment(
  bigint,
  uuid,
  jsonb,
  uuid
) to service_role;

create or replace function public.commerce_record_canada_post_shipment(
  p_shipment_id bigint,
  p_provider_shipment_id text,
  p_provider_self_url text,
  p_provider_refund_url text,
  p_label_artifact_url text,
  p_tracking_pin text,
  p_service_name text,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shipment public.shipments%rowtype;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required to create shipping labels'
      using errcode = '42501';
  end if;

  update public.shipments
  set provider_shipment_id = nullif(left(trim(p_provider_shipment_id), 120), ''),
      provider_self_url = nullif(left(trim(p_provider_self_url), 1000), ''),
      provider_refund_url = nullif(left(trim(p_provider_refund_url), 1000), ''),
      label_artifact_url = nullif(left(trim(p_label_artifact_url), 1000), ''),
      tracking_pin = nullif(left(trim(p_tracking_pin), 80), ''),
      tracking_url = case
        when nullif(trim(p_tracking_pin), '') is null then null
        else
          'https://www.canadapost-postescanada.ca/track-reperage/en#/details/' ||
          left(trim(p_tracking_pin), 80)
      end,
      service_name = nullif(left(trim(p_service_name), 120), '')
  where id = p_shipment_id
    and provider = 'canada_post'
    and is_sandbox
    and status = 'pending'
  returning * into v_shipment;

  if not found then
    raise exception 'Pending Canada Post shipment not found'
      using errcode = 'P0002';
  end if;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    after_state
  )
  values (
    p_actor_user_id,
    'canada_post_shipment_created',
    'shipment',
    v_shipment.id::text,
    jsonb_build_object(
      'provider_shipment_id', v_shipment.provider_shipment_id,
      'tracking_pin', v_shipment.tracking_pin,
      'service_code', v_shipment.service_code
    )
  );

  return to_jsonb(v_shipment);
end;
$$;

revoke all on function public.commerce_record_canada_post_shipment(
  bigint,
  text,
  text,
  text,
  text,
  text,
  text,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_record_canada_post_shipment(
  bigint,
  text,
  text,
  text,
  text,
  text,
  text,
  uuid
) to service_role;

create or replace function public.commerce_finalize_canada_post_shipment(
  p_shipment_id bigint,
  p_label_storage_path text,
  p_label_cost_cents bigint,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shipment public.shipments%rowtype;
  v_order public.orders%rowtype;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required to create shipping labels'
      using errcode = '42501';
  end if;

  if p_label_storage_path is null
    or trim(p_label_storage_path) = ''
    or p_label_cost_cents is null
    or p_label_cost_cents < 0
  then
    raise exception 'Label storage and cost details are required'
      using errcode = '22023';
  end if;

  select *
  into v_shipment
  from public.shipments
  where id = p_shipment_id
  for update;

  if not found
    or v_shipment.provider <> 'canada_post'
    or not v_shipment.is_sandbox
  then
    raise exception 'Canada Post sandbox shipment not found'
      using errcode = 'P0002';
  end if;

  if v_shipment.status = 'label_created'
    and v_shipment.label_storage_path is not null
  then
    return jsonb_build_object(
      'status', 'duplicate',
      'shipment', to_jsonb(v_shipment)
    );
  end if;

  if v_shipment.status <> 'pending'
    or v_shipment.provider_shipment_id is null
    or v_shipment.label_artifact_url is null
  then
    raise exception 'Shipment is not ready to finalize'
      using errcode = '23514';
  end if;

  select *
  into v_order
  from public.orders
  where id = v_shipment.order_id
  for update;

  update public.shipments
  set label_storage_path = left(trim(p_label_storage_path), 1000),
      label_cost_cents = p_label_cost_cents,
      status = 'label_created'
  where id = v_shipment.id
  returning * into v_shipment;

  update public.orders
  set status = case
        when status in ('paid', 'processing') then 'ready_to_ship'
        else status
      end,
      fulfillment_status = case
        when fulfillment_status in ('unfulfilled', 'reserved', 'preparing')
          then 'ready_to_ship'
        else fulfillment_status
      end
  where id = v_order.id;

  insert into public.notification_outbox (
    order_id,
    channel,
    template_key,
    dedupe_key,
    recipient,
    payload
  )
  values (
    v_order.id,
    'email',
    'tracking_created',
    'shipment:' || v_shipment.id || ':label-created',
    v_order.email,
    jsonb_build_object(
      'order_number', v_order.order_number,
      'public_id', v_order.public_id,
      'tracking_pin', v_shipment.tracking_pin,
      'tracking_url', v_shipment.tracking_url,
      'service_name', v_shipment.service_name
    )
  )
  on conflict (dedupe_key) do nothing;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    after_state
  )
  values (
    p_actor_user_id,
    'canada_post_label_stored',
    'shipment',
    v_shipment.id::text,
    jsonb_build_object(
      'order_id', v_order.id,
      'label_storage_path', v_shipment.label_storage_path,
      'label_cost_cents', v_shipment.label_cost_cents,
      'tracking_pin', v_shipment.tracking_pin
    )
  );

  return jsonb_build_object(
    'status', 'label_created',
    'shipment', to_jsonb(v_shipment)
  );
end;
$$;

revoke all on function public.commerce_finalize_canada_post_shipment(
  bigint,
  text,
  bigint,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_finalize_canada_post_shipment(
  bigint,
  text,
  bigint,
  uuid
) to service_role;

create or replace function public.commerce_fail_canada_post_shipment(
  p_shipment_id bigint,
  p_failure_code text,
  p_actor_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shipment public.shipments%rowtype;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required to create shipping labels'
      using errcode = '42501';
  end if;

  update public.shipments
  set status = 'exception',
      package_details = package_details ||
        jsonb_build_object(
          'failure_code',
          left(coalesce(nullif(trim(p_failure_code), ''), 'provider_error'), 120)
        )
  where id = p_shipment_id
    and status = 'pending'
    and provider_shipment_id is null
  returning * into v_shipment;

  if found then
    insert into public.audit_log (
      actor_user_id,
      action,
      entity_type,
      entity_id,
      after_state
    )
    values (
      p_actor_user_id,
      'canada_post_label_failed',
      'shipment',
      v_shipment.id::text,
      jsonb_build_object(
        'order_id', v_shipment.order_id,
        'failure_code', p_failure_code
      )
    );
  end if;
end;
$$;

revoke all on function public.commerce_fail_canada_post_shipment(
  bigint,
  text,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_fail_canada_post_shipment(
  bigint,
  text,
  uuid
) to service_role;

create or replace function public.commerce_create_return(
  p_order_id bigint,
  p_reason text,
  p_items jsonb,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_return public.returns%rowtype;
  v_item jsonb;
  v_order_item public.order_items%rowtype;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required for return management'
      using errcode = '42501';
  end if;

  if char_length(trim(coalesce(p_reason, ''))) not between 2 and 1000
    or jsonb_typeof(coalesce(p_items, '[]'::jsonb)) <> 'array'
    or jsonb_array_length(p_items) < 1
  then
    raise exception 'A return reason and at least one item are required'
      using errcode = '22023';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found'
      using errcode = 'P0002';
  end if;

  if v_order.payment_status not in (
    'paid',
    'partially_refunded',
    'refunded'
  ) then
    raise exception 'Returns require a paid order'
      using errcode = '23514';
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    select *
    into v_order_item
    from public.order_items
    where id = nullif(v_item ->> 'order_item_id', '')::bigint
      and order_id = v_order.id;

    if not found
      or nullif(v_item ->> 'quantity', '')::integer is null
      or (v_item ->> 'quantity')::integer < 1
      or (v_item ->> 'quantity')::integer > v_order_item.quantity
    then
      raise exception 'Return item quantity is invalid'
        using errcode = '23514';
    end if;
  end loop;

  insert into public.returns (
    order_id,
    requested_by,
    reason,
    items
  )
  values (
    v_order.id,
    p_actor_user_id,
    trim(p_reason),
    p_items
  )
  returning * into v_return;

  insert into public.notification_outbox (
    order_id,
    channel,
    template_key,
    dedupe_key,
    recipient,
    payload
  )
  values (
    v_order.id,
    'email',
    'return_status_updated',
    'return:' || v_return.id || ':requested',
    v_order.email,
    jsonb_build_object(
      'order_number', v_order.order_number,
      'public_id', v_order.public_id,
      'return_number', v_return.return_number,
      'return_status', v_return.status
    )
  );

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    after_state
  )
  values (
    p_actor_user_id,
    'return_created',
    'return',
    v_return.id::text,
    jsonb_build_object(
      'order_id', v_order.id,
      'return_number', v_return.return_number,
      'status', v_return.status,
      'items', v_return.items
    )
  );

  return to_jsonb(v_return);
end;
$$;

revoke all on function public.commerce_create_return(
  bigint,
  text,
  jsonb,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_create_return(
  bigint,
  text,
  jsonb,
  uuid
) to service_role;

create or replace function public.commerce_update_return(
  p_return_id bigint,
  p_status text,
  p_resolution text,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_return public.returns%rowtype;
  v_order public.orders%rowtype;
  v_allowed boolean := false;
  v_before_status text;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required for return management'
      using errcode = '42501';
  end if;

  if p_status not in (
    'requested',
    'approved',
    'received',
    'rejected',
    'completed',
    'cancelled'
  ) then
    raise exception 'Return status is invalid'
      using errcode = '22023';
  end if;

  select *
  into v_return
  from public.returns
  where id = p_return_id
  for update;

  if not found then
    raise exception 'Return not found'
      using errcode = 'P0002';
  end if;

  v_before_status := v_return.status;

  v_allowed := v_return.status = p_status
    or (v_return.status = 'requested' and p_status in ('approved', 'rejected', 'cancelled'))
    or (v_return.status = 'approved' and p_status in ('received', 'cancelled'))
    or (v_return.status = 'received' and p_status = 'completed');

  if not v_allowed then
    raise exception 'Return status transition is not allowed'
      using errcode = '23514';
  end if;

  select *
  into v_order
  from public.orders
  where id = v_return.order_id
  for update;

  update public.returns
  set status = p_status,
      resolution = nullif(left(trim(coalesce(p_resolution, '')), 2000), ''),
      received_at = case
        when p_status = 'received' then coalesce(received_at, now())
        else received_at
      end,
      completed_at = case
        when p_status = 'completed' then coalesce(completed_at, now())
        else completed_at
      end
  where id = v_return.id
  returning * into v_return;

  if p_status = 'completed' then
    update public.orders
    set fulfillment_status = 'returned'
    where id = v_order.id;
  end if;

  insert into public.notification_outbox (
    order_id,
    channel,
    template_key,
    dedupe_key,
    recipient,
    payload
  )
  values (
    v_order.id,
    'email',
    'return_status_updated',
    'return:' || v_return.id || ':' || p_status,
    v_order.email,
    jsonb_build_object(
      'order_number', v_order.order_number,
      'public_id', v_order.public_id,
      'return_number', v_return.return_number,
      'return_status', v_return.status,
      'resolution', v_return.resolution
    )
  )
  on conflict (dedupe_key) do nothing;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_state,
    after_state
  )
  values (
    p_actor_user_id,
    'return_status_updated',
    'return',
    v_return.id::text,
    jsonb_build_object('status', v_before_status),
    jsonb_build_object(
      'status', p_status,
      'resolution', v_return.resolution
    )
  );

  return to_jsonb(v_return);
end;
$$;

revoke all on function public.commerce_update_return(
  bigint,
  text,
  text,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_update_return(
  bigint,
  text,
  text,
  uuid
) to service_role;

create or replace function public.commerce_claim_notifications(
  p_limit integer default 20
)
returns table (
  id bigint,
  order_id bigint,
  booking_id uuid,
  template_key text,
  recipient text,
  payload jsonb,
  attempt_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with candidates as (
    select outbox.id
    from public.notification_outbox outbox
    where (
        (
          outbox.status in ('pending', 'failed')
          and outbox.available_at <= now()
        )
        or (
          outbox.status = 'sending'
          and outbox.updated_at < now() - interval '15 minutes'
        )
      )
      and outbox.attempt_count < 5
    order by outbox.available_at, outbox.id
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 20), 100))
  )
  update public.notification_outbox outbox
  set status = 'sending',
      attempt_count = outbox.attempt_count + 1,
      last_error = null
  from candidates
  where outbox.id = candidates.id
  returning
    outbox.id,
    outbox.order_id,
    outbox.booking_id,
    outbox.template_key,
    outbox.recipient,
    outbox.payload,
    outbox.attempt_count;
end;
$$;

revoke all on function public.commerce_claim_notifications(integer)
from public, anon, authenticated;
grant execute on function public.commerce_claim_notifications(integer)
to service_role;

create or replace function public.commerce_finish_notification(
  p_notification_id bigint,
  p_status text,
  p_provider_message_id text,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_outbox public.notification_outbox%rowtype;
begin
  if p_status not in ('sent', 'failed') then
    raise exception 'Notification result status is invalid'
      using errcode = '22023';
  end if;

  update public.notification_outbox
  set status = p_status,
      sent_at = case when p_status = 'sent' then now() else sent_at end,
      last_error = case
        when p_status = 'failed'
          then left(coalesce(nullif(trim(p_error), ''), 'Email provider error'), 1000)
        else null
      end,
      available_at = case
        when p_status = 'failed'
          then now() + make_interval(
            secs => least(3600, 30 * power(2, attempt_count)::integer)
          )
        else available_at
      end
  where id = p_notification_id
    and status = 'sending'
  returning * into v_outbox;

  if not found then
    raise exception 'Claimed notification not found'
      using errcode = 'P0002';
  end if;

  insert into public.integration_events (
    provider,
    external_event_id,
    event_type,
    payload,
    status,
    attempt_count,
    last_error,
    processed_at
  )
  values (
    'email',
    'outbox:' || v_outbox.id || ':attempt:' || v_outbox.attempt_count,
    'email.' || p_status,
    jsonb_build_object(
      'notification_id', v_outbox.id,
      'template_key', v_outbox.template_key,
      'provider_message_id', nullif(p_provider_message_id, '')
    ),
    case when p_status = 'sent' then 'processed' else 'failed' end,
    1,
    case when p_status = 'failed' then v_outbox.last_error else null end,
    case when p_status = 'sent' then now() else null end
  )
  on conflict (provider, external_event_id) do nothing;
end;
$$;

revoke all on function public.commerce_finish_notification(
  bigint,
  text,
  text,
  text
) from public, anon, authenticated;
grant execute on function public.commerce_finish_notification(
  bigint,
  text,
  text,
  text
) to service_role;

create or replace function public.commerce_queue_order_notification(
  p_order_id bigint,
  p_template_key text,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_shipment public.shipments%rowtype;
  v_outbox public.notification_outbox%rowtype;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required to send order notifications'
      using errcode = '42501';
  end if;

  if p_template_key not in (
    'order_confirmation',
    'payment_failed',
    'order_preparing',
    'order_ready_for_pickup',
    'order_ready_to_ship',
    'tracking_created',
    'order_shipped',
    'order_delivered',
    'order_picked_up',
    'order_cancelled',
    'refund_partial',
    'refund_full',
    'return_status_updated'
  ) then
    raise exception 'Notification template is invalid'
      using errcode = '22023';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'Order not found'
      using errcode = 'P0002';
  end if;

  select *
  into v_shipment
  from public.shipments
  where order_id = v_order.id
  order by created_at desc
  limit 1;

  insert into public.notification_outbox (
    order_id,
    channel,
    template_key,
    dedupe_key,
    recipient,
    payload
  )
  values (
    v_order.id,
    'email',
    p_template_key,
    'manual:' || v_order.id || ':' || p_template_key || ':' || gen_random_uuid(),
    v_order.email,
    jsonb_build_object(
      'order_number', v_order.order_number,
      'public_id', v_order.public_id,
      'fulfillment_method', v_order.fulfillment_method,
      'tracking_pin', v_shipment.tracking_pin,
      'tracking_url', v_shipment.tracking_url,
      'service_name', v_shipment.service_name
    )
  )
  returning * into v_outbox;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    after_state
  )
  values (
    p_actor_user_id,
    'order_notification_queued',
    'order',
    v_order.id::text,
    jsonb_build_object(
      'notification_id', v_outbox.id,
      'template_key', v_outbox.template_key,
      'recipient', v_outbox.recipient
    )
  );

  return to_jsonb(v_outbox);
end;
$$;

revoke all on function public.commerce_queue_order_notification(
  bigint,
  text,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_queue_order_notification(
  bigint,
  text,
  uuid
) to service_role;

create or replace function public.commerce_update_store_settings(
  p_updates jsonb,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
  v_value jsonb;
  v_before jsonb;
  v_updated integer := 0;
  v_update_count integer := 0;
  v_allowed_keys constant text[] := array[
    'commerce.checkout_enabled',
    'store.profile',
    'store.hours',
    'fulfillment.pickup_enabled',
    'fulfillment.pickup_instructions',
    'fulfillment.sales_regions',
    'fulfillment.local_delivery',
    'fulfillment.canada_post_enabled',
    'fulfillment.shipping_origin',
    'fulfillment.shipping_rules',
    'tax.mode',
    'notifications.order_email',
    'policy.shipping',
    'policy.refund',
    'policy.return'
  ];
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role = 'admin'
  ) then
    raise exception 'An admin actor is required for store settings'
      using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_updates, '{}'::jsonb)) <> 'object'
  then
    raise exception 'Store settings payload is invalid'
      using errcode = '22023';
  end if;

  select count(*)
  into v_update_count
  from jsonb_object_keys(p_updates);

  if v_update_count < 1
    or v_update_count > array_length(v_allowed_keys, 1)
  then
    raise exception 'Store settings payload is invalid'
      using errcode = '22023';
  end if;

  for v_key, v_value in
    select key, value
    from jsonb_each(p_updates)
  loop
    if not (v_key = any(v_allowed_keys)) then
      raise exception 'Store setting is not editable: %', v_key
        using errcode = '42501';
    end if;

    if v_key in (
      'commerce.checkout_enabled',
      'fulfillment.pickup_enabled',
      'fulfillment.canada_post_enabled'
    ) and jsonb_typeof(v_value) <> 'boolean'
    then
      raise exception 'Store setting % must be a boolean', v_key
        using errcode = '22023';
    end if;

    if v_key not in (
      'commerce.checkout_enabled',
      'fulfillment.pickup_enabled',
      'fulfillment.canada_post_enabled'
    ) and (
      jsonb_typeof(v_value) <> 'object'
      or pg_column_size(v_value) > 100000
    )
    then
      raise exception 'Store setting % must be a bounded object', v_key
        using errcode = '22023';
    end if;

    select value
    into v_before
    from public.store_settings
    where key = v_key
    for update;

    if not found then
      raise exception 'Store setting does not exist: %', v_key
        using errcode = 'P0002';
    end if;

    update public.store_settings
    set value = v_value,
        updated_by = p_actor_user_id
    where key = v_key;

    insert into public.audit_log (
      actor_user_id,
      action,
      entity_type,
      entity_id,
      before_state,
      after_state
    )
    values (
      p_actor_user_id,
      'store_setting_updated',
      'store_setting',
      v_key,
      jsonb_build_object('value', v_before),
      jsonb_build_object('value', v_value)
    );

    v_updated := v_updated + 1;
  end loop;

  return jsonb_build_object(
    'status', 'updated',
    'updated_count', v_updated
  );
end;
$$;

revoke all on function public.commerce_update_store_settings(
  jsonb,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_update_store_settings(
  jsonb,
  uuid
) to service_role;

create or replace function public.commerce_upsert_catalog_taxonomy(
  p_kind text,
  p_taxonomy_id bigint,
  p_value jsonb,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before jsonb;
  v_category public.product_categories%rowtype;
  v_brand public.product_brands%rowtype;
  v_parent_id bigint;
  v_cycle boolean := false;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role = 'admin'
  ) then
    raise exception 'An admin actor is required for catalog taxonomies'
      using errcode = '42501';
  end if;

  if p_kind not in ('category', 'brand')
    or jsonb_typeof(coalesce(p_value, '{}'::jsonb)) <> 'object'
  then
    raise exception 'Catalog taxonomy payload is invalid'
      using errcode = '22023';
  end if;

  if p_kind = 'category' then
    v_parent_id := nullif(p_value ->> 'parent_id', '')::bigint;
    if p_taxonomy_id is not null and v_parent_id = p_taxonomy_id then
      raise exception 'A category cannot be its own parent'
        using errcode = '23514';
    end if;

    if v_parent_id is not null then
      if not exists (
        select 1
        from public.product_categories
        where id = v_parent_id
      ) then
        raise exception 'Parent category does not exist'
          using errcode = '23503';
      end if;

      if p_taxonomy_id is not null then
        with recursive ancestors as (
          select id, parent_id
          from public.product_categories
          where id = v_parent_id
          union all
          select parent.id, parent.parent_id
          from public.product_categories parent
          join ancestors child on child.parent_id = parent.id
        )
        select exists (
          select 1
          from ancestors
          where id = p_taxonomy_id
        )
        into v_cycle;

        if v_cycle then
          raise exception 'Category hierarchy would contain a cycle'
            using errcode = '23514';
        end if;
      end if;
    end if;

    if p_taxonomy_id is null then
      insert into public.product_categories (
        parent_id,
        slug,
        name,
        description,
        sort_order,
        is_active
      )
      values (
        v_parent_id,
        p_value ->> 'slug',
        p_value ->> 'name',
        nullif(p_value ->> 'description', ''),
        coalesce((p_value ->> 'sort_order')::integer, 0),
        coalesce((p_value ->> 'is_active')::boolean, true)
      )
      returning * into v_category;
    else
      select to_jsonb(category)
      into v_before
      from public.product_categories category
      where id = p_taxonomy_id
      for update;

      if not found then
        raise exception 'Category not found'
          using errcode = 'P0002';
      end if;

      update public.product_categories
      set parent_id = v_parent_id,
          slug = p_value ->> 'slug',
          name = p_value ->> 'name',
          description = nullif(p_value ->> 'description', ''),
          sort_order = coalesce((p_value ->> 'sort_order')::integer, 0),
          is_active = coalesce((p_value ->> 'is_active')::boolean, true)
      where id = p_taxonomy_id
      returning * into v_category;
    end if;

    insert into public.audit_log (
      actor_user_id,
      action,
      entity_type,
      entity_id,
      before_state,
      after_state
    )
    values (
      p_actor_user_id,
      case
        when p_taxonomy_id is null then 'category_created'
        else 'category_updated'
      end,
      'product_category',
      v_category.id::text,
      v_before,
      to_jsonb(v_category)
    );

    return jsonb_build_object(
      'kind', 'category',
      'id', v_category.id,
      'slug', v_category.slug,
      'name', v_category.name
    );
  end if;

  if p_taxonomy_id is null then
    insert into public.product_brands (
      slug,
      name,
      description,
      website_url,
      is_active
    )
    values (
      p_value ->> 'slug',
      p_value ->> 'name',
      nullif(p_value ->> 'description', ''),
      nullif(p_value ->> 'website_url', ''),
      coalesce((p_value ->> 'is_active')::boolean, true)
    )
    returning * into v_brand;
  else
    select to_jsonb(brand)
    into v_before
    from public.product_brands brand
    where id = p_taxonomy_id
    for update;

    if not found then
      raise exception 'Brand not found'
        using errcode = 'P0002';
    end if;

    update public.product_brands
    set slug = p_value ->> 'slug',
        name = p_value ->> 'name',
        description = nullif(p_value ->> 'description', ''),
        website_url = nullif(p_value ->> 'website_url', ''),
        is_active = coalesce((p_value ->> 'is_active')::boolean, true)
    where id = p_taxonomy_id
    returning * into v_brand;
  end if;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_state,
    after_state
  )
  values (
    p_actor_user_id,
    case
      when p_taxonomy_id is null then 'brand_created'
      else 'brand_updated'
    end,
    'product_brand',
    v_brand.id::text,
    v_before,
    to_jsonb(v_brand)
  );

  return jsonb_build_object(
    'kind', 'brand',
    'id', v_brand.id,
    'slug', v_brand.slug,
    'name', v_brand.name
  );
end;
$$;

revoke all on function public.commerce_upsert_catalog_taxonomy(
  text,
  bigint,
  jsonb,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_upsert_catalog_taxonomy(
  text,
  bigint,
  jsonb,
  uuid
) to service_role;

create or replace function public.commerce_finish_canada_post_cancellation(
  p_shipment_id bigint,
  p_outcome text,
  p_service_ticket_id text,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shipment public.shipments%rowtype;
  v_before jsonb;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required to cancel shipping labels'
      using errcode = '42501';
  end if;

  if p_outcome not in ('voided', 'refund_pending') then
    raise exception 'Shipment cancellation outcome is invalid'
      using errcode = '22023';
  end if;

  select *
  into v_shipment
  from public.shipments
  where id = p_shipment_id
  for update;

  if not found
    or v_shipment.provider <> 'canada_post'
    or not v_shipment.is_sandbox
  then
    raise exception 'Canada Post sandbox shipment not found'
      using errcode = 'P0002';
  end if;

  if v_shipment.status in ('voided', 'refund_pending', 'refunded') then
    return jsonb_build_object(
      'status', 'duplicate',
      'shipment', to_jsonb(v_shipment)
    );
  end if;

  if v_shipment.status not in ('label_created', 'ready') then
    raise exception 'Only an unused label can be cancelled'
      using errcode = '23514';
  end if;

  v_before := to_jsonb(v_shipment);

  update public.shipments
  set status = p_outcome,
      voided_at = case when p_outcome = 'voided' then now() else voided_at end,
      refund_requested_at = case
        when p_outcome = 'refund_pending' then now()
        else refund_requested_at
      end,
      provider_refund_ticket = case
        when p_outcome = 'refund_pending'
          then nullif(left(trim(p_service_ticket_id), 120), '')
        else provider_refund_ticket
      end
  where id = v_shipment.id
  returning * into v_shipment;

  if not exists (
    select 1
    from public.shipments
    where order_id = v_shipment.order_id
      and provider = 'canada_post'
      and status in ('pending', 'label_created', 'ready', 'in_transit')
  ) then
    update public.orders
    set status = case
          when status = 'ready_to_ship' then 'processing'
          else status
        end,
        fulfillment_status = case
          when fulfillment_status = 'ready_to_ship' then 'preparing'
          else fulfillment_status
        end
    where id = v_shipment.order_id;
  end if;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_state,
    after_state
  )
  values (
    p_actor_user_id,
    case
      when p_outcome = 'voided' then 'canada_post_label_voided'
      else 'canada_post_refund_requested'
    end,
    'shipment',
    v_shipment.id::text,
    v_before,
    to_jsonb(v_shipment)
  );

  return jsonb_build_object(
    'status', p_outcome,
    'shipment', to_jsonb(v_shipment)
  );
end;
$$;

revoke all on function public.commerce_finish_canada_post_cancellation(
  bigint,
  text,
  text,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_finish_canada_post_cancellation(
  bigint,
  text,
  text,
  uuid
) to service_role;

create or replace function public.commerce_update_unfulfilled_order_details(
  p_order_id bigint,
  p_details jsonb,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_before jsonb;
  v_email text;
  v_first_name text;
  v_last_name text;
  v_phone text;
  v_customer_note text;
  v_shipping_address jsonb;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_user_id
      and role in ('staff', 'admin')
  ) then
    raise exception 'A staff actor is required to update order details'
      using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_details, 'null'::jsonb)) <> 'object' then
    raise exception 'Order details must be an object'
      using errcode = '22023';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found'
      using errcode = 'P0002';
  end if;

  if v_order.fulfillment_status in (
    'shipped',
    'delivered',
    'picked_up',
    'returned',
    'cancelled'
  ) then
    raise exception 'Fulfilled or cancelled order details cannot be edited'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.shipments
    where order_id = v_order.id
      and status in ('pending', 'label_created', 'ready', 'in_transit', 'delivered')
  ) then
    raise exception 'Order details cannot be edited after shipment creation begins'
      using errcode = '23514';
  end if;

  v_email := lower(trim(coalesce(p_details ->> 'email', '')));
  v_first_name := trim(coalesce(p_details ->> 'first_name', ''));
  v_last_name := trim(coalesce(p_details ->> 'last_name', ''));
  v_phone := nullif(trim(coalesce(p_details ->> 'phone', '')), '');
  v_customer_note := nullif(
    left(trim(coalesce(p_details ->> 'customer_note', '')), 500),
    ''
  );
  v_shipping_address := p_details -> 'shipping_address';

  if char_length(v_email) not between 3 and 320
    or position('@' in v_email) <= 1
    or char_length(v_first_name) not between 1 and 100
    or char_length(v_last_name) not between 1 and 100
    or (v_phone is not null and char_length(v_phone) not between 7 and 40)
  then
    raise exception 'Customer contact details are invalid'
      using errcode = '22023';
  end if;

  if v_order.fulfillment_method <> 'pickup' then
    if jsonb_typeof(coalesce(v_shipping_address, 'null'::jsonb)) <> 'object'
      or coalesce(v_shipping_address ->> 'country', '') <> 'CA'
      or char_length(trim(coalesce(v_shipping_address ->> 'addressLine1', ''))) < 2
      or char_length(trim(coalesce(v_shipping_address ->> 'city', ''))) < 2
      or char_length(trim(coalesce(v_shipping_address ->> 'province', ''))) <> 2
      or char_length(
        regexp_replace(
          upper(coalesce(v_shipping_address ->> 'postalCode', '')),
          '[^A-Z0-9]',
          '',
          'g'
        )
      ) <> 6
    then
      raise exception 'A valid Canadian delivery address is required'
        using errcode = '22023';
    end if;
  else
    v_shipping_address := null;
  end if;

  v_before := jsonb_build_object(
    'email', v_order.email,
    'customer_first_name', v_order.customer_first_name,
    'customer_last_name', v_order.customer_last_name,
    'phone', v_order.phone,
    'customer_note', v_order.customer_note,
    'shipping_address', v_order.shipping_address
  );

  update public.orders
  set email = v_email,
      customer_first_name = v_first_name,
      customer_last_name = v_last_name,
      phone = v_phone,
      customer_note = v_customer_note,
      shipping_address = v_shipping_address
  where id = v_order.id
  returning * into v_order;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_state,
    after_state
  )
  values (
    p_actor_user_id,
    'unfulfilled_order_details_updated',
    'order',
    v_order.id::text,
    v_before,
    jsonb_build_object(
      'email', v_order.email,
      'customer_first_name', v_order.customer_first_name,
      'customer_last_name', v_order.customer_last_name,
      'phone', v_order.phone,
      'customer_note', v_order.customer_note,
      'shipping_address', v_order.shipping_address
    )
  );

  return jsonb_build_object(
    'status', 'updated',
    'order_id', v_order.id,
    'order_number', v_order.order_number
  );
end;
$$;

revoke all on function public.commerce_update_unfulfilled_order_details(
  bigint,
  jsonb,
  uuid
) from public, anon, authenticated;
grant execute on function public.commerce_update_unfulfilled_order_details(
  bigint,
  jsonb,
  uuid
) to service_role;
