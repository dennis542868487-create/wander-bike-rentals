# Supabase Project Record

## Canonical project

Wander Bike Rentals uses one Supabase project for the application and all database operations.

| Field | Value |
| --- | --- |
| Local account label | `orbitai` |
| Project name | `wander-bike-rentals` |
| Project ref | `gvuaitmjpenggvosshqm` |
| Project URL | `https://gvuaitmjpenggvosshqm.supabase.co` |
| Region | `ca-central-1` |

Use this project for Vercel Production, local development, migrations, Auth, Storage, Realtime, and Edge Functions.

## Retired duplicate

The duplicate project under account `我的帳號`, ref `vasdytokidqkoakhbeau`, was intentionally paused on 2026-08-21. It is not an approved application environment. Do not restore it or deploy changes to it unless the user explicitly requests recovery.

## Preflight checklist

Before any Supabase mutation:

1. Confirm the target project ref is `gvuaitmjpenggvosshqm`.
2. Confirm the authenticated Supabase account is `orbitai`.
3. Confirm `supabase/.temp/project-ref`, when present, contains `gvuaitmjpenggvosshqm`.
4. Confirm `NEXT_PUBLIC_SUPABASE_URL` resolves to `https://gvuaitmjpenggvosshqm.supabase.co` without printing any keys.
5. Stop if any environment or command targets `vasdytokidqkoakhbeau`.

Never place access tokens, publishable keys, secret keys, or database passwords in this file or any tracked file.
