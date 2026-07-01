/** Pool-depth reads: my pending invites + the masked pool predictions grid (V6). */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../session/supabaseClient';
import { useSessionStore } from '../../session/sessionStore';

export interface PendingInvite {
  id: string;
  poolId: string;
  poolName: string;
  inviter: string;
}

export function useMyInvites() {
  const userId = useSessionStore((s) => s.userId);
  return useQuery({
    queryKey: ['invites', userId],
    enabled: !!userId,
    queryFn: async (): Promise<PendingInvite[]> => {
      const { data, error } = await supabase
        .from('pool_directed_invites')
        .select(
          `id,
           pool:pools(id,name),
           inviter:profiles!pool_directed_invites_inviter_id_fkey(nickname_base,nickname_discriminator)`,
        )
        .eq('invitee_user_id', userId!)
        .eq('status', 'PENDING');
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((r: any) => ({
        id: r.id,
        poolId: r.pool?.id,
        poolName: r.pool?.name ?? '—',
        inviter: r.inviter ? `${r.inviter.nickname_base}#${r.inviter.nickname_discriminator}` : '—',
      }));
    },
  });
}

export interface GridCell {
  matchId: string;
  kickoffAt: string;
  status: string;
  memberId: string;
  nickname: string;
  avatarUrl: string;
  homeScore: number | null;
  awayScore: number | null;
  totalPoints: number | null;
  revealed: boolean;
  preJoin: boolean;
}

export function usePoolPredictions(poolId: string) {
  return useQuery({
    queryKey: ['poolPredictions', poolId],
    queryFn: async (): Promise<GridCell[]> => {
      const { data, error } = await supabase.rpc('fn_pool_predictions', { p_pool: poolId });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((r: any) => ({
        matchId: r.match_id,
        kickoffAt: r.kickoff_at,
        status: r.status,
        memberId: r.member_id,
        nickname: r.nickname,
        avatarUrl: r.avatar_url,
        homeScore: r.home_score,
        awayScore: r.away_score,
        totalPoints: r.total_points,
        revealed: r.revealed,
        preJoin: r.pre_join,
      }));
    },
  });
}
