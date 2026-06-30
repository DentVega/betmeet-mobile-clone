/** Pools tab home — my pools (US-P1), themed. */
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen, BootingScreen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Txt } from '../../ui/Text';
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
      <Pressable style={styles.cardWrap} onPress={() => nav.navigate('PoolDetail', { poolId: item.id })}>
        <Card>
          <Txt variant="title">{item.name}</Txt>
          <Txt variant="muted" style={styles.meta}>
            {item.memberCount}/{item.capacity} {dict.members} · {item.type === 'PUBLIC' ? dict.public : dict.private}
          </Txt>
        </Card>
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
        <Txt variant="muted" style={styles.empty}>{dict.empty}</Txt>
      ) : (
        <FlashList data={data} renderItem={renderItem} keyExtractor={(i) => i.id} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12 },
  flex: { flex: 1 },
  cardWrap: { marginHorizontal: 16, marginVertical: 6 },
  meta: { marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
});
