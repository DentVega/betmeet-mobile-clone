/**
 * Pure fixture domain (test surface): day grouping in device-local tz, past-day
 * check, edit eligibility. No I/O.
 */
export type MatchStatus =
  | 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
export type PhaseType = 'GROUP' | 'KNOCKOUT' | 'LEAGUE';

export interface TeamRef { id: string; name: string; fifaCode: string; flagPath: string }
export interface MyPrediction {
  id: string; homeScore: number; awayScore: number;
  penaltyWinnerTeamId: string | null; lockedAt: string | null;
}
export interface MyScore { totalPoints: number; matchedCase: string }

export interface FixtureMatch {
  id: string;
  kickoffAt: string | null;
  status: MatchStatus;
  phaseType: PhaseType;
  homeTeam: TeamRef | null;
  awayTeam: TeamRef | null;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: string | null;
  prediction: MyPrediction | null;
  score: MyScore | null;
}

export interface Day { dateKey: string; label: string; matches: FixtureMatch[] }

export interface GroupOpts { timeZone: string; locale: string; tbdLabel: string }

function dateKey(iso: string, tz: string): string {
  // en-CA → YYYY-MM-DD (stable, sortable)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(iso));
}

function dayLabel(iso: string, tz: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz, weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(iso));
}

/** Bucket matches into local-tz calendar days (TBD/no-kickoff last). */
export function groupMatchesByDay(matches: FixtureMatch[], opts: GroupOpts): Day[] {
  const map = new Map<string, Day>();
  const tbd: FixtureMatch[] = [];
  for (const m of matches) {
    if (!m.kickoffAt) { tbd.push(m); continue; }
    const key = dateKey(m.kickoffAt, opts.timeZone);
    if (!map.has(key)) {
      map.set(key, { dateKey: key, label: dayLabel(m.kickoffAt, opts.timeZone, opts.locale), matches: [] });
    }
    map.get(key)!.matches.push(m);
  }
  const days = [...map.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  for (const d of days) {
    d.matches.sort((a, b) => (a.kickoffAt ?? '').localeCompare(b.kickoffAt ?? ''));
  }
  if (tbd.length) { days.push({ dateKey: 'tbd', label: opts.tbdLabel, matches: tbd }); }
  return days;
}

export function todayKey(now: Date, tz: string): string {
  return dateKey(now.toISOString(), tz);
}

export function isPastDay(day: Day, today: string): boolean {
  return day.dateKey !== 'tbd' && day.dateKey < today;
}

/** Mirror of server eligibility — advisory, for showing/hiding the form. */
export function canEdit(m: FixtureMatch, now: Date): boolean {
  return (
    m.status === 'SCHEDULED' &&
    !!m.kickoffAt &&
    new Date(m.kickoffAt).getTime() > now.getTime() &&
    !!m.homeTeam &&
    !!m.awayTeam
  );
}
