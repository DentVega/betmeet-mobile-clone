/** Owner-only pool settings (US-PD3/PD4/PD2/PD5): rename, visibility, members-can-invite, archive. */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen, BootingScreen } from '../../ui/Screen';
import { Card } from '../../ui/Card';
import { Txt } from '../../ui/Text';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { useTheme } from '../../theme/useTheme';
import { usePoolDetail } from '../data/usePools';
import { renamePool, setVisibility, setMembersCanInvite, archivePool } from '../data/poolDepthApi';
import { t, tr } from '../../i18n';

type Nav = NativeStackNavigationProp<PoolsStackParamList, 'PoolSettings'>;
type Route = RouteProp<PoolsStackParamList, 'PoolSettings'>;

export function PoolSettingsScreen() {
  const nav = useNavigation<Nav>();
  const { poolId } = useRoute<Route>().params;
  const qc = useQueryClient();
  const dict = t().pools;
  const { colors } = useTheme();
  const { data: pool, isLoading } = usePoolDetail(poolId);
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (pool && name === '') setName(pool.name);
  }, [pool]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || !pool) return <BootingScreen />;
  const isPublic = pool.type === 'PUBLIC';
  const archived = !!pool.archived_at;

  const run = async (fn: () => Promise<{ ok: boolean; code?: string }>, back = false) => {
    setErr(null);
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.ok) {
      await qc.invalidateQueries({ queryKey: ['pool', poolId] });
      await qc.invalidateQueries({ queryKey: ['pools'] });
      if (back) nav.popToTop();
    } else {
      setErr(tr('pools.errors.' + (res.code ?? 'INTERNAL')));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <TextField label={dict.rename} value={name} onChangeText={setName} maxLength={60} />
          <Button title={dict.rename} onPress={() => run(() => renamePool(poolId, name.trim()))} loading={busy} disabled={name.trim().length < 3} />
        </Card>

        <Card>
          <View style={styles.row}>
            <Txt variant="body">{dict.visibility}: {isPublic ? dict.public : dict.private}</Txt>
            <Switch value={isPublic} onValueChange={(v) => run(() => setVisibility(poolId, v ? 'PUBLIC' : 'PRIVATE'))} />
          </View>
          <View style={styles.row}>
            <Txt variant="body">{dict.membersCanInvite}</Txt>
            <Switch value={!!pool.members_can_invite} onValueChange={(v) => run(() => setMembersCanInvite(poolId, v))} />
          </View>
        </Card>

        <Button
          title={archived ? dict.unarchive : dict.archive}
          variant={archived ? 'secondary' : 'destructive'}
          onPress={() => run(() => archivePool(poolId, !archived), !archived)}
          loading={busy}
        />
        {!!err && <Txt color={colors.destructive} style={styles.err}>{err}</Txt>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  err: { textAlign: 'center', marginTop: 8 },
});
