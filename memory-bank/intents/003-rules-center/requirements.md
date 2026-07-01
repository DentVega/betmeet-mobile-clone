# Intent 003 — Rules Center (condensed spec)

> Small, single-screen static-content feature → right-sized (one condensed doc + one bolt, not the full 5-artifact Inception; per CLAUDE.md "/simple-spec for small"). Traces the web `content/rules/{es,en}` + `/rules` page to a mobile Rules screen.

## Business intent
The web has a **Rules Center** (`/rules`) — an accordion of rule sections. Mobile only shows a one-paragraph rules step in onboarding. Add a dedicated **Rules screen** in mobile mirroring the web content, bilingual, reachable from Settings.

## Scope
- **In:** a `RulesScreen` with 5 collapsible sections (accordion) porting the web MDX content verbatim (es/en); an entry from Settings; bilingual.
- **Out:** the web's interactive scoring "calculator" (deferred — the scoring section text already explains the rules); onboarding changes beyond the existing step; MDX runtime (content is ported as typed structured blocks, not live MDX).

## Content (ported verbatim from betmeet-clone `content/rules/*`, ordered)
1. **Puntuación / Scoring** — exact 5; else stack result +2 + per-team goals +1; example BRA 2-1 vs pred 3-2 = 3; knockout penalty +1.
2. **Predicción de penales / Penalty predictions** — knockout draw → pick shootout winner → +1.
3. **Bloqueo de predicciones / Prediction locks** — edit until kickoff; locks at official match time.
4. **Empates en el ranking / Ranking ties** — league + global ranking; equal points → shared position, no tiebreaker.
5. **Ligas y miembros / Leagues and members** — public/private; up to 100; multi-league; owner can kick; can't join if full.

## Functional requirements
- **FR-R1** A Rules screen lists the 5 sections as an accordion (tap a title → expand/collapse its body).
- **FR-R2** Each body renders headings, paragraphs, and bullet lists with inline **bold**, themed (deportivo/moderno/premium × light/dark).
- **FR-R3** Content follows the active locale (es/en), reactive to the language toggle.
- **FR-R4** Reachable from Settings (a "Reglas / Cómo se juega" entry).

## Design (host bundle, no native module)
- **`src/education/rulesContent.ts`** — `rulesSections(locale)` → `{slug, title, blocks[]}[]`; block = `{h?}|{p?}|{ul?: string[]}` with `**bold**` inline markers. es/en verbatim.
- **`src/education/RuleBody.tsx`** — renders blocks; a tiny inline-bold renderer (split on `**`).
- **`src/education/RulesScreen.tsx`** — accordion (local expanded-set state) over the sections; themed; chevron indicator.
- **Nav** — `SettingsStackParamList += Rules`; a Settings button → Rules. i18n `settings.rules`.
- **Topology:** part of the host bundle (single bundle, no MF). No native module.

## Bolt plan (single bolt: V11 — Rules Center)
Model→Design (this doc)→Implement→Test. Implement the content module + RuleBody + RulesScreen + Settings entry + i18n; verify tsc/jest + device render (accordion expand + es/en). JS-only, no rebuild.

## Verification
tsc + jest; device: open Settings → Reglas → expand sections; toggle language → content switches.
