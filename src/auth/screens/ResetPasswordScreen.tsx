/** Set a new password after a reset deep link (US-A5). */
import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthStackParamList } from '../../app/navigation/types';
import { resetPasswordSchema, type ResetPasswordValues } from '../validation';
import { authService } from '../authService';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { Screen } from '../../ui/Screen';
import { t, tr } from '../../i18n';
import { authStyles as s } from './styles';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type Route = RouteProp<AuthStackParamList, 'ResetPassword'>;
const fe = (m?: string) => (m ? tr(m) : undefined);

export function ResetPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tokenHash = route.params?.tokenHash;
  const dict = t();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirm: '' },
  });

  // Establish the recovery session from the deep-link token.
  useEffect(() => {
    if (tokenHash) {
      authService.beginPasswordRecovery(tokenHash).then((res) => {
        if (!res.ok) {
          setServerError(tr(res.error.messageKey));
        }
      });
    }
  }, [tokenHash]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setLoading(true);
    const res = await authService.completePasswordReset(values.password);
    if (res.ok) {
      // Sign out so the user re-authenticates with the new password.
      await authService.signOut();
      setLoading(false);
      navigation.navigate('SignIn');
    } else {
      setLoading(false);
      setServerError(tr(res.error.messageKey));
    }
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>{dict.auth.reset.title}</Text>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              label={dict.auth.passwordLabel}
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fe(errors.password?.message)}
            />
          )}
        />
        <Controller
          control={control}
          name="confirm"
          render={({ field }) => (
            <TextField
              label={dict.auth.confirmLabel}
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fe(errors.confirm?.message)}
            />
          )}
        />
        {!!serverError && <Text style={s.serverError}>{serverError}</Text>}
        <Button title={dict.auth.reset.submit} onPress={onSubmit} loading={loading} />
      </ScrollView>
    </Screen>
  );
}
