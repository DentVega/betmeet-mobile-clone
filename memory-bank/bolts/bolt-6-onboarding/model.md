# Bolt 6 — Stage 1: Model (Onboarding)

> First Phase C (mobile) bolt. The profile-completion wizard that gates the app shell: nickname → avatar → rules → done. Builds on the live backend (Bolt 3–5) + the Bolt 0 shell + Bolt 1 session/gate. Traces to `units/onboarding/` (US-O1…O4). Includes one small backend addition: a `set-nickname` function (deferred here from Bolt 4).

## Ubiquitous language
- **Onboarding wizard** — the dedicated stack shown while `onboarding_completed=false` (Bolt 0 `resolveAppPhase → Onboarding`).
- **Nickname** — `nickname_base` (3–20, `[a-zA-Z0-9_-]`) + assigned **discriminator** (`#0000–9999`), unique together.
- **Avatar** — `avatar_url` chosen from the default set (`avatar_assets`) or the Google photo (if OAuth). No custom upload (v1).
- **Complete** — sets `onboarding_completed=true` → the gate admits the user to the app tabs.

## Backend addition (small) — `fn_set_nickname` + `set-nickname` Edge Function
Nickname assignment needs atomic discriminator allocation against the unique `(nickname_base, nickname_discriminator)` constraint — not safe as a plain client update. So:
- **`fn_set_nickname(p_base text) returns jsonb`** (plpgsql, SECURITY DEFINER, `auth.uid()`): validate regex/length; assign a random 4-digit discriminator with up to 10 retries doing a case-insensitive collision check vs non-deleted profiles; update the caller's profile (`nickname_base`, `nickname_discriminator`, `nickname_updated_at`, bump `nickname_change_count`); return `{ ok, nickname: "base#1234" }`. Onboarding is the first set → no cooldown. (Post-onboarding cooldown lives in Settings, v2.)
- **`set-nickname` Edge Function** (JWT) wraps it (uniform write API, error mapping: `INVALID`, `NICKNAME_TAKEN`).

## Direct-RLS writes (no function needed)
- **Avatar**: `update profiles set avatar_url=…, avatar_source='DEFAULT_SET'|'GOOGLE_PHOTO' where id=auth.uid()` — allowed by the `profiles_update_own` policy.
- **Complete onboarding**: `update profiles set onboarding_completed=true where id=auth.uid()` — same policy; flipping it makes `useSessionBootstrap`'s gate (refetched) move the shell to App.

## Reads
- `avatar_assets` (RLS public) for the default avatar grid.
- Current profile (`profiles` own row) to prefill / know the resolved nickname.

## Flow (state machine within the wizard)
`Nickname → Avatar → Rules → (complete)`. Per-step Back without data loss (local wizard state). On complete: write `onboarding_completed=true`, then refresh the session-store gate so `resolveAppPhase` advances (no manual navigation to tabs — declarative, like Bolt 0).

## Invariants
- The wizard never lets the user reach the app tabs without `onboarding_completed=true` (structural via the gate).
- Nickname uniqueness is enforced server-side (function + DB constraint); the client only displays the assigned `base#discriminator`.
- Avatar/complete are RLS-bounded own-row writes; nothing trusts a client-supplied user id.

## Out of model
Custom avatar upload, nickname change/cooldown UI (Settings, v2). Predictions/pools/leaderboard (later bolts).
