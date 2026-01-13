import type { ReactElement } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DiscussIcon,
  EyeIcon,
  ReputationIcon,
  EditIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { useAnimatedNumber } from '../../hooks/log';
import styles from './Log.module.css';
import ShareStatButton from './ShareStatButton';
import TopPercentileBanner from './TopPercentileBanner';
import type { BaseCardProps } from './types';

// Floating sparkle effect for creator celebration
function Sparkle({
  delay,
  x,
  y,
}: {
  delay: number;
  x: number;
  y: number;
}): ReactElement {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        fontSize: '1.5rem',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        delay,
        ease: 'easeOut',
      }}
    >
      ✦
    </motion.div>
  );
}

export default function CardContributions({
  data,
  isActive,
  cardType,
  imageCache,
  onImageFetched,
}: BaseCardProps): ReactElement {
  const [showSparkles, setShowSparkles] = useState(false);

  const animatedPosts = useAnimatedNumber(data.postsCreated || 0, {
    delay: 600,
    enabled: isActive,
  });
  const animatedViews = useAnimatedNumber(data.totalViews || 0, {
    delay: 1200,
    enabled: isActive,
  });
  const animatedComments = useAnimatedNumber(data.commentsReceived || 0, {
    delay: 1400,
    enabled: isActive,
  });
  const animatedRep = useAnimatedNumber(data.reputationEarned || 0, {
    delay: 1600,
    enabled: isActive,
  });

  // Generate sparkles for the celebration effect
  const sparkles = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      delay: 0.8 + i * 0.15,
      key: `sparkle-${i}`,
    }));
  }, []);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowSparkles(true), 600);
      return () => clearTimeout(timer);
    }
    setShowSparkles(false);
    return () => {};
  }, [isActive]);

  return (
    <>
      {/* Celebration sparkles */}
      {showSparkles && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {sparkles.map(({ x, y, delay, key }) => (
            <Sparkle key={key} delay={delay} x={x} y={y} />
          ))}
        </div>
      )}

      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        {/* Creator badge header */}
        <motion.div
          className={styles.creatorBadge}
          initial={{ opacity: 0, y: -20, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <EditIcon size={IconSize.Small} className={styles.creatorBadgeIcon} />
          <span className={styles.creatorBadgeText}>CONTENT CREATOR</span>
        </motion.div>

        {/* Main spotlight - Posts created */}
        <motion.div
          className={styles.spotlightContainer}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.4,
            type: 'spring',
            stiffness: 150,
            damping: 12,
          }}
        >
          <div className={styles.spotlightRing} />
          <div className={styles.spotlightInner}>
            <motion.span
              className={styles.spotlightNumber}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {animatedPosts}
            </motion.span>
            <span className={styles.spotlightLabel}>POSTS</span>
            <span className={styles.spotlightSubLabel}>published</span>
          </div>
        </motion.div>

        {/* Result indicator - connects posts to impact */}
        <motion.div
          className={styles.resultIndicator}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <div className={styles.resultLine} />
          <span className={styles.resultText}>resulted in</span>
          <div className={styles.resultLine} />
        </motion.div>

        {/* Impact metrics as ticket stubs */}
        <div className={styles.ticketStubsContainer}>
          <motion.div
            className={`${styles.ticketStub} ${styles.ticketStubViews}`}
            initial={{ opacity: 0, x: -40, rotate: -5 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ delay: 1.0, type: 'spring', stiffness: 120 }}
          >
            <div className={styles.ticketStubPerforation} />
            <div className={styles.ticketStubContent}>
              <EyeIcon
                size={IconSize.Small}
                className={styles.ticketStubIcon}
              />
              <span className={styles.ticketStubValue}>
                {largeNumberFormat(animatedViews)}
              </span>
              <span className={styles.ticketStubLabel}>VIEWS</span>
            </div>
            <div className={styles.ticketStubTear} />
          </motion.div>

          <motion.div
            className={`${styles.ticketStub} ${styles.ticketStubComments}`}
            initial={{ opacity: 0, y: 30, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 1 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 120 }}
          >
            <div className={styles.ticketStubPerforation} />
            <div className={styles.ticketStubContent}>
              <DiscussIcon
                size={IconSize.Small}
                className={styles.ticketStubIcon}
              />
              <span className={styles.ticketStubValue}>
                {largeNumberFormat(animatedComments)}
              </span>
              <span className={styles.ticketStubLabel}>COMMENTS</span>
            </div>
            <div className={styles.ticketStubTear} />
          </motion.div>

          <motion.div
            className={`${styles.ticketStub} ${styles.ticketStubRep}`}
            initial={{ opacity: 0, x: 40, rotate: 5 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ delay: 1.4, type: 'spring', stiffness: 120 }}
          >
            <div className={styles.ticketStubPerforation} />
            <div className={styles.ticketStubContent}>
              <ReputationIcon
                size={IconSize.Small}
                className={styles.ticketStubIcon}
              />
              <span className={styles.ticketStubValue}>
                {largeNumberFormat(animatedRep)}
              </span>
              <span className={styles.ticketStubLabel}>REPUTATION</span>
            </div>
            <div className={styles.ticketStubTear} />
          </motion.div>
        </div>

        {/* Creator ranking banner */}
        {data.creatorPercentile && (
          <TopPercentileBanner
            preText="TOP"
            mainText={`${data.creatorPercentile}%`}
            postText="CREATOR"
            delay={2.0}
            motionProps={{
              initial: { opacity: 0, y: 30, scale: 0.9 },
              animate: { opacity: 1, y: 0, scale: 1 },
            }}
          />
        )}
      </div>

      {/* Share button - pushed to bottom with margin-top: auto */}
      <ShareStatButton
        delay={2.6}
        isActive={isActive}
        cardType={cardType}
        imageCache={imageCache}
        onImageFetched={onImageFetched}
        statText="shipped some thoughts in 2025"
      />
    </>
  );
}
