import type { CSSProperties, ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import type { AuthOptionsProps } from '@dailydotdev/shared/src/components/auth/common';
import {
  EditTag,
  OnboardingHeader,
} from '@dailydotdev/shared/src/components/onboarding';
import {
  FooterLinks,
  withFeaturesBoundary,
} from '@dailydotdev/shared/src/components';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { redirectToApp } from '@dailydotdev/shared/src/features/onboarding/lib/utils';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useOnboardingActions } from '@dailydotdev/shared/src/hooks/auth';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import HotAndColdModal from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { swipeOnboardingFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import { setHasSeenTags } from '@dailydotdev/shared/src/lib/feedSettings';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { SwipeOnboardingProgressHeader } from '../../components/onboarding/SwipeOnboardingProgressHeader';
import { useAdaptiveSwipeDeck } from '../../hooks/useAdaptiveSwipeDeck';
import { extractTags } from '../../lib/swipingBackendApi';
import {
  SWIPE_ONBOARDING_IMPROVE_MILESTONE,
  SWIPE_ONBOARDING_MIN_TO_UNLOCK,
  SWIPE_ONBOARDING_REFINE_TARGET,
} from '../../lib/swipeOnboardingGuidance';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seoTitles = getPageSeoTitles('Swipe onboarding');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
};
const swipeOnboardingPreviewQueryKey = 'swipeOnboardingPreview';
const MIN_SWIPES_TO_CONTINUE = SWIPE_ONBOARDING_MIN_TO_UNLOCK;

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

/**
 * Test-only: clears legacy followed tags when opening "Use tags instead" (unfollows
 * `includeTags` once per tags visit). Set toggle to `false` before shipping. You can
 * also set `NEXT_PUBLIC_SWIPE_ONBOARDING_TEST_CLEAR_TAGS=true` in `.env.local` instead
 * of using the toggle.
 */
const SWIPE_ONBOARDING_TEST_CLEAR_PRESELECTED_TAGS_TOGGLE = false;
const shouldClearPreselectedTagsForSwipeOnboardingTest =
  SWIPE_ONBOARDING_TEST_CLEAR_PRESELECTED_TAGS_TOGGLE ||
  process.env.NEXT_PUBLIC_SWIPE_ONBOARDING_TEST_CLEAR_TAGS === 'true';

const swipeOnboardingPageBackdropStyle: CSSProperties = {
  backgroundImage: `radial-gradient(circle at top, rgb(from var(--theme-accent-cabbage-default) r g b / 0.12), transparent 34%), radial-gradient(circle at bottom right, rgb(from var(--theme-accent-avocado-default) r g b / 0.1), transparent 28%), linear-gradient(180deg, rgb(from var(--theme-background-default) r g b / 1) 0%, rgb(from var(--theme-background-default) r g b / 0.98) 100%)`,
};

const swipeOnboardingToolbarActionButtonStyle = {
  '--button-hover-background': 'transparent',
  '--button-hover-border-color': 'transparent',
  '--button-hover-box-shadow': 'none',
  '--button-active-background': 'transparent',
  '--button-active-border-color': 'transparent',
  '--button-active-box-shadow': 'none',
} as CSSProperties;

const swipeOnboardingModalShellClassName =
  'tablet:!h-[calc(100vh-2rem)] tablet:!max-h-[calc(100vh-2rem)] tablet:!w-[42rem] tablet:!max-w-[calc(100vw-2rem)] tablet:!overflow-hidden tablet:!rounded-[2rem] tablet:!border-border-subtlest-secondary tablet:shadow-[0_32px_120px_-48px_rgba(0,0,0,0.58)]';

const swipeOnboardingSurfaceClassName =
  'w-full overflow-hidden rounded-[2rem] border border-border-subtlest-secondary bg-background-default shadow-[0_24px_90px_-48px_rgba(0,0,0,0.58)]';

const swipeOnboardingPanelClassName =
  'rounded-[1.5rem] border border-border-subtlest-tertiary bg-surface-float';

const isIncompleteSocialSignupUser = (user?: LoggedUser): boolean =>
  !!user &&
  user.infoConfirmed === false &&
  user.providers.some((provider) => provider !== 'password');

function SwipeOnboardingViewport({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): ReactElement {
  return (
    <div
      className={classNames(
        'relative isolate min-h-dvh overflow-hidden bg-background-default',
        className,
      )}
      style={swipeOnboardingPageBackdropStyle}
    >
      <div className="relative z-[1] flex min-h-dvh w-full flex-col items-center px-4 pb-6 pt-4 tablet:px-6 tablet:pb-8">
        {children}
      </div>
    </div>
  );
}

function SwipeOnboardingToolbar({
  actionLabel,
  onAction,
  onBack,
}: {
  actionLabel: string;
  onAction: () => void;
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
        <Button
          className="pointer-events-auto shrink-0 !rounded-full"
          size={ButtonSize.Small}
          style={swipeOnboardingToolbarActionButtonStyle}
          type="button"
          variant={ButtonVariant.Tertiary}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
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

function SwipeOnboardingPage(): ReactElement {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null as unknown as HTMLFormElement);
  const { isAuthReady, isLoggedIn, user } = useAuthContext();
  const { completeStep } = useOnboardingActions();
  const [swipesCount, setSwipesCount] = useState(0);
  const [milestoneBurstKey, setMilestoneBurstKey] = useState(0);
  const [authDisplay, setAuthDisplay] = useState<AuthDisplay>(
    AuthDisplay.OnboardingSignup,
  );
  const [onboardingUiMode, setOnboardingUiMode] = useState<
    'prompt' | 'swipe' | 'tags'
  >('prompt');
  const [promptText, setPromptText] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [dismissedOnboardingCardIds, setDismissedOnboardingCardIds] = useState<
    Set<string>
  >(() => new Set());
  const swipeOnboardingTestTagsClearDoneForSessionRef = useRef(false);
  const prevSwipesForMilestoneRef = useRef<number | null>(null);
  const animatedPromptLoadingLabel = useAnimatedLoadingLabel(promptLoading);

  const {
    cards: adaptiveCards,
    isLoading: isAdaptiveLoading,
    startDeck,
    handleSwipe: handleAdaptiveSwipe,
    retryFetch,
    selectedTags: adaptiveSelectedTags,
  } = useAdaptiveSwipeDeck();

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
      setOnboardingUiMode('swipe');
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
      setOnboardingUiMode('swipe');
    } finally {
      setPromptLoading(false);
    }
  }, [promptLoading, startDeck]);
  const {
    value: isSwipeOnboardingEnabled,
    isLoading: isSwipeOnboardingLoading,
  } = useConditionalFeature({
    feature: swipeOnboardingFeature,
  });
  const hasIncompleteSocialSignup = isIncompleteSocialSignupUser(user);
  const shouldShowSwipeAuth = !isLoggedIn || hasIncompleteSocialSignup;
  const shouldShowAuthIntro =
    !hasIncompleteSocialSignup &&
    ![
      AuthDisplay.Registration,
      AuthDisplay.SocialRegistration,
      AuthDisplay.EmailVerification,
    ].includes(authDisplay);
  const swipeOnboardingPreviewQuery =
    router.query[swipeOnboardingPreviewQueryKey];
  const isSwipeOnboardingPreviewForced =
    router.isReady &&
    (swipeOnboardingPreviewQuery === '1' ||
      swipeOnboardingPreviewQuery === 'true' ||
      (Array.isArray(swipeOnboardingPreviewQuery) &&
        (swipeOnboardingPreviewQuery.includes('1') ||
          swipeOnboardingPreviewQuery.includes('true'))));

  useEffect(() => {
    if (
      !router.isReady ||
      isSwipeOnboardingLoading ||
      isSwipeOnboardingEnabled ||
      isSwipeOnboardingPreviewForced
    ) {
      return;
    }
    router.replace('/onboarding').catch(() => null);
  }, [
    isSwipeOnboardingEnabled,
    isSwipeOnboardingLoading,
    isSwipeOnboardingPreviewForced,
    router,
  ]);

  const onComplete = useCallback(async () => {
    if (user?.id) {
      setHasSeenTags(user.id, false);
    }

    completeStep(ActionType.CompletedOnboarding);
    completeStep(ActionType.EditTag);
    completeStep(ActionType.ContentTypes);
    await redirectToApp(router);
  }, [completeStep, router, user?.id]);

  const { feedSettings, isLoading: isFeedSettingsLoading } = useFeedSettings({
    enabled: isLoggedIn,
  });
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin: Origin.Onboarding,
  });

  const selectedTagCount = feedSettings?.includeTags?.length ?? 0;
  const onboardingProgressCount =
    onboardingUiMode === 'tags' ? selectedTagCount : swipesCount;

  useEffect(() => {
    const prev = prevSwipesForMilestoneRef.current;
    prevSwipesForMilestoneRef.current = onboardingProgressCount;
    if (prev === null) {
      return;
    }
    const crossedMilestone = SWIPE_ONBOARDING_PROGRESS_MILESTONES.find(
      (m) => prev < m && onboardingProgressCount >= m,
    );
    if (crossedMilestone !== undefined) {
      setMilestoneBurstKey((k) => k + 1);
    }
  }, [onboardingProgressCount]);

  const handleSwipeInteraction = useCallback(
    (
      direction: 'left' | 'right' | 'skip',
      meta?: { onboardingCardId?: string },
    ) => {
      if (direction === 'left' || direction === 'right') {
        setSwipesCount((value) => value + 1);
        if (meta?.onboardingCardId) {
          handleAdaptiveSwipe(direction, meta.onboardingCardId);
        }
      }
    },
    [handleAdaptiveSwipe],
  );

  const authOptionProps: AuthOptionsProps = useMemo(
    () => ({
      simplified: true,
      trigger: AuthTriggers.Onboarding,
      formRef,
      defaultDisplay: hasIncompleteSocialSignup
        ? AuthDisplay.SocialRegistration
        : AuthDisplay.OnboardingSignup,
      onDisplayChange: (display) => setAuthDisplay(display as AuthDisplay),
      className: {
        container: classNames('w-full rounded-none tablet:max-w-[30rem]'),
        onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
      },
      onboardingSignupButton: {
        size: ButtonSize.Medium,
        variant: ButtonVariant.Primary,
      },
    }),
    [hasIncompleteSocialSignup],
  );
  useEffect(() => {
    if (onboardingUiMode !== 'tags') {
      swipeOnboardingTestTagsClearDoneForSessionRef.current = false;
      return;
    }
    if (!shouldClearPreselectedTagsForSwipeOnboardingTest) {
      return;
    }
    if (swipeOnboardingTestTagsClearDoneForSessionRef.current) {
      return;
    }
    const existing = feedSettings?.includeTags ?? [];
    if (existing.length === 0) {
      swipeOnboardingTestTagsClearDoneForSessionRef.current = true;
      return;
    }
    swipeOnboardingTestTagsClearDoneForSessionRef.current = true;
    onUnfollowTags({ tags: [...existing] }).catch(() => null);
  }, [onboardingUiMode, feedSettings?.includeTags, onUnfollowTags]);

  const tagsFromRightSwipes = useMemo(
    () => adaptiveSelectedTags.slice(0, SWIPE_ONBOARDING_TAG_SEED_MAX),
    [adaptiveSelectedTags],
  );

  useEffect(() => {
    if (onboardingUiMode !== 'tags') {
      return;
    }
    const included = new Set(feedSettings?.includeTags ?? []);
    const toFollow = tagsFromRightSwipes.filter((t) => !included.has(t));
    if (toFollow.length === 0) {
      return;
    }
    onFollowTags({ tags: toFollow }).catch(() => null);
  }, [
    onboardingUiMode,
    tagsFromRightSwipes,
    feedSettings?.includeTags,
    onFollowTags,
  ]);

  if (!isAuthReady) {
    return <div className="min-h-dvh bg-background-default" />;
  }

  if (!router.isReady) {
    return <div className="min-h-dvh bg-background-default" />;
  }

  if (
    !isSwipeOnboardingLoading &&
    !isSwipeOnboardingEnabled &&
    !isSwipeOnboardingPreviewForced
  ) {
    return <div className="min-h-dvh bg-background-default" />;
  }

  if (shouldShowSwipeAuth) {
    return (
      <SwipeOnboardingViewport>
        <div className="w-full max-w-[42rem]">
          <OnboardingHeader />
        </div>
        <div className="flex w-full flex-1 items-center justify-center">
          <div
            className={classNames(
              swipeOnboardingSurfaceClassName,
              'max-w-[34rem]',
            )}
          >
            <div className="flex flex-col gap-6 p-6 tablet:p-8">
              {shouldShowAuthIntro && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <span className="text-text-secondary typo-footnote">
                    Personalize your daily.dev feed
                  </span>
                  <div className="space-y-3">
                    <h1 className="text-balance text-center font-bold text-text-primary typo-title1">
                      Sign in to start shaping your feed
                    </h1>
                    <p className="text-balance text-center text-text-tertiary typo-body">
                      We&apos;ll turn your interests and swipes into a smarter
                      starter feed in just a few steps.
                    </p>
                  </div>
                </div>
              )}
              <AuthOptions {...authOptionProps} />
            </div>
          </div>
        </div>
        <FooterLinks className="mx-auto pt-4" />
      </SwipeOnboardingViewport>
    );
  }

  const canContinue =
    onboardingUiMode === 'swipe'
      ? swipesCount >= MIN_SWIPES_TO_CONTINUE
      : swipesCount >= MIN_SWIPES_TO_CONTINUE ||
        selectedTagCount >= MIN_SWIPES_TO_CONTINUE;

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
          onClick={() => {
            onComplete().catch(() => null);
          }}
        >
          Go to my feed
        </Button>
      </div>
    </div>
  ) : null;

  if (onboardingUiMode === 'prompt') {
    return (
      <SwipeOnboardingViewport>
        <div className="flex w-full max-w-[46rem] flex-1 flex-col justify-center">
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
      </SwipeOnboardingViewport>
    );
  }

  const tagsOnboardingContent = (
    <div
      className={classNames(
        swipeOnboardingSurfaceClassName,
        'flex min-h-0 min-w-0 flex-1 flex-col rounded-[1.75rem]',
      )}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-4 pb-2 pt-6">
          {isFeedSettingsLoading || !feedSettings ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <Loader />
            </div>
          ) : (
            <EditTag
              feedSettings={feedSettings}
              headline="Pick tags that are relevant to you"
              headlineClassName="text-balance text-text-primary typo-title1"
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <HotAndColdModal
      isOpen
      className={swipeOnboardingModalShellClassName}
      overlayClassName="supports-[backdrop-filter]:backdrop-blur-md"
      showHeader={false}
      showDefaultActions={false}
      showAddHotTakeButton={false}
      dismissedOnboardingCardIds={dismissedOnboardingCardIds}
      onDismissedOnboardingCardsChange={setDismissedOnboardingCardIds}
      onboardingActionLayout="sides"
      onboardingCards={onboardingUiMode === 'swipe' ? adaptiveCards : undefined}
      onboardingCardsLoading={
        onboardingUiMode === 'swipe' ? isAdaptiveLoading : false
      }
      onboardingContent={
        onboardingUiMode === 'tags' ? tagsOnboardingContent : undefined
      }
      onboardingFeedRefetching={isAdaptiveLoading}
      onOnboardingFeedRetry={() => {
        retryFetch();
      }}
      onSwipeAction={(direction, meta) => {
        handleSwipeInteraction(direction, meta);
      }}
      headerSlot={
        <SwipeOnboardingToolbar
          actionLabel={
            onboardingUiMode === 'swipe'
              ? 'Use tags instead'
              : 'Switch to swipe'
          }
          onAction={() => {
            setOnboardingUiMode((currentMode) =>
              currentMode === 'swipe' ? 'tags' : 'swipe',
            );
          }}
          onBack={() => {
            router.back();
          }}
        />
      }
      topSlot={
        <SwipeOnboardingProgressHeader
          copyVariant={onboardingUiMode === 'tags' ? 'tags' : 'swipe'}
          milestoneBurstKey={milestoneBurstKey}
          progressCount={onboardingProgressCount}
        />
      }
      bottomSlot={bottomContinueSlot}
      onRequestClose={() => {
        onComplete().catch(() => null);
      }}
    />
  );
}

function Page(): ReactElement {
  return (
    <ErrorBoundary feature="onboarding">
      <SwipeOnboardingPage />
    </ErrorBoundary>
  );
}

Page.layoutProps = { seo };

export default withFeaturesBoundary(Page);
