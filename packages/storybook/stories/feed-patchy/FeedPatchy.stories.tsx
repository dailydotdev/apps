import React, { useEffect, useState } from 'react';
import { graphql, HttpResponse } from 'msw';
import type { ReactElement, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { FunnelReadingReminder } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelReadingReminder';
import type { FunnelStepReadingReminder } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { featureOnboardingCommitment } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  FunnelStepShell,
  PROFILE_HANDLERS,
} from '../features/onboarding/signupFunnel.mocks';
import ExtensionProviders from '../extension/_providers';
import { defaultBootData, getBootMock } from '../../mock/boot';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';
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
import type { NotifyPlatform, Permission } from './notifications';
import type { DragHint } from './dragHints';
import { DragHintOverlay, dragHints } from './dragHints';
import type { ReminderVariant } from './reminderVariants';
import { ReminderVariantScreen, reminderVariants } from './reminderVariants';
import {
  DeliveredNotification,
  mobilePlatforms,
  platforms,
  ReEnableCard,
  SystemPrompt,
  SystemStyles,
  webPlatforms,
} from './notifications';

const meta: Meta = {
  title: 'Pages/Onboarding/Feed Patchy',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

/* ── Shared ──────────────────────────────────────────────────────────── */

/** Every page loads the screen story inside device-sized iframes. */
const screenStoryId = 'pages-onboarding-feed-patchy--screen';
const liveScreenStoryId = 'pages-onboarding-feed-patchy--live-screen';
const reminderScreenStoryId = 'pages-onboarding-feed-patchy--reminder-screen';

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

/* ── 0 · Live ────────────────────────────────────────────────────────── */

const LivePage = ({ theme }: { theme?: string }): ReactElement => {
  const [device, setDevice] = useState<Device>('phone');

  return (
    <Page>
      <PageHeader
        eyebrow="Onboarding · commitment"
        title="Feed Patchy as it ships"
      >
        <p>
          The production reading-reminder step with the onboarding commitment
          flag on, so this is the shared component itself, not the prototype
          copy the pages below use. Changes to the shipped screen show up
          here.
        </p>
        <p>
          Each device loads the step at its real viewport. “Remind me” resolves
          as if push was granted; finishing the step lands on a blank screen,
          where the funnel would move to the next step. Replay restarts it.
        </p>
      </PageHeader>
      <div className="flex flex-col gap-4">
        <Tabs
          tabs={[
            { id: 'phone', label: 'Phone' },
            { id: 'small', label: 'iPhone SE' },
            { id: 'android', label: 'Android' },
            { id: 'ipad', label: 'iPad' },
            { id: 'web', label: 'Web' },
          ]}
          value={device}
          onChange={setDevice}
        />
        <DeviceFrame
          key={device}
          device={device}
          storyId={liveScreenStoryId}
          theme={theme}
        />
      </div>
    </Page>
  );
};

export const Live: Story = {
  name: '0 · Live',
  render: (_, { globals }) => <LivePage theme={globals.theme} />,
};

/* ── 1 · Prototype ───────────────────────────────────────────────────── */

const deviceNote: Record<Exclude<Device, 'small' | 'android'>, string> = {
  phone:
    'A true 390px viewport: only the logo icon in the top bar, as on a real phone.',
  ipad: 'Tablet width, so the funnel’s tablet styles apply and the scene centres in the tall screen with the phone’s spacing.',
  web: 'Laptop width, so the funnel’s laptop styles apply: the wordmark beside the logo, the larger top bar and skip, and the centred 32rem column.',
};

const PrototypePage = ({ theme }: { theme?: string }): ReactElement => {
  const [device, setDevice] =
    useState<Exclude<Device, 'small' | 'android'>>('phone');

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
          “Remind me” brings up the system’s notification prompt (the iOS alert
          on a phone or iPad, Chrome’s on the web); “I’ll do it later” skips it.
          Either way the screen moves on to the feed by itself. This replaces
          the separate reading-reminder step.
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
        title: 'No button until the reminder',
        check:
          'Look at the bottom of the screen before and while feeding Patchy.',
        expect:
          'Nothing there: no disabled “Feed Patchy first”. The button arrives with the reminder card, as “Remind me at 09:00”.',
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
          '“Day 1 starts now”, a line about settings and no bubble. No button: after 3s it moves to the feed.',
        args: 'start:reminder',
      },
      {
        title: '“Remind me” asks once',
        check: 'Double-tap “Remind me” quickly, then tap Allow.',
        expect:
          'One system prompt. While it is up the button waits and the skip goes away; after Allow, one confirmation and the feed after 3s.',
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
        check: 'Leave the bone for a moment, then touch it.',
        expect:
          'Within 0.2s the bone dips toward him twice, and repeats while untouched; touching it stops the hint for good.',
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
        title: 'Change the timezone',
        check:
          'Tap the underlined timezone at the top of the card, then the dropdown that appears, and pick another zone.',
        expect:
          'Production’s timezone dropdown, a sheet on a phone. The pick saves to the profile, the link shows the new zone, the dropdown folds away, and today or tomorrow follows the zone.',
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
        title: 'Moves to the feed by itself',
        check: 'Pick a time, tap “Remind me”, tap Allow, then wait.',
        expect:
          'No “Start reading” button. “Taking you to your feed…” fills a bar for 3s, then the feed fades in.',
        args: 'start:reminder',
      },
      {
        title: 'The whole flow',
        check: 'Watch the intro, feed Patchy, set a time.',
        expect: 'Intro, feeding, celebration, reminder, then the confirmation.',
        args: 'start:intro',
      },
      {
        title: 'A time later today',
        check: 'At 08:00, pick 17:00, tap “Remind me”, then Allow.',
        expect:
          '“See you today at 17:00”. Fixed: it used to always say tomorrow.',
        args: 'start:reminder;now:8',
      },
      {
        title: 'A time that has passed today',
        check: 'At 20:00, pick 17:00, tap “Remind me”, then Allow.',
        expect: '“See you tomorrow at 17:00”.',
        args: 'start:reminder;now:20',
      },
      {
        title: 'Don’t Allow',
        check: 'Tap “Remind me”, then Don’t Allow in the iOS alert.',
        expect:
          'New: “Notifications are off”, the time is saved, and the steps back for this phone. It waits on “Start reading”, so the steps can be read.',
        args: 'start:reminder',
      },
      {
        title: 'Already blocked',
        check: 'Read the card, then tap “Remind me”.',
        expect:
          'New: the card says notifications are off before anyone taps. No prompt, as the system would show none: straight to the steps back.',
        args: 'start:reminder;notifications:blocked',
      },
      {
        title: 'Notifications unavailable',
        check: 'Feed Patchy where push is not supported.',
        expect:
          'New: no reminder is offered, as production skips its reminder step there. The screen ends on “You’re committed” and moves to the feed.',
        args: 'start:ready;notifications:unsupported',
      },
      {
        title: 'Every device’s prompt',
        check: 'Open “5 · Notifications”.',
        expect:
          'The ask, the way back and the reminder itself on iPhone, Android and five desktop browsers.',
        args: 'start:prompt',
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
        Not built yet: a fallback while Patchy’s images load on a slow
        connection, and a 12-hour clock.
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

/* ── 5 · Notifications ───────────────────────────────────────────────── */

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
    <div className="flex min-h-[7.5rem] items-center justify-[safe_center] overflow-x-auto rounded-16 bg-surface-float p-6">
      {children}
    </div>
  </figure>
);

const PlatformBlock = ({
  id,
  theme,
}: {
  id: NotifyPlatform;
  theme?: string;
}): ReactElement => {
  const info = platforms[id];
  const isWeb = info.frame === 'web';
  const frame = (
    <DeviceFrame
      device={info.frame}
      storyId={screenStoryId}
      theme={theme}
      browser={isWeb ? id : undefined}
      label={info.where}
      args={
        info.canPrompt
          ? `start:prompt;platform:${id}`
          : `start:ready;platform:${id};notifications:unsupported`
      }
    />
  );
  const details = (
    <>
      <Figure title="The ask, at 100%">
        {info.canPrompt ? (
          <SystemPrompt platform={id} isInline />
        ) : (
          <p className="text-center text-text-tertiary typo-footnote">
            No prompt: the reminder is never offered here.
          </p>
        )}
      </Figure>
      {info.canPrompt && (
        <Figure title="If they refuse: the way back">
          <div className="w-full max-w-[22rem]">
            <ReEnableCard platform={id} />
          </div>
        </Figure>
      )}
      <Figure title="The reminder, as it lands">
        <DeliveredNotification platform={id} />
      </Figure>
    </>
  );

  return (
    <section className="flex flex-col gap-6 border-t border-border-subtlest-tertiary pt-8">
      <SectionTitle eyebrow={info.where} title={info.name}>
        {info.askAgain}
      </SectionTitle>
      {isWeb ? (
        <>
          {frame}
          <div className="grid gap-4 laptop:grid-cols-3">{details}</div>
        </>
      ) : (
        <div className="grid gap-8 laptop:grid-cols-[22rem_1fr]">
          {frame}
          <div className="flex min-w-0 flex-col gap-4">{details}</div>
        </div>
      )}
      <ul className="flex max-w-[76ch] list-disc flex-col gap-1 pl-5 text-text-tertiary typo-footnote">
        {info.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
};

/** Each answer, and what the device knew before asking. */
const answerFlows: Array<{
  title: string;
  note: string;
  args: string;
  device?: Device;
}> = [
  {
    title: 'Don’t Allow',
    note: 'Notifications are off, the time is kept, and the steps back for this device. It waits on “Start reading” so they can be read.',
    args: 'start:denied;platform:iphone',
  },
  {
    title: 'Closed without an answer',
    note: 'Not a no: the time is kept and Patchy asks again from the feed. Moves on by itself.',
    args: 'start:dismissed;platform:android',
    device: 'android',
  },
  {
    title: 'Already blocked',
    note: 'Known before the tap, so the card says it up front and “Remind me” skips the prompt nobody would see.',
    args: 'start:reminder;notifications:blocked;platform:iphone',
  },
  {
    title: 'Already allowed',
    note: 'No prompt: “Remind me” confirms straight away.',
    args: 'start:reminder;notifications:granted;platform:iphone',
  },
];

const issues: Array<{ title: string; detail: string; where: string }> = [
  {
    title: '“Don’t allow” goes unmentioned',
    detail:
      'The step moves on the same way whatever the answer, so someone who refused still expects a reminder that never comes.',
    where: 'useReadingReminder.ts, onSubmit',
  },
  {
    title: 'Denials are not logged',
    detail:
      'Only a granted subscription logs ClickEnableNotification. The share of people who refuse in onboarding cannot be measured.',
    where: 'PushNotificationContext.tsx, subscribe',
  },
  {
    title: 'Already blocked on the web opens a popup window',
    detail:
      'With permission already denied, “Remind me” opens a 728 × 756 window of instructions in the middle of onboarding. On a phone that is a new tab, outside onboarding.',
    where:
      'usePushNotificationMutation.tsx → useNotificationPermissionPopup.ts',
  },
  {
    title: 'No prompt while OneSignal is still loading',
    detail:
      'The reminder renders before OneSignal is ready. Tapped in that window, subscribe returns false: no prompt, no reminder, no message.',
    where: 'PushNotificationContext.tsx, OneSignalSubProvider.subscribe',
  },
  {
    title: 'The iPhone app can hang on “Remind me”',
    detail:
      'It waits for the app’s push-subscribe answer with no timeout. If the app never answers, the button stays loading.',
    where: 'PushNotificationContext.tsx, NativeAppleSubProvider.subscribe',
  },
  {
    title: 'iPhone Safari gets no reminder at all',
    detail:
      'No web push for a site in a Safari tab, so the reminder is skipped. The app is the only way to one.',
    where: 'OneSignal isPushSupported',
  },
];

const NotificationsPage = ({ theme }: { theme?: string }): ReactElement => {
  const [tab, setTab] = useState<'mobile' | 'web'>('mobile');

  return (
    <Page>
      <SystemStyles />
      <PageHeader
        eyebrow="Onboarding · notifications"
        title="What people see when Patchy asks to nudge them"
      >
        <p>
          “Remind me” saves the time, then the device asks for permission, as
          production does. Every ask below is live: tap Allow, Don’t allow or
          close it, and the screen ends the way it would on that device.
        </p>
        <p>
          The prompts, browser windows and delivered reminders are drawn to
          match each platform, in the theme of this page. The reminder’s wording
          is a stand-in: the real copy is set server-side.
        </p>
      </PageHeader>

      <section className="flex flex-col gap-4">
        <SectionTitle
          eyebrow="The question"
          title="When someone says no, tell them once, and show the way back"
        />
        <ul className="flex max-w-[76ch] list-disc flex-col gap-2 pl-5 text-text-secondary typo-callout">
          <li>
            Say it right then, on the ending: notifications are off, and their
            time is saved. Today production moves on silently and they expect a
            reminder that never comes.
          </li>
          <li>
            Show only their device’s way back, in two or three steps with the
            names their settings use. The apps can add a button that opens the
            right settings page.
          </li>
          <li>
            Don’t ask again during onboarding. iOS never shows its alert twice,
            browsers stop asking once blocked, and Android allows one more try.
            Ask again later from the feed, only where the system still can.
          </li>
          <li>
            Closing the prompt is not a no: keep the time, say Patchy will ask
            again, and move on. Chrome blocks a site after three closes, so
            later asks should be rare.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-6">
        <SectionTitle
          eyebrow="Answers"
          title="Each answer, and what the device already knew"
        />
        <div className="grid gap-x-8 gap-y-10 tablet:grid-cols-2 laptopL:grid-cols-4">
          {answerFlows.map((flow) => (
            <div key={flow.title} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold typo-callout">{flow.title}</h3>
                <p className="min-h-16 text-text-secondary typo-footnote">
                  {flow.note}
                </p>
              </div>
              <DeviceFrame
                device={flow.device ?? 'phone'}
                storyId={screenStoryId}
                args={flow.args}
                theme={theme}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <SectionTitle eyebrow="Devices" title="The ask on every device">
          Each device opens with its prompt up. Replay brings it back.
        </SectionTitle>
        <Tabs
          tabs={[
            { id: 'mobile', label: 'Mobile' },
            { id: 'web', label: 'Web' },
          ]}
          value={tab}
          onChange={setTab}
        />
        {(tab === 'mobile' ? mobilePlatforms : webPlatforms).map((id) => (
          <PlatformBlock key={id} id={id} theme={theme} />
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <SectionTitle eyebrow="Production" title="Issues found on the way">
          From today’s reminder step and push code. None are fixed in this
          Storybook-only change.
        </SectionTitle>
        <ol className="grid gap-4 tablet:grid-cols-2">
          {issues.map((issue, index) => (
            <li
              key={issue.title}
              className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-5"
            >
              <span className="flex items-baseline gap-2">
                <span className="font-bold tabular-nums text-text-quaternary typo-caption1">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 font-bold typo-callout">
                  {issue.title}
                </span>
              </span>
              <p className="text-text-secondary typo-footnote">
                {issue.detail}
              </p>
              <code className="text-text-tertiary typo-caption1">
                {issue.where}
              </code>
            </li>
          ))}
        </ol>
      </section>
    </Page>
  );
};

export const Notifications: Story = {
  name: '5 · Notifications',
  render: (_, { globals }) => <NotificationsPage theme={globals.theme} />,
};

/* ── 6 · Explore: drag hint ──────────────────────────────────────────── */

const DragHintPage = ({ theme }: { theme?: string }): ReactElement => {
  const [intro, setIntro] = useState<'skip' | 'full'>('skip');

  return (
    <Page>
      <PageHeader
        eyebrow="Onboarding · commitment · exploration"
        title="Make the drag obvious"
      >
        <p>
          Feedback: it’s unclear the bone has to be dragged to Patchy. Each
          phone is the production screen with one hint drawn over it. Every
          hint loops until the bone is first touched, then goes away for good.
          Try dragging in each.
        </p>
        <p>
          The intro is skipped by default so the hint shows right away; turn it
          on to see when the hint arrives in the real flow.
        </p>
      </PageHeader>
      <Tabs
        tabs={[
          { id: 'skip', label: 'Start on the bone' },
          { id: 'full', label: 'With the intro' },
        ]}
        value={intro}
        onChange={setIntro}
      />
      <div className="grid gap-x-8 gap-y-12 tablet:grid-cols-2 laptopL:grid-cols-3">
        {dragHints.map(({ id, label, note }) => (
          <section key={id} className="flex flex-col gap-4">
            <SectionTitle title={label}>{note}</SectionTitle>
            <DeviceFrame
              key={intro}
              device="phone"
              storyId={liveScreenStoryId}
              args={`hint:${id};intro:${intro}`}
              theme={theme}
            />
          </section>
        ))}
      </div>
    </Page>
  );
};

export const ExploreDragHint: Story = {
  name: '6 · Explore: drag hint',
  render: (_, { globals }) => <DragHintPage theme={globals.theme} />,
};

/* ── 7 · Explore: reminder ask ───────────────────────────────────────── */

const ReminderAskPage = ({ theme }: { theme?: string }): ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Onboarding · commitment · exploration"
      title="Make the reminder make sense, and easy to skip"
    >
      <p>
        Feedback: right after feeding Patchy, the reminder reads as “what is
        this?”, and “I’ll do it later” is hard to find, which is where people
        would drop. Each phone opens on the moment the celebration hands over.
        Today is the production screen; A to C reuse its picker, headline and
        button bar, and change only the framing and the way out.
      </p>
      <p>Every choice ends on a stand-in for the next step, with Replay.</p>
    </PageHeader>
    <div className="grid gap-x-8 gap-y-12 tablet:grid-cols-2">
      {reminderVariants.map(({ id, label, note }) => (
        <section key={id} className="flex flex-col gap-4">
          <SectionTitle title={label}>{note}</SectionTitle>
          {id === 'today' ? (
            <DeviceFrame
              device="phone"
              storyId={liveScreenStoryId}
              args="intro:skip;start:reminder"
              theme={theme}
            />
          ) : (
            <DeviceFrame
              device="phone"
              storyId={reminderScreenStoryId}
              args={`variant:${id}`}
              theme={theme}
            />
          )}
        </section>
      ))}
    </div>
  </Page>
);

export const ExploreReminderAsk: Story = {
  name: '7 · Explore: reminder ask',
  render: (_, { globals }) => <ReminderAskPage theme={globals.theme} />,
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
    return (
      <FeedPatchy
        position={BEFORE_POSITION}
        autoAdvance={false}
        onCommit={() => undefined}
      />
    );
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
  /** What the device knows before Patchy asks. ask: the system prompt
   * answers "Remind me". granted or blocked: no prompt, the answer is known.
   * unsupported: no push here (iOS Safari outside the app, or desktop
   * without the flag), so the reminder is not offered at all. */
  notifications: Permission;
  /** Whose system prompt it is; auto picks by viewport width. */
  platform: NotifyPlatform | 'auto';
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
    notifications: 'ask',
    platform: 'auto',
    now: 'clock',
    motion: 'full',
  },
  argTypes: {
    flow: { control: { type: 'inline-radio' }, options: ['after', 'before'] },
    start: {
      control: { type: 'select' },
      options: [
        'intro',
        'ready',
        'reminder',
        'prompt',
        'set',
        'skipped',
        'denied',
        'dismissed',
      ],
    },
    notifications: {
      control: { type: 'inline-radio' },
      options: ['ask', 'granted', 'blocked', 'unsupported'],
    },
    platform: {
      control: { type: 'select' },
      options: ['auto', ...mobilePlatforms, ...webPlatforms],
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
        // The timezone dropdown saves the zone to the profile.
        ...PROFILE_HANDLERS,
      ],
    },
  },
  // The boot mock pins the app theme to bright, and the production reminder's
  // providers apply it to <html> over the toolbar's choice. Booting with the
  // toolbar's theme keeps the reminder and Patchy on the same one.
  // The theme decorator applies its class only once Storybook sees the story
  // rendered, and Storybook waits out running animations first. An ending's
  // 3s countdown would leave it on the default theme until then.
  beforeEach: ({ globals }) => {
    // Unset, the toolbar's theme is an empty string: the decorator's default.
    const theme = globals.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    getBootMock.mockReturnValue({
      ...getBootMock(),
      // Sign-up records the browser's zone; the reminder starts from it.
      user: {
        ...defaultBootData.user,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      settings: {
        ...defaultBootData.settings,
        theme: globals.theme === 'dark' ? 'darcula' : 'bright',
      },
    });
  },
  render: ({ flow, start, notifications, platform, now, motion }) => (
    <>
      <Motion />
      {flow === 'before' ? (
        <ReminderThenPatchy />
      ) : (
        // The app's providers, for the profile and the timezone dropdown.
        <ExtensionProviders>
          <FeedPatchy
            withReminder={
              notifications !== 'unsupported' &&
              (platform === 'auto' || platforms[platform].canPrompt)
            }
            startAt={start}
            permission={notifications}
            platform={platform === 'auto' ? undefined : platform}
            nowHour={now === 'clock' ? undefined : Number(now)}
            hasIntro={motion === 'full'}
            onCommit={() => undefined}
          />
        </ExtensionProviders>
      )}
    </>
  ),
};

/** The production step with the commitment flag on, as the funnel mounts it. */
const LiveStep = ({
  hint,
  start,
}: {
  hint: DragHint;
  start: 'bone' | 'reminder';
}): ReactElement => {
  const [isDone, setIsDone] = useState(false);

  // Feeds Patchy with a tap once the bone can take one and Patchy has laid
  // out: the step-up measures him, so an earlier tap leaves him stuck.
  useEffect(() => {
    if (start !== 'reminder') {
      return undefined;
    }
    let timeout = 0;
    const interval = window.setInterval(() => {
      const bone = document.querySelector<HTMLButtonElement>(
        '[data-funnel-track="commitment bone"]',
      );
      const dog = document.querySelector<HTMLImageElement>(
        'img[alt="Patchy looking up"]',
      );
      if (bone && !bone.disabled && dog?.complete && dog.offsetHeight) {
        window.clearInterval(interval);
        timeout = window.setTimeout(() => bone.click(), 600);
      }
    }, 100);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [start]);

  return (
    <FeatureOverrides values={{ [featureOnboardingCommitment.id]: true }}>
      <FunnelStepShell
        step={reminderStep}
        stepIndex={REMINDER_STEP_INDEX}
        fullWidth
      >
        {!isDone && (
          <FunnelReadingReminder
            {...reminderStep}
            onTransition={() => setIsDone(true)}
          />
        )}
      </FunnelStepShell>
      <DragHintOverlay hint={hint} />
    </FeatureOverrides>
  );
};

interface LiveScreenArgs {
  /** A drag-hint exploration drawn over the screen. */
  hint: DragHint;
  /** skip opens on the bone, the way reduced motion does in production. */
  intro: 'full' | 'skip';
  /** reminder feeds Patchy straight away, to land on the reminder ask. */
  start: 'bone' | 'reminder';
}

/**
 * The production step at the full viewport. The Live and exploration pages
 * load it in device-sized iframes. Hidden from the sidebar.
 */
export const LiveScreen: StoryObj<LiveScreenArgs> = {
  name: 'Live screen',
  tags: ['!dev'],
  args: { hint: 'current', intro: 'full', start: 'bone' },
  argTypes: {
    hint: {
      control: { type: 'select' },
      options: dragHints.map(({ id }) => id),
    },
    intro: { control: { type: 'inline-radio' }, options: ['full', 'skip'] },
    start: {
      control: { type: 'inline-radio' },
      options: ['bone', 'reminder'],
    },
  },
  parameters: Screen.parameters,
  beforeEach: (context) => {
    Screen.beforeEach?.(context as never);
    if (context.args.intro !== 'skip') {
      return undefined;
    }
    // The component skips its intro when the OS asks for reduced motion.
    const { matchMedia } = window;
    window.matchMedia = (query: string) =>
      query.includes('prefers-reduced-motion')
        ? ({ ...matchMedia(query), matches: true } as MediaQueryList)
        : matchMedia(query);
    return () => {
      window.matchMedia = matchMedia;
    };
  },
  render: ({ hint, start }) => <LiveStep hint={hint} start={start} />,
};

/** A reminder-ask exploration at the full viewport, in the funnel's shell. */
export const ReminderScreen: StoryObj<{
  variant: Exclude<ReminderVariant, 'today'>;
}> = {
  name: 'Reminder screen',
  tags: ['!dev'],
  args: { variant: 'why' },
  argTypes: {
    variant: {
      control: { type: 'inline-radio' },
      options: ['why', 'ask', 'preset'],
    },
  },
  parameters: Screen.parameters,
  beforeEach: Screen.beforeEach,
  render: ({ variant }) => (
    <FunnelStepShell
      step={reminderStep}
      stepIndex={REMINDER_STEP_INDEX}
      fullWidth
    >
      <ReminderVariantScreen variant={variant} />
    </FunnelStepShell>
  ),
};
