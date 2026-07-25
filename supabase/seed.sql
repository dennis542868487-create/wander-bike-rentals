-- Sandbox-only catalog used to exercise checkout, inventory, refunds, and
-- fulfillment before the customer's real catalog and credentials are supplied.
-- Every item is visibly marked TEST and should be removed before live launch.

insert into public.product_brands (
  id,
  slug,
  name,
  description
)
overriding system value
values (
  1001,
  'wander-bike-test-lab',
  'Wander Bike Test Lab',
  'Sandbox catalog data for integration testing only.'
)
on conflict (id) do nothing;

insert into public.products (
  id,
  category_id,
  brand_id,
  slug,
  name,
  short_description,
  description,
  status,
  tags,
  published_at
)
overriding system value
values
  (
    1001,
    (select id from public.product_categories where slug = 'bikes'),
    1001,
    'test-steveston-city-bike',
    '[TEST] Steveston City Bike',
    'Sandbox bicycle used to verify the complete sales workflow.',
    'This is test catalog data. No physical bicycle will be sold or shipped.',
    'active',
    array['sandbox', 'bike', 'city'],
    now()
  ),
  (
    1002,
    (select id from public.product_categories where slug = 'bikes'),
    1001,
    'test-waterfront-comfort-bike',
    '[TEST] Waterfront Comfort Bike',
    'Sandbox comfort bike for pickup and shipping tests.',
    'This is test catalog data. No physical bicycle will be sold or shipped.',
    'active',
    array['sandbox', 'bike', 'comfort'],
    now()
  ),
  (
    1003,
    (select id from public.product_categories where slug = 'accessories'),
    1001,
    'test-family-ride-helmet',
    '[TEST] Family Ride Helmet',
    'Sandbox helmet used for variant and tax testing.',
    'This is test catalog data. No physical helmet will be sold or shipped.',
    'active',
    array['sandbox', 'helmet', 'safety'],
    now()
  ),
  (
    1004,
    (select id from public.product_categories where slug = 'accessories'),
    1001,
    'test-rear-market-basket',
    '[TEST] Rear Market Basket',
    'Sandbox accessory used for cart and fulfillment testing.',
    'This is test catalog data. No physical basket will be sold or shipped.',
    'active',
    array['sandbox', 'basket', 'accessory'],
    now()
  ),
  (
    1005,
    (select id from public.product_categories where slug = 'accessories'),
    1001,
    'test-usb-front-light',
    '[TEST] USB Front Light',
    'Sandbox light used for multi-item checkout testing.',
    'This is test catalog data. No physical light will be sold or shipped.',
    'active',
    array['sandbox', 'light', 'accessory'],
    now()
  ),
  (
    1006,
    (select id from public.product_categories where slug = 'accessories'),
    1001,
    'test-kids-trail-helmet',
    '[TEST] Kids Trail Helmet',
    'Sandbox kids helmet used for product-option testing.',
    'This is test catalog data. No physical helmet will be sold or shipped.',
    'active',
    array['sandbox', 'helmet', 'kids'],
    now()
  )
on conflict (id) do nothing;

insert into public.product_variants (
  id,
  product_id,
  sku,
  title,
  option_values,
  price_cents,
  weight_grams,
  length_cm,
  width_cm,
  height_cm,
  canada_post_eligible
)
overriding system value
values
  (1001, 1001, 'TEST-BIKE-CITY-M-GREEN', 'Medium / Harbour Green', '{"size":"Medium","colour":"Harbour Green"}', 89900, 13500, 170, 25, 95, false),
  (1002, 1002, 'TEST-BIKE-COMFORT-M-NAVY', 'Medium / Deep Navy', '{"size":"Medium","colour":"Deep Navy"}', 74900, 14200, 175, 27, 98, false),
  (1003, 1003, 'TEST-HELMET-FAMILY-M-TEAL', 'Medium / Teal', '{"size":"Medium","colour":"Teal"}', 8900, 420, 32, 24, 20, true),
  (1004, 1004, 'TEST-BASKET-REAR-BLACK', 'Black', '{"colour":"Black"}', 6400, 1100, 42, 32, 28, true),
  (1005, 1005, 'TEST-LIGHT-USB-BLACK', 'Black', '{"colour":"Black"}', 4900, 180, 12, 8, 6, true),
  (1006, 1006, 'TEST-HELMET-KIDS-S-MINT', 'Small / Mint', '{"size":"Small","colour":"Mint"}', 5900, 360, 28, 22, 18, true)
on conflict (id) do nothing;

insert into public.product_images (
  product_id,
  storage_path,
  alt_text,
  sort_order
)
values
  (1001, '/assets/bikes-row.jpg', 'Rows of bicycles at Wander Bike — sandbox product image', 0),
  (1002, '/assets/steveston-ride-idea.jpg', 'Bicycle near the Steveston waterfront — sandbox product image', 0),
  (1003, '/assets/helmets.jpg', 'Bicycle helmets — sandbox product image', 0),
  (1004, '/assets/west-dyke-ride.webp', 'Bicycle prepared for a waterfront ride — sandbox product image', 0),
  (1005, '/assets/west-dyke-trail.jpg', 'Bicycle trail in Richmond — sandbox product image', 0),
  (1006, '/assets/helmets.jpg', 'Kids bicycle helmets — sandbox product image', 0)
on conflict (product_id, storage_path) do nothing;

insert into public.inventory_levels (
  variant_id,
  location_id,
  on_hand,
  reserved,
  reorder_point
)
select
  variant_id,
  location.id,
  5,
  0,
  1
from unnest(array[1001, 1002, 1003, 1004, 1005, 1006]::bigint[]) as variant_id
cross join (
  select id from public.store_locations where code = 'steveston'
) as location
on conflict (variant_id, location_id) do update
set on_hand = excluded.on_hand,
    reserved = 0,
    reorder_point = excluded.reorder_point;

update public.store_settings
set value = 'true'::jsonb
where key in (
  'commerce.checkout_enabled',
  'fulfillment.canada_post_enabled'
);

select setval(
  pg_get_serial_sequence('public.product_brands', 'id'),
  (select max(id) from public.product_brands),
  true
);
select setval(
  pg_get_serial_sequence('public.products', 'id'),
  (select max(id) from public.products),
  true
);
select setval(
  pg_get_serial_sequence('public.product_variants', 'id'),
  (select max(id) from public.product_variants),
  true
);
