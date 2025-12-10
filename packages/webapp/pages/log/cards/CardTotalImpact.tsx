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

export default function CardTotalImpact({
  data,
  cardNumber,
  totalCards,
  cardLabel,
  isActive,
}: CardProps): ReactElement {
  const animatedPosts = useAnimatedNumber(data.totalPosts, {
    delay: 500,
    enabled: isActive,
  });
  const animatedTime = useAnimatedNumber(data.totalReadingTime, {
    delay: 1100,
    enabled: isActive,
  });
  const animatedDays = useAnimatedNumber(data.daysActive, {
    delay: 1300,
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
          <span className={styles.headlineSmall}>You read</span>
        </div>
        <div className={styles.headlineRow}>
          <span className={styles.headlineBig}>
            {animatedPosts.toLocaleString()}
          </span>
        </div>
        <div className={styles.headlineRow}>
          <span className={styles.headlineMedium}>POSTS</span>
        </div>
        <div className={styles.headlineRow}>
          <span className={styles.headlineAccent}>this year</span>
        </div>
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
          <span className={styles.badgeValue}>{animatedTime}h</span>
          <span className={styles.badgeLabel}>Reading</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeValue}>{animatedDays}</span>
          <span className={styles.badgeLabel}>Days Active</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      <div className={styles.celebrationBanner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <span className={styles.bannerPre}>TOP</span>
          <span className={styles.bannerMain}>{data.totalImpactPercentile}%</span>
          <span className={styles.bannerPost}>OF DEVS</span>
        </div>
      </div>
    </>
  );
}
