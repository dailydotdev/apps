import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../types';
import { useAnimatedNumber } from '../hooks';
import styles from '../Log.module.css';

interface CardProps {
  data: LogData;
  cardNumber: number;
  totalCards: number;
  cardLabel: string;
  isActive: boolean;
}

export default function CardContributions({
  data,
  cardNumber,
  cardLabel,
  isActive,
}: CardProps): ReactElement {
  const animatedPosts = useAnimatedNumber(data.postsCreated || 0, {
    delay: 500,
    enabled: isActive,
  });
  const animatedViews = useAnimatedNumber(data.totalViews || 0, {
    delay: 700,
    enabled: isActive,
  });
  const animatedComments = useAnimatedNumber(data.commentsReceived || 0, {
    delay: 900,
    enabled: isActive,
  });
  const animatedRep = useAnimatedNumber(data.reputationEarned || 0, {
    delay: 1100,
    enabled: isActive,
  });

  return (
    <>
      {/* Card indicator */}
      <div className={styles.cardIndicator}>
        <span className={styles.cardNum}>
          {String(cardNumber).padStart(2, '0')}
        </span>
        <span className={styles.cardSep}>—</span>
        <span className={styles.cardLabel}>{cardLabel}</span>
      </div>

      {/* Main headline */}
      <div className={styles.headlineStack}>
        <div className={styles.headlineRow}>
          <span className={styles.headlineSmall}>You created</span>
        </div>
        <div className={styles.headlineRow}>
          <span className={styles.headlineBig}>{animatedPosts}</span>
        </div>
        <div className={styles.headlineRow}>
          <span className={styles.headlineMedium}>POSTS</span>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <div className={styles.dividerIcon}>◆</div>
        <div className={styles.dividerLine} />
      </div>

      {/* Stats grid */}
      <div className={styles.statsBadges}>
        <div className={styles.badge}>
          <span className={styles.badgeValue}>
            {animatedViews.toLocaleString()}
          </span>
          <span className={styles.badgeLabel}>Views</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeValue}>{animatedComments}</span>
          <span className={styles.badgeLabel}>Comments</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeValue}>
            {animatedRep.toLocaleString()}
          </span>
          <span className={styles.badgeLabel}>Reputation</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      {data.creatorPercentile && (
        <div className={styles.celebrationBanner}>
          <div className={styles.bannerBg} />
          <div className={styles.bannerContent}>
            <span className={styles.bannerPre}>TOP</span>
            <span className={styles.bannerMain}>{data.creatorPercentile}%</span>
            <span className={styles.bannerPost}>CONTENT CREATOR</span>
          </div>
        </div>
      )}
    </>
  );
}
