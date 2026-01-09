import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useImagePreloader } from '@dailydotdev/shared/src/hooks/useImagePreloader';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import ProtectedPage from '../../components/ProtectedPage';
import { ARCHETYPES } from '../../types/log';
import {
  useCardNavigation,
  useLog,
  useBackgroundMusic,
  useShareImagePreloader,
} from '../../hooks/log/index';
import type { CardConfig, NavigationEvent } from '../../hooks/log/index';
import { CARD_THEMES, cardVariants } from '../../components/log/logTheme';
import styles from '../../components/log/Log.module.css';

// Components
import LogPageHead from '../../components/log/LogPageHead';
import LogHeader from '../../components/log/LogHeader';
import LogBackground from '../../components/log/LogBackground';

// Card components
import CardWelcome from '../../components/log/CardWelcome';
import CardTotalImpact from '../../components/log/CardTotalImpact';
import CardWhenYouRead from '../../components/log/CardWhenYouRead';
import CardTopicEvolution from '../../components/log/CardTopicEvolution';
import CardFavoriteSources from '../../components/log/CardFavoriteSources';
import CardCommunityEngagement from '../../components/log/CardCommunityEngagement';
import CardContributions from '../../components/log/CardContributions';
import CardRecords from '../../components/log/CardRecords';
import CardArchetypeReveal from '../../components/log/CardArchetypeReveal';
import CardShare from '../../components/log/CardShare';
import CardNoData from '../../components/log/CardNoData';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    notFound: true,
  };
};

// Default theme for no-data state (welcome card theme)
const noDataTheme = CARD_THEMES.welcome;

export default function LogPage(): ReactElement {
  const router = useRouter();
  const { userId } = router.query;
  const { user, isLoggedIn, isAuthReady, tokenRefreshed } = useAuthContext();
  const { logEvent } = useLogContext();
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const hasLoggedImpression = useRef(false);
  const { displayToast } = useToastNotification();

  // Fetch log data from API
  const {
    data,
    isLoading: isDataLoading,
    hasData,
  } = useLog({
    enabled: isLoggedIn,
    userId: typeof userId === 'string' ? userId : undefined,
  });

  // Preload images (archetypes + source logos) during browser idle time
  const imagesToPreload = useMemo(() => {
    const archetypeUrls = Object.values(ARCHETYPES).map((a) => a.imageUrl);
    const sourceUrls = data?.topSources?.map((s) => s.logoUrl) ?? [];
    return [...archetypeUrls, ...sourceUrls];
  }, [data?.topSources]);
  useImagePreloader(imagesToPreload);

  // Track page landing impression
  useEffect(() => {
    if (hasLoggedImpression.current) {
      return;
    }

    hasLoggedImpression.current = true;
    logEvent({
      event_name: LogEvent.ViewLogPage,
    });
  }, [logEvent]);

  // Combine auth and data loading states
  const isLoading = !isAuthReady || isDataLoading;

  // Detect touch vs non-touch device
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);
  }, []);

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
  const cards: CardConfig[] = useMemo(() => {
    const baseCards: CardConfig[] = [
      { id: 'welcome', component: CardWelcome },
      { id: 'total-impact', component: CardTotalImpact },
      { id: 'when-you-read', component: CardWhenYouRead },
      {
        id: 'topic-evolution',
        component: CardTopicEvolution,
        subcards: (data?.topicJourney?.length ?? 1) - 1,
      },
      { id: 'favorite-sources', component: CardFavoriteSources },
    ];

    // Only include community card if user has any interactions
    const hasInteractions =
      (data?.upvotesGiven ?? 0) +
        (data?.commentsWritten ?? 0) +
        (data?.postsBookmarked ?? 0) >
      0;
    if (hasInteractions) {
      baseCards.push({ id: 'community', component: CardCommunityEngagement });
    }

    if (data?.hasContributions) {
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
  }, [
    data?.hasContributions,
    data?.topicJourney?.length,
    data?.upvotesGiven,
    data?.commentsWritten,
    data?.postsBookmarked,
  ]);

  // Ref for navigation callback to avoid circular dependency with useCardNavigation
  const onNavigateRef = useRef<(event: NavigationEvent) => void>(() => {});

  // Navigation with subcard support (passes callback via ref)
  const { currentCard, currentSubcard, direction, goNext, goPrev, goToCard } =
    useCardNavigation(cards, (event) => onNavigateRef.current(event));

  const currentCardConfig = cards[currentCard];
  const CardComponent = currentCardConfig.component;
  const currentCardId = currentCardConfig.id;
  const directionValue = direction === 'next' ? 1 : -1;

  // Progressive preloading of share images (2 screens ahead)
  const { imageCache, onImageFetched } = useShareImagePreloader({
    currentCardId,
    userId: user?.id,
    isReady: tokenRefreshed && isAuthReady && !isDataLoading,
    hasContributions: data?.hasContributions ?? false,
  });

  // Background music management
  const { startMusic, isMuted, toggleMute } = useBackgroundMusic(currentCardId);

  // Navigation callback - starts music and logs card views
  onNavigateRef.current = (event: NavigationEvent) => {
    startMusic();

    if (event.isCardChange) {
      logEvent({
        event_name: LogEvent.ViewLogCard,
        extra: JSON.stringify({
          card: event.cardId,
          cardIndex: event.cardIndex,
        }),
      });
    }
  };

  // Handle mute toggle with toast messages
  const handleMuteToggle = useCallback(() => {
    toggleMute();
    const muteMessages = [
      '🦻 Your eardrums have been spared',
      '🙉 Your neighbors thank you',
      "🔇 Okay okay, we'll shut up",
      '😶 *sad DJ noises*',
    ];
    const unmuteMessages = [
      '🎵 The vibes are BACK!',
      '🔊 Let the beats drop!',
      "🎶 You couldn't resist, could you?",
      '🎧 Music makes the code go round',
    ];
    const messages = isMuted ? unmuteMessages : muteMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    displayToast(randomMessage);
  }, [toggleMute, isMuted, displayToast]);

  // Share analytics callback
  const handleShare = useCallback(() => {
    logEvent({
      event_name: LogEvent.ShareLog,
      extra: JSON.stringify({
        archetype: data?.archetype,
        card: currentCardId,
        cardIndex: currentCard,
      }),
    });
  }, [logEvent, data?.archetype, currentCardId, currentCard]);

  // Handle tap navigation (like Instagram stories)
  const handleTapNavigation = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const { width } = rect;

      if (clickX < width * 0.3) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goNext, goPrev],
  );

  // Get current card's theme (with archetype-specific override)
  const currentTheme = useMemo(() => {
    const baseTheme = CARD_THEMES[currentCardId] || CARD_THEMES['total-impact'];

    if (currentCardId === 'archetype' && data?.archetype) {
      const archetypeColor = ARCHETYPES[data.archetype].color;
      return {
        ...baseTheme,
        burstColor: `${archetypeColor}15`,
        decorations: baseTheme.decorations.map((d, i) => ({
          ...d,
          color: i % 2 === 0 ? archetypeColor : d.color,
        })),
      };
    }

    return baseTheme;
  }, [currentCardId, data?.archetype]);

  // Show "no data" experience if user doesn't have enough 2025 data
  const showNoDataCard = !isLoading && !hasData;

  return (
    <ProtectedPage>
      <LogPageHead />

      <motion.div
        className={styles.logContainer}
        animate={{
          backgroundColor: showNoDataCard
            ? noDataTheme.bgColor
            : currentTheme.bgColor,
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <LogBackground theme={showNoDataCard ? noDataTheme : currentTheme} />

        {/* Only show header with progress bars when user has data */}
        {!showNoDataCard && (
          <LogHeader
            cards={cards}
            currentCard={currentCard}
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
            onCardClick={goToCard}
          />
        )}

        {showNoDataCard ? (
          /* No data card - single card, no navigation */
          <div className={styles.cardsWrapper}>
            <div className={styles.card}>
              <div className={styles.cardInner}>
                <CardNoData />
              </div>
            </div>
          </div>
        ) : (
          /* Cards with AnimatePresence - tap to navigate */
          <div
            className={styles.cardsWrapper}
            onClick={handleTapNavigation}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                goNext();
              }
            }}
          >
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
              >
                <div className={styles.cardInner}>
                  <CardComponent
                    data={data}
                    isActive
                    subcard={currentSubcard}
                    isTouchDevice={isTouchDevice}
                    isLoading={isLoading}
                    onShare={handleShare}
                    cardType={currentCardId}
                    imageCache={imageCache}
                    onImageFetched={onImageFetched}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      <Toast autoDismissNotifications />
    </ProtectedPage>
  );
}

// Disable the default layout for immersive experience
LogPage.getLayout = (page: ReactElement) => page;
