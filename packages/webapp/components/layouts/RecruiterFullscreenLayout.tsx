import type { ReactNode } from 'react';
import React, { useContext } from 'react';
import { InAppNotificationElement } from '@dailydotdev/shared/src/components/notifications/InAppNotification';
import { PromptElement } from '@dailydotdev/shared/src/components/modals/Prompt';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { PendingSubmissionProvider } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
import RecruiterErrorFallback from '@dailydotdev/shared/src/components/errors/RecruiterErrorFallback';
import { useRecruiterLayoutReady } from '@dailydotdev/shared/src/hooks/useRecruiterLayoutReady';
import { useIntercom } from '../../hooks/useIntercom';
import { recruiterSeo } from '../../next-seo';

const RecruiterFullscreenLayoutInner = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { autoDismissNotifications } = useContext(SettingsContext);
  const { isPageReady } = useRecruiterLayoutReady();

  useIntercom();

  if (!isPageReady) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col antialiased">
      <InAppNotificationElement />
      <PromptElement />
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <ErrorBoundary
        feature="recruiter-self-serve"
        fallback={<RecruiterErrorFallback />}
      >
        {children}
      </ErrorBoundary>
    </div>
  );
};

const GetLayout = (page: ReactNode): ReactNode => {
  return (
    <PendingSubmissionProvider>
      <RecruiterFullscreenLayoutInner>{page}</RecruiterFullscreenLayoutInner>
    </PendingSubmissionProvider>
  );
};

export { GetLayout as getLayout };

export const layoutProps = { seo: recruiterSeo };
