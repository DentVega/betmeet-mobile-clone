/** Rankings tab — global leaderboard (US-L1). */
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, BootingScreen } from '../../ui/Screen';
import { Txt } from '../../ui/Text';
import { useSessionStore } from '../../session/sessionStore';
import { useGlobalRanking, type RankRow as Row } from '../data/useRankings';
import { RankRow } from '../components/RankRow';
import { t } from '../../i18n';

export function RankingsScreen() {
  const userId = useSessionStore((s) => s.userId);
  const { data, isLoading, refetch } = useGlobalRanking();
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const renderItem = useCallback(
    ({ item }: { item: Row }) => <RankRow row={item} isMe={item.user_id === userId} />,
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
      <FlashList data={data} renderItem={renderItem} keyExtractor={(i) => i.user_id} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
});
