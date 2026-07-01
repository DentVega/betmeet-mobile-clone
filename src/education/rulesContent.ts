/** Rules Center content — ported verbatim from betmeet-clone content/rules/{es,en}. */
import { getLocale, type Locale } from '../i18n';

/** A content block: heading, paragraph, or bullet list. `**bold**` inline markers. */
export interface RuleBlock {
  h?: string;
  p?: string;
  ul?: string[];
}
export interface RuleSection {
  slug: string;
  title: string;
  blocks: RuleBlock[];
}

const ES: RuleSection[] = [
  {
    slug: 'scoring',
    title: 'Puntuación',
    blocks: [
      { h: '¿Cómo se reparten los puntos?' },
      { p: 'Cada partido que predices te puede dar puntos según qué tan cerca estés del marcador real:' },
      {
        ul: [
          '**Marcador exacto** (local y visitante): **5 puntos**.',
          'Si no aciertas el exacto, se **suman**: **Resultado correcto** (ganador o empate) **+2**, y **goles de un equipo** acertados **+1 por equipo** (0, 1 o 2 puntos).',
          '**Nada** acertado: **0 puntos**.',
        ],
      },
      { p: '**Ejemplo**: resultado real BRA 2 - 1 ARG, tu predicción BRA 3 - 2 ARG. Acertaste el ganador (+2) y los goles de ARG (+1). Total: **3 puntos**.' },
      { p: 'En fases eliminatorias, si aciertas el ganador de la tanda de penales, ganas **+1 punto** adicional.' },
    ],
  },
  {
    slug: 'penalties',
    title: 'Predicción de penales',
    blocks: [
      { h: 'Penales en fases eliminatorias' },
      { p: 'En los partidos de eliminación directa (octavos en adelante), si predices un **empate** en el marcador, podrás elegir **qué equipo gana en la tanda de penales**.' },
      {
        ul: [
          'Solo aparece en partidos de fase eliminatoria.',
          'Solo se habilita si tu predicción de goles es un empate (por ejemplo, 1-1).',
          'No necesitas indicar cuántos penales: solo quién pasa.',
        ],
      },
      { p: 'Si aciertas al ganador de penales, sumas **+1 punto** sobre tu puntaje base.' },
    ],
  },
  {
    slug: 'match-locks',
    title: 'Bloqueo de predicciones',
    blocks: [
      { h: '¿Hasta cuándo puedo predecir?' },
      { p: 'Puedes crear y **modificar tu predicción las veces que quieras** hasta el momento del inicio del partido.' },
      {
        ul: [
          'Al iniciar el partido, tu última predicción guardada queda bloqueada.',
          'Después del inicio del partido ya no se puede editar.',
          'El bloqueo usa la hora oficial del partido, no la de tu dispositivo.',
        ],
      },
    ],
  },
  {
    slug: 'ties',
    title: 'Empates en el ranking',
    blocks: [
      { h: '¿Qué pasa si empatamos en puntos?' },
      { p: 'Hay **ranking por liga** y **ranking global**: compites contra tu liga y también contra todos los usuarios.' },
      { p: 'Si dos o más personas terminan con los **mismos puntos**, **comparten la misma posición**. No hay criterio de desempate: un empate de puntos es un empate de posición.' },
    ],
  },
  {
    slug: 'pools',
    title: 'Ligas y miembros',
    blocks: [
      { h: 'Ligas' },
      { p: 'Una **liga** es el grupo donde compites. Puede ser pública (aparece en el directorio) o privada (se entra con un enlace de invitación).' },
      {
        ul: [
          'Capacidad de hasta **100 miembros**.',
          'Puedes participar en varias ligas a la vez.',
          'El creador de la liga es su administrador y puede **expulsar** a un miembro.',
          'No se puede entrar si la liga ya alcanzó su límite.',
        ],
      },
    ],
  },
];

const EN: RuleSection[] = [
  {
    slug: 'scoring',
    title: 'Scoring',
    blocks: [
      { h: 'How are points awarded?' },
      { p: 'Every match you predict can give you points depending on how close you are to the actual score:' },
      {
        ul: [
          '**Exact score** (home and away): **5 points**.',
          "If you don't hit the exact score, they **stack up**: **Correct result** (winner or draw) **+2**, and **matched team goals** **+1 per team** (0, 1, or 2 points).",
          '**No hit**: **0 points**.',
        ],
      },
      { p: '**Example**: actual result BRA 2 - 1 ARG, your prediction BRA 3 - 2 ARG. You got the winner (+2) and ARG’s goals (+1). Total: **3 points**.' },
      { p: 'In knockout stages, if you guess the penalty shootout winner, you earn **+1 additional point**.' },
    ],
  },
  {
    slug: 'penalties',
    title: 'Penalty predictions',
    blocks: [
      { h: 'Penalties in knockout stages' },
      { p: 'In knockout matches (round of 16 onward), if you predict a **draw** in the score, you can choose **which team wins the penalty shootout**.' },
      {
        ul: [
          'It only appears in knockout-stage matches.',
          'It is only enabled when your goal prediction is a draw (for example, 1-1).',
          'You do not need to enter how many penalties: only who advances.',
        ],
      },
      { p: 'If you guess the penalty winner, you add **+1 point** to your base score.' },
    ],
  },
  {
    slug: 'match-locks',
    title: 'Prediction locks',
    blocks: [
      { h: 'Until when can I predict?' },
      { p: 'You can create and **edit your prediction as many times as you want** until the match starts.' },
      {
        ul: [
          'When the match starts, your last saved prediction is locked.',
          'After match start, it can no longer be edited.',
          'The lock uses the official match time, not your device time.',
        ],
      },
    ],
  },
  {
    slug: 'ties',
    title: 'Ranking ties',
    blocks: [
      { h: 'What happens if we tie on points?' },
      { p: 'There is a **league ranking** and a **global ranking**: you compete against your league and also against all users.' },
      { p: 'If two or more people finish with the **same points**, they **share the same position**. There is no tiebreaker: a points tie is a position tie.' },
    ],
  },
  {
    slug: 'pools',
    title: 'Leagues and members',
    blocks: [
      { h: 'Leagues' },
      { p: 'A **league** is the group where you compete. It can be public (appears in the directory) or private (joined through an invitation link).' },
      {
        ul: [
          'Capacity of up to **100 members**.',
          'You can participate in several leagues at the same time.',
          'The league creator is its administrator and can **remove** a member.',
          'You cannot join if the league has reached its limit.',
        ],
      },
    ],
  },
];

export function rulesSections(locale: Locale = getLocale()): RuleSection[] {
  return locale === 'en' ? EN : ES;
}
