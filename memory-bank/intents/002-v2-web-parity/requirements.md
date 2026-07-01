# Intent 002 — Betmeet Mobile v2 (full web parity)

> AI-DLC Inception artifact. Closes the gap between mobile v1 and the web app. Traces forward to `system-context.md` → `units/*/unit-brief.md` → `stories/` → bolts. Builds on the Intent 001 codebase + own Supabase backend.

## Business intent
Bring the RN app to **feature parity** with `betmeet-clone`: add every user-facing web feature missing from v1. Verified via a full Units 1–72 gap analysis (`bolts/` will reference it). Backend continues in the user's own Supabase (RLS + Edge Functions); mobile-direct; single Re.Pack bundle.

## Scope decisions (locked at Inception checkpoint)
| Decision | Choice |
|---|---|
| **Coverage** | **Full parity** — all missing user-facing features. |
| **Native modules** | Include all three: **avatar upload (image picker)**, **Passkeys + MFA/biometrics**, **Push notifications (FCM/APNs)**. |
| **Admin / data automation** | **Auto-scoring on match finish + a minimal result-entry surface.** NO live football-data.org sync, NO full admin panel (stays web-only / out of mobile). |
| **Realtime** | In scope — Supabase Realtime drives live status / live-now banners / live leaderboard projection **off manually-entered results** (not a live provider feed). |
| **Topology** | Single Re.Pack bundle, host-only. No Module Federation. |
| **Excluded (web-infra, N/A)** | RSC/Next perf units (22/26/27/37), CSP, SSR routing, web App Shell/navbar, marketing landing, web-only CSS fixes. |

## Already in v1 (reconciled — not gaps)
Auth core, onboarding (nickname/default-avatar/rules + gate), fixture-by-day **incl. past-days toggle**, predictions (global) + lock + points, pools (create/discover/join/token/deep-link/detail/leave/kick/delete), global + basic pool leaderboard, "already-joined" state in discover (via `is_member`), es/en dictionaries (partial), 3 brand themes + light/dark + fonts + flags/avatars, own Supabase backend (schema/RLS/Edge Functions/ranking RPCs/manual seed).

## v2 Units
1. **Account & Security** — change email, change password, delete account (hard purge), MFA/TOTP, Passkeys (native biometrics), linked-providers management.
2. **Profile & Settings** — Settings shell/navigation; avatar upload (native image picker) + Google-photo avatar; post-onboarding nickname change (cooldown); locale selector; notification-preferences UI.
3. **Notifications (push)** — native FCM/APNs registration, per-device subscriptions, per-event preferences, backend event outbox + dispatch (re-platformed from Web Push).
4. **Realtime & Live** — Supabase Realtime hook; live match status, "live now" banners, live leaderboard projection + refresh.
5. **Pool Depth** — directed invites by email/nickname (+ nickname typeahead), members-can-invite permission, rename pool, change visibility, archive, pool settings panel, predictions-in-pool grid (+ hide-future masking, pre-join cells), membership-scoped pool leaderboard.
6. **Predictions — pool overrides** — per-pool prediction overrides (distinct from global) + knockout penalty-shootout bonus confirmation.
7. **Results & Auto-scoring** — minimal result-entry surface (owner/admin-secret) + auto-scoring sweeper on match finish (Edge Function/trigger) → feeds Realtime.
8. **i18n completion** — language selector (header + settings), device/profile locale persistence, complete es/en dictionaries, bilingual rules content.

## Functional requirements

### FR-AS — Account & Security (Unit 1; web Units 19/20/21/38, FR-01.4/.6/.7)
- **FR-AS1** Change email with single-link confirmation to the new address (`supabase.auth.updateUser({email})` + verify deep link). (web FR-REFINE-19)
- **FR-AS2** Change password (re-auth with current password → update). (FR-01.3)
- **FR-AS3** Delete account: transfer/relinquish owned pools per rules, soft-delete profile, then hard-purge `auth.users` (server-side, service role). (web FR-REFINE-21)
- **FR-AS4** MFA/TOTP: enroll (QR + secret), verify 6-digit, disable; prompt on login when enabled. (FR-01.6)
- **FR-AS5** Passkeys: register / list / delete / sign-in via platform WebAuthn (Face ID / fingerprint). Min one active auth method enforced. (FR-01.7, web Units 20/38) — **native module**.
- **FR-AS6** Linked providers: view email/Google/passkeys, link/unlink, keep ≥1 active. (FR-01.4)

### FR-PS — Profile & Settings (Unit 2; web FR-02, FR-REFINE-17, FR-I18N-24)
- **FR-PS1** A **Settings** area (profile + security tabs) reachable from the app shell.
- **FR-PS2** Avatar **upload**: pick from library/camera → signed-URL upload to Supabase Storage → set as avatar. (web `create-avatar-upload-url`/`set-avatar-from-upload`) — **native module (image picker)**.
- **FR-PS3** Avatar from **Google photo** when signed in via Google.
- **FR-PS4** Post-onboarding **nickname change** honoring the cooldown (2 changes then 30-day lock) already in `fn_set_nickname`.
- **FR-PS5** **Locale** selector persisted to `profiles.locale` + device pref (feeds i18n).
- **FR-PS6** **Notification preferences** UI (per-event toggles) — wired to Notifications unit.

### FR-NT — Notifications (Unit 3; web FR-04, FR-PUSH-01, Unit 43)
- **FR-NT1** Explicit push opt-in (onboarding step + Settings). — **native module (FCM/APNs)**.
- **FR-NT2** Register/deactivate per-device push tokens; dedupe + cleanup invalid tokens.
- **FR-NT3** Per-event preferences: match start/end, pool invite, global rank-up, goal. (FR-PUSH-01.2)
- **FR-NT4** Backend event **outbox + dispatcher** re-platformed to send via FCM/APNs (reuse the outbox model; swap the transport). Triggered by result/scoring/invite events. (web `services/events.ts`,`dispatcher.ts`)
- **FR-NT5** Tapping a notification deep-links to the relevant screen (pool, match, leaderboard).

### FR-RT — Realtime & Live (Unit 4; web FR-REFINE-58/61/62, Unit 43/50)
- **FR-RT1** A `useLiveResults` equivalent subscribing to **Supabase Realtime** (broadcast/postgres-changes) on match/score updates → invalidate/refetch.
- **FR-RT2** Live match status on the fixture (LIVE badge, live scoreline) updating in place.
- **FR-RT3** "Live now" banner in pools when a member's match is live. (FR-REFINE-61)
- **FR-RT4** **Live leaderboard projection**: `confirmed + Σ computeScore(pick, liveScore)`, reorder, show "14 → 19" + ▲/▼ deltas while matches are LIVE. (FR-REFINE-62)

### FR-PD — Pool Depth (Unit 5; web Units 10/44/45/47/53/54/55/56/61/65, FR-REFINE-41)
- **FR-PD1** **Directed invites** by email or nickname (nickname typeahead search) → invite record + notification. (web `create-directed-invite`,`search-nicknames`)
- **FR-PD2** **Members-can-invite** permission toggle (owner; private + public pools). (Units 45/47)
- **FR-PD3** **Rename pool** with confirmation (name-uniqueness for public). (FR-REFINE-54)
- **FR-PD4** **Change visibility** public↔private (optimistic, uniqueness guard). (Unit 65)
- **FR-PD5** **Archive pool** / pool settings panel container. 
- **FR-PD6** **Predictions-in-pool grid**: per-day grid of members' picks + points, visible from kickoff; **hide future predictions of others** before lock (server masking); pre-join empty cells for non-members. (FR-REFINE-41/53/56)
- **FR-PD7** **Membership-scoped pool leaderboard**: only matches with `kickoff_at ≥ joined_at`, using the member's pool override else global pick. (FR-REFINE-55)

### FR-PP — Predictions: pool overrides (Unit 6; web Unit 48, FR-REFINE-36)
- **FR-PP1** Per-pool prediction **overrides**: a member can set a pick for a specific pool distinct from their global pick (`predictions.pool_id`). Save-prediction already supports `poolId`; add the UI + reads.
- **FR-PP2** Confirm knockout **penalty-shootout bonus** in scoring (predicted penalty winner vs actual). (already in `compute-score`; verify + surface in UI)

### FR-RS — Results & Auto-scoring (Unit 7; web FR-REFINE-31/35, Unit 6/50)
- **FR-RS1** **Minimal result-entry**: enter/edit a match result (score, winner, penalties) → sets status FINISHED. Guarded (admin secret / restricted). No full admin panel.
- **FR-RS2** **Auto-scoring sweeper**: on a match reaching FINISHED, automatically compute `prediction_scores` (DB trigger or Edge Function), replacing today's manual `compute-score` invocation.
- **FR-RS3** **Revert** a result (clear scores + delete affected `prediction_scores`). (web `revert-override`)
- **FR-RS4** Scoring/result changes emit Realtime + notification events (feeds FR-RT/FR-NT).

### FR-IN — i18n completion (Unit 8; web FR-I18N-24, FR-REFINE-66)
- **FR-IN1** Language **selector** (es/en) in the app shell + Settings.
- **FR-IN2** Persist locale to `profiles.locale` + device; hydrate on boot; re-render on change.
- **FR-IN3** Complete es/en dictionaries covering all v2 UI copy.
- **FR-IN4** Bilingual **rules content** (es/en).

## Non-functional requirements
- **NFR-1** Stack unchanged: RN 0.86 New Arch, Re.Pack 5, TypeScript strict, single bundle.
- **NFR-2** New native deps (push, passkeys/biometrics, image picker) must be New-Arch compatible; each addition documents its rebuild (Pods/Gradle) in the bolt.
- **NFR-3** Writes continue through Edge Functions / RLS; no client bypass of business rules (masking, cooldown, membership scoping enforced server-side).
- **NFR-4** Realtime is additive: focus-refetch remains the fallback if a socket drops.
- **NFR-5** Secrets: push server keys (FCM/APNs) + any admin secret live in Supabase secrets, never in the client.
- **NFR-6** Testing: RNTL for new screens; pure-logic unit tests (projection math, masking, cooldown, scoping); Edge Functions/triggers validated on ephemeral PG; `agent-device` for push + biometrics + image-picker flows.

## Constraints & assumptions
- **C1** Backend is the user's own Supabase (built in Intent 001); v2 extends it (new tables/policies/functions/triggers), not a migration.
- **C2** No live football-data.org feed in v2 — results are entered manually; Realtime/projection operate on those.
- **C3** Admin stays out of mobile beyond the minimal result-entry (FR-RS1).
- **A1** FCM/APNs credentials can be provisioned (Firebase project + APNs key) by the user for push.
- **A2** The device supports platform passkeys/biometrics for FR-AS5.

## Open questions (resolve during Construction Design)
- **Q1** Push provider on RN: Expo Notifications vs bare `@react-native-firebase/messaging` + APNs. Decide at the Notifications bolt.
- **Q2** Passkeys library on bare RN (react-native-passkeys / platform APIs) + Supabase passkey API compatibility.
- **Q3** Image picker lib (react-native-image-picker vs expo-image-picker) given bare RN.
- **Q4** Realtime mechanism: Postgres Changes vs Broadcast for score updates.
- **Q5** Result-entry surface: in-app owner-gated screen vs a protected function only (curl/tool). 

## Traceability
Every story references an FR above; every FR maps to a web unit/FR-REFINE noted inline; the full DONE/PARTIAL/MISSING matrix lives in the Bolt-2-style gap analysis captured for this intent.
