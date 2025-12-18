import type { ReactElement } from 'react';
import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  VolumeIcon,
  VolumeOffIcon,
} from '@dailydotdev/shared/src/components/icons';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useImagePreloader } from '@dailydotdev/shared/src/hooks/useImagePreloader';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { ARCHETYPES } from '../../types/log';
import { useCardNavigation, useLog } from '../../hooks/log';
import type { CardConfig } from '../../hooks/log';
import styles from '../../components/log/Log.module.css';

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

// Card to background music track mapping (1.mp3, 2.mp3, 3.mp3)
const CARD_TO_TRACK: Record<string, number> = {
  welcome: 0,
  'total-impact': 0,
  'when-you-read': 0,
  'topic-evolution': 0,
  'favorite-sources': 1,
  community: 1,
  contributions: 1,
  records: 1,
  archetype: 2,
  share: 2,
};

// Custom hook for background music management
const useBackgroundMusic = (currentCardId: string) => {
  const audiosRef = useRef<HTMLAudioElement[]>([]);
  const currentTrackRef = useRef<number>(-1);
  const hasStartedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  const targetTrack = CARD_TO_TRACK[currentCardId] ?? 0;

  // Initialize, preload, and attempt autoplay
  useEffect(() => {
    audiosRef.current = [1, 2, 3].map((n) => {
      const audio = new Audio(`/assets/log/${n}.mp3`);
      audio.loop = true;
      audio.preload = 'auto';
      return audio;
    });

    // Attempt autoplay on first track
    audiosRef.current[0]
      ?.play()
      .then(() => {
        hasStartedRef.current = true;
        currentTrackRef.current = 0;
      })
      .catch(() => {
        // Autoplay blocked - will start on user interaction
      });

    return () => {
      audiosRef.current.forEach((audio) => {
        audio.pause();
        // eslint-disable-next-line no-param-reassign
        audio.src = '';
      });
    };
  }, []);

  // Switch tracks when card section changes
  useEffect(() => {
    if (!hasStartedRef.current || currentTrackRef.current === targetTrack) {
      return;
    }

    audiosRef.current[currentTrackRef.current]?.pause();
    if (!isMuted) {
      audiosRef.current[targetTrack]?.play().catch(() => {});
    }
    currentTrackRef.current = targetTrack;
  }, [targetTrack, isMuted]);

  // Manual start for when autoplay was blocked
  const startMusic = useCallback(() => {
    if (hasStartedRef.current) {
      return;
    }

    audiosRef.current[targetTrack]
      ?.play()
      .then(() => {
        hasStartedRef.current = true;
        currentTrackRef.current = targetTrack;
      })
      .catch(() => {});
  }, [targetTrack]);

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      audiosRef.current.forEach((audio) => {
        // eslint-disable-next-line no-param-reassign
        audio.muted = newMuted;
      });
      return newMuted;
    });
  }, []);

  return { startMusic, isMuted, toggleMute };
};

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
  pepperWarm: '#1A1410', // Warm dark variant for welcome screen
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
  welcome: {
    bgColor: PALETTE.pepperWarm,
    burstColor: 'rgba(255, 142, 59, 0.08)', // bun.40 at 8% - warm orange glow
    decorations: [
      { char: '✦', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✶', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.cheese40 },
      { char: '★', color: PALETTE.bun40 },
      { char: '✶', color: PALETTE.onion10 },
    ],
  },
  'total-impact': {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(206, 61, 243, 0.08)', // cabbage.40 at 8%
    decorations: [
      { char: '✦', color: PALETTE.cheese40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✶', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✶', color: PALETTE.cheese40 },
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
      { char: '✶', color: PALETTE.cheese40 },
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
      { char: '✶', color: PALETTE.cabbage40 },
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
      { char: '✶', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.lettuce40 },
      { char: '◇', color: PALETTE.onion10 },
    ],
  },
  contributions: {
    bgColor: PALETTE.pepper90,
    burstColor: 'rgba(157, 112, 248, 0.08)', // onion.10 at 8%
    decorations: [
      { char: '✶', color: PALETTE.onion10 },
      { char: '★', color: PALETTE.cheese40 },
      { char: '✦', color: PALETTE.onion10 },
      { char: '✶', color: PALETTE.lettuce40 },
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
      { char: '✶', color: PALETTE.lettuce40 },
      { char: '✦', color: PALETTE.cabbage40 },
    ],
  },
  archetype: {
    bgColor: PALETTE.pepper90, // Will be overridden dynamically
    burstColor: 'rgba(206, 61, 243, 0.1)', // cabbage.40 at 10%
    decorations: [
      { char: '✦', color: PALETTE.cheese40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✶', color: PALETTE.cabbage40 },
      { char: '✦', color: PALETTE.bun40 },
      { char: '★', color: PALETTE.lettuce40 },
      { char: '✶', color: PALETTE.cheese40 },
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
      { char: '✶', color: PALETTE.cheese40 },
    ],
  },
};

// Star positions (consistent across cards)
const STAR_POSITIONS = [
  { top: '18%', left: '8%', size: '1.75rem', delay: 0 },
  { top: '25%', right: '12%', size: '1.25rem', delay: 0.5 },
  { bottom: '28%', left: '6%', size: '1.5rem', delay: 1 },
  { bottom: '18%', right: '10%', size: '1.75rem', delay: 1.5 },
  { top: '45%', left: '4%', size: '1rem', delay: 2 },
  { top: '55%', right: '5%', size: '1.25rem', delay: 2.5 },
];

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

export default function LogPage(): ReactElement {
  const router = useRouter();
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const hasLoggedImpression = useRef(false);

  // Fetch log data from API
  const { data, isLoading: isDataLoading } = useLog(isLoggedIn);

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
    // Check for coarse pointer (touch) - fine pointer indicates mouse/trackpad
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
  // Cards can have optional subcards for multi-step content within a single card
  const cards: CardConfig[] = useMemo(() => {
    const baseCards: CardConfig[] = [
      { id: 'welcome', component: CardWelcome },
      { id: 'total-impact', component: CardTotalImpact },
      { id: 'when-you-read', component: CardWhenYouRead },
      {
        id: 'topic-evolution',
        component: CardTopicEvolution,
        subcards: (data?.topicJourney?.length ?? 1) - 1, // One subcard per quarter
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

  // Navigation with subcard support - tap triggers transitions
  const { currentCard, currentSubcard, direction, goNext, goPrev, goToCard } =
    useCardNavigation(cards);

  const currentCardConfig = cards[currentCard];
  const CardComponent = currentCardConfig.component;
  const currentCardId = currentCardConfig.id;

  // Determine direction value for variants
  const directionValue = direction === 'next' ? 1 : -1;

  // Background music management
  const { startMusic, isMuted, toggleMute } = useBackgroundMusic(currentCardId);
  const { displayToast } = useToastNotification();

  // Funny messages for mute toggle
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

  // Track card views (handles all navigation: tap, progress bar, keyboard)
  const previousCardRef = useRef<number | null>(null);
  useEffect(() => {
    // Skip initial render (already tracked by ViewLogPage)
    if (previousCardRef.current === null) {
      previousCardRef.current = currentCard;
      return;
    }

    // Only log when card actually changes
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

  // Share analytics callback for CardShare
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
      // Start background music on first interaction
      startMusic();

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const { width } = rect;

      // Left 30% goes back, right 70% goes forward
      if (clickX < width * 0.3) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goNext, goPrev, startMusic],
  );

  // Get current card's theme (with archetype-specific override)
  const currentTheme = useMemo(() => {
    const baseTheme = CARD_THEMES[currentCardId] || CARD_THEMES['total-impact'];

    // Special handling for archetype card - tint based on user's archetype
    if (currentCardId === 'archetype' && data?.archetype) {
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
  }, [currentCardId, data?.archetype]);

  return (
    <>
      <Head>
        <title>Log 2025 | daily.dev</title>
        <meta
          name="description"
          content="Your stats. Your story. Your archetype. Discover what kind of developer you really are."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {/* Open Graph */}
        <meta property="og:title" content="Log 2025 | daily.dev" />
        <meta
          property="og:description"
          content="Your stats. Your story. Your archetype. Discover what kind of developer you really are."
        />
        <meta
          property="og:image"
          content="https://media.daily.dev/image/upload/s--S6QRV0hA--/f_auto,q_auto/v1765881331/public/log_2025"
        />
        <meta property="og:type" content="website" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Log 2025 | daily.dev" />
        <meta
          name="twitter:description"
          content="Your stats. Your story. Your archetype. Discover what kind of developer you really are."
        />
        <meta
          name="twitter:image"
          content="https://media.daily.dev/image/upload/s--S6QRV0hA--/f_auto,q_auto/v1765881331/public/log_2025"
        />
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

        {/* Header with progress bars, back button, and centered logo */}
        <header className={styles.header}>
          {/* Instagram-style progress bars at top */}
          <div className={styles.progressBars}>
            {cards.map((card, index) => {
              const isCompleted = index < currentCard;
              const isCurrent = index === currentCard;

              return (
                <button
                  key={card.id}
                  type="button"
                  className={styles.progressBarWrapper}
                  onClick={() => {
                    startMusic();
                    goToCard(index);
                  }}
                  aria-label={`Go to card ${index + 1}`}
                >
                  <div className={styles.progressBar}>
                    <motion.div
                      className={styles.progressBarFill}
                      initial={false}
                      animate={{
                        width: isCompleted || isCurrent ? '100%' : '0%',
                      }}
                      transition={{
                        // Only animate the current bar, others change instantly
                        duration: isCurrent ? 0.3 : 0,
                        ease: 'easeOut',
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation row with back button, centered logo, and mute toggle */}
          <div className={styles.headerNav}>
            <div className={styles.headerLeft}>
              <Button
                icon={<ArrowIcon className="-rotate-90" />}
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                onClick={() => router.push('/')}
                className={styles.backButton}
              />
            </div>
            <div className={styles.logoCenter}>
              <Logo position={LogoPosition.Empty} linkDisabled />
            </div>
            <div className={styles.headerRight}>
              <Button
                icon={isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                onClick={handleMuteToggle}
                className={styles.muteButton}
                aria-label={isMuted ? 'Unmute music' : 'Mute music'}
              />
            </div>
          </div>
        </header>

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
