alter table public.bike_listings
  add column if not exists tire_size text;

alter table public.bike_listings
  drop constraint if exists bike_listings_short_description_check;

alter table public.bike_listings
  drop constraint if exists bike_listings_description_check;

update public.bike_listings
set pickup_area = 'Wander Bike Rentals · Steveston',
    city = 'Richmond',
    province = 'BC',
    available_from = null,
    available_until = null,
    availability_summary = 'Open daily 9:00 AM–10:00 PM'
where source = 'wander';

update public.bike_listing_private_details details
set pickup_address = '12071 First Ave #101, Richmond, BC V7E 3M1',
    postal_code = 'V7E 3M1',
    pickup_instructions =
      'Pick up at Wander Bike Rentals after your request is confirmed.'
from public.bike_listings listing
where listing.id = details.listing_id
  and listing.source = 'wander';

comment on column public.bike_listings.tire_size is
  'Public wheel or tire size, such as 26-inch, 27.5-inch, or 700C.';
