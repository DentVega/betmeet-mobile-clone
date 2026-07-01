/** "Live now" banner (FR-RT3): self-contained; counts LIVE matches from the cached fixture. */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useFixture } from '../data/useFixture';
import { useTheme } from '../../theme/useTheme';
import { Txt } from '../../ui/Text';
import { t } from '../../i18n';

export function LiveBanner() {
  const { colors, radius } = useTheme();
  const { data: days } = useFixture();
  const count = (days ?? []).reduce(
    (n, d) => n + d.matches.filter((m) => m.status === 'LIVE').length,
    0,
  );
  if (count === 0) return null;
  return (
    <View style={[styles.wrap, { backgroundColor: colors.live, borderRadius: radius.md }]}>
      <View style={[styles.dot, { backgroundColor: colors.liveForeground }]} />
      <Txt color={colors.liveForeground} style={styles.label}>
        {t().matches.liveNow} ({count})
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 12, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 14, fontWeight: '700' },
});
