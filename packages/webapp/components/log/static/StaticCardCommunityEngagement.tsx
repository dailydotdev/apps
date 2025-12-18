import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
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
 * Shows engagement stats with percentile badges.
 */
export default function StaticCardCommunityEngagement({
  data,
}: StaticCardProps): ReactElement {
  const totalEngagement =
    data.upvotesGiven + data.commentsWritten + data.postsBookmarked;

  // Find best stat for the banner
  const bestStat = useMemo(() => {
    const stats = [
      { label: 'UPVOTERS', value: data.upvotePercentile },
      { label: 'COMMENTERS', value: data.commentPercentile },
      { label: 'CURATORS', value: data.bookmarkPercentile },
    ]
      .filter((s) => s.value !== undefined && s.value <= 50)
      .sort((a, b) => (a.value || 100) - (b.value || 100));
    return stats[0];
  }, [data]);

  return (
    <>
      {/* Main headline stack */}
      <div className={styles.headlineStack}>
        <span className={styles.headlineSmall}>Community pulse</span>
        <span className={styles.headlineBig}>
          {largeNumberFormat(totalEngagement)}
        </span>
        <span className={styles.headlineMedium}>INTERACTIONS</span>
      </div>

      {/* Engagement breakdown */}
      <div className={styles.engagementStats}>
        <div className={styles.engagementItem}>
          <span className={styles.engagementIcon}>👍</span>
          <div className={styles.engagementInfo}>
            <span className={styles.engagementValue}>
              {largeNumberFormat(data.upvotesGiven)}
            </span>
            <span className={styles.engagementLabel}>upvotes given</span>
          </div>
          {data.upvotePercentile && data.upvotePercentile <= 50 && (
            <span className={styles.engagementBadge}>
              TOP {data.upvotePercentile}%
            </span>
          )}
        </div>

        <div className={styles.engagementItem}>
          <span className={styles.engagementIcon}>💬</span>
          <div className={styles.engagementInfo}>
            <span className={styles.engagementValue}>
              {largeNumberFormat(data.commentsWritten)}
            </span>
            <span className={styles.engagementLabel}>comments written</span>
          </div>
          {data.commentPercentile && data.commentPercentile <= 50 && (
            <span className={styles.engagementBadge}>
              TOP {data.commentPercentile}%
            </span>
          )}
        </div>

        <div className={styles.engagementItem}>
          <span className={styles.engagementIcon}>🔖</span>
          <div className={styles.engagementInfo}>
            <span className={styles.engagementValue}>
              {largeNumberFormat(data.postsBookmarked)}
            </span>
            <span className={styles.engagementLabel}>posts saved</span>
          </div>
          {data.bookmarkPercentile && data.bookmarkPercentile <= 50 && (
            <span className={styles.engagementBadge}>
              TOP {data.bookmarkPercentile}%
            </span>
          )}
        </div>
      </div>

      {/* Best stat banner */}
      {bestStat && (
        <div className={styles.celebrationBanner}>
          <div className={styles.bannerBg} />
          <div className={styles.bannerContent}>
            <span className={styles.bannerPre}>Top</span>
            <span className={styles.bannerMain}>{bestStat.value}%</span>
            <span className={styles.bannerPost}>
              {bestStat.label.toLowerCase()}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
