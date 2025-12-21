import type { ReactElement } from 'react';
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogData } from '../../types/log';
import { useAnimatedNumber } from '../../hooks/log';
import styles from './Log.module.css';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';
import TopPercentileBanner from './TopPercentileBanner';

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

// Quarterly color palettes - each quarter has its own vibe
const QUARTERLY_PALETTES: Record<string, [string, string, string]> = {
  // Q1 - Winter/early spring - icy blues and purples
  Q1: ['#64B5F6', '#90CAF9', '#CE93D8'],
  // Q2 - Spring/early summer - fresh greens and yellows
  Q2: ['#81C784', '#AED581', '#FFD54F'],
  // Q3 - Summer/early fall - warm oranges and reds
  Q3: ['#FF7043', '#FFAB91', '#FFD54F'],
  // Q4 - Fall/winter - amber and festive colors
  Q4: ['#E91E63', '#F48FB1', '#FFAB40'],
};

// Fallback colors (original)
const DEFAULT_COLORS: [string, string, string] = [
  '#ff6b35',
  '#f7c948',
  '#c6f135',
];

function getQuarterlyColors(quarter: string): [string, string, string] {
  return QUARTERLY_PALETTES[quarter] || DEFAULT_COLORS;
}

function JigglingMedal({ emoji }: { emoji: string }): ReactElement {
  const [isJiggling, setIsJiggling] = useState(false);

  useEffect(() => {
    // Random initial delay between 0-3 seconds
    const initialDelay = Math.random() * 3000;

    const startJiggleCycle = () => {
      setIsJiggling(true);

      // Jiggle for ~400ms
      setTimeout(() => {
        setIsJiggling(false);

        // Wait random time (2-5 seconds) before next jiggle
        const nextDelay = 2000 + Math.random() * 3000;
        setTimeout(startJiggleCycle, nextDelay);
      }, 400);
    };

    const timeout = setTimeout(startJiggleCycle, initialDelay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.span
      className={cardStyles.topTagMedal}
      animate={
        isJiggling
          ? {
              rotate: [0, -8, 8, -6, 6, -3, 3, 0],
              scale: [1, 1.1, 1.1, 1.05, 1.05, 1, 1, 1],
            }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {emoji}
    </motion.span>
  );
}

interface CardProps {
  data: LogData;
  isActive: boolean;
  subcard?: number;
  isTouchDevice?: boolean;
  cardType?: string;
  imageCache?: Map<string, Blob>;
  onImageFetched?: (cardType: string, blob: Blob) => void;
}

const TAG_ROTATIONS = [-0.8, 0.4, -1.2];

export default function CardTopicEvolution({
  data,
  isActive,
  subcard = 0,
  cardType,
  imageCache,
  onImageFetched,
}: CardProps): ReactElement {
  const currentQuarter = data.topicJourney[subcard];
  const isLastQuarter = subcard === data.topicJourney.length - 1;
  const isInactiveQuarter = currentQuarter?.inactive === true;
  const quarterlyColors = getQuarterlyColors(currentQuarter?.quarter || '');
  const carouselRef = useRef<HTMLDivElement>(null);

  const animatedTopics = useAnimatedNumber(data.uniqueTopics, {
    delay: 300,
    enabled: isActive && isLastQuarter,
  });

  // Scroll to center the active quarter
  useEffect(() => {
    if (carouselRef.current) {
      const activeItem = carouselRef.current.querySelector(
        `.${cardStyles.quarterCarouselItemActive}`,
      ) as HTMLElement;
      if (activeItem) {
        const container = carouselRef.current;
        const scrollLeft =
          activeItem.offsetLeft -
          container.offsetWidth / 2 +
          activeItem.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [subcard]);

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
          <span className={styles.headlineSmall}>
            Your interests, quarter by quarter
          </span>
        </motion.div>

        {/* Quarter carousel - static container, selection moves */}
        <div className={cardStyles.quarterCarouselWrapper}>
          <div className={cardStyles.quarterCarousel} ref={carouselRef}>
            {data.topicJourney.map((item, index) => {
              const isActiveQuarter = index === subcard;
              const isPast = index < subcard;
              const isAdjacent = Math.abs(index - subcard) === 1;
              const isQuarterInactive = item.inactive === true;

              return (
                <div
                  key={item.quarter}
                  className={`${cardStyles.quarterCarouselItem} ${
                    isActiveQuarter ? cardStyles.quarterCarouselItemActive : ''
                  } ${isPast ? cardStyles.quarterCarouselItemPast : ''} ${
                    isAdjacent ? cardStyles.quarterCarouselItemAdjacent : ''
                  } ${
                    isQuarterInactive
                      ? cardStyles.quarterCarouselItemInactive
                      : ''
                  }`}
                >
                  <span className={cardStyles.quarterCarouselLabel}>
                    {item.quarter}
                  </span>
                  {isActiveQuarter && (
                    <motion.div
                      className={cardStyles.quarterCarouselIndicator}
                      layoutId="quarterIndicator"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content that transitions on subcard change - split-flap airport display style */}
        <div className={cardStyles.topicContentWrapper}>
          {/* Top 3 tags for this quarter - stacked grid to prevent layout shift */}
          <div
            className={cardStyles.topTagsContainer}
            style={{ position: 'relative', display: 'grid' }}
          >
            {/* Tags - hidden when inactive to reserve space */}
            <div
              className={cardStyles.topTagsList}
              style={{
                gridArea: '1 / 1',
                visibility: isInactiveQuarter ? 'hidden' : 'visible',
              }}
            >
              {[0, 1, 2].map((index) => (
                <div key={index} className={cardStyles.flipCardContainer}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={`${subcard}-${index}`}
                      className={cardStyles.topTagItem}
                      style={{
                        background: quarterlyColors[index],
                        rotate: `${TAG_ROTATIONS[index]}deg`,
                      }}
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: 90, opacity: 0 }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    >
                      <JigglingMedal emoji={MEDAL_EMOJIS[index]} />
                      <span className={cardStyles.topTagName}>
                        {currentQuarter?.topics[index] || ''}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Inactive quarter overlay - stacked on same grid cell */}
            {isInactiveQuarter && (
              <motion.div
                className={cardStyles.inactiveQuarterMessage}
                style={{ gridArea: '1 / 1', placeSelf: 'center' }}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <span className={cardStyles.inactiveQuarterEmoji}>😴</span>
                <span className={cardStyles.inactiveQuarterText}>
                  Taking a break
                </span>
              </motion.div>
            )}
          </div>

          {/* Shared space for pivot indicator OR stats badge - placeholder always reserves space */}
          <div
            className={styles.statsBadges}
            style={{ position: 'relative', display: 'grid' }}
          >
            {/* Hidden placeholder to reserve consistent space */}
            <div
              className={styles.badge}
              style={{ visibility: 'hidden', gridArea: '1 / 1' }}
            >
              <span className={styles.badgeValue}>0</span>
              <span className={styles.badgeLabel}>
                Topics Explored This Year
              </span>
            </div>
            {/* Actual visible content stacked on same grid cell */}
            {currentQuarter?.comment && (
              <motion.div
                className={cardStyles.pivotBadge}
                style={{ gridArea: '1 / 1', placeSelf: 'center' }}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{
                  delay: 0.3,
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {currentQuarter.comment}
              </motion.div>
            )}
            {isLastQuarter && (
              <motion.div
                className={styles.badge}
                style={{ gridArea: '1 / 1', placeSelf: 'center' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className={styles.badgeValue}>{animatedTopics}</span>
                <span className={styles.badgeLabel}>
                  Topics Explored This Year
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Banner - reserve space always, animate visibility on last quarter */}
        <TopPercentileBanner
          preText="MORE CURIOUS THAN"
          mainText={`${100 - data.evolutionPercentile}%`}
          postText="OF DEVS"
          delay={isLastQuarter ? 0.5 : 0}
          motionProps={{
            initial: false,
            animate: {
              opacity: isLastQuarter ? 1 : 0,
              scaleX: isLastQuarter ? 1 : 0,
            },
            style: { visibility: isLastQuarter ? 'visible' : 'hidden' },
          }}
        />
      </div>

      {/* Share button - pushed to bottom, only active on last quarter */}
      <ShareStatButton
        delay={0.7}
        isActive={isActive && isLastQuarter}
        cardType={cardType}
        imageCache={imageCache}
        onImageFetched={onImageFetched}
        statText={`from ${data.topicJourney[0]?.topics[0] || 'exploring'} to ${
          data.topicJourney[data.topicJourney.length - 1]?.topics[0] ||
          'new things'
        } — my 2025 learning arc`}
      />
    </>
  );
}
