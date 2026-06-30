/** Pool writes via Edge Functions (create/join/leave/kick/delete). */
import { supabase } from '../../session/supabaseClient';

export interface ApiResult {
  ok: boolean;
  code?: string;
  poolId?: string;
  alreadyMember?: boolean;
}

async function invoke(name: string, body: object): Promise<ApiResult> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) return { ok: false, code: 'INTERNAL' };
  return data as ApiResult;
}

export const createPool = (
  name: string,
  capacity: number,
  type: 'PUBLIC' | 'PRIVATE',
  membersCanInvite = true,
) => invoke('create-pool', { name, capacity, type, membersCanInvite });

export const joinPoolById = (poolId: string) => invoke('join-pool', { poolId });
export const joinPoolByToken = (token: string) => invoke('join-pool', { token });
export const leavePool = (poolId: string) => invoke('leave-pool', { poolId });
export const kickMember = (poolId: string, userId: string) =>
  invoke('kick-member', { poolId, userId });
export const deletePool = (poolId: string) => invoke('delete-pool', { poolId });
