import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons';
import type { LogData } from '../../types/log';
import { useAnimatedNumber } from '../../hooks/log';
import styles from './Log.module.css';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';
import TopPercentileBanner from './TopPercentileBanner';

interface CardProps {
  data: LogData;
  isActive: boolean;
  subcard?: number;
  isTouchDevice?: boolean;
  cardType?: string;
  imageCache?: Map<string, Blob>;
  onImageFetched?: (cardType: string, blob: Blob) => void;
}

const PODIUM_MEDALS = ['🥈', '🥇', '🥉'];
const PODIUM_HEIGHTS = [100, 140, 70];
const PODIUM_DELAYS = [0.6, 0.3, 0.9]; // 1st place reveals last for drama

export default function CardFavoriteSources({
  data,
  isActive,
  cardType,
  imageCache,
  onImageFetched,
}: CardProps): ReactElement {
  const [showMedals, setShowMedals] = useState(false);

  const animatedSources = useAnimatedNumber(data.uniqueSources, {
    delay: 1500,
    enabled: isActive,
  });

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [
    data.topSources[1],
    data.topSources[0],
    data.topSources[2],
  ];

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowMedals(true), 1200);
      return () => clearTimeout(timer);
    }
    setShowMedals(false);
    return () => {
      // Cleanup when inactive
    };
  }, [isActive]);

  return (
    <>
      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        {/* Header */}
        <motion.div
          className={styles.headlineStack}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className={styles.headlineSmall}>Your favorite trio</span>
        </motion.div>

        {/* Podium */}
        <div className={cardStyles.podiumStage}>
          {podiumOrder.map((source, index) => {
            let rank: number;
            if (index === 1) {
              rank = 1;
            } else if (index === 0) {
              rank = 2;
            } else {
              rank = 3;
            }
            const height = PODIUM_HEIGHTS[index];
            const delay = PODIUM_DELAYS[index];

            return (
              <motion.div
                key={source.name}
                className={cardStyles.podiumColumn}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay, type: 'spring', stiffness: 100 }}
              >
                {/* Medal with bounce */}
                <motion.div
                  className={cardStyles.podiumMedal}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={showMedals ? { scale: 1, rotate: 0 } : { scale: 0 }}
                  transition={{
                    delay: delay + 0.3,
                    type: 'spring',
                    stiffness: 200,
                    damping: 10,
                  }}
                >
                  {PODIUM_MEDALS[index]}
                </motion.div>

                {/* Source icon + name */}
                <motion.div
                  className={cardStyles.podiumSource}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.2 }}
                >
                  <Image
                    src={source.logoUrl}
                    alt={source.name}
                    className="size-8 rounded-full object-cover"
                    type={ImageType.Squad}
                  />
                  {source.name}
                </motion.div>

                {/* Bar */}
                <motion.div
                  className={cardStyles.podiumBar}
                  style={{
                    height: 0,
                    background:
                      index === 1
                        ? 'linear-gradient(180deg, #f7c948 0%, #ff6b35 100%)'
                        : '#fff',
                  }}
                  animate={{ height }}
                  transition={{
                    delay: delay + 0.1,
                    duration: 0.5,
                    ease: 'easeOut',
                  }}
                >
                  <span className={cardStyles.podiumRank}>{rank}</span>
                  <span className={cardStyles.podiumCount}>
                    {source.postsRead} posts
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Discovery stat */}
        <motion.div
          className={cardStyles.discoveryBadge}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className={cardStyles.discoveryIcon}>
            <EarthIcon />
          </div>
          <div className={cardStyles.discoveryContent}>
            <span className={cardStyles.discoveryValue}>{animatedSources}</span>
            <span className={cardStyles.discoveryLabel}>sources read</span>
          </div>
        </motion.div>

        {/* Banner */}
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
      </div>

      {/* Share button - pushed to bottom with margin-top: auto */}
      <ShareStatButton
        delay={2}
        isActive={isActive}
        cardType={cardType}
        imageCache={imageCache}
        onImageFetched={onImageFetched}
        statText={`My winning trio on daily.dev:\n🥇 ${data.topSources[0].name}\n🥈 ${data.topSources[1].name}\n🥉 ${data.topSources[2].name}\n\nI discovered ${data.uniqueSources} sources — TOP ${data.sourcePercentile}% explorer!`}
      />
    </>
  );
}
