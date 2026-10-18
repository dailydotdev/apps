/**
 * Real daily.dev artwork, not stand-ins.
 *
 * When a frame celebrates a streak, an achievement or a Top Reader badge, it
 * has to show the same object the user already earned inside the product.
 * A generic glyph next to the word "streak" reads as a mock-up; the actual
 * flame reads as a trophy they recognise.
 *
 * URLs are copied verbatim from `packages/shared/src/lib/image.ts` so the
 * prototype and the app cannot drift apart.
 */

export const asset = {
  /** The reading-streak flame. */
  streakFire:
    'https://media.daily.dev/image/upload/v1705386465/Hot_nrqvv5.svg',
  /** The broken streak. Used by the catch-up frame. */
  streakLost:
    'https://media.daily.dev/image/upload/v1724664713/streak-broken_x1nno4.svg',
  /** The Top Reader badge plate. */
  topReaderBadge:
    'https://media.daily.dev/image/upload/v1730888952/webapp/topReaderBadgeBackground.svg',
  /** Reputation privileges unlocked. Stands in for achievement artwork. */
  privilegesUnlocked:
    'https://media.daily.dev/image/upload/s--6sO7fJKh--/v1709136797/image_epr7dz.svg',
  /** The Cores coin, front-facing. */
  core: 'https://media.daily.dev/image/upload/s--YAvJnCmq--/f_auto/v1743599810/public/Core-front',
  /** The default Award artwork. */
  award:
    'https://media.daily.dev/image/upload/s--10Rf2kyK--/f_auto/v1743595864/public/Default',
  /**
   * The daily.dev hero artwork: the developer, Patchy and the violet portal.
   * Tomer's Game Center redesign uses this exact image behind the level HUD,
   * which is the same job the recap's opener does, so the opener uses it too.
   */
  heroArt:
    'https://media.daily.dev/image/upload/s--NCILTqRq--/f_auto,q_auto/v1785661216/public/daily.dev%20-%20main%20image',
  /** Star field, used behind Cores purchases. A ready-made celebration ground. */
  starField:
    'https://media.daily.dev/image/upload/s--W4W5Gmjh--/f_auto,q_auto/v1744197985/webapp/Stars',
} as const;

/**
 * Cores artwork steps up with the amount, exactly as `getCoreCurrencyImage`
 * does in the app, so an award frame shows the right coin for what was spent.
 */
const coreByValue = [
  { max: 200, image: 'https://media.daily.dev/image/upload/s--9IXwSmB---/f_auto/v1743599811/public/Core1' },
  { max: 1_000, image: 'https://media.daily.dev/image/upload/s--ybFIBUnx--/f_auto/v1743599810/public/Core2' },
  { max: 10_000, image: 'https://media.daily.dev/image/upload/s--kai_mE1u--/f_auto/v1743599810/public/Core3' },
  { max: 20_000, image: 'https://media.daily.dev/image/upload/s--bSCtv96n--/f_auto/v1743599810/public/Core4' },
  { max: Infinity, image: 'https://media.daily.dev/image/upload/s--54JYAftK--/f_auto/v1743599810/public/Core5' },
];

export const coreImageFor = (value: number): string =>
  (
    coreByValue.find((core) => core.max > value) ??
    coreByValue[coreByValue.length - 1]
  ).image;

/**
 * The reading streak's brand colour is bacon, not orange. The v2 rail badge
 * fills pink when you have read today, so a streak frame that celebrates in
 * orange is celebrating in the wrong colour.
 */
export const STREAK_PINK = '#F25D82';

/**
 * The DevCard gold gradient, which is what the product already uses to say
 * "this one is rare". Copied from `themeToLinearGradient[DevCardTheme.Gold]`.
 */
export const GOLD_GRADIENT =
  'linear-gradient(135deg, #FFE24C 0%, #FF9157 50%, #DD5143 100%)';

/** Same idea for the frames that are not gold-tier. */
export const gradientFor = (hue: string): string =>
  `linear-gradient(135deg, ${hue} 0%, ${hue}66 100%)`;

/**
 * The achievement rarity ladder, copied from
 * `features/profile/components/achievements/achievementRarity.ts`. Rarity is
 * the percentage of people holding the achievement, so lower is rarer.
 */
export enum RarityTier {
  Emerald = 'emerald',
  Gold = 'gold',
  Silver = 'silver',
  Bronze = 'bronze',
}

export const rarityTierFor = (rarity: number): RarityTier | null => {
  if (rarity <= 1) {
    return RarityTier.Emerald;
  }
  if (rarity <= 5) {
    return RarityTier.Gold;
  }
  if (rarity <= 10) {
    return RarityTier.Silver;
  }
  if (rarity <= 15) {
    return RarityTier.Bronze;
  }
  return null;
};

export const rarityRgb: Record<RarityTier, string> = {
  [RarityTier.Emerald]: '52,255,128',
  [RarityTier.Gold]: '255,215,0',
  [RarityTier.Silver]: '190,210,255',
  [RarityTier.Bronze]: '235,140,60',
};

/**
 * The two-stop ramp each tier's medal is filled with. Gold matches the
 * bun/cheese alternation the real `BadgeIconGoldGradient` uses.
 */
export const rarityRamp: Record<RarityTier, [string, string]> = {
  [RarityTier.Emerald]: ['#57E087', '#A9F261'],
  [RarityTier.Gold]: ['#FF9157', '#FFE24C'],
  [RarityTier.Silver]: ['#BED2FF', '#F6F7F9'],
  [RarityTier.Bronze]: ['#EB8C3C', '#C86A28'],
};

/**
 * The streak tier ladder, from the streak progression work (#5613) and the
 * milestone-rewards exploration. Artwork ships in `public/streak-tiers/`.
 *
 * This matters more than it looks. A streak is not a number, it is a named
 * thing you climb: day 30 is not "30 days", it is Inferno. The name is the
 * brag, and a recap that celebrates a streak without it is celebrating the
 * wrong noun.
 */
export enum StreakTier {
  Ember = 'ember',
  Spark = 'spark',
  Kindle = 'kindle',
  Flame = 'flame',
  Blaze = 'blaze',
  Firestorm = 'firestorm',
  Inferno = 'inferno',
  Scorcher = 'scorcher',
  EternalFlame = 'eternal-flame',
  Supernova = 'supernova',
  Legendary = 'legendary',
}

export const streakTierArt = (tier: StreakTier): string =>
  `/streak-tiers/${tier}.png`;

const LADDER: { day: number; tier: StreakTier; label: string }[] = [
  { day: 3, tier: StreakTier.Spark, label: 'Spark' },
  { day: 5, tier: StreakTier.Kindle, label: 'Kindle' },
  { day: 7, tier: StreakTier.Flame, label: 'Flame' },
  { day: 14, tier: StreakTier.Blaze, label: 'Blaze' },
  { day: 21, tier: StreakTier.Firestorm, label: 'Firestorm' },
  { day: 30, tier: StreakTier.Inferno, label: 'Inferno' },
  { day: 60, tier: StreakTier.Scorcher, label: 'Scorcher' },
  { day: 90, tier: StreakTier.EternalFlame, label: 'Eternal Flame' },
  { day: 180, tier: StreakTier.Supernova, label: 'Supernova' },
  { day: 365, tier: StreakTier.Legendary, label: 'Legendary' },
];

/** The tier a given streak length has already earned. */
export const tierForDay = (
  day: number,
): { day: number; tier: StreakTier; label: string } =>
  [...LADDER].reverse().find((step) => day >= step.day) ?? LADDER[0];

/** The next rung, for the frames that point forward. */
export const nextTierAfter = (
  day: number,
): { day: number; tier: StreakTier; label: string } | null =>
  LADDER.find((step) => step.day > day) ?? null;

export const streakLadder = LADDER;

/**
 * Charm, the daily.dev mascot.
 *
 * The dog and the developer are the most recognisable thing the brand owns,
 * and a recap frame is exactly the kind of emotional moment they were drawn
 * for. Used sparingly and placed low: at this size Charm is brand texture, and
 * a frame that leads with the mascot instead of the insight has the hierarchy
 * backwards.
 *
 * URLs copied from `packages/shared/src/lib/image.ts`.
 */
export const charmArt = {
  noComments:
    'https://media.daily.dev/image/upload/s--9T4IIRt7--/f_auto,q_auto/v1781528637/public/daily.dev%20Charm%20-%20no%20comment',
  bookmarks:
    'https://media.daily.dev/image/upload/s--LnFPuTT7--/f_auto,q_auto/v1781528637/public/daily.dev%20Charm%20-%20bookmark',
  searchNoResults:
    'https://media.daily.dev/image/upload/s--HZdPG0L1--/f_auto,q_auto/v1781528637/public/daily.dev%20Charm%20-%20no%20seach%20result',
  readLater:
    'https://media.daily.dev/image/upload/s--RGUXYEF---/f_auto,q_auto/v1781528637/public/daily.dev%20Charm%20-%20Read%20later',
  emptyProfile:
    'https://media.daily.dev/image/upload/s--ulSOVWbq--/f_auto,q_auto/v1781528637/public/daily.dev%20Charm%20-%20empty%20profile',
  emptySquads:
    'https://media.daily.dev/image/upload/s--J9OZk_3w--/f_auto,q_auto/v1781528637/public/daily.dev%20Charm%20-%20empty%20squads',
  inviteFriends:
    'https://media.daily.dev/image/upload/s--RaAyR83N--/f_auto,q_auto/v1781528637/public/daily.dev%20Charm%20-%20Invite%20friends',
  noPosts:
    'https://media.daily.dev/image/upload/s--JbsZvCUt--/f_auto,q_auto/v1781528637/public/daily.dev%20Charm%20-%20no%20post',
} as const;


/**
 * The Game Center hero treatment, copied from `LevelHud`.
 *
 * The trick is the directional scrim: a wash that is nearly opaque on the left
 * where the type sits and fades to almost nothing on the right where the art
 * should show. Laying type over unmodified artwork and hoping is what makes
 * hero panels illegible.
 */
export const HERO_PANEL = {
  color: '#2A0B3D',
  scrim:
    'linear-gradient(100deg, rgba(42,11,61,0.94) 0%, rgba(42,11,61,0.70) 42%, rgba(42,11,61,0.42) 100%)',
} as const;

/**
 * Frosted glass, also from `LevelHud`. Far brighter than a low-alpha fill:
 * a white gradient wash and a genuinely visible white border are what make
 * the panel behind it show through as glass rather than as a tint.
 */
export const GLASS = {
  fill: 'linear-gradient(145deg, rgba(255,255,255,0.42), rgba(255,255,255,0.10))',
  border: '1px solid rgba(255,255,255,0.45)',
} as const;
