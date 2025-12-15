import type { ReactElement } from 'react';
import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_LOG_DATA, ARCHETYPES } from '../../types/log';
import type { LogData } from '../../types/log';
import { useCardNavigation } from '../../hooks/log';
import type { CardConfig } from '../../hooks/log';
import styles from '../../components/log/Log.module.css';

// Card components
import CardTotalImpact from '../../components/log/CardTotalImpact';
import CardWhenYouRead from '../../components/log/CardWhenYouRead';
import CardTopicEvolution from '../../components/log/CardTopicEvolution';
import CardFavoriteSources from '../../components/log/CardFavoriteSources';
import CardCommunityEngagement from '../../components/log/CardCommunityEngagement';
import CardContributions from '../../components/log/CardContributions';
import CardRecords from '../../components/log/CardRecords';
import CardArchetypeReveal from '../../components/log/CardArchetypeReveal';
import CardShare from '../../components/log/CardShare';

// Per-card theme configurations for subtle variety
interface CardTheme {
  bgColor: string;
  burstColor: string;
  decorations: { char: string; color: string }[];
}

// Design system colors from daily.dev palette
const PALETTE = {
  pepper90: '#0E1217',
  pepper80: '#17191F',
  pepper70: '#1C1F26',
  bun40: '#FF8E3B',
  cheese40: '#FFE923',
  cabbage40: '#CE3DF3',
  lettuce40: '#ACF535',
  water40: '#427EF7',
  water20: '#5C9BFA',
  blueCheese40: '#2CDCE6',
  onion40: '#7147ED',
  onion10: '#9D70F8',
  salt0: '#FFFFFF',
};

const CARD_THEMES: Record<string, CardTheme> = {
  'total-impact': {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(206, 61, 243, 0.08)', // cabbage.40 at 8%
    decorations: [
      { char: '✦', color: PALETTE.cheese40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✴', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✴', color: PALETTE.cheese40 },
    ],
  },
  'when-you-read': {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(66, 126, 247, 0.08)', // water.40 at 8%
    decorations: [
      { char: '✧', color: PALETTE.water40 },
      { char: '★', color: PALETTE.water20 },
      { char: '◇', color: PALETTE.lettuce40 },
      { char: '✦', color: PALETTE.water40 },
      { char: '✧', color: PALETTE.salt0 },
      { char: '★', color: PALETTE.water20 },
    ],
  },
  'topic-evolution': {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(172, 245, 53, 0.06)', // lettuce.40 at 6%
    decorations: [
      { char: '◆', color: PALETTE.lettuce40 },
      { char: '▸', color: PALETTE.blueCheese40 },
      { char: '✦', color: PALETTE.lettuce40 },
      { char: '◆', color: PALETTE.blueCheese40 },
      { char: '▸', color: PALETTE.lettuce40 },
      { char: '✴', color: PALETTE.cheese40 },
    ],
  },
  'favorite-sources': {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(255, 142, 59, 0.08)', // bun.40 at 8%
    decorations: [
      { char: '♦', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✦', color: PALETTE.bun40 },
      { char: '♦', color: PALETTE.cheese40 },
      { char: '✴', color: PALETTE.cabbage40 },
      { char: '★', color: PALETTE.bun40 },
    ],
  },
  community: {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(157, 112, 248, 0.08)', // onion.10 at 8%
    decorations: [
      { char: '✦', color: PALETTE.onion10 },
      { char: '◇', color: PALETTE.cabbage40 },
      { char: '★', color: PALETTE.onion10 },
      { char: '✴', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.lettuce40 },
      { char: '◇', color: PALETTE.onion10 },
    ],
  },
  contributions: {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(157, 112, 248, 0.08)', // onion.10 at 8%
    decorations: [
      { char: '✴', color: PALETTE.onion10 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✦', color: PALETTE.onion10 },
      { char: '✴', color: PALETTE.lettuce40 },
      { char: '★', color: PALETTE.onion10 },
      { char: '✦', color: PALETTE.cheese40 },
    ],
  },
  records: {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(206, 61, 243, 0.06)', // cabbage.40 at 6%
    decorations: [
      { char: '★', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.lettuce40 },
      { char: '◆', color: PALETTE.cabbage40 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✴', color: PALETTE.lettuce40 },
      { char: '✦', color: PALETTE.cabbage40 },
    ],
  },
  archetype: {
    bgColor: PALETTE.pepper90, // Will be overridden dynamically
    burstColor: 'rgba(206, 61, 243, 0.1)', // cabbage.40 at 10%
    decorations: [
      { char: '✦', color: PALETTE.cheese40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✴', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✴', color: PALETTE.cheese40 },
    ],
  },
  share: {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(172, 245, 53, 0.08)', // lettuce.40 at 8%
    decorations: [
      { char: '✧', color: PALETTE.lettuce40 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✦', color: PALETTE.cabbage40 },
      { char: '✧', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✴', color: PALETTE.cheese40 },
    ],
  },
};

// Star positions (consistent across cards)
const STAR_POSITIONS = [
  { top: '12%', left: '8%', size: '1.75rem', delay: 0 },
  { top: '22%', right: '12%', size: '1.25rem', delay: 0.5 },
  { bottom: '28%', left: '6%', size: '1.5rem', delay: 1 },
  { bottom: '18%', right: '10%', size: '1.75rem', delay: 1.5 },
  { top: '45%', left: '4%', size: '1rem', delay: 2 },
  { top: '55%', right: '5%', size: '1.25rem', delay: 2.5 },
];

interface LogPageProps {
  data?: LogData;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    rotate: direction > 0 ? 5 : -5,
    scale: 0.8,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    rotate: direction < 0 ? 5 : -5,
    scale: 0.8,
  }),
};

export default function LogPage({
  data = MOCK_LOG_DATA,
}: LogPageProps): ReactElement {
  // Prevent horizontal scrollbar on the page
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  // Build card list (conditionally include contributions)
  // Cards can have optional subcards for multi-step content within a single card
  const cards: CardConfig[] = useMemo(() => {
    const baseCards: CardConfig[] = [
      { id: 'total-impact', component: CardTotalImpact },
      { id: 'when-you-read', component: CardWhenYouRead },
      {
        id: 'topic-evolution',
        component: CardTopicEvolution,
        subcards: data.topicJourney.length - 1, // One subcard per month
      },
      { id: 'favorite-sources', component: CardFavoriteSources },
      { id: 'community', component: CardCommunityEngagement },
    ];

    if (data.hasContributions) {
      baseCards.push({
        id: 'contributions',
        component: CardContributions,
      });
    }

    baseCards.push(
      { id: 'records', component: CardRecords },
      { id: 'archetype', component: CardArchetypeReveal },
      { id: 'share', component: CardShare },
    );

    return baseCards;
  }, [data.hasContributions, data.topicJourney?.length]);

  // Navigation with subcard support - only swipe triggers transitions
  const { currentCard, currentSubcard, direction, goNext, goPrev } =
    useCardNavigation(cards);

  const currentCardConfig = cards[currentCard];
  const maxSubcard = currentCardConfig?.subcards || 0;
  const hasSubcards = maxSubcard > 0;
  const isLastCard =
    currentCard === cards.length - 1 && currentSubcard === maxSubcard;
  const CardComponent = currentCardConfig.component;

  // Determine direction value for variants
  const directionValue = direction === 'next' ? 1 : -1;

  // Get current card's theme (with archetype-specific override)
  const currentCardId = cards[currentCard].id;
  const currentTheme = useMemo(() => {
    const baseTheme = CARD_THEMES[currentCardId] || CARD_THEMES['total-impact'];

    // Special handling for archetype card - tint based on user's archetype
    if (currentCardId === 'archetype') {
      const archetypeColor = ARCHETYPES[data.archetype].color;
      return {
        ...baseTheme,
        burstColor: `${archetypeColor}15`, // 15 = ~8% opacity in hex
        decorations: baseTheme.decorations.map((d, i) => ({
          ...d,
          color: i % 2 === 0 ? archetypeColor : d.color,
        })),
      };
    }

    return baseTheme;
  }, [currentCardId, data.archetype]);

  return (
    <>
      <Head>
        <title>Your 2025 Log | daily.dev</title>
        <meta name="description" content="Your year in review on daily.dev" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {/* Uses app's standard fonts from design system */}
      </Head>

      <motion.div
        className={styles.logContainer}
        animate={{
          backgroundColor: currentTheme.bgColor,
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
      >
        {/* Background effects - animated burst color */}
        <motion.div
          className={styles.backgroundBurst}
          animate={{
            background: `repeating-conic-gradient(
              from 0deg at 50% 50%,
              ${currentTheme.bgColor} 0deg 10deg,
              ${currentTheme.burstColor} 10deg 20deg
            )`,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
          }}
        />

        {/* Decorative stars - Animated with per-card theming */}
        <div className={styles.decorations}>
          {STAR_POSITIONS.map((pos, i) => {
            const decoration = currentTheme.decorations[i];
            const positionKey = `${pos.top || ''}-${pos.bottom || ''}-${
              pos.left || ''
            }-${pos.right || ''}-${pos.size}`;
            return (
              <motion.div
                key={`star-${positionKey}`}
                className={styles.star}
                style={{
                  top: pos.top,
                  left: pos.left,
                  right: pos.right,
                  bottom: pos.bottom,
                  fontSize: pos.size,
                }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 10, -5, 0],
                  color: decoration.color,
                }}
                transition={{
                  y: {
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: pos.delay,
                  },
                  rotate: {
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: pos.delay,
                  },
                  color: {
                    duration: 0.5,
                    ease: 'easeInOut',
                  },
                }}
              >
                {decoration.char}
              </motion.div>
            );
          })}
        </div>

        {/* Header with logo and progress */}
        <header className={styles.header}>
          <img
            src="/assets/icon-light.svg"
            alt="daily.dev"
            className={styles.logo}
          />
          <div className={styles.progressDots}>
            {cards.map((card, index) => {
              let className = styles.progressDot;
              if (index === currentCard) {
                className += ` ${styles.active}`;
              } else if (index < currentCard) {
                className += ` ${styles.completed}`;
              }
              return (
                <motion.div
                  key={card.id}
                  className={className}
                  animate={{
                    scale: index === currentCard ? 1.5 : 1,
                    opacity: index <= currentCard ? 1 : 0.3,
                  }}
                />
              );
            })}
          </div>
        </header>

        {/* Cards with AnimatePresence */}
        <div className={styles.cardsWrapper}>
          <AnimatePresence
            initial={false}
            custom={directionValue}
            mode="popLayout"
          >
            <motion.div
              key={currentCard}
              custom={directionValue}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                rotate: { duration: 0.4 },
                scale: { duration: 0.4 },
              }}
              className={styles.card}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={hasSubcards ? 0 : 1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  goNext();
                } else if (swipe > swipeConfidenceThreshold) {
                  goPrev();
                }
              }}
            >
              <div className={styles.cardInner}>
                <CardComponent data={data} isActive subcard={currentSubcard} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation prompt */}
        {!isLastCard && (
          <motion.div
            className={styles.navPrompt}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <span>Swipe</span>
            <motion.div
              className={styles.navArrow}
              animate={{ x: [0, 5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'easeInOut',
              }}
            >
              →
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}

// Disable the default layout for immersive experience
LogPage.getLayout = (page: ReactElement) => page;
