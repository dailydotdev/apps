import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons';
import { useAnimatedNumber } from '../../hooks/log';
import styles from './Log.module.css';
import ShareStatButton from './ShareStatButton';
import TopPercentileBanner from './TopPercentileBanner';
import type { BaseCardProps } from './types';
import {
  SimpleHeadline,
  Podium,
  shouldShowPercentileBanner,
} from './primitives';

export default function CardFavoriteSources({
  data,
  isActive,
  cardType,
  imageCache,
  onImageFetched,
}: BaseCardProps): ReactElement {
  const animatedSources = useAnimatedNumber(data.uniqueSources, {
    delay: 1500,
    enabled: isActive,
  });

  return (
    <>
      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        {/* Header */}
        <SimpleHeadline animated delay={0.2}>
          Your favorite trio
        </SimpleHeadline>

        {/* Podium */}
        <Podium sources={data.topSources} animated />

        {/* Discovery stat */}
        <motion.div
          className={styles.discoveryBadge}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className={styles.discoveryIcon}>
            <EarthIcon />
          </div>
          <div className={styles.discoveryContent}>
            <span className={styles.discoveryValue}>{animatedSources}</span>
            <span className={styles.discoveryLabel}>sources read</span>
          </div>
        </motion.div>

        {/* Banner */}
        {shouldShowPercentileBanner(data.sourcePercentile) && (
          <TopPercentileBanner
            preText="TOP"
            mainText={`${data.sourcePercentile}%`}
            postText="EXPLORER"
            delay={1.5}
            motionProps={{
              initial: { opacity: 0, x: 100 },
              animate: { opacity: 1, x: 0 },
            }}
          />
        )}
      </div>

      {/* Share button - pushed to bottom with margin-top: auto */}
      <ShareStatButton
        delay={2}
        isActive={isActive}
        cardType={cardType}
        imageCache={imageCache}
        onImageFetched={onImageFetched}
        statText="my 2025 podium 🏆"
      />
    </>
  );
}
