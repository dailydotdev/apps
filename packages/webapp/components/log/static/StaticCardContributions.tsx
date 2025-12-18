import type { ReactElement } from 'react';
import React from 'react';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';

interface StaticCardProps {
  data: Pick<
    LogData,
    | 'postsCreated'
    | 'totalViews'
    | 'commentsReceived'
    | 'upvotesReceived'
    | 'reputationEarned'
    | 'creatorPercentile'
  >;
}

/**
 * Static Contributions card for share image generation.
 * Shows content creation stats.
 */
export default function StaticCardContributions({
  data,
}: StaticCardProps): ReactElement {
  return (
    <>
      {/* Main headline stack */}
      <div className={styles.headlineStack}>
        <span className={styles.headlineSmall}>You created</span>
        <span className={styles.headlineBig}>{data.postsCreated || 0}</span>
        <span className={styles.headlineMedium}>POSTS</span>
        <span className={styles.headlineAccent}>this year</span>
      </div>

      {/* Contribution stats grid */}
      <div className={styles.contributionStats}>
        <div className={styles.contributionItem}>
          <span className={styles.contributionValue}>
            {largeNumberFormat(data.totalViews || 0)}
          </span>
          <span className={styles.contributionLabel}>Views</span>
        </div>
        <div className={styles.contributionItem}>
          <span className={styles.contributionValue}>
            {largeNumberFormat(data.upvotesReceived || 0)}
          </span>
          <span className={styles.contributionLabel}>Upvotes</span>
        </div>
        <div className={styles.contributionItem}>
          <span className={styles.contributionValue}>
            {largeNumberFormat(data.commentsReceived || 0)}
          </span>
          <span className={styles.contributionLabel}>Comments</span>
        </div>
        <div className={styles.contributionItem}>
          <span className={styles.contributionValue}>
            {largeNumberFormat(data.reputationEarned || 0)}
          </span>
          <span className={styles.contributionLabel}>Reputation</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      {data.creatorPercentile && (
        <div className={styles.celebrationBanner}>
          <div className={styles.bannerBg} />
          <div className={styles.bannerContent}>
            <span className={styles.bannerPre}>Top</span>
            <span className={styles.bannerMain}>{data.creatorPercentile}%</span>
            <span className={styles.bannerPost}>content creator</span>
          </div>
        </div>
      )}
    </>
  );
}
