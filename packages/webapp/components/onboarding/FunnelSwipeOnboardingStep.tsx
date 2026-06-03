import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import HotAndColdModal from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import { useBookmarkPost } from '@dailydotdev/shared/src/hooks/useBookmarkPost';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { GQLPersona } from '@dailydotdev/shared/src/graphql/feedSettings';
import { withIsActiveGuard } from '@dailydotdev/shared/src/features/onboarding/shared/withActiveGuard';
import type { FunnelStepEditTags } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepTransitionType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { useAdaptiveSwipeDeck } from '../../hooks/useAdaptiveSwipeDeck';
import { buildSwipePrompt } from '../../lib/buildSwipePrompt';
import { SwipeOnboardingProgressHeader } from './SwipeOnboardingProgressHeader';
import {
  SwipePersonaIntro,
  SwipePersonaIntroHeading,
} from './SwipePersonaIntro';
import {
  SWIPE_ONBOARDING_MIN_TO_UNLOCK,
  SWIPE_ONBOARDING_REFINE_TARGET,
} from '../../lib/swipeOnboardingGuidance';
import { recommendOnboardingTags } from '../../lib/swipingBackendApi';
import { roundRobinMerge } from '../../lib/roundRobinMerge';

const SWIPE_ONBOARDING_TAG_SEED_MAX = 25;
const SWIPE_ONBOARDING_RECOMMENDED_TAGS_COUNT = 10;
const SWIPE_ONBOARDING_LOADING_LABELS = [
  'cooking',
  'optimizing',
  'thinking',
  'shuffling the good stuff',
  'bribing the feed gremlins',
  'warming up the swipe deck',
] as const;

/** Keep in sync with --swipe-onboarding-transition-ms in swipe-onboarding.css */
const SWIPE_ONBOARDING_TRANSITION_MS = 260;

const swipeOnboardingModalShellClassName =
  '!h-dvh !max-h-dvh !w-full !max-w-none !border-transparent !bg-transparent !shadow-none tablet:!mx-0 tablet:!h-dvh tablet:!max-h-dvh tablet:!w-full tablet:!max-w-none tablet:!overflow-hidden tablet:!rounded-none tablet:!border-transparent tablet:!bg-transparent tablet:!shadow-none';

const waitMs = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

function SwipeOnboardingLogo(): ReactElement {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-1 flex justify-center tablet:top-8">
      <Logo
        className="pointer-events-auto !left-0 !top-0 !mt-0 !translate-x-0"
        linkDisabled
        logoClassName={{ container: 'h-6 tablet:h-8' }}
        position={LogoPosition.Relative}
      />
    </div>
  );
}

function SwipeOnboardingTopBar({
  onBack,
}: {
  onBack?: () => void;
}): ReactElement {
  return (
    <div
      className={classNames(
        'flex w-full shrink-0 items-center py-2',
        onBack ? 'justify-between' : 'justify-center',
      )}
    >
      {onBack ? (
        <Button
          icon={<ArrowIcon className="-rotate-90" />}
          size={ButtonSize.Medium}
          type="button"
          variant={ButtonVariant.Tertiary}
          onClick={onBack}
        >
          Back
        </Button>
      ) : null}
      <Logo
        linkDisabled
        logoClassName={{ container: 'h-6' }}
        position={LogoPosition.Relative}
      />
    </div>
  );
}

function SwipeOnboardingBackButton({
  onBack,
}: {
  onBack: () => void;
}): ReactElement {
  return (
    <div className="flex min-h-16 items-center gap-3 px-4 py-3">
      <Button
        icon={<ArrowIcon className="-rotate-90" />}
        size={ButtonSize.Medium}
        type="button"
        variant={ButtonVariant.Tertiary}
        onClick={onBack}
      >
        Back
      </Button>
    </div>
  );
}

function useAnimatedLoadingLabel(isActive: boolean): string {
  const [labelIndex, setLabelIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (!isActive) {
      setLabelIndex(0);
      setDotCount(1);
      return undefined;
    }

    const interval = window.setInterval(() => {
      setDotCount((currentDotCount) => {
        if (currentDotCount === 3) {
          setLabelIndex(
            (currentLabelIndex) =>
              (currentLabelIndex + 1) % SWIPE_ONBOARDING_LOADING_LABELS.length,
          );
          return 1;
        }

        return currentDotCount + 1;
      });
    }, 550);

    return () => window.clearInterval(interval);
  }, [isActive]);

  return `${SWIPE_ONBOARDING_LOADING_LABELS[labelIndex]}${'.'.repeat(
    dotCount,
  )}`;
}

function SwipeOnboardingStarterFeedReady({
  cta,
  isCompleting,
  onComplete,
}: {
  cta?: string;
  isCompleting: boolean;
  onComplete: () => void;
}): ReactElement {
  return (
    <>
      <div className="flex flex-col items-center gap-8 px-4 tablet:gap-1">
        <p className="max-w-[24rem] text-balance text-center text-[1.25rem] leading-7 text-text-tertiary">
          We have enough signal to build your first pass. You can keep refining
          it after this.
        </p>
        <Button
          className="w-full max-w-[24rem] overflow-hidden text-ellipsis whitespace-nowrap tablet:hidden"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Primary}
          type="button"
          disabled={isCompleting}
          onClick={onComplete}
        >
          {cta || 'Next'}
        </Button>
      </div>
      <div className="hidden w-full items-center justify-center gap-3 px-4 py-3 tablet:mt-auto tablet:flex tablet:min-h-16">
        <Button
          className="w-full max-w-[24rem] overflow-hidden text-ellipsis whitespace-nowrap"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Primary}
          type="button"
          disabled={isCompleting}
          onClick={onComplete}
        >
          {cta || 'Next'}
        </Button>
      </div>
    </>
  );
}

function SwipeOnboardingCompleteView({
  cta,
  isCompleting,
  onComplete,
}: {
  cta?: string;
  isCompleting: boolean;
  onComplete: () => void;
}): ReactElement {
  return (
    <div className="swipe-onboarding-complete-enter flex min-h-[26rem] flex-1 flex-col items-center justify-center gap-10 overflow-visible px-4 py-8 tablet:flex-none tablet:gap-8 tablet:overflow-visible tablet:pb-0 tablet:pt-8">
      <div className="overflow-visible px-4 py-3 text-center tablet:overflow-visible tablet:px-4 tablet:py-0">
        <p className="swipe-onboarding-complete-gradient mt-auto bg-gradient-to-r from-accent-cabbage-default via-accent-avocado-default to-accent-cheese-default bg-clip-text px-4 text-center text-[min(6.5rem,20vw)] font-black leading-[0.9] tracking-[-0.05em] text-transparent tablet:text-[min(7rem,22vw)] tablet:tracking-[-0.07em]">
          100% complete
        </p>
      </div>
      <SwipeOnboardingStarterFeedReady
        cta={cta}
        isCompleting={isCompleting}
        onComplete={onComplete}
      />
    </div>
  );
}

function FunnelSwipeOnboardingStepComponent({
  parameters: { cta },
  onTransition,
}: FunnelStepEditTags): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const [swipesCount, setSwipesCount] = useState(0);
  const [selectedPersonas, setSelectedPersonas] = useState<GQLPersona[]>([]);
  const [promptLoading, setPromptLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSwipeMode, setIsSwipeMode] = useState(false);
  const [isIntroExiting, setIsIntroExiting] = useState(false);
  const [dismissedOnboardingCardIds, setDismissedOnboardingCardIds] = useState<
    Set<string>
  >(() => new Set());
  const animatedPromptLoadingLabel = useAnimatedLoadingLabel(promptLoading);
  const { feedSettings } = useFeedSettings();
  const { onFollowTags } = useTagAndSource({
    origin: Origin.Onboarding,
  });
  const { toggleBookmark } = useBookmarkPost();
  const {
    cards: adaptiveCards,
    getBookmarkablePost,
    isLoading: isAdaptiveLoading,
    startDeck,
    handleSwipe: handleAdaptiveSwipe,
    retryFetch,
    selectedTags: adaptiveSelectedTags,
    appendSeedTags,
  } = useAdaptiveSwipeDeck();

  const handleStartSwipe = useCallback(async () => {
    if (promptLoading) {
      return;
    }

    setPromptLoading(true);
    try {
      // Fan out recommendations per persona so a tag-dense persona (e.g.
      // AI/ML) doesn't dominate the seed when the user picks several roles.
      const perPersonaCount = Math.max(
        1,
        Math.ceil(
          SWIPE_ONBOARDING_RECOMMENDED_TAGS_COUNT /
            Math.max(selectedPersonas.length, 1),
        ),
      );
      const personaTags = roundRobinMerge(
        selectedPersonas.map((persona) => persona.tags),
      );
      const prompt = buildSwipePrompt({
        personas: selectedPersonas,
        experienceLevel: user?.experienceLevel,
      });

      // Kick off recommendations and the deck fetch in parallel — both are
      // LLM calls. The deck seeds with persona tags only; once the
      // recommendation call resolves we append the extra tags to the deck's
      // seed so subsequent batches benefit from the broader signal.
      const recommendationsPromise = Promise.all(
        selectedPersonas.map((persona) =>
          recommendOnboardingTags(persona.tags, perPersonaCount).catch(
            () => [] as string[],
          ),
        ),
      ).then((streams) =>
        roundRobinMerge(streams).slice(
          0,
          SWIPE_ONBOARDING_RECOMMENDED_TAGS_COUNT,
        ),
      );
      const deckPromise = startDeck({ prompt, initialTags: personaTags });

      recommendationsPromise
        .then((recommendedTags) => {
          if (recommendedTags.length) {
            appendSeedTags(recommendedTags);
          }
        })
        .catch(() => null);

      await deckPromise;
      setIsIntroExiting(true);
      await waitMs(SWIPE_ONBOARDING_TRANSITION_MS);
      setIsSwipeMode(true);
    } finally {
      setPromptLoading(false);
    }
  }, [
    appendSeedTags,
    promptLoading,
    selectedPersonas,
    startDeck,
    user?.experienceLevel,
  ]);

  const bookmarkRightSwipePost = useCallback(
    (cardId: string) => {
      const bookmarkPost = getBookmarkablePost(cardId);
      if (!bookmarkPost) {
        return;
      }

      // Capture the current card payload before deck state changes.
      toggleBookmark({
        post: bookmarkPost,
        origin: Origin.Onboarding,
        disableToast: true,
      }).catch(() => null);
    },
    [getBookmarkablePost, toggleBookmark],
  );

  const handleSwipeInteraction = useCallback(
    (
      direction: 'left' | 'right' | 'skip',
      meta?: { onboardingCardId?: string },
    ) => {
      if (direction !== 'left' && direction !== 'right') {
        return;
      }
      if (direction === 'right') {
        setSwipesCount((currentValue) => currentValue + 1);
      }
      if (meta?.onboardingCardId) {
        if (direction === 'right') {
          bookmarkRightSwipePost(meta.onboardingCardId);
        }
        handleAdaptiveSwipe(direction, meta.onboardingCardId);
      }
    },
    [bookmarkRightSwipePost, handleAdaptiveSwipe],
  );

  const tagsFromSwipes = useMemo(
    () => adaptiveSelectedTags.slice(0, SWIPE_ONBOARDING_TAG_SEED_MAX),
    [adaptiveSelectedTags],
  );

  const handleComplete = useCallback(async () => {
    if (isCompleting) {
      return;
    }

    setIsCompleting(true);
    const currentTags = feedSettings?.includeTags ?? [];
    const currentTagsSet = new Set(currentTags);
    const tagsToFollow = tagsFromSwipes.filter(
      (tag) => !currentTagsSet.has(tag),
    );
    const finalTags = [...currentTags, ...tagsToFollow];

    try {
      if (tagsToFollow.length) {
        await onFollowTags({ tags: tagsToFollow });
      }
    } catch {
      // Let the funnel continue even if persisting tags fails.
    } finally {
      setIsCompleting(false);
    }

    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: {
        tags: finalTags,
      },
    });
  }, [
    feedSettings?.includeTags,
    isCompleting,
    onFollowTags,
    onTransition,
    tagsFromSwipes,
  ]);

  const canContinue = swipesCount >= SWIPE_ONBOARDING_MIN_TO_UNLOCK;
  const isRefineComplete = swipesCount >= SWIPE_ONBOARDING_REFINE_TARGET;

  if (!isSwipeMode) {
    return (
      <>
        <div className="hidden tablet:contents">
          <SwipeOnboardingLogo />
        </div>
        <div
          className={`mx-auto flex h-full min-h-0 w-full max-w-[46rem] flex-1 flex-col justify-start gap-6 px-4 pb-8 pt-4 tablet:w-full tablet:justify-center tablet:gap-0 tablet:px-6 tablet:pb-8 tablet:pt-4 ${
            isIntroExiting
              ? 'swipe-onboarding-screen-exit'
              : 'swipe-onboarding-screen-enter'
          }`}
          style={
            {
              '--swipe-onboarding-transition-ms': `${SWIPE_ONBOARDING_TRANSITION_MS}ms`,
            } as CSSProperties
          }
        >
          <div className="tablet:hidden">
            <SwipeOnboardingTopBar />
          </div>
          <SwipePersonaIntro
            initialSelectedPersonas={selectedPersonas}
            loading={promptLoading}
            loadingLabel={animatedPromptLoadingLabel}
            onSelectionChange={setSelectedPersonas}
            onStart={handleStartSwipe}
          />
        </div>
      </>
    );
  }

  const handleBackFromSwipe = (): void => {
    setIsIntroExiting(false);
    setIsSwipeMode(false);
  };

  const handleCompleteClick = (): void => {
    handleComplete().catch(() => null);
  };

  const bottomSlot = isRefineComplete ? null : (
    <>
      <div className="tablet:hidden">
        {canContinue ? (
          <SwipeOnboardingStarterFeedReady
            cta={cta}
            isCompleting={isCompleting}
            onComplete={handleCompleteClick}
          />
        ) : null}
      </div>
      <div className="hidden tablet:contents">
        <SwipeOnboardingBackButton onBack={handleBackFromSwipe} />
        {canContinue ? (
          <SwipeOnboardingStarterFeedReady
            cta={cta}
            isCompleting={isCompleting}
            onComplete={handleCompleteClick}
          />
        ) : null}
      </div>
    </>
  );

  return (
    <HotAndColdModal
      isOpen
      bodyClassName=""
      className={swipeOnboardingModalShellClassName}
      overlayClassName="!bg-transparent supports-[backdrop-filter]:backdrop-blur-md"
      showHeader={false}
      showDefaultActions={false}
      showAddHotTakeButton={false}
      headerSlot={
        isRefineComplete ? undefined : (
          <>
            <div className="tablet:hidden">
              <SwipeOnboardingTopBar onBack={handleBackFromSwipe} />
            </div>
            <div className="hidden tablet:contents">
              <SwipeOnboardingLogo />
            </div>
          </>
        )
      }
      shouldCloseOnOverlayClick={false}
      dismissedOnboardingCardIds={dismissedOnboardingCardIds}
      onDismissedOnboardingCardsChange={setDismissedOnboardingCardIds}
      onboardingActionLayout="sides"
      onboardingCards={adaptiveCards}
      onboardingCardsLoading={isAdaptiveLoading}
      onboardingFeedRefetching={isAdaptiveLoading}
      onboardingContent={
        isRefineComplete ? (
          <SwipeOnboardingCompleteView
            cta={cta}
            isCompleting={isCompleting}
            onComplete={handleCompleteClick}
          />
        ) : undefined
      }
      onOnboardingFeedRetry={() => {
        retryFetch();
      }}
      onSwipeAction={(direction, meta) => {
        handleSwipeInteraction(direction, meta);
      }}
      topSlot={
        isRefineComplete ? undefined : (
          <>
            <div className="w-full tablet:hidden">
              <SwipePersonaIntroHeading variant="swipe" />
            </div>
            <div className="hidden w-full flex-col items-center gap-4 tablet:flex">
              <SwipePersonaIntroHeading variant="swipe" />
              <SwipeOnboardingProgressHeader progressCount={swipesCount} />
            </div>
          </>
        )
      }
      progressSlot={
        isRefineComplete ? undefined : (
          <div className="tablet:hidden">
            <SwipeOnboardingProgressHeader progressCount={swipesCount} />
          </div>
        )
      }
      bottomSlot={bottomSlot}
      onRequestClose={() => {
        router.back();
      }}
    />
  );
}

export const FunnelSwipeOnboardingStep = withIsActiveGuard(
  FunnelSwipeOnboardingStepComponent,
);
