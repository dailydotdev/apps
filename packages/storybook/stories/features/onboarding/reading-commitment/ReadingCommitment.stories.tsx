import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FlowProps } from './Flow';
import { Flow as ReadingFlow } from './Flow';
import type { Platform } from './NotificationPreview';
import { LockScreen, Notification } from './NotificationPreview';
import { REMINDER_TIMES } from './reminderTimes';

/**
 * The reading commitment that replaces Feed Patchy: how much you read today,
 * your daily goal, a reminder time, then a preview of the real push before
 * "Turn on notifications" or "Skip for now", and the streak's Day 1.
 *
 * - Flow: the whole thing, interactive.
 * - Done screen: the ending on a loop, with its own controls.
 * - All screens: every screen in order, as stills.
 * - Notification previews: the push for each reminder time, iOS and Android.
 */

const FLOW_ID = 'pages-onboarding-reading-commitment--flow';

const meta: Meta<FlowProps> = {
  title: 'Pages/Onboarding/Reading commitment',
  component: ReadingFlow,
  parameters: { layout: 'fullscreen' },
  args: { platform: 'ios' },
  argTypes: {
    platform: {
      control: 'inline-radio',
      options: ['ios', 'android'],
      description: 'Which phone the notification preview is drawn as.',
    },
    startAt: {
      control: 'select',
      options: [undefined, 'today', 'goal', 'time', 'commit', 'done'],
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
 * Loads the Flow story, held still, in an iframe the size of a phone, so the
 * funnel's breakpoints see a phone. Scaled down to fit its column.
 */
const PhoneFrame = ({
  label,
  args,
}: {
  label: string;
  args: Partial<FlowProps>;
}): ReactElement => {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
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
      <span className="truncate font-bold text-text-primary typo-callout">
        {label}
      </span>
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
              title={label}
              src={`iframe.html?id=${FLOW_ID}&viewMode=story&args=${toArgs({
                ...args,
                isStatic: true,
              })}`}
              width={PHONE.width}
              height={PHONE.height}
              tabIndex={-1}
              className="pointer-events-none block rounded-[2.25rem] border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

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
          <PhoneFrame key={label} label={label} args={args} />
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
