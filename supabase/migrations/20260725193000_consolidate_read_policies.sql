-- Avoid evaluating overlapping permissive policies for authenticated users.
-- Anonymous storefront access remains separate, while authenticated policies
-- combine the customer/public condition with the staff override.

drop policy if exists store_locations_public_read on public.store_locations;
drop policy if exists store_locations_staff_read on public.store_locations;
create policy store_locations_public_read
on public.store_locations for select to anon
using (is_active);
create policy store_locations_authenticated_read
on public.store_locations for select to authenticated
using (is_active or (select private.is_staff()));

drop policy if exists product_categories_public_read on public.product_categories;
drop policy if exists product_categories_staff_read on public.product_categories;
create policy product_categories_public_read
on public.product_categories for select to anon
using (is_active);
create policy product_categories_authenticated_read
on public.product_categories for select to authenticated
using (is_active or (select private.is_staff()));

drop policy if exists product_brands_public_read on public.product_brands;
drop policy if exists product_brands_staff_read on public.product_brands;
create policy product_brands_public_read
on public.product_brands for select to anon
using (is_active);
create policy product_brands_authenticated_read
on public.product_brands for select to authenticated
using (is_active or (select private.is_staff()));

drop policy if exists products_public_read on public.products;
drop policy if exists products_staff_read on public.products;
create policy products_public_read
on public.products for select to anon
using (
  status = 'active'
  and published_at is not null
  and published_at <= now()
);
create policy products_authenticated_read
on public.products for select to authenticated
using (
  (
    status = 'active'
    and published_at is not null
    and published_at <= now()
  )
  or (select private.is_staff())
);

drop policy if exists product_variants_public_read on public.product_variants;
drop policy if exists product_variants_staff_read on public.product_variants;
create policy product_variants_public_read
on public.product_variants for select to anon
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
create policy product_variants_authenticated_read
on public.product_variants for select to authenticated
using (
  (
    is_active
    and exists (
      select 1
      from public.products
      where products.id = product_variants.product_id
        and products.status = 'active'
        and products.published_at is not null
        and products.published_at <= now()
    )
  )
  or (select private.is_staff())
);

drop policy if exists product_images_public_read on public.product_images;
drop policy if exists product_images_staff_read on public.product_images;
create policy product_images_public_read
on public.product_images for select to anon
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
create policy product_images_authenticated_read
on public.product_images for select to authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and (
        (
          products.status = 'active'
          and products.published_at is not null
          and products.published_at <= now()
        )
        or (select private.is_staff())
      )
  )
);

drop policy if exists inventory_levels_public_read on public.inventory_levels;
drop policy if exists inventory_levels_staff_read on public.inventory_levels;
create policy inventory_levels_public_read
on public.inventory_levels for select to anon
using (
  exists (
    select 1
    from public.product_variants
    join public.products on products.id = product_variants.product_id
    where product_variants.id = inventory_levels.variant_id
      and product_variants.is_active
      and products.status = 'active'
      and products.published_at is not null
      and products.published_at <= now()
  )
);
create policy inventory_levels_authenticated_read
on public.inventory_levels for select to authenticated
using (
  exists (
    select 1
    from public.product_variants
    join public.products on products.id = product_variants.product_id
    where product_variants.id = inventory_levels.variant_id
      and (
        (
          product_variants.is_active
          and products.status = 'active'
          and products.published_at is not null
          and products.published_at <= now()
        )
        or (select private.is_staff())
      )
  )
);

drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_staff_read on public.profiles;
create policy profiles_authenticated_read
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or (select private.is_staff())
);

drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_authenticated_update
on public.profiles for update to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  id = (select auth.uid())
  or (select private.is_admin())
);

drop policy if exists orders_customer_read on public.orders;
drop policy if exists orders_staff_read on public.orders;
create policy orders_authenticated_read
on public.orders for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_staff())
);

drop policy if exists order_items_customer_read on public.order_items;
drop policy if exists order_items_staff_read on public.order_items;
create policy order_items_authenticated_read
on public.order_items for select to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (
        orders.user_id = (select auth.uid())
        or (select private.is_staff())
      )
  )
);

drop policy if exists shipments_customer_read on public.shipments;
drop policy if exists shipments_staff_read on public.shipments;
create policy shipments_authenticated_read
on public.shipments for select to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = shipments.order_id
      and (
        orders.user_id = (select auth.uid())
        or (select private.is_staff())
      )
  )
);

drop policy if exists returns_customer_read on public.returns;
drop policy if exists returns_staff_read on public.returns;
create policy returns_authenticated_read
on public.returns for select to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = returns.order_id
      and (
        orders.user_id = (select auth.uid())
        or (select private.is_staff())
      )
  )
);
