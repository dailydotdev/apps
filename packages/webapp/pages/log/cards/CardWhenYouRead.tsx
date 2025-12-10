import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../types';
import styles from '../Log.module.css';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';

interface CardProps {
  data: LogData;
  isActive: boolean;
}

const PATTERN_LABELS: Record<LogData['readingPattern'], string> = {
  night: 'NIGHT OWL',
  early: 'EARLY BIRD',
  weekend: 'WEEKEND WARRIOR',
  consistent: 'CONSISTENCY KING',
};

const PATTERN_EMOJIS: Record<LogData['readingPattern'], string> = {
  night: '🦉',
  early: '🌅',
  weekend: '🎮',
  consistent: '👑',
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
}: CardProps): ReactElement {
  // Parse hour for clock visualization - round to nearest hour
  const [hourStr] = data.peakHour.split(':');
  const [, minStr] = data.peakHour.split(':');
  const rawHour = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10) || 0;
  const hour = minutes >= 30 ? (rawHour + 1) % 24 : rawHour;
  const hourAngle = (hour % 12) * 30 - 90; // Clock angle

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
  const peakDistributionHour = useMemo(() => {
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

  return (
    <>
      {/* Clock visualization */}
      <motion.div
        className={cardStyles.clockContainer}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
      >
        <div className={cardStyles.clockFace}>
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = i * 30;
            return (
              <div
                key={`marker-${angle}`}
                className={cardStyles.clockMarker}
                style={{ transform: `rotate(${angle}deg)` }}
              />
            );
          })}
          {/* Hour hand */}
          <motion.div
            className={cardStyles.clockHand}
            initial={{ rotate: -90 }}
            animate={{ rotate: hourAngle }}
            transition={{ delay: 0.8, duration: 1, type: 'spring' }}
          />
          {/* Center dot */}
          <div className={cardStyles.clockCenter} />
          {/* Time display - rounded hour */}
          <motion.div
            className={cardStyles.clockTime}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {formatHour(hour)}
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
        <span className={styles.headlineSmall}>Your brain peaks at</span>
      </motion.div>

      {/* Hour distribution bar chart */}
      <motion.div
        className={cardStyles.hourDistWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <div className={cardStyles.hourDistBars}>
          {hourDistribution.map((value, hourIndex) => {
            const hourNumber = hourIndex;
            return (
              <motion.div
                key={`hour-${hourNumber}-${value}`}
                className={`${cardStyles.hourDistBar} ${
                  hourNumber === peakDistributionHour
                    ? cardStyles.hourDistBarPeak
                    : ''
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
        <div className={cardStyles.hourDistLabels}>
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
        </div>
      </motion.div>

      {/* Combined stats row: Power day + Pattern */}
      <motion.div
        className={cardStyles.whenStatsRow}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        {/* Power day */}
        <div className={cardStyles.whenStatItem}>
          <span className={cardStyles.whenStatEmoji}>⚡</span>
          <div className={cardStyles.whenStatContent}>
            <span className={cardStyles.whenStatLabel}>POWER DAY</span>
            <span className={cardStyles.whenStatValue}>{data.peakDay}</span>
          </div>
        </div>

        {/* Divider */}
        <div className={cardStyles.whenStatDivider} />

        {/* Pattern */}
        <div className={cardStyles.whenStatItem}>
          <motion.span
            className={cardStyles.whenStatEmoji}
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            {PATTERN_EMOJIS[data.readingPattern]}
          </motion.span>
          <div className={cardStyles.whenStatContent}>
            <span className={cardStyles.whenStatLabel}>
              TOP {data.patternPercentile}%
            </span>
            <span className={cardStyles.whenStatValue}>
              {PATTERN_LABELS[data.readingPattern]}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Share button */}
      <ShareStatButton
        delay={2.6}
        isActive={isActive}
        statText={`My brain peaks at ${data.peakHour} ${PATTERN_EMOJIS[data.readingPattern]}\n\nI'm a ${PATTERN_LABELS[data.readingPattern]} — TOP ${data.patternPercentile}% on daily.dev!`}
      />
    </>
  );
}
