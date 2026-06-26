# Bolt 0 — Stage 2: Design

> How the app shell is built. Host bundle only (single Re.Pack bundle, no Module Federation). Implements the Stage-1 model. Library choices locked at the Design checkpoint → see `adr/`.

## Locked choices
| Concern | Choice | ADR |
|---|---|---|
| Navigation | **React Navigation v7** (native-stack + bottom-tabs on `react-native-screens`) | ADR-001 |
| Server state | **TanStack Query v5** | ADR-002 |
| Client/shell state | **Zustand** | ADR-002 |
| Secure storage | **react-native-keychain** (Supabase auth storage adapter) | ADR-003 |
| Deep links | **Custom `betmeet://` scheme** via RN linking config (Universal/App Links deferred) | ADR-004 |
| Bundler/topology | Re.Pack/Rspack, single host bundle (existing) | — (standards) |

## Dependencies to add
Runtime:
- `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- `react-native-screens`, `react-native-safe-area-context` (already present)
- `@tanstack/react-query`
- `zustand`
- `@supabase/supabase-js`, `react-native-url-polyfill`
- `react-native-keychain`

New-Arch (Fabric/TurboModules) compatibility verified for all native deps (screens, keychain). Pods install for iOS; autolinking for Android.

## Folder structure (new `src/`)
```
src/
├── app/
│   ├── App.tsx                 # providers: SafeArea → QueryClient → Navigation
│   ├── RootNavigator.tsx       # consumes resolveAppPhase → renders Booting/Auth/Onboarding/App
│   ├── linking.ts              # React Navigation LinkingOptions (betmeet:// → screens)
│   └── navigation/
│       ├── types.ts            # param lists for all stacks/tabs (typed routes)
│       ├── AuthStack.tsx       # placeholder screens (filled in Bolt 1)
│       ├── OnboardingStack.tsx # placeholder (Bolt 3)
│       └── AppTabs.tsx         # Matches | Pools | Rankings placeholders (later bolts)
├── domain/                     # pure, framework-free (Stage-1 model)
│   ├── appPhase.ts             # resolveAppPhase(...)
│   └── deepLink.ts             # parseDeepLink(...) + DeepLinkIntent types
├── session/
│   ├── sessionStore.ts         # Zustand store: session, authStatus, onboardingCompleted, parkedIntent
│   ├── secureStorage.ts        # react-native-keychain adapter (get/set/remove)
│   └── supabaseClient.ts       # supabase-js configured w/ secureStorage adapter + autoRefresh
├── data/
│   └── queryClient.ts          # TanStack QueryClient (staleTime defaults, focus refetch)
├── i18n/
│   ├── dictionaries/{es,en}.ts # mirror of web dictionaries (seed subset for shell)
│   └── index.ts                # locale resolver (default es)
└── ui/                         # shared primitives (Screen, Spinner) — minimal seed
```
`index.js` re-points to `src/app/App.tsx`. `metro.config.js` is **deleted** (Re.Pack-only project).

## Component & provider architecture
```
<SafeAreaProvider>
  <QueryClientProvider client={queryClient}>
    <NavigationContainer linking={linking} fallback={<Booting/>}>
      <RootNavigator/>          // switches stacks by resolveAppPhase(authStatus, onboardingCompleted)
    </NavigationContainer>
  </QueryClientProvider>
</SafeAreaProvider>
```
- `RootNavigator` selects the stack from the Zustand session store (single source of truth), so phase transitions are declarative (model invariant: never render App without verified+onboarded).
- Stacks for Auth/Onboarding/App contain **placeholder screens** in Bolt 0 (e.g. a "Sign in (Bolt 1)" stub) so the shell is navigable and testable end-to-end; real screens land in their bolts.

## State architecture
- **Zustand `sessionStore`** — `{ authStatus, session, onboardingCompleted, parkedIntent, actions: { hydrate, setFromSupabase, setOnboarding, park, takeParked, clear } }`. The only global client state.
- **Supabase auth subscription** wired in `App` bootstrap → calls `setFromSupabase` on `onAuthStateChange`; `hydrate()` runs once at boot to resolve `unknown` → real status.
- **TanStack Query** owns all server data later; Bolt 0 only configures the client (default `staleTime`, refetch-on-focus via AppState bridge).

## Session & secure storage (NFR-5)
- `secureStorage.ts` exposes `{ getItem, setItem, removeItem }` over `react-native-keychain` (one keychain entry per key) → passed as Supabase `auth.storage`.
- Supabase client: `{ auth: { storage: secureStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }` + `react-native-url-polyfill/auto`.
- AppState listener calls `supabase.auth.startAutoRefresh()/stopAutoRefresh()` on foreground/background.

## Deep linking (ADR-004)
- `linking.ts`: `prefixes: ['betmeet://']`, config maps `auth/confirm`, `auth/reset`, `pools/join/:token` to screens (stubs in Bolt 0).
- `parseDeepLink` (domain) is used for the **parking** logic: if a `poolJoin` arrives while not `App` phase, store in `sessionStore.parkedIntent`; `RootNavigator` replays it once phase becomes `App`, then clears it.
- Native registration: iOS `CFBundleURLSchemes`, Android intent-filter `scheme="betmeet"` — added in Implement.

## Host vs federated-remote placement
All Bolt 0 code is **host bundle**. No `ScriptManager`, no remote config. Confirmed against `system-context.md` §2 (Auth/Onboarding must be in host; remotes deferred).

## Test surface (Stage 5 preview)
- Unit (RNTL/Jest): `resolveAppPhase` truth table; `parseDeepLink` cases incl. unknown→null; `RootNavigator` renders correct stack per session store; secureStorage adapter mocked.
- Device (`agent-device`): app boots to Auth stub; firing `betmeet://pools/join/ABC` while signed-out parks then routes correctly (validated more fully once Auth exists in Bolt 1).
