import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';

interface StaticCardProps {
  data: Pick<
    LogData,
    'peakDay' | 'readingPattern' | 'patternPercentile' | 'activityHeatmap'
  >;
}

const PATTERN_BANNER_TEXT: Record<
  LogData['readingPattern'],
  { preText: string; postText: string }
> = {
  night: {
    preText: 'ONLY',
    postText: 'READ THIS LATE',
  },
  early: {
    preText: 'ONLY',
    postText: 'START THIS EARLY',
  },
  afternoon: {
    preText: 'ONLY',
    postText: 'AT PEAK HOURS',
  },
};

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) {
    return '12 AM';
  }
  if (hour === 12) {
    return '12 PM';
  }
  if (hour < 12) {
    return `${hour} AM`;
  }
  return `${hour - 12} PM`;
}

/**
 * Static When You Read card for share image generation.
 * Shows clock and hour distribution bar chart - no animations.
 */
export default function StaticCardWhenYouRead({
  data,
}: StaticCardProps): ReactElement {
  // Aggregate heatmap data to get hour distribution (sum across all days)
  const { hourDistribution, peakHour } = useMemo(() => {
    const distribution = Array(24).fill(0);
    data.activityHeatmap.forEach((day) => {
      day.forEach((value, hourIndex) => {
        distribution[hourIndex] += value;
      });
    });
    const maxValue = Math.max(...distribution, 1);
    const normalized = distribution.map((value) => value / maxValue);

    // Find peak hour
    let maxIdx = 0;
    let maxVal = 0;
    normalized.forEach((val, idx) => {
      if (val > maxVal) {
        maxVal = val;
        maxIdx = idx;
      }
    });

    return { hourDistribution: normalized, peakHour: maxIdx };
  }, [data.activityHeatmap]);

  // Calculate clock angle from peak hour
  const hourAngle = (peakHour % 12) * 30 - 90;

  return (
    <>
      {/* Clock visualization */}
      <div className={styles.clockContainer}>
        <div className={styles.clockFace}>
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = i * 30;
            return (
              <div
                key={`marker-${angle}`}
                className={styles.clockMarker}
                style={{ transform: `rotate(${angle}deg)` }}
              />
            );
          })}
          {/* Hour hand */}
          <div
            className={styles.clockHand}
            style={{ transform: `rotate(${hourAngle}deg)` }}
          />
          {/* Center dot */}
          <div className={styles.clockCenter} />
          {/* Time display */}
          <div className={styles.clockTime}>{formatHour(peakHour)}</div>
        </div>
      </div>

      {/* Headline */}
      <div className={styles.headlineStack}>
        <span className={styles.headlineSmall}>Your golden hour</span>
      </div>

      {/* Hour distribution bar chart */}
      <div className={styles.hourDistWrapper}>
        <div className={styles.hourDistBars}>
          {hourDistribution.map((value, hourIndex) => (
            <div
              key={`hour-${hourIndex}`}
              className={`${styles.hourDistBar} ${
                hourIndex === peakHour ? styles.hourDistBarPeak : ''
              }`}
              style={{ transform: `scaleY(${value || 0.05})` }}
            />
          ))}
        </div>
        <div className={styles.hourDistLabels}>
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      <div className={styles.celebrationBanner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <span className={styles.bannerPre}>
            {PATTERN_BANNER_TEXT[data.readingPattern].preText}
          </span>
          <span className={styles.bannerMain}>{data.patternPercentile}%</span>
          <span className={styles.bannerPost}>
            {PATTERN_BANNER_TEXT[data.readingPattern].postText}
          </span>
        </div>
      </div>
    </>
  );
}
