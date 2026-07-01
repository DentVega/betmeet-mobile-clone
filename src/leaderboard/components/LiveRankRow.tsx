/** Global leaderboard row with live projection + rank delta (FR-RT4). */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LiveRankRow as Row } from '../data/useRankings';
import { useTheme } from '../../theme/useTheme';
import { Avatar } from '../../ui/Avatar';
import { t } from '../../i18n';

function LiveRankRowBase({ row, isMe }: { row: Row; isMe: boolean }) {
  const { colors } = useTheme();
  const dict = t();
  const isLive = row.projected_points !== row.confirmed_points;
  const delta = row.confirmed_rank - row.projected_rank; // + = moved up
  const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '';
  const arrowColor = delta > 0 ? colors.success : delta < 0 ? colors.live : colors.mutedForeground;

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }, isMe && { backgroundColor: colors.accent }]}>
      <Text style={[styles.rank, { color: colors.mutedForeground }]}>{row.projected_rank}</Text>
      {!!arrow && <Text style={[styles.arrow, { color: arrowColor }]}>{arrow}</Text>}
      <Avatar url={row.avatar_url} size={32} />
      <Text
        style={[styles.nick, { color: isMe ? colors.primary : colors.foreground, fontWeight: isMe ? '700' : '400' }]}
        numberOfLines={1}>
        {row.nickname}
      </Text>
      {isLive ? (
        <View style={styles.ptsCol}>
          <Text style={[styles.points, { color: colors.live }]}>
            {row.confirmed_points} → {row.projected_points}
          </Text>
          <Text style={[styles.proj, { color: colors.mutedForeground }]}>{dict.leaderboard.proj}</Text>
        </View>
      ) : (
        <Text style={[styles.points, { color: colors.foreground }]}>
          {row.confirmed_points} {dict.matches.points}
        </Text>
      )}
    </View>
  );
}

export const LiveRankRow = React.memo(LiveRankRowBase);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1 },
  rank: { width: 24, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  arrow: { width: 14, fontSize: 12, textAlign: 'center' },
  nick: { flex: 1, fontSize: 15 },
  ptsCol: { alignItems: 'flex-end' },
  points: { fontSize: 15, fontWeight: '700' },
  proj: { fontSize: 11 },
});
