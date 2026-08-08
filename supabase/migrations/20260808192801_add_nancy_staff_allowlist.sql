-- Grant Nancy access to the Wander Bike operations workspace when she signs
-- in with the exact Google account. Email/password sign-in intentionally does
-- not receive privileged access.
insert into private.marketplace_staff_allowlist (email, role)
values ('nancyzhuo2586@gmail.com', 'staff')
on conflict (email) do update set role = excluded.role;

-- If the Google identity already exists, apply the role immediately. If it
-- does not, private.sync_auth_user_profile() applies it on first Google login.
update public.profiles profile
set role = 'staff',
    updated_at = now()
from auth.users auth_user
where profile.id = auth_user.id
  and lower(coalesce(auth_user.email, '')) = 'nancyzhuo2586@gmail.com'
  and (
    coalesce(auth_user.raw_app_meta_data ->> 'provider', '') = 'google'
    or coalesce(auth_user.raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google'
  );
