import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import type {
  AuthOptionsProps,
  AuthProps,
} from '@dailydotdev/shared/src/components/auth/common';
import {
  actionToAuthDisplay,
  OnboardingActions,
  AFTER_AUTH_PARAM,
  AuthDisplay,
} from '@dailydotdev/shared/src/components/auth/common';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import type { GetServerSideProps } from 'next';
import type { DehydratedState } from '@tanstack/react-query';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getFunnelBootData } from '@dailydotdev/shared/src/features/onboarding/funnelBoot';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { GdprConsentKey } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { ONBOARDING_BOOT_QUERY_KEY } from '@dailydotdev/shared/src/features/onboarding/hooks/useOnboardingBoot';
import {
  getCookiesAndHeadersFromRequest,
  setResponseHeaderFromBoot,
} from '@dailydotdev/shared/src/features/onboarding/lib/utils';
import { Provider as JotaiProvider, useAtom } from 'jotai/react';
import FunnelOrganicRegistration from '@dailydotdev/shared/src/features/onboarding/steps/FunnelOrganicRegistration';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from '@dailydotdev/shared/src/lib/image';
import type { FunnelStepOrganicRegistration } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { authAtom } from '@dailydotdev/shared/src/features/onboarding/store/onboarding.store';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding';
import { HotJarTracking } from '../components/Pixels';
import { getTemplatedTitle } from '../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Get started'),
  openGraph: { ...defaultOpenGraph },
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
  const { id = 'test-funnel', version, stepId } = query;
  const { cookies, forwardedHeaders } = getCookiesAndHeadersFromRequest(req);

  // Get the boot data
  const boot = await getFunnelBootData({
    app: BootApp.Webapp,
    cookies,
    id: id ? `${id}` : undefined,
    version: version ? `${version}` : undefined,
    forwardedHeaders,
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
  const queryStepId = stepId as string | undefined;
  const initialStepId: string | null =
    queryStepId ?? boot.data?.funnelState?.session?.currentStep;

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      showCookieBanner: !hasAcceptedCookies,
      initialStepId,
    },
  };
};

const getDefaultDisplay = ({
  email,
  isLogin,
  shouldVerify,
  action,
}: {
  isLogin?: boolean;
  shouldVerify?: boolean;
  email?: string;
  action?: OnboardingActions;
}): AuthDisplay => {
  if (!!action && actionToAuthDisplay[action]) {
    return actionToAuthDisplay[action];
  }

  if (email) {
    return AuthDisplay.Registration;
  }
  if (shouldVerify) {
    return AuthDisplay.EmailVerification;
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
  const { isAuthReady, anonymous, loginState } = useAuthContext();
  const router = useRouter();
  const action = isValidAction(router.query.action) && router.query.action;

  const [auth, setAuth] = useAtom(authAtom);
  const { isAuthenticating, isLoginFlow, defaultDisplay } = auth;
  const updateAuth = useCallback(
    (props: Partial<AuthProps>) => {
      setAuth((prev) => ({ ...prev, ...props }));
    },
    [setAuth],
  );

  useEffect(
    () => {
      const email = loginState?.formValues?.email || anonymous?.email;
      const shouldVerify = anonymous?.shouldVerify;
      const isLogin = loginState?.isLogin;
      updateAuth({
        defaultDisplay: getDefaultDisplay({
          email,
          isLogin,
          shouldVerify,
          action,
        }),
        email,
        isAuthenticating:
          !!action ||
          !!storage.getItem(SIGNIN_METHOD_KEY) ||
          shouldVerify ||
          !!loginState?.formValues?.email ||
          loginState?.isLogin,
        isLoading: !isAuthReady,
        isLoginFlow: loginState?.isLogin || action === OnboardingActions.Login,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action, updateAuth],
  );

  const authOptionProps: AuthOptionsProps = useMemo(
    () => ({
      simplified: true,
      className: {
        container: classNames(
          'w-full rounded-none tablet:max-w-[30rem]',
          isAuthenticating ? 'h-full' : 'max-w-full',
        ),
        onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
      },
      trigger: loginState?.trigger || AuthTriggers.Onboarding,
      formRef,
      defaultDisplay,
      initialEmail: auth.email,
      isLoginFlow,
      targetId: ExperimentWinner.OnboardingV4,
      onSuccessfulRegistration: (user) => {
        // display funnel
        updateAuth({ isAuthenticating: false });
        console.log('User:', user);
        // onTagsNext();
      },
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
      isAuthenticating,
      isLoginFlow,
      isMobile,
      loginState?.trigger,
      updateAuth,
    ],
  );

  return {
    authOptionProps,
    isAuthenticating,
    auth,
    updateAuth,
    isAuthReady,
  };
};

function Onboarding(): ReactElement {
  const router = useRouter();
  const { isAuthenticating, isAuthReady, authOptionProps } =
    useOnboardingAuth();

  /*
   * Complete steps on transition
   * OnboardingStep.InteractiveFeed -> completeStep(ActionType.EditTag)
   * OnboardingStep.EditTag -> completeStep(ActionType.EditTag)
   * OnboardingStep.ContentTypes -> completeStep(ActionType.ContentTypes)
   * */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onComplete = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const afterAuth = params.get(AFTER_AUTH_PARAM);
    return router.replace({ pathname: afterAuth || '/' });
  }, [router]);

  const step: FunnelStepOrganicRegistration = {
    id: 'a',
    onTransition: (data) => console.log('Transition data:', data),
    transitions: [],
    type: FunnelStepType.OrganicRegistration,
    parameters: {
      headline: 'Where developers suffer together',
      explainer:
        "We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)",
      image: {
        src: cloudinaryOnboardingFullBackgroundMobile,
        srcSet: `${cloudinaryOnboardingFullBackgroundMobile} 450w, ${cloudinaryOnboardingFullBackgroundDesktop} 1024w`,
      },
    },
  };

  if (!isAuthReady) {
    return null;
  }

  return (
    <>
      {isAuthenticating ? (
        <div
          className={classNames(
            'z-3 flex h-full max-h-dvh min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden',
          )}
        >
          <OnboardingHeader />
          <div className="flex w-full flex-grow flex-col flex-wrap justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6">
            <AuthOptions {...authOptionProps} />
          </div>
        </div>
      ) : (
        <div className="flex min-h-dvh min-w-full flex-col">
          {/* Replace this with funnel */}
          <FunnelStepBackground step={step}>
            <FunnelOrganicRegistration
              formRef={authOptionProps.formRef}
              {...step}
            />
          </FunnelStepBackground>
          <HotJarTracking hotjarId="3871311" />
        </div>
      )}
    </>
  );
}

function Page({ dehydratedState }: PageProps) {
  const { autoDismissNotifications } = useSettingsContext();
  return (
    <HydrationBoundary state={dehydratedState}>
      <JotaiProvider>
        <Onboarding />
        <Toast autoDismissNotifications={autoDismissNotifications} />
      </JotaiProvider>
    </HydrationBoundary>
  );
}

Page.layoutProps = { seo };

export default withFeaturesBoundary(Page);
