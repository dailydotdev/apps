import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';

export type Platform = 'ios' | 'android';

export interface PushContent {
  title: string;
  body: string;
  /** What the OS prints as the arrival time: "now" or "9:00 AM". */
  when: string;
}

const AppIcon = ({ size }: { size: 'ios' | 'android' }): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'flex shrink-0 items-center justify-center bg-black',
      size === 'ios' ? 'size-9 rounded-10' : 'size-5 rounded-full',
    )}
  >
    <LogoIcon
      className={{
        container: size === 'ios' ? 'h-5' : 'h-3',
        group: 'fill-white',
      }}
    />
  </span>
);

/** An iOS 18 notification as it lands on the lock screen. */
export const IosNotification = ({
  title,
  body,
  when,
  className,
}: PushContent & { className?: string }): ReactElement => (
  <div
    className={classNames(
      'flex w-full items-start gap-3 rounded-24 bg-white/85 px-3.5 py-3 text-left text-black shadow-2 backdrop-blur-xl',
      className,
    )}
  >
    <AppIcon size="ios" />
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 shrink truncate font-bold typo-subhead">{title}</span>
        <span className="shrink-0 text-black/50 typo-caption1">{when}</span>
      </div>
      <span className="text-black/80 typo-subhead">{body}</span>
    </div>
  </div>
);

/** An Android 15 notification card in the shade. */
export const AndroidNotification = ({
  title,
  body,
  when,
  className,
}: PushContent & { className?: string }): ReactElement => (
  <div
    className={classNames(
      'flex w-full flex-col gap-1 rounded-24 bg-white/90 px-4 py-3 text-left text-black shadow-2',
      className,
    )}
  >
    <div className="flex items-center gap-2 text-black/60 typo-caption1">
      <AppIcon size="android" />
      <span>daily.dev</span>
      <span aria-hidden>•</span>
      <span>{when}</span>
      <span aria-hidden className="ml-auto">
        ⌄
      </span>
    </div>
    <span className="font-bold typo-callout">{title}</span>
    <span className="text-black/70 typo-subhead">{body}</span>
  </div>
);

export const Notification = ({
  platform,
  ...content
}: PushContent & { platform: Platform; className?: string }): ReactElement =>
  platform === 'ios' ? (
    <IosNotification {...content} />
  ) : (
    <AndroidNotification {...content} />
  );

/**
 * The top of a phone's lock screen, cropped by a fade, with one or more
 * notifications on it. iOS centres the clock; Android sets it left and large.
 */
export const LockScreen = ({
  platform,
  clock,
  date,
  notifications,
}: {
  platform: Platform;
  clock: string;
  date: string;
  notifications: PushContent[];
}): ReactElement => {
  const isIos = platform === 'ios';

  return (
    <div
      className="relative w-full max-w-[18rem] overflow-hidden border-4 border-b-0 border-black bg-gradient-to-b from-accent-onion-bolder via-accent-cabbage-default to-accent-bacon-default"
      style={{
        borderTopLeftRadius: '2.5rem',
        borderTopRightRadius: '2.5rem',
        maskImage: 'linear-gradient(to bottom, black 82%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent)',
      }}
    >
      {isIos ? (
        <span
          aria-hidden
          className="mx-auto mt-2.5 block h-6 w-20 rounded-max bg-black"
        />
      ) : (
        <span
          aria-hidden
          className="mx-auto mt-3 block size-3 rounded-full bg-black"
        />
      )}
      <div
        className={classNames(
          'flex flex-col px-4 pb-14 text-white',
          isIos ? 'items-center pt-3' : 'items-start pt-4',
        )}
      >
        <span className="font-bold typo-footnote opacity-90">{date}</span>
        <span
          className={classNames(
            'leading-none',
            isIos ? 'font-bold tracking-tight' : 'font-normal',
          )}
          style={{ fontSize: isIos ? '4rem' : '4.5rem' }}
        >
          {clock}
        </span>
        <div
          className={classNames(
            'flex w-full flex-col gap-2',
            isIos ? 'mt-8' : 'mt-6',
          )}
        >
          {notifications.map((notification) => (
            <Notification
              key={`${notification.when}-${notification.title}`}
              platform={platform}
              {...notification}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
