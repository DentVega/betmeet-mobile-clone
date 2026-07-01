/** Rules Center (Intent 003) — accordion of rule sections, bilingual + themed. */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../ui/Screen';
import { Card } from '../ui/Card';
import { useTheme } from '../theme/useTheme';
import { fonts } from '../theme/tokens';
import { rulesSections } from './rulesContent';
import { RuleBody } from './RuleBody';
import { ScoreCalculator } from './ScoreCalculator';

export function RulesScreen() {
  const { colors } = useTheme();
  const sections = rulesSections();
  const [open, setOpen] = useState<string>(sections[0]?.slug ?? '');

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ScoreCalculator />
        {sections.map((s) => {
          const expanded = open === s.slug;
          return (
            <Card key={s.slug}>
              <Pressable
                onPress={() => setOpen(expanded ? '' : s.slug)}
                style={styles.header}
                accessibilityRole="button">
                <Text style={[styles.title, { color: colors.foreground }]}>{s.title}</Text>
                <Text style={[styles.chevron, { color: colors.mutedForeground }]}>{expanded ? '▲' : '▼'}</Text>
              </Pressable>
              {expanded && (
                <View style={[styles.body, { borderTopColor: colors.border }]}>
                  <RuleBody blocks={s.blocks} />
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.displayBold, fontSize: 17 },
  chevron: { fontSize: 12 },
  body: { marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
});
