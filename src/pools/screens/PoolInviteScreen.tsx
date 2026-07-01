/** Directed-invite screen (US-PD1): nickname typeahead → send. */
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen } from '../../ui/Screen';
import { Txt } from '../../ui/Text';
import { TextField } from '../../ui/TextField';
import { Avatar } from '../../ui/Avatar';
import { useTheme } from '../../theme/useTheme';
import { searchNicknames, createInvite, type NicknameHit } from '../data/poolDepthApi';
import { t, tr } from '../../i18n';

type Route = RouteProp<PoolsStackParamList, 'PoolInvite'>;

export function PoolInviteScreen() {
  const { poolId } = useRoute<Route>().params;
  const dict = t().pools;
  const { colors } = useTheme();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<NicknameHit[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    let active = true;
    const id = setTimeout(async () => {
      const r = await searchNicknames(q.trim());
      if (active) setHits(r);
    }, 250);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [q]);

  const send = async (hit: NicknameHit) => {
    setMsg(null);
    const res = await createInvite(poolId, hit.user_id);
    setMsg(res.ok ? { text: dict.invited, ok: true } : { text: tr('pools.errors.' + (res.code ?? 'INTERNAL')), ok: false });
    if (res.ok) setHits((prev) => prev.filter((h) => h.user_id !== hit.user_id));
  };

  return (
    <Screen>
      <View style={styles.content}>
        <TextField label={dict.invite} placeholder={dict.search} value={q} onChangeText={setQ} autoCapitalize="none" />
        {!!msg && <Txt color={msg.ok ? colors.success : colors.destructive} style={styles.msg}>{msg.text}</Txt>}
        {hits.map((h) => (
          <Pressable key={h.user_id} onPress={() => send(h)} style={[styles.hit, { borderBottomColor: colors.border }]}>
            <Avatar url={h.avatar_url} size={36} />
            <Txt variant="body" style={styles.nick}>{h.nickname}</Txt>
            <Txt color={colors.primary} style={styles.send}>{dict.sendInvite}</Txt>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  msg: { marginVertical: 8, textAlign: 'center' },
  hit: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  nick: { flex: 1 },
  send: { fontWeight: '600' },
});
