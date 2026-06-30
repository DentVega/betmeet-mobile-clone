/** Per-pool leaderboard (US-L2), reached from PoolDetail. */
import React, { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen, BootingScreen } from '../../ui/Screen';
import { useSessionStore } from '../../session/sessionStore';
import { usePoolLeaderboard, type RankRow as Row } from '../data/useRankings';
import { RankRow } from '../components/RankRow';
import { t } from '../../i18n';

type Route = RouteProp<PoolsStackParamList, 'PoolLeaderboard'>;

export function PoolLeaderboardScreen() {
  const { poolId } = useRoute<Route>().params;
  const userId = useSessionStore((s) => s.userId);
  const { data, isLoading } = usePoolLeaderboard(poolId);

  const renderItem = useCallback(
    ({ item }: { item: Row }) => <RankRow row={item} isMe={item.user_id === userId} />,
    [userId],
  );

  if (isLoading) return <BootingScreen />;
  if ((data ?? []).length === 0) {
    return (
      <Screen>
        <Text style={styles.empty}>{t().leaderboard.empty}</Text>
      </Screen>
    );
  }
  return (
    <Screen>
      <FlashList data={data} renderItem={renderItem} keyExtractor={(i) => i.user_id} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40, paddingHorizontal: 24 },
});
