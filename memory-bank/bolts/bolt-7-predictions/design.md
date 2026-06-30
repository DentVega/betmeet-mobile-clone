# Bolt 7 — Stage 2: Design (Matches & Predictions)

> Implements the Stage-1 model. First long list → adopt FlashList (project standard). Choices → ADR-013.

## Locked choices
| Concern | Choice | ADR |
|---|---|---|
| List | **@shopify/flash-list** (project standard; first list) — NATIVE dep → rebuild | ADR-013 |
| Day grouping in a flat list | flatten to typed rows `day-header | match` + `getItemType` | ADR-013 |
| Prediction input | modal `PredictionForm` (score steppers + conditional penalty picker) | — |

## Dependency
`@shopify/flash-list` (New-Arch compatible). **Native** → `pod install` (iOS) + Gradle rebuild. Flagged for the user.

## Structure
```
src/matches/
├── data/
│   ├── fixture.ts        # PURE: types + groupMatchesByDay(tz), isPast(now), canEdit(now)
│   ├── useFixture.ts     # TanStack Query: active competition → matches (+embeds) → Day[]
│   └── fixtureApi.ts     # savePrediction via functions.invoke('save-prediction', {poolId:null})
├── screens/
│   └── MatchesScreen.tsx # FlashList of flattened rows; past-days collapsed toggle; focus refetch
└── components/
    ├── MatchCard.tsx     # teams/placeholders, kickoff (local), status badge, my prediction, points if FINISHED → opens form
    └── PredictionForm.tsx# modal: home/away steppers (0–20), penalty winner picker iff knockout+draw, submit
```
`app/navigation/AppTabs.tsx` swaps the Matches placeholder for `MatchesScreen`. New `matches.*` i18n (es/en).

## Read query (PostgREST + RLS)
1. `competitions?select=id&is_active=eq.true&limit=1` → active competition id.
2. `matches?competition_id=eq.<id>&select=…` embedding:
   - `home_team:teams!matches_home_team_id_fkey(id,name,fifa_code,flag_path)`, `away_team:teams!matches_away_team_id_fkey(...)`,
   - `phase:competition_phases(type)`,
   - `predictions(id,home_score,away_score,penalty_winner_team_id,locked_at,pool_id)` filtered `predictions.pool_id=is.null` (RLS returns only mine),
   - `prediction_scores(total_points,matched_case)` (RLS only mine).
   Shaped client-side via `groupMatchesByDay(..., RNLocalize/Intl tz)`.

## Timezone
Device tz via `Intl.DateTimeFormat().resolvedOptions().timeZone` (no extra dep); `groupMatchesByDay` buckets by local calendar day; labels via `Intl`/`toLocaleDateString` with the current locale.

## Submit flow
`PredictionForm` → `save-prediction` (poolId:null). On `{ok:true}` → `queryClient.invalidateQueries(['fixture'])` + close. On `{ok:false,code}` → message via `tr('matches.errors.'+code)` (LOCKED/INVALID/NOT_ONBOARDED). Penalty picker appears only when `phase.type==='KNOCKOUT' && home===away`.

## Performance (vercel-react-native-skills)
FlashList with `getItemType` (header vs match) + stable `keyExtractor`; memoized `MatchCard`; no inline closures in render rows; `estimatedItemSize`. Day grouping computed in `useMemo`/selector, not per render.

## Test surface (Stage 5)
- Pure: `groupMatchesByDay` (tz bucketing, ordering), `isPast`, `canEdit` truth table.
- Component (RNTL): MatchCard renders teams/status/points; PredictionForm shows penalty picker only on knockout-draw and calls the api (mocked).
- tsc + bundle; (FlashList native build verified on device after rebuild).
