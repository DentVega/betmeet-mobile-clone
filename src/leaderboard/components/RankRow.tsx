/** One leaderboard row (memoized, themed). Highlights the viewer. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { RankRow as Row } from '../data/useRankings';
import { useTheme } from '../../theme/useTheme';
import { Avatar } from '../../ui/Avatar';
import { t } from '../../i18n';

function RankRowBase({ row, isMe }: { row: Row; isMe: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }, isMe && { backgroundColor: colors.accent }]}>
      <Text style={[styles.rank, { color: colors.mutedForeground }]}>{row.rank}</Text>
      <Avatar url={row.avatar_url} size={32} />
      <Text style={[styles.nick, { color: isMe ? colors.primary : colors.foreground, fontWeight: isMe ? '700' : '400' }]} numberOfLines={1}>
        {row.nickname}
      </Text>
      <Text style={[styles.points, { color: colors.foreground }]}>{row.total_points} {t().matches.points}</Text>
    </View>
  );
}

export const RankRow = React.memo(RankRowBase);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1 },
  rank: { width: 28, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  nick: { flex: 1, fontSize: 15 },
  points: { fontSize: 15, fontWeight: '700' },
});
