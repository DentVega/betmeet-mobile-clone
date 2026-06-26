/**
 * Navigation container ref so deep-link handlers (outside the React tree) can
 * navigate once the container is ready.
 */
import { createNavigationContainerRef } from '@react-navigation/native';
import type { AppTabsParamList } from './navigation/types';

export const navigationRef = createNavigationContainerRef<AppTabsParamList>();
