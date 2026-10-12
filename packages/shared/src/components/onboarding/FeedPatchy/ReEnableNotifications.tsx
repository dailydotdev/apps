import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  BrowserName,
  checkIsBrowser,
  getCurrentBrowserName,
  isIOSNative,
  UserAgent,
} from '../../../lib/func';

type Platform =
  | 'iosApp'
  | 'androidApp'
  | 'androidWeb'
  | 'chrome'
  | 'edge'
  | 'firefox'
  | 'opera'
  | 'safari';

const SITE = 'app.daily.dev';

const strong = (text: string) => (
  <strong className="font-bold text-text-primary">{text}</strong>
);

/** After "Don't allow", the way back for this device. */
const steps: Record<Platform, ReactNode[]> = {
  iosApp: [
    <>
      Open {strong('Settings')} and find {strong('daily.dev')}
    </>,
    <>Tap {strong('Notifications')}</>,
    <>Turn on {strong('Allow Notifications')}</>,
  ],
  androidApp: [
    <>Open {strong('Settings › Apps › daily.dev')}</>,
    <>Tap {strong('Notifications')}</>,
    <>Turn on {strong('All daily.dev notifications')}</>,
  ],
  androidWeb: [
    <>Tap the {strong('icon')} left of the address</>,
    <>Tap {strong('Permissions')}</>,
    <>Turn on {strong('Notifications')}</>,
  ],
  chrome: [
    <>
      Click the {strong('site icon')} left of {SITE}
    </>,
    <>Turn on {strong('Notifications')}</>,
  ],
  edge: [
    <>
      Click the {strong('lock')} left of {SITE}
    </>,
    <>Choose {strong('Permissions for this site')}</>,
    <>
      Set {strong('Notifications')} to {strong('Allow')}
    </>,
  ],
  firefox: [
    <>
      Click the {strong('icon')} left of {SITE}
    </>,
    <>
      Clear {strong('Blocked')} next to {strong('Send notifications')}
    </>,
    <>Set the reminder again, and choose {strong('Allow')}</>,
  ],
  opera: [
    <>
      Click the {strong('lock')} left of {SITE}
    </>,
    <>Open {strong('Site settings')}</>,
    <>
      Set {strong('Notifications')} to {strong('Allow')}
    </>,
  ],
  safari: [
    <>Open {strong('Safari › Settings › Websites')}</>,
    <>Choose {strong('Notifications')}</>,
    <>
      Set {strong(SITE)} to {strong('Allow')}
    </>,
  ],
};

const getPlatform = (isAndroidApp: boolean): Platform => {
  if (isIOSNative()) {
    return 'iosApp';
  }

  if (isAndroidApp) {
    return 'androidApp';
  }

  if (checkIsBrowser(UserAgent.Android)) {
    return 'androidWeb';
  }

  if (globalThis?.navigator?.userAgent?.includes('OPR/')) {
    return 'opera';
  }

  const browser = getCurrentBrowserName();

  if (browser === BrowserName.Edge) {
    return 'edge';
  }

  if (browser === BrowserName.Firefox) {
    return 'firefox';
  }

  if (browser === BrowserName.Safari) {
    return 'safari';
  }

  return 'chrome';
};

interface ReEnableNotificationsProps {
  className?: string;
}

export const ReEnableNotifications = ({
  className,
}: ReEnableNotificationsProps): ReactElement => {
  const { isAndroidApp } = useAuthContext();
  const [platform] = useState(() => getPlatform(!!isAndroidApp));

  return (
    <ol
      className={classNames(
        'flex w-full flex-col gap-2.5 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left',
        className,
      )}
    >
      {steps[platform].map((step, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={index} className="flex items-start gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background-default font-bold tabular-nums text-text-primary typo-footnote">
            {index + 1}
          </span>
          <span className="pt-0.5 text-text-secondary typo-callout">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
};
