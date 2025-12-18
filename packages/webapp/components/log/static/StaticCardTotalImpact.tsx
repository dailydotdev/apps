import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';

interface StaticCardProps {
  data: Pick<
    LogData,
    'totalPosts' | 'totalReadingTime' | 'daysActive' | 'totalImpactPercentile'
  >;
}

/**
 * Static Total Impact card for share image generation.
 * No animations - displays final state.
 */
export default function StaticCardTotalImpact({
  data,
}: StaticCardProps): ReactElement {
  return (
    <>
      {/* Main headline stack */}
      <div className={styles.headlineStack}>
        <span className={styles.headlineSmall}>You read</span>
        <span className={styles.headlineBig}>
          {data.totalPosts.toLocaleString()}
        </span>
        <span className={styles.headlineMedium}>POSTS</span>
        <span className={styles.headlineAccent}>this year</span>
      </div>

      {/* Divider */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <div className={styles.dividerIcon}>◆</div>
        <div className={styles.dividerLine} />
      </div>

      {/* Secondary stats */}
      <div className={styles.statsBadges}>
        <div className={styles.badge}>
          <span className={styles.badgeValue}>{data.totalReadingTime}h</span>
          <span className={styles.badgeLabel}>Reading</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeValue}>{data.daysActive}</span>
          <span className={styles.badgeLabel}>Days Active</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      <div className={styles.celebrationBanner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <span className={styles.bannerPre}>Top</span>
          <span className={styles.bannerMain}>
            {data.totalImpactPercentile}%
          </span>
          <span className={styles.bannerPost}>of devs</span>
        </div>
      </div>
    </>
  );
}
