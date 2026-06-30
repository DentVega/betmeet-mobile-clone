/**
 * Email verification (US-A2). Reached after sign-up (shows instructions + resend)
 * or via the betmeet://auth/confirm deep link (auto-verifies from the token).
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { AuthStackParamList } from '../../app/navigation/types';
import { authService } from '../authService';
import { Button } from '../../ui/Button';
import { Screen } from '../../ui/Screen';
import { t, tr } from '../../i18n';
import { useAuthStyles } from './styles';

type Route = RouteProp<AuthStackParamList, 'VerifyEmail'>;

export function VerifyEmailScreen() {
  const route = useRoute<Route>();
  const { tokenHash, type, email } = route.params ?? {};
  const dict = t();
  const s = useAuthStyles();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>(
    tokenHash ? 'verifying' : 'idle',
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  // Auto-verify when arriving from the confirm deep link.
  useEffect(() => {
    if (!tokenHash) {
      return;
    }
    authService.confirmEmail(tokenHash, type ?? 'email').then((res) => {
      if (res.ok) {
        setStatus('verified');
        // session is now verified → RootNavigator advances automatically
      } else {
        setStatus('error');
        setServerError(tr(res.error.messageKey));
      }
    });
  }, [tokenHash, type]);

  const onResend = async () => {
    if (!email) {
      return;
    }
    setServerError(null);
    const res = await authService.resendConfirmation(email);
    if (res.ok) {
      setResent(true);
    } else {
      setServerError(tr(res.error.messageKey));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>{dict.auth.verify.title}</Text>
        {status === 'verifying' && <Text style={s.info}>{dict.auth.verify.verifying}</Text>}
        {status === 'verified' && <Text style={s.success}>{dict.auth.verify.verified}</Text>}
        {status !== 'verified' && status !== 'verifying' && (
          <>
            <Text style={s.info}>{dict.auth.verify.message}</Text>
            {resent && <Text style={s.success}>{dict.auth.verify.resent}</Text>}
            {!!email && (
              <Button
                title={dict.auth.verify.resend}
                variant="secondary"
                onPress={onResend}
              />
            )}
          </>
        )}
        {!!serverError && <Text style={s.serverError}>{serverError}</Text>}
      </ScrollView>
    </Screen>
  );
}
