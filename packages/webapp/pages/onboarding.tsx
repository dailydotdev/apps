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
import {
  ONBOARDING_BOOT_QUERY_KEY,
  useOnboardingBoot,
} from '@dailydotdev/shared/src/features/onboarding/hooks/useOnboardingBoot';
import {
  getCookiesAndHeadersFromRequest,
  setResponseHeaderFromBoot,
} from '@dailydotdev/shared/src/features/onboarding/lib/utils';
import { Provider as JotaiProvider, useAtom } from 'jotai/react';

import { authAtom } from '@dailydotdev/shared/src/features/onboarding/store/onboarding.store';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding';
import { FunnelStepper } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepper';
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
    featureKey: 'onboarding',
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
  isLogin,
  shouldVerify,
  action,
}: {
  isLogin?: boolean;
  shouldVerify?: boolean;
  action?: OnboardingActions;
}): AuthDisplay => {
  if (!!action && actionToAuthDisplay[action]) {
    return actionToAuthDisplay[action];
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
  const { isAuthReady, anonymous, loginState, updateUser } = useAuthContext();
  const router = useRouter();
  const action = isValidAction(router.query.action) && router.query.action;
  const {
    data: { funnelState, ...boot },
  } = useOnboardingBoot();

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
        defaultDisplay: getDefaultDisplay({ isLogin, shouldVerify, action }),
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

  useEffect(() => {
    if (boot?.user && 'bio' in boot.user) {
      console.log('boot.user', boot.user);
      updateUser(boot.user);
      updateAuth({ isAuthenticating: false });
    }
  }, [boot.user, updateUser]);

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
    funnelState,
  };
};

function Onboarding(): ReactElement {
  const router = useRouter();
  const { isAuthenticating, isAuthReady, authOptionProps, funnelState } =
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
          <FunnelStepper {...funnelState} onComplete={onComplete} />
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
