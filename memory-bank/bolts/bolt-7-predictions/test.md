# Bolt 7 — Stage 5: Test (Matches & Predictions)

## Unit (Jest) — 51/51 total (+8 new)
`src/matches/__tests__/fixture.test.ts`:
- `groupMatchesByDay` — day bucketing (UTC), day order, kickoff order within a day, TBD (null-kickoff) last.
- `isPastDay` — earlier day true, today false, tbd false.
- `canEdit` — SCHEDULED+future+both-teams true; FINISHED false; past-kickoff false; missing-team false.
- `todayKey` — local date key.

## Static
- `npx tsc --noEmit` — clean.
- Re.Pack/Rspack android bundle → **exit 0** (~4.9 MB) — FlashList + matches JS resolve.

## Not covered here (needs deploy + native rebuild + device)
- **FlashList native** requires `pod install` + Gradle rebuild before the list renders on device (ADR-013).
- Live fixture read (RLS embeds) + submit via deployed `save-prediction` + points from `compute-score` — verify on device against the real project (backend Bolts 3–5 are live; seed has 3 FINISHED to show points).
- RNTL component tests (MatchCard/PredictionForm) deferred (logic at the pure + api layer).

## User action
`npm i` already added @shopify/flash-list → **rebuild native** (`pod install` + `npm run android`/ios). No new migration/function in this bolt.
