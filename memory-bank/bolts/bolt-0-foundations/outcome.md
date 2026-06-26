# Bolt 0 — Foundations & App Shell — Outcome

- **Status:** ✅ Complete
- **Intent:** 001-mobile-v1-migration
- **DDD stages:** Model → Design → ADR → Implement → Test (all checkpoints approved)

## What shipped
The host scaffolding every feature unit depends on, in one Re.Pack bundle (no Module Federation):
- **Navigation** (React Navigation v7): `RootNavigator` switches Auth / Onboarding / App-tabs stacks declaratively from the session store via the pure `resolveAppPhase`. Placeholder screens label their owning bolt.
- **Session** (`@supabase/supabase-js`): client configured with a **react-native-keychain** secure-storage adapter, foreground-only auto-refresh, and a boot hook (`useSessionBootstrap`) wiring `onAuthStateChange`.
- **State**: TanStack Query v5 client (`src/data/queryClient.ts`) + Zustand `sessionStore` (auth status, profile gate, parked deep-link intent).
- **Deep links** (`betmeet://`): pure `parseDeepLink` + pure `decideDeepLinkAction` (park vs navigate), executed via a navigation ref; native registration on iOS (`CFBundleURLTypes` + AppDelegate `open url`) and Android (manifest intent-filter).
- **i18n** seed (`es` default + `en`), typed dictionary.

## Files
- New: `src/{domain,session,data,i18n,ui,config,app}/**` (+ 4 test suites).
- Wiring: `index.js` → `src/app/App.tsx`; `rspack.config.mjs` DefinePlugin (Supabase env); `jest.config.js` transformIgnorePatterns.
- Native: `ios/BetmeetMobile/Info.plist`, `ios/BetmeetMobile/AppDelegate.swift`, `android/app/src/main/AndroidManifest.xml`.
- Removed: `metro.config.js`, template `App.tsx`, stale `__tests__/App.test.tsx`.
- Deps added: React Navigation v7 (native-stack, bottom-tabs) + react-native-screens, @tanstack/react-query, zustand, @supabase/supabase-js, react-native-url-polyfill, react-native-keychain (+ dev @react-native/jest-preset). Installed with `--legacy-peer-deps` (RN peer-range quirk).

## ADRs
ADR-001 navigation · ADR-002 state · ADR-003 secure storage · ADR-004 deep links.

## Verification
- `tsc --noEmit` clean; `jest` 21/21 passing; Rspack android bundle exit 0 (benign Supabase OpenTelemetry warning only).

## Carried forward / follow-ups
- **Real Supabase env** (`SUPABASE_URL`/`SUPABASE_ANON_KEY`) must be supplied to the build for Bolt 1 to exercise auth (placeholders boot the shell but can't authenticate).
- **Profile gate**: `useSessionBootstrap` has a TODO to fetch `profile.onboardingCompleted` once authenticated — wired in Bolt 3. Until then an authenticated session sits at `Booting` (no real auth exists yet, so the demoable path is unauthenticated → Auth).
- **iOS `RCTLinkingManager`** in Swift may need a bridging-header import if the Pod headers aren't visible; verify at first native iOS build.
- **Native build not yet run** (Pods/Gradle) — first device boot + deep-link E2E is the opening task of Bolt 1's Test stage (`agent-device`).
- **Universal/App Links** (intent Q4) still deferred.

## Next
Bolt 1 — Auth. (Recommend supplying real Supabase env first.)
