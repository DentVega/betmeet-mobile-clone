# Unit: Notifications (push)

> Intent 002 (v2). Mirrors web `features/notifications` (FR-04, FR-PUSH-01, Unit 43) — re-platformed Web Push → FCM/APNs.

## Purpose
Native push notifications: opt-in, per-device tokens, per-event preferences, backend outbox + FCM/APNs dispatch, tap→deep-link.

## In scope
FR-NT1 opt-in (onboarding step + Settings) · FR-NT2 register/deactivate device tokens · FR-NT3 per-event prefs (match start/end, pool invite, rank-up, goal) · FR-NT4 backend outbox + dispatcher (FCM/APNs) · FR-NT5 tap → deep link.

## Out of scope
Business emails (backlog on web too); live UI (Realtime unit).

## Integrations
`push_subscriptions`, `notification_preferences`, `notification_events`/`deliveries` tables; `notifications-dispatch` Edge Function (FCM/APNs); events emitted by Results & Auto-scoring + Pool Depth (invites); deep-link router (v1).

## Dependencies
Depends on: Settings shell, Results & Auto-scoring (emits events), Pool Depth (invite events). Provides: push delivery for the whole app.

## Native module
**Push (FCM/APNs)** — @react-native-firebase/messaging or Expo Notifications (Q1). Server keys in Supabase secrets.

## Risk
Biggest re-platform: Web Push transport swapped for FCM/APNs; APNs cert/key + Firebase project provisioning (user); token dedupe/cleanup on 410/404.

## Stories
`stories/` (US-NT1…NT5).
