/** Team flag via react-native-svg (native). Renders nothing if no flag for the ISO. */
import React from 'react';
import { SvgXml } from 'react-native-svg';
import { flags } from '../assets/flags';

export function Flag({ iso, width = 22 }: { iso?: string | null; width?: number }) {
  const xml = iso ? flags[iso.toLowerCase()] : undefined;
  if (!xml) return null;
  return <SvgXml xml={xml} width={width} height={Math.round(width * 0.7)} />;
}
