import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import HotAndColdModal from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import { useBookmarkPost } from '@dailydotdev/shared/src/hooks/useBookmarkPost';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { withIsActiveGuard } from '@dailydotdev/shared/src/features/onboarding/shared/withActiveGuard';
import type { FunnelStepEditTags } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepTransitionType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { useAdaptiveSwipeDeck } from '../../hooks/useAdaptiveSwipeDeck';
import { extractTags } from '../../lib/swipingBackendApi';
import { SwipeOnboardingProgressHeader } from './SwipeOnboardingProgressHeader';
import {
  SWIPE_ONBOARDING_IMPROVE_MILESTONE,
  SWIPE_ONBOARDING_MIN_TO_UNLOCK,
  SWIPE_ONBOARDING_REFINE_TARGET,
} from '../../lib/swipeOnboardingGuidance';

const SWIPE_ONBOARDING_PROGRESS_MILESTONES: readonly number[] = [
  SWIPE_ONBOARDING_MIN_TO_UNLOCK,
  SWIPE_ONBOARDING_IMPROVE_MILESTONE,
  SWIPE_ONBOARDING_REFINE_TARGET,
];

const SWIPE_ONBOARDING_TAG_SEED_MAX = 25;
const SWIPE_ONBOARDING_LOADING_LABELS = [
  'cooking',
  'optimizing',
  'thinking',
  'shuffling the good stuff',
  'bribing the feed gremlins',
  'warming up the swipe deck',
] as const;

const swipeOnboardingModalShellClassName =
  'tablet:!h-[calc(100vh-2rem)] tablet:!max-h-[calc(100vh-2rem)] tablet:!w-[42rem] tablet:!max-w-[calc(100vw-2rem)] tablet:!overflow-hidden tablet:!rounded-[2rem] tablet:!border-border-subtlest-secondary tablet:shadow-[0_32px_120px_-48px_rgba(0,0,0,0.58)]';

const swipeOnboardingSurfaceClassName =
  'w-full overflow-hidden rounded-[2rem] border border-border-subtlest-secondary bg-background-default shadow-[0_24px_90px_-48px_rgba(0,0,0,0.58)]';

const swipeOnboardingPanelClassName =
  'rounded-[1.5rem] border border-border-subtlest-tertiary bg-surface-float';

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

function SwipeOnboardingToolbar({
  onBack,
}: {
  onBack: () => void;
}): ReactElement {
  return (
    <div className="pointer-events-none flex w-full justify-center px-4 pb-1 pt-4 tablet:px-6">
      <div className="flex w-full max-w-[32rem] items-center justify-between gap-3 px-2 py-2">
        <Button
          className="pointer-events-auto !rounded-full"
          icon={<ArrowIcon className="-rotate-90" />}
          size={ButtonSize.Small}
          type="button"
          variant={ButtonVariant.Tertiary}
          onClick={onBack}
        />
        <div aria-hidden className="pointer-events-none h-8 min-w-8" />
      </div>
    </div>
  );
}

function FunnelSwipeOnboardingStepComponent({
  parameters: { cta },
  onTransition,
}: FunnelStepEditTags): ReactElement {
  const router = useRouter();
  const [swipesCount, setSwipesCount] = useState(0);
  const [milestoneBurstKey, setMilestoneBurstKey] = useState(0);
  const [promptText, setPromptText] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSwipeMode, setIsSwipeMode] = useState(false);
  const [dismissedOnboardingCardIds, setDismissedOnboardingCardIds] = useState<
    Set<string>
  >(() => new Set());
  const prevSwipesForMilestoneRef = useRef<number | null>(null);
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
  } = useAdaptiveSwipeDeck();

  useEffect(() => {
    const prev = prevSwipesForMilestoneRef.current;
    prevSwipesForMilestoneRef.current = swipesCount;
    if (prev === null) {
      return;
    }
    const crossedMilestone = SWIPE_ONBOARDING_PROGRESS_MILESTONES.find(
      (milestone) => prev < milestone && swipesCount >= milestone,
    );
    if (crossedMilestone !== undefined) {
      setMilestoneBurstKey((currentKey) => currentKey + 1);
    }
  }, [swipesCount]);

  const handlePromptSubmit = useCallback(async () => {
    if (promptLoading) {
      return;
    }

    setPromptLoading(true);
    try {
      let initialTags: string[] = [];
      if (promptText.trim()) {
        initialTags = await extractTags(promptText.trim());
      }
      await startDeck({ prompt: promptText.trim(), initialTags });
      setIsSwipeMode(true);
    } finally {
      setPromptLoading(false);
    }
  }, [promptLoading, promptText, startDeck]);

  const handleSkipPrompt = useCallback(async () => {
    if (promptLoading) {
      return;
    }

    setPromptLoading(true);
    try {
      await startDeck();
      setIsSwipeMode(true);
    } finally {
      setPromptLoading(false);
    }
  }, [promptLoading, startDeck]);

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
      if (direction === 'left' || direction === 'right') {
        setSwipesCount((currentValue) => currentValue + 1);
        if (meta?.onboardingCardId) {
          if (direction === 'right') {
            bookmarkRightSwipePost(meta.onboardingCardId);
          }
          handleAdaptiveSwipe(direction, meta.onboardingCardId);
        }
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

  if (!isSwipeMode) {
    return (
      <div className="flex w-full flex-1 flex-col justify-center px-4 pb-6 pt-4 tablet:px-6 tablet:pb-8">
        <div className="mx-auto flex w-full max-w-[46rem] flex-1 flex-col justify-center">
          <div className={swipeOnboardingSurfaceClassName}>
            <div className="flex flex-col gap-5 p-5 tablet:gap-6 tablet:p-7">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-text-secondary typo-footnote">
                  Personalize your daily.dev feed
                </span>
                <div className="space-y-3">
                  <h1 className="text-balance text-center font-bold text-text-primary typo-title1">
                    What do you want to read more about?
                  </h1>
                  <p className="mx-auto max-w-[32rem] text-balance text-center text-text-tertiary typo-body">
                    Describe your interests and we&apos;ll turn that into a
                    swipe deck that feels closer to a real conversation than a
                    blank setup form.
                  </p>
                </div>
              </div>
              <div
                className={classNames(
                  swipeOnboardingPanelClassName,
                  'overflow-hidden',
                )}
              >
                <textarea
                  className="min-h-[8.5rem] w-full resize-none bg-transparent px-5 py-4 text-text-primary typo-body placeholder:text-text-quaternary focus:outline-none tablet:min-h-[9rem]"
                  placeholder="e.g. I'm a backend engineer interested in Rust, distributed systems, infrastructure, and system design..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !promptLoading) {
                      e.preventDefault();
                      handlePromptSubmit();
                    }
                  }}
                />
                <div className="flex flex-col gap-2 border-t border-border-subtlest-tertiary px-4 py-3 tablet:flex-row tablet:items-center tablet:justify-between">
                  <Button
                    aria-disabled={promptLoading}
                    className={classNames('w-full tablet:w-auto', {
                      readOnly: promptLoading,
                    })}
                    size={ButtonSize.Medium}
                    variant={ButtonVariant.Tertiary}
                    type="button"
                    onClick={() => {
                      handleSkipPrompt();
                    }}
                  >
                    Show popular posts
                  </Button>
                  <Button
                    aria-disabled={promptLoading}
                    className={classNames('w-full tablet:w-auto', {
                      readOnly: promptLoading,
                    })}
                    size={ButtonSize.Medium}
                    variant={
                      promptLoading
                        ? ButtonVariant.Float
                        : ButtonVariant.Primary
                    }
                    type="button"
                    onClick={() => {
                      handlePromptSubmit();
                    }}
                  >
                    {promptLoading
                      ? animatedPromptLoadingLabel
                      : 'Start swiping'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const bottomContinueSlot = canContinue ? (
    <div className="w-full min-w-0 self-stretch px-4">
      <div className="mx-auto flex w-full min-w-0 max-w-[32rem] flex-col gap-3 rounded-[1.5rem] border border-border-subtlest-secondary bg-background-default p-3 shadow-[0_24px_72px_-44px_rgba(0,0,0,0.7)] laptop:flex-row laptop:flex-wrap laptop:items-center">
        <div className="min-w-0 px-2 laptop:flex-1 laptop:basis-0">
          <p className="font-medium text-text-secondary typo-footnote">
            Starter feed ready
          </p>
          <p className="text-balance text-text-tertiary typo-caption1">
            We have enough signal to build your first pass. You can keep
            refining it after this.
          </p>
        </div>
        <Button
          className="w-full min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap laptop:ml-auto laptop:w-auto"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Primary}
          type="button"
          disabled={isCompleting}
          onClick={() => {
            handleComplete().catch(() => null);
          }}
        >
          {cta || 'Next'}
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <HotAndColdModal
      isOpen
      className={swipeOnboardingModalShellClassName}
      overlayClassName="supports-[backdrop-filter]:backdrop-blur-md"
      showHeader={false}
      showDefaultActions={false}
      showAddHotTakeButton={false}
      shouldCloseOnOverlayClick={false}
      dismissedOnboardingCardIds={dismissedOnboardingCardIds}
      onDismissedOnboardingCardsChange={setDismissedOnboardingCardIds}
      onboardingActionLayout="sides"
      onboardingCards={adaptiveCards}
      onboardingCardsLoading={isAdaptiveLoading}
      onboardingFeedRefetching={isAdaptiveLoading}
      onOnboardingFeedRetry={() => {
        retryFetch();
      }}
      onSwipeAction={(direction, meta) => {
        handleSwipeInteraction(direction, meta);
      }}
      headerSlot={
        <SwipeOnboardingToolbar
          onBack={() => {
            router.back();
          }}
        />
      }
      topSlot={
        <SwipeOnboardingProgressHeader
          milestoneBurstKey={milestoneBurstKey}
          progressCount={swipesCount}
        />
      }
      bottomSlot={bottomContinueSlot}
      onRequestClose={() => {
        router.back();
      }}
    />
  );
}

export const FunnelSwipeOnboardingStep = withIsActiveGuard(
  FunnelSwipeOnboardingStepComponent,
);
