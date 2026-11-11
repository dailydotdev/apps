// Fictional developers and companies for the leaderboard pages. Avatars
// are daily.dev's generic placeholders, never real users.

import type { ReferralLadderStep } from '@dailydotdev/shared/src/graphql/users';

export type BoardId =
  | 'reputation'
  | 'level'
  | 'streak'
  | 'upvotes'
  | 'views'
  | 'readingDays'
  | 'referrals';

export interface Board {
  id: BoardId;
  /** Short name for chips and tabs. */
  short: string;
  /** The unit after the number: "1,204 rep". */
  unit: string;
  /** One line on what moves this number. */
  howTo: string;
}

const BOARDS: Board[] = [
  {
    id: 'reputation',
    short: 'Reputation',
    unit: 'rep',
    howTo: 'Earn reputation when people upvote your posts and comments.',
  },
  {
    id: 'level',
    short: 'Level',
    unit: 'XP',
    howTo: 'Complete daily and weekly quests to earn XP and level up.',
  },
  {
    id: 'streak',
    short: 'Streak',
    unit: 'days',
    howTo: 'Read at least one post a day to keep your streak going.',
  },
  {
    id: 'upvotes',
    short: 'Upvotes',
    unit: 'upvotes',
    howTo: 'Share posts and write comments other developers upvote.',
  },
  {
    id: 'views',
    short: 'Post views',
    unit: 'views',
    howTo: 'Post in squads. Views count across everything you share.',
  },
  {
    id: 'readingDays',
    short: 'Reading days',
    unit: 'days',
    howTo: 'Every day you read at least one post adds a reading day.',
  },
  {
    id: 'referrals',
    short: 'Referrals',
    unit: 'referrals',
    howTo: 'Invite developer friends. Each signup counts once.',
  },
];

export const boardById = (id: BoardId): Board =>
  BOARDS.find((board) => board.id === id) as Board;

export interface Dev {
  id: string;
  name: string;
  username: string;
  image: string;
  bio: string;
  company: string;
  joinedDaysAgo: number;
  isFollowing: boolean;
  isMe?: boolean;
  /** All-time score per board: production's boards have no other range. */
  scores: Record<BoardId, number>;
}

const NAMES = [
  'Maya Okafor',
  'Lior Ben-Ami',
  'Tomás Ribeiro',
  'Aiko Tanaka',
  'Jonas Lindqvist',
  'Priya Raman',
  'Mateo Alvarez',
  'Hana Kowalski',
  'Dev Mehta',
  'Sofia Marchetti',
  'Kwame Asante',
  'Elif Demir',
  'Noah Fischer',
  'Yara Haddad',
  'Ivan Petrov',
  'Chloé Laurent',
  'Arjun Nair',
  'Mila Novak',
  'Omar Farouk',
  'Lena Vogel',
  'Ravi Shankar',
  'Inês Costa',
  'Felix Braun',
  'Zara Ahmed',
  'Kenji Mori',
  'Ana Popescu',
  'Samuel Adeyemi',
  'Freya Olsen',
  'Diego Moreno',
  'Nadia Rahman',
  'Leo Hartmann',
  'Amara Diallo',
  'Erik Johansson',
  'Tara Singh',
  'Paulo Mendes',
  'Ivy Chen',
  'Hugo Lefèvre',
  'Salma Nasser',
  'Ben Carter',
  'Rina Sato',
  'Mikael Berg',
  'Fatima Zahra',
  'Owen Hughes',
  'Lucía Romero',
  'Daniel Kim',
  'Amara Okoye',
  'Jakub Novak',
  'Sana Malik',
  'Mateus Costa',
  'Yuki Nakamura',
  'Elena Petrova',
  'Kofi Mensah',
  'Ingrid Larsen',
];

const BIOS = [
  'Staff engineer. Distributed systems and too much coffee.',
  'Frontend at heart. Writing about React and the web platform.',
  'Platform engineer. Kubernetes by day, Rust by night.',
  'Building developer tools. Open source maintainer.',
  'Mobile dev turned backend. Postgres enthusiast.',
  'ML engineer shipping models to production.',
  'Security researcher. Breaking things politely.',
  'Indie hacker. Shipping small SaaS products.',
  'DevRel. I read everything so you don’t have to.',
  'Full-stack. TypeScript everywhere.',
];

const COMPANIES = [
  'Northwind',
  'Acme Cloud',
  'Globex',
  'Initech',
  'Umbrella Labs',
  'Hooli',
  'Stark Systems',
  'Pied Piper',
];

// Seeded so every render, and every screenshot, shows the same board.
let seed = 7;
const random = (): number => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const between = (min: number, max: number): number =>
  Math.round(min + random() * (max - min));
const pick = <T>(list: T[]): T => list[Math.floor(random() * list.length)];

const avatar = (index: number): string =>
  `https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/${
    (index % 8) + 1
  }`;

const ALL_TIME_MAX: Record<BoardId, number> = {
  reputation: 48000,
  level: 21000,
  streak: 1400,
  upvotes: 32000,
  views: 2400000,
  readingDays: 1900,
  referrals: 420,
};

const makeScores = (rankBias: number): Dev['scores'] => {
  const scores = {} as Dev['scores'];
  (Object.keys(ALL_TIME_MAX) as BoardId[]).forEach((board) => {
    scores[board] = Math.round(
      ALL_TIME_MAX[board] * rankBias * (0.55 + random() * 0.45),
    );
  });
  return scores;
};

export const DEVS: Dev[] = NAMES.map((name, index) => {
  const bias = 1 - index / (NAMES.length + 6);
  const username = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z]/g, '');
  const scores = makeScores(bias);
  // A streak is consecutive reading days, so it never beats the total.
  scores.readingDays = Math.max(
    scores.readingDays,
    scores.streak + between(0, 200),
  );
  return {
    id: `dev-${index}`,
    name,
    username,
    image: avatar(index),
    bio: pick(BIOS),
    company: pick(COMPANIES),
    // Never newer than their reading days, which can't predate the account.
    joinedDaysAgo: Math.max(
      index > 32 ? between(9, 80) : between(200, 2400),
      scores.readingDays + between(10, 120),
    ),
    isFollowing: random() < 0.22,
    scores,
  };
});

/**
 * How the signed-in reader appears outside the page, on a share image. The
 * page says "You"; production fills this from the logged-in user's profile.
 */
export const ME_PROFILE = { name: 'Noa Levi', handle: 'noalevi' };

/** The signed-in reader: mid-table. */
export const ME: Dev = {
  id: 'me',
  name: 'You',
  username: 'you',
  image: avatar(4),
  bio: 'Backend developer. Reading daily.dev with my morning coffee.',
  company: 'Northwind',
  joinedDaysAgo: 140,
  isFollowing: false,
  isMe: true,
  scores: {
    reputation: 3120,
    level: 6100,
    streak: 46,
    upvotes: 1410,
    views: 88000,
    readingDays: 121,
    referrals: 6,
  },
};

const EVERYONE = [...DEVS, ME];

export interface Entry {
  rank: number;
  dev: Dev;
  score: number;
}

export const rankBoard = (board: BoardId, pool: Dev[] = EVERYONE): Entry[] =>
  [...pool]
    .sort((a, b) => b.scores[board] - a.scores[board])
    .map((dev, index) => ({
      rank: index + 1,
      dev,
      score: dev.scores[board],
    }));

export const myEntry = (board: BoardId): Entry =>
  rankBoard(board).find((e) => e.dev.isMe) as Entry;

interface Company {
  id: string;
  name: string;
  verified: number;
  /** A Verified Company Squad, when the company runs one. */
  squad?: { brand: string };
}

// Brand colors stay on accent tokens so they follow the theme.
const SQUAD_BRANDS = [
  'bg-accent-cabbage-default',
  'bg-accent-water-default',
  'bg-accent-avocado-default',
  'bg-accent-bacon-default',
];

export const COMPANY_BOARD: Company[] = COMPANIES.map((name, index) => ({
  id: `co-${index}`,
  name,
  verified: Math.round(1800 / (index + 1.4)),
  squad:
    index % 3 === 2
      ? undefined
      : { brand: SQUAD_BRANDS[index % SQUAD_BRANDS.length] },
})).sort((a, b) => b.verified - a.verified);

/**
 * The Plus referral ladder in REFERRAL_LADDER_QUERY's shape: friends who
 * signed up (`invites`) unlock Plus. Production serves the steps.
 */
export const REFERRAL_LADDER: Pick<ReferralLadderStep, 'invites' | 'months'>[] =
  [
    { invites: 1, months: 1 },
    { invites: 2, months: 3 },
    { invites: 3, months: 12 },
  ];

export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 10000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return value.toLocaleString('en-US');
};

/** "1 day", "2 days": units are stored plural. */
export const unitFor = (value: number, unit: string): string =>
  value === 1 && unit.endsWith('s') ? unit.slice(0, -1) : unit;
