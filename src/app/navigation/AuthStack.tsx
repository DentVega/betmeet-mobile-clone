/**
 * Auth stack. Placeholder screens in Bolt 0 — real implementations land in Bolt 1.
 * Components are declared at module scope (stable refs, no remount churn).
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { PlaceholderScreen } from '../../ui/Screen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const SignInScreen = () => <PlaceholderScreen title="Sign in (Bolt 1)" />;
const SignUpScreen = () => <PlaceholderScreen title="Sign up (Bolt 1)" />;
const ForgotPasswordScreen = () => (
  <PlaceholderScreen title="Forgot password (Bolt 1)" />
);
const ResetPasswordScreen = () => (
  <PlaceholderScreen title="Reset password (Bolt 1)" />
);
const VerifyEmailScreen = () => (
  <PlaceholderScreen title="Verify email (Bolt 1)" />
);

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
