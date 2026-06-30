/**
 * Onboarding writes (ADR-012): nickname via the set-nickname Edge Function
 * (atomic discriminator); avatar + completion via direct RLS own-row updates.
 */
import { supabase } from '../../session/supabaseClient';

export type AvatarSource = 'DEFAULT_SET' | 'GOOGLE_PHOTO';

export interface SetNicknameResult {
  ok: boolean;
  nickname?: string;
  code?: string;
}

export async function setNickname(base: string): Promise<SetNicknameResult> {
  const { data, error } = await supabase.functions.invoke('set-nickname', {
    body: { base },
  });
  if (error) {
    return { ok: false, code: 'INTERNAL' };
  }
  return data as SetNicknameResult;
}

export async function setAvatar(
  userId: string,
  url: string,
  source: AvatarSource,
): Promise<{ ok: boolean }> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: url, avatar_source: source })
    .eq('id', userId);
  return { ok: !error };
}

export async function completeOnboarding(userId: string): Promise<{ ok: boolean }> {
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', userId);
  return { ok: !error };
}
