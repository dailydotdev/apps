import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';
import { EngagementPillars, findBestEngagementStat } from '../primitives';

interface StaticCardProps {
  data: Pick<
    LogData,
    | 'upvotesGiven'
    | 'commentsWritten'
    | 'postsBookmarked'
    | 'upvotePercentile'
    | 'commentPercentile'
    | 'bookmarkPercentile'
  >;
}

/**
 * Static Community Engagement card for share image generation.
 * Shows engagement stats with pillar layout matching the interactive card.
 * Uses shared primitives with animated=false for consistency.
 */
export default function StaticCardCommunityEngagement({
  data,
}: StaticCardProps): ReactElement {
  const totalEngagement =
    data.upvotesGiven + data.commentsWritten + data.postsBookmarked;

  // Find best stat for the banner
  const bestStat = useMemo(
    () =>
      findBestEngagementStat({
        upvotePercentile: data.upvotePercentile,
        commentPercentile: data.commentPercentile,
        bookmarkPercentile: data.bookmarkPercentile,
        iconSize: IconSize.XXXLarge,
      }),
    [data.upvotePercentile, data.commentPercentile, data.bookmarkPercentile],
  );

  return (
    <div className={styles.engagementContainer}>
      {/* Header badge */}
      <div className={styles.engagementHeader}>
        <span className={styles.engagementHeaderText}>COMMUNITY PULSE</span>
      </div>

      {/* Main stat - Total engagement */}
      <div className={styles.totalEngagementContainer}>
        <span className={styles.totalEngagementNumber}>
          {largeNumberFormat(totalEngagement)}
        </span>
        <span className={styles.totalEngagementLabel}>interactions</span>
      </div>

      {/* Subtitle */}
      <p className={styles.engagementSubtitle}>
        every action builds the community
      </p>

      {/* Three equal engagement pillars */}
      <EngagementPillars
        upvotes={data.upvotesGiven}
        comments={data.commentsWritten}
        bookmarks={data.postsBookmarked}
        animated={false}
        iconSize={IconSize.XXXLarge}
        customStyles={{
          engagementPillars: styles.engagementPillars,
          engagementPillar: styles.engagementPillar,
          pillarIcon: styles.pillarIcon,
          pillarValue: styles.pillarValue,
          pillarLabel: styles.pillarLabel,
        }}
      />

      {/* Best stat banner */}
      {bestStat && (
        <div className={styles.communityBanner}>
          <span className={styles.communityBannerIcon}>{bestStat.icon}</span>
          <div>
            <span className={styles.communityBannerTop}>
              TOP {bestStat.value}%
            </span>
            <span className={styles.communityBannerLabel}>
              {bestStat.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
