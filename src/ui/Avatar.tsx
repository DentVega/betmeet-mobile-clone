/** Avatar: local default SVG (key 'local-N'), remote URL (Image), or fallback. */
import React from 'react';
import { Image, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { avatars } from '../assets/avatars';
import { useTheme } from '../theme/useTheme';

export function Avatar({ url, size = 32 }: { url?: string | null; size?: number }) {
  const { colors } = useTheme();
  const radius = size / 2;
  if (url && avatars[url]) {
    return <SvgXml xml={avatars[url]} width={size} height={size} />;
  }
  if (url && /^https?:/.test(url)) {
    return <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.muted }} />;
  }
  return <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.muted }} />;
}
