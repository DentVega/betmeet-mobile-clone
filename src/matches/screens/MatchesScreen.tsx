/** Matches tab — fixture grouped by day (FlashList), predict before kickoff. US-M1…M5. */
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, BootingScreen } from '../../ui/Screen';
import { useFixture } from '../data/useFixture';
import { todayKey, isPastDay, type FixtureMatch } from '../data/fixture';
import { MatchCard } from '../components/MatchCard';
import { PredictionForm } from '../components/PredictionForm';
import { t } from '../../i18n';
import { useTheme } from '../../theme/useTheme';

type Row =
  | { type: 'header'; key: string; label: string }
  | { type: 'match'; key: string; match: FixtureMatch };

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function MatchesScreen() {
  const dict = t().matches;
  const { colors } = useTheme();
  const { data: days, isLoading, refetch } = useFixture();
  const [showPast, setShowPast] = useState(false);
  const [selected, setSelected] = useState<FixtureMatch | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const today = todayKey(new Date(), TZ);
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const d of days ?? []) {
      if (!showPast && isPastDay(d, today)) continue;
      out.push({ type: 'header', key: 'h:' + d.dateKey, label: d.label });
      for (const m of d.matches) out.push({ type: 'match', key: m.id, match: m });
    }
    return out;
  }, [days, showPast, today]);

  const hasPast = (days ?? []).some((d) => isPastDay(d, today));

  const renderItem = useCallback(
    ({ item }: { item: Row }) =>
      item.type === 'header' ? (
        <Text style={[styles.header, { color: colors.mutedForeground }]}>{item.label}</Text>
      ) : (
        <MatchCard match={item.match} onPredict={setSelected} />
      ),
    [colors],
  );

  if (isLoading) return <BootingScreen />;

  return (
    <Screen>
      {hasPast && (
        <Pressable onPress={() => setShowPast((v) => !v)} style={styles.toggle}>
          <Text style={[styles.toggleText, { color: colors.primary }]}>{showPast ? dict.hidePast : dict.showPast}</Text>
        </Pressable>
      )}
      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        getItemType={(item) => item.type}
      />
      {selected && <PredictionForm match={selected} onClose={() => setSelected(null)} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 14, fontWeight: '700', color: '#6b7280',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, textTransform: 'capitalize',
  },
  toggle: { paddingHorizontal: 16, paddingVertical: 10 },
  toggleText: { color: '#2563eb', fontWeight: '600' },
});
