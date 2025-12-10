import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../types';
import styles from '../Log.module.css';
import cardStyles from './Cards.module.css';

interface CardProps {
  data: LogData;
  cardNumber: number;
  totalCards: number;
  cardLabel: string;
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

export default function CardWhenYouRead({
  data,
  cardNumber,
  cardLabel,
  isActive,
}: CardProps): ReactElement {
  // Parse hour for clock visualization
  const [hourStr] = data.peakHour.split(':');
  const hour = parseInt(hourStr, 10);
  const hourAngle = (hour % 12) * 30 - 90; // Clock angle

  return (
    <>
      {/* Card indicator */}
      <motion.div 
        className={styles.cardIndicator}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className={styles.cardNum}>
          {String(cardNumber).padStart(2, '0')}
        </span>
        <span className={styles.cardSep}>—</span>
        <span className={styles.cardLabel}>{cardLabel}</span>
      </motion.div>

      {/* Clock visualization */}
      <motion.div 
        className={cardStyles.clockContainer}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
      >
        <div className={cardStyles.clockFace}>
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={cardStyles.clockMarker}
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
          {/* Hour hand */}
          <motion.div 
            className={cardStyles.clockHand}
            initial={{ rotate: -90 }}
            animate={{ rotate: hourAngle }}
            transition={{ delay: 0.8, duration: 1, type: 'spring' }}
          />
          {/* Center dot */}
          <div className={cardStyles.clockCenter} />
          {/* Time display */}
          <motion.div 
            className={cardStyles.clockTime}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {data.peakHour}
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

      {/* Power day badge */}
      <motion.div 
        className={cardStyles.powerDayBadge}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <span className={cardStyles.powerDayEmoji}>⚡</span>
        <div>
          <span className={cardStyles.powerDayLabel}>POWER DAY</span>
          <span className={cardStyles.powerDayValue}>{data.peakDay}</span>
        </div>
      </motion.div>

      {/* Animated heatmap */}
      <motion.div 
        className={cardStyles.heatmapWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className={cardStyles.heatmapTitle}>Activity Heat Map</div>
        <div className={cardStyles.heatmapGrid}>
          {data.activityHeatmap.map((day, dayIndex) =>
            day.map((value, hourIndex) => (
              <motion.div
                key={`${dayIndex}-${hourIndex}`}
                className={cardStyles.heatmapCell}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  backgroundColor: value === 0 
                    ? 'rgba(255,255,255,0.1)' 
                    : `rgba(198, 241, 53, ${Math.min(value / 10, 1)})`
                }}
                transition={{ 
                  delay: 1.3 + (dayIndex * 24 + hourIndex) * 0.003,
                  duration: 0.2
                }}
              />
            ))
          )}
        </div>
        <div className={cardStyles.heatmapLabels}>
          <span>12am</span>
          <span>12pm</span>
          <span>12am</span>
        </div>
      </motion.div>

      {/* Pattern reveal banner */}
      <motion.div 
        className={cardStyles.patternBanner}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, type: 'spring' }}
      >
        <motion.span 
          className={cardStyles.patternEmoji}
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          {PATTERN_EMOJIS[data.readingPattern]}
        </motion.span>
        <div className={cardStyles.patternText}>
          <span className={cardStyles.patternLabel}>TOP {data.patternPercentile}%</span>
          <span className={cardStyles.patternName}>{PATTERN_LABELS[data.readingPattern]}</span>
        </div>
      </motion.div>
    </>
  );
}
