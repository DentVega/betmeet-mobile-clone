/** Settings home: Appearance · Language · Account/Security · Notifications · Sign out.
 *  Profile editing (nickname + avatar) lives in the Profile screen (Intent 006). */
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../app/navigation/types';
import { Screen } from '../../ui/Screen';
import { Card } from '../../ui/Card';
import { Txt } from '../../ui/Text';
import { Button } from '../../ui/Button';
import { ThemeSwitcher } from '../../ui/ThemeSwitcher';
import { LocaleSwitcher } from '../../ui/LocaleSwitcher';
import { TimezoneSwitcher } from '../../ui/TimezoneSwitcher';
import { authService } from '../../auth/authService';
import { NotificationsPanel } from '../components/NotificationsPanel';
import { t } from '../../i18n';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt variant="muted" style={styles.sectionTitle}>{title.toUpperCase()}</Txt>
      <Card>{children}</Card>
    </View>
  );
}

export function SettingsScreen() {
  const dict = t().settings;
  const nav = useNavigation<NativeStackNavigationProp<SettingsStackParamList, 'SettingsHome'>>();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title={dict.appearance}>
          <ThemeSwitcher />
        </Section>

        <Section title={dict.language}>
          <LocaleSwitcher />
        </Section>

        <Section title={dict.timezone.title}>
          <TimezoneSwitcher />
        </Section>

        <Section title={dict.account}>
          <Button title={dict.account} variant="secondary" onPress={() => nav.navigate('Security')} />
        </Section>

        <Section title={dict.notifications}>
          <NotificationsPanel />
        </Section>

        <Button title={dict.signOut} variant="destructive" onPress={() => void authService.signOut()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
});
