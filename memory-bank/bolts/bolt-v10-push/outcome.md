# Bolt V10 — Notifications / push (native) — Outcome: ✅ code-complete, ⏳ activation-pending

- **Status:** ✅ Code-complete + gated (native lib builds & loads; schema live; dispatcher deployed). ⏳ Real FCM delivery pending user Firebase provisioning.
- **Intent:** 002-v2-web-parity · unit `notifications` (FR-NT1..NT5) · Stories US-NT1..NT5
- **DDD:** Model → Design+ADR-025 → Implement → Test (probe-first)

## Probe result
`@react-native-firebase/messaging@25` BUILDS + loads on RN 0.86 (New-Arch interop, not the codegen that broke image-picker). Needs the google-services gradle plugin (added) + a `google-services.json` (placeholder gitignored for the probe).

## What shipped
- **Migration `20260701170000_notifications`**: `push_subscriptions`, `notification_preferences`, `notification_events`, `notification_deliveries` (+RLS own-row for subs/prefs; events/deliveries service-role only); default-prefs trigger on profile insert; **emit triggers** for `match_end` (matches→FINISHED) and `pool_invite` (directed invites) — non-invasive (does not touch V3/V5 functions). Backfilled prefs. Applied to remote.
- **`notifications-dispatch` Edge Function**: drains the outbox → resolves recipients (pool_invite → invitee; match_end → match predictors) → checks prefs + active subscriptions → **FCM HTTP v1** (service-account JWT minted in-function from `FCM_SERVICE_ACCOUNT` secret) → records deliveries; deactivates tokens on 404/410. Deployed.
- **Client `pushApi`**: `pushSupported`, `enablePush` (permission → FCM token → upsert subscription), `disablePush`, prefs get/update. Gated/try-catch.
- **Settings → Notifications** panel: enable-push + 5 per-event toggles (replaces the placeholder).
- Android gradle: google-services plugin classpath + apply; placeholder `google-services.json` (gitignored).

## ADR
ADR-025 — RNFirebase for FCM (builds via New-Arch interop); non-invasive emit triggers (don't edit validated V3/V5 fns); dispatcher mints the FCM v1 token in-function from a Supabase secret; graceful client gate.

## Verification
Probe build PASS; schema + emit triggers validated on ephemeral PG; tsc/jest 54/54; device: Notifications panel renders from real prefs with RNFirebase loaded (no crash).

## Activation checklist (user-provisioned)
1. Real Firebase project → replace `android/app/google-services.json`; iOS: APNs key + `GoogleService-Info.plist` + `pod install`.
2. FCM v1 service-account JSON → `supabase secrets set FCM_SERVICE_ACCOUNT=@sa.json`.
3. Cron (pg_cron/external) invoking `notifications-dispatch` with `x-admin-secret`.
4. `index.js`: register `messaging().setBackgroundMessageHandler`; wire tap→deep-link (`onNotificationOpenedApp`/`getInitialNotification`).
5. rank_up / goal event emission (deferred).

## Closes
Intent 002 v2: V1–V7 done; V8 deferred (RN 0.86 image-picker); V9 & V10 code-complete/activation-pending (native libs build).
