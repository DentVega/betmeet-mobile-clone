/**
 * Push notifications (FR-NT1..NT3) via @react-native-firebase/messaging.
 * Gated/try-catch so a missing real Firebase config degrades gracefully.
 * ⚠️ E2E needs a real google-services.json + FCM creds (activation-pending).
 */
import messaging from '@react-native-firebase/messaging';
import { supabase } from '../../session/supabaseClient';

export type PrefKey = 'match_start' | 'match_end' | 'pool_invite' | 'rank_up' | 'goal';

export interface NotifPrefs {
  match_start: boolean;
  match_end: boolean;
  pool_invite: boolean;
  rank_up: boolean;
  goal: boolean;
}

export function pushSupported(): boolean {
  try {
    return typeof messaging === 'function';
  } catch {
    return false;
  }
}

/** Request OS permission, get the FCM token, and register the device. */
export async function enablePush(userId: string): Promise<{ ok: boolean; code?: string }> {
  try {
    const status = await messaging().requestPermission();
    const ok =
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL;
    if (!ok) return { ok: false, code: 'DENIED' };
    const token = await messaging().getToken();
    const { error } = await supabase.from('push_subscriptions').upsert(
      { user_id: userId, token, platform: 'android', active: true, last_seen_at: new Date().toISOString() },
      { onConflict: 'token' },
    );
    return { ok: !error, code: error ? 'INTERNAL' : undefined };
  } catch {
    return { ok: false, code: 'UNAVAILABLE' };
  }
}

/** Deactivate this device's token (sign-out / opt-out). */
export async function disablePush(): Promise<void> {
  try {
    const token = await messaging().getToken();
    await supabase.from('push_subscriptions').update({ active: false }).eq('token', token);
  } catch {
    /* no-op when unavailable */
  }
}

export async function getPrefs(userId: string): Promise<NotifPrefs | null> {
  const { data } = await supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle();
  return (data as NotifPrefs) ?? null;
}

export async function updatePref(userId: string, key: PrefKey, value: boolean): Promise<{ ok: boolean }> {
  const { error } = await supabase.from('notification_preferences').update({ [key]: value }).eq('user_id', userId);
  return { ok: !error };
}
