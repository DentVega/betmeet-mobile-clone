/** Line-style tab-bar icons (react-native-svg). Coloured by the navigator tint. */
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabName = 'matches' | 'pools' | 'rankings' | 'rules' | 'settings';

interface Props {
  name: TabName;
  color: string;
  size?: number;
}

function TabIconBase({ name, color, size = 24 }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'matches': // calendar (fixture by day)
      return (
        <Svg {...common}>
          <Rect x={3} y={4} width={18} height={18} rx={2} />
          <Path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>
      );
    case 'pools': // users (leagues / members)
      return (
        <Svg {...common}>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <Circle cx={9} cy={7} r={4} />
          <Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </Svg>
      );
    case 'rankings': // trophy
      return (
        <Svg {...common}>
          <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <Path d="M4 22h16" />
          <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <Path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </Svg>
      );
    case 'rules': // book-open (how to play)
      return (
        <Svg {...common}>
          <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </Svg>
      );
    case 'settings': // gear
      return (
        <Svg {...common}>
          <Circle cx={12} cy={12} r={3} />
          <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Svg>
      );
  }
}

export const TabIcon = React.memo(TabIconBase);
