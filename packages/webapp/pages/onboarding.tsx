import type { ReactElement } from 'react';
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import classNames from 'classnames';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ExperimentWinner } from '@dailydotdev/shared/src/lib/featureValues';
import { storageWrapper as storage } from '@dailydotdev/shared/src/lib/storageWrapper';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { NextSeoProps } from 'next-seo';
import { SIGNIN_METHOD_KEY } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import {
  FooterLinks,
  withFeaturesBoundary,
} from '@dailydotdev/shared/src/components';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import type {
  AuthOptionsProps,
  AuthProps,
} from '@dailydotdev/shared/src/components/auth/common';
import {
  actionToAuthDisplay,
  OnboardingActions,
  AuthDisplay,
} from '@dailydotdev/shared/src/components/auth/common';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import type { GetServerSideProps } from 'next';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import {
  FunnelBootFeatureKey,
  getFunnelBootData,
} from '@dailydotdev/shared/src/features/onboarding/funnelBoot';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { GdprConsentKey } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import {
  ONBOARDING_BOOT_QUERY_KEY,
  useOnboardingBoot,
} from '@dailydotdev/shared/src/features/onboarding/hooks/useOnboardingBoot';
import {
  getCookiesAndHeadersFromRequest,
  redirectToApp,
  setResponseHeaderFromBoot,
} from '@dailydotdev/shared/src/features/onboarding/lib/utils';
import { Provider as JotaiProvider, useAtom } from 'jotai/react';

import { authAtom } from '@dailydotdev/shared/src/features/onboarding/store/onboarding.store';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding';
import { FunnelStepper } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepper';
import { useOnboardingActions } from '@dailydotdev/shared/src/hooks/auth';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { isLocalhost } from '@dailydotdev/shared/src/lib/config';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureOnboardingPermissionPrimer } from '@dailydotdev/shared/src/lib/featureManagement';
import { useIsBrowserExtensionInstalled } from '@dailydotdev/shared/src/features/extensionEmbed/useIsBrowserExtensionInstalled';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { NewTabActivationPrimer } from '@dailydotdev/shared/src/features/onboarding/components/NewTabActivationPrimer';
import { getPageSeoTitles } from '../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seoTitles = getPageSeoTitles('Get started');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
};

type PageProps = {
  dehydratedState: DehydratedState;
  initialStepId: string | null;
  showCookieBanner?: boolean;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  req,
  res,
}) => {
  if (isLocalhost) {
    return { redirect: { destination: '/', permanent: false } };
  }

  const { id, version } = query;
  const { cookies, forwardedHeaders } = getCookiesAndHeadersFromRequest(req);

  // Get the boot data
  const boot = await getFunnelBootData({
    app: BootApp.Webapp,
    cookies,
    id: id ? `${id}` : undefined,
    version: version ? `${version}` : undefined,
    forwardedHeaders,
    featureKey: FunnelBootFeatureKey.Onboarding,
  });

  // Handle any cookies from the response
  setResponseHeaderFromBoot(boot, res);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ONBOARDING_BOOT_QUERY_KEY,
    queryFn: () => boot.data,
  });

  // Check if the user already accepted cookies
  const hasAcceptedCookies = cookies.includes(GdprConsentKey.Marketing);

  // Determine the initial step ID
  const initialStepId: string | null =
    boot.data?.funnelState?.session?.currentStep;

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      showCookieBanner: !hasAcceptedCookies,
      initialStepId,
    },
  };
};

const getDefaultDisplay = ({
  isLogin,
  shouldVerify,
  action,
  wasLoggedInBefore,
}: {
  isLogin?: boolean;
  shouldVerify?: boolean;
  action?: OnboardingActions;
  wasLoggedInBefore?: boolean;
}): AuthDisplay => {
  if (!!action && actionToAuthDisplay[action]) {
    return actionToAuthDisplay[action];
  }
  if (shouldVerify) {
    return AuthDisplay.EmailVerification;
  }
  if (wasLoggedInBefore) {
    return AuthDisplay.SignBack;
  }
  if (isLogin) {
    return AuthDisplay.Default;
  }
  return AuthDisplay.OnboardingSignup;
};

const isValidAction = (
  action?: string | string[],
): action is OnboardingActions => {
  return typeof action === 'string' && action in actionToAuthDisplay;
};

const useOnboardingAuth = () => {
  const formRef = useRef<HTMLFormElement>();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { isAuthReady, anonymous, loginState, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const action = isValidAction(router.query.action) && router.query.action;
  const {
    data: { funnelState },
  } = useOnboardingBoot();

  const [auth, setAuth] = useAtom(authAtom);
  const { isLoginFlow, defaultDisplay } = auth;
  const updateAuth = useCallback(
    (props: Partial<AuthProps>) => {
      setAuth((prev) => ({ ...prev, ...props }));
    },
    [setAuth],
  );

  const isInitialized = useRef(false);
  useEffect(() => {
    const email = loginState?.formValues?.email || anonymous?.email;
    const shouldVerify = anonymous?.shouldVerify;
    const isLogin = loginState?.isLogin;
    const isRequiredAuth = !(isLoggedIn && !shouldVerify);
    const hasLoginState =
      !!loginState?.formValues?.email || loginState?.isLogin;
    const wasLoggedInBefore = !!storage.getItem(SIGNIN_METHOD_KEY);

    if (!isAuthReady) {
      return;
    }

    // Update the auth state only:
    // - if it has not been initialized yet
    // - OR if the user needs email verification
    if (!isInitialized.current || anonymous?.shouldVerify) {
      isInitialized.current = true;
      updateAuth({
        defaultDisplay: getDefaultDisplay({
          isLogin,
          shouldVerify,
          action,
          wasLoggedInBefore,
        }),
        email,
        isAuthenticating:
          isRequiredAuth &&
          (!!action || shouldVerify || wasLoggedInBefore || hasLoginState),
        isLoading: !isAuthReady,
        isLoginFlow: loginState?.isLogin || action === OnboardingActions.Login,
      });
    }
  }, [
    action,
    anonymous?.email,
    anonymous?.shouldVerify,
    isAuthReady,
    isLoggedIn,
    loginState?.formValues?.email,
    loginState?.isLogin,
    updateAuth,
  ]);

  const authOptionProps: AuthOptionsProps = useMemo(
    () => ({
      simplified: true,
      className: {
        container: classNames(
          'w-full rounded-none tablet:max-w-[30rem]',
          auth.isAuthenticating ? 'h-full' : 'max-w-full',
        ),
        onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
      },
      trigger: loginState?.trigger || AuthTriggers.Onboarding,
      formRef,
      defaultDisplay,
      initialEmail: auth.email,
      isLoginFlow,
      targetId: ExperimentWinner.OnboardingV4,
      onSuccessfulRegistration: () => updateAuth({ isAuthenticating: false }),
      onSuccessfulLogin: () => updateAuth({ isAuthenticating: false }),
      onAuthStateUpdate: (props: AuthProps) =>
        updateAuth({ isAuthenticating: true, ...props }),
      onboardingSignupButton: {
        size: isMobile ? ButtonSize.Medium : ButtonSize.Large,
        variant: ButtonVariant.Primary,
      },
    }),
    [
      auth.email,
      defaultDisplay,
      auth.isAuthenticating,
      isLoginFlow,
      isMobile,
      loginState?.trigger,
      updateAuth,
    ],
  );

  return {
    auth,
    authOptionProps,
    funnelState,
    isAuthReady,
    isAuthenticating: auth.isAuthenticating,
    updateAuth,
    isLoggedIn,
  };
};

const PRIMER_COMPLETED_KEY = 'daily-extension-primer-completed';

function Onboarding({ initialStepId }: PageProps): ReactElement {
  const router = useRouter();
  const {
    isAuthenticating,
    isAuthReady,
    authOptionProps,
    funnelState,
    isLoggedIn,
  } = useOnboardingAuth();
  const { isOnboardingComplete, isOnboardingActionsReady, completeStep } =
    useOnboardingActions();
  const [isFunnelReady, setFunnelReady] = useState(false);
  const { logEvent } = useLogContext();
  const { isInstalled: isExtensionInstalled } =
    useIsBrowserExtensionInstalled();
  const isExtensionReentry = router.query.r === 'extension';
  const { value: isPrimerFeatureEnabled, isLoading: isPrimerFeatureLoading } =
    useConditionalFeature({
      feature: featureOnboardingPermissionPrimer,
      shouldEvaluate:
        isAuthReady &&
        !isLoggedIn &&
        isExtensionInstalled &&
        !isExtensionReentry,
    });
  // TODO(REMOVE-BEFORE-MERGE): testing override — forces the primer on for
  // every fresh install regardless of the GrowthBook flag, so the flow can
  // be exercised end-to-end locally. Delete this constant and the usage in
  // `shouldShowPrimer` below before merging.
  const FORCE_PRIMER_FOR_TESTING = true;
  const [isPrimerDone, setPrimerDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!storage.getItem(PRIMER_COMPLETED_KEY);
  });

  useEffect(() => {
    if (isExtensionReentry && !storage.getItem(PRIMER_COMPLETED_KEY)) {
      storage.setItem(PRIMER_COMPLETED_KEY, Date.now().toString());
      setPrimerDone(true);
      logEvent({ event_name: LogEvent.ExtensionPrimerSkipped });
    }
  }, [isExtensionReentry, logEvent]);

  const handlePrimerComplete = useCallback((): void => {
    storage.setItem(PRIMER_COMPLETED_KEY, Date.now().toString());
    setPrimerDone(true);
  }, []);

  const shouldShowPrimer =
    isAuthReady &&
    !isLoggedIn &&
    isExtensionInstalled &&
    !isExtensionReentry &&
    !isPrimerDone &&
    // TODO(REMOVE-BEFORE-MERGE): testing override — replace the next line
    // with `!isPrimerFeatureLoading && isPrimerFeatureEnabled` before merge.
    (FORCE_PRIMER_FOR_TESTING ||
      (!isPrimerFeatureLoading && isPrimerFeatureEnabled));

  const onComplete = useCallback(async () => {
    completeStep(ActionType.CompletedOnboarding);

    // todo: remove the completeStep for EditTag & ContentTypes
    //       once the extension will be adopted enough after the merge.
    completeStep(ActionType.EditTag);
    completeStep(ActionType.ContentTypes);

    await redirectToApp(router);
  }, [router, completeStep]);

  useEffect(() => {
    const {
      query: { action },
    } = router;

    if (
      action ||
      isAuthenticating !== false || // also cover the case when auth is still undefined at load time
      !isAuthReady ||
      isFunnelReady ||
      (isLoggedIn && !isOnboardingActionsReady)
    ) {
      return;
    }

    if (isOnboardingComplete) {
      // If the user is logged in and has completed the onboarding steps,
      // AND no active stepId is there, redirect them to app.
      redirectToApp(router);
    } else {
      // 1. If the user is not onboarded still, we activate the funnel.
      // 2. FunnelStepper will router.replace to the first step
      //    to avoid conflicts, we need to keep this flow detached other redirects
      setFunnelReady(true);
    }
  }, [
    isOnboardingComplete,
    isAuthReady,
    isAuthenticating,
    isFunnelReady,
    isLoggedIn,
    isOnboardingActionsReady,
    router,
  ]);

  if (shouldShowPrimer) {
    return (
      <div className="z-3 flex min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden">
        <OnboardingHeader />
        <NewTabActivationPrimer onComplete={handlePrimerComplete} />
        <FooterLinks className="mx-auto pb-6" />
      </div>
    );
  }

  if (isAuthenticating) {
    return (
      <div
        className={classNames(
          'z-3 flex h-full max-h-dvh min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden',
        )}
      >
        <OnboardingHeader />
        <div className="flex w-full flex-grow flex-col flex-wrap justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6">
          <AuthOptions {...authOptionProps} />
        </div>
        <FooterLinks className="mx-auto pb-6" />
      </div>
    );
  }

  return (
    isFunnelReady && (
      <div className="flex min-h-dvh min-w-full flex-col">
        <FunnelStepper
          {...funnelState}
          initialStepId={initialStepId}
          onComplete={onComplete}
        />
        {/* <HotJarTracking hotjarId="3871311" /> */}
      </div>
    )
  );
}

function Page(props: PageProps) {
  const { autoDismissNotifications } = useSettingsContext();

  return (
    <JotaiProvider>
      <ErrorBoundary feature="onboarding">
        <Onboarding {...props} />
      </ErrorBoundary>
      <Toast autoDismissNotifications={autoDismissNotifications} />
    </JotaiProvider>
  );
}

Page.layoutProps = { seo };

export default withFeaturesBoundary(Page);
