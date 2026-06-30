/** One leaderboard row (memoized). Highlights the viewer. */
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { RankRow as Row } from '../data/useRankings';
import { t } from '../../i18n';

function RankRowBase({ row, isMe }: { row: Row; isMe: boolean }) {
  return (
    <View style={[styles.row, isMe && styles.me]}>
      <Text style={styles.rank}>{row.rank}</Text>
      {row.avatar_url ? <Image source={{ uri: row.avatar_url }} style={styles.avatar} /> : <View style={styles.avatar} />}
      <Text style={[styles.nick, isMe && styles.meText]} numberOfLines={1}>{row.nickname}</Text>
      <Text style={styles.points}>{row.total_points} {t().matches.points}</Text>
    </View>
  );
}

export const RankRow = React.memo(RankRowBase);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  me: { backgroundColor: '#eff6ff' },
  rank: { width: 28, fontSize: 15, fontWeight: '700', color: '#6b7280', textAlign: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb' },
  nick: { flex: 1, fontSize: 15, color: '#111' },
  meText: { fontWeight: '700', color: '#2563eb' },
  points: { fontSize: 15, fontWeight: '700', color: '#111' },
});
