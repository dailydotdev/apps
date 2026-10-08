import React, { useState } from 'react';
import { graphql, HttpResponse } from 'msw';
import type { ReactElement, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { FunnelReadingReminder } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelReadingReminder';
import type { FunnelStepReadingReminder } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepShell } from '../components/onboarding/signupFunnel.mocks';
import { defaultBootData, getBootMock } from '../../mock/boot';
import type { Device } from './shell';
import {
  BEFORE_POSITION,
  DeviceFrame,
  Motion,
  Page,
  PageHeader,
  REMINDER_STEP_INDEX,
} from './shell';
import {
  CaseShot,
  caseConfigs,
  caseStates,
  configTitle,
  keyStates,
  stateLabel,
} from './cases';
import type { FeedStart } from './FeedPatchy';
import { FeedPatchy } from './FeedPatchy';

const meta: Meta = {
  title: 'Pages/Onboarding/Feed Patchy',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

/* ── Shared ──────────────────────────────────────────────────────────── */

/** Every page loads the screen story inside device-sized iframes. */
const screenStoryId = 'pages-onboarding-feed-patchy--screen';

const Tabs = <T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
}): ReactElement => (
  <div
    role="tablist"
    className="flex w-fit gap-1 rounded-14 bg-surface-float p-1"
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={tab.id === value}
        onClick={() => onChange(tab.id)}
        className={classNames(
          'rounded-10 px-4 py-2 font-bold transition-colors typo-callout',
          tab.id === value
            ? 'bg-background-default text-text-primary shadow-2'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

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

/* ── 1 · Prototype ───────────────────────────────────────────────────── */

const deviceNote: Record<Exclude<Device, 'small'>, string> = {
  phone:
    'A true 390px viewport: only the logo icon in the top bar, as on a real phone.',
  ipad: 'Tablet width, so the funnel’s tablet styles apply and the scene centres in the tall screen with the phone’s spacing.',
  web: 'Laptop width, so the funnel’s laptop styles apply: the wordmark beside the logo, the larger top bar and skip, and the centred 32rem column.',
};

const PrototypePage = ({ theme }: { theme?: string }): ReactElement => {
  const [device, setDevice] = useState<Exclude<Device, 'small'>>('phone');

  return (
    <Page>
      <PageHeader
        eyebrow="Onboarding · commitment"
        title="Feed Patchy, then pick the time he comes to find you"
      >
        <p>
          A short intro, then drag the Knowledge Bone to Patchy. Once he has it
          the celebration plays, he steps up, and the reading reminder rises
          underneath: scrub the hour ruler or tap Morning, Lunch or Evening.
          “I’ll do it later” skips it. This replaces the separate
          reading-reminder step.
        </p>
        <p>
          Each device is the production funnel at that device’s real viewport.
          Replay restarts from the intro.
        </p>
      </PageHeader>
      <div className="flex flex-col gap-4">
        <Tabs
          tabs={[
            { id: 'phone', label: 'Phone' },
            { id: 'ipad', label: 'iPad' },
            { id: 'web', label: 'Web' },
          ]}
          value={device}
          onChange={setDevice}
        />
        <p className="text-text-tertiary typo-footnote">{deviceNote[device]}</p>
        <DeviceFrame
          key={device}
          device={device}
          storyId={screenStoryId}
          theme={theme}
        />
      </div>
    </Page>
  );
};

export const Prototype: Story = {
  name: '1 · Prototype',
  render: (_, { globals }) => <PrototypePage theme={globals.theme} />,
};

/* ── 2 · Before and after ────────────────────────────────────────────── */

export const BeforeAndAfter: Story = {
  name: '2 · Before and after',
  render: (_, { globals }) => (
    <Page>
      <PageHeader
        eyebrow="Onboarding · commitment"
        title="The reading reminder moves into Feed Patchy"
      >
        <p>
          Before, the reminder was its own onboarding step, the production one
          on the left, and the commitment screen came after it. After, Patchy
          asks for the time once he has the bone, so the separate step is gone
          and onboarding is one screen shorter.
        </p>
        <p>
          Both phones are live at a real 390px viewport. On the left, Submit or
          “I’ll do it later” moves on to Feed Patchy. Replay restarts either.
        </p>
      </PageHeader>
      <div className="grid gap-10 laptop:grid-cols-2">
        <section className="flex flex-col gap-4">
          <SectionTitle
            eyebrow="Before · 2 screens"
            title="Reading reminder step, then Feed Patchy"
          >
            The production step: four time rows and a timezone line, then the
            commitment screen with no reminder in it.
          </SectionTitle>
          <DeviceFrame
            device="phone"
            storyId={screenStoryId}
            args="flow:before"
            theme={globals.theme}
            label="Production today, plus the commitment step"
          />
        </section>
        <section className="flex flex-col gap-4">
          <SectionTitle
            eyebrow="After · 1 screen"
            title="Feed Patchy + reading reminder"
          >
            Commit first, then pick the time on the same screen. The reminder
            step is removed from onboarding.
          </SectionTitle>
          <DeviceFrame
            device="phone"
            storyId={screenStoryId}
            theme={globals.theme}
            label="Proposed"
          />
        </section>
      </div>
    </Page>
  ),
};

/* ── 3 · Review ──────────────────────────────────────────────────────── */

type ReviewTab = 'flow' | 'device' | 'state';

const phoneDark = caseConfigs.find((config) => config.id === 'phone-dark');

const FlowAndTimings = (): ReactElement | null => {
  if (!phoneDark) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-[76ch] text-text-tertiary typo-footnote">
        Every moment of the flow on a phone, in order. Under each: when it
        arrives, then how it moves. Intro times count from when Patchy’s images
        have loaded, at most 1.2s after the screen opens.
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 tablet:grid-cols-3 laptop:grid-cols-5">
        {caseStates.map(({ file, label, at, motion }, index) => (
          <figure key={file} className="flex flex-col gap-3">
            <figcaption className="flex flex-col gap-2">
              <span className="flex items-baseline gap-2">
                <span className="font-bold tabular-nums text-text-quaternary typo-caption1">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-bold text-text-primary typo-footnote">
                  {label}
                </span>
              </span>
              <span className="w-fit rounded-6 bg-overlay-float-cabbage px-1.5 py-0.5 font-bold tabular-nums text-accent-cabbage-default typo-caption1">
                {at}
              </span>
              <span className="min-h-12 text-text-tertiary typo-caption1">
                {motion}
              </span>
            </figcaption>
            <a
              href={`/images/feed-patchy-screens/cases/phone-dark/${file}.webp`}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-24 border border-border-subtlest-tertiary transition-transform duration-200 hover:-translate-y-1"
            >
              <img
                src={`/images/feed-patchy-screens/cases/phone-dark/${file}.webp`}
                alt={`${String(index + 1).padStart(2, '0')}: ${label}`}
                loading="lazy"
                className="block w-full"
              />
            </a>
          </figure>
        ))}
      </div>
    </div>
  );
};

const ByDevice = (): ReactElement => (
  <div className="flex flex-col gap-12">
    {caseConfigs.map((config) => (
      <section key={config.id} className="flex flex-col gap-4">
        <SectionTitle title={configTitle(config)}>
          {`${config.size}. ${config.note}`}
        </SectionTitle>
        <div className="flex gap-4 overflow-x-auto pb-3">
          {config.states.map((file) => (
            <CaseShot
              key={file}
              config={config}
              file={file}
              caption={stateLabel(file)}
              height={config.isWide ? 300 : 400}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
);

const ByState = (): ReactElement => (
  <div className="flex flex-col gap-12">
    <p className="max-w-[76ch] text-text-tertiary typo-footnote">
      Each row is one moment on all ten setups, so a difference between devices
      or themes stands out. Scroll each row sideways.
    </p>
    {keyStates.map((file) => (
      <section key={file} className="flex flex-col gap-4">
        <SectionTitle title={stateLabel(file)} />
        <div className="flex items-end gap-4 overflow-x-auto pb-3">
          {caseConfigs.map((config) => (
            <CaseShot
              key={config.id}
              config={config}
              file={file}
              caption={configTitle(config)}
              height={340}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
);

const ReviewPage = (): ReactElement => {
  const [tab, setTab] = useState<ReviewTab>('flow');

  return (
    <Page>
      <PageHeader
        eyebrow="Onboarding · commitment"
        title="Every screen, every device"
      >
        <p>
          Captures of the prototype at each device’s real viewport, on the
          latest main, in dark and light. Click any screen to open it full size.
        </p>
        <p className="font-bold text-text-primary typo-callout">
          Production changes this design follows
        </p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            On a touch screen, hover is the pressed state: buttons light up
            while pressed, never stuck after a tap.
          </li>
          <li>
            The native wrappers inset the page below the status bar and above
            the home indicator. See the iPhone app setups.
          </li>
        </ul>
        <p className="font-bold text-text-primary typo-callout">
          Fixed while reviewing
        </p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            Short screens (under 800px: the iPhone SE and the iPhone app) get a
            compact reminder, and Patchy is sized to the room left.
          </li>
          <li>
            Patchy’s speech bubble is white with black text in both themes.
          </li>
          <li>White confetti turns gold on a light page.</li>
          <li>
            The time card: presets jump straight to their hour, quick key
            presses keep every step, the card cannot take focus while hidden,
            screen readers hear the slider once, and its small text is now
            12–15px.
          </li>
        </ul>
      </PageHeader>
      <div className="flex flex-col gap-8">
        <Tabs
          tabs={[
            { id: 'flow', label: 'Flow & timings' },
            { id: 'device', label: 'By device' },
            { id: 'state', label: 'By state' },
          ]}
          value={tab}
          onChange={setTab}
        />
        {tab === 'flow' && <FlowAndTimings />}
        {tab === 'device' && <ByDevice />}
        {tab === 'state' && <ByState />}
      </div>
    </Page>
  );
};

export const Review: Story = {
  name: '3 · Review',
  render: () => <ReviewPage />,
};

/* ── 4 · Cases ───────────────────────────────────────────────────────── */

interface Case {
  title: string;
  /** What to do on the phone. */
  check: string;
  /** What should happen. */
  expect: string;
  /** Screen story args, in Storybook's URL form. */
  args: string;
  device?: Device;
}

const caseGroups: Array<{ title: string; note: string; cases: Case[] }> = [
  {
    title: 'Buttons',
    note: 'The CTA bar and the top-bar skip, in every state they take.',
    cases: [
      {
        title: 'Locked until Patchy is fed',
        check: 'Tap “Feed Patchy first” before giving him the bone.',
        expect: 'Nothing happens: the button is disabled until he has it.',
        args: 'start:ready',
      },
      {
        title: '“Remind me” follows the hour',
        check: 'Change the time with a preset, the ruler or the arrow keys.',
        expect: 'The label reads “Remind me at” the new hour, once per change.',
        args: 'start:reminder',
      },
      {
        title: '“I’ll do it later”',
        check: 'Tap the skip at the top right.',
        expect:
          '“Day 1 starts now”, a line about settings, no bubble, and “Start reading →”.',
        args: 'start:reminder',
      },
      {
        title: '“Remind me” answers once',
        check: 'Double-tap “Remind me” quickly.',
        expect:
          'One confirmation. The button becomes “Start reading →” and the skip goes away.',
        args: 'start:reminder',
      },
    ],
  },
  {
    title: 'Feeding Patchy',
    note: 'Every way the bone can reach him, and the one way it cannot.',
    cases: [
      {
        title: 'Drag to his mouth',
        check: 'Drag the bone down onto Patchy’s mouth and let go.',
        expect:
          '“Bring it to me!”, then “Almost there…”, then “Drop it!”, a flash, confetti and “You’re committed”.',
        args: 'start:ready',
      },
      {
        title: 'Drop anywhere on him',
        check: 'Drop the bone on his paws, his ear or his tail.',
        expect: 'He still takes it: the bone flies into his mouth.',
        args: 'start:ready',
      },
      {
        title: 'Miss',
        check: 'Drop the bone in empty space beside him.',
        expect: 'The bone springs back to where it floated. Try again.',
        args: 'start:ready',
      },
      {
        title: 'Tap the bone',
        check: 'Tap the bone without dragging it.',
        expect:
          'He takes it, same as a drop. New: for anyone who cannot or would rather not drag.',
        args: 'start:ready',
      },
      {
        title: 'Keyboard',
        check:
          'Click the phone, press Tab until the bone is focused, then Enter.',
        expect: 'He takes it. New, for keyboard and switch users.',
        args: 'start:ready',
      },
      {
        title: 'Waiting',
        check: 'Do nothing for three seconds, then touch the bone.',
        expect:
          'The bone dips toward him twice and repeats while untouched; touching it stops the hint for good.',
        args: 'start:ready',
      },
    ],
  },
  {
    title: 'Reminder card',
    note: 'The time picker, by touch, mouse and keyboard.',
    cases: [
      {
        title: 'Presets',
        check: 'Tap Evening, then Lunch, then Morning.',
        expect:
          'Each jumps straight to its hour: no counting through the ones between.',
        args: 'start:reminder',
      },
      {
        title: 'Ruler',
        check: 'Drag the ruler, then tap a tick beside the needle.',
        expect:
          'It always settles exactly on an hour, and the readout matches.',
        args: 'start:reminder',
      },
      {
        title: 'Ruler by keyboard',
        check: 'Tab to the ruler, press → three times fast, then Home and End.',
        expect:
          'Three hours later, then 00:00, then 23:00 with “Late-night reading”.',
        args: 'start:reminder',
      },
      {
        title: 'Short screen',
        check: 'Look at the reminder on an iPhone SE.',
        expect:
          'The compact card: no subtext, the timezone under the time, nothing covered by the button.',
        args: 'start:reminder',
        device: 'small',
      },
    ],
  },
  {
    title: 'Flows and endings',
    note: 'The whole journey, and the endings that depend on the phone or the user’s answers.',
    cases: [
      {
        title: 'The whole flow',
        check: 'Watch the intro, feed Patchy, set a time.',
        expect: 'Intro, feeding, celebration, reminder, then the confirmation.',
        args: 'start:intro',
      },
      {
        title: 'A time later today',
        check: 'At 08:00, pick 17:00 and tap “Remind me”.',
        expect:
          '“See you today at 17:00”. Fixed: it used to always say tomorrow.',
        args: 'start:reminder;now:8',
      },
      {
        title: 'A time that has passed today',
        check: 'At 20:00, pick 17:00 and tap “Remind me”.',
        expect: '“See you tomorrow at 17:00”.',
        args: 'start:reminder;now:20',
      },
      {
        title: 'Notifications denied',
        check:
          'Tap “Remind me”; the system prompt is answered with Don’t Allow.',
        expect:
          'New: “Notifications are off” and how to turn them on, with no “See you” bubble.',
        args: 'start:reminder;notifications:denied',
      },
      {
        title: 'Notifications unavailable',
        check: 'Feed Patchy where push is not supported.',
        expect:
          'New: no reminder is offered. The screen ends on “You’re committed” and “Start reading →”, as production skips its reminder step there.',
        args: 'start:ready;notifications:unsupported',
      },
      {
        title: 'Reduced motion',
        check: 'Open the screen with reduced motion on.',
        expect:
          'New: no 7s intro. It opens on the ask, with Patchy and the bone.',
        args: 'motion:reduced',
      },
    ],
  },
];

const CasesPage = ({ theme }: { theme?: string }): ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Onboarding · commitment"
      title="Every button, state and flow to check"
    >
      <p>
        Each phone is live at a real 390px viewport and opens at the moment the
        case needs. Follow “Check”, compare with “Expect”. Replay restarts a
        phone at its case.
      </p>
      <p>
        New in this round: Patchy can be fed with a tap or the keyboard, the
        confirmation says today or tomorrow correctly, denied and unavailable
        notifications get their own endings, and reduced motion skips the intro.
      </p>
      <p>
        Not built yet: changing the timezone from the card, a fallback while
        Patchy’s images load on a slow connection, and a 12-hour clock.
      </p>
    </PageHeader>
    {caseGroups.map((group) => (
      <section key={group.title} className="flex flex-col gap-6">
        <SectionTitle title={group.title}>{group.note}</SectionTitle>
        <div className="grid gap-x-8 gap-y-12 tablet:grid-cols-2 laptopL:grid-cols-3">
          {group.cases.map((item) => (
            <div key={item.title} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <h3 className="font-bold typo-callout">{item.title}</h3>
                <p className="text-text-secondary typo-footnote">
                  <span className="font-bold text-text-primary">Check: </span>
                  {item.check}
                </p>
                <p className="text-text-secondary typo-footnote">
                  <span className="font-bold text-text-primary">Expect: </span>
                  {item.expect}
                </p>
              </div>
              <DeviceFrame
                device={item.device ?? 'phone'}
                storyId={screenStoryId}
                args={item.args}
                theme={theme}
              />
            </div>
          ))}
        </div>
      </section>
    ))}
  </Page>
);

export const Cases: Story = {
  name: '4 · Cases',
  render: (_, { globals }) => <CasesPage theme={globals.theme} />,
};

/* ── The screen itself ───────────────────────────────────────────────── */

// The production reading-reminder step, as the funnel configures it.
const reminderStep = {
  id: 'reading-reminder',
  type: FunnelStepType.ReadingReminder,
  parameters: { headline: 'When do you need that reading nudge?' },
  transitions: [],
  isActive: true,
} as unknown as FunnelStepReadingReminder;

/**
 * Before: the production reminder step, then the commitment screen as its own
 * step. Submitting or skipping the reminder hands over the way FunnelStepper
 * swaps steps: no transition, the next step simply replaces this one.
 */
const ReminderThenPatchy = (): ReactElement => {
  const [isReminder, setIsReminder] = useState(true);

  if (!isReminder) {
    return <FeedPatchy position={BEFORE_POSITION} onCommit={() => undefined} />;
  }

  return (
    <FunnelStepShell
      step={reminderStep}
      stepIndex={REMINDER_STEP_INDEX}
      fullWidth
    >
      <FunnelReadingReminder
        {...reminderStep}
        onTransition={() => setIsReminder(false)}
      />
    </FunnelStepShell>
  );
};

interface ScreenArgs {
  /** after: the design. before: the production reminder, then Patchy. */
  flow: 'after' | 'before';
  /** Opens the screen at a moment, so a case is checked without replaying. */
  start: FeedStart;
  /** granted and denied: what the system prompt answers. unsupported: no
   * push here (iOS Safari outside the app, or desktop without the flag), so
   * the reminder is not offered at all. */
  notifications: 'granted' | 'denied' | 'unsupported';
  /** The current hour, to check "today" against "tomorrow". */
  now: 'clock' | '8' | '20';
  /** reduced stands in for the OS reduced-motion setting: no intro. */
  motion: 'full' | 'reduced';
}

/**
 * The screen at the full viewport, with no frame. The pages above load it in
 * device-sized iframes, configured through URL args. Hidden from the sidebar:
 * it is never reviewed on its own.
 */
export const Screen: StoryObj<ScreenArgs> = {
  name: 'Screen',
  tags: ['!dev'],
  args: {
    flow: 'after',
    start: 'intro',
    notifications: 'granted',
    now: 'clock',
    motion: 'full',
  },
  argTypes: {
    flow: { control: { type: 'inline-radio' }, options: ['after', 'before'] },
    start: {
      control: { type: 'select' },
      options: ['intro', 'ready', 'reminder', 'set', 'skipped'],
    },
    notifications: {
      control: { type: 'inline-radio' },
      options: ['granted', 'denied', 'unsupported'],
    },
    now: { control: { type: 'inline-radio' }, options: ['clock', '8', '20'] },
    motion: { control: { type: 'inline-radio' }, options: ['full', 'reduced'] },
  },
  parameters: {
    // The before flow's Submit schedules the digest, then records the
    // notifications action once push is granted, and only advances when
    // both resolve.
    msw: {
      handlers: [
        graphql.mutation('SubscribePersonalizedDigest', () =>
          HttpResponse.json({
            data: { subscribePersonalizedDigest: { preferredHour: 9 } },
          }),
        ),
        graphql.mutation('CompleteAction', () =>
          HttpResponse.json({ data: { completeAction: { _: true } } }),
        ),
      ],
    },
  },
  // The boot mock pins the app theme to bright, and the production reminder's
  // providers apply it to <html> over the toolbar's choice. Booting with the
  // toolbar's theme keeps the reminder and Patchy on the same one.
  beforeEach: ({ globals }) => {
    getBootMock.mockReturnValue({
      ...getBootMock(),
      settings: {
        ...defaultBootData.settings,
        theme: globals.theme === 'dark' ? 'darcula' : 'bright',
      },
    });
  },
  render: ({ flow, start, notifications, now, motion }) => (
    <>
      <Motion />
      {flow === 'before' ? (
        <ReminderThenPatchy />
      ) : (
        <FeedPatchy
          withReminder={notifications !== 'unsupported'}
          startAt={start}
          isNotificationDenied={notifications === 'denied'}
          nowHour={now === 'clock' ? undefined : Number(now)}
          hasIntro={motion === 'full'}
          onCommit={() => undefined}
        />
      )}
    </>
  ),
};
