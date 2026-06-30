import {
  groupMatchesByDay,
  isPastDay,
  canEdit,
  todayKey,
  type FixtureMatch,
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
