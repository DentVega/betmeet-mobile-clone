# Bolt 7 — Matches & Predictions — Outcome

- **Status:** ✅ Complete (code; needs native rebuild for FlashList + device verify against live backend)
- **Intent:** 001-mobile-v1-migration · Phase C
- **DDD:** Model → Design → ADR-013 → Implement → Test (checkpoints approved)
- **Stories:** US-M1…M5

## What shipped
The Matches tab: fixture grouped by day + predict before kickoff + results/points.
- **`src/matches/`**: `data/fixture.ts` (pure: groupMatchesByDay/isPastDay/canEdit/todayKey), `data/useFixture.ts` (TanStack Query: active competition → matches + RLS embeds → Day[]), `data/fixtureApi.ts` (save-prediction invoke, global scope), `screens/MatchesScreen.tsx` (FlashList of flattened day/match rows + past-days toggle + focus refetch), `components/MatchCard.tsx` (memoized), `components/PredictionForm.tsx` (modal; penalty picker only on knockout draw).
- **FlashList** adopted (ADR-013) — flattened typed rows + `getItemType`.
- `AppTabs` Matches placeholder → real `MatchesScreen`. `matches.*` i18n (es/en).
- Reads only mine via RLS (global predictions + scores); write via `save-prediction` (server enforces lock/eligibility/penalty).

## ADRs
ADR-013 — FlashList for the fixture (first long list; native dep).

## Verification
- `tsc` clean; `jest` 51/51 (+8 fixture tests); Rspack android bundle exit 0 (4.9 MB).
- No new migration/function (backend already provides matches + save-prediction + compute-score).

## User action
- **Native rebuild** for FlashList: `bundle exec pod install --project-directory=ios` (iOS) + `npm run android`/`npm run ios`.
- Then verify on device: fixture loads (14 seeded matches), predict a SCHEDULED match → saved; FINISHED matches show result; after `compute-score` on a finished match, predictions show points.

## Carried forward
- Pool-scoped predictions (poolId) — Bolt 8 (Pools) wires the pool context.
- Live/LIVE status realtime — polling/focus refetch only in v1.
- RNTL component tests deferred.

## Next
Bolt 8 — Pools (mobile): create/discover/join (create-pool/join-pool fns) + membership management + deep-link join.
