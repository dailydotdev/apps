import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../../types/log';
import styles from './Log.module.css';
import ShareStatButton from './ShareStatButton';
import TopPercentileBanner from './TopPercentileBanner';
import type { BaseCardProps } from './types';

const PATTERN_BANNER_TEXT: Record<
  LogData['readingPattern'],
  { preText: string; postText: string; shareText: string }
> = {
  night: {
    preText: 'ONLY',
    postText: 'READ THIS LATE',
    shareText: 'Only {percentile}% of devs read this late',
  },
  early: {
    preText: 'ONLY',
    postText: 'START THIS EARLY',
    shareText: 'Only {percentile}% of devs start this early',
  },
  afternoon: {
    preText: 'ONLY',
    postText: 'AT PEAK HOURS',
    shareText: 'Only {percentile}% read during peak hours',
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

export default function CardWhenYouRead({
  data,
  isActive,
  cardType,
  imageCache,
  onImageFetched,
}: BaseCardProps): ReactElement {
  // Aggregate heatmap data to get hour distribution (sum across all days)
  const hourDistribution = useMemo(() => {
    const distribution = Array(24).fill(0);
    data.activityHeatmap.forEach((day) => {
      day.forEach((value, hourIndex) => {
        distribution[hourIndex] += value;
      });
    });
    const maxValue = Math.max(...distribution, 1);
    return distribution.map((value) => value / maxValue);
  }, [data.activityHeatmap]);

  // Find the peak hour from distribution
  const peakHour = useMemo(() => {
    let maxIdx = 0;
    let maxVal = 0;
    hourDistribution.forEach((val, idx) => {
      if (val > maxVal) {
        maxVal = val;
        maxIdx = idx;
      }
    });
    return maxIdx;
  }, [hourDistribution]);

  // Calculate clock angle from peak hour
  const hourAngle = (peakHour % 12) * 30 - 90;

  return (
    <>
      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        {/* Clock visualization */}
        <motion.div
          className={styles.clockContainer}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        >
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
            <motion.div
              className={styles.clockHand}
              initial={{ rotate: -90 }}
              animate={{ rotate: hourAngle }}
              transition={{ delay: 0.8, duration: 1, type: 'spring' }}
            />
            {/* Center dot */}
            <div className={styles.clockCenter} />
            {/* Time display - rounded hour */}
            <motion.div
              className={styles.clockTime}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {formatHour(peakHour)}
            </motion.div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          className={styles.headlineStack}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className={styles.headlineSmall}>Your golden hour</span>
        </motion.div>

        {/* Hour distribution bar chart */}
        <motion.div
          className={styles.hourDistWrapper}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className={styles.hourDistBars}>
            {hourDistribution.map((value, hourIndex) => {
              const hourNumber = hourIndex;
              return (
                <motion.div
                  key={`hour-${hourNumber}-${value}`}
                  className={`${styles.hourDistBar} ${
                    hourNumber === peakHour ? styles.hourDistBarPeak : ''
                  }`}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: value || 0.05 }}
                  transition={{
                    delay: 1.1 + hourNumber * 0.02,
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                />
              );
            })}
          </div>
          <div className={styles.hourDistLabels}>
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
          </div>
        </motion.div>

        {/* Pattern stat */}
        <TopPercentileBanner
          preText={PATTERN_BANNER_TEXT[data.readingPattern].preText}
          mainText={`${data.patternPercentile}%`}
          postText={PATTERN_BANNER_TEXT[data.readingPattern].postText}
          delay={1.4}
        />
      </div>

      {/* Share button - pushed to bottom with margin-top: auto */}
      <ShareStatButton
        delay={2}
        isActive={isActive}
        cardType={cardType}
        imageCache={imageCache}
        onImageFetched={onImageFetched}
        statText={`my brain peaks at ${formatHour(peakHour).toLowerCase()}`}
      />
    </>
  );
}
