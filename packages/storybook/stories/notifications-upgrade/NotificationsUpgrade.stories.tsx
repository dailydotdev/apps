import React from 'react';
import { graphql, HttpResponse } from 'msw';
import type { ReactElement, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { defaultBootData, getBootMock } from '../../mock/boot';
import type { Device } from '../feed-patchy/shell';
import { DeviceFrame, Motion, Page, PageHeader } from '../feed-patchy/shell';
import type { NotifyPlatform, Permission } from '../feed-patchy/notifications';
import {
  mobilePlatforms,
  platforms,
  SystemStyles,
  webPlatforms,
} from '../feed-patchy/notifications';
import {
  InAppReminderRow,
  PushOffScreen,
  ReminderBell,
  SettingsProposed,
} from './pushOff';

// The notifications upgrade: what the device and browser rules teach us,
// and what to do when someone turns push off. Built on Feed Patchy's
// simulations of each platform's prompt.

const meta: Meta = {
  title: 'Pages/Onboarding/Notifications upgrade',
  parameters: { layout: 'fullscreen' },
  // The app's providers apply the boot data's theme to the page, and the boot
  // mock pins it to light: boot with the toolbar's theme instead. The class is
  // set here too, as Storybook applies the toolbar's only once a story's
  // animations finish. Unset, the toolbar's theme is an empty string.
  beforeEach: ({ globals }) => {
    const theme = globals.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    getBootMock.mockReturnValue({
      ...getBootMock(),
      settings: {
        ...defaultBootData.settings,
        theme: theme === 'dark' ? 'darcula' : 'bright',
      },
    });
  },
};

export default meta;

type Story = StoryObj;

/** The pages load the push-off screen inside device-sized iframes. */
const screenStoryId = 'pages-onboarding-notifications-upgrade--screen';

const SectionTitle = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    {eyebrow && (
      <span className="font-bold uppercase tracking-[0.12em] text-text-tertiary typo-caption1">
        {eyebrow}
      </span>
    )}
    <h2 className="font-bold typo-title3">{title}</h2>
    {children && (
      <p className="max-w-[76ch] text-text-tertiary typo-footnote">
        {children}
      </p>
    )}
  </div>
);

const Figure = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex min-w-0 flex-col gap-2">
    <figcaption className="font-bold text-text-tertiary typo-caption1">
      {title}
    </figcaption>
    {/* Drawn at 100%: on a narrow screen it scrolls rather than shrinks. */}
    <div className="flex min-h-[7.5rem] items-center justify-center overflow-x-auto rounded-16 bg-surface-float p-6">
      {children}
    </div>
  </figure>
);

const NumberedCards = ({
  items,
  columns,
}: {
  items: Array<{ title: string; detail: string }>;
  columns: string;
}): ReactElement => (
  <ol className={classNames('grid gap-4', columns)}>
    {items.map((item, index) => (
      <li
        key={item.title}
        className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-5"
      >
        <span className="flex items-baseline gap-2">
          <span className="font-bold tabular-nums text-text-quaternary typo-caption1">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="min-w-0 flex-1 font-bold typo-callout">
            {item.title}
          </span>
        </span>
        <p className="text-text-secondary typo-footnote">{item.detail}</p>
      </li>
    ))}
  </ol>
);

/* ── 1 · What the device rules teach us ─────────────────────────────── */

interface Lesson {
  title: string;
  /** What the platforms do. */
  found: string;
  /** What we should do about it. */
  action: string;
}

const lessons: Lesson[] = [
  {
    title: 'Every bad ask hurts every future ask',
    found:
      'Once someone refuses, iOS never shows its alert again, and browsers stop asking once a site is blocked. Android allows one more try. Chrome also tracks how often people refuse a site and can quietly hide its asks behind a crossed-out bell: “Most people block notifications from this site”.',
    action:
      'Only show the system prompt right after an explicit tap with context, like “Remind me”, and from as few places as possible.',
  },
  {
    title: '“Didn’t answer” is now common, and it isn’t a “no”',
    found:
      'Chrome 155 on Android shows a message that times out, Edge hides first asks from unfamiliar sites by default, and Chrome’s X can leave the request pending.',
    action:
      'Handle “no answer yet” differently from “blocked”. It’s fine to ask again later at another high-intent moment, with a cooldown. Chrome blocks a site for a week after three closes.',
  },
  {
    title: 'A quiet browser looks just like a refusal',
    found:
      'Unless every outcome is recorded, an ask that was hidden or ignored is indistinguishable from a “no”.',
    action:
      'Log every outcome (granted, blocked, no answer) with the platform and where the ask came from. A rising “no answer” rate is how we’d spot Chrome or Edge going quiet on us. This is cheap and should come first.',
  },
  {
    title: 'Safari and Firefox only prompt straight from a tap',
    found:
      'A request that waits on anything first, a script still loading or a network call, loses the tap, and nothing appears.',
    action:
      'Have the push SDK ready before the screen that asks, and request permission directly in the tap handler.',
  },
  {
    title: 'Part of the push-off screen doesn’t need the backend',
    found:
      'The web can read this device’s permission on open and see it change through the browser’s Permissions API. The iPhone app already reports push state through its bridge.',
    action:
      'A version that only covers this device could ship before the backend work. The backend is needed for other devices and the in-app fallback.',
  },
  {
    title: 'Some people can never get a push',
    found:
      'iPhone Safari has no web push in a tab, and anyone never asked during onboarding has no reminder at all.',
    action:
      'Give the reminder another route there: in-app or email, a nudge toward the app, or “Add to Home Screen”.',
  },
  {
    title: 'On desktop, the reminder is attributed to the browser',
    found:
      'It shows “Google Chrome” with app.daily.dev in small text, Firefox adds “via”, and Edge’s toast says Microsoft Edge.',
    action:
      'The title alone has to make clear it’s from daily.dev and why. On Chrome, an installed daily.dev app shows its own name and icon, which is one more reason to push installs.',
  },
];

const nextSteps: Array<{ title: string; detail: string }> = [
  {
    title: 'Log every outcome',
    detail:
      'Granted, blocked and no answer, with platform and source. Lesson 3. Cheap, and it measures everything else.',
  },
  {
    title: 'Audit where we ask',
    detail:
      'Every call to the permission prompt, kept only where it follows an explicit tap with context. Lesson 1.',
  },
  {
    title: 'Load OneSignal earlier',
    detail:
      'Ready before the reminder screen, with the request made in the tap handler. Lesson 4.',
  },
  {
    title: 'Ship the push-off screen for this device',
    detail:
      'The client-only version of “2 · Push turned off”, before the backend work. Lesson 5.',
  },
];

const LessonsPage = (): ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Notifications upgrade"
      title="What the device and browser rules teach us"
    >
      <p>
        From simulating the notification prompt on every device, in “Pages ›
        Onboarding › Feed Patchy › 5 · Notifications”. The main lesson: the
        system prompt is a one-shot, shared resource, and more and more browsers
        hide it.
      </p>
    </PageHeader>

    <section className="flex flex-col gap-6">
      <SectionTitle eyebrow="Lessons" title="In priority order" />
      <ol className="flex flex-col gap-4">
        {lessons.map((lesson, index) => (
          <li
            key={lesson.title}
            className="grid gap-4 rounded-16 border border-border-subtlest-tertiary p-5 laptop:grid-cols-[1fr_1fr]"
          >
            <div className="flex flex-col gap-2">
              <span className="flex items-baseline gap-2">
                <span className="font-bold tabular-nums text-text-quaternary typo-caption1">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 font-bold typo-title3">
                  {lesson.title}
                </span>
              </span>
              <p className="text-text-secondary typo-callout">{lesson.found}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-12 bg-surface-float p-4">
              <span className="font-bold uppercase tracking-[0.12em] text-accent-cabbage-default typo-caption1">
                So
              </span>
              <p className="text-text-primary typo-callout">{lesson.action}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>

    <section className="flex flex-col gap-6">
      <SectionTitle eyebrow="Order of work" title="What to do first">
        Each step makes the next one measurable or possible.
      </SectionTitle>
      <NumberedCards
        items={nextSteps}
        columns="tablet:grid-cols-2 laptop:grid-cols-4"
      />
    </section>
  </Page>
);

export const Lessons: Story = {
  name: '1 · What the device rules teach us',
  render: () => <LessonsPage />,
};

/* ── 2 · Push turned off ─────────────────────────────────────────────── */

/** The reading reminder as the API returns it: on, daily at 09:00. */
const readingReminderHandler = graphql.query('PersonalizedDigest', () =>
  HttpResponse.json({
    data: {
      personalizedDigest: [
        {
          preferredDay: 1,
          preferredHour: 9,
          type: 'reading_reminder',
          flags: { sendType: 'daily' },
        },
      ],
    },
  }),
);

const returnScreens: Array<{
  title: string;
  note: string;
  args: string;
  device: Device;
  browser?: NotifyPlatform;
}> = [
  {
    title: 'iPhone app, blocked in iOS Settings',
    note: 'iOS will not ask again, so “Turn notifications back on” shows the steps, with a button into Settings.',
    args: 'platform:iphone;notifications:blocked',
    device: 'phone',
  },
  {
    title: 'Android app, opted out in the app',
    note: 'Android can still ask: the system dialog comes straight back.',
    args: 'platform:android;notifications:ask',
    device: 'android',
  },
  {
    title: 'Chrome, notifications reset to “ask”',
    note: 'Chrome can ask again, so its bubble appears. Blocked, it would show the steps instead.',
    args: 'platform:chrome;notifications:ask',
    device: 'web',
    browser: 'chrome',
  },
];

const ReturnScreen = ({
  screen,
  theme,
}: {
  screen: (typeof returnScreens)[number];
  theme?: string;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1">
      <h3 className="font-bold typo-callout">{screen.title}</h3>
      <p className="text-text-secondary typo-footnote">{screen.note}</p>
    </div>
    <DeviceFrame
      device={screen.device}
      browser={screen.browser}
      storyId={screenStoryId}
      args={screen.args}
      theme={theme}
    />
  </div>
);

const PushOffPage = ({ theme }: { theme?: string }): ReactElement => (
  <Page>
    <SystemStyles />
    <PageHeader
      eyebrow="Notifications upgrade · proposal"
      title="When someone turns notifications off"
    >
      <p>
        Two suggestions. Tell people when they come back, with a way to turn
        notifications on again or keep the reminder inside daily.dev. And give
        the reminder an in-app fallback, so it still lands somewhere when push
        cannot. A version of the first that covers only this device could ship
        first (lesson 5 on “1 · What the device rules teach us”).
      </p>
    </PageHeader>

    <section className="flex flex-col gap-6">
      <SectionTitle
        eyebrow="Suggestion 1 · Needs backend"
        title="Tell them when they come back"
      >
        Shown once, the first time daily.dev opens on a device where push went
        off while the reminder was on. Three ways out: turn notifications back
        on, keep the reminder inside daily.dev, or stop it. Closing it is “not
        now”. If another device still gets the reminder, it should say so
        instead of asking.
      </SectionTitle>
      <div className="grid gap-x-8 gap-y-10 laptop:grid-cols-2">
        {returnScreens
          .filter((screen) => screen.device !== 'web')
          .map((screen) => (
            <ReturnScreen key={screen.title} screen={screen} theme={theme} />
          ))}
      </div>
      {returnScreens
        .filter((screen) => screen.device === 'web')
        .map((screen) => (
          <ReturnScreen key={screen.title} screen={screen} theme={theme} />
        ))}
    </section>

    <section className="flex flex-col gap-6">
      <SectionTitle
        eyebrow="Suggestion 2 · Needs backend"
        title="An in-app fallback for the reminder"
      >
        When push cannot land, the reminder arrives as a normal in-app
        notification: a badge on the bell and a row in the inbox, waiting for
        the next open. Settings says push is off here and lets people choose how
        their reminder arrives. All three are production components.
      </SectionTitle>
      <div className="grid gap-4 laptop:grid-cols-3">
        <Figure title="The bell, with the reminder waiting">
          <ReminderBell unread={1} />
        </Figure>
        <Figure title="The inbox row">
          <div className="w-full max-w-[26rem]">
            <InAppReminderRow />
          </div>
        </Figure>
        <Figure title="Settings › Notifications, proposed">
          <div className="w-full max-w-[26rem]">
            <SettingsProposed />
          </div>
        </Figure>
      </div>
    </section>
  </Page>
);

export const PushTurnedOff: Story = {
  name: '2 · Push turned off',
  parameters: { msw: { handlers: [readingReminderHandler] } },
  render: (_, { globals }) => (
    <ExtensionProviders>
      <PushOffPage theme={globals.theme} />
    </ExtensionProviders>
  ),
};

/* ── The screen itself ───────────────────────────────────────────────── */

interface ScreenArgs {
  /** Whose system prompt answers “Turn notifications back on”. */
  platform: NotifyPlatform;
  /** ask: the system can still prompt. blocked: only settings can undo. */
  notifications: Permission;
}

/**
 * The push-off screen at the full viewport, with no frame. The page above
 * loads it in device-sized iframes, configured through URL args. Hidden from
 * the sidebar: it is never reviewed on its own.
 */
export const Screen: StoryObj<ScreenArgs> = {
  name: 'Screen',
  tags: ['!dev'],
  args: { platform: 'iphone', notifications: 'blocked' },
  argTypes: {
    platform: {
      control: { type: 'select' },
      // Only where push exists: iPhone Safari never had it to turn off.
      options: [...mobilePlatforms, ...webPlatforms].filter(
        (platform) => platforms[platform].canPrompt,
      ),
    },
    notifications: {
      control: { type: 'inline-radio' },
      options: ['ask', 'blocked'],
    },
  },
  render: ({ platform, notifications }) => (
    <>
      <Motion />
      <ExtensionProviders>
        <PushOffScreen platform={platform} permission={notifications} />
      </ExtensionProviders>
    </>
  ),
};
