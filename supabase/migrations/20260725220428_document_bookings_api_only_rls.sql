-- Rental bookings are intentionally accessed through authenticated server
-- routes so ownership and editability checks stay centralized. Keep direct
-- PostgREST access closed and document that boundary with an explicit policy.
create policy bookings_api_only
on public.bookings
for all
to anon, authenticated
using (false)
with check (false);
