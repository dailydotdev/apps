import type { ReactElement } from 'react';
import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import ParallaxTilt from 'react-parallax-tilt';
import { MOCK_LOG_DATA } from './types';
import type { LogData } from './types';
import { useCardNavigation } from './hooks';
import styles from './Log.module.css';

// Card components
import CardTotalImpact from './cards/CardTotalImpact';
import CardWhenYouRead from './cards/CardWhenYouRead';
import CardTopicEvolution from './cards/CardTopicEvolution';
import CardFavoriteSources from './cards/CardFavoriteSources';
import CardCommunityEngagement from './cards/CardCommunityEngagement';
import CardContributions from './cards/CardContributions';
import CardRecords from './cards/CardRecords';
import CardArchetypeReveal from './cards/CardArchetypeReveal';
import CardShare from './cards/CardShare';

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

export default function LogPage({ data = MOCK_LOG_DATA }: LogPageProps): ReactElement {
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
  const cards = useMemo(() => {
    const baseCards = [
      { id: 'total-impact', label: 'TOTAL IMPACT', component: CardTotalImpact },
      { id: 'when-you-read', label: 'WHEN YOU READ', component: CardWhenYouRead },
      { id: 'topic-evolution', label: 'TOPIC EVOLUTION', component: CardTopicEvolution },
      { id: 'favorite-sources', label: 'FAVORITE SOURCES', component: CardFavoriteSources },
      { id: 'community', label: 'COMMUNITY', component: CardCommunityEngagement },
    ];

    if (data.hasContributions) {
      baseCards.push({
        id: 'contributions',
        label: 'YOUR CONTRIBUTIONS',
        component: CardContributions,
      });
    }

    baseCards.push(
      { id: 'records', label: 'YOUR RECORDS', component: CardRecords },
      { id: 'archetype', label: 'YOUR ARCHETYPE', component: CardArchetypeReveal },
      { id: 'share', label: 'SHARE', component: CardShare },
    );

    return baseCards;
  }, [data.hasContributions]);

  // We only need basic state from the hook now, gestures are handled by Framer Motion
  const {
    currentCard,
    direction,
    goNext,
    goPrev,
    handleTap,
  } = useCardNavigation(cards.length);

  const isLastCard = currentCard === cards.length - 1;
  const CardComponent = cards[currentCard].component;
  const currentCardData = cards[currentCard];

  // Determine direction value for variants
  const directionValue = direction === 'next' ? 1 : -1;

  return (
    <>
      <Head>
        <title>Your 2025 Log | daily.dev</title>
        <meta name="description" content="Your year in review on daily.dev" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className={styles.logContainer}
        onClick={handleTap}
      >
        {/* Background effects */}
        <div className={styles.backgroundBurst} />

        {/* Decorative stars - Animated with Framer Motion for smoothness */}
        <div className={styles.decorations}>
          {[
            { className: styles.star1, char: '✦', delay: 0 },
            { className: styles.star2, char: '★', delay: 0.5 },
            { className: styles.star3, char: '✴', delay: 1 },
            { className: styles.star4, char: '✦', delay: 1.5 },
            { className: styles.star5, char: '★', delay: 2 },
            { className: styles.star6, char: '✴', delay: 2.5 },
          ].map((star, i) => (
            <motion.div
              key={i}
              className={`${styles.star} ${star.className}`}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, -5, 0],
              }}
              transition={{
                duration: 4 + i * 0.5, // Vary duration
                repeat: Infinity,
                ease: "easeInOut",
                delay: star.delay,
              }}
            >
              {star.char}
            </motion.div>
          ))}
        </div>

        {/* Header with logo and progress */}
        <header className={styles.header}>
          <motion.div 
            className={styles.logoBadge}
            initial={{ y: -50, rotate: -10 }}
            animate={{ y: 0, rotate: -2 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <img src="/assets/icon-light.svg" alt="daily.dev" className={styles.logo} />
          </motion.div>
          <div className={styles.progressDots}>
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                className={`${styles.progressDot} ${
                  index === currentCard
                    ? styles.active
                    : index < currentCard
                      ? styles.completed
                      : ''
                }`}
                animate={{
                  scale: index === currentCard ? 1.5 : 1,
                  opacity: index <= currentCard ? 1 : 0.3
                }}
              />
            ))}
          </div>
        </header>

        {/* Cards with AnimatePresence */}
        <div className={styles.cardsWrapper}>
          <AnimatePresence initial={false} custom={directionValue} mode="popLayout">
            <motion.div
              key={currentCard}
              custom={directionValue}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                rotate: { duration: 0.4 },
                scale: { duration: 0.4 }
              }}
              className={styles.card}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  goNext();
                } else if (swipe > swipeConfidenceThreshold) {
                  goPrev();
                }
              }}
            >
              <ParallaxTilt
                tiltMaxAngleX={5}
                tiltMaxAngleY={5}
                scale={1}
                transitionSpeed={2000}
                className={styles.cardInner}
              >
                <CardComponent
                  data={data}
                  cardNumber={currentCard + 1}
                  totalCards={cards.length}
                  cardLabel={currentCardData.label}
                  isActive={true} // Always active when mounted in AnimatePresence
                />
              </ParallaxTilt>
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
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              →
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  );
}

// Disable the default layout for immersive experience
LogPage.getLayout = (page: ReactElement) => page;
