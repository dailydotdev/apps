import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import Head from 'next/head';
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

export default function LogPage({ data = MOCK_LOG_DATA }: LogPageProps): ReactElement {
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

  const {
    currentCard,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTap,
  } = useCardNavigation(cards.length);

  const isLastCard = currentCard === cards.length - 1;

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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        {/* Background effects */}
        <div className={styles.backgroundBurst} />

        {/* Decorative stars */}
        <div className={styles.decorations}>
          <div className={`${styles.star} ${styles.star1}`}>✦</div>
          <div className={`${styles.star} ${styles.star2}`}>★</div>
          <div className={`${styles.star} ${styles.star3}`}>✴</div>
          <div className={`${styles.star} ${styles.star4}`}>✦</div>
          <div className={`${styles.star} ${styles.star5}`}>★</div>
          <div className={`${styles.star} ${styles.star6}`}>✴</div>
        </div>

        {/* Header with logo and progress */}
        <header className={styles.header}>
          <div className={styles.logoBadge}>
            <img src="/assets/icon-light.svg" alt="daily.dev" className={styles.logo} />
          </div>
          <div className={styles.progressDots}>
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`${styles.progressDot} ${
                  index === currentCard
                    ? styles.active
                    : index < currentCard
                      ? styles.completed
                      : ''
                }`}
              />
            ))}
          </div>
        </header>

        {/* Cards */}
        <div className={styles.cardsWrapper}>
          {cards.map((card, index) => {
            const CardComponent = card.component;
            const isActive = index === currentCard;

            return (
              <div
                key={card.id}
                className={`${styles.card} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.cardInner}>
                  <CardComponent
                    data={data}
                    cardNumber={index + 1}
                    totalCards={cards.length}
                    cardLabel={card.label}
                    isActive={isActive}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation prompt */}
        {!isLastCard && (
          <div className={styles.navPrompt}>
            <span>Swipe</span>
            <div className={styles.navArrow}>→</div>
          </div>
        )}
      </div>
    </>
  );
}

// Disable the default layout for immersive experience
LogPage.getLayout = (page: ReactElement) => page;
