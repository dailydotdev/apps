import type { ReactElement } from 'react';
import React from 'react';
import { useAnimatedNumber } from '../../hooks/log';
import styles from './Log.module.css';
import ShareStatButton from './ShareStatButton';
import TopPercentileBanner from './TopPercentileBanner';
import type { BaseCardProps } from './types';
import {
  HeadlineStack,
  StatBadgeGroup,
  Divider,
  shouldShowPercentileBanner,
} from './primitives';

export default function CardTotalImpact({
  data,
  isActive,
  cardType,
  imageCache,
  onImageFetched,
}: BaseCardProps): ReactElement {
  const animatedPosts = useAnimatedNumber(data.totalPosts, {
    delay: 500,
    enabled: isActive,
  });
  const animatedTime = useAnimatedNumber(data.totalReadingTime, {
    delay: 800,
    enabled: isActive,
  });
  const animatedDays = useAnimatedNumber(data.daysActive, {
    delay: 1000,
    enabled: isActive,
  });

  return (
    <>
      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        {/* Main headline with staggered reveal */}
        <HeadlineStack
          rows={[
            { content: 'You read', variant: 'small', delay: 0.3 },
            {
              content: animatedPosts.toLocaleString(),
              variant: 'big',
              delay: 0.5,
            },
            { content: 'POSTS', variant: 'medium', delay: 0.7 },
            { content: 'this year', variant: 'accent', delay: 0.9 },
          ]}
          animated
        />

        {/* Divider */}
        <Divider animated delay={1.1} />

        {/* Secondary stats with bounce in */}
        <StatBadgeGroup
          badges={[
            { value: `${animatedTime}h`, label: 'Reading', interactive: true },
            { value: animatedDays, label: 'Days Active', interactive: true },
          ]}
          animated
          baseDelay={1.2}
        />

        {/* Competitive stat banner with slide in */}
        {shouldShowPercentileBanner(data.totalImpactPercentile) && (
          <TopPercentileBanner
            preText="Top"
            mainText={`${data.totalImpactPercentile}%`}
            postText="of devs"
            delay={1.8}
          />
        )}
      </div>

      {/* Share button */}
      <ShareStatButton
        delay={2}
        isActive={isActive}
        cardType={cardType}
        imageCache={imageCache}
        onImageFetched={onImageFetched}
        statText={`${data.totalPosts.toLocaleString()} posts this year 🔥`}
      />
    </>
  );
}
