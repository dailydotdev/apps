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

export default function CardFavoriteSources({
  data,
  cardNumber,
  cardLabel,
  isActive,
}: CardProps): ReactElement {
  const animatedSources = useAnimatedNumber(data.uniqueSources, {
    delay: 1200,
    enabled: isActive,
  });

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [data.topSources[1], data.topSources[0], data.topSources[2]];

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
          <span className={styles.headlineSmall}>Your holy trinity</span>
        </div>
      </div>

      {/* Podium */}
      <div className={styles.podiumContainer}>
        {podiumOrder.map((source, index) => {
          const rank = index === 1 ? 1 : index === 0 ? 2 : 3;
          return (
            <div key={source.name} className={styles.podiumItem}>
              <div className={styles.podiumBar}>
                <span className={styles.podiumRank}>{rank}</span>
                <span className={styles.podiumName}>{source.name}</span>
                <span className={styles.podiumCount}>{source.postsRead} posts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats badges */}
      <div className={styles.statsBadges}>
        <div className={styles.badge}>
          <span className={styles.badgeValue}>{animatedSources}</span>
          <span className={styles.badgeLabel}>Sources Discovered</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      <div className={styles.celebrationBanner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <span className={styles.bannerPre}>TOP</span>
          <span className={styles.bannerMain}>{data.sourcePercentile}%</span>
          <span className={styles.bannerPost}>LOYALTY TO {data.sourceLoyaltyName.toUpperCase()}</span>
        </div>
      </div>
    </>
  );
}
