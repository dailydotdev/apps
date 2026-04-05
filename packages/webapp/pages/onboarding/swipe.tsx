import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import type { AuthOptionsProps } from '@dailydotdev/shared/src/components/auth/common';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding';
import {
  FooterLinks,
  withFeaturesBoundary,
} from '@dailydotdev/shared/src/components';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
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
import {
  DownvoteIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import HotAndColdModal from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import type { OnboardingSwipeCard } from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useQuery } from '@tanstack/react-query';
import { MOST_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { swipeOnboardingFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seoTitles = getPageSeoTitles('Swipe onboarding');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
};
const swipeOnboardingPreviewQueryKey = 'swipeOnboardingPreview';
const MIN_SWIPES_TO_CONTINUE = 10;

interface PopularFeedQueryData {
  page?: {
    edges?: Array<{
      node: Post;
    }>;
  };
}

function SwipeOnboardingPage(): ReactElement {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null as unknown as HTMLFormElement);
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { completeStep } = useOnboardingActions();
  const [swipesCount, setSwipesCount] = React.useState(0);
  const { data: cardsData, isPending: isCardsPending } =
    useQuery<PopularFeedQueryData>({
      queryKey: ['onboarding-swipe-popular-cards'],
      queryFn: () =>
        gqlClient.request(MOST_UPVOTED_FEED_QUERY, {
          first: 80,
          period: 30,
        }),
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

  const onSwipeAction = useCallback(() => {
    setSwipesCount((value) => value + 1);
  }, []);

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
      (cardsData?.page?.edges ?? []).map(({ node }) => ({
        id: node.id,
        title: node.title,
        image: node.image,
        source: {
          name: node.source?.name,
          image: node.source?.image,
        },
      })),
    [cardsData?.page?.edges],
  );

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

  const progress = Math.min((swipesCount / 40) * 100, 100);
  const progressPercent = Math.round(progress);
  const canContinue = swipesCount >= MIN_SWIPES_TO_CONTINUE;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background-default px-4 py-6">
      <HotAndColdModal
        isOpen
        showHeader={false}
        showDefaultActions={false}
        showAddHotTakeButton={false}
        onSwipeAction={(direction) => {
          if (direction === 'left' || direction === 'right') {
            onSwipeAction();
          }
        }}
        onboardingCards={onboardingCards}
        onboardingCardsLoading={isCardsPending}
        topSlot={
          <div className="pointer-events-none mb-1 mt-2 w-[calc(100%-5rem)] max-w-[17.5rem] select-none self-center p-4">
            <div className="mb-3 flex items-center justify-between">
              <Typography bold type={TypographyType.Callout}>
                Build your feed
              </Typography>
              <Logo
                position={LogoPosition.Empty}
                logoClassName={{ container: 'h-5' }}
                linkDisabled
              />
            </div>
            <div className="mb-2 flex items-center justify-between">
              <Typography bold type={TypographyType.Callout}>
                Feed personalization
              </Typography>
              <Typography
                color={TypographyColor.Secondary}
                type={TypographyType.Footnote}
              >
                {progressPercent}%
              </Typography>
            </div>
            <div className="relative h-1 w-full overflow-hidden rounded-50 bg-border-subtlest-tertiary">
              <div
                className="transition-width absolute inset-y-0 left-0 rounded-50 bg-accent-cabbage-default duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <Typography
              className="mt-2"
              color={TypographyColor.Tertiary}
              type={TypographyType.Footnote}
            >
              {swipesCount} swipes
            </Typography>
          </div>
        }
        bottomSlot={
          <div className="mt-10 px-4 pb-4">
            <div className="mb-3 flex items-center gap-3 px-1">
              <div className="border-accent-bacon-default/40 bg-accent-bacon-default/20 shadow-1 flex h-[4.75rem] flex-1 flex-col items-center justify-center gap-1 rounded-14 border px-2 text-accent-bacon-default">
                <DownvoteIcon size={IconSize.Large} />
                <span className="text-center font-bold typo-footnote">
                  Not interesting
                </span>
              </div>
              <div className="border-accent-cabbage-default/40 bg-accent-cabbage-default/20 shadow-1 flex h-[4.75rem] flex-1 flex-col items-center justify-center gap-1 rounded-14 border px-2 text-accent-cabbage-default">
                <UpvoteIcon size={IconSize.Large} />
                <span className="text-center font-bold typo-footnote">
                  Interesting
                </span>
              </div>
            </div>
            {canContinue && (
              <Button
                className="w-full"
                size={ButtonSize.Medium}
                variant={ButtonVariant.Primary}
                onClick={() => {
                  onComplete().catch(() => null);
                }}
              >
                Continue to my feed
              </Button>
            )}
          </div>
        }
        onRequestClose={() => {
          onComplete().catch(() => null);
        }}
      />
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
