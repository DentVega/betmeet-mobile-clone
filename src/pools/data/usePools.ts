/** Pools data hooks: my pools (RLS), discover (RPC), detail (RLS). */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../session/supabaseClient';
import { useSessionStore } from '../../session/sessionStore';

export interface PoolSummary {
  id: string;
  name: string;
  type: 'PUBLIC' | 'PRIVATE';
  capacity: number;
  ownerId: string;
  inviteToken: string;
  memberCount: number;
}

export function useMyPools() {
  const userId = useSessionStore((s) => s.userId);
  return useQuery({
    queryKey: ['pools', userId],
    enabled: !!userId,
    queryFn: async (): Promise<PoolSummary[]> => {
      const { data, error } = await supabase
        .from('pool_memberships')
        .select(
          'pool:pools(id,name,type,capacity,owner_id,invite_token,members:pool_memberships(count))',
        )
        .eq('user_id', userId!)
        .is('archived_at', null);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((r: any) => ({
        id: r.pool.id,
        name: r.pool.name,
        type: r.pool.type,
        capacity: r.pool.capacity,
        ownerId: r.pool.owner_id,
        inviteToken: r.pool.invite_token,
        memberCount: r.pool.members?.[0]?.count ?? 0,
      }));
    },
  });
}

export interface DiscoverPool {
  id: string;
  name: string;
  capacity: number;
  member_count: number;
  is_member: boolean;
}

export function useDiscover(query: string, onlyOpen: boolean) {
  return useQuery({
    queryKey: ['discover', query, onlyOpen],
    queryFn: async (): Promise<DiscoverPool[]> => {
      const { data, error } = await supabase.rpc('fn_discover_pools', {
        p_query: query,
        p_only_open: onlyOpen,
        p_limit: 30,
        p_offset: 0,
      });
      if (error) throw error;
      return (data as DiscoverPool[]) ?? [];
    },
  });
}

export function usePoolDetail(poolId: string) {
  return useQuery({
    queryKey: ['pool', poolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pools')
        .select(
          `id,name,type,capacity,owner_id,invite_token,members_can_invite,archived_at,
           owner:profiles!pools_owner_id_fkey(nickname_base,nickname_discriminator,avatar_url),
           members:pool_memberships(user_id,joined_at,user:profiles(nickname_base,nickname_discriminator,avatar_url))`,
        )
        .eq('id', poolId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
