import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

// What each device draws when Feed Patchy asks to send notifications: the
// system prompt, the browser around it, the reminder as it lands, and the way
// back after "Don't allow". This is other companies' UI, so its colours,
// fonts and metrics live in the one stylesheet below, not in our tokens.

export type NotifyPlatform =
  | 'iphone'
  | 'android'
  | 'iphone-safari'
  | 'android-chrome'
  | 'chrome'
  | 'edge'
  | 'firefox'
  | 'opera'
  | 'safari';

/** What the device already knows before Patchy asks. */
export type Permission = 'ask' | 'granted' | 'blocked' | 'unsupported';

/** How the person answered the system prompt. */
export type PromptAnswer = 'allow' | 'block' | 'dismiss';

export const SITE = 'app.daily.dev';

/** The stand-in reminder. The real copy is set server-side, with the push.
 * Plain wording: Patchy stays in onboarding. */
export const reminderPush = {
  title: 'Time for today’s read',
  body: 'Your feed has fresh posts picked for you. Five minutes is all it takes.',
};

interface PlatformInfo {
  name: string;
  /** The app or browser, and the system it runs on. */
  where: string;
  frame: 'phone' | 'android' | 'web';
  /** False where the reminder is never offered: no push there. */
  canPrompt: boolean;
  /** Closing the prompt without an answer is possible. */
  canDismiss: boolean;
  /** After "Don't allow", whether and how the site can ask again. */
  askAgain: string;
  reEnable: {
    steps: ReactNode[];
    /** A button that opens the right settings page, where one can exist. */
    action?: string;
  };
  notes: string[];
}

const strong = (text: string) => (
  <strong className="font-bold text-text-primary">{text}</strong>
);

export const platforms: Record<NotifyPlatform, PlatformInfo> = {
  iphone: {
    name: 'iPhone app',
    where: 'daily.dev for iOS · iOS 26',
    frame: 'phone',
    canPrompt: true,
    canDismiss: false,
    askAgain:
      'Never. iOS shows this alert once per install; after “Don’t Allow” only Settings can turn notifications on.',
    reEnable: {
      steps: [
        <>
          Open {strong('Settings')} and find {strong('daily.dev')}
        </>,
        <>Tap {strong('Notifications')}</>,
        <>Turn on {strong('Allow Notifications')}</>,
      ],
      action: 'Open Settings',
    },
    notes: [
      'The app asks iOS through the native bridge (push-subscribe), not OneSignal.',
      '“Open Settings” needs a new bridge message: iOS can open the app’s notification settings directly.',
      'iOS 26 restyles alerts in Liquid Glass and left-aligns their text. Drawn here in the long-standing layout: the words and buttons are the same.',
    ],
  },
  android: {
    name: 'Android app',
    where: 'daily.dev for Android (TWA) · Android 16',
    frame: 'android',
    canPrompt: true,
    canDismiss: true,
    askAgain:
      'Once more. Android 13+ allows a second ask; a second “Don’t allow” is final.',
    reEnable: {
      steps: [
        <>Open {strong('Settings › Apps › daily.dev')}</>,
        <>Tap {strong('Notifications')}</>,
        <>Turn on {strong('All daily.dev notifications')}</>,
      ],
      action: 'Open settings',
    },
    notes: [
      'The app wraps the website, so the ask goes through OneSignal, and Android answers for daily.dev: Chrome’s own prompt never shows inside the app.',
      'Swiping the dialog away leaves the answer open. The second “Don’t allow” is final.',
    ],
  },
  'iphone-safari': {
    name: 'iPhone, Safari',
    where: 'app.daily.dev in Safari · iOS 26',
    frame: 'phone',
    canPrompt: false,
    canDismiss: false,
    askAgain: 'Never asked: Safari has no web push for a site in a tab.',
    reEnable: { steps: [] },
    notes: [
      'Web push on iPhone works only once the site is added to the Home Screen, so the reminder is not offered here at all.',
      'Production skips its reminder step here too. A nudge toward the app would be the only way to get one.',
    ],
  },
  'android-chrome': {
    name: 'Android, Chrome',
    where: 'app.daily.dev in Chrome 155 · Android 16',
    frame: 'android',
    canPrompt: true,
    canDismiss: true,
    askAgain:
      'Ignored, the message times out and the site may ask again; three closes or four ignores block it for a week. Blocked from Manage, never again.',
    reEnable: {
      steps: [
        <>Tap the {strong('icon')} left of the address</>,
        <>Tap {strong('Permissions')}</>,
        <>Turn on {strong('Notifications')}</>,
      ],
    },
    notes: [
      'New in Chrome 155, stable since 6 October 2026: a small message at the top instead of a dialog. It never blocks the page and leaves by itself.',
      'An ignored message leaves the answer at “ask”, so this screen ends on “not on yet”. Expect that to be the most common ending on Android web.',
      'There is no Block button: refusing happens under Manage.',
      'If Chrome itself lacks notification permission, Android asks for Chrome right after.',
    ],
  },
  chrome: {
    name: 'Chrome',
    where: 'Chrome · macOS',
    frame: 'web',
    canPrompt: true,
    canDismiss: true,
    askAgain:
      'Never, once blocked. Three closes or four ignores block the site for a week.',
    reEnable: {
      steps: [
        <>
          Click the {strong('site icon')} left of {SITE}
        </>,
        <>Turn on {strong('Notifications')}</>,
      ],
    },
    notes: [
      'Asked right after a click, the bubble hangs from a “Get notifications?” chip in the address bar. Its X folds it back into the chip and leaves the request open, so production’s “Remind me” would keep waiting. Worth checking.',
      'Clicking the page leaves the bubble up.',
      'After someone blocks three sites in a row, Chrome hides every new ask behind a crossed-out bell, “Notifications blocked”. It does the same for sites most people block.',
    ],
  },
  edge: {
    name: 'Edge',
    where: 'Microsoft Edge · Windows 11',
    frame: 'web',
    canPrompt: true,
    canDismiss: true,
    askAgain: 'Never, once blocked.',
    reEnable: {
      steps: [
        <>
          Click the {strong('lock')} left of {SITE}
        </>,
        <>Choose {strong('Permissions for this site')}</>,
        <>
          Set {strong('Notifications')} to {strong('Allow')}
        </>,
      ],
    },
    notes: [
      'Quiet requests are on by default: an unfamiliar site’s first ask shows only a bell in the address bar, “Notifications blocked”, which most people never open. This flyout is what they see if they do, or once the site is trusted.',
      'The reminder lands as a Windows toast from Microsoft Edge, with app.daily.dev under it.',
    ],
  },
  firefox: {
    name: 'Firefox',
    where: 'Firefox · macOS',
    frame: 'web',
    canPrompt: true,
    canDismiss: false,
    askAgain:
      'Never, once blocked. There is no close: clicking away leaves it up, and Esc counts as “Always Block”.',
    reEnable: {
      steps: [
        <>
          Click the {strong('icon')} left of {SITE}
        </>,
        <>
          Clear {strong('Blocked')} next to {strong('Send notifications')}
        </>,
        <>Set the reminder again, and choose {strong('Allow')}</>,
      ],
    },
    notes: [
      'Firefox shows the prompt only in direct response to a click. Asked any later, only an icon appears in the address bar.',
      'Clearing a block sets the site back to “ask”. It does not turn on by itself, so the steps end with setting the reminder again.',
    ],
  },
  opera: {
    name: 'Opera',
    where: 'Opera · macOS',
    frame: 'web',
    canPrompt: true,
    canDismiss: true,
    askAgain: 'Never, once blocked.',
    reEnable: {
      steps: [
        <>
          Click the {strong('lock')} left of {SITE}
        </>,
        <>Open {strong('Site settings')}</>,
        <>
          Set {strong('Notifications')} to {strong('Allow')}
        </>,
      ],
    },
    notes: [
      'Opera is Chromium underneath, so the same rules as Chrome. Opera does not document its popup’s wording; this follows Chromium’s.',
      'The sidebar takes 48px from the page’s width.',
    ],
  },
  safari: {
    name: 'Safari',
    where: 'Safari · macOS 27',
    frame: 'web',
    canPrompt: true,
    canDismiss: false,
    askAgain: 'Never, once denied.',
    reEnable: {
      steps: [
        <>Open {strong('Safari › Settings › Websites')}</>,
        <>Choose {strong('Notifications')}</>,
        <>
          Set {strong(SITE)} to {strong('Allow')}
        </>,
      ],
    },
    notes: [
      'Safari asks only in direct response to a click; asked later, nothing appears at all.',
      'Apple does not publish this prompt’s current wording. This is its long-standing one.',
    ],
  },
};

export const mobilePlatforms: NotifyPlatform[] = [
  'iphone',
  'android',
  'iphone-safari',
  'android-chrome',
];

export const webPlatforms: NotifyPlatform[] = [
  'chrome',
  'safari',
  'firefox',
  'edge',
  'opera',
];

/** Which prompt a screen gets when a story does not say: the iOS alert on a
 * phone or tablet, Chrome's bubble on a laptop. */
export const platformForWidth = (width: number): NotifyPlatform =>
  width >= 1020 ? 'chrome' : 'iphone';

/* ── Their stylesheet ───────────────────────────────────────────────── */

const systemCss = `
.np { --np-apple: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
  --np-android: "Google Sans Text", Roboto, system-ui, sans-serif;
  --np-windows: "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif; }
.np-scrim { position: fixed; inset: 0; z-index: 1001; display: flex; align-items: center; justify-content: center; }
@keyframes npAlert { from { opacity: 0; transform: scale(1.12); } to { opacity: 1; transform: none; } }
@keyframes npDrop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@keyframes npFade { from { opacity: 0; } to { opacity: 1; } }
.np-scrim { animation: npFade 200ms ease-out both; }
.np-pop { animation: npAlert 260ms cubic-bezier(0.2, 0.9, 0.3, 1.1) both; }
.np-drop { animation: npDrop 180ms ease-out both; }
.np button { cursor: pointer; }

/* iOS alert */
.np-ios-scrim { background: rgba(0,0,0,0.3); }
.np-ios { width: 270px; border-radius: 14px; overflow: hidden; text-align: center; font-family: var(--np-apple);
  background: rgba(37,37,37,0.97); color: #fff; backdrop-filter: blur(30px) saturate(1.8); -webkit-backdrop-filter: blur(30px) saturate(1.8); }
.light .np-ios { background: rgba(242,242,242,0.97); color: #000; }
.np-ios-body { padding: 19px 16px 18px; display: flex; flex-direction: column; gap: 4px; }
.np-ios-title { font-size: 17px; line-height: 22px; font-weight: 600; letter-spacing: -0.4px; }
.np-ios-msg { font-size: 13px; line-height: 16px; letter-spacing: -0.1px; }
.np-ios-actions { display: grid; grid-template-columns: 1fr 1fr; border-top: 0.5px solid rgba(84,84,88,0.65); }
.light .np-ios-actions { border-color: rgba(60,60,67,0.36); }
.np-ios-actions button { height: 44px; font-size: 17px; color: #0a84ff; letter-spacing: -0.4px; }
.light .np-ios-actions button { color: #007aff; }
.np-ios-actions button + button { border-left: 0.5px solid rgba(84,84,88,0.65); font-weight: 600; }
.light .np-ios-actions button + button { border-color: rgba(60,60,67,0.36); }

/* Android permission dialog (Material 3) */
.np-and-scrim { background: rgba(0,0,0,0.32); }
.np-and { width: 312px; border-radius: 28px; padding: 24px; font-family: var(--np-android); text-align: center;
  background: #2b2930; color: #e6e0e9; }
.light .np-and { background: #ece6f0; color: #1d1b20; }
.np-and-icon { width: 24px; height: 24px; margin: 0 auto 16px; color: #ccc2dc; }
.light .np-and-icon { color: #625b71; }
.np-and-title { font-size: 22px; line-height: 30px; }
.np-and-actions { margin-top: 24px; display: flex; flex-direction: column; gap: 2px; }
.np-and-actions button { height: 48px; font-size: 14px; font-weight: 500; letter-spacing: 0.1px; background: #4a4458; color: #e8def8; border-radius: 4px; }
.light .np-and-actions button { background: #e8def8; color: #1d192b; }
.np-and-actions button:first-child { border-radius: 20px 20px 4px 4px; }
.np-and-actions button:last-child { border-radius: 4px 4px 20px 20px; }

/* Chrome 155 for Android: a small message at the top, no scrim */
.np-crand { display: flex; align-items: center; gap: 12px; border-radius: 20px; padding: 12px 12px 12px 16px; font-family: var(--np-android);
  background: #303030; color: #e3e3e3; box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
.light .np-crand { background: #fff; color: #1f1f1f; box-shadow: 0 4px 16px rgba(0,0,0,0.16); }
.np-crand-title { font-size: 15px; line-height: 20px; font-weight: 500; }
.np-crand-sub { font-size: 13px; line-height: 18px; opacity: 0.7; }
.np-crand-actions { display: flex; gap: 4px; margin-left: auto; }
.np-crand-actions button { height: 36px; padding: 0 14px; border-radius: 18px; font-size: 14px; font-weight: 500; color: #a8c7fa; }
.light .np-crand-actions button { color: #0b57d0; }
.np-crand-actions .np-primary { background: #004a77; color: #c2e7ff; }
.light .np-crand-actions .np-primary { background: #d3e3fd; color: #0842a0; }

/* Desktop bubbles hang from the address bar, without a scrim. */
.np-anchor { position: fixed; top: 4px; z-index: 1001; }
.np-bubble { font-family: var(--np-apple); font-size: 13px; line-height: 18px; }
.np-close { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 999px; opacity: 0.8; }

/* Chrome (Chrome Refresh) */
.np-chrome { width: 320px; border-radius: 12px; padding: 16px 12px 16px 20px; background: #282828; color: #e3e3e3;
  box-shadow: 0 2px 6px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.5); }
.light .np-chrome { background: #fff; color: #1f1f1f; box-shadow: 0 2px 6px 2px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.3); }
.np-chrome-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-right: 8px; }
.np-chrome-actions button { height: 32px; padding: 0 16px; border-radius: 16px; font-size: 13px; font-weight: 500;
  background: #004a77; color: #c2e7ff; }
.light .np-chrome-actions button { background: #d3e3fd; color: #0842a0; }

/* Edge (Windows 11) */
.np-edge { width: 336px; border-radius: 8px; padding: 16px; font-family: var(--np-windows); font-size: 14px; line-height: 20px;
  background: #2c2c2c; color: #fff; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 8px 16px rgba(0,0,0,0.36); }
.light .np-edge { background: #fff; color: #1a1a1a; border-color: rgba(0,0,0,0.08); box-shadow: 0 8px 16px rgba(0,0,0,0.14); }
.np-edge-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
.np-edge-actions button { height: 32px; border-radius: 4px; font-size: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); }
.light .np-edge-actions button { border-color: rgba(0,0,0,0.12); background: #fbfbfb; }
.np-edge-actions .np-primary { background: #4cc2ff; color: #000; border-color: transparent; }
.light .np-edge-actions .np-primary { background: #0f6cbd; color: #fff; }

/* Firefox */
.np-ff { width: 384px; border-radius: 8px; padding: 16px; background: #42414d; color: #fbfbfe;
  box-shadow: 0 2px 14px rgba(0,0,0,0.5); font-family: system-ui, sans-serif; font-size: 13px; line-height: 18px; }
.light .np-ff { background: #fff; color: #15141a; box-shadow: 0 2px 14px rgba(58,57,68,0.2); }
.np-ff-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.np-ff-link { margin-right: auto; color: #00ddff; text-decoration: underline; }
.light .np-ff-link { color: #0061e0; }
.np-ff-actions button { height: 32px; padding: 0 16px; border-radius: 4px; font-size: 13px; font-weight: 600; background: #2b2a33; color: #fbfbfe; }
.light .np-ff-actions button { background: #f0f0f4; color: #15141a; }
.np-ff-actions .np-primary { background: #00ddff; color: #15141a; }
.light .np-ff-actions .np-primary { background: #0061e0; color: #fbfbfe; }

/* Opera */
.np-opera { width: 340px; border-radius: 12px; padding: 16px; background: #2e3036; color: #f2f2f2;
  box-shadow: 0 4px 24px rgba(0,0,0,0.45); font-family: system-ui, sans-serif; font-size: 13px; line-height: 18px; }
.light .np-opera { background: #fff; color: #1d1d1f; box-shadow: 0 4px 24px rgba(0,0,0,0.16); }
.np-opera-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.np-opera-actions button { height: 32px; padding: 0 18px; border-radius: 8px; font-size: 13px; font-weight: 600; background: rgba(255,255,255,0.08); }
.light .np-opera-actions button { background: #eef0f3; }
.np-opera-actions .np-primary { background: #ff1b2d; color: #fff; }

/* Safari (macOS) */
.np-safari { width: 300px; border-radius: 14px; padding: 20px 16px 16px; text-align: center; font-family: var(--np-apple);
  background: rgba(44,44,46,0.98); color: #fff; backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
  box-shadow: 0 0 0 0.5px rgba(0,0,0,0.6), 0 16px 40px rgba(0,0,0,0.45); }
.light .np-safari { background: rgba(246,246,246,0.98); color: #000; box-shadow: 0 0 0 0.5px rgba(0,0,0,0.15), 0 16px 40px rgba(0,0,0,0.2); }
.np-safari-title { font-size: 13px; line-height: 16px; font-weight: 700; margin-top: 12px; }
.np-safari-msg { font-size: 11px; line-height: 14px; margin-top: 6px; opacity: 0.85; }
.np-safari-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
.np-safari-actions button { height: 28px; border-radius: 7px; font-size: 13px; background: rgba(255,255,255,0.14); }
.light .np-safari-actions button { background: rgba(0,0,0,0.06); }
.np-safari-actions .np-primary { background: #0a84ff; color: #fff; }
.light .np-safari-actions .np-primary { background: #007aff; }

/* Browser windows around the page */
.np-window { font-family: var(--np-apple); font-size: 12px; background: #1f1f1f; color: #e3e3e3; }
.light .np-window { background: #f1f3f4; color: #1f1f1f; }
.np-tab { height: 32px; width: 240px; border-radius: 10px 10px 0 0; padding: 0 12px; display: flex; align-items: center; gap: 8px; background: #3c3c3c; }
.light .np-tab { background: #fff; }
.np-toolbar { height: 40px; display: flex; align-items: center; gap: 12px; padding: 0 12px; background: #3c3c3c; }
.light .np-toolbar { background: #fff; }
.np-omnibox { height: 30px; flex: 1; border-radius: 15px; display: flex; align-items: center; gap: 8px; padding: 0 12px; background: #282828; }
.light .np-omnibox { background: #edf0f2; }
.np-dot { width: 12px; height: 12px; border-radius: 999px; }
.np-glyph { opacity: 0.7; }

/* Delivered notifications */
.np-banner { width: 360px; border-radius: 22px; padding: 12px 14px; display: flex; gap: 10px; font-family: var(--np-apple);
  background: rgba(40,40,40,0.82); color: #fff; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.light .np-banner { background: rgba(245,245,245,0.86); color: #000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.np-banner-title { font-size: 15px; line-height: 20px; font-weight: 600; }
.np-banner-body { font-size: 15px; line-height: 20px; }
.np-mac { width: 344px; border-radius: 18px; padding: 12px; font-size: 13px; line-height: 16px; }
.np-mac .np-banner-title, .np-mac .np-banner-body { font-size: 13px; line-height: 16px; }
.np-muted { opacity: 0.6; }
.np-shade { width: 360px; border-radius: 24px; padding: 14px 16px; font-family: var(--np-android); background: #2b2930; color: #e6e0e9; }
.light .np-shade { background: #f3edf7; color: #1d1b20; }
.np-toast { width: 364px; border-radius: 8px; padding: 12px 12px 16px; font-family: var(--np-windows); font-size: 14px; line-height: 20px;
  background: #2c2c2c; color: #fff; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 8px 16px rgba(0,0,0,0.36); }
.light .np-toast { background: #f9f9f9; color: #1a1a1a; border-color: rgba(0,0,0,0.08); box-shadow: 0 8px 16px rgba(0,0,0,0.14); }
`;

export const SystemStyles = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: systemCss }} />
);

/* ── Glyphs ─────────────────────────────────────────────────────────── */

const Svg = ({
  size = 16,
  className,
  children,
}: {
  size?: number;
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <svg
    aria-hidden
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    {children}
  </svg>
);

const BellGlyph = ({
  size,
  className,
}: {
  size?: number;
  className?: string;
}): ReactElement => (
  <Svg size={size} className={className}>
    <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" />
  </Svg>
);

const CloseGlyph = ({ size = 16 }: { size?: number }): ReactElement => (
  <Svg size={size}>
    <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.3 1.41 1.41 6.3-6.3 6.3 6.3 1.41-1.41-6.3-6.3 6.3-6.3z" />
  </Svg>
);

const LockGlyph = (): ReactElement => (
  <Svg size={14} className="np-glyph">
    <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V7Z" />
  </Svg>
);

const TuneGlyph = (): ReactElement => (
  <Svg size={14} className="np-glyph">
    <path d="M3 17v2h6v-2H3ZM3 5v2h10V5H3Zm10 16v-2h8v-2h-8v-2h-2v6h2ZM7 9v2H3v2h4v2h2V9H7Zm14 4v-2H11v2h10Zm-6-4h2V7h4V5h-4V3h-2v6Z" />
  </Svg>
);

/** The daily.dev app icon: the mark on a dark tile. */
export const AppIcon = ({ size = 38 }: { size?: number }): ReactElement => (
  <span
    className="flex shrink-0 items-center justify-center bg-black"
    style={{ width: size, height: size, borderRadius: size * 0.225 }}
  >
    <LogoIcon
      className={{
        container: 'w-3/5',
        group: '[fill:white]',
      }}
    />
  </span>
);

const browserTone: Record<string, string> = {
  Chrome: '#1a73e8',
  'Google Chrome': '#1a73e8',
  'Microsoft Edge': '#0f6cbd',
  Firefox: '#ff7139',
  Opera: '#ff1b2d',
  Safari: '#1e90ff',
};

/** A plain stand-in for a browser's app icon: its initial on its colour. */
const BrowserIcon = ({
  browser,
  size = 38,
}: {
  browser: string;
  size?: number;
}): ReactElement => (
  <span
    aria-hidden
    className="flex shrink-0 items-center justify-center font-bold text-white"
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.25,
      background: browserTone[browser],
      fontSize: size * 0.5,
    }}
  >
    {browser.replace(/^(Microsoft|Google) /, '')[0]}
  </span>
);

/* ── The prompts ────────────────────────────────────────────────────── */

interface PromptProps {
  platform: NotifyPlatform;
  onAnswer?: (answer: PromptAnswer) => void;
  /** Drawn in place on a page at 100%, instead of over a running screen. */
  isInline?: boolean;
}

/** Where each browser's bubble hangs, from the page's left edge. */
const anchorLeft: Partial<Record<NotifyPlatform, number>> = {
  chrome: 96,
  edge: 104,
  firefox: 88,
  opera: 72,
};

const Overlay = ({
  isInline,
  scrim,
  children,
}: {
  isInline?: boolean;
  scrim: string;
  children: ReactElement;
}): ReactElement => {
  if (isInline) {
    return <div className="np">{children}</div>;
  }
  return createPortal(
    <div className={classNames('np np-scrim', scrim)}>
      <div className="np-pop">{children}</div>
    </div>,
    document.body,
  );
};

const Anchored = ({
  isInline,
  left,
  style,
  children,
}: {
  isInline?: boolean;
  /** From the left edge; centred when absent. */
  left?: number;
  /** Replaces the placement altogether. */
  style?: CSSProperties;
  children: ReactElement;
}): ReactElement => {
  if (isInline) {
    return <div className="np">{children}</div>;
  }
  return createPortal(
    <div
      className="np np-anchor"
      style={
        style ??
        (left === undefined
          ? { left: '50%', transform: 'translateX(-50%)' }
          : { left })
      }
    >
      {/* Its own layer: the drop-in animates transform, which would
          otherwise undo the centring. */}
      <div className="np-drop">{children}</div>
    </div>,
    document.body,
  );
};

export const SystemPrompt = ({
  platform,
  onAnswer = () => undefined,
  isInline,
}: PromptProps): ReactElement | null => {
  const allow = () => onAnswer('allow');
  const block = () => onAnswer('block');
  const dismiss = () => onAnswer('dismiss');

  if (platform === 'iphone') {
    return (
      <Overlay isInline={isInline} scrim="np-ios-scrim">
        <div
          role="alertdialog"
          aria-label="Notification permission"
          className="np-ios"
        >
          <div className="np-ios-body">
            <p className="np-ios-title">
              “daily.dev” Would Like to Send You Notifications
            </p>
            <p className="np-ios-msg">
              Notifications may include alerts, sounds, and icon badges. These
              can be configured in Settings.
            </p>
          </div>
          <div className="np-ios-actions">
            <button type="button" onClick={block}>
              Don’t Allow
            </button>
            <button type="button" onClick={allow}>
              Allow
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  if (platform === 'android') {
    return (
      <Overlay isInline={isInline} scrim="np-and-scrim">
        <div
          role="alertdialog"
          aria-label="Notification permission"
          className="np-and"
        >
          <BellGlyph size={24} className="np-and-icon" />
          <p className="np-and-title">
            Allow <strong>daily.dev</strong> to send you notifications?
          </p>
          <div className="np-and-actions">
            <button type="button" onClick={allow}>
              Allow
            </button>
            <button type="button" onClick={block}>
              Don’t allow
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  if (platform === 'android-chrome') {
    return (
      <Anchored isInline={isInline} style={{ left: 8, right: 8 }}>
        <div
          role="dialog"
          aria-label="Notification permission"
          className="np-crand"
        >
          <BellGlyph size={22} className="np-glyph shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="np-crand-title">Get notifications?</p>
            <p className="np-crand-sub">From {SITE}</p>
          </div>
          <div className="np-crand-actions">
            {/* Opens the site's settings; the ask itself stays unanswered. */}
            <button type="button" onClick={dismiss}>
              Manage
            </button>
            <button type="button" className="np-primary" onClick={allow}>
              Allow
            </button>
          </div>
        </div>
      </Anchored>
    );
  }

  if (platform === 'chrome') {
    return (
      <Anchored isInline={isInline} left={anchorLeft.chrome}>
        <div
          role="dialog"
          aria-label="Notification permission"
          className="np-bubble np-chrome"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="pt-0.5">{SITE} wants to</p>
            <button
              type="button"
              aria-label="Close"
              className="np-close"
              onClick={dismiss}
            >
              <CloseGlyph />
            </button>
          </div>
          <p className="mt-3 flex items-center gap-3">
            <BellGlyph size={18} className="np-glyph" />
            Show notifications
          </p>
          <div className="np-chrome-actions">
            {/* Block first on a Mac; Windows puts Allow first. */}
            <button type="button" onClick={block}>
              Block
            </button>
            <button type="button" onClick={allow}>
              Allow
            </button>
          </div>
        </div>
      </Anchored>
    );
  }

  if (platform === 'edge') {
    return (
      <Anchored isInline={isInline} left={anchorLeft.edge}>
        <div
          role="dialog"
          aria-label="Notification permission"
          className="np-edge"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold">{SITE} wants to</p>
            <button
              type="button"
              aria-label="Close"
              className="np-close"
              onClick={dismiss}
            >
              <CloseGlyph />
            </button>
          </div>
          <p className="mt-2 flex items-center gap-3">
            <BellGlyph size={18} className="np-glyph" />
            Show notifications
          </p>
          <div className="np-edge-actions">
            <button type="button" className="np-primary" onClick={allow}>
              Allow
            </button>
            <button type="button" onClick={block}>
              Block
            </button>
          </div>
        </div>
      </Anchored>
    );
  }

  if (platform === 'firefox') {
    return (
      <Anchored isInline={isInline} left={anchorLeft.firefox}>
        <div
          role="dialog"
          aria-label="Notification permission"
          className="np-ff"
        >
          <div className="flex items-start gap-3">
            <BellGlyph size={18} className="np-glyph mt-px shrink-0" />
            <p>
              Allow <strong>{SITE}</strong> to send notifications?
            </p>
          </div>
          <div className="np-ff-actions">
            <span className="np-ff-link">Learn more</span>
            <button type="button" onClick={block}>
              Always Block
            </button>
            <button type="button" className="np-primary" onClick={allow}>
              Allow
            </button>
          </div>
        </div>
      </Anchored>
    );
  }

  if (platform === 'opera') {
    return (
      <Anchored isInline={isInline} left={anchorLeft.opera}>
        <div
          role="dialog"
          aria-label="Notification permission"
          className="np-opera"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="pt-0.5">
              <strong>{SITE}</strong> wants to
            </p>
            <button
              type="button"
              aria-label="Close"
              className="np-close"
              onClick={dismiss}
            >
              <CloseGlyph />
            </button>
          </div>
          <p className="mt-3 flex items-center gap-3">
            <BellGlyph size={18} className="np-glyph" />
            Show notifications
          </p>
          <div className="np-opera-actions">
            <button type="button" onClick={block}>
              Block
            </button>
            <button type="button" className="np-primary" onClick={allow}>
              Allow
            </button>
          </div>
        </div>
      </Anchored>
    );
  }

  if (platform === 'safari') {
    return (
      <Anchored isInline={isInline}>
        <div
          role="dialog"
          aria-label="Notification permission"
          className="np-safari"
        >
          <span className="mx-auto block w-fit">
            <AppIcon size={44} />
          </span>
          <p className="np-safari-title">
            “{SITE}” would like to send you notifications
          </p>
          <p className="np-safari-msg">
            Notifications may include alerts, sounds, and badges. These can be
            configured in Notifications in System Settings.
          </p>
          <div className="np-safari-actions">
            <button type="button" onClick={block}>
              Don’t Allow
            </button>
            <button type="button" className="np-primary" onClick={allow}>
              Allow
            </button>
          </div>
        </div>
      </Anchored>
    );
  }

  return null;
};

/* ── Browser windows ────────────────────────────────────────────────── */

/** Height of the browser's own bars above the page. */
export const toolbarHeight = (platform: NotifyPlatform): number =>
  platform === 'safari' ? 52 : 80;

/** Width a browser's sidebar takes from the page. */
export const sidebarWidth = (platform: NotifyPlatform): number =>
  platform === 'opera' ? 48 : 0;

const TrafficLights = (): ReactElement => (
  <span aria-hidden className="flex shrink-0 gap-2">
    <span className="np-dot" style={{ background: '#ff5f57' }} />
    <span className="np-dot" style={{ background: '#febc2e' }} />
    <span className="np-dot" style={{ background: '#28c840' }} />
  </span>
);

const WindowsControls = (): ReactElement => (
  <span
    aria-hidden
    className="ml-auto flex shrink-0 items-center gap-6 pr-2 text-sm"
  >
    <span>—</span>
    <span>☐</span>
    <span>✕</span>
  </span>
);

/** The browser's top bars, drawn around the page frame. */
export const BrowserToolbar = ({
  platform,
}: {
  platform: NotifyPlatform;
}): ReactElement => {
  if (platform === 'safari') {
    return (
      <div
        className="np np-window flex items-center gap-4 px-4"
        style={{ height: toolbarHeight(platform) }}
      >
        <TrafficLights />
        <span className="np-glyph ml-4">‹ ›</span>
        <span className="np-omnibox mx-auto max-w-[32rem] justify-center">
          <LockGlyph />
          {SITE}
        </span>
        <span className="np-glyph">⇪ ＋</span>
      </div>
    );
  }

  const isWindows = platform === 'edge';
  const tabTitle = 'daily.dev | Onboarding';

  return (
    <div
      className="np np-window flex flex-col"
      style={{ height: toolbarHeight(platform) }}
    >
      <div className="flex h-10 items-end gap-3 px-3">
        {!isWindows && (
          <span className="self-center">
            <TrafficLights />
          </span>
        )}
        <span className="np-tab ml-2">
          <AppIcon size={16} />
          <span className="truncate">{tabTitle}</span>
          <span className="np-glyph ml-auto">✕</span>
        </span>
        <span className="np-glyph self-center">＋</span>
        {isWindows && <WindowsControls />}
      </div>
      <div className="np-toolbar">
        <span className="np-glyph">←</span>
        <span className="np-glyph">→</span>
        <span className="np-glyph">↻</span>
        <span className="np-omnibox">
          {platform === 'chrome' ? <TuneGlyph /> : <LockGlyph />}
          <span>
            {isWindows ? `https://${SITE}` : SITE}
            <span className="np-muted">/onboarding</span>
          </span>
        </span>
        <span className="np-glyph">⋮</span>
      </div>
    </div>
  );
};

/** Opera's sidebar, down the left of the window. */
export const BrowserSidebar = (): ReactElement => (
  <div className="np np-window flex h-full flex-col items-center gap-5 pt-4">
    {['#ff1b2d', '#25d366', '#1da1f2', '#8e8e93'].map((tone) => (
      <span
        key={tone}
        aria-hidden
        className="size-6 rounded-8"
        style={{ background: tone, opacity: 0.85 }}
      />
    ))}
  </div>
);

/* ── The reminder, delivered ────────────────────────────────────────── */

const desktopBrowser: Partial<Record<NotifyPlatform, string>> = {
  chrome: 'Google Chrome',
  firefox: 'Firefox',
  opera: 'Opera',
  safari: 'Safari',
  edge: 'Microsoft Edge',
};

/** The daily reminder as it lands on each device. */
export const DeliveredNotification = ({
  platform,
}: {
  platform: NotifyPlatform;
}): ReactElement => {
  if (platform === 'iphone-safari') {
    return (
      <p className="max-w-[22rem] text-text-tertiary typo-footnote">
        Nothing arrives: there is no web push for a site in Safari’s tabs.
      </p>
    );
  }

  if (platform === 'iphone') {
    return (
      <div className="np">
        <div className="np-banner">
          <AppIcon />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="np-banner-title">{reminderPush.title}</span>
              <span className="np-muted text-xs">now</span>
            </div>
            <p className="np-banner-body">{reminderPush.body}</p>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'android' || platform === 'android-chrome') {
    const isApp = platform === 'android';
    return (
      <div className="np">
        <div className="np-shade">
          <div className="flex items-center gap-2 text-xs">
            {isApp ? (
              <AppIcon size={18} />
            ) : (
              <BrowserIcon browser="Chrome" size={18} />
            )}
            <span>{isApp ? 'daily.dev' : `Chrome • ${SITE}`}</span>
            <span className="np-muted">• now</span>
          </div>
          <p className="mt-2 text-base font-medium">{reminderPush.title}</p>
          <p className="np-muted mt-0.5 text-sm">{reminderPush.body}</p>
        </div>
      </div>
    );
  }

  const browser = desktopBrowser[platform] ?? 'Chrome';

  if (platform === 'edge') {
    return (
      <div className="np">
        <div className="np-toast">
          <div className="flex items-center gap-2 text-xs">
            <BrowserIcon browser={browser} size={16} />
            <span>{browser}</span>
            <span className="np-muted ml-auto">··· ✕</span>
          </div>
          <div className="mt-3 flex gap-3">
            <AppIcon size={48} />
            <div className="min-w-0 flex-1">
              <p className="font-bold">{reminderPush.title}</p>
              <p>{reminderPush.body}</p>
              <p className="np-muted mt-1 text-xs">{SITE}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // macOS: the browser is the sender and the site its subtitle (Firefox adds
  // "via"); Safari's web push comes from the site itself.
  const isSafari = platform === 'safari';
  return (
    <div className="np">
      <div className="np-banner np-mac">
        {isSafari ? <AppIcon /> : <BrowserIcon browser={browser} />}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="np-banner-title">{reminderPush.title}</span>
            <span className="np-muted text-xs">now</span>
          </div>
          <p className="np-muted">
            {platform === 'firefox' ? `via ${SITE}` : SITE}
          </p>
          <p className="np-banner-body">{reminderPush.body}</p>
        </div>
        {!isSafari && <AppIcon size={38} />}
      </div>
    </div>
  );
};

/* ── The way back ───────────────────────────────────────────────────── */

/** After a "Don't allow": where to turn notifications back on, step by step,
 * for the device the person is on. */
export const ReEnableCard = ({
  platform,
  className,
}: {
  platform: NotifyPlatform;
  className?: string;
}): ReactElement | null => {
  const { steps, action } = platforms[platform].reEnable;
  if (!steps.length) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left',
        className,
      )}
    >
      <ol className="flex flex-col gap-2.5">
        {steps.map((step, index) => (
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
      {action && (
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
          className="self-start"
        >
          {action}
        </Button>
      )}
    </div>
  );
};
