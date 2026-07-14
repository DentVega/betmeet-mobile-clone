import {
  groupMatchesByDay,
  isPastDay,
  todayKey,
  canEdit,
  type FixtureMatch,
  type Day,
} from '../data/fixture';

const team = (id: string) => ({ id, name: id, fifaCode: id, flagPath: '', iso: id });

function m(over: Partial<FixtureMatch>): FixtureMatch {
  return {
    id: Math.random().toString(36).slice(2),
    kickoffAt: '2026-07-02T18:00:00Z',
    status: 'SCHEDULED',
    phaseType: 'GROUP',
    homeTeam: team('A'),
    awayTeam: team('B'),
    homePlaceholder: null,
    awayPlaceholder: null,
    homeScore: null,
    awayScore: null,
    winnerTeamId: null,
    prediction: null,
    score: null,
    ...over,
  };
}

const opts = { timeZone: 'UTC', locale: 'en-US', tbdLabel: 'TBD' };

describe('groupMatchesByDay', () => {
  it('buckets matches into days, sorted, kickoff-ordered within a day', () => {
    const days = groupMatchesByDay(
      [
        m({ kickoffAt: '2026-07-03T18:00:00Z' }),
        m({ kickoffAt: '2026-07-02T21:00:00Z' }),
        m({ kickoffAt: '2026-07-02T18:00:00Z' }),
      ],
      opts,
    );
    expect(days.map((d) => d.dateKey)).toEqual(['2026-07-02', '2026-07-03']);
    expect(days[0].matches.map((x) => x.kickoffAt)).toEqual([
      '2026-07-02T18:00:00Z',
      '2026-07-02T21:00:00Z',
    ]);
  });

  it('puts null-kickoff (TBD) matches last', () => {
    const days = groupMatchesByDay(
      [m({ kickoffAt: null }), m({ kickoffAt: '2026-07-02T18:00:00Z' })],
      opts,
    );
    expect(days[days.length - 1].dateKey).toBe('tbd');
    expect(days[days.length - 1].label).toBe('TBD');
  });
});

// Regression: "today's France vs Spain match doesn't show in the Matches section."
// The screen groups by day (groupMatchesByDay) and hides past days (isPastDay).
// A real-kickoff match happening today must land under today's header and must
// NOT be treated as past. (The original bug was missing seed data, but these lock
// the domain contract the screen depends on so the class of bug can't regress.)
describe('today match visibility (France vs Spain regression)', () => {
  it('groups a real-kickoff today match under today, not hidden as past', () => {
    const now = new Date('2026-07-14T09:00:00Z');
    const today = todayKey(now, opts.timeZone);

    const days = groupMatchesByDay(
      [
        m({ id: 'fra-esp', kickoffAt: '2026-07-14T15:00:00Z' }), // today
        m({ id: 'yesterday', kickoffAt: '2026-07-13T18:00:00Z' }),
      ],
      opts,
    );

    const todayGroup = days.find((d: Day) => d.dateKey === today);
    expect(todayGroup).toBeDefined();
    expect(todayGroup!.matches.map((x) => x.id)).toContain('fra-esp');
    expect(isPastDay(todayGroup!, today)).toBe(false); // visible with showPast=false
  });

  it('a null-kickoff (TBD) match is intentionally not placed under today', () => {
    const now = new Date('2026-07-14T09:00:00Z');
    const today = todayKey(now, opts.timeZone);

    const days = groupMatchesByDay([m({ id: 'tbd-match', kickoffAt: null })], opts);

    const todayGroup = days.find((d: Day) => d.dateKey === today);
    expect(todayGroup).toBeUndefined(); // no kickoff → cannot be "today"
    const tbd = days.find((d: Day) => d.dateKey === 'tbd');
    expect(tbd!.matches.map((x) => x.id)).toEqual(['tbd-match']);
    expect(isPastDay(tbd!, today)).toBe(false); // TBD group is never hidden as past
  });
});

// User-selectable timezone: the same kickoff ISO must bucket into the correct
// local calendar day and render the correct wall-clock hour under whichever zone
// the user picks in Settings (device tz is only the DEFAULT). This locks the
// contract the three reactive call sites (MatchCard/MatchesScreen/useFixture) rely on.
describe('timezone-aware grouping & formatting', () => {
  // 15:00Z on Jul 14: same instant, different zones.
  const kickoff = '2026-07-14T15:00:00Z';

  it('renders the local wall-clock hour per zone (11:00 La Paz vs 15:00 UTC vs 17:00 Madrid)', () => {
    const fmt = (tz: string) =>
      new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(
        new Date(kickoff),
      );
    expect(fmt('UTC')).toBe('15:00');
    expect(fmt('America/La_Paz')).toBe('11:00'); // UTC-4 (Bolivia)
    expect(fmt('Europe/Madrid')).toBe('17:00'); // UTC+2 (CEST)
  });

  it('buckets the same kickoff into the same calendar day for same-day zones', () => {
    const laPaz = groupMatchesByDay([m({ id: 'k', kickoffAt: kickoff })], {
      ...opts,
      timeZone: 'America/La_Paz',
    });
    const utc = groupMatchesByDay([m({ id: 'k', kickoffAt: kickoff })], { ...opts, timeZone: 'UTC' });
    expect(laPaz[0].dateKey).toBe('2026-07-14');
    expect(utc[0].dateKey).toBe('2026-07-14');
  });

  it('crosses the day boundary: an early-UTC kickoff falls on the previous day in a UTC-4 zone', () => {
    // 02:00Z Jul 14 → 22:00 Jul 13 in America/La_Paz.
    const early = '2026-07-14T02:00:00Z';
    const laPaz = groupMatchesByDay([m({ id: 'e', kickoffAt: early })], {
      ...opts,
      timeZone: 'America/La_Paz',
    });
    const utc = groupMatchesByDay([m({ id: 'e', kickoffAt: early })], { ...opts, timeZone: 'UTC' });
    expect(laPaz[0].dateKey).toBe('2026-07-13');
    expect(utc[0].dateKey).toBe('2026-07-14');
  });

  it('todayKey honours the selected zone across the midnight boundary', () => {
    // 01:00Z → still Jul 13 in La Paz (UTC-4), already Jul 14 in Madrid (UTC+2).
    const now = new Date('2026-07-14T01:00:00Z');
    expect(todayKey(now, 'America/La_Paz')).toBe('2026-07-13');
    expect(todayKey(now, 'Europe/Madrid')).toBe('2026-07-14');
  });
});

describe('isPastDay', () => {
  const today = '2026-07-05';
  it('flags earlier days, not today, not tbd', () => {
    expect(isPastDay({ dateKey: '2026-07-04', label: '', matches: [] }, today)).toBe(true);
    expect(isPastDay({ dateKey: '2026-07-05', label: '', matches: [] }, today)).toBe(false);
    expect(isPastDay({ dateKey: 'tbd', label: '', matches: [] }, today)).toBe(false);
  });
});

describe('canEdit', () => {
  const now = new Date('2026-07-01T00:00:00Z');
  it('editable: SCHEDULED, future kickoff, both teams', () => {
    expect(canEdit(m({}), now)).toBe(true);
  });
  it('not editable when finished', () => {
    expect(canEdit(m({ status: 'FINISHED' }), now)).toBe(false);
  });
  it('not editable when kickoff has passed', () => {
    expect(canEdit(m({ kickoffAt: '2026-06-01T00:00:00Z' }), now)).toBe(false);
  });
  it('not editable when a team is missing (knockout placeholder)', () => {
    expect(canEdit(m({ homeTeam: null, homePlaceholder: '1A' }), now)).toBe(false);
  });
});

describe('todayKey', () => {
  it('formats the local date key', () => {
    expect(todayKey(new Date('2026-07-05T10:00:00Z'), 'UTC')).toBe('2026-07-05');
  });
});
