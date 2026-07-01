/** Pool-depth writes/reads via direct SECURITY DEFINER RPCs (V5, ADR-020/021). */
import { supabase } from '../../session/supabaseClient';

export interface RpcResult {
  ok: boolean;
  code?: string;
}

export interface NicknameHit {
  user_id: string;
  nickname: string;
  avatar_url: string;
}

async function rpc(fn: string, args: object): Promise<RpcResult> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) return { ok: false, code: mapError(error.message) };
  return (data as RpcResult) ?? { ok: true };
}

/** Postgres raises `exception 'CODE'` → supabase surfaces it in the message. */
function mapError(msg: string): string {
  const known = [
    'NOT_ALLOWED', 'NOT_OWNER', 'NOT_FOUND', 'FULL', 'ALREADY_MEMBER', 'ALREADY_INVITED',
    'NAME_TAKEN', 'INVALID', 'NOT_MEMBER', 'UNAUTHENTICATED',
  ];
  return known.find((c) => msg.includes(c)) ?? 'INTERNAL';
}

export async function searchNicknames(prefix: string): Promise<NicknameHit[]> {
  const { data, error } = await supabase.rpc('fn_search_nicknames', { p_prefix: prefix, p_limit: 10 });
  if (error) return [];
  return (data as NicknameHit[]) ?? [];
}

export const createInvite = (poolId: string, inviteeUserId: string) =>
  rpc('fn_create_directed_invite', { p_pool: poolId, p_invitee_user_id: inviteeUserId, p_invitee_email: null });
export const respondInvite = (inviteId: string, accept: boolean) =>
  rpc('fn_respond_invite', { p_invite: inviteId, p_accept: accept });
export const renamePool = (poolId: string, name: string) =>
  rpc('fn_rename_pool', { p_pool: poolId, p_name: name });
export const setVisibility = (poolId: string, type: 'PUBLIC' | 'PRIVATE') =>
  rpc('fn_set_pool_visibility', { p_pool: poolId, p_type: type });
export const setMembersCanInvite = (poolId: string, value: boolean) =>
  rpc('fn_set_members_can_invite', { p_pool: poolId, p_value: value });
export const archivePool = (poolId: string, archived: boolean) =>
  rpc('fn_archive_pool', { p_pool: poolId, p_archived: archived });
