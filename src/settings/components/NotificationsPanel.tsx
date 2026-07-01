/** Push enable + per-event preference toggles (FR-NT1/NT3, FR-PS6). Gated on native support. */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { Txt } from '../../ui/Text';
import { Button } from '../../ui/Button';
import { useTheme } from '../../theme/useTheme';
import { useSessionStore } from '../../session/sessionStore';
import { pushSupported, enablePush, getPrefs, updatePref, type NotifPrefs, type PrefKey } from '../data/pushApi';
import { t } from '../../i18n';

export function NotificationsPanel() {
  const dict = t().settings;
  const { colors } = useTheme();
  const userId = useSessionStore((s) => s.userId);
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userId) void getPrefs(userId).then(setPrefs);
  }, [userId]);

  if (!pushSupported()) return <Txt variant="muted">{dict.comingSoon}</Txt>;

  const events: [PrefKey, string][] = [
    ['match_start', dict.evMatchStart],
    ['match_end', dict.evMatchEnd],
    ['pool_invite', dict.evPoolInvite],
    ['rank_up', dict.evRankUp],
    ['goal', dict.evGoal],
  ];

  const toggle = async (k: PrefKey) => {
    if (!userId || !prefs) return;
    const v = !prefs[k];
    setPrefs({ ...prefs, [k]: v });
    await updatePref(userId, k, v);
  };

  const onEnable = async () => {
    if (!userId) return;
    const r = await enablePush(userId);
    setMsg(r.ok ? dict.pushEnabled : dict.pushDenied);
  };

  return (
    <View>
      <Button title={dict.pushEnable} variant="secondary" onPress={onEnable} />
      {!!msg && <Txt variant="small" style={styles.msg}>{msg}</Txt>}
      {prefs &&
        events.map(([k, label]) => (
          <View key={k} style={styles.row}>
            <Txt variant="body">{label}</Txt>
            <Switch value={prefs[k]} onValueChange={() => toggle(k)} />
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  msg: { marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
});
