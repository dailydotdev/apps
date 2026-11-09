import {
  isLeaderboardPositionSupported,
  LeaderboardType,
} from '../../graphql/leaderboard';
import { largeNumberFormat } from '../../lib/numberFormat';
import { pluralize } from '../../lib/strings';

export interface LeaderboardBoard {
  type: LeaderboardType;
  /** What the rank card's picker says on phones, where the title is too long. */
  short: string;
  /** The unit after a score, stored plural: "1,204 days". */
  unit: string;
  /** The Standouts card's label over the board's #1. */
  eyebrow: string;
  /** One line on what moves this number, for a reader with no rank yet. */
  howTo: string;
}

/** /users' people boards, in its order; Most verified employees closes the grid. */
export const LEADERBOARD_BOARDS: LeaderboardBoard[] = [
  {
    type: LeaderboardType.HighestLevel,
    short: 'Level',
    unit: 'XP',
    eyebrow: 'Highest level',
    howTo: 'Complete daily and weekly quests to earn XP and level up.',
  },
  {
    type: LeaderboardType.HighestReputation,
    short: 'Reputation',
    unit: 'rep',
    eyebrow: 'Highest reputation',
    howTo: 'Earn reputation when people upvote your posts and comments.',
  },
  {
    type: LeaderboardType.LongestStreak,
    short: 'Streak',
    unit: 'days',
    eyebrow: 'Longest streak',
    howTo: 'Read at least one post a day to keep your streak going.',
  },
  {
    type: LeaderboardType.HighestPostViews,
    short: 'Post views',
    unit: 'views',
    eyebrow: 'Most post views',
    howTo: 'Post in squads. Views count across everything you share.',
  },
  {
    type: LeaderboardType.MostUpvoted,
    short: 'Upvotes',
    unit: 'upvotes',
    eyebrow: 'Most upvoted',
    howTo: 'Share posts and write comments other developers upvote.',
  },
  {
    type: LeaderboardType.MostReferrals,
    short: 'Referrals',
    unit: 'referrals',
    eyebrow: 'Top referrer',
    howTo: 'Invite developer friends. Each signup counts once.',
  },
  {
    type: LeaderboardType.MostReadingDays,
    short: 'Reading days',
    unit: 'days',
    eyebrow: 'Most reading days',
    howTo: 'Every day you read at least one post adds a reading day.',
  },
];

/** The boards leaderboardPosition can rank you on, in the page's order. */
export const LEADERBOARD_POSITION_BOARDS = LEADERBOARD_BOARDS.filter((board) =>
  isLeaderboardPositionSupported(board.type),
);

/** Rows on a board tile; your row takes the last one where you are ranked. */
export const LEADERBOARD_TILE_ROWS = 4;

export const getLeaderboardBoard = (type: LeaderboardType): LeaderboardBoard =>
  LEADERBOARD_BOARDS.find((board) => board.type === type) as LeaderboardBoard;

export const formatLeaderboardScore = (score: number): string =>
  score < 10000
    ? score.toLocaleString('en-US')
    : (largeNumberFormat(score) ?? score.toString());

/** "1 day", "2 days", "480 XP": units are stored plural. */
export const formatLeaderboardUnit = (score: number, unit: string): string =>
  unit.endsWith('s') ? pluralize(unit.slice(0, -1), score) : unit;

export const formatLeaderboardScoreWithUnit = (
  type: LeaderboardType,
  score: number,
): string =>
  `${formatLeaderboardScore(score)} ${formatLeaderboardUnit(
    score,
    getLeaderboardBoard(type).unit,
  )}`;

export const formatLeaderboardRank = (rank: number): string =>
  `#${rank.toLocaleString('en-US')}`;

/** Past the counted range leaderboardPosition has no rank, only the cap. */
export const formatLeaderboardCap = (cappedAt: number): string =>
  `${formatLeaderboardScore(cappedAt)}+`;
