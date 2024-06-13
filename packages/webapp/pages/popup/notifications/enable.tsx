import React, { ComponentType, useEffect } from 'react';
import classNames from 'classnames';
import NotificationToggleIcon from '@dailydotdev/shared/src/components/icons/NotificationToggle/primary.svg';
import classed from '@dailydotdev/shared/src/lib/classed';
import { postWindowMessage } from '@dailydotdev/shared/src/lib/func';
import { ENABLE_NOTIFICATION_WINDOW_KEY } from '@dailydotdev/shared/src/hooks/useNotificationPermissionPopup';
import { useRouter } from 'next/router';
import { NotificationPromptSource } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { usePushNotificationMutation } from '@dailydotdev/shared/src/hooks/notifications';
import dynamic from 'next/dynamic';
import { isChrome } from '@dailydotdev/shared/src/lib/constants';

const BrowserPermissionIcon: ComponentType<{ className: string }> = dynamic(
  () =>
    import(
      /* webpackChunkName: "browserPermissionIcon" */ '@dailydotdev/shared/src/components/icons/BrowserPermission/primary.svg'
    ),
);
const ChromePermissionIcon: ComponentType<{ className: string }> = dynamic(
  () =>
    import(
      /* webpackChunkName: "browserPermissionIcon" */ '@dailydotdev/shared/src/components/icons/BrowserPermission/chrome.svg'
    ),
);

const BrowserIcon = isChrome() ? ChromePermissionIcon : BrowserPermissionIcon;

const InstructionContainer = classed(
  'div',
  'flex flex-col items-start p-4 mt-5 rounded-8 border border-border-subtlest-tertiary',
);

const iconClasses = 'flex flex-grow mt-2';

const Description = classed('p', 'typo-callout text-text-tertiary');

function Enable(): React.ReactElement {
  const router = useRouter();
  const { isSubscribed, isInitialized, logPermissionGranted } =
    usePushNotificationContext();
  const { onEnablePush } = usePushNotificationMutation();
  const { sendBeacon } = useLogContext();
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
        logPermissionGranted(source as NotificationPromptSource);
        closeWindow();
        return;
      }

      const isGranted = await onEnablePush(source as NotificationPromptSource);
      const permission = isGranted ? 'granted' : 'denied';
      postWindowMessage(ENABLE_NOTIFICATION_WINDOW_KEY, { permission });

      if (isGranted) {
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
        <div className="absolute inset-0 -z-1 size-52 -translate-y-[25%] rounded-50 bg-accent-cabbage-bolder opacity-64 blur-[3.125rem]" />
        Click allow
      </h1>
      <p className="mt-6 text-text-secondary typo-body">
        Enable web push notifications to be notified of important events such as
        replies, mentions, updates, etc.
      </p>
      <Description className="mt-28 font-bold">
        Didn&apos;t get the popup?
      </Description>
      <div>
        <InstructionContainer className="mb-1">
          <Description>1. Click on the icon in the search bar</Description>
          <BrowserIcon
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
