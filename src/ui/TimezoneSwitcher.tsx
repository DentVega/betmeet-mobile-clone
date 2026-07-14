/** Display-timezone picker: "Device default" + a curated set of common zones. */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import {
  useTimezoneStore,
  COMMON_TIMEZONES,
  deviceTimezone,
  timezoneLabel,
} from '../settings/timezoneStore';
import { t } from '../i18n';
import { Txt } from './Text';

export function TimezoneSwitcher() {
  const { colors, radius } = useTheme();
  const override = useTimezoneStore((s) => s.timezone);
  const setTimezone = useTimezoneStore((s) => s.setTimezone);
  const dict = t().settings.timezone;

  const Pill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        {
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.accent : 'transparent',
          borderRadius: radius.full,
        },
      ]}>
      <Txt color={active ? colors.primary : colors.mutedForeground} style={styles.label}>{label}</Txt>
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      <Txt variant="muted" style={styles.hint}>{dict.deviceHint.replace('{tz}', deviceTimezone())}</Txt>
      <View style={styles.row}>
        <Pill label={dict.device} active={override === null} onPress={() => setTimezone(null)} />
        {COMMON_TIMEZONES.map((tz) => (
          <Pill key={tz} label={timezoneLabel(tz)} active={override === tz} onPress={() => setTimezone(tz)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  hint: { marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  label: { fontSize: 13, fontWeight: '600' },
});
