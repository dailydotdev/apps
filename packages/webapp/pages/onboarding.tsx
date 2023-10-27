import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useOnboardingContext } from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import classNames from 'classnames';
import { IntroductionOnboardingTitle } from '@dailydotdev/shared/src/components/onboarding/IntroductionOnboarding';
import AuthOptions, {
  AuthDisplay,
  AuthProps,
} from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import {
  CreateFeedButton,
  FilterOnboarding,
  FilterOnboardingV4,
  OnboardingHeader,
} from '@dailydotdev/shared/src/components/onboarding';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { MemberAlready } from '@dailydotdev/shared/src/components/onboarding/MemberAlready';
import {
  OnboardingFilteringTitle,
  OnboardingV3,
  OnboardingV4,
} from '@dailydotdev/shared/src/lib/featureValues';
import { storageWrapper as storage } from '@dailydotdev/shared/src/lib/storageWrapper';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useRouter } from 'next/router';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import {
  AnalyticsEvent,
  TargetType,
} from '@dailydotdev/shared/src/lib/analytics';
import {
  OnboardingStep,
  OnboardingTitleGradient,
  REQUIRED_TAGS_THRESHOLD,
  wrapperMaxWidth,
} from '@dailydotdev/shared/src/components/onboarding/common';
import {
  OnboardingMode,
  PREVIEW_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import { SIGNIN_METHOD_KEY } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import AlertContext from '@dailydotdev/shared/src/contexts/AlertContext';
import {
  useFeature,
  useGrowthBookContext,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import TrustedCompanies from '@dailydotdev/shared/src/components/TrustedCompanies';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import SignupDisclaimer from '@dailydotdev/shared/src/components/auth/SignupDisclaimer';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { OtherFeedPage, RequestKey } from '@dailydotdev/shared/src/lib/query';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import ArrowIcon from '@dailydotdev/shared/src/components/icons/Arrow';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import styles from '../components/layouts/Onboarding/index.module.css';

const versionToTitle: Record<OnboardingFilteringTitle, string> = {
  [OnboardingFilteringTitle.Control]: 'Choose topics to follow',
  [OnboardingFilteringTitle.V1]: 'What topic best describes you?',
  [OnboardingFilteringTitle.V2]: 'Which topics resonate with you the most?',
  [OnboardingFilteringTitle.V3]: `Pick the topics you'd love to dive into`,
  [OnboardingFilteringTitle.V4]: 'Choose the topics you’re passionate about',
};

const Title = classed('h2', 'font-bold');

const maxAuthWidth = 'tablet:max-w-[30rem]';

const Container = classed(
  'div',
  'flex flex-col overflow-x-hidden items-center min-h-[100vh] w-full h-full max-h-[100vh] flex-1 z-max',
);

const seo: NextSeoProps = {
  title: 'Get started',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

export function OnboardPage(): ReactElement {
  const router = useRouter();
  const isTracked = useRef(false);
  const { user, isAuthReady } = useAuthContext();
  const [isFiltering, setIsFiltering] = useState(false);
  const [finishedOnboarding, setFinishedOnboarding] = useState(false);
  const { onShouldUpdateFilters } = useOnboardingContext();
  const onboardingV2 = useFeature(feature.onboardingV2);
  const onboardingV3 = useFeature(feature.onboardingV3);
  const onboardingV4 = useFeature(feature.onboardingV4);
  const isOnboardingV3 = onboardingV3 !== OnboardingV3.Control;
  const { growthbook } = useGrowthBookContext();
  const filteringTitle = useFeature(feature.onboardingFilterTitle);
  const { onboardingIntroduction } = useThemedAsset();
  const { trackEvent } = useAnalyticsContext();
  const { alerts } = useContext(AlertContext);
  const [hasSelectTopics, setHasSelectTopics] = useState(false);
  const [auth, setAuth] = useState<AuthProps>({
    isAuthenticating: isOnboardingV3 && !!storage.getItem(SIGNIN_METHOD_KEY),
    isLoginFlow: false,
    defaultDisplay: AuthDisplay.OnboardingSignup,
  });
  const { isAuthenticating, isLoginFlow, email, defaultDisplay } = auth;
  const isPageReady = growthbook?.ready && isAuthReady;
  const { feedSettings } = useFeedSettings();

  const formRef = useRef<HTMLFormElement>();
  const title = versionToTitle[filteringTitle];

  useEffect(() => {
    if (isOnboardingV3) {
      setAuth((currentAuth) => ({
        ...currentAuth,
        isAuthenticating: !!storage.getItem(SIGNIN_METHOD_KEY),
      }));
    }
  }, [isOnboardingV3]);
  const onClickNext = () => {
    const screen = isFiltering ? OnboardingStep.Topics : OnboardingStep.Intro;

    trackEvent({
      event_name: AnalyticsEvent.ClickOnboardingNext,
      extra: JSON.stringify({ screen_value: screen }),
    });

    if (!isFiltering) {
      return setIsFiltering(true);
    }

    if (isOnboardingV3) {
      setFinishedOnboarding(true);
      if (!hasSelectTopics) {
        trackEvent({
          event_name: AnalyticsEvent.OnboardingSkip,
        });

        onShouldUpdateFilters(true);
      }
      return router.replace({
        pathname: '/',
        query:
          onboardingV4 === OnboardingV4.V4
            ? {
                welcome: 'true',
                hset: 'true',
              }
            : undefined,
      });
    }

    return setAuth({ isAuthenticating: true, isLoginFlow: false });
  };

  const onSuccessfulTransaction = () => {
    onShouldUpdateFilters(true);
    setFinishedOnboarding(true);
    if (hasSelectTopics) {
      return;
    }

    router.replace('/');
  };

  const onSuccessfulLogin = () => {
    setFinishedOnboarding(true);
    router.replace('/');
  };

  const onSuccessfulRegistration = () => {
    setIsFiltering(true);
  };

  useEffect(() => {
    if (!hasSelectTopics || !alerts?.myFeed) {
      return;
    }
    if (!isOnboardingV3 && alerts.myFeed === 'created') {
      router.replace('/');
    }
  }, [alerts, hasSelectTopics, isOnboardingV3, router]);

  useEffect(() => {
    if (!isPageReady || isTracked.current) {
      return;
    }

    if (user) {
      router.replace('/');
      return;
    }

    let targetId = onboardingV2;

    if (isOnboardingV3) {
      targetId = onboardingV3;
    }

    if (onboardingV4 === OnboardingV4.V4) {
      targetId = onboardingV4;
    }

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.MyFeedModal,
      target_id: targetId,
      extra: JSON.stringify({
        origin: OnboardingMode.Wall,
        steps: [OnboardingStep.Topics],
        mandating_categories: 0,
      }),
    });
    isTracked.current = true;
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trackEvent,
    isPageReady,
    onboardingV2,
    user,
    isOnboardingV3,
    onboardingV3,
  ]);

  const hasSelectedTopics = (tags: Record<string, boolean>) => {
    const hasTopics = Object.values(tags).some((value) => value === true);
    setHasSelectTopics(hasTopics);
  };

  const getAuthOptions = () => {
    return (
      <AuthOptions
        simplified
        className={classNames(
          'w-full rounded-none',
          isOnboardingV3 && 'h-full',
          maxAuthWidth,
          !isAuthenticating && 'max-w-full',
        )}
        trigger={AuthTriggers.Onboarding}
        formRef={formRef}
        defaultDisplay={isOnboardingV3 ? defaultDisplay : AuthDisplay.Default}
        forceDefaultDisplay={isOnboardingV3 && !isAuthenticating}
        initialEmail={email}
        isLoginFlow={isLoginFlow}
        targetId={isOnboardingV3 ? onboardingV3 : onboardingV2}
        onSuccessfulLogin={
          isOnboardingV3 ? onSuccessfulLogin : onSuccessfulTransaction
        }
        onSuccessfulRegistration={
          isOnboardingV3 ? onSuccessfulRegistration : onSuccessfulTransaction
        }
        onAuthStateUpdate={(props: AuthProps) =>
          setAuth({ isAuthenticating: true, ...props })
        }
      />
    );
  };

  const [isPreviewVisible, setPreviewVisible] = useState(false);

  const getContentV3 = (): ReactElement => {
    const tagsCount = feedSettings?.includeTags?.length || 0;
    const isPreviewEnabled = tagsCount >= REQUIRED_TAGS_THRESHOLD;

    if (isAuthenticating && !isFiltering) {
      return getAuthOptions();
    }

    return (
      <div
        className={classNames(
          'flex tablet:flex-1',
          !(isFiltering && onboardingV4 === OnboardingV4.V4) &&
            'laptop:max-w-[37.5rem]',
          !isFiltering && 'ml-auto',
          isFiltering &&
            onboardingV4 === OnboardingV4.Control &&
            'flex-col items-center ml-0 tablet:max-w-[32rem] laptop:max-w-[48.75rem]',
          isFiltering &&
            onboardingV4 === OnboardingV4.V4 &&
            'flex flex-col items-center justify-start w-full ml-0 mb-10',
        )}
      >
        {isFiltering && onboardingV4 === OnboardingV4.Control && (
          <>
            <Title className="text-center typo-title1">{title}</Title>
            <p className="mt-3 mb-10 text-center text-theme-label-secondary typo-title3">
              Pick a few subjects that interest you. <br />
              You can always change theselater.
            </p>
            <FilterOnboarding
              className="grid-cols-2 tablet:grid-cols-4 laptop:grid-cols-6 mt-4"
              onSelectedTopics={hasSelectedTopics}
            />
            <div className="flex sticky bottom-0 z-3 flex-col items-center py-4 mt-4 w-full">
              <div className="flex absolute inset-0 -z-1 w-full h-1/2 bg-gradient-to-t to-transparent from-theme-bg-primary" />
              <div className="flex absolute inset-0 top-1/2 -z-1 w-full h-1/2 bg-theme-bg-primary" />
              <Button className="btn-primary w-[22.5rem]" onClick={onClickNext}>
                Next
              </Button>
            </div>
          </>
        )}
        {isFiltering && onboardingV4 === OnboardingV4.V4 && (
          <>
            <Title className="text-center typo-large-title">
              Pick tags that relevant to you
            </Title>
            <FilterOnboardingV4
              className="mt-10 max-w-4xl"
              onSelectedTopics={hasSelectedTopics}
            />
            <Button
              className={classNames(
                'mt-10 btn',
                isPreviewVisible ? 'btn-primary' : 'btn-secondary',
              )}
              disabled={!isPreviewEnabled}
              rightIcon={
                <ArrowIcon
                  className={classNames(!isPreviewVisible && 'rotate-180')}
                />
              }
              onClick={() => {
                setPreviewVisible((current) => !current);
              }}
            >
              {isPreviewEnabled
                ? `${isPreviewVisible ? 'Hide' : 'Show'} feed preview`
                : `${tagsCount}/${REQUIRED_TAGS_THRESHOLD} to show feed preview`}
            </Button>
            {isPreviewEnabled && isPreviewVisible && (
              <FeedLayout>
                <p className="mt-6 -mb-4 text-center typo-body text-theme-label-secondary">
                  Change your selection tags to see different feed preview.
                </p>
                <Feed
                  className="px-6 pt-14 laptop:pt-10"
                  feedName={OtherFeedPage.Preview}
                  feedQueryKey={[RequestKey.FeedPreview, user?.id]}
                  query={PREVIEW_FEED_QUERY}
                  forceCardMode
                  showSearch={false}
                  options={{ refetchOnMount: true }}
                  allowPin
                />
                <CreateFeedButton className="mt-20" onClick={onClickNext} />
              </FeedLayout>
            )}
          </>
        )}
        {!isFiltering && (
          <div className="hidden tablet:block flex-1">
            <div className={classNames('relative', styles.videoWrapper)}>
              {
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  loop
                  autoPlay
                  muted
                  className={classNames(
                    'absolute -top-[20%] tablet:top-0 left-0 -z-1',
                    styles.video,
                  )}
                  poster={cloudinary.onboarding.video.poster}
                >
                  <source
                    src={cloudinary.onboarding.video.webm}
                    type="video/webm"
                  />
                  <source
                    src={cloudinary.onboarding.video.mp4}
                    type="video/mp4"
                  />
                </video>
              }
            </div>

            <TrustedCompanies />
          </div>
        )}
      </div>
    );
  };

  const getContent = (): ReactElement => {
    if (isAuthenticating) {
      return getAuthOptions();
    }

    return (
      <>
        {isFiltering ? (
          <Title className="typo-title2">{title}</Title>
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

  const getProgressBar = () => {
    if (isOnboardingV3) {
      const percentage = isFiltering ? 100 : 50;
      return <ProgressBar percentage={isAuthenticating ? percentage : 0} />;
    }

    const percentage = isAuthenticating ? 100 : 50;
    return <ProgressBar percentage={isFiltering ? percentage : 0} />;
  };

  const showOnboardingPage = !isAuthenticating && !isFiltering;

  const containerClass = isAuthenticating ? maxAuthWidth : 'max-w-[22.25rem]';

  if (!isPageReady) {
    return null;
  }

  if (finishedOnboarding) {
    return (
      <Container className="justify-center typo-title2">
        <Loader innerClassName="before:border-t-theme-color-cabbage after:border-theme-color-cabbage typo-title2" />
        <span className="ml-3">Building your feed...</span>
      </Container>
    );
  }

  return (
    <Container
      className={
        // Because of the video colours, we need to adjust the background colour a little bit
        isOnboardingV3 ? 'bg-[#0e1019]' : 'bg-theme-bg-primary flex-col'
      }
    >
      <NextSeo {...seo} titleTemplate="%s | daily.dev" />
      {onboardingV4 === OnboardingV4.Control && getProgressBar()}
      <OnboardingHeader
        showOnboardingPage={showOnboardingPage}
        isOnboardingV3={isOnboardingV3}
        setAuth={setAuth}
        onClickNext={onClickNext}
        isFiltering={isFiltering}
      />
      <div
        className={classNames(
          'flex flex-wrap justify-center px-6 w-full tablet:gap-10 flex-grow',
          wrapperMaxWidth,
          !isAuthenticating && isOnboardingV3 && 'flex-1 content-center mt-8',
        )}
      >
        {showOnboardingPage && isOnboardingV3 && (
          <div
            className={classNames(
              'flex flex-1 flex-col laptop:max-w-[27.5rem] laptop:mr-8',
            )}
          >
            <OnboardingTitleGradient className="mb-4 typo-large-title tablet:typo-mega1">
              Where developers grow together
            </OnboardingTitleGradient>

            <h2 className="mb-8 typo-body tablet:typo-title2">
              Get one personalized feed for all the knowledge you need.
            </h2>

            {getAuthOptions()}
          </div>
        )}

        {isOnboardingV3 ? (
          getContentV3()
        ) : (
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
        )}
      </div>
      {showOnboardingPage && isOnboardingV3 && (
        <footer
          className={classNames(
            'flex px-6 w-full h-full max-h-[10rem]',
            wrapperMaxWidth,
          )}
        >
          <div className="flex relative flex-col flex-1 gap-6 pb-6 tablet:mt-auto laptop:mr-8 laptop:max-w-[27.5rem]">
            <SignupDisclaimer className="mb-0 tablet:mb-10" />

            <TrustedCompanies
              iconSize={IconSize.Small}
              reverse
              className="block tablet:hidden"
            />

            <img
              className="absolute bottom-0 left-0 -z-1 w-full max-w-[58.75rem]"
              src={cloudinary.onboarding.glow}
              alt="Gradient background"
            />
          </div>
          <div className="hidden tablet:block flex-1" />
        </footer>
      )}
    </Container>
  );
}

export default withFeaturesBoundary(OnboardPage);
