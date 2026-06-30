/** Brand theme picker (deportivo|moderno|premium) — full row + header cycle button. */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useBrandStore } from '../theme/brandStore';
import { themes, BRANDS, type Brand } from '../theme/tokens';
import { fonts } from '../theme/tokens';
import { Txt } from './Text';

const LABELS: Record<Brand, string> = { deportivo: 'Deportivo', moderno: 'Moderno', premium: 'Premium' };

export function ThemeSwitcher() {
  const { colors, radius } = useTheme();
  const brand = useBrandStore((s) => s.brand);
  const setBrand = useBrandStore((s) => s.setBrand);

  return (
    <View style={styles.row}>
      {BRANDS.map((b) => {
        const active = b === brand;
        return (
          <Pressable
            key={b}
            onPress={() => setBrand(b)}
            style={[
              styles.pill,
              { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.accent : 'transparent', borderRadius: radius.full },
            ]}>
            <View style={[styles.dot, { backgroundColor: themes[b].light.primary }]} />
            <Txt color={active ? colors.primary : colors.mutedForeground} style={styles.label}>{LABELS[b]}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Compact header control — cycles to the next brand on tap, shows a swatch. */
export function ThemeCycleButton() {
  const { colors } = useTheme();
  const brand = useBrandStore((s) => s.brand);
  const setBrand = useBrandStore((s) => s.setBrand);
  const next = () => setBrand(BRANDS[(BRANDS.indexOf(brand) + 1) % BRANDS.length]);
  return (
    <Pressable onPress={next} hitSlop={8} style={styles.cycle} accessibilityRole="button">
      <View style={[styles.dot, { backgroundColor: themes[brand].light.primary }]} />
      <Text style={{ color: colors.foreground, fontFamily: fonts.sansMedium, fontSize: 13 }}>{LABELS[brand]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  cycle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 4 },
});
