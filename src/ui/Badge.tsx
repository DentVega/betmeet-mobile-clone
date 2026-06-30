/** Themed status pill. tone maps to semantic tokens (e.g. match status). */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Tone = 'neutral' | 'live' | 'success' | 'brand' | 'muted';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { colors, radius } = useTheme();
  const map = {
    neutral: { bg: colors.secondary, fg: colors.secondaryForeground },
    live: { bg: colors.live, fg: colors.liveForeground },
    success: { bg: colors.success, fg: colors.successForeground },
    brand: { bg: colors.brand, fg: colors.brandForeground },
    muted: { bg: colors.muted, fg: colors.mutedForeground },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg, borderRadius: radius.full }]}>
      <Text style={[styles.text, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
});
