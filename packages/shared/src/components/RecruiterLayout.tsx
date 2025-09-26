import type { ReactElement } from 'react';
import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../contexts/AuthContext';
import { isTesting, onboardingUrl } from '../lib/constants';
import { useGrowthBookContext } from './GrowthBookProvider';
import { AuthTriggers } from '../lib/auth';
import type { MainLayoutProps } from './MainLayout';
import { NoSidebarLayout } from './NoSidebarLayout';
import { RecruiterLayoutHeader } from './layout/RecruiterLayoutHeader';
import { InAppNotificationElement } from './notifications/InAppNotification';
import { PromptElement } from './modals/Prompt';
import Toast from './notifications/Toast';
import SettingsContext from '../contexts/SettingsContext';

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
  const { autoDismissNotifications } = useContext(SettingsContext);

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

  const shouldShowLogin = !user && isAuthReady;

  useEffect(() => {
    if (!shouldShowLogin) {
      return;
    }

    showLogin({
      trigger: AuthTriggers.Opportunity,
      options: { isLogin: true },
    });
  }, [shouldShowLogin, showLogin]);

  if (!isPageReady || shouldRedirectOnboarding) {
    return null;
  }

  return (
    <div className="antialiased">
      {!!canGoBack && <GoBackHeaderMobile />}
      <InAppNotificationElement />
      <PromptElement />
      <Toast autoDismissNotifications={autoDismissNotifications} />
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
