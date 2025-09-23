import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuthErrors } from '../hooks/useAuthErrors';
import { useAuthVerificationRecovery } from '../hooks/useAuthVerificationRecovery';
import { useNotificationParams } from '../hooks/useNotificationParams';
import { useAuthContext } from '../contexts/AuthContext';
import { isTesting, onboardingUrl } from '../lib/constants';
import { useGrowthBookContext } from './GrowthBookProvider';
import { AuthTriggers } from '../lib/auth';
import type { MainLayoutProps } from './MainLayout';
import { NoSidebarLayout } from './NoSidebarLayout';
import { RecruiterLayoutHeader } from './layout/RecruiterLayoutHeader';

const GoBackHeaderMobile = dynamic(
  () =>
    import(
      /* webpackChunkName: "goBackHeaderMobile" */ './post/GoBackHeaderMobile'
    ),
  { ssr: false },
);

export type RecruiterLayoutProps = Pick<
  MainLayoutProps,
  'children' | 'canGoBack' | 'onLogoClick' | 'activePage' | 'additionalButtons'
>;

export const RecruiterLayout = ({
  children,
  canGoBack,
  additionalButtons,
  onLogoClick,
}: RecruiterLayoutProps): ReactElement => {
  const router = useRouter();
  const { user, isAuthReady, showLogin } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  useAuthErrors();
  useAuthVerificationRecovery();
  useNotificationParams();

  const isPageReady =
    (growthbook?.ready && router?.isReady && isAuthReady) || isTesting;
  const shouldRedirectOnboarding = !user && isPageReady && !isTesting;

  useEffect(() => {
    if (!shouldRedirectOnboarding) {
      return;
    }

    const entries = Object.entries(router.query);

    if (entries.length === 0) {
      router.push(onboardingUrl);
      return;
    }

    const params = new URLSearchParams();

    entries.forEach(([key, value]) => {
      params.append(key, value as string);
    });

    params.delete('id'); // remove opportunity id param

    router.push(`${onboardingUrl}?${params.toString()}`);
  }, [shouldRedirectOnboarding, router]);

  const ignoredUtmMediumForLogin = ['slack'];
  const utmSource = router?.query?.utm_source;
  const utmMedium = router?.query?.utm_medium;
  const shouldShowLogin =
    !user &&
    isAuthReady &&
    utmSource === 'notification' &&
    !ignoredUtmMediumForLogin.includes(utmMedium as string);

  useEffect(() => {
    if (!shouldShowLogin) {
      return;
    }

    showLogin({
      trigger: AuthTriggers.FromNotification,
      options: { isLogin: true },
    });
  }, [shouldShowLogin, showLogin]);

  if (!isPageReady || shouldRedirectOnboarding) {
    return null;
  }

  return (
    <div className="antialiased">
      {!!canGoBack && <GoBackHeaderMobile />}
      <RecruiterLayoutHeader
        onLogoClick={onLogoClick}
        additionalButtons={additionalButtons}
      />
      <NoSidebarLayout
        hideBackButton
        className="flex flex-col gap-5 py-5 laptop:gap-10 laptop:py-10"
      >
        {children}
      </NoSidebarLayout>
    </div>
  );
};
