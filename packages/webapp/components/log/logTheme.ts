// Log 2025 - Theme Constants and Configurations

// Per-card theme configurations for subtle variety
export interface CardTheme {
  bgColor: string;
  burstColor: string;
  decorations: { char: string; color: string }[];
}

// Card to background music track mapping (1.mp3, 2.mp3, 3.mp3)
export const CARD_TO_TRACK: Record<string, number> = {
  welcome: 0,
  'total-impact': 0,
  'when-you-read': 0,
  'topic-evolution': 0,
  'favorite-sources': 1,
  community: 1,
  contributions: 1,
  records: 1,
  archetype: 2,
  share: 2,
};

// Design system colors from daily.dev palette
export const PALETTE = {
  pepper90: '#0E1217',
  pepper80: '#17191F',
  pepper70: '#1C1F26',
  pepperWarm: '#1A1410', // Warm dark variant for welcome screen
  bun40: '#FF8E3B',
  cheese40: '#FFE923',
  cabbage40: '#CE3DF3',
  lettuce40: '#ACF535',
  water40: '#427EF7',
  water20: '#5C9BFA',
  blueCheese40: '#2CDCE6',
  onion40: '#7147ED',
  onion10: '#9D70F8',
  salt0: '#FFFFFF',
};

export const CARD_THEMES: Record<string, CardTheme> = {
  welcome: {
    bgColor: PALETTE.pepperWarm,
    burstColor: 'rgba(255, 142, 59, 0.08)', // bun.40 at 8% - warm orange glow
    decorations: [
      { char: '✦', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✶', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.cheese40 },
      { char: '★', color: PALETTE.bun40 },
      { char: '✶', color: PALETTE.onion10 },
    ],
  },
  'total-impact': {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(206, 61, 243, 0.08)', // cabbage.40 at 8%
    decorations: [
      { char: '✦', color: PALETTE.cheese40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✶', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✶', color: PALETTE.cheese40 },
    ],
  },
  'when-you-read': {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(66, 126, 247, 0.08)', // water.40 at 8%
    decorations: [
      { char: '✧', color: PALETTE.water40 },
      { char: '★', color: PALETTE.water20 },
      { char: '◇', color: PALETTE.lettuce40 },
      { char: '✦', color: PALETTE.water40 },
      { char: '✧', color: PALETTE.salt0 },
      { char: '★', color: PALETTE.water20 },
    ],
  },
  'topic-evolution': {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(172, 245, 53, 0.06)', // lettuce.40 at 6%
    decorations: [
      { char: '◆', color: PALETTE.lettuce40 },
      { char: '▸', color: PALETTE.blueCheese40 },
      { char: '✦', color: PALETTE.lettuce40 },
      { char: '◆', color: PALETTE.blueCheese40 },
      { char: '▸', color: PALETTE.lettuce40 },
      { char: '✶', color: PALETTE.cheese40 },
    ],
  },
  'favorite-sources': {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(255, 142, 59, 0.08)', // bun.40 at 8%
    decorations: [
      { char: '♦', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✦', color: PALETTE.bun40 },
      { char: '♦', color: PALETTE.cheese40 },
      { char: '✶', color: PALETTE.cabbage40 },
      { char: '★', color: PALETTE.bun40 },
    ],
  },
  community: {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(157, 112, 248, 0.08)', // onion.10 at 8%
    decorations: [
      { char: '✦', color: PALETTE.onion10 },
      { char: '◇', color: PALETTE.cabbage40 },
      { char: '★', color: PALETTE.onion10 },
      { char: '✶', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.lettuce40 },
      { char: '◇', color: PALETTE.onion10 },
    ],
  },
  contributions: {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(157, 112, 248, 0.08)', // onion.10 at 8%
    decorations: [
      { char: '✶', color: PALETTE.onion10 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✦', color: PALETTE.onion10 },
      { char: '✶', color: PALETTE.lettuce40 },
      { char: '★', color: PALETTE.onion10 },
      { char: '✦', color: PALETTE.cheese40 },
    ],
  },
  records: {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(206, 61, 243, 0.06)', // cabbage.40 at 6%
    decorations: [
      { char: '★', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.lettuce40 },
      { char: '◆', color: PALETTE.cabbage40 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✶', color: PALETTE.lettuce40 },
      { char: '✦', color: PALETTE.cabbage40 },
    ],
  },
  archetype: {
    bgColor: PALETTE.pepper90, // Will be overridden dynamically
    burstColor: 'rgba(206, 61, 243, 0.1)', // cabbage.40 at 10%
    decorations: [
      { char: '✦', color: PALETTE.cheese40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✶', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✶', color: PALETTE.cheese40 },
    ],
  },
  share: {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(172, 245, 53, 0.08)', // lettuce.40 at 8%
    decorations: [
      { char: '✧', color: PALETTE.lettuce40 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✦', color: PALETTE.cabbage40 },
      { char: '✧', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✶', color: PALETTE.cheese40 },
    ],
  },
};

// Star positions (consistent across cards)
export interface StarPosition {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: string;
  delay: number;
}

export const STAR_POSITIONS: StarPosition[] = [
  { top: '18%', left: '8%', size: '1.75rem', delay: 0 },
  { top: '25%', right: '12%', size: '1.25rem', delay: 0.5 },
  { bottom: '28%', left: '6%', size: '1.5rem', delay: 1 },
  { bottom: '18%', right: '10%', size: '1.75rem', delay: 1.5 },
  { top: '45%', left: '4%', size: '1rem', delay: 2 },
  { top: '55%', right: '5%', size: '1.25rem', delay: 2.5 },
];

// Framer Motion card animation variants
export const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    rotate: direction > 0 ? 5 : -5,
    scale: 0.8,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    rotate: direction < 0 ? 5 : -5,
    scale: 0.8,
  }),
};
