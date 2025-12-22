import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './Log.module.css';
import ShareStatButton from './ShareStatButton';
import TopPercentileBanner from './TopPercentileBanner';
import type { BaseCardProps } from './types';
import {
  ClockVisualization,
  SimpleHeadline,
  calculateHourDistribution,
  formatHour,
  PATTERN_BANNER_TEXT,
} from './primitives';

export default function CardWhenYouRead({
  data,
  isActive,
  cardType,
  imageCache,
  onImageFetched,
}: BaseCardProps): ReactElement {
  // Calculate hour distribution from activity heatmap
  const { distribution: hourDistribution, peakHour } = useMemo(
    () => calculateHourDistribution(data.activityHeatmap),
    [data.activityHeatmap],
  );

  return (
    <>
      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        {/* Clock visualization */}
        <ClockVisualization peakHour={peakHour} animated delay={0.3} />

        {/* Headline */}
        <SimpleHeadline animated delay={0.5}>
          Your golden hour
        </SimpleHeadline>

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
