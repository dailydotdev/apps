import type { ReactElement } from 'react';
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogData } from '../types';
import { useAnimatedNumber } from '../hooks';
import styles from '../Log.module.css';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';
import TopPercentileBanner from './TopPercentileBanner';

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

// Seasonal color palettes - each month has its own vibe
const SEASONAL_PALETTES: Record<string, [string, string, string]> = {
  // Winter - icy blues and cool purples
  Jan: ['#64B5F6', '#90CAF9', '#CE93D8'],
  Feb: ['#7E57C2', '#B39DDB', '#80DEEA'],
  // Spring - fresh greens and soft pinks
  Mar: ['#81C784', '#A5D6A7', '#F48FB1'],
  Apr: ['#AED581', '#C5E1A5', '#CE93D8'],
  // Early Summer - warm yellows and bright greens
  May: ['#FFD54F', '#FFF176', '#81C784'],
  Jun: ['#FFCA28', '#FFE082', '#AED581'],
  // Peak Summer - hot oranges and reds
  Jul: ['#FF7043', '#FFAB91', '#FFD54F'],
  Aug: ['#FF5722', '#FF8A65', '#FFC107'],
  // Fall - amber, rust, warm earth tones
  Sep: ['#FFAB40', '#FFD180', '#A1887F'],
  Oct: ['#FF8A65', '#FFAB91', '#BCAAA4'],
  // Late Fall/Winter - deep festive colors
  Nov: ['#BA68C8', '#CE93D8', '#FFAB40'],
  Dec: ['#E91E63', '#F48FB1', '#FFD54F'],
};

// Fallback colors (original)
const DEFAULT_COLORS: [string, string, string] = [
  '#ff6b35',
  '#f7c948',
  '#c6f135',
];

function getSeasonalColors(month: string): [string, string, string] {
  return SEASONAL_PALETTES[month] || DEFAULT_COLORS;
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
}

const TAG_ROTATIONS = [-0.8, 0.4, -1.2];

export default function CardTopicEvolution({
  data,
  isActive,
  subcard = 0,
}: CardProps): ReactElement {
  const currentMonth = data.topicJourney[subcard];
  const isLastMonth = subcard === data.topicJourney.length - 1;
  const isInactiveMonth = currentMonth?.inactive === true;
  const seasonalColors = getSeasonalColors(currentMonth?.month || '');
  const carouselRef = useRef<HTMLDivElement>(null);

  // Count active months for context
  const activeMonthsCount = data.topicJourney.filter((m) => !m.inactive).length;
  const isPartialYear = activeMonthsCount < 12;

  const animatedTopics = useAnimatedNumber(data.uniqueTopics, {
    delay: 300,
    enabled: isActive && isLastMonth,
  });

  // Scroll to center the active month
  useEffect(() => {
    if (carouselRef.current) {
      const activeItem = carouselRef.current.querySelector(
        `.${cardStyles.monthCarouselItemActive}`,
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
      {/* Title */}
      <span className={cardStyles.topicEvolutionTitle}>
        How your interests shifted
      </span>

      {/* Month carousel - static container, selection moves */}
      <div className={cardStyles.monthCarouselWrapper}>
        <div className={cardStyles.monthCarousel} ref={carouselRef}>
          {data.topicJourney.map((item, index) => {
            const isActiveMonth = index === subcard;
            const isPast = index < subcard;
            const isAdjacent = Math.abs(index - subcard) === 1;
            const isMonthInactive = item.inactive === true;

            return (
              <div
                key={item.month}
                className={`${cardStyles.monthCarouselItem} ${
                  isActiveMonth ? cardStyles.monthCarouselItemActive : ''
                } ${isPast ? cardStyles.monthCarouselItemPast : ''} ${
                  isAdjacent ? cardStyles.monthCarouselItemAdjacent : ''
                } ${
                  isMonthInactive ? cardStyles.monthCarouselItemInactive : ''
                }`}
              >
                <span className={cardStyles.monthCarouselLabel}>
                  {item.month}
                </span>
                {isActiveMonth && (
                  <motion.div
                    className={cardStyles.monthCarouselIndicator}
                    layoutId="monthIndicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content that transitions on subcard change - split-flap airport display style */}
      <div className={cardStyles.topicContentWrapper}>
        {/* Top 3 tags for this month - stacked grid to prevent layout shift */}
        <div
          className={cardStyles.topTagsContainer}
          style={{ position: 'relative', display: 'grid' }}
        >
          {/* Tags - hidden when inactive to reserve space */}
          <div
            className={cardStyles.topTagsList}
            style={{
              gridArea: '1 / 1',
              visibility: isInactiveMonth ? 'hidden' : 'visible',
            }}
          >
            {[0, 1, 2].map((index) => (
              <div key={index} className={cardStyles.flipCardContainer}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`${subcard}-${index}`}
                    className={cardStyles.topTagItem}
                    style={{
                      background: seasonalColors[index],
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
                      {currentMonth?.topics[index] || ''}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Inactive month overlay - stacked on same grid cell */}
          {isInactiveMonth && (
            <motion.div
              className={cardStyles.inactiveMonthMessage}
              style={{ gridArea: '1 / 1', placeSelf: 'center' }}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <span className={cardStyles.inactiveMonthEmoji}>😴</span>
              <span className={cardStyles.inactiveMonthText}>
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
            <span className={styles.badgeLabel}>Topics Explored This Year</span>
          </div>
          {/* Actual visible content stacked on same grid cell */}
          {currentMonth?.comment && (
            <motion.div
              className={cardStyles.pivotBadge}
              style={{ gridArea: '1 / 1', placeSelf: 'center' }}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {currentMonth.comment}
            </motion.div>
          )}
          {isLastMonth && (
            <motion.div
              className={styles.badge}
              style={{ gridArea: '1 / 1', placeSelf: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className={styles.badgeValue}>{animatedTopics}</span>
              <span className={styles.badgeLabel}>
                Topics Explored This Year
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Banner - reserve space always, animate visibility on last month */}
      <TopPercentileBanner
        preText="MORE CURIOUS THAN"
        mainText={`${100 - data.evolutionPercentile}%`}
        postText="OF DEVS"
        delay={isLastMonth ? 0.5 : 0}
        motionProps={{
          initial: false,
          animate: {
            opacity: isLastMonth ? 1 : 0,
            scaleX: isLastMonth ? 1 : 0,
          },
          style: { visibility: isLastMonth ? 'visible' : 'hidden' },
        }}
      />

      {/* Share button - absolutely positioned, only active on last month */}
      <ShareStatButton
        delay={0.8}
        isActive={isActive && isLastMonth}
        statText={(() => {
          const pivotTopic = data.pivotMonth
            ? data.topicJourney.find((t) => t.month === data.pivotMonth)
                ?.topics[0]
            : null;

          const baseText = `I explored ${
            data.uniqueTopics
          } different topics on daily.dev${
            isPartialYear ? ` in ${activeMonthsCount} months` : ' this year'
          }! 🚀`;

          const pivotText = pivotTopic
            ? `\n\nMy big pivot: #${pivotTopic}`
            : '';

          return `${baseText}${pivotText}\n\nMore curious than ${
            100 - data.evolutionPercentile
          }% of developers`;
        })()}
      />
    </>
  );
}
