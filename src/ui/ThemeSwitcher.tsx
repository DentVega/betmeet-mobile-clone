/** Brand theme + light/dark picker. Full switcher (SignIn) + header cycle buttons. */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useBrandStore, SCHEMES, type SchemePref } from '../theme/brandStore';
import { themes, BRANDS, fonts, type Brand } from '../theme/tokens';
import { Txt } from './Text';

const BRAND_LABELS: Record<Brand, string> = { deportivo: 'Deportivo', moderno: 'Moderno', premium: 'Premium' };
const SCHEME_LABELS: Record<SchemePref, string> = { system: 'Auto', light: 'Claro', dark: 'Oscuro' };

function Pills({ options, active, onSelect, swatch }: {
  options: readonly string[];
  active: string;
  onSelect: (v: string) => void;
  swatch?: (v: string) => string;
}) {
  const { colors, radius } = useTheme();
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const on = o === active;
        return (
          <Pressable
            key={o}
            onPress={() => onSelect(o)}
            style={[styles.pill, { borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.accent : 'transparent', borderRadius: radius.full }]}>
            {swatch && <View style={[styles.dot, { backgroundColor: swatch(o) }]} />}
            <Txt color={on ? colors.primary : colors.mutedForeground} style={styles.label}>{o}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ThemeSwitcher() {
  const brand = useBrandStore((s) => s.brand);
  const setBrand = useBrandStore((s) => s.setBrand);
  const scheme = useBrandStore((s) => s.scheme);
  const setScheme = useBrandStore((s) => s.setScheme);
  return (
    <View style={styles.wrap}>
      <Pills
        options={BRANDS.map((b) => BRAND_LABELS[b])}
        active={BRAND_LABELS[brand]}
        onSelect={(label) => setBrand(BRANDS.find((b) => BRAND_LABELS[b] === label)!)}
        swatch={(label) => themes[BRANDS.find((b) => BRAND_LABELS[b] === label)!].light.primary}
      />
      <Pills
        options={SCHEMES.map((s) => SCHEME_LABELS[s])}
        active={SCHEME_LABELS[scheme]}
        onSelect={(label) => setScheme(SCHEMES.find((s) => SCHEME_LABELS[s] === label)!)}
      />
    </View>
  );
}

function CycleButton({ label, dot, onPress }: { label: string; dot?: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.cycle} accessibilityRole="button">
      {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
      <Text style={{ color: colors.foreground, fontFamily: fonts.sansMedium, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

/** Header controls: brand cycle + scheme cycle. */
export function ThemeCycleButton() {
  const brand = useBrandStore((s) => s.brand);
  const setBrand = useBrandStore((s) => s.setBrand);
  const scheme = useBrandStore((s) => s.scheme);
  const setScheme = useBrandStore((s) => s.setScheme);
  return (
    <View style={styles.headerRow}>
      <CycleButton
        label={BRAND_LABELS[brand]}
        dot={themes[brand].light.primary}
        onPress={() => setBrand(BRANDS[(BRANDS.indexOf(brand) + 1) % BRANDS.length])}
      />
      <CycleButton
        label={SCHEME_LABELS[scheme]}
        onPress={() => setScheme(SCHEMES[(SCHEMES.indexOf(scheme) + 1) % SCHEMES.length])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 16 },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  cycle: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
});
