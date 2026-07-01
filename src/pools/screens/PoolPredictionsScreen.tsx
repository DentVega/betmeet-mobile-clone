/** Masked pool predictions grid (US-PD6) + own-pick override entry (FR-PP1). */
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen, BootingScreen } from '../../ui/Screen';
import { Card } from '../../ui/Card';
import { Txt } from '../../ui/Text';
import { Avatar } from '../../ui/Avatar';
import { useTheme } from '../../theme/useTheme';
import { useSessionStore } from '../../session/sessionStore';
import { usePoolPredictions, type GridCell } from '../data/usePoolDepth';
import { useFixture } from '../../matches/data/useFixture';
import type { FixtureMatch } from '../../matches/data/fixture';
import { PredictionForm } from '../../matches/components/PredictionForm';
import { t, getLocale } from '../../i18n';

type Route = RouteProp<PoolsStackParamList, 'PoolPredictions'>;
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const time = (iso: string) =>
  new Intl.DateTimeFormat(getLocale(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date(iso));

export function PoolPredictionsScreen() {
  const { poolId } = useRoute<Route>().params;
  const dict = t().pools;
  const mdict = t().matches;
  const { colors } = useTheme();
  const userId = useSessionStore((s) => s.userId);
  const { data: cells, isLoading } = usePoolPredictions(poolId);
  const { data: days } = useFixture();
  const [editing, setEditing] = useState<FixtureMatch | null>(null);

  const fixtureById = useMemo(() => {
    const map = new Map<string, FixtureMatch>();
    for (const d of days ?? []) for (const m of d.matches) map.set(m.id, m);
    return map;
  }, [days]);

  const groups = useMemo(() => {
    const by = new Map<string, { kickoffAt: string; status: string; rows: GridCell[] }>();
    for (const c of cells ?? []) {
      if (!by.has(c.matchId)) by.set(c.matchId, { kickoffAt: c.kickoffAt, status: c.status, rows: [] });
      by.get(c.matchId)!.rows.push(c);
    }
    return [...by.entries()]
      .map(([matchId, g]) => ({ matchId, ...g }))
      .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt));
  }, [cells]);

  if (isLoading) return <BootingScreen />;

  const label = (m?: FixtureMatch) =>
    m ? `${m.homeTeam?.fifaCode ?? '—'} ${mdict.vs} ${m.awayTeam?.fifaCode ?? '—'}` : '';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {groups.map((g) => {
          const fm = fixtureById.get(g.matchId);
          return (
            <Card key={g.matchId}>
              <Txt variant="title">{label(fm)}</Txt>
              <Txt variant="small" style={styles.sub}>{time(g.kickoffAt)}</Txt>
              {g.rows.map((c) => {
                const mine = c.memberId === userId;
                const editable = mine && c.status === 'SCHEDULED' && !!fm;
                const value = c.preJoin
                  ? dict.notInPool
                  : !c.revealed
                    ? dict.masked
                    : c.homeScore !== null
                      ? `${c.homeScore}–${c.awayScore}${c.totalPoints !== null ? `  +${c.totalPoints}` : ''}`
                      : '—';
                return (
                  <Pressable
                    key={c.memberId}
                    disabled={!editable}
                    onPress={() => fm && setEditing(fm)}
                    style={[styles.row, { borderBottomColor: colors.border }]}>
                    <Avatar url={c.avatarUrl} size={28} />
                    <Txt variant="body" color={mine ? colors.primary : colors.foreground} style={styles.nick}>{c.nickname}</Txt>
                    <Txt variant="body" color={editable ? colors.primary : colors.mutedForeground}>
                      {value}{editable ? '  ✎' : ''}
                    </Txt>
                  </Pressable>
                );
              })}
            </Card>
          );
        })}
      </ScrollView>
      {editing && <PredictionForm match={editing} poolId={poolId} onClose={() => setEditing(null)} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 12 },
  sub: { marginTop: 2, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1 },
  nick: { flex: 1 },
});
