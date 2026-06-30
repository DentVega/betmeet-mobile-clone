# ADR-009 — RLS read model + Edge-Function writes + profile trigger

- **Status:** Accepted (Bolt 3)
- **Context:** Mobile reads should be direct (PostgREST + RLS) for speed/simplicity; writes carry server-only business logic (capacity, invite-token gen, lock-at-kickoff, scoring, nickname discriminator) that must not be bypassable.
- **Decision:**
  1. **Reads via RLS** for role `authenticated` (policies ported verbatim from the blueprint).
  2. **`predictions`**: keep the blueprint's own-unlocked INSERT/UPDATE RLS **and** the `prediction_lock_guard` trigger, so a client *could* upsert directly, but the kickoff lock is tamper-proof. The Bolt 4 `save-prediction` function still owns eligibility + lock-setting; direct writes remain RLS-bounded.
  3. **`pools`, `pool_memberships`, `prediction_scores`**: **no client write policies** → all mutations go through Edge Functions using the service role (Bolt 4).
  4. **Profiles**: UPDATE-own allowed (onboarding flag, avatar, locale); nickname **discriminator assignment** is an Edge Function/RPC to keep base+discriminator uniqueness atomic.
  5. **`handle_new_user` trigger** auto-creates the `profiles` row on `auth.users` insert (SECURITY DEFINER) → closes the Bolt 1 profile-gate gap.
  6. **`is_pool_member()` SECURITY DEFINER helper** backs the pool/membership member-visibility policies to avoid recursive RLS evaluation.
- **Alternatives:** all writes via functions incl. predictions (rejected — blueprint already has safe prediction RLS + trigger; keeps simple upserts cheap); app-side profile creation (rejected — race/duplication; trigger is atomic).
- **Consequences:** Clear split — reads = RLS, game-state writes = Edge Functions. RLS recursion avoided via the helper. The lock trigger guarantees prediction immutability regardless of path.
