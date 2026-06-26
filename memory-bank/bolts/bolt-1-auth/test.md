# Bolt 1 — Stage 5: Test

> Verifies the auth logic surface. Pure validators, error mapping, deep-link parsing/routing, and the profile-gate fallback are unit-tested. Full auth flows need a device + real Supabase (deferred to the device step below).

## Unit tests (Jest) — 43 passing total (22 new this bolt)
| Suite | Covers |
|---|---|
| `src/auth/__tests__/validation.test.ts` | zod schemas: signIn/signUp/forgot/reset — valid + invalid (email, short password, required, confirm mismatch); asserts i18n message-keys. |
| `src/auth/__tests__/authErrors.test.ts` | `mapAuthError` table: invalidCredentials, emailNotConfirmed, emailAlreadyInUse, weakPassword, rateLimited(429), network, unknown fallback, null. |
| `src/auth/__tests__/profileGate.test.ts` | `fetchOnboardingCompleted`: true when set; **false on error / missing row** (the never-stuck-at-Booting fallback). Supabase client mocked. |
| `src/domain/__tests__/deepLink.test.ts` | added `authCallback` parse (+ null when no code). |
| `src/app/__tests__/deepLinks.test.ts` | added `authCallback` → navigate decision. |
| (Bolt 0 suites) | appPhase, sessionStore, deepLink/deepLinks still green. |

Component tests (RNTL) for the screens were scoped but deferred: each screen wires RHF + Controller + AuthService, and the meaningful assertions (validation, error display, service calls) are already covered at the pure layer (zod schemas, mapAuthError) plus the service contract. Screen-render tests are tracked as a follow-up once a device smoke confirms the wiring end-to-end.

## Static checks
- `npx tsc --noEmit` — **clean** (strict).
- Re.Pack/Rspack android bundle — see result line below.

## Bundle build result
- `npx react-native bundle --platform android --dev false` → **exit 0** (Rspack 1.7.12, ~4.6 MB). All auth modules + RHF/zod resolve. 2 benign Supabase OpenTelemetry warnings only.

## Device verification (agent-device) — required next, needs config
A real end-to-end run (boot → SignUp → confirm email via deep link → SignIn → land on Onboarding placeholder; + Google OAuth; + reset) depends on backend config that is NOT code:
1. **Supabase dashboard → Auth → URL Configuration**: allow-list redirect URLs `betmeet://auth/callback`, `betmeet://auth/reset`, `betmeet://auth/confirm`.
2. **Google provider** enabled in Supabase Auth.
3. App rebuilt with real `SUPABASE_URL`/`SUPABASE_ANON_KEY` (the dev server must be restarted so DefinePlugin picks up `.env`).
Once set, this is the opening task of the device check (also clears the deferred Bolt 0 boot/deep-link smoke).

## Profile-gate schema caveat
`fetchOnboardingCompleted` assumes table `Profile` / column `onboardingCompleted` / id `id`. Exact names are confirmed in **Bolt 2 (write-path audit)** against the live schema; the defensive `false` fallback means a mismatch routes the user to Onboarding rather than breaking auth.

## Performance note
No measured perf work needed (forms, no lists). `react-native-best-practices` not triggered.
