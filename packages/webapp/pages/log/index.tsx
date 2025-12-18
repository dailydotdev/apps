import type { ReactElement } from 'react';
import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useImagePreloader } from '@dailydotdev/shared/src/hooks/useImagePreloader';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { ARCHETYPES } from '../../types/log';
import {
  useCardNavigation,
  useLog,
  useBackgroundMusic,
} from '../../hooks/log/index';
import type { CardConfig } from '../../hooks/log/index';
import { CARD_THEMES, cardVariants } from '../../components/log/logTheme';
import styles from '../../components/log/Log.module.css';

// Card order for preloading
const SHAREABLE_CARDS = [
  'total-impact',
  'when-you-read',
  'topic-evolution',
  'favorite-sources',
  'community',
  'contributions',
  'records',
  'archetype',
  'share',
] as const;

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

export default function LogPage(): ReactElement {
  const { user, isLoggedIn, isAuthReady, tokenRefreshed } = useAuthContext();
  const { logEvent } = useLogContext();
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const hasLoggedImpression = useRef(false);
  const { displayToast } = useToastNotification();

  // Fetch log data from API
  const { data, isLoading: isDataLoading } = useLog(isLoggedIn);

  // Image cache for share images (progressive preloading)
  const [imageCache, setImageCache] = useState<Map<string, Blob>>(new Map());

  // Preload images (archetypes + source logos) during browser idle time
  const imagesToPreload = useMemo(() => {
    const archetypeUrls = Object.values(ARCHETYPES).map((a) => a.imageUrl);
    const sourceUrls = data?.topSources?.map((s) => s.logoUrl) ?? [];
    return [...archetypeUrls, ...sourceUrls];
  }, [data?.topSources]);
  useImagePreloader(imagesToPreload);

  // Callback for when a share image is fetched on-demand (from ShareStatButton)
  const handleImageFetched = useCallback((cardType: string, blob: Blob) => {
    setImageCache((prev) => new Map(prev).set(cardType, blob));
  }, []);

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
      { id: 'community', component: CardCommunityEngagement },
    ];

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
  }, [data?.hasContributions, data?.topicJourney?.length]);

  // Navigation with subcard support
  const { currentCard, currentSubcard, direction, goNext, goPrev, goToCard } =
    useCardNavigation(cards);

  const currentCardConfig = cards[currentCard];
  const CardComponent = currentCardConfig.component;
  const currentCardId = currentCardConfig.id;
  const directionValue = direction === 'next' ? 1 : -1;

  // Progressive preloading of share images (2 screens ahead)
  useEffect(() => {
    if (!user?.id || !tokenRefreshed || !isAuthReady || isDataLoading) {
      return;
    }

    const preloadAhead = async () => {
      // Find current card's position in shareable cards
      const currentIdx = SHAREABLE_CARDS.indexOf(
        currentCardId as (typeof SHAREABLE_CARDS)[number],
      );

      // Determine which cards to preload (next 2 shareable cards)
      const cardsToPreload: string[] = [];
      for (
        let i = currentIdx + 1;
        i < SHAREABLE_CARDS.length && cardsToPreload.length < 2;
        i++
      ) {
        const cardId = SHAREABLE_CARDS[i];
        // Skip contributions if user doesn't have any
        if (cardId === 'contributions' && !data?.hasContributions) {
          continue;
        }
        if (!imageCache.has(cardId)) {
          cardsToPreload.push(cardId);
        }
      }

      // Preload each card's image
      for (const cardId of cardsToPreload) {
        try {
          const response = await fetch(
            `${apiUrl}/log/images?card=${encodeURIComponent(cardId)}&userId=${encodeURIComponent(user.id)}`,
            { credentials: 'include' },
          );
          if (response.ok) {
            const blob = await response.blob();
            setImageCache((prev) => new Map(prev).set(cardId, blob));
          }
        } catch {
          // Silent fail - will retry on next navigation or fetch on demand
        }
      }
    };

    // Use requestIdleCallback for non-blocking preload
    if (typeof requestIdleCallback !== 'undefined') {
      const handle = requestIdleCallback(preloadAhead, { timeout: 5000 });
      return () => cancelIdleCallback(handle);
    }
    // Fallback for browsers without requestIdleCallback
    const timer = setTimeout(preloadAhead, 100);
    return () => clearTimeout(timer);
  }, [
    currentCardId,
    user?.id,
    tokenRefreshed,
    isAuthReady,
    isDataLoading,
    imageCache,
    data?.hasContributions,
  ]);

  // Background music management
  const { startMusic, isMuted, toggleMute } = useBackgroundMusic(currentCardId);

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

  // Track card views
  const previousCardRef = useRef<number | null>(null);
  useEffect(() => {
    if (previousCardRef.current === null) {
      previousCardRef.current = currentCard;
      return;
    }

    if (previousCardRef.current !== currentCard) {
      logEvent({
        event_name: LogEvent.ViewLogCard,
        extra: JSON.stringify({
          card: currentCardId,
          cardIndex: currentCard,
        }),
      });
      previousCardRef.current = currentCard;
    }
  }, [currentCard, currentCardId, logEvent]);

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
      startMusic();

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const { width } = rect;

      if (clickX < width * 0.3) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goNext, goPrev, startMusic],
  );

  // Handle card click from header (progress bars)
  const handleCardClick = useCallback(
    (index: number) => {
      startMusic();
      goToCard(index);
    },
    [startMusic, goToCard],
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

  return (
    <>
      <LogPageHead />

      <motion.div
        className={styles.logContainer}
        animate={{ backgroundColor: currentTheme.bgColor }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <LogBackground theme={currentTheme} />

        <LogHeader
          cards={cards}
          currentCard={currentCard}
          isMuted={isMuted}
          onMuteToggle={handleMuteToggle}
          onCardClick={handleCardClick}
        />

        {/* Cards with AnimatePresence - tap to navigate */}
        <div
          className={styles.cardsWrapper}
          onClick={handleTapNavigation}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              startMusic();
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
                  onImageFetched={handleImageFetched}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      <Toast autoDismissNotifications />
    </>
  );
}

// Disable the default layout for immersive experience
LogPage.getLayout = (page: ReactElement) => page;
