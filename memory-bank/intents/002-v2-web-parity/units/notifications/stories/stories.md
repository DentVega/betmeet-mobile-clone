# Stories — Notifications (push)

## US-NT1 — Push opt-in — FR-NT1
As a user I want to enable push notifications.
- AC: an onboarding step + a Settings toggle request OS permission; on grant, a device token is registered; on deny, the app still works.

## US-NT2 — Device subscriptions — FR-NT2
As the system I want per-device tokens managed.
- AC: token saved to `push_subscriptions` on enable; deactivated on sign-out/permission loss; invalid tokens (410/404) cleaned up on send.

## US-NT3 — Per-event preferences — FR-NT3
As a user I want to choose notification types.
- AC: toggles for match start/end, pool invite, global rank-up, goal; the dispatcher only sends enabled types.

## US-NT4 — Delivery — FR-NT4
As the system I want to deliver events via FCM/APNs.
- AC: an emitted event (result/scoring/invite) is written to the outbox and dispatched via FCM (Android)/APNs (iOS) to subscribed, opted-in devices; failures don't block others.

## US-NT5 — Tap → deep link — FR-NT5
As a user I want tapping a notification to open the right screen.
- AC: tapping a pool-invite/goal/rank-up notification deep-links to the pool/match/leaderboard.
