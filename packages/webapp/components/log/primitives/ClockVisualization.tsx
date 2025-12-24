import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../Log.module.css';
import { formatHour, calculateClockAngle } from './utils';

interface ClockVisualizationProps {
  /** The peak hour to display (0-23) */
  peakHour: number;
  /** Whether to animate the clock (set false for static image generation) */
  animated?: boolean;
  /** Animation delay in seconds */
  delay?: number;
  /** Additional CSS class name */
  className?: string;
  /** Custom styles object for static cards using different CSS modules */
  customStyles?: {
    clockContainer?: string;
    clockFace?: string;
    clockMarker?: string;
    clockHand?: string;
    clockCenter?: string;
    clockTime?: string;
  };
}

/**
 * ClockVisualization - Analog clock showing peak reading hour
 *
 * Displays a clock face with hour markers and a hand pointing to the peak hour.
 * Supports both animated (interactive cards) and static (image generation) modes.
 *
 * @example
 * ```tsx
 * // Interactive card (animated)
 * <ClockVisualization peakHour={14} animated delay={0.3} />
 *
 * // Static card (no animation)
 * <ClockVisualization peakHour={14} animated={false} customStyles={staticStyles} />
 * ```
 */
export default function ClockVisualization({
  peakHour,
  animated = true,
  delay = 0.3,
  className,
  customStyles,
}: ClockVisualizationProps): ReactElement {
  // Use custom styles if provided (for static cards), otherwise use default styles
  const s = {
    clockContainer: customStyles?.clockContainer ?? styles.clockContainer,
    clockFace: customStyles?.clockFace ?? styles.clockFace,
    clockMarker: customStyles?.clockMarker ?? styles.clockMarker,
    clockHand: customStyles?.clockHand ?? styles.clockHand,
    clockCenter: customStyles?.clockCenter ?? styles.clockCenter,
    clockTime: customStyles?.clockTime ?? styles.clockTime,
  };

  const containerClass = className
    ? `${s.clockContainer} ${className}`
    : s.clockContainer;

  const hourAngle = calculateClockAngle(peakHour);
  const timeDisplay = formatHour(peakHour);

  // Static rendering for image generation
  if (!animated) {
    return (
      <div className={containerClass}>
        <div className={s.clockFace}>
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`marker-${i}`}
              className={s.clockMarker}
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
          {/* Hour hand */}
          <div
            className={s.clockHand}
            style={{ transform: `rotate(${hourAngle}deg)` }}
          />
          {/* Center dot */}
          <div className={s.clockCenter} />
          {/* Time display */}
          <div className={s.clockTime}>{timeDisplay}</div>
        </div>
      </div>
    );
  }

  // Animated rendering for interactive cards
  return (
    <motion.div
      className={containerClass}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
    >
      <div className={s.clockFace}>
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = i * 30;
          return (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`marker-${angle}`}
              className={s.clockMarker}
              style={{ transform: `rotate(${angle}deg)` }}
            />
          );
        })}
        {/* Hour hand */}
        <motion.div
          className={s.clockHand}
          initial={{ rotate: -90 }}
          animate={{ rotate: hourAngle }}
          transition={{ delay: delay + 0.5, duration: 1, type: 'spring' }}
        />
        {/* Center dot */}
        <div className={s.clockCenter} />
        {/* Time display */}
        <motion.div
          className={s.clockTime}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.9 }}
        >
          {timeDisplay}
        </motion.div>
      </div>
    </motion.div>
  );
}
