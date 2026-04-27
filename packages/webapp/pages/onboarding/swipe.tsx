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
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { swipeOnboardingFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { SwipeOnboardingBody } from '../../components/onboarding/SwipeOnboardingBody';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seoTitles = getPageSeoTitles('Swipe onboarding');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
};
const swipeOnboardingPreviewQueryKey = 'swipeOnboardingPreview';

function SwipeOnboardingPage(): ReactElement {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null as unknown as HTMLFormElement);
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { completeStep } = useOnboardingActions();

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

  return (
    <SwipeOnboardingBody
      onDone={() => {
        onComplete().catch(() => null);
      }}
      onRequestBack={() => {
        router.back();
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
