# Bolt V7 — Test (Account & Security)

## Static
- `tsc --noEmit` clean; `jest` 54/54.

## Backend (ephemeral PG17) — delete-account pool-transfer logic
Replicated the Edge Function's steps as SQL for a user u1 owning a shared pool (members u2 older, u3) and a solo pool:
- Shared pool → ownership **transferred to the oldest other member** (u2). ✅
- Solo pool → **deleted** (0 rows). ✅
- Profile → `deleted_at` set. ✅

## Device (Pixel 7 Pro, against remote)
- Deployed `delete-account` (verify_jwt=true).
- Settings → "Cuenta y seguridad" → **SecurityScreen renders all sections**: Change email, Change password (with Mostrar toggle), **VERIFICACIÓN EN DOS PASOS → Activar 2FA**, **PROVEEDORES VINCULADOS** (real identity `email` loaded; **Vincular Google** shown; no unlink since only 1 identity → ≥1 guard), **ZONA DE PELIGRO → Eliminar mi cuenta**.
- Data loads from `getUserIdentities` + `mfa.listFactors`.

## Not executed on the live account (destructive)
- Actual email change / account deletion (verified render + wiring; transfer logic proven on PG).
- MFA enroll→verify round-trip (needs an authenticator app); enroll surface renders.
- Google link OAuth round-trip (reuses the validated sign-in browser flow).
