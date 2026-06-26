/**
 * Auth stack (Bolt 1). Real screens; route names/params match types.ts and the
 * deep-link router. Headerless — screens own their layout.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { SignInScreen } from '../../auth/screens/SignInScreen';
import { SignUpScreen } from '../../auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '../../auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../../auth/screens/ResetPasswordScreen';
import { VerifyEmailScreen } from '../../auth/screens/VerifyEmailScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </Stack.Navigator>
  );
}
