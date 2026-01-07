import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import {
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { LogData } from '../../types/log';

/**
 * Engagement stat configuration for bestPercentileStat calculation
 */
export interface EngagementStat {
  /** Display label for the stat */
  label: string;
  /** Percentile value (lower is better) */
  value: number | undefined;
  /** Icon to display */
  icon: ReactNode;
}

/**
 * Data shape required for engagement percentile calculation
 */
export type EngagementPercentileData = Pick<
  LogData,
  'upvotePercentile' | 'commentPercentile' | 'bookmarkPercentile'
>;

/**
 * Hook to find the best engagement percentile stat for display
 *
 * Returns the stat with the lowest percentile value (best performer),
 * filtered to only include stats in the top 50%.
 *
 * @param data - Object containing upvotePercentile, commentPercentile, bookmarkPercentile
 * @param iconSize - Size of the icon to render (default: Large for dynamic, XXXLarge for static)
 * @returns The best performing stat or undefined if none qualify
 *
 * @example
 * ```tsx
 * const bestStat = useBestPercentileStat({
 *   upvotePercentile: 15,
 *   commentPercentile: 25,
 *   bookmarkPercentile: 8,
 * });
 *
 * // Returns: { label: 'CURATORS', value: 8, icon: <BookmarkIcon /> }
 * ```
 */
export function useBestPercentileStat(
  data: EngagementPercentileData,
  iconSize: IconSize = IconSize.Large,
): EngagementStat | undefined {
  return useMemo(() => {
    const stats: EngagementStat[] = [
      {
        label: 'UPVOTERS',
        value: data.upvotePercentile,
        icon: React.createElement(UpvoteIcon, {
          secondary: true,
          size: iconSize,
          className: 'text-action-upvote-default',
        }),
      },
      {
        label: 'COMMENTERS',
        value: data.commentPercentile,
        icon: React.createElement(DiscussIcon, {
          secondary: true,
          size: iconSize,
          className: 'text-action-comment-default',
        }),
      },
      {
        label: 'CURATORS',
        value: data.bookmarkPercentile,
        icon: React.createElement(BookmarkIcon, {
          secondary: true,
          size: iconSize,
          className: 'text-action-bookmark-default',
        }),
      },
    ];

    // Filter to stats in top 50% and sort by percentile (lower is better)
    const qualifyingStats = stats
      .filter((s) => s.value !== undefined && s.value <= 50)
      .sort((a, b) => (a.value ?? 100) - (b.value ?? 100));

    return qualifyingStats[0];
  }, [
    data.upvotePercentile,
    data.commentPercentile,
    data.bookmarkPercentile,
    iconSize,
  ]);
}

/**
 * Pure function version for use outside React components
 * (e.g., in static card generation where hooks aren't available)
 */
export function getBestPercentileStat(
  data: EngagementPercentileData,
  iconSize: IconSize = IconSize.Large,
): EngagementStat | undefined {
  const stats: EngagementStat[] = [
    {
      label: 'UPVOTERS',
      value: data.upvotePercentile,
      icon: React.createElement(UpvoteIcon, {
        secondary: true,
        size: iconSize,
        className: 'text-action-upvote-default',
      }),
    },
    {
      label: 'COMMENTERS',
      value: data.commentPercentile,
      icon: React.createElement(DiscussIcon, {
        secondary: true,
        size: iconSize,
        className: 'text-action-comment-default',
      }),
    },
    {
      label: 'CURATORS',
      value: data.bookmarkPercentile,
      icon: React.createElement(BookmarkIcon, {
        secondary: true,
        size: iconSize,
        className: 'text-action-bookmark-default',
      }),
    },
  ];

  const qualifyingStats = stats
    .filter((s) => s.value !== undefined && s.value <= 50)
    .sort((a, b) => (a.value ?? 100) - (b.value ?? 100));

  return qualifyingStats[0];
}

/**
 * Calculate total engagement count
 */
export function calculateTotalEngagement(
  data: Pick<LogData, 'upvotesGiven' | 'commentsWritten' | 'postsBookmarked'>,
): number {
  return data.upvotesGiven + data.commentsWritten + data.postsBookmarked;
}

/**
 * Hook to get total engagement
 */
export function useTotalEngagement(
  data: Pick<LogData, 'upvotesGiven' | 'commentsWritten' | 'postsBookmarked'>,
): number {
  return useMemo(() => calculateTotalEngagement(data), [data]);
}

/**
 * Find peak reading hour from activity heatmap
 * Returns formatted 12-hour time string
 *
 * The activityHeatmap is a 24-element array of floats that sum to 1.
 */
export function getPeakReadingHour(
  activityHeatmap: LogData['activityHeatmap'],
): { hour: number; formatted: string } {
  let maxActivity = 0;
  let bestHour = 0;

  activityHeatmap.forEach((activity, hour) => {
    if (activity > maxActivity) {
      maxActivity = activity;
      bestHour = hour;
    }
  });

  // Format as 12-hour time
  const suffix = bestHour >= 12 ? 'PM' : 'AM';
  const displayHour = bestHour % 12 || 12;

  return {
    hour: bestHour,
    formatted: `${displayHour}${suffix}`,
  };
}

/**
 * Hook version of getPeakReadingHour
 */
export function usePeakReadingHour(
  activityHeatmap: LogData['activityHeatmap'],
): { hour: number; formatted: string } {
  return useMemo(() => getPeakReadingHour(activityHeatmap), [activityHeatmap]);
}
