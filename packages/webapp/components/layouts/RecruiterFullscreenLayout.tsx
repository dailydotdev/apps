import type { ReactNode } from 'react';
import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { InAppNotificationElement } from '@dailydotdev/shared/src/components/notifications/InAppNotification';
import { PromptElement } from '@dailydotdev/shared/src/components/modals/Prompt';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useGrowthBookContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import {
  isTesting,
  onboardingUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { PendingSubmissionProvider } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { useIntercom } from '../../hooks/useIntercom';

const RecruiterFullscreenLayoutInner = ({
  children,
}: {
  children: ReactNode;
}) => {
  const router = useRouter();
  const { user, isAuthReady, showLogin } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const { autoDismissNotifications } = useContext(SettingsContext);

  useIntercom();

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

    params.delete('id');

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
    <PendingSubmissionProvider>
      <div className="flex min-h-screen flex-col antialiased">
        <InAppNotificationElement />
        <PromptElement />
        <Toast autoDismissNotifications={autoDismissNotifications} />
        {children}
      </div>
    </PendingSubmissionProvider>
  );
};

const GetLayout = (page: ReactNode): ReactNode => {
  return (
    <RecruiterFullscreenLayoutInner>{page}</RecruiterFullscreenLayoutInner>
  );
};

export { GetLayout as getLayout };
