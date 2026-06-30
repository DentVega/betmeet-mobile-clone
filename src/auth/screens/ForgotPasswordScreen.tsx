/** Request a password-reset email (US-A5). */
import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthStackParamList } from '../../app/navigation/types';
import { forgotSchema, type ForgotValues } from '../validation';
import { authService } from '../authService';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { Screen } from '../../ui/Screen';
import { t, tr } from '../../i18n';
import { useAuthStyles } from './styles';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
const fe = (m?: string) => (m ? tr(m) : undefined);

export function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const dict = t();
  const s = useAuthStyles();
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setLoading(true);
    const res = await authService.requestPasswordReset(values.email);
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      setServerError(tr(res.error.messageKey));
    }
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>{dict.auth.forgot.title}</Text>
        {sent ? (
          <Text style={s.success}>{dict.auth.forgot.sent}</Text>
        ) : (
          <>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextField
                  label={dict.auth.emailLabel}
                  keyboardType="email-address"
                  autoComplete="email"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fe(errors.email?.message)}
                />
              )}
            />
            {!!serverError && <Text style={s.serverError}>{serverError}</Text>}
            <Button title={dict.auth.forgot.submit} onPress={onSubmit} loading={loading} />
          </>
        )}
        <Text style={s.link} onPress={() => navigation.navigate('SignIn')}>
          {dict.auth.forgot.back}
        </Text>
      </ScrollView>
    </Screen>
  );
}
