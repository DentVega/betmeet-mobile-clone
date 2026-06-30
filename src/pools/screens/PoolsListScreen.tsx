/** Pools tab home — my pools (US-P1). */
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen, BootingScreen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { useMyPools, type PoolSummary } from '../data/usePools';
import { t } from '../../i18n';

type Nav = NativeStackNavigationProp<PoolsStackParamList, 'PoolsList'>;

export function PoolsListScreen() {
  const nav = useNavigation<Nav>();
  const dict = t().pools;
  const { data, isLoading, refetch } = useMyPools();
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const renderItem = useCallback(
    ({ item }: { item: PoolSummary }) => (
      <Pressable style={styles.card} onPress={() => nav.navigate('PoolDetail', { poolId: item.id })}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.memberCount}/{item.capacity} {dict.members} · {item.type === 'PUBLIC' ? dict.public : dict.private}
        </Text>
      </Pressable>
    ),
    [nav, dict],
  );

  if (isLoading) return <BootingScreen />;

  return (
    <Screen>
      <View style={styles.actions}>
        <View style={styles.flex}><Button title={dict.create} onPress={() => nav.navigate('PoolNew')} /></View>
        <View style={styles.flex}><Button title={dict.discover} variant="secondary" onPress={() => nav.navigate('PoolDiscover')} /></View>
      </View>
      {(data ?? []).length === 0 ? (
        <Text style={styles.empty}>{dict.empty}</Text>
      ) : (
        <FlashList data={data} renderItem={renderItem} keyExtractor={(i) => i.id} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12 },
  flex: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginHorizontal: 16, marginVertical: 6, borderWidth: 1, borderColor: '#eee' },
  name: { fontSize: 16, fontWeight: '700', color: '#111' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40, paddingHorizontal: 24 },
});
