# Intent 002 — System Context (v2 parity)

> AI-DLC Inception artifact. How the v2 features fit the existing architecture (Intent 001). Pairs with `requirements.md`. Refined by ADRs during Construction.

## 1. Context boundary (extends Intent 001)
```
┌──────────────── Betmeet Mobile (RN 0.86 + Re.Pack, single host bundle) ─────────────────┐
│  App shell: Auth ► Onboarding ► App tabs (Matches│Pools│Rankings) + SETTINGS (new)        │
│  Data/session: @supabase/supabase-js · secure storage · TanStack Query · Realtime (new)   │
│  Native modules (new): push (FCM/APNs) · passkeys/biometrics · image picker               │
└───────┬───────────────────────────┬───────────────────────────┬──────────────────────────┘
        │ reads: PostgREST + RLS      │ writes: functions.invoke   │ live: Realtime subscribe
        ▼                             ▼                            ▼
┌──────────────── User's OWN Supabase (extended in v2) ─────────────────────────────────────┐
│  Auth (+ MFA/passkeys) · Postgres + RLS (+ new tables/policies) · Storage (avatars upload) │
│  Edge Functions (existing + new): change-email/password, delete-account, directed-invite,  │
│    rename/visibility/archive pool, enter-result, score-sweeper, notifications-dispatch      │
│  Realtime (Postgres Changes / Broadcast) · Notifications outbox → FCM/APNs                  │
│  DEFERRED still: live football-data.org sync, full admin panel                             │
└────────────────────────────────────────────────────────────────────────────────────────────┘
              (blueprint reference, not runtime:  ../betmeet-clone)
```
Mobile stays a direct Supabase client; single bundle; no Next.js server. v2 **extends** the own backend (new tables/policies/functions/triggers) — not a migration.

## 2. Topology
Single Re.Pack/Rspack **host bundle** (no Module Federation — unchanged from Intent 001). New native modules are host-linked. Settings becomes a nested stack under the app shell (or a 4th tab). Future-remote candidates unchanged.

## 3. New client layers
- **Settings navigation**: a Settings stack (Profile · Security · Notifications · Language) reachable from the shell (header/menu). Houses account/security/profile/i18n/notification-prefs screens.
- **Realtime**: a `useLiveResults` hook subscribing to Supabase Realtime; on match/score change it invalidates `['fixture']`/`['ranking']`/pool queries. Focus-refetch remains the fallback (NFR-4).
- **Live projection (pure)**: client computes projected points/rank from confirmed scores + `computeScore(pick, liveScore)` for LIVE matches (reuses the Bolt-4 scoring logic ported to the client for projection only; authoritative scoring stays server-side).
- **Native module adapters**: push (register token, handle taps→deep links), passkeys/biometrics (register/sign-in), image picker (pick→signed-URL upload).

## 4. Backend additions (own Supabase)
- **Tables** (from blueprint, snake_case): `pool_directed_invites`, `notification_preferences`, `push_subscriptions`, `notification_events`, `notification_deliveries`. Extend `pools` (members_can_invite already present; add archived/visibility handling), `predictions` (pool_id override already present).
- **RLS**: own-row for prefs/subscriptions/events; directed-invite visibility to participants; **pool predictions masking** (future picks of others hidden pre-lock) via a SECURITY DEFINER read (like discover/ranking).
- **Edge Functions (new)**: `change-email`, `change-password`, `delete-account` (service-role purge), `create-directed-invite` (+ `search-nicknames` read RPC), `rename-pool`, `set-pool-visibility`, `set-pool-members-can-invite`, `archive-pool`, `enter-result` (guarded), `notifications-dispatch` (FCM/APNs sender), MFA/passkey enroll/verify (mostly via Supabase Auth SDK).
- **Triggers/functions**: **auto-scoring sweeper** — on `matches` UPDATE to FINISHED (with scores), compute `prediction_scores` (plpgsql or an Edge Function invoked by the trigger via pg_net) → replaces manual `compute-score`. Emit notification/realtime events.
- **RPCs (reads)**: membership-scoped pool leaderboard (`kickoff_at ≥ joined_at`, pool override else global), pool predictions grid (masked), nickname search.
- **Realtime**: enable on `matches` / `prediction_scores` (or Broadcast from the sweeper) for live updates.
- **Storage**: `avatars` bucket write policy (own folder) for uploads.

## 5. Push architecture (re-platformed)
Web used Web Push (VAPID/service worker). Mobile uses **FCM (Android) + APNs (iOS)**. The **event outbox** model is reused; the **transport** (`notifications-dispatch`) sends via FCM/APNs using server keys in Supabase secrets. Client registers device tokens (`push_subscriptions`), sets per-event prefs (`notification_preferences`), and handles notification taps → deep links. (Q1: Expo Notifications vs @react-native-firebase.)

## 6. Native-module dependencies (each = a rebuild)
| Feature | Native dep (candidate) | Notes |
|---|---|---|
| Push (FR-NT) | `@react-native-firebase/messaging` (+APNs) or Expo Notifications | server keys in Supabase secrets |
| Passkeys/biometrics (FR-AS5) | `react-native-passkeys` / platform WebAuthn + biometrics | Supabase passkey API compat (Q2) |
| Avatar upload (FR-PS2) | `react-native-image-picker` (or expo-image-picker) | signed-URL upload to Storage |
Grouped so their rebuilds are batched where possible.

## 7. Data & realtime flow (v2)
Result entered (FR-RS1) → match FINISHED → **auto-scoring sweeper** writes `prediction_scores` (FR-RS2) → **Realtime** pushes change → clients refetch fixture/leaderboard; **live projection** updates while LIVE → **notification events** emitted (goal/match-end/rank-up) → **dispatcher** sends FCM/APNs (FR-NT4). No live provider feed; humans enter results.

## 8. Cross-cutting
- Business rules server-side (masking, cooldown, membership scoping, min-one-auth-method) — clients never bypass (NFR-3).
- i18n: locale in `profiles.locale` + device; selector in Settings; dictionaries extended (FR-IN).
- Testing per NFR-6 (pure projection/masking/cooldown units; Edge/trigger on ephemeral PG; agent-device for native flows).
