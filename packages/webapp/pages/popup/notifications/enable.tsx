import classNames from 'classnames';
import BrowserPermissionIcon from '@dailydotdev/shared/src/components/icons/BrowserPermission/primary.svg';
import NotificationToggleIcon from '@dailydotdev/shared/src/components/icons/NotificationToggle/primary.svg';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import classed from '@dailydotdev/shared/src/lib/classed';
import { postWindowMessage } from '@dailydotdev/shared/src/lib/func';
import React, { useEffect } from 'react';
import { ENABLE_NOTIFICATION_WINDOW_KEY } from '@dailydotdev/shared/src/hooks/useNotificationPermissionPopup';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';

const getRedirectUri = () =>
  `${window.location.origin}${window.location.pathname}`;

const InstructionContainer = classed(
  'div',
  'flex flex-col items-start p-4 mt-5 rounded-8 border border-theme-divider-tertiary',
);

const iconClasses = 'flex flex-grow mt-2';

const Description = classed('p', 'typo-callout text-theme-label-tertiary');

function Enable(): React.ReactElement {
  const { isSubscribed, isInitialized, onTogglePermission } =
    useNotificationContext();

  useEffect(() => {
    if (!isInitialized || globalThis.Notification?.permission === 'denied') {
      return;
    }

    const checkPermission = async () => {
      if (isSubscribed) {
        postWindowMessage(ENABLE_NOTIFICATION_WINDOW_KEY, {
          permission: 'granted',
        });
        window.close();
        return;
      }

      const permission = await onTogglePermission();
      postWindowMessage(ENABLE_NOTIFICATION_WINDOW_KEY, { permission });

      if (permission === 'granted') {
        setTimeout(window.close, 2000);
      }
    };

    checkPermission();
  }, [isInitialized]);

  if (!isInitialized) {
    return null;
  }

  return (
    <BootDataProvider app={BootApp.Webapp} getRedirectUri={getRedirectUri}>
      <main className="flex overflow-hidden flex-col justify-center items-center px-20 w-screen h-screen text-center max-h-[100%] max-w-[100%] bg-theme-overlay-float-cabbage">
        <h1 className="relative font-bold bg-transparent typo-mega3">
          <div className="absolute inset-0 -z-1 w-52 h-52 opacity-64 bg-theme-bg-cabbage-blur blur-[3.125rem] rounded-[3.125rem] -translate-y-[25%]" />
          Click allow
        </h1>
        <p className="mt-6 text-theme-label-secondary typo-body">
          Enable web push notifications to be notified of important events such
          as replies, mentions, updates, etc.
        </p>
        <Description className="mt-28 font-bold">
          Didn&apos;t get the popup?
        </Description>
        <div>
          <InstructionContainer className="mb-1">
            <Description>
              1. Click on the lock icon in the search bar
            </Description>
            <BrowserPermissionIcon
              className={classNames(iconClasses, 'w-full h-8 max-w-[18.75rem]')}
            />
          </InstructionContainer>
          <InstructionContainer>
            <Description>
              2. Enable the toggle button under the notifications section
            </Description>
            <NotificationToggleIcon
              className={classNames(iconClasses, 'w-52 h-8')}
            />
          </InstructionContainer>
        </div>
      </main>
    </BootDataProvider>
  );
}

export default Enable;
