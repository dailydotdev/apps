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
import AuthOptions, {
  AuthDisplay,
  AuthProps,
} from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { FilterOnboarding } from '@dailydotdev/shared/src/components/onboarding';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
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
import { useCookieBanner } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import AlertContext from '@dailydotdev/shared/src/contexts/AlertContext';
import {
  useFeature,
  useGrowthBookContext,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { SignupDisclaimer } from '@dailydotdev/shared/src/components/auth/EmailSignupForm';
import TrustedCompanies from '@dailydotdev/shared/src/components/TrustedCompanies';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import CookieBanner from '../components/CookieBanner';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const versionToTitle: Record<OnboardingFilteringTitle, string> = {
  [OnboardingFilteringTitle.Control]: 'Choose topics to follow',
  [OnboardingFilteringTitle.V1]: 'What topic best describes you?',
  [OnboardingFilteringTitle.V2]: 'Which topics resonate with you the most?',
  [OnboardingFilteringTitle.V3]: `Pick the topics you'd love to dive into`,
  [OnboardingFilteringTitle.V4]: 'Choose the topics you’re passionate about',
};

const Title = classed('h2', 'font-bold typo-title1');

const maxAuthWidth = 'tablet:max-w-[30rem]';

// Because of the video colours, we need to adjust the background colour a little bit
// eslint-disable-next-line @dailydotdev/daily-dev-eslint-rules/no-custom-color
const Container = classed(
  'div',
  'flex flex-col overflow-x-hidden items-center min-h-[100vh] w-full h-full max-h-[100vh] flex-1 z-max bg-[#0A1119]',
);

const OnboardingTitle = classed(
  'h1',
  'mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-theme-color-bacon to-theme-color-cabbage',
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
          onAuthStateUpdate={(props: AuthProps) =>
            setAuth({ isAuthenticating: true, ...props })
          }
        />
      );
    }

    return (
      <>
        {isFiltering && (
          <>
            <Title className="font-bold text-center">{title}</Title>
            <p className="mt-3 mb-10 text-center text-theme-label-secondary typo-title3">
              Pick a few subjects that interest you. <br />
              You can always change theselater.
            </p>
          </>
        )}
        <div className="flex flex-1" />
        {isFiltering ? (
          <>
            <FilterOnboarding
              className="grid-cols-2 tablet:grid-cols-4 laptop:grid-cols-6 mt-4"
              onSelectedTopics={hasSelectedTopics}
            />
            <div className="flex sticky bottom-0 z-3 flex-col items-center pt-4 mt-4 w-full">
              <div className="flex absolute inset-0 -z-1 w-full h-1/2 bg-gradient-to-t to-transparent from-theme-bg-primary" />
              <div className="flex absolute inset-0 top-1/2 -z-1 w-full h-1/2 bg-theme-bg-primary" />
              <Button className="btn-primary w-[22.5rem]" onClick={onClickNext}>
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="hidden laptop:block">
            {
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                loop
                autoPlay
                muted
                className="absolute tablet:relative -top-14 -z-1 mt-1 -mb-16 tablet:scale-150"
              >
                <source
                  src={cloudinary.onboarding.video.mp4}
                  type="video/mp4"
                />
                <source
                  src={cloudinary.onboarding.video.webm}
                  type="video/webm"
                />
              </video>
            }
            <p className="relative z-3 mb-6 text-center opacity-64 typo-callout text-theme-label-quaternary">
              Trusted by 300K+ developers from the world&apos;s leading
              companies
            </p>

            <TrustedCompanies />
          </div>
        )}
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
      <header
        className={classNames(
          'flex justify-between w-full h-full flew-row px-6',
          !isAuthenticating && !isFiltering && 'mt-20 w-full max-w-[75rem]',
        )}
      >
        <Logo
          className={
            !isAuthenticating && !isFiltering
              ? 'w-auto'
              : 'py-8 px-10 w-auto laptop:w-full'
          }
          logoClassName={
            !isAuthenticating && !isFiltering ? 'h-logo-big' : 'h-logo'
          }
          position={LogoPosition.Relative}
        />

        {!isAuthenticating && !isFiltering && (
          <span
            className={classNames(
              'flex items-center',
              'text-theme-label-tertiary',
            )}
          >
            <span className="hidden tablet:block">
              Already a daily.dev member?
            </span>
            <Button
              className="ml-3 btn-secondary"
              onClick={() =>
                setAuth({ isAuthenticating: true, isLoginFlow: true })
              }
            >
              Log in
            </Button>
          </span>
        )}
      </header>
      <div className="flex flex-wrap flex-1 justify-center px-6 mt-8 laptop:mt-20 w-full max-w-[75rem]">
        {!isFiltering && !isAuthenticating && (
          <div
            className={classNames(
              'flex flex-1 flex-col laptop:max-w-[27.5rem] laptop:mr-8',
            )}
          >
            <OnboardingTitle className="typo-large-title tablet:typo-mega1">
              Where developers grow together
            </OnboardingTitle>

            <h2 className="mb-8 typo-body tablet:typo-title2">
              Get one personalized feed for all the knowledge you need.
            </h2>

            <AuthOptions
              trigger={AuthTriggers.Filter}
              formRef={formRef}
              simplified
              defaultDisplay={AuthDisplay.OnboardingSignup}
              onSuccessfulLogin={onSuccessfulTransaction}
              onSuccessfulRegistration={onSuccessfulTransaction}
              isLoginFlow={isLoginFlow}
              className={classNames('w-full', maxAuthWidth)}
              onAuthStateUpdate={(props: AuthProps) =>
                setAuth({ isAuthenticating: true, ...props })
              }
            />

            <div className="flex relative flex-col tablet:flex-row flex-1 justify-end tablet:items-center pb-6 tablet:pb-0 mt-8 tablet:mt-auto w-full tablet:max-h-[10rem]">
              <SignupDisclaimer className="mb-auto tablet:mb-0" />

              <div className="block tablet:hidden">
                <TrustedCompanies iconSize={IconSize.Small} />

                <p className="relative z-3 mb-6 text-center opacity-64 typo-callout text-theme-label-quaternary">
                  Trusted by 300K+ developers from the world&apos;s leading
                  companies
                </p>
              </div>

              <img
                className="absolute bottom-0 left-0 w-full max-w-[58.75rem]"
                src={cloudinary.onboarding.glow}
                alt="Gradient background"
              />
            </div>
          </div>
        )}

        <div
          className={classNames(
            'laptop:max-w-[37.5rem] tablet:max-w-1/2',
            isAuthenticating || isFiltering ? 'ml-0' : 'ml-auto',
          )}
        >
          {getContent()}
        </div>
      </div>
      {showCookie && <CookieBanner onAccepted={acceptCookies} />}
    </Container>
  );
}

export default OnboardPage;
