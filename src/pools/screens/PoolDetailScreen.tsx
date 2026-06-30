/** Pool detail + membership management (US-P5, US-P6). */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen, BootingScreen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { useSessionStore } from '../../session/sessionStore';
import { usePoolDetail } from '../data/usePools';
import { leavePool, deletePool, kickMember } from '../data/poolsApi';
import { t, tr } from '../../i18n';

type Nav = NativeStackNavigationProp<PoolsStackParamList, 'PoolDetail'>;
type Route = RouteProp<PoolsStackParamList, 'PoolDetail'>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nick = (u: any) => (u ? `${u.nickname_base ?? '—'}#${u.nickname_discriminator ?? ''}` : '—');

export function PoolDetailScreen() {
  const nav = useNavigation<Nav>();
  const { poolId } = useRoute<Route>().params;
  const qc = useQueryClient();
  const dict = t().pools;
  const userId = useSessionStore((s) => s.userId);
  const { data: pool, isLoading, refetch } = usePoolDetail(poolId);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isLoading || !pool) return <BootingScreen />;
  const isOwner = pool.owner_id === userId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const members: any[] = pool.members ?? [];

  const run = async (fn: () => Promise<{ ok: boolean; code?: string }>, after: 'back' | 'refetch') => {
    setErr(null);
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.ok) {
      await qc.invalidateQueries({ queryKey: ['pools'] });
      if (after === 'back') nav.popToTop();
      else { await qc.invalidateQueries({ queryKey: ['pool', poolId] }); refetch(); }
    } else {
      setErr(tr('pools.errors.' + (res.code ?? 'INTERNAL')));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{pool.name}</Text>
        <Text style={styles.meta}>{dict.owner}: {nick(pool.owner)} · {members.length}/{pool.capacity} {dict.members}</Text>

        <Text style={styles.label}>{dict.inviteToken}</Text>
        <Text selectable style={styles.token}>{pool.invite_token}</Text>
        <Text style={styles.hint}>{dict.copyHint}</Text>

        <Text style={styles.label}>{dict.members}</Text>
        {members.map((m) => (
          <View key={m.user_id} style={styles.memberRow}>
            <Text style={styles.member}>{nick(m.user)}</Text>
            {isOwner && m.user_id !== userId && (
              <Text style={styles.kick} onPress={() => run(() => kickMember(poolId, m.user_id), 'refetch')}>
                {dict.kick}
              </Text>
            )}
          </View>
        ))}

        <Button
          title={dict.leaderboard}
          variant="secondary"
          onPress={() => nav.navigate('PoolLeaderboard', { poolId })}
        />

        {!!err && <Text style={styles.err}>{err}</Text>}

        {isOwner ? (
          <Button title={dict.delete} onPress={() => run(() => deletePool(poolId), 'back')} loading={busy} />
        ) : (
          <Button title={dict.leave} variant="secondary" onPress={() => run(() => leavePool(poolId), 'back')} loading={busy} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  name: { fontSize: 24, fontWeight: '700', color: '#111' },
  meta: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 6 },
  token: { fontSize: 20, fontWeight: '700', color: '#2563eb', letterSpacing: 2 },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  member: { fontSize: 15, color: '#111' },
  kick: { color: '#dc2626', fontWeight: '600' },
  err: { color: '#dc2626', fontSize: 14, marginTop: 12, textAlign: 'center' },
});
