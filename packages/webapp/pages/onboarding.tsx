import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import AuthOptions, {
  AuthDisplay,
  AuthProps,
} from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ExperimentWinner } from '@dailydotdev/shared/src/lib/featureValues';
import { storageWrapper as storage } from '@dailydotdev/shared/src/lib/storageWrapper';
import { useRouter } from 'next/router';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import {
  OnboardingStep,
  wrapperMaxWidth,
} from '@dailydotdev/shared/src/components/onboarding/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { NextSeo, NextSeoProps } from 'next-seo';
import { SIGNIN_METHOD_KEY } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import {
  useFeature,
  useFeaturesReadyContext,
  useGrowthBookContext,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import SignupDisclaimer from '@dailydotdev/shared/src/components/auth/SignupDisclaimer';
import {
  FooterLinks,
  withFeaturesBoundary,
} from '@dailydotdev/shared/src/components';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import {
  EXPERIENCE_TO_SENIORITY,
  logSignUp,
  OnboardingLogs,
} from '@dailydotdev/shared/src/components/auth/OnboardingLogs';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/auth';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { GenericLoader } from '@dailydotdev/shared/src/components/utilities/loaders';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { ChecklistViewState } from '@dailydotdev/shared/src/lib/checklist';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import useMutateFilters from '@dailydotdev/shared/src/hooks/useMutateFilters';
import { OnboardingFooter } from '@dailydotdev/shared/src/components/onboarding/OnboardingFooter';
import dynamic from 'next/dynamic';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const ContentTypes = dynamic(() =>
  import(
    /* webpackChunkName: "contentTypes" */ '@dailydotdev/shared/src/components/onboarding/ContentTypes/ContentTypes'
  ).then((mod) => mod.ContentTypes),
);
const EditTag = dynamic(() =>
  import(
    /* webpackChunkName: "editTag" */ '@dailydotdev/shared/src/components/onboarding/EditTag'
  ).then((mod) => mod.EditTag),
);
const ReadingReminder = dynamic(() =>
  import(
    /* webpackChunkName: "readingReminder" */ '@dailydotdev/shared/src/components/onboarding/ReadingReminder'
  ).then((mod) => mod.ReadingReminder),
);
const TrustedCompanies = dynamic(
  () =>
    import(
      /* webpackChunkName: "trustedCompanies" */ '@dailydotdev/shared/src/components/TrustedCompanies'
    ),
);

type OnboardingVisual = {
  fullBackground?:
    | {
        mobile?: string;
        desktop?: string;
      }
    | false;
};

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
  const { growthbook } = useGrowthBookContext();
  const { logEvent } = useLogContext();
  const [hasSelectTopics, setHasSelectTopics] = useState(false);
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
  const onboardingVisual: OnboardingVisual = useFeature(
    feature.onboardingVisual,
  );
  const targetId: string = ExperimentWinner.OnboardingV4;
  const formRef = useRef<HTMLFormElement>();
  const [activeScreen, setActiveScreen] = useState(OnboardingStep.Intro);
  const { updateAdvancedSettings } = useMutateFilters(user);
  const isSeniorUser = useMemo(() => {
    return (
      EXPERIENCE_TO_SENIORITY[user?.experienceLevel] === 'senior' ||
      user?.experienceLevel === 'MORE_THAN_4_YEARS'
    );
  }, [user?.experienceLevel]);

  const isFeedSettingsDefined = useMemo(() => !!feedSettings, [feedSettings]);

  const updateSettingsBasedOnExperience = useCallback(() => {
    const LISTICLE_ADVANCED_SETTINGS_ID = 10;
    const MEMES_ADVANCED_SETTINGS_ID = 5;

    if (isSeniorUser && isFeedSettingsDefined) {
      updateAdvancedSettings({
        advancedSettings: [
          { id: MEMES_ADVANCED_SETTINGS_ID, enabled: false },
          { id: LISTICLE_ADVANCED_SETTINGS_ID, enabled: false },
        ],
      });
    }
  }, [isSeniorUser, isFeedSettingsDefined, updateAdvancedSettings]);

  useEffect(() => {
    if (!isPageReady || isLogged.current) {
      return;
    }

    if (user) {
      router.replace(getPathnameWithQuery(webappUrl, window.location.search));
      return;
    }

    isLogged.current = true;
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageReady, user]);

  useEffect(() => {
    setHasSelectTopics(!!feedSettings?.includeTags?.length);
  }, [feedSettings?.includeTags?.length]);

  if (!isPageReady) {
    return null;
  }

  const onClickNext = () => {
    logEvent({
      event_name: LogEvent.ClickOnboardingNext,
      extra: JSON.stringify({ screen_value: activeScreen }),
    });

    if (activeScreen === OnboardingStep.Intro) {
      return setActiveScreen(OnboardingStep.EditTag);
    }

    if (activeScreen === OnboardingStep.EditTag) {
      if (isSeniorUser) {
        const seniorContentOnboarding = getFeatureValue(
          feature.seniorContentOnboarding,
        );
        if (seniorContentOnboarding) {
          updateSettingsBasedOnExperience();
        }
      }

      return setActiveScreen(OnboardingStep.ContentTypes);
    }

    if (activeScreen === OnboardingStep.ContentTypes && isMobile) {
      return setActiveScreen(OnboardingStep.ReadingReminder);
    }

    if (!hasSelectTopics) {
      logEvent({
        event_name: LogEvent.OnboardingSkip,
      });
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
    setSettings({
      sidebarExpanded: true,
      onboardingChecklistView: ChecklistViewState.Open,
    });

    return onClickNext();
  };

  const onSuccessfulLogin = () => {
    router.replace(getPathnameWithQuery(webappUrl, window.location.search));
  };

  const onSuccessfulRegistration = (userRefetched: LoggedUser) => {
    logSignUp({
      experienceLevel: userRefetched?.experienceLevel,
    });
    setActiveScreen(OnboardingStep.EditTag);
  };

  const customActionName =
    activeScreen === OnboardingStep.EditTag ? 'Continue' : undefined;

  const showOnboardingPage =
    !isAuthenticating && activeScreen === OnboardingStep.Intro && !shouldVerify;

  const showGenerigLoader =
    isAuthenticating && isAuthLoading && activeScreen === OnboardingStep.Intro;

  const instanceId = router.query?.aiid?.toString();
  const userId = user?.id || anonymous?.id;

  const AuthOptionsRender = () => (
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

  return (
    <div className="z-3 flex h-full max-h-screen min-h-screen w-full flex-1 flex-col items-center overflow-x-hidden">
      {onboardingVisual.fullBackground && showOnboardingPage && (
        <img
          alt="Onboarding background"
          className="pointer-events-none absolute inset-0 -z-1 h-full w-full object-cover tablet:object-center"
          // @ts-expect-error - Not supported by react yet
          fetchpriority="high"
          loading="eager"
          role="presentation"
          src={onboardingVisual.fullBackground.mobile}
          srcSet={`${onboardingVisual.fullBackground.mobile} 450w, ${onboardingVisual.fullBackground.desktop} 1024w`}
          sizes="(max-width: 655px) 450px, 1024px"
        />
      )}
      <NextSeo {...seo} titleTemplate="%s | daily.dev" />
      <OnboardingLogs userId={userId} instanceId={instanceId} />
      {showGenerigLoader && <GenericLoader />}
      <OnboardingHeader
        showOnboardingPage={showOnboardingPage}
        setAuth={setAuth}
        customActionName={customActionName}
        onClickCreateFeed={onClickCreateFeed}
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
          <div className="mt-5 flex flex-1 flex-grow-0 flex-col tablet:mt-0 tablet:flex-grow laptop:mr-8 laptop:max-w-[27.5rem]">
            <OnboardingHeadline
              className={{
                title: 'tablet:typo-mega-1 typo-large-title',
                description: 'typo-body tablet:typo-title2',
              }}
            />
            <AuthOptionsRender />
          </div>
        )}
        {showOnboardingPage && (
          <SignupDisclaimer className="mb-0 tablet:mb-10 tablet:hidden" />
        )}
        {isAuthenticating && activeScreen === OnboardingStep.Intro ? (
          <AuthOptionsRender />
        ) : (
          <div
            className={classNames(
              'flex tablet:flex-1',
              activeScreen === OnboardingStep.Intro
                ? 'flex-1 tablet:ml-auto laptop:max-w-[37.5rem]'
                : 'mb-10 ml-0 flex w-full flex-col items-center justify-start',
            )}
          >
            {activeScreen === OnboardingStep.ReadingReminder && (
              <ReadingReminder onClickNext={onClickNext} />
            )}
            {activeScreen === OnboardingStep.EditTag && (
              <EditTag
                feedSettings={feedSettings}
                userId={user?.id}
                customActionName={customActionName}
                onClick={onClickNext}
                activeScreen={activeScreen}
              />
            )}
            {activeScreen === OnboardingStep.ContentTypes && <ContentTypes />}
          </div>
        )}
      </div>
      {showOnboardingPage && <OnboardingFooter />}
      <FooterLinks className="mx-auto pb-6" />
    </div>
  );
}

export default withFeaturesBoundary(OnboardPage);
