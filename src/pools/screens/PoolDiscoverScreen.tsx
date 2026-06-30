/** Discover + join public pools (US-P3), themed. */
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen } from '../../ui/Screen';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Txt } from '../../ui/Text';
import { useTheme } from '../../theme/useTheme';
import { useDiscover, type DiscoverPool } from '../data/usePools';
import { joinPoolById } from '../data/poolsApi';
import { t, tr } from '../../i18n';

type Nav = NativeStackNavigationProp<PoolsStackParamList, 'PoolDiscover'>;

export function PoolDiscoverScreen() {
  const nav = useNavigation<Nav>();
  const qc = useQueryClient();
  const dict = t().pools;
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { data } = useDiscover(query, onlyOpen);

  const onJoin = useCallback(
    async (pool: DiscoverPool) => {
      setErr(null);
      setBusy(pool.id);
      const res = await joinPoolById(pool.id);
      setBusy(null);
      if (res.ok) {
        await qc.invalidateQueries({ queryKey: ['pools'] });
        nav.navigate('PoolDetail', { poolId: pool.id });
      } else {
        setErr(tr('pools.errors.' + (res.code ?? 'INTERNAL')));
      }
    },
    [nav, qc],
  );

  const renderItem = useCallback(
    ({ item }: { item: DiscoverPool }) => (
      <View style={styles.cardWrap}>
        <Card style={styles.card}>
          <View style={styles.flex}>
            <Txt variant="title">{item.name}</Txt>
            <Txt variant="muted" style={styles.meta}>{item.member_count}/{item.capacity} {dict.members}</Txt>
          </View>
          {item.is_member ? (
            <Txt color={colors.success} style={styles.joined}>{dict.joined}</Txt>
          ) : (
            <Button title={dict.join} onPress={() => onJoin(item)} loading={busy === item.id} />
          )}
        </Card>
      </View>
    ),
    [dict, onJoin, busy, colors],
  );

  return (
    <Screen>
      <View style={styles.head}>
        <TextField label={dict.searchPlaceholder} value={query} onChangeText={setQuery} />
        <Pressable onPress={() => setOnlyOpen((v) => !v)} style={styles.toggle}>
          <Txt color={onlyOpen ? colors.primary : colors.mutedForeground} style={styles.toggleText}>
            {dict.onlyOpen} {onlyOpen ? '✓' : ''}
          </Txt>
        </Pressable>
        {!!err && <Txt color={colors.destructive}>{err}</Txt>}
      </View>
      <FlashList data={data ?? []} renderItem={renderItem} keyExtractor={(i) => i.id} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingTop: 12 },
  toggle: { paddingVertical: 6 },
  toggleText: { fontWeight: '600' },
  cardWrap: { marginHorizontal: 16, marginVertical: 6 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  meta: { marginTop: 2 },
  joined: { fontWeight: '600' },
});
