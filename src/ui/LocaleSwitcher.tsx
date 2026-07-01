/** Language picker (es|en): full pills (SignIn) + compact header cycle. */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { fonts } from '../theme/tokens';
import { useLocaleStore } from '../i18n/localeStore';
import type { Locale } from '../i18n';
import { Txt } from './Text';

const LABELS: Record<Locale, string> = { es: 'ES', en: 'EN' };
const ORDER: Locale[] = ['es', 'en'];

export function LocaleSwitcher() {
  const { colors, radius } = useTheme();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  return (
    <View style={styles.row}>
      {ORDER.map((l) => {
        const on = l === locale;
        return (
          <Pressable
            key={l}
            onPress={() => setLocale(l)}
            style={[styles.pill, { borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.accent : 'transparent', borderRadius: radius.full }]}>
            <Txt color={on ? colors.primary : colors.mutedForeground} style={styles.label}>{LABELS[l]}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Compact header toggle (cycles es↔en). */
export function LocaleCycleButton() {
  const { colors } = useTheme();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  return (
    <Pressable
      onPress={() => setLocale(ORDER[(ORDER.indexOf(locale) + 1) % ORDER.length])}
      hitSlop={8}
      style={styles.cycle}
      accessibilityRole="button">
      <Text style={{ color: colors.foreground, fontFamily: fonts.sansMedium, fontSize: 13 }}>{LABELS[locale]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 8 },
  pill: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  cycle: { paddingHorizontal: 8, paddingVertical: 4 },
});
