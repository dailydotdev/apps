/**
 * Shared utilities for Log card primitives
 * Extracted to ensure consistency between interactive and static card components
 */

import type { ReactElement } from 'react';
import {
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { LogData } from '../../../types/log';

/**
 * Format hour number to human-readable time string
 * @example formatHour(0) => '12 AM'
 * @example formatHour(13) => '1 PM'
 */
export function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) {
    return '12 AM';
  }
  if (hour === 12) {
    return '12 PM';
  }
  if (hour < 12) {
    return `${hour} AM`;
  }
  return `${hour - 12} PM`;
}

/**
 * Banner text configuration for reading patterns
 */
export const PATTERN_BANNER_TEXT: Record<
  LogData['readingPattern'],
  { preText: string; postText: string; shareText: string }
> = {
  night: {
    preText: 'ONLY',
    postText: 'READ THIS LATE',
    shareText: 'Only {percentile}% of devs read this late',
  },
  early: {
    preText: 'ONLY',
    postText: 'START THIS EARLY',
    shareText: 'Only {percentile}% of devs start this early',
  },
  afternoon: {
    preText: 'TOP',
    postText: 'AFTERNOON READER',
    shareText: 'Top {percentile}% afternoon reader',
  },
};

/**
 * Check if percentile banner should be shown
 * Only show for users in top 50% (lower percentile = better ranking)
 */
export function shouldShowPercentileBanner(
  percentile: number | null | undefined,
): boolean {
  return percentile != null && percentile <= 50;
}

/**
 * Podium configuration constants
 */
export const PODIUM_MEDALS = ['🥈', '🥇', '🥉'] as const;
export const PODIUM_HEIGHTS_INTERACTIVE = [100, 140, 70] as const; // For mobile cards
export const PODIUM_HEIGHTS_STATIC = [180, 240, 140] as const; // For share images
export const PODIUM_DELAYS = [0.6, 0.3, 0.9] as const; // 1st place reveals last for drama

/**
 * Get podium rank from display index
 * Display order is [2nd, 1st, 3rd] but we need actual ranks
 */
export function getPodiumRank(displayIndex: number): number {
  const rankMap = [2, 1, 3];
  return rankMap[displayIndex];
}

/**
 * Community engagement stat configuration
 */
export interface EngagementStat {
  label: string;
  value: number | undefined;
  icon: ReactElement;
}

/**
 * Find the best (lowest) percentile stat for community engagement
 * Only returns stats where user is in top 50%
 */
export function findBestEngagementStat(data: {
  upvotePercentile?: number;
  commentPercentile?: number;
  bookmarkPercentile?: number;
  iconSize?: IconSize;
}): EngagementStat | undefined {
  const size = data.iconSize ?? IconSize.Large;

  const stats: EngagementStat[] = [
    {
      label: 'UPVOTERS',
      value: data.upvotePercentile,
      icon: UpvoteIcon({
        secondary: true,
        size,
        className: 'text-action-upvote-default',
      }),
    },
    {
      label: 'COMMENTERS',
      value: data.commentPercentile,
      icon: DiscussIcon({
        secondary: true,
        size,
        className: 'text-action-comment-default',
      }),
    },
    {
      label: 'CURATORS',
      value: data.bookmarkPercentile,
      icon: BookmarkIcon({
        secondary: true,
        size,
        className: 'text-action-bookmark-default',
      }),
    },
  ]
    .filter((s) => s.value !== undefined && s.value <= 50)
    .sort((a, b) => (a.value || 100) - (b.value || 100));

  return stats[0];
}

/**
 * Normalize hour distribution for bar chart visualization
 * Returns values scaled to 0-1 range where the max value becomes 1
 *
 * The activityHeatmap is a 24-element array of floats that sum to 1,
 * representing the distribution of reading activity across hours.
 */
export function normalizeHourDistribution(activityHeatmap: number[]): number[] {
  const maxValue = Math.max(...activityHeatmap, 0.001);
  return activityHeatmap.map((value) => value / maxValue);
}

/**
 * Calculate clock hand angle from hour
 * Returns degrees for CSS transform rotation
 */
export function calculateClockAngle(hour: number): number {
  return (hour % 12) * 30 - 90;
}
