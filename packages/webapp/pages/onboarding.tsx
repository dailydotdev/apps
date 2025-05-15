import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useGrowthBookContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import {
  useActions,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { GenericLoader } from '@dailydotdev/shared/src/components/utilities/loaders';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import type {
  AuthOptionsProps,
  AuthProps,
} from '@dailydotdev/shared/src/components/auth/common';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
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
import { Provider as JotaiProvider } from 'jotai/react';
import FunnelOrganicRegistration from '@dailydotdev/shared/src/features/onboarding/steps/FunnelOrganicRegistration';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from '@dailydotdev/shared/src/lib/image';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
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

export function OnboardPage({ dehydratedState }: PageProps): ReactElement {
  const router = useRouter();
  const { autoDismissNotifications } = useSettingsContext();
  const isLogged = useRef(false);
  const { user, isAuthReady, anonymous, loginState } = useAuthContext();
  const { isActionsFetched } = useActions();
  const shouldVerify = anonymous?.shouldVerify;
  const { growthbook } = useGrowthBookContext();
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
  const isMobile = useViewSize(ViewSize.MobileL);
  const targetId: string = ExperimentWinner.OnboardingV4;
  const formRef = useRef<HTMLFormElement>();
  const isOnboardingReady = isAuthReady && (isActionsFetched || !user);

  const showOnboardingPage = !isAuthenticating && !shouldVerify;
  const showGenerigLoader =
    isAuthenticating && isAuthLoading && !isOnboardingReady;

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

    // if (isIntro) {
    //   const params = new URLSearchParams(window.location.search);
    //   const afterAuth = params.get(AFTER_AUTH_PARAM);
    //   params.delete(AFTER_AUTH_PARAM);
    //   router.replace(getPathnameWithQuery(afterAuth || webappUrl, params));
    // }

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageReady, isOnboardingReady, user?.infoConfirmed, router]);

  /*
   * Complete steps on transition
   * OnboardingStep.InteractiveFeed -> completeStep(ActionType.EditTag)
   * OnboardingStep.EditTag -> completeStep(ActionType.EditTag)
   * OnboardingStep.ContentTypes -> completeStep(ActionType.ContentTypes)
   * */
  //
  // todo: add this as complete
  // logEvent({
  //   event_name: hasSelectTopics
  //     ? LogEvent.CreateFeed
  //     : LogEvent.OnboardingSkip,
  // });
  // const params = new URLSearchParams(window.location.search);
  // const afterAuth = params.get(AFTER_AUTH_PARAM);
  //
  // return router.replace({ pathname: afterAuth || '/' });

  const authOptionProps: AuthOptionsProps = useMemo(() => {
    const onSuccessfulRegistration = () => {
      // onTagsNext();
    };

    return {
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
    // onTagsNext,
  ]);

  if (!isPageReady) {
    return null;
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      <JotaiProvider>
        <div
          className={classNames(
            'z-3 flex h-full max-h-dvh min-h-dvh w-full flex-1 flex-col items-center overflow-x-hidden',
          )}
        >
          {showGenerigLoader && <GenericLoader />}
          {/* {(1 || isAuthenticating) && ( */}
          {/*  <OnboardingHeader */}
          {/*    showOnboardingPage={showOnboardingPage} */}
          {/*    setAuth={setAuth} */}
          {/*    onClick={onClickCreateFeed} */}
          {/*  /> */}
          {/* )} */}
          <div
            className={classNames(
              'flex w-full flex-grow flex-col flex-wrap justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6',
              !isAuthenticating && 'mt-7.5 flex-1 content-center',
            )}
          >
            {showOnboardingPage && <HotJarTracking hotjarId="3871311" />}

            {isAuthenticating ? (
              <AuthOptions {...authOptionProps} />
            ) : (
              <FunnelOrganicRegistration
                id="a"
                onTransition={() => null}
                transitions={[]}
                type={FunnelStepType.OrganicRegistration}
                formRef={formRef}
                parameters={{
                  headline: 'Welcome to Daily.dev',
                  explainer: 'Get the latest news from the developer community',
                  image: {
                    src: cloudinaryOnboardingFullBackgroundMobile,
                    srcSet: `${cloudinaryOnboardingFullBackgroundMobile} 450w, ${cloudinaryOnboardingFullBackgroundDesktop} 1024w`,
                  },
                }}
              />
            )}
          </div>
        </div>

        <Toast autoDismissNotifications={autoDismissNotifications} />
      </JotaiProvider>
    </HydrationBoundary>
  );
}

OnboardPage.layoutProps = { seo };

export default withFeaturesBoundary(OnboardPage);
