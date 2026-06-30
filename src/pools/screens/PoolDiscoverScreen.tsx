/** Discover + join public pools (US-P3). */
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen } from '../../ui/Screen';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { useDiscover, type DiscoverPool } from '../data/usePools';
import { joinPoolById } from '../data/poolsApi';
import { t, tr } from '../../i18n';

type Nav = NativeStackNavigationProp<PoolsStackParamList, 'PoolDiscover'>;

export function PoolDiscoverScreen() {
  const nav = useNavigation<Nav>();
  const qc = useQueryClient();
  const dict = t().pools;
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
      <View style={styles.card}>
        <View style={styles.flex}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.member_count}/{item.capacity} {dict.members}</Text>
        </View>
        {item.is_member ? (
          <Text style={styles.joined}>{dict.joined}</Text>
        ) : (
          <Button title={dict.join} onPress={() => onJoin(item)} loading={busy === item.id} />
        )}
      </View>
    ),
    [dict, onJoin, busy],
  );

  return (
    <Screen>
      <View style={styles.head}>
        <TextField label={dict.searchPlaceholder} value={query} onChangeText={setQuery} />
        <Pressable onPress={() => setOnlyOpen((v) => !v)} style={styles.toggle}>
          <Text style={[styles.toggleText, onlyOpen && styles.toggleOn]}>{dict.onlyOpen} {onlyOpen ? '✓' : ''}</Text>
        </Pressable>
        {!!err && <Text style={styles.err}>{err}</Text>}
      </View>
      <FlashList data={data ?? []} renderItem={renderItem} keyExtractor={(i) => i.id} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingTop: 12 },
  toggle: { paddingVertical: 6 },
  toggleText: { color: '#6b7280', fontWeight: '600' },
  toggleOn: { color: '#2563eb' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 10, padding: 14, marginHorizontal: 16, marginVertical: 6, borderWidth: 1, borderColor: '#eee' },
  flex: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#111' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  joined: { color: '#15803d', fontWeight: '600' },
  err: { color: '#dc2626', fontSize: 14 },
});
