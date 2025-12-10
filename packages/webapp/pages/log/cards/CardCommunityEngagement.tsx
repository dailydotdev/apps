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

export default function CardCommunityEngagement({
  data,
  cardNumber,
  cardLabel,
  isActive,
}: CardProps): ReactElement {
  const animatedUpvotes = useAnimatedNumber(data.upvotesGiven, {
    delay: 500,
    enabled: isActive,
  });
  const animatedComments = useAnimatedNumber(data.commentsWritten, {
    delay: 700,
    enabled: isActive,
  });
  const animatedBookmarks = useAnimatedNumber(data.postsBookmarked, {
    delay: 900,
    enabled: isActive,
  });

  // Find the best percentile to show
  const bestStat = [
    { label: 'UPVOTERS', value: data.upvotePercentile },
    { label: 'COMMENTERS', value: data.commentPercentile },
    { label: 'CURATORS', value: data.bookmarkPercentile },
  ]
    .filter((s) => s.value !== undefined && s.value <= 50)
    .sort((a, b) => (a.value || 100) - (b.value || 100))[0];

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
          <span className={styles.headlineSmall}>You spread the love</span>
        </div>
        <div className={styles.headlineRow}>
          <span className={styles.headlineBigSmall}>{animatedUpvotes}</span>
        </div>
        <div className={styles.headlineRow}>
          <span className={styles.headlineMedium}>UPVOTES</span>
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
          <span className={styles.badgeValue}>{animatedComments}</span>
          <span className={styles.badgeLabel}>Comments</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeValue}>{animatedBookmarks}</span>
          <span className={styles.badgeLabel}>Bookmarked</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      {bestStat && (
        <div className={styles.celebrationBanner}>
          <div className={styles.bannerBg} />
          <div className={styles.bannerContent}>
            <span className={styles.bannerPre}>TOP</span>
            <span className={styles.bannerMain}>{bestStat.value}%</span>
            <span className={styles.bannerPost}>{bestStat.label}</span>
          </div>
        </div>
      )}
    </>
  );
}
