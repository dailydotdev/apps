import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { cloudinaryAppIconMain } from '../../../lib/image';
import { isAppleDevice, isIOS, isIOSNative, isMobile } from '../../../lib/func';
import styles from './ReminderPreview.module.css';

export type PreviewPlatform = 'ios' | 'android' | 'mac' | 'windows';

export interface ReminderPush {
  title: string;
  body: string;
}

/** The device the reader is on, so the preview looks like their own. */
export const getPreviewPlatform = (): PreviewPlatform => {
  if (isIOSNative() || isIOS()) {
    return 'ios';
  }
  if (isMobile()) {
    return 'android';
  }
  return isAppleDevice() ? 'mac' : 'windows';
};

const AppIcon = ({ className }: { className: string }): ReactElement => (
  <img
    src={cloudinaryAppIconMain}
    alt=""
    className={classNames('shrink-0 object-cover', className)}
  />
);

/** The push as iOS lays it out on the lock screen. */
const IosPush = ({ title, body }: ReminderPush): ReactElement => (
  <div className="flex w-full items-start gap-3 rounded-24 border border-border-subtlest-tertiary bg-surface-float px-3.5 py-3 text-left">
    <AppIcon className="size-9 rounded-10" />
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-baseline justify-between gap-2">
        <span className="line-clamp-1 min-w-0 flex-1 font-bold typo-subhead">
          {title}
        </span>
        <span className="shrink-0 text-text-tertiary typo-caption1">now</span>
      </div>
      <span className="line-clamp-4 text-text-secondary typo-subhead">
        {body}
      </span>
    </div>
  </div>
);

/** The push as Android lays it out in the shade. */
const AndroidPush = ({ title, body }: ReminderPush): ReactElement => (
  <div className="flex w-full flex-col gap-1 rounded-24 border border-border-subtlest-tertiary bg-surface-float px-4 py-3 text-left">
    <div className="flex items-center gap-2 text-text-tertiary typo-caption1">
      <AppIcon className="size-5 rounded-full" />
      <span>daily.dev</span>
      <span aria-hidden>•</span>
      <span>now</span>
    </div>
    <span className="line-clamp-1 font-bold typo-callout">{title}</span>
    <span className="line-clamp-4 text-text-secondary typo-subhead">
      {body}
    </span>
  </div>
);

/** The top of a phone's lock screen, cropped by a fade, with the push on it. */
const LockScreen = ({
  isIos,
  clock,
  period,
  date,
  push,
}: {
  isIos: boolean;
  clock: string;
  period?: string;
  date: string;
  push: ReminderPush;
}): ReactElement => (
  <div
    className={classNames(
      styles.phone,
      'relative w-full max-w-72 overflow-hidden rounded-t-[2.5rem] border-4 border-b-0 border-border-subtlest-secondary bg-background-default',
    )}
  >
    <span
      aria-hidden
      className={classNames(
        'mx-auto block rounded-max bg-surface-float',
        isIos ? 'mt-2.5 h-6 w-20' : 'mt-3 size-3',
      )}
    />
    <div
      className={classNames(
        'flex flex-col items-center px-4 pb-14 text-text-primary',
        isIos ? 'pt-3' : 'pt-4',
      )}
    >
      <span className="font-bold text-text-secondary typo-footnote">
        {date}
      </span>
      <span
        className={classNames(
          'leading-none',
          isIos ? 'font-bold tracking-tight' : 'font-normal',
        )}
        style={{ fontSize: isIos ? '4rem' : '4.5rem' }}
      >
        {clock}
        {period && <span className="ml-1 typo-title2">{period}</span>}
      </span>
      <div
        className={classNames(
          'w-full',
          isIos ? 'mt-8' : 'mt-6',
          isIos ? styles.pushIos : styles.pushAndroid,
        )}
      >
        {isIos ? <IosPush {...push} /> : <AndroidPush {...push} />}
      </div>
    </div>
  </div>
);

/**
 * A laptop browser window with the push as Chrome shows it: in the top-right
 * corner on a Mac, the bottom-right on Windows.
 */
const DesktopScreen = ({
  isMac,
  push,
}: {
  isMac: boolean;
  push: ReminderPush;
}): ReactElement => (
  <div className="w-full max-w-[26rem] overflow-hidden rounded-16 border border-border-subtlest-secondary bg-background-subtle shadow-2">
    <div className="flex h-8 items-center gap-1.5 border-b border-border-subtlest-tertiary px-3">
      <span className="size-2.5 rounded-full bg-accent-ketchup-default" />
      <span className="size-2.5 rounded-full bg-accent-cheese-default" />
      <span className="size-2.5 rounded-full bg-accent-avocado-default" />
      <span className="mx-6 flex-1 truncate rounded-8 bg-surface-float px-3 py-0.5 text-center text-text-tertiary typo-caption2">
        app.daily.dev
      </span>
    </div>
    <div className="relative h-56 overflow-hidden p-4">
      <div aria-hidden className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }, (_, card) => (
          <span key={card} className="h-20 rounded-12 bg-surface-float" />
        ))}
      </div>
      <div
        className={classNames(
          styles.pushDesktop,
          'absolute right-3 flex w-64 items-start gap-3 border border-border-subtlest-tertiary bg-background-default p-3 text-left shadow-3',
          isMac ? 'top-3 rounded-16' : 'bottom-3 rounded-8',
        )}
      >
        <AppIcon className="size-9 rounded-10" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-baseline justify-between gap-2 text-text-tertiary typo-caption2">
            <span className="truncate">Chrome · app.daily.dev</span>
            <span className="shrink-0">now</span>
          </div>
          <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
            {push.title}
          </span>
          <span className="line-clamp-2 text-text-secondary typo-caption1">
            {push.body}
          </span>
        </div>
      </div>
    </div>
  </div>
);

/** The reminder exactly as it will land on the reader's device. */
export const ReminderPreview = ({
  platform,
  clock,
  period,
  date,
  push,
}: {
  platform: PreviewPlatform;
  clock: string;
  period?: string;
  date: string;
  push: ReminderPush;
}): ReactElement =>
  platform === 'mac' || platform === 'windows' ? (
    <DesktopScreen isMac={platform === 'mac'} push={push} />
  ) : (
    <LockScreen
      isIos={platform === 'ios'}
      clock={clock}
      period={period}
      date={date}
      push={push}
    />
  );
