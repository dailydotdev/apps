import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import type {
  AuthOptionsProps,
  AuthProps,
} from '@dailydotdev/shared/src/components/auth/AuthOptions';
import AuthOptions, {
  AuthDisplay,
} from '@dailydotdev/shared/src/components/auth/AuthOptions';
import type { AuthTriggersType } from '@dailydotdev/shared/src/lib/auth';
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
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import type { OnboardingOnClickNext } from '@dailydotdev/shared/src/components/onboarding/common';
import {
  OnboardingStep,
  wrapperMaxWidth,
} from '@dailydotdev/shared/src/components/onboarding/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { NextSeoProps } from 'next-seo';
import { SIGNIN_METHOD_KEY } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import {
  useFeature,
  useGrowthBookContext,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import SignupDisclaimer from '@dailydotdev/shared/src/components/auth/SignupDisclaimer';
import {
  FooterLinks,
  withFeaturesBoundary,
} from '@dailydotdev/shared/src/components';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import {
  logPixelSignUp,
  Pixels,
} from '@dailydotdev/shared/src/components/Pixels';
import {
  feature,
  featureOnboardingAndroid,
  featureOnboardingExtension,
  featureOnboardingDesktopPWA,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/auth';
import {
  useConditionalFeature,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { GenericLoader } from '@dailydotdev/shared/src/components/utilities/loaders';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { ChecklistViewState } from '@dailydotdev/shared/src/lib/checklist';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import dynamic from 'next/dynamic';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { PaymentContextProvider } from '@dailydotdev/shared/src/contexts/PaymentContext';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import {
  BrowserName,
  checkIsBrowser,
  getCurrentBrowserName,
  isIOS,
  isPWA,
  UserAgent,
} from '@dailydotdev/shared/src/lib/func';
import { useOnboardingExtension } from '@dailydotdev/shared/src/components/onboarding/Extension/useOnboardingExtension';
import { useOnboarding } from '@dailydotdev/shared/src/hooks/auth';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useInstallPWA } from '@dailydotdev/shared/src/components/onboarding/PWA/useInstallPWA';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import { getTemplatedTitle } from '../components/layouts/utils';

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
const OnboardingFooter = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingFooter" */ '@dailydotdev/shared/src/components/onboarding/OnboardingFooter'
  ).then((mod) => mod.OnboardingFooter),
);
const OnboardingPlusStep = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingPlusStep" */ '@dailydotdev/shared/src/components/onboarding/OnboardingPlusStep'
  ).then((mod) => mod.OnboardingPlusStep),
);

const OnboardingAndroidApp = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingAndroidApp" */ '@dailydotdev/shared/src/components/onboarding/OnboardingAndroidApp'
  ).then((mod) => mod.OnboardingAndroidApp),
);

const OnboardingPWA = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingPWA" */ '@dailydotdev/shared/src/components/onboarding/OnboardingPWA'
  ).then((mod) => mod.OnboardingPWA),
);

const OnboardingExtension = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingExtension" */ '@dailydotdev/shared/src/components/onboarding/Extension/OnboardingExtension'
  ).then((mod) => mod.OnboardingExtension),
);

const OnboardingInstallDesktop = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingInstallDesktopStep" */ '@dailydotdev/shared/src/components/onboarding/PWA/OnboardingInstallDesktop'
  ).then((mod) => mod.OnboardingInstallDesktop),
);

type OnboardingVisual = {
  fullBackground?: {
    mobile?: string;
    desktop?: string;
  };
};

const seo: NextSeoProps = {
  title: getTemplatedTitle('Get started'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

export function OnboardPage(): ReactElement {
  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get('email');
  const authTriggerParam = params.get('authTrigger');
  const {
    isOnboardingReady,
    hasCompletedEditTags,
    hasCompletedContentTypes,
    completeStep,
  } = useOnboarding();
  const router = useRouter();
  const { setSettings } = useSettingsContext();
  const isLogged = useRef(false);
  const { user, isAuthReady, anonymous, isAndroidApp } = useAuthContext();
  const { logSubscriptionEvent, showPlusSubscription: isOnboardingPlusActive } =
    usePlusSubscription();
  const shouldVerify = anonymous?.shouldVerify;
  const { growthbook } = useGrowthBookContext();
  const { logEvent } = useLogContext();
  const [auth, setAuth] = useState<AuthProps>({
    isAuthenticating:
      !!storage.getItem(SIGNIN_METHOD_KEY) || shouldVerify || !!emailParam,
    isLoginFlow: false,
    defaultDisplay: (() => {
      if (emailParam) {
        return AuthDisplay.Registration;
      }
      if (shouldVerify) {
        return AuthDisplay.EmailVerification;
      }
      return AuthDisplay.OnboardingSignup;
    })(),
    email: emailParam || anonymous?.email,
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
  const { isPushSupported } = usePushNotificationContext();
  const targetId: string = ExperimentWinner.OnboardingV4;
  const formRef = useRef<HTMLFormElement>();
  const [activeScreen, setActiveScreen] = useState(OnboardingStep.Intro);
  const [shouldEnrollOnboardingStep, setShouldEnrollOnboardingStep] =
    useState(false);
  const { value: appExperiment } = useConditionalFeature({
    feature: featureOnboardingAndroid,
    shouldEvaluate:
      shouldEnrollOnboardingStep &&
      checkIsBrowser(UserAgent.Android) &&
      !isAndroidApp,
  });
  const { shouldShowExtensionOnboarding } = useOnboardingExtension();
  const { value: extensionExperiment } = useConditionalFeature({
    feature: featureOnboardingExtension,
    shouldEvaluate: shouldEnrollOnboardingStep && shouldShowExtensionOnboarding,
  });
  const { isCurrentPWA, isAvailable: canUserInstallDesktop } = useInstallPWA();

  const hasSelectTopics = !!feedSettings?.includeTags?.length;
  const isCTA = [
    OnboardingStep.AndroidApp,
    OnboardingStep.PWA,
    OnboardingStep.Extension,
    OnboardingStep.InstallDesktop,
  ].includes(activeScreen);

  useEffect(() => {
    if (!isPageReady || isLogged.current || !isOnboardingReady) {
      return;
    }

    if (user?.infoConfirmed && !hasCompletedEditTags) {
      setActiveScreen(OnboardingStep.EditTag);
      return;
    }

    if (user?.infoConfirmed && !hasCompletedContentTypes) {
      setActiveScreen(OnboardingStep.ContentTypes);
      return;
    }

    if (user?.infoConfirmed && activeScreen === OnboardingStep.Intro) {
      const afterAuth = params.get('afterAuth');
      params.delete('afterAuth');
      router.replace(
        getPathnameWithQuery(afterAuth || webappUrl, params.toString()),
      );
      return;
    }

    isLogged.current = true;
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageReady, user, isOnboardingReady]);

  const onClickNext: OnboardingOnClickNext = (options) => {
    logEvent({
      event_name: LogEvent.ClickOnboardingNext,
      extra: JSON.stringify({ screen_value: activeScreen }),
    });

    if (activeScreen === OnboardingStep.Intro) {
      return setActiveScreen(OnboardingStep.EditTag);
    }

    if (activeScreen === OnboardingStep.EditTag) {
      completeStep(ActionType.EditTag);
      setShouldEnrollOnboardingStep(true);
      return setActiveScreen(OnboardingStep.ContentTypes);
    }

    if (activeScreen === OnboardingStep.ContentTypes) {
      completeStep(ActionType.ContentTypes);
    }

    if (
      activeScreen === OnboardingStep.ContentTypes &&
      isMobile &&
      isPushSupported
    ) {
      return setActiveScreen(OnboardingStep.ReadingReminder);
    }

    const isLastStepBeforePlus = [
      OnboardingStep.ContentTypes,
      OnboardingStep.ReadingReminder,
    ].includes(activeScreen);
    if (isOnboardingPlusActive && isLastStepBeforePlus) {
      return setActiveScreen(OnboardingStep.Plus);
    }

    if (appExperiment && activeScreen !== OnboardingStep.AndroidApp) {
      return setActiveScreen(OnboardingStep.AndroidApp);
    }

    if (isIOS() && !isPWA() && activeScreen !== OnboardingStep.PWA) {
      return setActiveScreen(OnboardingStep.PWA);
    }

    const isNotExtensionRelatedStep = ![
      OnboardingStep.Extension,
      OnboardingStep.InstallDesktop,
    ].includes(activeScreen);

    if (
      extensionExperiment &&
      shouldShowExtensionOnboarding &&
      isNotExtensionRelatedStep
    ) {
      return setActiveScreen(OnboardingStep.Extension);
    }

    const haveSkippedExtension =
      !options?.clickExtension && activeScreen === OnboardingStep.Extension;
    const browserName = getCurrentBrowserName();
    const browserDontHaveExtension = [
      BrowserName.Safari,
      BrowserName.Firefox,
    ].includes(browserName);

    if (
      isLaptop &&
      !isCurrentPWA &&
      canUserInstallDesktop &&
      activeScreen !== OnboardingStep.InstallDesktop &&
      (haveSkippedExtension || browserDontHaveExtension)
    ) {
      const installDesktopExperiment = growthbook.getFeatureValue(
        featureOnboardingDesktopPWA.id,
        featureOnboardingDesktopPWA.defaultValue,
      );
      if (installDesktopExperiment) {
        return setActiveScreen(OnboardingStep.InstallDesktop);
      }
    }

    logEvent({
      event_name: hasSelectTopics
        ? LogEvent.CreateFeed
        : LogEvent.OnboardingSkip,
    });

    const afterAuth = params.get('afterAuth');
    return router.replace({
      pathname: afterAuth || '/',
      query: {
        ua: 'true',
      },
    });
  };

  const onClickCreateFeed = () => {
    if (isOnboardingPlusActive) {
      logSubscriptionEvent({
        event_name: LogEvent.OnboardingSkipPlus,
        target_id: TargetId.Onboarding,
      });
    }

    setSettings({
      sidebarExpanded: true,
      onboardingChecklistView: ChecklistViewState.Open,
    });

    return onClickNext();
  };

  const onSuccessfulRegistration = (userRefetched: LoggedUser) => {
    logPixelSignUp({
      experienceLevel: userRefetched?.experienceLevel,
    });
    setActiveScreen(OnboardingStep.EditTag);
  };

  const authOptionProps: AuthOptionsProps = useMemo(() => {
    return {
      simplified: true,
      className: {
        container: classNames(
          'w-full rounded-none tablet:max-w-[30rem]',
          isAuthenticating && 'h-full',
          !isAuthenticating && 'max-w-full',
        ),
        onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
      },
      trigger:
        (authTriggerParam as AuthTriggersType) || AuthTriggers.Onboarding,
      formRef,
      defaultDisplay,
      forceDefaultDisplay: !isAuthenticating,
      initialEmail: email,
      isLoginFlow,
      targetId,
      onSuccessfulRegistration,
      onAuthStateUpdate: (props: AuthProps) =>
        setAuth({ isAuthenticating: true, ...props }),
      onboardingSignupButton: {
        size: isMobile ? ButtonSize.Medium : ButtonSize.Large,
        variant: ButtonVariant.Primary,
      },
    };
  }, [
    defaultDisplay,
    email,
    isAuthenticating,
    isLoginFlow,
    isMobile,
    targetId,
    authTriggerParam,
  ]);

  const customActionName = useMemo(() => {
    if (activeScreen === OnboardingStep.EditTag) {
      return 'Continue';
    }

    if (activeScreen === OnboardingStep.Plus) {
      return 'Skip for now ➞';
    }
    if (isCTA) {
      return 'Not now →';
    }

    return undefined;
  }, [activeScreen, isCTA]);

  const showOnboardingPage =
    !isAuthenticating && activeScreen === OnboardingStep.Intro && !shouldVerify;

  const showGenerigLoader =
    isAuthenticating &&
    isAuthLoading &&
    activeScreen === OnboardingStep.Intro &&
    !isOnboardingReady;
  if (!isPageReady) {
    return null;
  }

  return (
    <div
      className={classNames(
        'z-3 flex h-full max-h-dvh min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden',
        isCTA && 'fixed',
      )}
    >
      {showOnboardingPage && (
        <img
          alt="Onboarding background"
          className="pointer-events-none absolute inset-0 -z-1 h-full w-full object-cover tablet:object-center"
          fetchPriority="high"
          loading="eager"
          role="presentation"
          src={onboardingVisual.fullBackground.mobile}
          srcSet={`${onboardingVisual.fullBackground.mobile} 450w, ${onboardingVisual.fullBackground.desktop} 1024w`}
          sizes="(max-width: 655px) 450px, 1024px"
        />
      )}
      <Pixels />
      {showGenerigLoader && <GenericLoader />}
      <OnboardingHeader
        showOnboardingPage={showOnboardingPage}
        setAuth={setAuth}
        customActionName={customActionName}
        onClick={onClickCreateFeed}
        activeScreen={activeScreen}
      />
      <div
        className={classNames(
          'flex w-full flex-grow flex-col flex-wrap justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6',
          activeScreen === OnboardingStep.Intro && wrapperMaxWidth,
          !isAuthenticating && 'mt-7.5 flex-1 content-center',
          [OnboardingStep.Extension, OnboardingStep.InstallDesktop].includes(
            activeScreen,
          ) && '!flex-col',
        )}
      >
        {showOnboardingPage && (
          <>
            <div className="mt-5 flex flex-1 flex-grow-0 flex-col tablet:mt-0 tablet:flex-grow laptop:mr-8 laptop:max-w-[27.5rem]">
              <OnboardingHeadline
                className={{
                  title: 'tablet:typo-mega-1 typo-large-title',
                  description: 'mb-8 typo-body tablet:typo-title2',
                }}
              />
              <AuthOptions {...authOptionProps} />
            </div>
            <SignupDisclaimer className="mb-0 tablet:mb-10 tablet:hidden" />
          </>
        )}
        {isAuthenticating && activeScreen === OnboardingStep.Intro ? (
          <AuthOptions {...authOptionProps} />
        ) : (
          <div
            className={classNames(
              'flex tablet:flex-1',
              activeScreen === OnboardingStep.Intro
                ? 'flex-1 tablet:ml-auto laptop:max-w-[37.5rem]'
                : 'mb-10 ml-0 w-full flex-col items-center justify-start',
              isCTA &&
                'relative mb-auto flex-1 !justify-between overflow-hidden',
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
            {activeScreen === OnboardingStep.Plus && (
              <PaymentContextProvider>
                <OnboardingPlusStep onClickNext={onClickNext} />
              </PaymentContextProvider>
            )}
            {activeScreen === OnboardingStep.AndroidApp && (
              <OnboardingAndroidApp />
            )}
            {activeScreen === OnboardingStep.PWA && <OnboardingPWA />}
            {activeScreen === OnboardingStep.Extension && (
              <OnboardingExtension onClickNext={onClickNext} />
            )}
            {activeScreen === OnboardingStep.InstallDesktop && (
              <OnboardingInstallDesktop onClickNext={onClickNext} />
            )}
          </div>
        )}
      </div>
      {showOnboardingPage && <OnboardingFooter />}
      {!isCTA && <FooterLinks className="mx-auto pb-6" />}
    </div>
  );
}

OnboardPage.layoutProps = { seo };

export default withFeaturesBoundary(OnboardPage);
