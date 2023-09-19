import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useOnboardingContext } from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import classNames from 'classnames';
import { IntroductionOnboardingTitle } from '@dailydotdev/shared/src/components/onboarding/IntroductionOnboarding';
import AuthOptions, {
  AuthProps,
} from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { FilterOnboarding } from '@dailydotdev/shared/src/components/onboarding';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { MemberAlready } from '@dailydotdev/shared/src/components/onboarding/MemberAlready';
import {
  OnboardingFilteringTitle,
  OnboardingV2,
} from '@dailydotdev/shared/src/lib/featureValues';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useRouter } from 'next/router';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import {
  AnalyticsEvent,
  TargetType,
} from '@dailydotdev/shared/src/lib/analytics';
import { OnboardingStep } from '@dailydotdev/shared/src/components/onboarding/common';
import { OnboardingMode } from '@dailydotdev/shared/src/graphql/feed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import { useCookieBanner } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import AlertContext from '@dailydotdev/shared/src/contexts/AlertContext';
import {
  useFeature,
  useGrowthBookContext,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import CookieBanner from '../components/CookieBanner';

const versionToTitle: Record<OnboardingFilteringTitle, string> = {
  [OnboardingFilteringTitle.Control]: 'Choose topics to follow',
  [OnboardingFilteringTitle.V1]: 'What topic best describes you?',
  [OnboardingFilteringTitle.V2]: 'Which topics resonate with you the most?',
  [OnboardingFilteringTitle.V3]: `Pick the topics you'd love to dive into`,
  [OnboardingFilteringTitle.V4]: 'Choose the topics you’re passionate about',
};

const Title = classed('h2', 'font-bold typo-title2');

const maxAuthWidth = 'tablet:max-w-[30rem]';

const Container = classed(
  'div',
  'flex flex-col overflow-x-hidden items-center min-h-[100vh] w-full h-full max-h-[100vh] flex-1 z-max bg-theme-bg-primary',
);

const seo: NextSeoProps = {
  title: 'Get started',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

export function OnboardPage(): ReactElement {
  const router = useRouter();
  const [showCookie, acceptCookies, updateCookieBanner] = useCookieBanner();
  const isTracked = useRef(false);
  const { user, isAuthReady } = useAuthContext();
  const [isFiltering, setIsFiltering] = useState(false);
  const [finishedOnboarding, setFinishedOnboarding] = useState(false);
  const [auth, setAuth] = useState<AuthProps>({
    isAuthenticating: false,
    isLoginFlow: false,
  });
  const { isAuthenticating, isLoginFlow } = auth;
  const { onShouldUpdateFilters } = useOnboardingContext();
  const onboardingV2 = useFeature(feature.onboardingV2);
  const { growthbook } = useGrowthBookContext();
  const filteringTitle = useFeature(feature.onboardingFilterTitle);
  const { onboardingIntroduction } = useThemedAsset();
  const { trackEvent } = useAnalyticsContext();
  const { alerts } = useContext(AlertContext);
  const [hasSelectTopics, setHasSelectTopics] = useState(false);

  const onClickNext = () => {
    const screen = isFiltering ? OnboardingStep.Topics : OnboardingStep.Intro;

    trackEvent({
      event_name: AnalyticsEvent.ClickOnboardingNext,
      extra: JSON.stringify({ screen_value: screen }),
    });

    if (!isFiltering) {
      return setIsFiltering(true);
    }

    return setAuth({ isAuthenticating: true, isLoginFlow: false });
  };

  const formRef = useRef<HTMLFormElement>();
  const title = versionToTitle[filteringTitle];
  const percentage = isAuthenticating ? 100 : 50;

  const onSuccessfulTransaction = () => {
    onShouldUpdateFilters(true);
    setFinishedOnboarding(true);
    if (hasSelectTopics) {
      return;
    }

    router.push('/');
  };

  useEffect(() => {
    if (!hasSelectTopics || !alerts?.myFeed) {
      return;
    }

    if (alerts.myFeed === 'created') {
      router.push('/');
    }
  }, [alerts, hasSelectTopics, router]);

  const isPageReady = growthbook?.ready && isAuthReady;

  useEffect(() => {
    if (!isPageReady || isTracked.current) {
      return;
    }

    if (user || onboardingV2 === OnboardingV2.Control) {
      router.push('/');
      return;
    }

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.MyFeedModal,
      target_id: onboardingV2,
      extra: JSON.stringify({
        origin: OnboardingMode.Wall,
        steps: [OnboardingStep.Topics],
        mandating_categories: 0,
      }),
    });
    isTracked.current = true;
  }, [trackEvent, isPageReady, onboardingV2, router, user]);

  useEffect(() => {
    updateCookieBanner(user);
  }, [updateCookieBanner, user]);

  const hasSelectedTopics = (tags: Record<string, boolean>) => {
    const hasTopics = Object.values(tags).some((value) => value === true);
    setHasSelectTopics(hasTopics);
  };

  const getContent = (): ReactElement => {
    if (isAuthenticating) {
      return (
        <AuthOptions
          trigger={AuthTriggers.Filter}
          formRef={formRef}
          simplified
          onSuccessfulLogin={onSuccessfulTransaction}
          onSuccessfulRegistration={onSuccessfulTransaction}
          isLoginFlow={isLoginFlow}
          className={classNames('w-full', maxAuthWidth)}
          onAuthStateUpdate={(props) =>
            setAuth({ isAuthenticating: true, ...props })
          }
        />
      );
    }

    return (
      <>
        {isFiltering ? (
          <Title className="font-bold typo-title2">{title}</Title>
        ) : (
          <IntroductionOnboardingTitle />
        )}
        <p className="px-6 mt-3 text-center whitespace-pre-line text-theme-label-secondary typo-body">
          Pick a few subjects that interest you. You can always change these
          later.
        </p>
        <div className="flex flex-1" />
        {isFiltering ? (
          <FilterOnboarding
            className="grid-cols-2 tablet:grid-cols-4 laptop:grid-cols-6 mt-4"
            onSelectedTopics={hasSelectedTopics}
          />
        ) : (
          <img
            alt="Sample illustration of selecting topics"
            src={onboardingIntroduction}
            className="absolute tablet:relative top-12 tablet:top-0 tablet:scale-125"
          />
        )}
        <div className="flex sticky bottom-0 z-3 flex-col items-center pt-4 mt-4 w-full">
          <div className="flex absolute inset-0 -z-1 w-full h-1/2 bg-gradient-to-t to-transparent from-theme-bg-primary" />
          <div className="flex absolute inset-0 top-1/2 -z-1 w-full h-1/2 bg-theme-bg-primary" />
          <Button className="btn-primary w-[22.5rem]" onClick={onClickNext}>
            Next
          </Button>
          <MemberAlready
            className={{
              container: 'text-theme-label-tertiary py-4',
              login: 'text-theme-label-primary',
            }}
            onLogin={() =>
              setAuth({ isAuthenticating: true, isLoginFlow: true })
            }
          />
        </div>
      </>
    );
  };

  const containerClass = isAuthenticating ? maxAuthWidth : 'max-w-[22.25rem]';

  if (finishedOnboarding) {
    return (
      <Container className="justify-center typo-title2">
        <Loader innerClassName="before:border-t-theme-color-cabbage after:border-theme-color-cabbage typo-title2" />
        <span className="ml-3">Building your feed...</span>
      </Container>
    );
  }

  return (
    <Container className="flex-col">
      <NextSeo {...seo} titleTemplate="%s | daily.dev" />
      <ProgressBar percentage={isFiltering ? percentage : 0} />
      <Logo
        className="py-8 px-10 w-auto laptop:w-full"
        position={LogoPosition.Relative}
      />
      <div
        className={classNames(
          'flex relative flex-col flex-1 items-center w-full max-h-[40rem]',
          isFiltering
            ? 'laptop:max-w-[48.75rem] tablet:max-w-[32rem]'
            : containerClass,
        )}
      >
        {getContent()}
      </div>
      {showCookie && <CookieBanner onAccepted={acceptCookies} />}
    </Container>
  );
}

export default OnboardPage;
