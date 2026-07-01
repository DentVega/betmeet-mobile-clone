/**
 * Typed route maps for every stack/tab. Param shapes match the deep-link intents
 * in src/domain/deepLink.ts so routing stays type-checked.
 */
import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { tokenHash?: string } | undefined;
  VerifyEmail: { tokenHash?: string; type?: string; email?: string } | undefined;
};

export type OnboardingStackParamList = {
  Nickname: undefined;
  Avatar: undefined;
  Rules: undefined;
};

export type PoolsStackParamList = {
  PoolsList: undefined;
  PoolNew: undefined;
  PoolDiscover: undefined;
  PoolDetail: { poolId: string };
  PoolLeaderboard: { poolId: string };
  PoolJoin: { token: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
};

export type AppTabsParamList = {
  Matches: undefined;
  Pools: NavigatorScreenParams<PoolsStackParamList> | undefined;
  Rankings: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
};
