import type { LeaderboardType } from '../graphql/leaderboard';
import { leaderboardTypeToTitle } from '../graphql/leaderboard';
import { webappUrl } from './constants';

// A leaderboard's public permalink — the same URL the directory card links to,
// so a shared rank always lands on the board the rank was earned on.
export const getLeaderboardUrl = (type: LeaderboardType): string =>
  `${webappUrl}users/${type}`;

export const getLeaderboardShareText = (type: LeaderboardType): string => {
  const title = leaderboardTypeToTitle[type].toLowerCase();

  return `Top developers by ${title} on daily.dev`;
};

const TOP_TIER_RANK = 3;

// Pre-filled text for "share my rank". Deliberately understated — a share sheet
// full of superlatives reads like a template, not like a developer.
export const getLeaderboardRankShareText = (
  type: LeaderboardType,
  rank: number,
): string => {
  const title = leaderboardTypeToTitle[type].toLowerCase();
  const board = `the daily.dev ${title} leaderboard`;

  if (rank <= TOP_TIER_RANK) {
    return `Somehow I'm #${rank} on ${board}. Come take the spot.`;
  }

  return `I'm #${rank} on ${board}. Still climbing.`;
};
