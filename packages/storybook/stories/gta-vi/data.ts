import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import type {
  Achievement,
  UserAchievement,
} from '@dailydotdev/shared/src/graphql/user/achievements';
import { AchievementType } from '@dailydotdev/shared/src/graphql/user/achievements';
import awardArt from './assets/award-gta-vi.webp';
import viceCityArt from './assets/achievement-vice-city.webp';
import readOnGtaDayArt from './assets/achievement-read-on-gta-day.webp';

/*
 * The GTA VI launch beyond the streak (see stories/streak/gtaViParts.tsx):
 * a free award, two event achievements and an opt-in home theme. Everything
 * here is data; the award catalog and the shelf's other achievements are
 * copied from production (the `products` and `achievements` queries,
 * 2026-11-10).
 */

export const GTA_VI_RELEASE_DAY = '2026-11-19';
export const GTA_VI_RELEASE_AT = `${GTA_VI_RELEASE_DAY}T12:00:00.000Z`;

/* ---------------------------------------------------------------- award */

const media = (path: string): string =>
  `https://media.daily.dev/image/upload/${path}`;

const award = (
  id: string,
  name: string,
  image: string,
  value: number,
): Product => ({ id, type: 'award', name, image, value });

export const gtaViAward: Product = {
  id: 'gta-vi-award',
  type: 'award',
  name: 'Vice City',
  image: awardArt,
  value: 0,
  flags: { description: 'Vice City', imageGlow: awardArt },
};

export const productionAwards: Product[] = [
  award(
    'a39d7368',
    'Smiley Face',
    media('s--Ft4p9rjO--/f_auto/v1743664345/public/happy'),
    10,
  ),
  award(
    'ef2e2633',
    'Laughing Face',
    media('s--THFmDVKR--/f_auto/v1743664345/public/Lol'),
    25,
  ),
  award(
    '8aeb45ce',
    'Heart',
    media('s--IPWhKcis--/f_auto/v1743664345/public/Love'),
    50,
  ),
  award(
    '352f1e07',
    'Coffee Mug',
    media('s--aenMzSPZ--/f_auto/v1743664347/public/Coffee'),
    75,
  ),
  award(
    '1b536ed1',
    'Star',
    media('s--PdFJ22B8--/f_auto/v1743664345/public/Star'),
    100,
  ),
  award(
    '17432ba4',
    'Hot Dog',
    media('s--zOtftlFL--/f_auto/v1743664345/public/hotDog'),
    125,
  ),
  award(
    '1ab1bc67',
    'Pizza',
    media('s--n35mhpLB--/f_auto/v1743664345/public/Pizza'),
    150,
  ),
  award(
    'c0d239b9',
    'Stash of Cash',
    media('s--7SPVvVPK--/f_auto/v1743664345/public/Cash'),
    250,
  ),
  award(
    '8c0257d7',
    'Balloon Brackets',
    media('s--eJMxq8lw--/f_auto/v1747300201/public/Curly%20Brackets'),
    300,
  ),
  award(
    '0951d2c8',
    'Terminal',
    media('s--KBzEqo01--/f_auto/v1743664345/public/Terminal'),
    400,
  ),
  award(
    '7bd171f2',
    'Rubber Duck',
    media('s--Q65Srvfv--/f_auto/v1743664345/public/Duck'),
    600,
  ),
  award(
    '5efc4400',
    'Robotic Bug',
    media('s--wJzQYBN0--/f_auto/v1747300201/public/Bug'),
    750,
  ),
  award(
    '57c82004',
    'Gaming Controller',
    media('s--IMOkH2qD--/f_auto/v1747300201/public/Controller'),
    900,
  ),
  award(
    'e9dab194',
    'Keyboard',
    media('s--ezX7VAyg--/f_auto/v1743664345/public/Keyboard'),
    1200,
  ),
  award(
    '9d2131e8',
    'Shady Hacker',
    media('s--UvWxsXT5--/f_auto/v1747300201/public/Hacker'),
    1500,
  ),
];

export const receiver = { name: 'nerdalytics', username: 'nerdalytics' };

/* --------------------------------------------------------- achievements */

export type GtaViAchievementKind = 'free' | 'rare';

export interface GtaViAchievement extends Achievement {
  /** Event achievements carry their own chip instead of the rarity one. */
  event: GtaViAchievementKind;
}

export const viceCityAchievement: GtaViAchievement = {
  id: 'gta-vi-made-it',
  name: 'Made It to Vice City',
  description: 'You survived the wait. Now go make some memories.',
  image: viceCityArt,
  type: AchievementType.Instant,
  criteria: { targetCount: 1 },
  xp: 10,
  rarity: null,
  unit: null,
  event: 'free',
};

export const readOnGtaDayAchievement: GtaViAchievement = {
  id: 'gta-vi-still-read',
  name: 'Still Read on GTA VI Day',
  description:
    'While the world was in Vice City, you still made time to read. Respect.',
  image: readOnGtaDayArt,
  type: AchievementType.Instant,
  criteria: { targetCount: 1 },
  xp: 25,
  rarity: null,
  unit: null,
  event: 'rare',
};

const achievement = (
  name: string,
  description: string,
  image: string,
  targetCount: number,
  rarity: number,
): Achievement => ({
  id: name,
  name,
  description,
  image,
  type: AchievementType.Milestone,
  criteria: { targetCount },
  xp: 10,
  rarity,
  unit: null,
});

const owned = (
  item: Achievement,
  progress: number,
  unlockedAt: string | null = null,
): UserAchievement => ({
  achievement: item,
  progress,
  unlockedAt,
  createdAt: null,
  updatedAt: null,
});

/** The reader's shelf as production orders it: in progress, then rarest. */
export const productionShelf: UserAchievement[] = [
  owned(
    achievement(
      'On the path',
      'Complete 50 quests',
      media('s--iwqvFWLT--/q_auto/v1773743172/achievements/on_the_path'),
      50,
      0.21,
    ),
    46,
  ),
  owned(
    achievement(
      'Committed',
      'Reach a 50-day reading streak',
      media('v1770222887/achievements/Comitted.png'),
      50,
      1.69,
    ),
    38,
  ),
  owned(
    achievement(
      'Hero',
      'Complete 100 quests',
      media('s--5WqXv9y7--/q_auto/v1773743176/achievements/heros_quest'),
      100,
      0.12,
    ),
    46,
  ),
  owned(
    achievement(
      'I took "daily dev" literally',
      'Reach a 365-day reading streak',
      media('v1770224984/achievements/I_took_dailydev_literally.png'),
      365,
      0.25,
    ),
    38,
  ),
  owned(
    achievement(
      "Can't spend it all",
      'Spend 10000 Cores',
      media('s--_MjhSTze--/q_auto/v1773608417/achievements/cant_spend_it_all'),
      10000,
      0.01,
    ),
    10000,
    '2026-06-23T10:00:00.000Z',
  ),
  owned(
    achievement(
      'In the big league',
      'Reach 10,000 reputation',
      media('v1770222928/achievements/In_the_big_league.png'),
      10000,
      0.05,
    ),
    10000,
    '2026-02-11T10:00:00.000Z',
  ),
  owned(
    achievement(
      'Organized',
      'Create a bookmark folder',
      media('v1770222923/achievements/Organized.png'),
      1,
      0.08,
    ),
    1,
    '2026-02-11T10:00:00.000Z',
  ),
  owned(
    achievement(
      'True chad',
      'Receive 1000 upvotes',
      media('v1770222934/achievements/True_chad.png'),
      1000,
      0.1,
    ),
    1000,
    '2026-04-28T10:00:00.000Z',
  ),
  owned(
    achievement(
      'Coraholic',
      'Spend 1000 Cores',
      media('s--SNnLKKWe--/q_auto/v1773608419/achievements/coraholic'),
      1000,
      0.12,
    ),
    1000,
    '2026-03-16T10:00:00.000Z',
  ),
  owned(
    achievement(
      'Poll it',
      'Create a poll',
      media('s--J20Dc3CL--/q_auto/v1773608418/achievements/poll_it'),
      1,
      0.13,
    ),
    1,
    '2026-05-02T10:00:00.000Z',
  ),
  owned(
    achievement(
      'Altruistic',
      'Give your first award',
      media('s--bwQRPWPt--/q_auto/v1770802226/achievements/altruistic.png'),
      1,
      0.41,
    ),
    1,
    '2026-03-04T10:00:00.000Z',
  ),
  owned(
    achievement(
      'Prophet',
      'Reach 100 followers',
      media('v1770222920/achievements/Prophet.png'),
      100,
      0.21,
    ),
    100,
    '2026-07-19T10:00:00.000Z',
  ),
  owned(
    achievement(
      'Curator',
      'Have 10 different shared links clicked',
      media('v1770222887/achievements/Curator.png'),
      10,
      0.44,
    ),
    10,
    '2026-08-07T10:00:00.000Z',
  ),
];

/**
 * Where the reader stands against release day: before it, on it before and
 * after their first read, and after it with or without that read.
 */
export type GtaViMoment =
  | 'before'
  | 'releaseNotRead'
  | 'releaseRead'
  | 'afterRead'
  | 'afterMissed';

/** The event achievements first, then production's shelf, per moment. */
export const getShelf = (moment: GtaViMoment): UserAchievement[] => {
  const unlockedViceCity = owned(viceCityAchievement, 1, GTA_VI_RELEASE_AT);
  const event: Record<GtaViMoment, UserAchievement[]> = {
    // Nothing before release: the surprise is on the day.
    before: [],
    releaseNotRead: [unlockedViceCity, owned(readOnGtaDayAchievement, 0)],
    releaseRead: [
      unlockedViceCity,
      owned(readOnGtaDayAchievement, 1, GTA_VI_RELEASE_AT),
    ],
    afterRead: [
      unlockedViceCity,
      owned(readOnGtaDayAchievement, 1, GTA_VI_RELEASE_AT),
    ],
    // The day is gone, so the read can't be earned any more: it leaves.
    afterMissed: [unlockedViceCity],
  };
  return [...event[moment], ...productionShelf].slice(0, 15);
};
