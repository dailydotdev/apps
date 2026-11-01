// Fictional developers and companies for the leaderboard pages. Avatars
// are daily.dev's generic placeholders, never real users.

export type Range = 'week' | 'month' | 'all';

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
  title: string;
  /** Short name for chips and tabs. */
  short: string;
  /** The unit after the number: "1,204 rep". */
  unit: string;
  /** One line on what moves this number. */
  howTo: string;
  /** Where the next step lives on daily.dev. */
  cta: string;
}

const BOARDS: Board[] = [
  {
    id: 'reputation',
    title: 'Highest reputation',
    short: 'Reputation',
    unit: 'rep',
    howTo: 'Earn reputation when people upvote your posts and comments.',
    cta: 'Write a comment',
  },
  {
    id: 'level',
    title: 'Highest level',
    short: 'Level',
    unit: 'XP',
    howTo: 'Complete daily and weekly quests to earn XP and level up.',
    cta: 'Open quests',
  },
  {
    id: 'streak',
    title: 'Longest streak',
    short: 'Streak',
    unit: 'days',
    howTo: 'Read at least one post a day to keep your streak going.',
    cta: 'Read a post',
  },
  {
    id: 'upvotes',
    title: 'Most upvoted',
    short: 'Upvotes',
    unit: 'upvotes',
    howTo: 'Share posts and write comments other developers upvote.',
    cta: 'Share a post',
  },
  {
    id: 'views',
    title: 'Highest post views',
    short: 'Post views',
    unit: 'views',
    howTo: 'Post in squads. Views count across everything you share.',
    cta: 'Post in a squad',
  },
  {
    id: 'readingDays',
    title: 'Most reading days',
    short: 'Reading days',
    unit: 'days',
    howTo: 'Every day you read at least one post adds a reading day.',
    cta: 'Read a post',
  },
  {
    id: 'referrals',
    title: 'Most referrals',
    short: 'Referrals',
    unit: 'referrals',
    howTo: 'Invite developer friends. Each signup counts once.',
    cta: 'Invite friends',
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
  country: string;
  tags: string[];
  level: number;
  joinedDaysAgo: number;
  isFollowing: boolean;
  isMe?: boolean;
  /** Per board and range. */
  scores: Record<BoardId, Record<Range, number>>;
  /** Places moved since last week, per board (positive is up). */
  delta: Record<BoardId, number>;
  /** Seven weekly totals, oldest first, for sparklines. */
  trend: number[];
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

const COUNTRIES = [
  'United States',
  'India',
  'Germany',
  'Brazil',
  'Israel',
  'Nigeria',
  'Japan',
  'Poland',
];

const TAGS = [
  'react',
  'rust',
  'kubernetes',
  'ai',
  'typescript',
  'golang',
  'devops',
  'python',
  'security',
  'webdev',
  'postgres',
  'career',
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
    const max = ALL_TIME_MAX[board];
    // All-time follows seniority; week and month are far more open.
    const all = Math.round(max * rankBias * (0.55 + random() * 0.45));
    const capWeek =
      board === 'streak' || board === 'readingDays' ? 7 : max / 120;
    const capMonth =
      board === 'streak' || board === 'readingDays' ? 30 : max / 30;
    scores[board] = {
      all,
      month: Math.max(0, Math.round(capMonth * (0.15 + random() * 0.85))),
      week: Math.max(0, Math.round(capWeek * (0.1 + random() * 0.9))),
    };
  });
  return scores;
};

export const DEVS: Dev[] = NAMES.map((name, index) => {
  const bias = 1 - index / (NAMES.length + 6);
  const username = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z]/g, '');
  const tags = [pick(TAGS), pick(TAGS), pick(TAGS)].filter(
    (tag, i, list) => list.indexOf(tag) === i,
  );
  const delta = {} as Dev['delta'];
  (Object.keys(ALL_TIME_MAX) as BoardId[]).forEach((board) => {
    delta[board] = random() < 0.3 ? 0 : between(-6, 9);
  });
  return {
    id: `dev-${index}`,
    name,
    username,
    image: avatar(index),
    bio: pick(BIOS),
    company: pick(COMPANIES),
    country: pick(COUNTRIES),
    tags,
    level: Math.max(3, Math.round(60 * bias - random() * 8)),
    joinedDaysAgo: index > 32 ? between(9, 80) : between(200, 2400),
    isFollowing: random() < 0.22,
    scores: makeScores(bias),
    delta,
    trend: Array.from({ length: 7 }, () => between(20, 100)),
  };
});

/**
 * How the signed-in reader appears outside the page, on a share image. The
 * page says "You"; production fills this from the logged-in user's profile.
 */
export const ME_PROFILE = { name: 'Noa Levi', handle: 'noalevi' };

/** The signed-in reader: mid-table all-time, close to the top this week. */
export const ME: Dev = {
  id: 'me',
  name: 'You',
  username: 'you',
  image: avatar(4),
  bio: 'Backend developer. Reading daily.dev with my morning coffee.',
  company: 'Northwind',
  country: 'Israel',
  tags: ['golang', 'postgres', 'devops'],
  level: 18,
  joinedDaysAgo: 140,
  isFollowing: false,
  isMe: true,
  scores: {
    reputation: { all: 3120, month: 980, week: 300 },
    level: { all: 6100, month: 520, week: 60 },
    streak: { all: 46, month: 30, week: 7 },
    upvotes: { all: 1410, month: 610, week: 230 },
    views: { all: 88000, month: 41000, week: 17800 },
    readingDays: { all: 121, month: 27, week: 7 },
    referrals: { all: 6, month: 2, week: 1 },
  },
  delta: {
    reputation: 14,
    level: 3,
    streak: 0,
    upvotes: 22,
    views: 5,
    readingDays: 1,
    referrals: -2,
  },
  trend: [22, 30, 28, 45, 52, 61, 74],
};

const EVERYONE = [...DEVS, ME];

export interface Entry {
  rank: number;
  dev: Dev;
  score: number;
  delta: number;
}

export const rankBoard = (
  board: BoardId,
  range: Range,
  pool: Dev[] = EVERYONE,
): Entry[] =>
  [...pool]
    .sort((a, b) => b.scores[board][range] - a.scores[board][range])
    .map((dev, index) => ({
      rank: index + 1,
      dev,
      score: dev.scores[board][range],
      delta: dev.delta[board],
    }));

export const myEntry = (board: BoardId, range: Range, pool?: Dev[]): Entry =>
  rankBoard(board, range, pool).find((e) => e.dev.isMe) as Entry;

interface Company {
  id: string;
  name: string;
  verified: number;
  delta: number;
  /** A Verified Company Squad, when the company runs one. */
  squad?: { handle: string; members: number; brand: string };
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
  delta: between(-2, 3),
  squad:
    index % 3 === 2
      ? undefined
      : {
          handle: name.toLowerCase().replace(/[^a-z]/g, ''),
          members: between(400, 9000),
          brand: SQUAD_BRANDS[index % SQUAD_BRANDS.length],
        },
})).sort((a, b) => b.verified - a.verified);

/** The Plus referral ladder: friends who signed up unlock Plus. */
export const REFERRAL_LADDER = [
  { friends: 1, months: 1, reward: '1 month of Plus' },
  { friends: 2, months: 3, reward: '3 months of Plus' },
  { friends: 3, months: 12, reward: '1 year of Plus' },
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
