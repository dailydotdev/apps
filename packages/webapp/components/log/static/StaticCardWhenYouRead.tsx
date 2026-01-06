import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';
import {
  ClockVisualization,
  SimpleHeadline,
  normalizeHourDistribution,
  PATTERN_BANNER_TEXT,
} from '../primitives';
import TopPercentileBanner from '../TopPercentileBanner';
import { getPeakReadingHour } from '../../../hooks/log/useLogStats';

interface StaticCardProps {
  data: Pick<
    LogData,
    'peakDay' | 'readingPattern' | 'patternPercentile' | 'activityHeatmap'
  >;
}

/**
 * Static When You Read card for share image generation.
 * Shows clock and hour distribution bar chart - no animations.
 * Uses shared primitives with animated=false for consistency.
 */
export default function StaticCardWhenYouRead({
  data,
}: StaticCardProps): ReactElement {
  const hourDistribution = useMemo(
    () => normalizeHourDistribution(data.activityHeatmap),
    [data.activityHeatmap],
  );
  const { hour: peakHour } = getPeakReadingHour(data.activityHeatmap);

  return (
    <>
      {/* Clock visualization */}
      <ClockVisualization
        peakHour={peakHour}
        animated={false}
        customStyles={{
          clockContainer: styles.clockContainer,
          clockFace: styles.clockFace,
          clockMarker: styles.clockMarker,
          clockHand: styles.clockHand,
          clockCenter: styles.clockCenter,
          clockTime: styles.clockTime,
        }}
      />

      {/* Headline */}
      <SimpleHeadline animated={false} className={styles.headlineStack}>
        Your golden hour
      </SimpleHeadline>

      {/* Hour distribution bar chart */}
      <div className={styles.hourDistWrapper}>
        <div className={styles.hourDistBars}>
          {/* eslint-disable react/no-array-index-key */}
          {hourDistribution.map((value, hourIndex) => (
            <div
              key={`hour-${hourIndex}`}
              className={`${styles.hourDistBar} ${
                hourIndex === peakHour ? styles.hourDistBarPeak : ''
              }`}
              style={{ transform: `scaleY(${value || 0.05})` }}
            />
          ))}
          {/* eslint-enable react/no-array-index-key */}
        </div>
        <div className={styles.hourDistLabels}>
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      <TopPercentileBanner
        preText={PATTERN_BANNER_TEXT[data.readingPattern].preText}
        mainText={`${data.patternPercentile}%`}
        postText={PATTERN_BANNER_TEXT[data.readingPattern].postText}
        animated={false}
        customStyles={{
          celebrationBanner: styles.celebrationBanner,
          bannerBg: styles.bannerBg,
          bannerContent: styles.bannerContent,
          bannerPre: styles.bannerPre,
          bannerMain: styles.bannerMain,
          bannerPost: styles.bannerPost,
        }}
      />
    </>
  );
}
