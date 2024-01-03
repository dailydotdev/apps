import classNames from 'classnames';
import BrowserPermissionIcon from '@dailydotdev/shared/src/components/icons/BrowserPermission/primary.svg';
import NotificationToggleIcon from '@dailydotdev/shared/src/components/icons/NotificationToggle/primary.svg';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import classed from '@dailydotdev/shared/src/lib/classed';
import { postWindowMessage } from '@dailydotdev/shared/src/lib/func';
import React, { useEffect } from 'react';
import { ENABLE_NOTIFICATION_WINDOW_KEY } from '@dailydotdev/shared/src/hooks/useNotificationPermissionPopup';
import { useRouter } from 'next/router';
import { NotificationPromptSource } from '@dailydotdev/shared/src/lib/analytics';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';

const InstructionContainer = classed(
  'div',
  'flex flex-col items-start p-4 mt-5 rounded-8 border border-theme-divider-tertiary',
);

const iconClasses = 'flex flex-grow mt-2';

const Description = classed('p', 'typo-callout text-theme-label-tertiary');

function Enable(): React.ReactElement {
  const router = useRouter();
  const {
    isSubscribed,
    isInitialized,
    onTogglePermission,
    trackPermissionGranted,
  } = useNotificationContext();
  const { sendBeacon } = useAnalyticsContext();
  const { source } = router.query;

  useEffect(() => {
    if (!isInitialized || globalThis.Notification?.permission === 'denied') {
      return;
    }

    const checkPermission = async () => {
      const closeWindow = () => {
        sendBeacon();
        window.close();
      };

      if (isSubscribed) {
        postWindowMessage(ENABLE_NOTIFICATION_WINDOW_KEY, {
          permission: 'granted',
        });
        trackPermissionGranted(source as NotificationPromptSource);
        closeWindow();
        return;
      }

      const permission = await onTogglePermission(
        source as NotificationPromptSource,
      );
      postWindowMessage(ENABLE_NOTIFICATION_WINDOW_KEY, { permission });

      if (permission === 'granted') {
        setTimeout(closeWindow, 1000);
      }
    };

    checkPermission();
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  if (!isInitialized) {
    return null;
  }

  return (
    <main className="flex h-screen max-h-[100%] w-screen max-w-[100%] flex-col items-center justify-center overflow-hidden bg-theme-overlay-float-cabbage px-20 text-center">
      <h1 className="relative bg-transparent font-bold typo-mega3">
        <div className="absolute inset-0 -z-1 h-52 w-52 -translate-y-[25%] rounded-[3.125rem] bg-theme-bg-cabbage-blur opacity-64 blur-[3.125rem]" />
        Click allow
      </h1>
      <p className="mt-6 text-theme-label-secondary typo-body">
        Enable web push notifications to be notified of important events such as
        replies, mentions, updates, etc.
      </p>
      <Description className="mt-28 font-bold">
        Didn&apos;t get the popup?
      </Description>
      <div>
        <InstructionContainer className="mb-1">
          <Description>1. Click on the lock icon in the search bar</Description>
          <BrowserPermissionIcon
            className={classNames(iconClasses, 'h-8 w-full max-w-[18.75rem]')}
          />
        </InstructionContainer>
        <InstructionContainer>
          <Description>
            2. Enable the toggle button under the notifications section
          </Description>
          <NotificationToggleIcon
            className={classNames(iconClasses, 'h-8 w-52')}
          />
        </InstructionContainer>
      </div>
    </main>
  );
}

export default Enable;
