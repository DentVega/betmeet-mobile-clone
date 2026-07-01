# Bolt V10 — Stage 1: Model (Notifications / push — native)

> Intent 002 · unit `notifications` (FR-NT1…NT5). Probe-first: **`@react-native-firebase/messaging@25` BUILDS on RN 0.86** (google-services plugin + placeholder google-services.json; clean rebuild SUCCESSFUL). Uses New-Arch interop, not the codegen that broke image-picker.

## Probe outcome
- ✅ RNFirebase app + messaging link + build clean on RN 0.86.
- Needs a real `google-services.json` (Android) / APNs key (iOS) + FCM server credentials to actually deliver → **E2E untestable here**; ships **code-complete, activation-pending** (like passkeys).

## Ubiquitous language
- **Push token** — the FCM device token (`messaging().getToken()`) after OS permission; stored per device in `push_subscriptions`.
- **Preferences** — per-event opt-ins in `notification_preferences` (match start/end, pool invite, rank-up, goal).
- **Outbox + dispatch** — domain events written to `notification_events`; a `notifications-dispatch` Edge Function reads them, checks prefs + subscriptions, sends via **FCM HTTP v1**, records `notification_deliveries`.
- **Tap → deep link** — a notification's `data.link` (betmeet://…) routes to the pool/match/leaderboard via the existing deep-link router.

## Deliverables
1. **Backend migration** — `push_subscriptions` (user, token, platform, created/last_seen, unique token) + `notification_preferences` (user, per-event booleans) + `notification_events` (type, payload, created, dispatched_at) + `notification_deliveries` (event, subscription, status). RLS own-row for subs/prefs; events/deliveries service-role only. Auto-create default prefs on profile create (trigger). **Emit events**: extend the V3 scoring trigger (match FINISHED → match-end / rank-up) + V5 invite fn (pool-invite) to insert `notification_events`.
2. **`notifications-dispatch` Edge Function** (guarded x-admin-secret / cron) — drain undispatched events → for each, resolve opted-in subscriptions → send via FCM HTTP v1 (server key from Supabase secret) → record deliveries; cleanup on 404/410.
3. **Client `pushApi`** — `initPush()` (request permission, getToken, upsert subscription), `updatePrefs()`, token-refresh + sign-out deactivate; tap handler → deep link. Gated/try-catch so a missing real Firebase config degrades gracefully.
4. **Settings → Notifications section** — replace the "coming soon" placeholder: enable-push toggle + per-event preference toggles (FR-PS6/NT3).
5. Document activation (real google-services.json, FCM v1 credentials, Supabase secret, cron for dispatch).

## Invariants
- Only opted-in, subscribed devices receive an event type; prefs + subscription checks are server-side in the dispatcher.
- Push server credentials live in Supabase secrets, never in the client.
- The placeholder `google-services.json` is gitignored; real config is user-provisioned.

## Out of model (activation, user-provisioned)
Real Firebase project + `google-services.json` + FCM v1 service account; iOS APNs key + entitlements + `pod install`; the cron schedule that invokes `notifications-dispatch`; business emails.
