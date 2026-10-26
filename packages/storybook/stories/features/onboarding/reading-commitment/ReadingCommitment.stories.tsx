import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FlowProps } from './Flow';
import { Flow as ReadingFlow } from './Flow';
import type { Platform } from './NotificationPreview';
import { LockScreen, Notification } from './NotificationPreview';
import { REMINDER_TIMES } from './reminderTimes';

/**
 * Exploration: replace Feed Patchy with a reading commitment. Two questions
 * (how much you read today, where you'd like to be), a commit screen that
 * shows the gap, then a preview of the real push before "Enable
 * notifications" or "Skip for now".
 *
 * - Flow: the whole thing, interactive. Every idea is a control.
 * - Directions: the main combinations side by side in phone frames.
 * - Notification previews: the push mockups on iOS and Android.
 */

const FLOW_ID = 'pages-onboarding-reading-commitment--flow';

const meta: Meta<FlowProps> = {
  title: 'Pages/Onboarding/Reading commitment',
  component: ReadingFlow,
  parameters: { layout: 'fullscreen' },
  args: {
    direction: 'questions',
    gap: 'phone',
    preview: 'lockScreen',
    platform: 'ios',
    askTime: true,
    skipPlacement: 'inline',
    commitCopy: 'turnOn',
  },
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: ['questions', 'oneScreen'],
      description:
        'questions: one question per screen, then a commit screen. oneScreen: both answers on one screen, and its CTA is the commitment.',
    },
    gap: {
      control: 'inline-radio',
      options: ['bars', 'week', 'phone'],
      description:
        'The commit screen: today vs goal as bars, the goal laid over the coming week, or the push itself on a phone (committing turns reminders on, so there is no separate notification screen).',
    },
    preview: {
      control: 'inline-radio',
      options: ['lockScreen', 'banners'],
      description:
        'lockScreen: tomorrow’s push on a phone lock screen. banners: the next three nudges stacked.',
    },
    platform: { control: 'inline-radio', options: ['ios', 'android'] },
    askTime: {
      control: 'boolean',
      description:
        'Ask when they usually have a few minutes; the answer is the push time.',
    },
    skipPlacement: {
      control: 'inline-radio',
      options: ['inline', 'topBar'],
      description:
        'inline: “Skip for now” right under the preview. topBar: the funnel’s usual top-right skip.',
    },
    commitCopy: {
      control: 'inline-radio',
      options: ['turnOn', 'thisIsIt', 'nudge', 'keepGoal'],
      description:
        'Copy for the phone commit screen (gap: phone). Every option says notifications turn on here.',
    },
    startAt: {
      control: 'select',
      options: [
        undefined,
        'today',
        'goal',
        'plan',
        'time',
        'commit',
        'notify',
        'done',
      ],
      description: 'Open on this screen with sample answers.',
    },
    isSampleSkipped: {
      control: 'boolean',
      description: 'With startAt done: the ending for a skipped reminder.',
    },
    isStatic: {
      control: 'boolean',
      description: 'Hold the screen still: the end screen never moves on.',
    },
  },
};

export default meta;

type Story = StoryObj<FlowProps>;

export const Flow: Story = {
  // Remounts on every control change, so the flow starts over.
  render: (args) => <ReadingFlow key={JSON.stringify(args)} {...args} />,
};

interface DoneArgs {
  goal: string;
  time: string;
  isSkipped: boolean;
}

export const DoneScreen: StoryObj<DoneArgs> = {
  name: 'Done screen',
  parameters: { controls: { include: ['goal', 'time', 'isSkipped'] } },
  args: { goal: '15', time: '9:00 AM', isSkipped: false },
  argTypes: {
    goal: {
      control: 'inline-radio',
      options: ['5', '10', '15', '30'],
      description: 'Daily goal, in minutes.',
    },
    time: {
      control: 'inline-radio',
      options: REMINDER_TIMES.map(({ value }) => value),
      description: 'The reminder time they picked.',
    },
    isSkipped: {
      control: 'boolean',
      description: 'They skipped notifications.',
    },
  },
  // Plays the ring, the confetti and the countdown, then plays them again.
  render: ({ goal, time, isSkipped }) => (
    <ReadingFlow
      key={`${goal}-${time}-${isSkipped}`}
      {...(meta.args as FlowProps)}
      startAt="done"
      sampleGoal={goal}
      sampleTime={time}
      isSampleSkipped={isSkipped}
      isLoopingEnding
    />
  ),
};

const PHONE = { width: 390, height: 844, bezel: 10 };

const toArgs = (args: Partial<FlowProps>): string =>
  Object.entries(args)
    .map(([key, value]) =>
      typeof value === 'boolean' ? `${key}:!${value}` : `${key}:${value}`,
    )
    .join(';');

/**
 * Loads the Flow story in an iframe the size of a phone, so the funnel's
 * breakpoints see a phone. Scaled down to fit its column.
 */
const PhoneFrame = ({
  label,
  args,
  isStatic,
}: {
  label: string;
  args: Partial<FlowProps>;
  /** A still screenshot: no Restart, and the screen can't be clicked. */
  isStatic?: boolean;
}): ReactElement => {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [run, setRun] = useState(0);
  const outerWidth = PHONE.width + PHONE.bezel * 2;
  const outerHeight = PHONE.height + PHONE.bezel * 2;

  useEffect(() => {
    const element = host.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) =>
      setScale(Math.min(1, entry.contentRect.width / outerWidth)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [outerWidth]);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate font-bold text-text-primary typo-callout">
          {label}
        </span>
        {!isStatic && (
          <button
            type="button"
            className="shrink-0 text-text-link typo-footnote"
            onClick={() => setRun((current) => current + 1)}
          >
            Restart
          </button>
        )}
      </div>
      <div ref={host} className="w-full">
        <div
          style={{ width: outerWidth * scale, height: outerHeight * scale }}
          className="mx-auto"
        >
          <div
            style={{
              width: outerWidth,
              height: outerHeight,
              padding: PHONE.bezel,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
            className="overflow-hidden rounded-[3rem] border-2 border-border-subtlest-tertiary bg-background-default shadow-3"
          >
            <iframe
              key={run}
              title={label}
              src={`iframe.html?id=${FLOW_ID}&viewMode=story&args=${toArgs(
                isStatic ? { ...args, isStatic: true } : args,
              )}`}
              width={PHONE.width}
              height={PHONE.height}
              tabIndex={isStatic ? -1 : undefined}
              className={classNames(
                'block rounded-[2.25rem] border-0',
                isStatic && 'pointer-events-none',
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DIRECTIONS: Array<{ label: string; args: Partial<FlowProps> }> = [
  {
    label: 'A. Questions, then today vs goal',
    args: { direction: 'questions', gap: 'bars', preview: 'lockScreen' },
  },
  {
    label: 'B. Questions, then your week',
    args: { direction: 'questions', gap: 'week', preview: 'banners' },
  },
  {
    label: 'C. Commit with the push preview',
    args: { direction: 'questions', gap: 'phone' },
  },
  {
    label: 'D. One screen, live gap',
    args: { direction: 'oneScreen', preview: 'lockScreen' },
  },
];

export const Directions: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex min-h-dvh flex-col gap-8 bg-background-default p-8">
      <div className="flex max-w-3xl flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-title2">
          Reading commitment: directions
        </h1>
        <p className="text-text-secondary typo-callout">
          Each phone is the live flow. Click through it. The first row opens
          on the first question, the second on the notification screen.
        </p>
      </div>
      {(['start', 'notify'] as const).map((row) => (
        <div key={row} className="grid grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-4">
          {DIRECTIONS.map(({ label, args }) => (
            <PhoneFrame
              key={label}
              label={row === 'notify' ? `${label} · notify` : label}
              args={{
                ...args,
                ...(row === 'notify' && {
                  startAt: args.gap === 'phone' ? 'commit' : 'notify',
                }),
              }}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

// The chosen flow: one question per screen, the reminder time, then the
// commit screen with the push on a phone.
const CHOSEN: Partial<FlowProps> = { direction: 'questions', gap: 'phone' };

const ALL_SCREENS: Array<{ label: string; args: Partial<FlowProps> }> = [
  { label: '1. Today', args: { startAt: 'today' } },
  { label: '2. Goal', args: { startAt: 'goal' } },
  { label: '3. Reminder time', args: { startAt: 'time' } },
  { label: '4. Turn on your daily reminder', args: { startAt: 'commit' } },
  { label: '5. Done', args: { startAt: 'done' } },
  {
    label: '5b. Done, reminder skipped',
    args: { startAt: 'done', isSampleSkipped: true },
  },
];

export const AllScreens: Story = {
  name: 'All screens',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex min-h-dvh flex-col gap-8 bg-background-default p-8">
      <div className="flex max-w-3xl flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-title2">
          Reading commitment: all screens
        </h1>
        <p className="text-text-secondary typo-callout">
          The whole flow in order, as stills with sample answers (5 min today,
          15 min goal, 9:00 AM).
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 tablet:grid-cols-3 laptop:grid-cols-6">
        {ALL_SCREENS.map(({ label, args }) => (
          <PhoneFrame
            key={label}
            label={label}
            args={{ ...CHOSEN, ...args }}
            isStatic
          />
        ))}
      </div>
    </div>
  ),
};

const COPY_OPTIONS: Array<{ label: string; commitCopy: FlowProps['commitCopy'] }> =
  [
    { label: '1. Turn on your daily reminder', commitCopy: 'turnOn' },
    { label: '2. Get a nudge at 9:00 AM', commitCopy: 'nudge' },
    { label: '3. This is your daily reminder', commitCopy: 'thisIsIt' },
    { label: '4. Hit 15 minutes a day', commitCopy: 'keepGoal' },
  ];

export const CommitCopy: Story = {
  name: 'Commit copy',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex min-h-dvh flex-col gap-8 bg-background-default p-8">
      <div className="flex max-w-3xl flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-title2">
          Commit screen copy
        </h1>
        <p className="text-text-secondary typo-callout">
          The commit screen with the push preview. Each option makes it clear
          that this step turns notifications on.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-4">
        {COPY_OPTIONS.map(({ label, commitCopy }) => (
          <PhoneFrame
            key={label}
            label={label}
            args={{ gap: 'phone', startAt: 'commit', commitCopy }}
          />
        ))}
      </div>
    </div>
  ),
};

const SAMPLE_GOAL = 15;

export const NotificationPreviews: Story = {
  name: 'Notification previews',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex min-h-dvh flex-col gap-8 bg-background-default p-8">
      <div className="flex max-w-3xl flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-title2">
          Notification previews
        </h1>
        <p className="text-text-secondary typo-callout">
          One push per reminder time the user can pick, with a 15-minute goal.
          The commit screen shows the one matching their answer.
        </p>
      </div>
      {REMINDER_TIMES.map(({ value, label, push }) => {
        const content = { ...push(SAMPLE_GOAL), when: 'now' };

        return (
          <section
            key={value}
            className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-6"
          >
            <h2 className="font-bold text-text-primary typo-title3">
              {value} · {label}
            </h2>
            <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2">
              {(['ios', 'android'] as Platform[]).map((platform) => (
                <div
                  key={platform}
                  className="flex flex-col items-center gap-4"
                >
                  <span className="font-bold text-text-tertiary typo-callout">
                    {platform === 'ios' ? 'iOS' : 'Android'}
                  </span>
                  <LockScreen
                    platform={platform}
                    clock={value.replace(/\s?[AP]M$/, '')}
                    date="Monday, October 26"
                    notifications={[content]}
                  />
                  <div className="w-full max-w-[22rem]">
                    <Notification platform={platform} {...content} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  ),
};
