/** Renders a rule section's blocks (heading / paragraph / bullets) with inline **bold**. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { fonts } from '../theme/tokens';
import type { RuleBlock } from './rulesContent';

/** Split on `**` → bold the odd segments. */
function inline(text: string, boldColor: string): React.ReactNode[] {
  return text.split('**').map((seg, i) =>
    i % 2 === 1 ? (
      <Text key={i} style={{ fontFamily: fonts.sansSemibold, color: boldColor }}>
        {seg}
      </Text>
    ) : (
      seg
    ),
  );
}

export function RuleBody({ blocks }: { blocks: RuleBlock[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      {blocks.map((b, i) => {
        if (b.h) {
          return (
            <Text key={i} style={[styles.h, { color: colors.foreground }]}>
              {b.h}
            </Text>
          );
        }
        if (b.p) {
          return (
            <Text key={i} style={[styles.p, { color: colors.mutedForeground }]}>
              {inline(b.p, colors.foreground)}
            </Text>
          );
        }
        if (b.ul) {
          return (
            <View key={i} style={styles.ul}>
              {b.ul.map((item, j) => (
                <View key={j} style={styles.li}>
                  <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
                  <Text style={[styles.p, styles.liText, { color: colors.mutedForeground }]}>
                    {inline(item, colors.foreground)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, paddingTop: 4 },
  h: { fontFamily: fonts.sansSemibold, fontSize: 15 },
  p: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  ul: { gap: 6 },
  li: { flexDirection: 'row', gap: 8 },
  bullet: { fontSize: 14, lineHeight: 20 },
  liText: { flex: 1 },
});
