import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';

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
 */
export default function StaticCardCommunityEngagement({
  data,
}: StaticCardProps): ReactElement {
  const totalEngagement =
    data.upvotesGiven + data.commentsWritten + data.postsBookmarked;

  // Find best stat for the banner
  const bestStat = useMemo(() => {
    const stats = [
      {
        label: 'UPVOTERS',
        value: data.upvotePercentile,
        icon: (
          <UpvoteIcon
            secondary
            size={IconSize.XXXLarge}
            className="text-action-upvote-default"
          />
        ),
      },
      {
        label: 'COMMENTERS',
        value: data.commentPercentile,
        icon: (
          <DiscussIcon
            secondary
            size={IconSize.XXXLarge}
            className="text-action-comment-default"
          />
        ),
      },
      {
        label: 'CURATORS',
        value: data.bookmarkPercentile,
        icon: (
          <BookmarkIcon
            secondary
            size={IconSize.XXXLarge}
            className="text-action-bookmark-default"
          />
        ),
      },
    ]
      .filter((s) => s.value !== undefined && s.value <= 50)
      .sort((a, b) => (a.value || 100) - (b.value || 100));
    return stats[0];
  }, [data]);

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
      <div className={styles.engagementPillars}>
        <div className={styles.engagementPillar}>
          <span className={styles.pillarIcon}>
            <UpvoteIcon
              secondary
              size={IconSize.XXXLarge}
              className="text-action-upvote-default"
            />
          </span>
          <span className={styles.pillarValue}>
            {largeNumberFormat(data.upvotesGiven)}
          </span>
          <span className={styles.pillarLabel}>upvotes</span>
        </div>

        <div className={styles.engagementPillar}>
          <span className={styles.pillarIcon}>
            <DiscussIcon
              secondary
              size={IconSize.XXXLarge}
              className="text-action-comment-default"
            />
          </span>
          <span className={styles.pillarValue}>
            {largeNumberFormat(data.commentsWritten)}
          </span>
          <span className={styles.pillarLabel}>comments</span>
        </div>

        <div className={styles.engagementPillar}>
          <span className={styles.pillarIcon}>
            <BookmarkIcon
              secondary
              size={IconSize.XXXLarge}
              className="text-action-bookmark-default"
            />
          </span>
          <span className={styles.pillarValue}>
            {largeNumberFormat(data.postsBookmarked)}
          </span>
          <span className={styles.pillarLabel}>saved</span>
        </div>
      </div>

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
