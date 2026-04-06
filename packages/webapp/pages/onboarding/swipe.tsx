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
import type { NextSeoProps } from 'next-seo';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import type { AuthOptionsProps } from '@dailydotdev/shared/src/components/auth/common';
import {
  EditTag,
  OnboardingHeader,
} from '@dailydotdev/shared/src/components/onboarding';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
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
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import HotAndColdModal from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import type { OnboardingSwipeCard } from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import { useQuery } from '@tanstack/react-query';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { swipeOnboardingFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { SwipeOnboardingProgressHeader } from '../../components/onboarding/SwipeOnboardingProgressHeader';
import { fetchSwipeOnboardingPopularDeck } from '../../lib/swipeOnboardingPopularDeck';
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

/**
 * Test-only: clears legacy followed tags when opening "Use tags instead" (unfollows
 * `includeTags` once per tags visit). Set toggle to `false` before shipping. You can
 * also set `NEXT_PUBLIC_SWIPE_ONBOARDING_TEST_CLEAR_TAGS=true` in `.env.local` instead
 * of using the toggle.
 */
const SWIPE_ONBOARDING_TEST_CLEAR_PRESELECTED_TAGS_TOGGLE = true;
const shouldClearPreselectedTagsForSwipeOnboardingTest =
  SWIPE_ONBOARDING_TEST_CLEAR_PRESELECTED_TAGS_TOGGLE ||
  process.env.NEXT_PUBLIC_SWIPE_ONBOARDING_TEST_CLEAR_TAGS === 'true';

function SwipeOnboardingPage(): ReactElement {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null as unknown as HTMLFormElement);
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { completeStep } = useOnboardingActions();
  const [swipesCount, setSwipesCount] = useState(0);
  const [milestoneBurstKey, setMilestoneBurstKey] = useState(0);
  const [onboardingUiMode, setOnboardingUiMode] = useState<'swipe' | 'tags'>(
    'swipe',
  );
  const [rightSwipedPostIds, setRightSwipedPostIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [dismissedOnboardingCardIds, setDismissedOnboardingCardIds] = useState<
    Set<string>
  >(() => new Set());
  const swipeOnboardingTestTagsClearDoneForSessionRef = useRef(false);
  const prevSwipesForMilestoneRef = useRef<number | null>(null);

  const {
    data: deckPosts = [],
    isPending: isCardsPending,
    refetch: refetchSwipeDeck,
    isFetching: isSwipeDeckFetching,
  } = useQuery<Post[]>({
    queryKey: ['onboarding-swipe-popular-cards'],
    queryFn: fetchSwipeOnboardingPopularDeck,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 2,
  });
  const {
    value: isSwipeOnboardingEnabled,
    isLoading: isSwipeOnboardingLoading,
  } = useConditionalFeature({
    feature: swipeOnboardingFeature,
  });
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
    completeStep(ActionType.CompletedOnboarding);
    completeStep(ActionType.EditTag);
    completeStep(ActionType.ContentTypes);
    await redirectToApp(router);
  }, [completeStep, router]);

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
        if (direction === 'right' && meta?.onboardingCardId) {
          const cardId = meta.onboardingCardId;
          setRightSwipedPostIds((prev) => {
            const next = new Set(prev);
            next.add(cardId);
            return next;
          });
        }
      }
    },
    [],
  );

  const authOptionProps: AuthOptionsProps = useMemo(
    () => ({
      simplified: true,
      forceDefaultDisplay: true,
      trigger: AuthTriggers.Onboarding,
      formRef,
      defaultDisplay: AuthDisplay.OnboardingSignup,
      className: {
        container: classNames('w-full rounded-none tablet:max-w-[30rem]'),
        onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
      },
      onboardingSignupButton: {
        size: ButtonSize.Medium,
        variant: ButtonVariant.Primary,
      },
    }),
    [],
  );
  const onboardingCards = useMemo<OnboardingSwipeCard[]>(
    () =>
      deckPosts.map((node) => ({
        id: node.id,
        title: node.title,
        image: node.image,
        tags: node.tags,
        source: {
          name: node.source?.name,
          image: node.source?.image,
        },
      })),
    [deckPosts],
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

  const tagsFromRightSwipes = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    onboardingCards
      .filter((card) => rightSwipedPostIds.has(card.id))
      .forEach((card) => {
        (card.tags ?? []).forEach((tag) => {
          if (
            !seen.has(tag) &&
            ordered.length < SWIPE_ONBOARDING_TAG_SEED_MAX
          ) {
            seen.add(tag);
            ordered.push(tag);
          }
        });
      });
    return ordered;
  }, [onboardingCards, rightSwipedPostIds]);

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

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center bg-background-default">
        <OnboardingHeader />
        <div className="flex w-full flex-1 items-center justify-center px-4">
          <AuthOptions {...authOptionProps} />
        </div>
        <FooterLinks className="mx-auto pb-6" />
      </div>
    );
  }

  const canContinue =
    onboardingUiMode === 'swipe'
      ? swipesCount >= MIN_SWIPES_TO_CONTINUE
      : swipesCount >= MIN_SWIPES_TO_CONTINUE ||
        selectedTagCount >= MIN_SWIPES_TO_CONTINUE;

  const bottomContinueSlot = canContinue ? (
    <div className="w-full min-w-0 self-stretch px-4">
      <Button
        className="w-full min-w-0"
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
  ) : null;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-end bg-background-default px-4 pb-6 pt-2">
      {onboardingUiMode === 'swipe' ? (
        <HotAndColdModal
          isOpen
          showHeader={false}
          showDefaultActions={false}
          showAddHotTakeButton={false}
          dismissedOnboardingCardIds={dismissedOnboardingCardIds}
          onDismissedOnboardingCardsChange={setDismissedOnboardingCardIds}
          onboardingFeedRefetching={isSwipeDeckFetching}
          onOnboardingFeedRetry={() => {
            refetchSwipeDeck().catch(() => null);
          }}
          onSwipeAction={(direction, meta) => {
            handleSwipeInteraction(direction, meta);
          }}
          onboardingCards={onboardingCards}
          onboardingCardsLoading={isCardsPending}
          headerSlot={
            <div className="pointer-events-none flex w-full select-none items-center justify-between gap-2 px-4 py-2">
              <Button
                className="pointer-events-auto"
                icon={<ArrowIcon className="-rotate-90" />}
                size={ButtonSize.Small}
                type="button"
                variant={ButtonVariant.Tertiary}
                onClick={() => {
                  router.back();
                }}
              />
              <Button
                className="pointer-events-auto shrink-0"
                size={ButtonSize.Small}
                type="button"
                variant={ButtonVariant.Tertiary}
                onClick={() => {
                  setOnboardingUiMode('tags');
                }}
              >
                Use tags instead
              </Button>
            </div>
          }
          topSlot={
            <SwipeOnboardingProgressHeader
              milestoneBurstKey={milestoneBurstKey}
              progressCount={onboardingProgressCount}
            />
          }
          bottomSlot={bottomContinueSlot}
          onRequestClose={() => {
            onComplete().catch(() => null);
          }}
        />
      ) : (
        <Modal
          isOpen
          className="tablet:!max-h-[calc(100vh-2rem)]"
          onRequestClose={() => {
            onComplete().catch(() => null);
          }}
          size={ModalSize.Small}
        >
          <Modal.Body className="flex min-h-0 w-full flex-1 flex-col overflow-hidden overflow-x-hidden bg-overlay-quaternary-onion !p-0 tablet:flex-none tablet:!overflow-x-visible">
            <div className="pointer-events-none flex w-full shrink-0 select-none items-center justify-between gap-2 px-4 py-2">
              <Button
                className="pointer-events-auto"
                icon={<ArrowIcon className="-rotate-90" />}
                size={ButtonSize.Small}
                type="button"
                variant={ButtonVariant.Tertiary}
                onClick={() => {
                  router.back();
                }}
              />
              <Button
                className="pointer-events-auto shrink-0"
                size={ButtonSize.Small}
                type="button"
                variant={ButtonVariant.Tertiary}
                onClick={() => {
                  setOnboardingUiMode('swipe');
                }}
              >
                Switch to swipe
              </Button>
            </div>
            <SwipeOnboardingProgressHeader
              copyVariant="tags"
              milestoneBurstKey={milestoneBurstKey}
              progressCount={onboardingProgressCount}
            />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-2 pb-2 pt-2 tablet:max-w-md tablet:self-center">
                {isFeedSettingsLoading || !feedSettings ? (
                  <div className="flex flex-1 items-center justify-center py-10">
                    <Loader />
                  </div>
                ) : (
                  <EditTag
                    feedSettings={feedSettings}
                    headline="Pick tags that are relevant to you"
                  />
                )}
              </div>
              {canContinue ? (
                <div className="relative z-10 shrink-0 border-t border-border-subtlest-tertiary bg-overlay-quaternary-onion pb-safe-or-2 pt-3 shadow-2">
                  {bottomContinueSlot}
                </div>
              ) : null}
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
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
