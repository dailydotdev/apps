import classNames from 'classnames';
import BrowserPermissionIcon from '@dailydotdev/shared/src/components/icons/BrowserPermission/primary.svg';
import NotificationToggleIcon from '@dailydotdev/shared/src/components/icons/NotificationToggle/primary.svg';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import {
  ENABLE_NOTIFICATION_WINDOW_KEY,
  useNotificationContext,
} from '@dailydotdev/shared/src/contexts/NotificationsContext';
import classed from '@dailydotdev/shared/src/lib/classed';
import { postWindowMessage } from '@dailydotdev/shared/src/lib/func';
import React, { useEffect } from 'react';

const getRedirectUri = () =>
  `${window.location.origin}${window.location.pathname}`;

const InstructionContainer = classed(
  'div',
  'flex flex-col p-4 mt-5 rounded-8 border border-theme-divider-tertiary',
);

const iconClasses = 'flex flex-grow mt-2';

const Description = classed('p', 'typo-callout text-theme-label-tertiary');

function Subscribe(): React.ReactElement {
  const { hasPermission, isInitialized, onTogglePermission } =
    useNotificationContext();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const checkPermission = async () => {
      if (hasPermission) {
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
    <BootDataProvider app="web" getRedirectUri={getRedirectUri}>
      <main className="flex overflow-hidden flex-col justify-center items-center w-screen h-screen max-h-[100%] max-w-[100%] bg-theme-overlay-float-cabbage">
        <h1 className="relative font-bold bg-transparent typo-mega3">
          <div className="absolute inset-0 -z-1 w-52 h-52 opacity-64 bg-theme-bg-cabbage-blur blur-[3.125rem] rounded-[3.125rem] -translate-y-[25%]" />
          Click Allow
        </h1>
        <p className="mt-6 text-theme-label-secondary typo-body">
          Enable Web Push Notifications in your browser
        </p>
        <Description className="mt-28 font-bold">
          Didn&apos;t get the permission popup?
        </Description>
        <InstructionContainer className="mb-1">
          <Description>
            1. Press the lock icon next to the search field
          </Description>
          <BrowserPermissionIcon
            className={classNames(iconClasses, 'w-full h-8')}
          />
        </InstructionContainer>
        <InstructionContainer>
          <Description>
            2. Under Notifications press the toggle button
          </Description>
          <NotificationToggleIcon
            className={classNames(iconClasses, 'w-52 h-8')}
          />
        </InstructionContainer>
      </main>
    </BootDataProvider>
  );
}

export default Subscribe;
