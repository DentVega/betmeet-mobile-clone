# Bolt V11 — Rules Center — Outcome

- **Status:** ✅ Complete (verified on device). Intent 003 (condensed). JS-only, host bundle, no native module.
- **Stories:** FR-R1…R4.

## What shipped
- `src/education/rulesContent.ts` — 5 rule sections (scoring, penalties, match-locks, ties, pools) ported verbatim from betmeet-clone `content/rules/{es,en}`, as typed blocks (h/p/ul) with `**bold**` inline; es/en via getLocale().
- `src/education/RuleBody.tsx` — renders blocks + a tiny inline-bold renderer (split on `**`), themed.
- `src/education/RulesScreen.tsx` — accordion (first section open) over the sections; chevron; themed.
- Nav: `SettingsStackParamList += Rules`; a "Reglas → Cómo se juega" entry in Settings; screen title reuses `onboarding.rules.title`. i18n `settings.rules`.

## Verification
tsc clean; jest 54/54; device: Settings → Reglas → "Cómo se juega" renders the 5-section accordion; Puntuación expanded shows headings/paragraphs/bullets with inline bold; others collapse. Bilingual (follows the language toggle).

## Deferred
The web's interactive scoring **calculator** (the scoring text already explains the rules).
