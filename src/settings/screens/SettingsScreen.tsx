/** Settings home (US-PS1): Profile · Appearance · Language · Account/Notifications (later) · Sign out. */
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, BootingScreen } from '../../ui/Screen';
import { Card } from '../../ui/Card';
import { Txt } from '../../ui/Text';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { Avatar } from '../../ui/Avatar';
import { ThemeSwitcher } from '../../ui/ThemeSwitcher';
import { LocaleSwitcher } from '../../ui/LocaleSwitcher';
import { avatarKeys } from '../../assets/avatars';
import { useTheme } from '../../theme/useTheme';
import { useSessionStore } from '../../session/sessionStore';
import { authService } from '../../auth/authService';
import { useMyProfile } from '../data/useMyProfile';
import { changeNickname, setAvatar, googleAvatarUrl } from '../data/profileApi';
import { t, tr } from '../../i18n';

const NICK_RE = /^[A-Za-z0-9_-]{3,20}$/;

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
  const { colors } = useTheme();
  const qc = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const { data: profile, isLoading } = useMyProfile();

  const [nick, setNick] = useState('');
  const [nickErr, setNickErr] = useState<string | null>(null);
  const [nickDone, setNickDone] = useState(false);
  const [nickLoading, setNickLoading] = useState(false);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);

  useEffect(() => {
    void googleAvatarUrl().then(setGoogleUrl);
  }, []);

  if (isLoading || !profile) return <BootingScreen />;
  const currentNick = `${profile.nickname_base ?? '—'}#${profile.nickname_discriminator ?? ''}`;

  const onChangeNick = async () => {
    setNickErr(null);
    setNickDone(false);
    setNickLoading(true);
    const res = await changeNickname(nick.trim());
    setNickLoading(false);
    if (res.ok) {
      setNick('');
      setNickDone(true);
      await qc.invalidateQueries({ queryKey: ['myProfile'] });
    } else {
      setNickErr(tr('settings.errors.' + (res.code ?? 'INTERNAL')));
    }
  };

  const pickAvatar = async (url: string, source: 'DEFAULT_SET' | 'GOOGLE_PHOTO') => {
    if (!userId) return;
    await setAvatar(userId, url, source);
    await qc.invalidateQueries({ queryKey: ['myProfile'] });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile */}
        <Section title={dict.profile}>
          <Txt variant="muted">{dict.nickname.current}</Txt>
          <Txt variant="title" style={styles.nick}>{currentNick}</Txt>

          <View style={styles.avatarRow}>
            {profile.avatar_source === 'GOOGLE_PHOTO' && <Avatar url={profile.avatar_url} size={40} />}
            <View style={styles.grid}>
              {avatarKeys.map((k) => (
                <Pressable key={k} onPress={() => pickAvatar(k, 'DEFAULT_SET')}>
                  <View style={[styles.avatarWrap, profile.avatar_url === k && { borderColor: colors.primary }]}>
                    <Avatar url={k} size={48} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
          {!!googleUrl && (
            <Button title={dict.avatar.google} variant="secondary" onPress={() => pickAvatar(googleUrl, 'GOOGLE_PHOTO')} />
          )}
          <Txt variant="small" style={styles.upload}>{dict.avatar.upload}</Txt>

          <View style={styles.divider} />
          <TextField label={dict.nickname.label} value={nick} onChangeText={setNick} maxLength={20} error={nickErr ?? undefined} />
          {nickDone && <Txt color={colors.success} style={styles.done}>{dict.nickname.changed}</Txt>}
          <Button title={dict.nickname.change} onPress={onChangeNick} loading={nickLoading} disabled={!NICK_RE.test(nick.trim())} />
        </Section>

        {/* Appearance */}
        <Section title={dict.appearance}>
          <ThemeSwitcher />
        </Section>

        {/* Language */}
        <Section title={dict.language}>
          <LocaleSwitcher />
        </Section>

        {/* Placeholders for later bolts */}
        <Section title={dict.account}>
          <Txt variant="muted">{dict.comingSoon}</Txt>
        </Section>
        <Section title={dict.notifications}>
          <Txt variant="muted">{dict.comingSoon}</Txt>
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
  nick: { marginTop: 2, marginBottom: 12 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, flex: 1 },
  avatarWrap: { borderRadius: 28, borderWidth: 2, borderColor: 'transparent', padding: 2 },
  upload: { marginTop: 8 },
  divider: { height: 1, backgroundColor: 'transparent', marginVertical: 12 },
  done: { marginBottom: 8 },
});
