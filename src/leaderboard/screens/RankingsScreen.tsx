/** Rankings tab — global leaderboard with live projection (US-L1 / FR-RT4). */
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, BootingScreen } from '../../ui/Screen';
import { useRefreshControl } from '../../ui/RefreshControl';
import { Txt } from '../../ui/Text';
import { useSessionStore } from '../../session/sessionStore';
import { useGlobalRankingLive, type LiveRankRow as Row } from '../data/useRankings';
import { LiveRankRow } from '../components/LiveRankRow';
import { LiveBanner } from '../../matches/components/LiveBanner';
import { t } from '../../i18n';

export function RankingsScreen() {
  const userId = useSessionStore((s) => s.userId);
  const { data, isLoading, isRefetching, refetch } = useGlobalRankingLive();
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));
  const refreshControl = useRefreshControl({ refetch, refreshing: isRefetching });

  const renderItem = useCallback(
    ({ item }: { item: Row }) => <LiveRankRow row={item} isMe={item.user_id === userId} />,
    [userId],
  );

  if (isLoading) return <BootingScreen />;
  if ((data ?? []).length === 0) {
    return (
      <Screen>
        <Txt variant="muted" style={styles.empty}>{t().leaderboard.empty}</Txt>
      </Screen>
    );
  }
  return (
    <Screen>
      <LiveBanner />
      <FlashList data={data} renderItem={renderItem} keyExtractor={(i) => i.user_id} refreshControl={refreshControl} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
});
