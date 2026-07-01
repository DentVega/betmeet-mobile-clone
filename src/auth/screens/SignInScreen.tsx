/** Sign in with email/password or Google (US-A3, US-A4). */
import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthStackParamList } from '../../app/navigation/types';
import { signInSchema, type SignInValues } from '../validation';
import { authService } from '../authService';
import { signInWithGoogle } from '../googleOAuth';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { Screen } from '../../ui/Screen';
import { ThemeSwitcher } from '../../ui/ThemeSwitcher';
import { LocaleSwitcher } from '../../ui/LocaleSwitcher';
import { t, tr } from '../../i18n';
import { useAuthStyles } from './styles';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;
const fe = (m?: string) => (m ? tr(m) : undefined);

export function SignInScreen() {
  const navigation = useNavigation<Nav>();
  const dict = t();
  const s = useAuthStyles();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setLoading(true);
    const res = await authService.signIn(values.email, values.password);
    setLoading(false);
    if (!res.ok) {
      setServerError(tr(res.error.messageKey));
    }
    // success → session updates → RootNavigator advances automatically
  });

  const onGoogle = async () => {
    setServerError(null);
    const res = await signInWithGoogle();
    if (!res.ok) {
      setServerError(tr(res.error.messageKey));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>{dict.auth.signIn.title}</Text>
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
        {!!serverError && <Text style={s.serverError}>{serverError}</Text>}
        <Button title={dict.auth.signIn.submit} onPress={onSubmit} loading={loading} />
        <Button title={dict.auth.google} variant="secondary" onPress={onGoogle} />
        <Text style={s.link} onPress={() => navigation.navigate('ForgotPassword')}>
          {dict.auth.signIn.forgot}
        </Text>
        <Text style={s.link} onPress={() => navigation.navigate('SignUp')}>
          {dict.auth.signIn.toSignUp}
        </Text>
        <ThemeSwitcher />
        <LocaleSwitcher />
      </ScrollView>
    </Screen>
  );
}
