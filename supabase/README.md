# Betmeet Mobile — Supabase backend

This is the app's **own** backend (ADR-007): Postgres + RLS for reads, Edge Functions for writes. The mobile app talks to it directly — there is no Next.js server. Schema is blueprinted on `../betmeet-clone` (`prisma/schema.prisma`).

## Layout
- `migrations/` — versioned SQL (enums → core tables → RLS → triggers → seed avatars).
- `functions/` — Edge Functions (Deno). _Added in Bolt 4._
- `config.toml` — project config (also lists the `betmeet://` redirect URLs).
- `seed.sql` — local-reset seed (full match/team seed in Bolt 5).

## Apply to your Supabase project (you run these — needs your credentials)
Project ref: `uyhymoykzwlovnqpzwnn`

```bash
# 1. one-time: authenticate the CLI (opens browser / paste token)
supabase login

# 2. link this repo to your project
supabase link --project-ref uyhymoykzwlovnqpzwnn

# 3. push the migrations to the remote DB
supabase db push
```

Tip: in this Claude session you can prefix with `!` (e.g. `! supabase db push`) so the output lands in the conversation.

### Also do in the dashboard (one-time)
- **Auth → URL Configuration**: add redirect URLs `betmeet://auth/callback`, `betmeet://auth/reset`, `betmeet://auth/confirm` (also needed for Bolt 1 auth E2E).
- **Storage**: create a public `avatars` bucket and upload `defaults/01.png … 06.png` (or edit the URLs in the seed migration). New users get a random default avatar via the `handle_new_user` trigger.

## Verify after push
```bash
# with a logged-in user's access token (JWT):
curl "$SUPABASE_URL/rest/v1/profiles?select=id,onboarding_completed" \
  -H "apikey: $PUBLISHABLE_KEY" -H "Authorization: Bearer $USER_JWT"
# → returns the caller's own profile row (created by the signup trigger).
```
A fresh signup now auto-creates a `profiles` row, so the mobile profile-gate resolves to onboarding instead of the error fallback.
