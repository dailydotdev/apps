import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useOnboardingContext } from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import classNames from 'classnames';
import AuthOptions, {
  AuthDisplay,
  AuthProps,
} from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import {
  CreateFeedButton,
  FilterOnboardingV4,
  OnboardingHeader,
} from '@dailydotdev/shared/src/components/onboarding';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ExperimentWinner } from '@dailydotdev/shared/src/lib/featureValues';
import { storageWrapper as storage } from '@dailydotdev/shared/src/lib/storageWrapper';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useRouter } from 'next/router';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin, TargetType } from '@dailydotdev/shared/src/lib/log';
import {
  OnboardingStep,
  REQUIRED_TAGS_THRESHOLD,
  wrapperMaxWidth,
} from '@dailydotdev/shared/src/components/onboarding/common';
import {
  OnboardingMode,
  PREVIEW_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { NextSeo, NextSeoProps } from 'next-seo';
import { SIGNIN_METHOD_KEY } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import {
  useFeature,
  useFeaturesReadyContext,
  useGrowthBookContext,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import TrustedCompanies from '@dailydotdev/shared/src/components/TrustedCompanies';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import SignupDisclaimer from '@dailydotdev/shared/src/components/auth/SignupDisclaimer';
import {
  FeedPreviewControls,
  FooterLinks,
  withFeaturesBoundary,
} from '@dailydotdev/shared/src/components';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { OtherFeedPage, RequestKey } from '@dailydotdev/shared/src/lib/query';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import {
  logSignUp,
  OnboardingLogs,
} from '@dailydotdev/shared/src/components/auth/OnboardingLogs';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/auth';
import {
  useConditionalFeature,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { ReadingReminder } from '@dailydotdev/shared/src/components/auth/ReadingReminder';
import { GenericLoader } from '@dailydotdev/shared/src/components/utilities/loaders';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { ChecklistViewState } from '@dailydotdev/shared/src/lib/checklist';
import { FeedLayoutPreview } from '@dailydotdev/shared/src/components/auth/FeedLayoutPreview';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import styles from '../components/layouts/Onboarding/index.module.css';

type OnboardingVisual = {
  showCompanies?: boolean;
  fullBackground?:
    | {
        mobile?: string;
        desktop?: string;
      }
    | false;
  image?: string;
};

const Title = classed('h2', 'font-bold');

const maxAuthWidth = 'tablet:max-w-[30rem]';

const seo: NextSeoProps = {
  title: 'Get started',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

export function OnboardPage(): ReactElement {
  const router = useRouter();
  const { getFeatureValue } = useFeaturesReadyContext();
  const { setSettings } = useSettingsContext();
  const isLogged = useRef(false);
  const { user, isAuthReady, anonymous } = useAuthContext();
  const shouldVerify = anonymous?.shouldVerify;
  const { onShouldUpdateFilters } = useOnboardingContext();
  const { growthbook } = useGrowthBookContext();
  const { logEvent } = useLogContext();
  const [hasSelectTopics, setHasSelectTopics] = useState(false);
  const [shouldEnrollInReadingReminder, setShouldEnrollInReadingReminder] =
    useState(false);
  const { value: showReadingReminder, isLoading } = useConditionalFeature({
    feature: feature.readingReminder,
    shouldEvaluate: shouldEnrollInReadingReminder,
  });
  const [shouldEnrollFeedLayoutPreview, setShouldEnrollFeedLayoutPreview] =
    useState(false);
  const { value: showFeedLayoutPreview } = useConditionalFeature({
    feature: feature.feedLayoutPreview,
    shouldEvaluate: shouldEnrollFeedLayoutPreview,
  });
  const [auth, setAuth] = useState<AuthProps>({
    isAuthenticating: !!storage.getItem(SIGNIN_METHOD_KEY) || shouldVerify,
    isLoginFlow: false,
    defaultDisplay: shouldVerify
      ? AuthDisplay.EmailVerification
      : AuthDisplay.OnboardingSignup,
    ...(anonymous?.email && { email: anonymous.email }),
  });
  const {
    isAuthenticating,
    isLoginFlow,
    email,
    defaultDisplay,
    isLoading: isAuthLoading,
  } = auth;
  const isPageReady = growthbook?.ready && isAuthReady;
  const { feedSettings } = useFeedSettings();
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const onboardingVisual: OnboardingVisual = useFeature(
    feature.onboardingVisual,
  );
  const targetId: string = ExperimentWinner.OnboardingV4;
  const formRef = useRef<HTMLFormElement>();
  const [activeScreen, setActiveScreen] = useState(OnboardingStep.Intro);
  const onClickNext = () => {
    logEvent({
      event_name: LogEvent.ClickOnboardingNext,
      extra: JSON.stringify({ screen_value: activeScreen }),
    });

    if (activeScreen === OnboardingStep.Intro) {
      return setActiveScreen(OnboardingStep.EditTag);
    }

    if (activeScreen === OnboardingStep.EditTag && showReadingReminder) {
      return setActiveScreen(OnboardingStep.ReadingReminder);
    }

    // Since reading reminder is experiment we can't be sure which was the previous
    if (
      showFeedLayoutPreview &&
      (activeScreen === OnboardingStep.ReadingReminder ||
        activeScreen === OnboardingStep.EditTag)
    ) {
      return setActiveScreen(OnboardingStep.FeedLayout);
    }

    if (!hasSelectTopics) {
      logEvent({
        event_name: LogEvent.OnboardingSkip,
      });

      onShouldUpdateFilters(true);
    } else {
      logEvent({
        event_name: LogEvent.CreateFeed,
      });
    }

    return router.replace({
      pathname: '/',
      query: {
        ua: 'true',
      },
    });
  };

  const onClickCreateFeed = () => {
    setShouldEnrollInReadingReminder(true);
    if (isLaptop) {
      // Experiment is only for desktop users
      setShouldEnrollFeedLayoutPreview(true);
    }

    const onboardingChecklist = getFeatureValue(feature.onboardingChecklist);

    if (onboardingChecklist) {
      setSettings({
        sidebarExpanded: true,
        onboardingChecklistView: ChecklistViewState.Open,
      });
    }
  };

  // Manual evaluation after feature is loaded to force next from the above onClickCreateFeed function
  if (
    !isLoading &&
    activeScreen === OnboardingStep.EditTag &&
    shouldEnrollInReadingReminder
  ) {
    onClickNext();
    setShouldEnrollInReadingReminder(false);
  }

  const onSuccessfulLogin = () => {
    router.replace('/');
  };

  const onSuccessfulRegistration = (userRefetched: LoggedUser) => {
    logSignUp({
      experienceLevel: userRefetched?.experienceLevel,
    });
    setActiveScreen(OnboardingStep.EditTag);
  };

  useEffect(() => {
    if (!isPageReady || isLogged.current) {
      return;
    }

    if (user) {
      router.replace('/');
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.MyFeedModal,
      target_id: targetId,
      extra: JSON.stringify({
        origin: OnboardingMode.Wall,
        steps: [OnboardingStep.Topics],
        mandating_categories: 0,
      }),
    });
    isLogged.current = true;
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logEvent, isPageReady, user, targetId]);

  useEffect(() => {
    setHasSelectTopics(!!feedSettings?.includeTags?.length);
  }, [feedSettings?.includeTags?.length]);

  const getAuthOptions = () => {
    return (
      <AuthOptions
        simplified
        className={{
          container: classNames(
            'w-full rounded-none',
            maxAuthWidth,
            isAuthenticating && 'h-full',
            !isAuthenticating && 'max-w-full',
          ),
          onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
        }}
        trigger={AuthTriggers.Onboarding}
        formRef={formRef}
        defaultDisplay={defaultDisplay}
        forceDefaultDisplay={!isAuthenticating}
        initialEmail={email}
        isLoginFlow={isLoginFlow}
        targetId={targetId}
        onSuccessfulLogin={onSuccessfulLogin}
        onSuccessfulRegistration={onSuccessfulRegistration}
        onAuthStateUpdate={(props: AuthProps) =>
          setAuth({ isAuthenticating: true, ...props })
        }
        onboardingSignupButton={{
          size: isMobile ? ButtonSize.Medium : ButtonSize.Large,
          variant: ButtonVariant.Primary,
        }}
      />
    );
  };

  const [isPreviewVisible, setPreviewVisible] = useState(false);

  const getContent = (): ReactElement => {
    const tagsCount = feedSettings?.includeTags?.length || 0;
    const isPreviewEnabled = tagsCount >= REQUIRED_TAGS_THRESHOLD;

    if (isAuthenticating && activeScreen === OnboardingStep.Intro) {
      return getAuthOptions();
    }

    return (
      <div
        className={classNames(
          'flex tablet:flex-1',
          activeScreen === OnboardingStep.Intro
            ? 'tablet:ml-auto laptop:max-w-[37.5rem]'
            : 'mb-10 ml-0 flex w-full flex-col items-center justify-start',
          activeScreen === OnboardingStep.Intro &&
            onboardingVisual.fullBackground &&
            'flex-1',
        )}
      >
        {activeScreen === OnboardingStep.ReadingReminder && (
          <ReadingReminder onClickNext={onClickNext} />
        )}
        {activeScreen === OnboardingStep.FeedLayout && <FeedLayoutPreview />}
        {activeScreen === OnboardingStep.EditTag && (
          <>
            <Title className="text-center typo-large-title">
              Pick tags that are relevant to you
            </Title>
            <FilterOnboardingV4 className="mt-10 max-w-4xl" />
            <FeedPreviewControls
              isOpen={isPreviewVisible}
              isDisabled={!isPreviewEnabled}
              textDisabled={`${tagsCount}/${REQUIRED_TAGS_THRESHOLD} to show feed preview`}
              origin={Origin.EditTag}
              onClick={setPreviewVisible}
            />
            {isPreviewEnabled && isPreviewVisible && (
              <FeedLayout>
                <p className="-mb-4 mt-6 text-center text-text-secondary typo-body">
                  Change your tag selection until you&apos;re happy with your
                  feed preview.
                </p>
                <Feed
                  className="px-6 pt-14 laptop:pt-10"
                  feedName={OtherFeedPage.Preview}
                  feedQueryKey={[RequestKey.FeedPreview, user?.id]}
                  query={PREVIEW_FEED_QUERY}
                  showSearch={false}
                  options={{ refetchOnMount: true }}
                  allowPin
                />
                <CreateFeedButton
                  className="mt-20"
                  onClick={onClickCreateFeed}
                />
              </FeedLayout>
            )}
          </>
        )}
        {activeScreen === OnboardingStep.Intro &&
          !onboardingVisual.fullBackground && (
            <div className="block flex-1">
              <div
                className={classNames(
                  'tablet:min-h-[800px]:pt-[100%] relative overflow-y-clip tablet:overflow-y-visible tablet:pt-[80%]',
                )}
              >
                <img
                  src={onboardingVisual.image}
                  alt="Onboarding cover"
                  className={classNames(
                    'relative tablet:absolute tablet:left-0 tablet:top-0 tablet:-z-1',
                    styles.image,
                  )}
                />
              </div>
              {onboardingVisual.showCompanies && (
                <TrustedCompanies className="hidden tablet:block" />
              )}
            </div>
          )}
      </div>
    );
  };
  const getProgressBar = () => {
    if (activeScreen !== OnboardingStep.Intro) {
      return null;
    }

    const percentage = 50;
    return (
      <ProgressBar
        className={{ bar: 'absolute left-1 h-1' }}
        percentage={isAuthenticating ? percentage : 0}
      />
    );
  };

  const showOnboardingPage =
    !isAuthenticating && activeScreen === OnboardingStep.Intro && !shouldVerify;

  const showGenerigLoader =
    isAuthenticating && isAuthLoading && activeScreen === OnboardingStep.Intro;

  if (!isPageReady) {
    return null;
  }

  const instanceId = router.query?.aiid?.toString();
  const userId = user?.id || anonymous?.id;

  return (
    <div
      className={classNames(
        'z-3 flex h-full max-h-screen min-h-screen w-full flex-1 flex-col items-center overflow-x-hidden',
        showOnboardingPage &&
          onboardingVisual.fullBackground &&
          'bg-cover tablet:bg-center',
      )}
      style={{
        ...(showOnboardingPage &&
          onboardingVisual.fullBackground && {
            backgroundImage: `url(${
              isMobile
                ? onboardingVisual.fullBackground.mobile
                : onboardingVisual.fullBackground.desktop
            })`,
          }),
      }}
    >
      <NextSeo {...seo} titleTemplate="%s | daily.dev" />
      <OnboardingLogs userId={userId} instanceId={instanceId} />
      {getProgressBar()}
      {showGenerigLoader && <GenericLoader />}
      <OnboardingHeader
        showOnboardingPage={showOnboardingPage}
        setAuth={setAuth}
        onClickCreateFeed={onClickCreateFeed}
        onClickNext={onClickNext}
        activeScreen={activeScreen}
      />
      <div
        className={classNames(
          'flex w-full flex-grow flex-col flex-wrap justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6',
          activeScreen === OnboardingStep.Intro && wrapperMaxWidth,
          !isAuthenticating && 'mt-7.5 flex-1 content-center',
        )}
      >
        {showOnboardingPage && (
          <div
            className={classNames(
              'mt-5 flex flex-1 flex-col tablet:mt-0 laptop:mr-8 laptop:max-w-[27.5rem]',
              onboardingVisual.fullBackground && 'flex-grow-0 tablet:flex-grow',
            )}
          >
            <OnboardingHeadline
              className={{
                title: 'tablet:typo-mega-1 typo-large-title',
                description: 'typo-body tablet:typo-title2',
              }}
            />
            {getAuthOptions()}
          </div>
        )}
        {showOnboardingPage && (
          <SignupDisclaimer className="mb-0 tablet:mb-10 tablet:hidden" />
        )}
        {getContent()}
      </div>
      {showOnboardingPage && (
        <footer
          className={classNames(
            'flex h-full max-h-[10rem] w-full px-4 tablet:px-6',
            wrapperMaxWidth,
          )}
        >
          <div className="relative flex flex-1 flex-col gap-6 pb-6 tablet:mt-auto laptop:mr-8 laptop:max-w-[27.5rem]">
            <SignupDisclaimer className="mb-0 hidden tablet:mb-10 tablet:block" />

            <TrustedCompanies
              iconSize={IconSize.Small}
              reverse
              className=" mt-5 block tablet:hidden"
            />
          </div>
          <div className="hidden flex-1 tablet:block" />
        </footer>
      )}
      <FooterLinks className="mx-auto pb-6" />
    </div>
  );
}

export default withFeaturesBoundary(OnboardPage);
