/** Themed pull-to-refresh wired to a react-query refetch.
 *  Returns a <RefreshControl> element for a list's `refreshControl` prop —
 *  works for FlashList (v2 forwards it as a ScrollView prop) and ScrollView alike. */
import React, { useCallback } from 'react';
import { RefreshControl, type RefreshControlProps } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function useRefreshControl(opts: {
  /** react-query `refetch` for the screen's server data. */
  refetch: () => unknown;
  /** react-query `isRefetching` — true only while a manual refetch is in flight. */
  refreshing: boolean;
}): React.ReactElement<RefreshControlProps> {
  const { colors } = useTheme();
  const { refetch, refreshing } = opts;
  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary} // iOS spinner
      colors={[colors.primary]} // Android spinner arc
      progressBackgroundColor={colors.card} // Android spinner track
    />
  );
}
