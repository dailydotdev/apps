import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../types';
import styles from '../Log.module.css';

interface CardProps {
  data: LogData;
  cardNumber: number;
  totalCards: number;
  cardLabel: string;
  isActive: boolean;
}

const PATTERN_LABELS: Record<LogData['readingPattern'], string> = {
  night: 'LATE-NIGHT READERS',
  early: 'EARLY RISERS',
  weekend: 'WEEKEND WARRIORS',
  consistent: 'DAILY CONSISTENCY',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CardWhenYouRead({
  data,
  cardNumber,
  cardLabel,
  isActive,
}: CardProps): ReactElement {
  // Get level for heatmap cell (0-4)
  const getLevel = (value: number): string => {
    if (value === 0) return '';
    if (value <= 2) return styles.level1;
    if (value <= 4) return styles.level2;
    if (value <= 6) return styles.level3;
    return styles.level4;
  };

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
          <span className={styles.headlineSmall}>Your brain was hungriest at</span>
        </div>
        <div className={styles.headlineRow}>
          <span className={styles.headlineBig}>{data.peakHour}</span>
        </div>
      </div>

      {/* Secondary stat */}
      <div className={styles.statsBadges}>
        <div className={`${styles.badge} ${styles.badgeLarge}`}>
          <span className={styles.badgeValue}>{data.peakDay}</span>
          <span className={styles.badgeLabel}>Power Day</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className={styles.heatmapContainer}>
        {DAYS.map((day, dayIndex) => (
          <div key={day} className={styles.heatmapGrid}>
            {data.activityHeatmap[dayIndex]?.map((value, hourIndex) => (
              <div
                key={`${dayIndex}-${hourIndex}`}
                className={`${styles.heatmapCell} ${getLevel(value)}`}
                style={{
                  animationDelay: isActive
                    ? `${0.8 + (dayIndex * 24 + hourIndex) * 0.005}s`
                    : '0s',
                }}
              />
            ))}
          </div>
        ))}
        <div className={styles.heatmapLabels}>
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>12am</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      <div className={styles.celebrationBanner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <span className={styles.bannerPre}>TOP</span>
          <span className={styles.bannerMain}>{data.patternPercentile}%</span>
          <span className={styles.bannerPost}>{PATTERN_LABELS[data.readingPattern]}</span>
        </div>
      </div>
    </>
  );
}
