/** Profile writes for Settings. Nickname via the guarded fn; avatar/locale via RLS own-row. */
import { supabase } from '../../session/supabaseClient';

export interface NicknameResult {
  ok: boolean;
  nickname?: string;
  code?: string;
}

export async function changeNickname(base: string): Promise<NicknameResult> {
  const { data, error } = await supabase.functions.invoke('set-nickname', { body: { base } });
  if (error) return { ok: false, code: 'INTERNAL' };
  return data as NicknameResult;
}

export async function setAvatar(
  userId: string,
  avatarUrl: string,
  source: 'DEFAULT_SET' | 'GOOGLE_PHOTO',
): Promise<{ ok: boolean }> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, avatar_source: source })
    .eq('id', userId);
  return { ok: !error };
}

/** The Google account photo, if the user signed in with Google. */
export async function googleAvatarUrl(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = data.user?.user_metadata as any;
  const url = m?.avatar_url ?? m?.picture ?? null;
  return typeof url === 'string' ? url : null;
}
