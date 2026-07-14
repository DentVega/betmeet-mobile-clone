/** Active-competition fixture → Day[] (RLS reads; my global predictions + scores). */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../session/supabaseClient';
import { getLocale, tr } from '../../i18n';
import { groupMatchesByDay, type Day, type FixtureMatch } from './fixture';
import { useTimezone } from '../../settings/timezoneStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(row: any): FixtureMatch {
  const team = (t: any) =>
    t ? { id: t.id, name: t.name, fifaCode: t.fifa_code, flagPath: t.flag_path, iso: t.iso_alpha2 ?? null } : null;
  // RLS returns only my predictions; pick the global-scope one (pool_id null).
  const preds: any[] = row.predictions ?? [];
  const global = preds.find((p) => p.pool_id === null) ?? null;
  const scores: any[] = row.prediction_scores ?? [];
  const score = global ? scores.find((s) => s.prediction_id === global.id) ?? null : null;
  return {
    id: row.id,
    kickoffAt: row.kickoff_at,
    status: row.status,
    phaseType: row.phase?.type ?? 'GROUP',
    homeTeam: team(row.home_team),
    awayTeam: team(row.away_team),
    homePlaceholder: row.home_placeholder,
    awayPlaceholder: row.away_placeholder,
    homeScore: row.home_score,
    awayScore: row.away_score,
    winnerTeamId: row.winner_team_id,
    prediction: global
      ? {
          id: global.id,
          homeScore: global.home_score,
          awayScore: global.away_score,
          penaltyWinnerTeamId: global.penalty_winner_team_id,
          lockedAt: global.locked_at,
        }
      : null,
    score: score ? { totalPoints: score.total_points, matchedCase: score.matched_case } : null,
  };
}

export function useFixture() {
  const tz = useTimezone();
  const query = useQuery({
    queryKey: ['fixture'],
    queryFn: async (): Promise<FixtureMatch[]> => {
      const { data: comp } = await supabase
        .from('competitions').select('id').eq('is_active', true).limit(1).maybeSingle();
      if (!comp) return [];
      const { data, error } = await supabase
        .from('matches')
        .select(
          `id,kickoff_at,status,home_score,away_score,winner_team_id,home_placeholder,away_placeholder,
           home_team:teams!matches_home_team_id_fkey(id,name,fifa_code,flag_path,iso_alpha2),
           away_team:teams!matches_away_team_id_fkey(id,name,fifa_code,flag_path,iso_alpha2),
           phase:competition_phases(type),
           predictions(id,home_score,away_score,penalty_winner_team_id,locked_at,pool_id),
           prediction_scores(prediction_id,total_points,matched_case)`,
        )
        .eq('competition_id', comp.id);
      if (error) throw error;
      return (data ?? []).map(shape);
    },
  });

  // Group client-side so a timezone change re-buckets days without a network refetch.
  const days = useMemo<Day[] | undefined>(
    () =>
      query.data
        ? groupMatchesByDay(query.data, { timeZone: tz, locale: getLocale(), tbdLabel: tr('matches.tbd') })
        : undefined,
    [query.data, tz],
  );

  return { ...query, data: days };
}
