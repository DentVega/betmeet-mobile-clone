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

export interface LiveRankRow {
  user_id: string;
  nickname: string;
  avatar_url: string;
  confirmed_points: number;
  projected_points: number;
  confirmed_rank: number;
  projected_rank: number;
}

/** Global ranking with live projection (V4). confirmed==projected when no match is LIVE. */
export function useGlobalRankingLive() {
  return useQuery({
    queryKey: ['ranking', 'global'],
    queryFn: async (): Promise<LiveRankRow[]> => {
      const { data, error } = await supabase.rpc('fn_global_ranking_live', { p_limit: 100 });
      if (error) throw error;
      return (data as LiveRankRow[]) ?? [];
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
