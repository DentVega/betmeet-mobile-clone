# Intent 002 — Bolt Plan (v2 full parity)

> AI-DLC Inception artifact. Sequenced bolts for v2. Each runs the DDD stages via `/bolt-start`. Continues numbering conceptually after Intent 001's bolts (0–9) + the design bolt (10); v2 bolts are labeled V1…V10.

## Sequencing rationale
Foundations first (i18n reactivity + Settings shell — everything new plugs into them). Then the **data spine** (results→auto-scoring→realtime) so leaderboards/live have data flowing. Then **pool depth** (backend then mobile). Then **account/security** (non-native). Finally the **native-module features** last, so their rebuilds (image picker, passkeys/biometrics, push) are batched at the end.

```
Foundations   V1 i18n · V2 Settings+Profile
Data spine    V3 Results & Auto-scoring (backend) → V4 Realtime & Live
Pool depth    V5 Pool Depth backend → V6 Pool Depth mobile (+ predictions overrides)
Account       V7 Account & Security (non-native)
Native        V8 Avatar upload → V9 Passkeys/biometrics → V10 Notifications (push)
```

## Topology
All v2 bolts compile into the single Re.Pack host bundle. **No Module Federation.** Native modules (V8/V9/V10) are host-linked; batch their `npm install` + Pods/Gradle rebuild.

---

## V1 — i18n foundation
- **Goal:** make locale reactive + selectable; fill dictionaries. (FR-IN1…IN4)
- **Delivers:** a reactive locale store (like the brand/scheme store) so `t()` re-renders live; language selector; `profiles.locale` + device persistence + boot hydrate; es/en dictionary sweep; bilingual rules content.
- **Depends on:** v1 i18n. **Exit:** switching es↔en re-renders the whole app live and persists.

## V2 — Settings shell + Profile basics
- **Goal:** the Settings surface + non-native profile edits. (FR-PS1, PS3, PS4, PS5)
- **Delivers:** Settings navigation (Profile/Security/Notifications/Language sections); post-onboarding nickname change (cooldown UI over `fn_set_nickname`); Google-photo avatar; locale selector placement; entry points for later units.
- **Depends on:** V1. **Exit:** Settings reachable; nickname change + language work.

## V3 — Results & Auto-scoring (backend)
- **Goal:** enter results + auto-score on finish. (FR-RS1…RS4)
- **Delivers:** `enter-result` Edge Function (guarded); **auto-scoring sweeper** (trigger on `matches`→FINISHED, or pg_net→Edge Function) replacing manual `compute-score`; revert; emits Realtime + notification-outbox events. ADR: trigger vs function (Q5).
- **Depends on:** v1 schema + `compute-score`. **Exit:** entering a result auto-populates `prediction_scores`; revert works; changes broadcast.

## V4 — Realtime & Live
- **Goal:** live updates + projection. (FR-RT1…RT4)
- **Delivers:** `useLiveResults` (Supabase Realtime → invalidate); live match status/scoreline; "live now" pool banner; **live leaderboard projection** (client scoring, reorder, ▲/▼ deltas). ADR: Postgres Changes vs Broadcast (Q4).
- **Depends on:** V3 (produces changes), v1 Matches/Leaderboard. **Exit:** LIVE matches + projected standings update in place.

## V5 — Pool Depth backend
- **Goal:** the backend for rich pools. (FR-PD1…PD7, FR-PP1)
- **Delivers:** `pool_directed_invites` table + `create-directed-invite` fn + `search-nicknames` RPC; `rename-pool`/`set-pool-visibility`/`set-pool-members-can-invite`/`archive-pool` fns; **masked pool-predictions RPC** (hide others' future picks); **membership-scoped leaderboard RPC** (`kickoff ≥ joined`, override else global); pool-scoped prediction reads.
- **Depends on:** v1 pools + save-prediction (poolId). **Exit:** all fns/RPCs validated on ephemeral PG (masking + scoping correct).

## V6 — Pool Depth mobile (+ predictions overrides)
- **Goal:** the pool UI. (FR-PD*, FR-PP1/PP2)
- **Delivers:** directed-invite UI (nickname typeahead), pool settings panel (rename/visibility/members-can-invite/archive), predictions-in-pool grid (masked + pre-join cells), per-pool override UI, membership-scoped leaderboard screen, live-now banner (via V4).
- **Depends on:** V5, V4, V2. **Exit:** full pool experience on device.

## V7 — Account & Security (non-native)
- **Goal:** account controls without native deps. (FR-AS1…AS4, AS6)
- **Delivers:** change email (confirm deep link), change password, delete account (`delete-account` fn: pool transfer + purge), MFA/TOTP (enroll/verify/disable), linked-providers management (≥1 active).
- **Depends on:** V2 (Security section). **Exit:** all account/security flows work; MFA prompts on login.

## V8 — Avatar upload (native)
- **Goal:** upload custom avatars. (FR-PS2)
- **Native dep:** image picker (react-native-image-picker/expo-image-picker) → rebuild. Storage own-folder write policy + signed-URL upload.
- **Depends on:** V2. **Exit:** pick/capture → upload → avatar set across app.

## V9 — Passkeys + biometrics (native)
- **Goal:** passkey sign-in/registration. (FR-AS5)
- **Native dep:** passkeys/biometrics lib (Q2) → rebuild. Supabase passkey API integration; onboarding passkey step.
- **Depends on:** V7 (Security section). **Exit:** register + sign-in with Face ID/fingerprint; last-method guard holds.

## V10 — Notifications (push, native)
- **Goal:** the push subsystem. (FR-NT1…NT5)
- **Native dep:** FCM/APNs messaging (Q1) → rebuild; server keys in Supabase secrets. Backend `notifications-dispatch` (FCM/APNs), `push_subscriptions`/`notification_preferences`/`notification_events`; onboarding push opt-in step; prefs UI (FR-PS6); tap→deep link.
- **Depends on:** V2 (prefs UI), V3 (emits events), V5/V6 (invite events). **Exit:** opted-in devices receive match-end/goal/rank-up/invite pushes that deep-link.

---

## Cross-bolt notes
- **Native rebuild batching:** V8/V9/V10 each add a native dep. Option to install all three up front and rebuild once, then implement per bolt — decide when starting V8.
- **Backend:** extends the user's Supabase (new migrations/functions/triggers) applied via `supabase db push` + `functions deploy` per bolt (as in v1).
- **Testing:** pure units (projection/masking/cooldown/scoping); Edge Functions/triggers on ephemeral PG; RNTL for screens; `agent-device` for push/biometrics/image-picker.
- **Deferred beyond v2:** live football-data.org sync + crons, full admin panel, business/transactional emails beyond auth.
