/** Register with email/password; routes to verify-email on success (US-A1). */
import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthStackParamList } from '../../app/navigation/types';
import { signUpSchema, type SignUpValues } from '../validation';
import { authService } from '../authService';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { Screen } from '../../ui/Screen';
import { t, tr } from '../../i18n';
import { authStyles as s } from './styles';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
const fe = (m?: string) => (m ? tr(m) : undefined);

export function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const dict = t();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirm: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setLoading(true);
    const res = await authService.signUp(values.email, values.password);
    setLoading(false);
    if (res.ok) {
      navigation.navigate('VerifyEmail', { email: values.email });
    } else {
      setServerError(tr(res.error.messageKey));
    }
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>{dict.auth.signUp.title}</Text>
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
        <Button title={dict.auth.signUp.submit} onPress={onSubmit} loading={loading} />
        <Text style={s.link} onPress={() => navigation.navigate('SignIn')}>
          {dict.auth.signUp.toSignIn}
        </Text>
      </ScrollView>
    </Screen>
  );
}
