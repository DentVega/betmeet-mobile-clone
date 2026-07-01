/** Account & Security (US-AS1..AS4, AS6): change email/password, MFA, providers, delete. */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../../ui/Screen';
import { Card } from '../../ui/Card';
import { Txt } from '../../ui/Text';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { useTheme } from '../../theme/useTheme';
import { authService } from '../../auth/authService';
import { linkGoogle } from '../../auth/googleOAuth';
import { registerPasskey, passkeysAvailable } from '../../auth/passkeys';
import {
  listFactors, enrollTotp, verifyTotp, disableMfa,
  listIdentities, unlinkIdentity, deleteAccount, type TotpFactor,
} from '../data/securityApi';
import { t } from '../../i18n';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt variant="muted" style={styles.sectionTitle}>{title.toUpperCase()}</Txt>
      <Card>{children}</Card>
    </View>
  );
}

export function SecurityScreen() {
  const dict = t().security;
  const { colors } = useTheme();

  // change email / password
  const [email, setEmail] = useState('');
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // mfa
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [enroll, setEnroll] = useState<{ factorId: string; secret: string } | null>(null);
  const [code, setCode] = useState('');

  // identities
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [identities, setIdentities] = useState<any[]>([]);

  // delete
  const [confirmDelete, setConfirmDelete] = useState(false);

  const refresh = async () => {
    setFactors(await listFactors());
    setIdentities(await listIdentities());
  };
  useEffect(() => { void refresh(); }, []);

  const flash = (text: string, ok: boolean) => setMsg({ text, ok });

  const onChangeEmail = async () => {
    const r = await authService.changeEmail(email.trim());
    flash(r.ok ? dict.emailSent : dict.errorGeneric, r.ok);
  };
  const onChangePassword = async () => {
    const r = await authService.changePassword(curPw, newPw);
    flash(r.ok ? dict.passwordChanged : dict.wrongPassword, r.ok);
    if (r.ok) { setCurPw(''); setNewPw(''); }
  };
  const onEnroll = async () => {
    const e = await enrollTotp();
    if (e) setEnroll({ factorId: e.factorId, secret: e.secret });
  };
  const onVerify = async () => {
    if (!enroll) return;
    const r = await verifyTotp(enroll.factorId, code.trim());
    if (r.ok) { setEnroll(null); setCode(''); await refresh(); flash(dict.mfaEnabled, true); }
    else flash(dict.wrongCode, false);
  };
  const onDisable = async (id: string) => { await disableMfa(id); await refresh(); };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUnlink = async (idn: any) => { await unlinkIdentity(idn); await refresh(); };
  const onDelete = async () => {
    const r = await deleteAccount();
    if (r.ok) await authService.signOut();
    else flash(dict.errorGeneric, false);
  };

  const mfaOn = factors.some((f) => f.status === 'verified');

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {!!msg && <Txt color={msg.ok ? colors.success : colors.destructive} style={styles.msg}>{msg.text}</Txt>}

        <Section title={dict.changeEmail}>
          <TextField label={dict.newEmail} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Button title={dict.changeEmail} onPress={onChangeEmail} disabled={!email.includes('@')} />
        </Section>

        <Section title={dict.changePassword}>
          <TextField label={dict.currentPassword} value={curPw} onChangeText={setCurPw} secureTextEntry />
          <TextField label={dict.newPassword} value={newPw} onChangeText={setNewPw} secureTextEntry />
          <Button title={dict.changePassword} onPress={onChangePassword} disabled={curPw.length < 8 || newPw.length < 8} />
        </Section>

        <Section title={dict.mfa}>
          {mfaOn ? (
            <>
              <Txt color={colors.success}>{dict.mfaEnabled}</Txt>
              {factors.map((f) => (
                <Button key={f.id} title={dict.disableMfa} variant="secondary" onPress={() => onDisable(f.id)} />
              ))}
            </>
          ) : enroll ? (
            <>
              <Txt variant="muted">{dict.mfaSecret}</Txt>
              <Txt selectable style={styles.secret}>{enroll.secret}</Txt>
              <TextField label={dict.mfaCode} value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} />
              <Button title={dict.verify} onPress={onVerify} disabled={code.trim().length !== 6} />
            </>
          ) : (
            <Button title={dict.enableMfa} variant="secondary" onPress={onEnroll} />
          )}
        </Section>

        {passkeysAvailable() && (
          <Section title={dict.passkeys}>
            <Button
              title={dict.registerPasskey}
              variant="secondary"
              onPress={async () => {
                const r = await registerPasskey();
                flash(r.ok ? dict.passkeyRegistered : dict.errorGeneric, r.ok);
                if (r.ok) await refresh();
              }}
            />
          </Section>
        )}

        <Section title={dict.providers}>
          {identities.map((idn) => (
            <View key={idn.identity_id ?? idn.provider} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Txt variant="body">{idn.provider}</Txt>
              {identities.length > 1 && (
                <Txt color={colors.destructive} onPress={() => onUnlink(idn)}>{dict.unlink}</Txt>
              )}
            </View>
          ))}
          {!identities.some((i) => i.provider === 'google') && (
            <Button title={dict.linkGoogle} variant="secondary" onPress={() => void linkGoogle()} />
          )}
        </Section>

        <Section title={dict.dangerZone}>
          {confirmDelete ? (
            <>
              <Txt color={colors.destructive} style={styles.warn}>{dict.confirmDelete}</Txt>
              <Button title={dict.deleteConfirmed} variant="destructive" onPress={onDelete} />
              <Button title={t().matches.cancel} variant="secondary" onPress={() => setConfirmDelete(false)} />
            </>
          ) : (
            <Button title={dict.deleteAccount} variant="destructive" onPress={() => setConfirmDelete(true)} />
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
  msg: { textAlign: 'center', marginBottom: 8 },
  secret: { fontSize: 18, fontWeight: '700', letterSpacing: 1, marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  warn: { marginBottom: 12 },
});
