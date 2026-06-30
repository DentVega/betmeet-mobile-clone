/**
 * App root. Provider order (system-context.md §3):
 *   SafeArea → QueryClient → NavigationContainer → RootNavigator.
 * Bootstraps the session and the deep-link handler once.
 */
import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../data/queryClient';
import { navigationRef } from './navigationRef';
import { RootNavigator } from './RootNavigator';
import { BootingScreen } from '../ui/Screen';
import { useSessionBootstrap } from '../session/useSessionBootstrap';
import { useDeepLinkHandler } from './deepLinks';
import { useBrandStore } from '../theme/brandStore';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  useSessionBootstrap();
  useDeepLinkHandler();
  React.useEffect(() => {
    void useBrandStore.getState().hydrate();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <QueryClientProvider client={queryClient}>
        <NavigationContainer ref={navigationRef} fallback={<BootingScreen />}>
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
