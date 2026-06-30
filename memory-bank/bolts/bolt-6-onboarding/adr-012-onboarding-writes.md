# ADR-012 — Onboarding writes: set-nickname function + direct-RLS avatar/complete + gate refresh

- **Status:** Accepted (Bolt 6)
- **Context:** Onboarding writes three things: nickname (needs atomic unique discriminator), avatar, and the completion flag. Completing is a table UPDATE, not an auth event.
- **Decision:**
  1. **Nickname → `fn_set_nickname` (plpgsql SECURITY DEFINER) + `set-nickname` Edge Function.** Discriminator allocation must be atomic vs the `(nickname_base, nickname_discriminator)` unique constraint, so it can't be a plain client update.
  2. **Avatar + complete → direct PostgREST `update profiles … where id=auth.uid()`** under the existing `profiles_update_own` RLS policy. No function needed.
  3. **Gate refresh** — after `completeOnboarding` succeeds, the client calls `useSessionStore.getState().setOnboardingCompleted(true)`; `resolveAppPhase` then flips `Onboarding → App` declaratively. (The `onAuthStateChange` gate won't refire for a table update, so the store is updated directly — same source of truth.)
  4. **Per-step commit** — each wizard step persists as it completes, so Back/forward needs no fragile transient state.
- **Alternatives:** all onboarding writes via Edge Functions (rejected — avatar/complete are trivial own-row updates RLS already permits); flip the gate by forcing a session refresh (rejected — heavier than a store update; the store is the gate's source).
- **Consequences:** Minimal new backend surface (one function); the rest reuses RLS. The shell advances without imperative navigation. Re-running set-nickname during onboarding is allowed (no cooldown; cooldown is a Settings/v2 concern).
