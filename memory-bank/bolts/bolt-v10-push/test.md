# Bolt V10 — Test (Notifications / push)

## Probe (native build) — PASS
`@react-native-firebase/app + messaging@25` clean Android rebuild (google-services plugin + placeholder google-services.json): BUILD SUCCESSFUL. Runtime: Settings Notifications panel mounts with the module loaded — no null-module crash.

## Backend (ephemeral PG17) — 16 migrations
- Default `notification_preferences` created on profile insert (2 users → 2 rows). ✅
- `emit_match_end` trigger: match → FINISHED inserts a `match_end` event (matchId correct). ✅
- `emit_pool_invite` trigger: directed invite inserts a `pool_invite` event (inviteeUserId correct). ✅

## Static
- tsc clean; jest 54/54.

## Device (against remote after push)
- Migration applied + `notifications-dispatch` deployed.
- Settings → **NOTIFICACIONES**: "Activar notificaciones" + 5 per-event toggles rendered from real `notification_preferences`; toggles persist via `updatePref`.
- RNFirebase linked + loaded (no crash).

## NOT verifiable here (activation-pending)
- Actual FCM delivery — needs a real Firebase project (`google-services.json`), FCM v1 service account (`FCM_SERVICE_ACCOUNT` Supabase secret), and a cron invoking `notifications-dispatch`.
- `enablePush` token registration fails gracefully with the placeholder Firebase.
- Tap→deep-link handler + rank_up/goal event emission (deferred).
