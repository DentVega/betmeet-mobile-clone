# Bolt 0 — Stage 5: Test

> Verifies the shell's testable surface. Bolt 0 has no feature UI, so testing targets the pure logic (the model's three pillars) + build integrity. Device-level E2E of full flows arrives once Auth (Bolt 1) gives real screens to drive.

## Unit tests (React Native Testing Library / Jest) — 21 passing
| Suite | Covers |
|---|---|
| `src/domain/__tests__/appPhase.test.ts` | `resolveAppPhase` truth table — all five branches (Booting/Auth/Onboarding/App incl. the authenticated-but-gate-unresolved → Booting case). |
| `src/domain/__tests__/deepLink.test.ts` | `parseDeepLink` for authConfirm/authReset/poolJoin, missing-token → null, unknown path → null, non-scheme → null; `isParkable`. |
| `src/app/__tests__/deepLinks.test.ts` | `decideDeepLinkAction` — ignore(null), park(poolJoin pre-App), navigate(poolJoin in App), navigate(non-parkable any phase). |
| `src/session/__tests__/sessionStore.test.ts` | status derivation (unauthenticated/unverified/authenticated), park→take-once→null, `clear()`. |

Component render tests (RNTL) for real screens are deferred to the bolts that add those screens; Bolt 0 ships only placeholders.

## Jest configuration change
`jest.config.js` extends `transformIgnorePatterns` to Babel-transform the ESM deps introduced here (`@react-navigation/*`, `react-native-url-polyfill`, `react-native-screens`, `react-native-keychain`, `react-native-safe-area-context`, `@supabase`, `zustand`). `@react-native/jest-preset@0.86.0` was installed (was missing from the template's node_modules).

## Static checks
- `npx tsc --noEmit` — **clean** (strict mode).
- Re.Pack/Rspack production bundle (android) — see result line below; this is the real "does it compile + resolve all imports + apply DefinePlugin" gate, since there's no Metro.

## Bundle build result
- `npx react-native bundle --platform android --entry-file index.js --dev false` → **exit 0** (Rspack 1.7.12, ~3.9 MB unminified). All `src/` imports + the new deps resolve; DefinePlugin applied.
- 2 warnings, both benign: Supabase's `Critical dependency: the request of a dependency is an expression` from its optional `@opentelemetry/api` dynamic require (guarded optional peer — standard in RN, no action needed).

## Device verification (agent-device) — deferred rationale
A meaningful device E2E (boot → Auth stub; fire `betmeet://pools/join/ABC` → park → route) needs a running simulator/emulator and is most valuable once Bolt 1 provides real auth to complete the parked-intent replay. Bolt 0's device check is limited to "app boots to the Auth stub and tabs are reachable", which is gated on a native build (Pods/Gradle). Tracked as the first task of Bolt 1's Test stage.

## Performance note
No measured perf work needed in Bolt 0 (placeholder screens, no lists). `react-native-best-practices` (diagnostic) was not triggered. FlashList usage and list perf are validated in the feature bolts.
