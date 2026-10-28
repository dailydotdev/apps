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
        container: size === 'ios' ? 'w-5' : 'w-3',
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
      'flex w-full items-start gap-3 rounded-24 border border-border-subtlest-tertiary bg-surface-float px-3.5 py-3 text-left text-text-primary',
      className,
    )}
  >
    <AppIcon size="ios" />
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 shrink font-bold typo-subhead">{title}</span>
        <span className="shrink-0 text-text-tertiary typo-caption1">
          {when}
        </span>
      </div>
      <span className="text-text-secondary typo-subhead">{body}</span>
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
      'flex w-full flex-col gap-1 rounded-24 border border-border-subtlest-tertiary bg-surface-float px-4 py-3 text-left text-text-primary',
      className,
    )}
  >
    <div className="flex items-center gap-2 text-text-tertiary typo-caption1">
      <AppIcon size="android" />
      <span>daily.dev</span>
      <span aria-hidden>•</span>
      <span>{when}</span>
      <span aria-hidden className="ml-auto">
        ⌄
      </span>
    </div>
    <span className="font-bold typo-callout">{title}</span>
    <span className="text-text-secondary typo-subhead">{body}</span>
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

// A dark phone on the dark theme; on light, a white screen in a dark outline.
// The root carries `.light`, which Tailwind has no variant for.
const phoneCss = `
.rc-phone { border-color: var(--theme-border-subtlest-secondary); }
.light .rc-phone { border-color: var(--theme-text-primary); }
/* The push lands a beat after the screen: up from below on iOS, down from
   the status bar on Android, as each OS does it. */
@keyframes rc-push-ios {
  from { opacity: 0; transform: translateY(1.5rem) scale(0.92); }
}
@keyframes rc-push-android {
  from { opacity: 0; transform: translateY(-1.25rem); }
}
.rc-push-ios { animation: rc-push-ios 560ms cubic-bezier(0.34, 1.4, 0.64, 1) both; }
.rc-push-android { animation: rc-push-android 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .rc-push-ios, .rc-push-android { animation: none; }
}
`;

/** The first push lands this long after the screen shows; the rest follow. */
const PUSH_DELAY_MS = 450;
const PUSH_STAGGER_MS = 120;

/**
 * The top of a phone's lock screen, cropped by a fade, with one or more
 * notifications on it. The date and clock are centered on both; Android's
 * clock is larger and lighter.
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
      className="rc-phone relative w-full max-w-[18rem] overflow-hidden border-4 border-b-0 bg-background-default"
      style={{
        borderTopLeftRadius: '2.5rem',
        borderTopRightRadius: '2.5rem',
        maskImage: 'linear-gradient(to bottom, black 82%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent)',
      }}
    >
      <style>{phoneCss}</style>
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
        </span>
        <div
          className={classNames(
            'flex w-full flex-col gap-2',
            isIos ? 'mt-8' : 'mt-6',
          )}
        >
          {notifications.map((notification, index) => (
            <div
              key={`${notification.when}-${notification.title}`}
              className={isIos ? 'rc-push-ios' : 'rc-push-android'}
              style={{
                animationDelay: `${PUSH_DELAY_MS + index * PUSH_STAGGER_MS}ms`,
              }}
            >
              <Notification platform={platform} {...notification} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
