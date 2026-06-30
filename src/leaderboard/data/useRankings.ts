/** Ranking reads via SECURITY DEFINER RPCs (RLS-safe cross-user aggregation). */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../session/supabaseClient';

export interface RankRow {
  user_id: string;
  nickname: string;
  avatar_url: string;
  total_points: number;
  rank: number;
}

export function useGlobalRanking() {
  return useQuery({
    queryKey: ['ranking', 'global'],
    queryFn: async (): Promise<RankRow[]> => {
      const { data, error } = await supabase.rpc('fn_global_ranking', { p_limit: 100 });
      if (error) throw error;
      return (data as RankRow[]) ?? [];
    },
  });
}

export function usePoolLeaderboard(poolId: string) {
  return useQuery({
    queryKey: ['ranking', 'pool', poolId],
    queryFn: async (): Promise<RankRow[]> => {
      const { data, error } = await supabase.rpc('fn_pool_leaderboard', { p_pool: poolId });
      if (error) throw error;
      return (data as RankRow[]) ?? [];
    },
  });
}
