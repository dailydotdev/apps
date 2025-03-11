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
  onboardingStepsWithCTA,
  onboardingStepsWithFooter,
  OnboardingStep,
  wrapperMaxWidth,
} from '@dailydotdev/shared/src/components/onboarding/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { NextSeoProps } from 'next-seo';
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
  feature,
  featureOnboardingPlusCheckout,
} from '@dailydotdev/shared/src/lib/featureManagement';
import {
  useActions,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { GenericLoader } from '@dailydotdev/shared/src/components/utilities/loaders';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import dynamic from 'next/dynamic';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { PaymentContextProvider } from '@dailydotdev/shared/src/contexts/payment';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import { isIOS, isIOSNative, isPWA } from '@dailydotdev/shared/src/lib/func';
import { useOnboardingExtension } from '@dailydotdev/shared/src/components/onboarding/Extension/useOnboardingExtension';
import { useOnboarding } from '@dailydotdev/shared/src/hooks/auth';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { AFTER_AUTH_PARAM } from '@dailydotdev/shared/src/components/auth/common';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/auth';
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

const OnboardingPlusStep = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingPlusStep" */ '@dailydotdev/shared/src/components/onboarding/OnboardingPlusStep'
  ).then((mod) => mod.OnboardingPlusStep),
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

const PlusPage = dynamic(
  () => import(/* webpackChunkName: "plusPage" */ './plus'),
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
  const { hasCompletedEditTags, hasCompletedContentTypes, completeStep } =
    useOnboarding();
  const router = useRouter();
  const { setSettings, autoDismissNotifications } = useSettingsContext();
  const isLogged = useRef(false);
  const { logSubscriptionEvent } = usePlusSubscription();
  const { user, isAuthReady, anonymous, loginState, isValidRegion } =
    useAuthContext();
  const { isActionsFetched } = useActions();
  const shouldVerify = anonymous?.shouldVerify;
  const { growthbook } = useGrowthBookContext();
  const { getFeatureValue } = useFeaturesReadyContext();
  const { logEvent } = useLogContext();
  const [auth, setAuth] = useState<AuthProps>({
    isAuthenticating:
      !!storage.getItem(SIGNIN_METHOD_KEY) ||
      shouldVerify ||
      !!loginState?.formValues?.email ||
      loginState?.isLogin,
    isLoginFlow: loginState?.isLogin,
    defaultDisplay: (() => {
      if (loginState?.formValues?.email) {
        return AuthDisplay.Registration;
      }
      if (shouldVerify) {
        return AuthDisplay.EmailVerification;
      }
      if (loginState?.isLogin) {
        return AuthDisplay.Default;
      }
      return AuthDisplay.OnboardingSignup;
    })(),
    email: loginState?.formValues?.email || anonymous?.email,
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
  const { isPushSupported } = usePushNotificationContext();
  const targetId: string = ExperimentWinner.OnboardingV4;
  const formRef = useRef<HTMLFormElement>();
  const [activeScreen, setActiveScreen] = useState(OnboardingStep.Intro);
  const { shouldShowExtensionOnboarding } = useOnboardingExtension();
  const [isPlusCheckout, setIsPlusCheckout] = useState(false);
  const hasSelectTopics = !!feedSettings?.includeTags?.length;

  const layout = useMemo(
    () => ({
      hasFooter: onboardingStepsWithFooter.includes(activeScreen),
      hasCta: onboardingStepsWithCTA.includes(activeScreen),
    }),
    [activeScreen],
  );

  const isOnboardingReady = isAuthReady && (isActionsFetched || !user);

  useEffect(() => {
    if (
      !isPageReady ||
      isLogged.current ||
      !isOnboardingReady ||
      !user?.infoConfirmed
    ) {
      return;
    }

    isLogged.current = true;

    if (!hasCompletedEditTags) {
      setActiveScreen(OnboardingStep.EditTag);
      return;
    }

    if (!hasCompletedContentTypes) {
      setActiveScreen(OnboardingStep.ContentTypes);
      return;
    }

    if (activeScreen === OnboardingStep.Intro) {
      const params = new URLSearchParams(window.location.search);
      const afterAuth = params.get(AFTER_AUTH_PARAM);
      params.delete(AFTER_AUTH_PARAM);
      router.replace(getPathnameWithQuery(afterAuth || webappUrl, params));
    }

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isPageReady,
    user,
    isOnboardingReady,
    hasCompletedEditTags,
    hasCompletedContentTypes,
    activeScreen,
  ]);

  const onClickNext: OnboardingOnClickNext = () => {
    logEvent({
      event_name: LogEvent.ClickOnboardingNext,
      extra: JSON.stringify({ screen_value: activeScreen }),
    });

    if (activeScreen === OnboardingStep.Intro) {
      return setActiveScreen(OnboardingStep.EditTag);
    }

    if (activeScreen === OnboardingStep.EditTag) {
      completeStep(ActionType.EditTag);
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
    if (isLastStepBeforePlus && !isIOSNative() && isValidRegion) {
      const isPlusCheckoutExperiment = getFeatureValue(
        featureOnboardingPlusCheckout,
      );
      setIsPlusCheckout(isPlusCheckoutExperiment);
      return setActiveScreen(OnboardingStep.Plus);
    }

    if (isIOS() && !isPWA() && activeScreen !== OnboardingStep.PWA) {
      return setActiveScreen(OnboardingStep.PWA);
    }

    const isNotExtensionRelatedStep = ![OnboardingStep.Extension].includes(
      activeScreen,
    );

    if (shouldShowExtensionOnboarding && isNotExtensionRelatedStep) {
      return setActiveScreen(OnboardingStep.Extension);
    }

    logEvent({
      event_name: hasSelectTopics
        ? LogEvent.CreateFeed
        : LogEvent.OnboardingSkip,
    });

    const params = new URLSearchParams(window.location.search);
    const afterAuth = params.get(AFTER_AUTH_PARAM);

    return router.replace({ pathname: afterAuth || '/' });
  };

  const onClickCreateFeed = () => {
    logSubscriptionEvent({
      event_name: LogEvent.OnboardingSkipPlus,
      target_id: TargetId.Onboarding,
    });

    setSettings({ sidebarExpanded: true });

    return onClickNext();
  };

  const onSuccessfulRegistration = () => {
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
      trigger: loginState?.trigger || AuthTriggers.Onboarding,
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
    loginState,
  ]);

  const customActionName = useMemo(() => {
    if (activeScreen === OnboardingStep.EditTag) {
      return 'Continue';
    }

    if (activeScreen === OnboardingStep.Plus) {
      return 'Skip for now ➞';
    }
    if (layout.hasCta) {
      return 'Not now →';
    }

    return undefined;
  }, [activeScreen, layout.hasCta]);

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
    <PaymentContextProvider>
      <div
        className={classNames(
          'z-3 flex h-full max-h-dvh min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden',
          layout.hasCta && 'fixed',
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
        <Toast autoDismissNotifications={autoDismissNotifications} />
        {showGenerigLoader && <GenericLoader />}
        <OnboardingHeader
          showOnboardingPage={showOnboardingPage}
          setAuth={setAuth}
          customActionName={customActionName}
          onClick={onClickCreateFeed}
          activeScreen={activeScreen}
          showPlusIcon={isPlusCheckout && activeScreen === OnboardingStep.Plus}
        />
        <div
          className={classNames(
            'flex w-full flex-grow flex-col flex-wrap justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6',
            activeScreen === OnboardingStep.Intro && wrapperMaxWidth,
            !isAuthenticating && 'mt-7.5 flex-1 content-center',
            [OnboardingStep.Extension].includes(activeScreen) && '!flex-col',
          )}
        >
          {showOnboardingPage && (
            <div className="mt-5 flex flex-1 flex-grow-0 flex-col tablet:mt-0 tablet:flex-grow laptop:mr-8 laptop:max-w-[27.5rem]">
              <OnboardingHeadline
                className={{
                  title: 'tablet:typo-mega-1 typo-large-title',
                  description: 'mb-8 typo-body tablet:typo-title2',
                }}
              />
              <AuthOptions {...authOptionProps} />
              <SignupDisclaimer className="mb-4" />
            </div>
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
                layout.hasCta &&
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
              {activeScreen === OnboardingStep.Plus &&
                (isPlusCheckout ? (
                  <PlusPage shouldShowPlusHeader={false} />
                ) : (
                  <OnboardingPlusStep onClickNext={onClickNext} />
                ))}
              {activeScreen === OnboardingStep.PWA && <OnboardingPWA />}
              {activeScreen === OnboardingStep.Extension && (
                <OnboardingExtension onClickNext={onClickNext} />
              )}
            </div>
          )}
        </div>
        {layout.hasFooter && <FooterLinks className="mx-auto pb-6" />}
      </div>
    </PaymentContextProvider>
  );
}

OnboardPage.layoutProps = { seo };

export default withFeaturesBoundary(OnboardPage);
