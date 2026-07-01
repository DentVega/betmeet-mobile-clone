/** Pool detail + membership management (US-P5, US-P6), themed. */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen, BootingScreen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Txt } from '../../ui/Text';
import { useTheme } from '../../theme/useTheme';
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
  const { colors } = useTheme();
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
        <Txt variant="display" style={styles.name}>{pool.name}</Txt>
        <Txt variant="muted" style={styles.meta}>{dict.owner}: {nick(pool.owner)} · {members.length}/{pool.capacity} {dict.members}</Txt>

        <Txt style={styles.label}>{dict.inviteToken}</Txt>
        <Txt selectable color={colors.primary} style={styles.token}>{pool.invite_token}</Txt>
        <Txt variant="small">{dict.copyHint}</Txt>

        <Txt style={styles.label}>{dict.members}</Txt>
        {members.map((m) => (
          <View key={m.user_id} style={[styles.memberRow, { borderBottomColor: colors.border }]}>
            <Txt>{nick(m.user)}</Txt>
            {isOwner && m.user_id !== userId && (
              <Txt color={colors.destructive} style={styles.kick} onPress={() => run(() => kickMember(poolId, m.user_id), 'refetch')}>
                {dict.kick}
              </Txt>
            )}
          </View>
        ))}

        <Button title={dict.predictions} variant="secondary" onPress={() => nav.navigate('PoolPredictions', { poolId })} />
        <Button title={dict.leaderboard} variant="secondary" onPress={() => nav.navigate('PoolLeaderboard', { poolId })} />
        {(isOwner || pool.members_can_invite) && (
          <Button title={dict.invite} variant="secondary" onPress={() => nav.navigate('PoolInvite', { poolId })} />
        )}
        {isOwner && (
          <Button title={dict.settings} variant="secondary" onPress={() => nav.navigate('PoolSettings', { poolId })} />
        )}
        {!!err && <Txt color={colors.destructive} style={styles.err}>{err}</Txt>}
        {isOwner ? (
          <Button title={dict.delete} variant="destructive" onPress={() => run(() => deletePool(poolId), 'back')} loading={busy} />
        ) : (
          <Button title={dict.leave} variant="secondary" onPress={() => run(() => leavePool(poolId), 'back')} loading={busy} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  name: { fontSize: 26 },
  meta: { marginTop: 4, marginBottom: 16 },
  label: { fontWeight: '700', marginTop: 16, marginBottom: 6 },
  token: { fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  kick: { fontWeight: '600' },
  err: { marginTop: 12, textAlign: 'center' },
});
