import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import type { MainLayoutProps } from './MainLayout';
import { NoSidebarLayout } from './NoSidebarLayout';
import { RecruiterLayoutHeader } from './layout/RecruiterLayoutHeader';
import { InAppNotificationElement } from './notifications/InAppNotification';
import { PromptElement } from './modals/Prompt';
import Toast from './notifications/Toast';
import SettingsContext from '../contexts/SettingsContext';
import { ErrorBoundary } from './ErrorBoundary';
import RecruiterErrorFallback from './errors/RecruiterErrorFallback';
import { useRecruiterLayoutReady } from '../hooks/useRecruiterLayoutReady';

export type RecruiterLayoutProps = Pick<
  MainLayoutProps,
  'children' | 'onLogoClick' | 'activePage'
> & {
  canGoBack?: boolean;
};

export const RecruiterLayout = ({
  children,
  canGoBack,
  onLogoClick,
}: RecruiterLayoutProps): ReactElement => {
  const { autoDismissNotifications } = useContext(SettingsContext);
  const { isPageReady } = useRecruiterLayoutReady();

  if (!isPageReady) {
    return null;
  }

  return (
    <div className="antialiased">
      <InAppNotificationElement />
      <PromptElement />
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <RecruiterLayoutHeader canGoBack={canGoBack} onLogoClick={onLogoClick} />
      <NoSidebarLayout
        hideBackButton
        className="flex flex-col gap-5 laptop:gap-10"
      >
        <ErrorBoundary
          feature="recruiter-self-serve"
          fallback={<RecruiterErrorFallback />}
        >
          {children}
        </ErrorBoundary>
      </NoSidebarLayout>
    </div>
  );
};
