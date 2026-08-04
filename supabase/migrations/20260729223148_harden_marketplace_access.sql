-- Keep extension objects out of the exposed public schema.
-- Production migration timestamp: 20260729223148.
alter extension btree_gist set schema extensions;

-- The image bucket is public, so object URLs do not require a broad storage
-- SELECT policy. Removing it prevents clients from listing every object.
drop policy if exists bike_listing_images_storage_public_read
on storage.objects;

-- Make the service-role-only outbox denial explicit for the database linter.
create policy marketplace_notification_outbox_no_client_access
on public.marketplace_notification_outbox
for all
to anon, authenticated
using (false)
with check (false);

-- Cover foreign keys used by moderation and account-access screens.
create index if not exists marketplace_safety_flags_image_idx
  on public.marketplace_safety_flags (image_id)
  where image_id is not null;

create index if not exists marketplace_safety_flags_resolved_by_idx
  on public.marketplace_safety_flags (resolved_by)
  where resolved_by is not null;

create index if not exists marketplace_sensitive_terms_created_by_idx
  on public.marketplace_sensitive_terms (created_by)
  where created_by is not null;

create index if not exists profiles_marketplace_access_changed_by_idx
  on public.profiles (marketplace_access_changed_by)
  where marketplace_access_changed_by is not null;

-- Use one authenticated SELECT policy per table so Postgres evaluates a
-- single authorization expression rather than several permissive policies.
drop policy if exists bike_listings_public_read on public.bike_listings;
drop policy if exists bike_listings_owner_read on public.bike_listings;
drop policy if exists bike_listings_staff_read on public.bike_listings;

create policy bike_listings_public_read
on public.bike_listings
for select
to anon
using (status = 'active');

create policy bike_listings_authenticated_read
on public.bike_listings
for select
to authenticated
using (
  status = 'active'
  or (select auth.uid()) = owner_id
  or (select private.is_admin())
  or (
    (select private.is_staff())
    and source = 'wander'
  )
);

drop policy if exists bike_listing_images_public_read
on public.bike_listing_images;
drop policy if exists bike_listing_images_owner_read
on public.bike_listing_images;
drop policy if exists bike_listing_images_staff_read
on public.bike_listing_images;

create policy bike_listing_images_public_read
on public.bike_listing_images
for select
to anon
using (
  exists (
    select 1
    from public.bike_listings listing
    where listing.id = bike_listing_images.listing_id
      and listing.status = 'active'
  )
);

create policy bike_listing_images_authenticated_read
on public.bike_listing_images
for select
to authenticated
using (
  exists (
    select 1
    from public.bike_listings listing
    where listing.id = bike_listing_images.listing_id
      and listing.status = 'active'
  )
  or (select auth.uid()) = owner_id
  or (select private.is_admin())
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

drop policy if exists bike_listing_private_owner_read
on public.bike_listing_private_details;
drop policy if exists bike_listing_private_accepted_renter_read
on public.bike_listing_private_details;
drop policy if exists bike_listing_private_staff_read
on public.bike_listing_private_details;

create policy bike_listing_private_authenticated_read
on public.bike_listing_private_details
for select
to authenticated
using (
  (select auth.uid()) = owner_id
  or exists (
    select 1
    from public.marketplace_requests request
    where request.listing_id = bike_listing_private_details.listing_id
      and request.renter_id = (select auth.uid())
      and request.status in ('accepted', 'completed')
  )
  or (select private.is_admin())
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

drop policy if exists marketplace_requests_participant_read
on public.marketplace_requests;
drop policy if exists marketplace_requests_staff_read
on public.marketplace_requests;

create policy marketplace_requests_authenticated_read
on public.marketplace_requests
for select
to authenticated
using (
  (select auth.uid()) = renter_id
  or (select auth.uid()) = owner_id
  or (select private.is_admin())
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
