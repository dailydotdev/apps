import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FlowProps } from './Flow';
import { Flow as ReadingFlow } from './Flow';
import type { Platform } from './NotificationPreview';
import { LockScreen, Notification } from './NotificationPreview';

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

const FLOW_ID = 'features-onboarding-reading-commitment--flow';

const meta: Meta<FlowProps> = {
  title: 'Features/Onboarding/Reading commitment',
  component: ReadingFlow,
  parameters: { layout: 'fullscreen' },
  args: {
    direction: 'questions',
    gap: 'bars',
    preview: 'lockScreen',
    platform: 'ios',
    askTime: true,
    skipPlacement: 'inline',
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
      options: ['bars', 'week'],
      description:
        'The commit screen: today vs goal as bars, or the goal laid over the coming week.',
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
    startAt: {
      control: 'select',
      options: [undefined, 'today', 'goal', 'plan', 'time', 'commit', 'notify'],
      description: 'Open on this screen with sample answers.',
    },
  },
};

export default meta;

type Story = StoryObj<FlowProps>;

export const Flow: Story = {
  // Remounts on every control change, so the flow starts over.
  render: (args) => <ReadingFlow key={JSON.stringify(args)} {...args} />,
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
}: {
  label: string;
  args: Partial<FlowProps>;
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
        <span className="font-bold text-text-primary typo-callout">
          {label}
        </span>
        <button
          type="button"
          className="text-text-link typo-footnote"
          onClick={() => setRun((current) => current + 1)}
        >
          Restart
        </button>
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
                args,
              )}`}
              width={PHONE.width}
              height={PHONE.height}
              className="block rounded-[2.25rem] border-0"
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
    label: 'C. One screen, live gap',
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
        <div key={row} className="grid grid-cols-1 gap-8 tablet:grid-cols-3">
          {DIRECTIONS.map(({ label, args }) => (
            <PhoneFrame
              key={label}
              label={row === 'notify' ? `${label} · notify` : label}
              args={{
                ...args,
                ...(row === 'notify' && { startAt: 'notify' }),
              }}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

const SAMPLE_PUSH = {
  title: 'Time to read ☕',
  body: 'Your 15 minutes: fresh posts on React and AI are waiting.',
  when: 'now',
};

export const NotificationPreviews: Story = {
  name: 'Notification previews',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex min-h-dvh flex-col gap-8 bg-background-default p-8">
      <h1 className="font-bold text-text-primary typo-title2">
        Notification previews
      </h1>
      <div className="grid grid-cols-1 gap-10 tablet:grid-cols-2">
        {(['ios', 'android'] as Platform[]).map((platform) => (
          <div key={platform} className="flex flex-col items-center gap-6">
            <span className="font-bold text-text-tertiary typo-callout">
              {platform === 'ios' ? 'iOS' : 'Android'}
            </span>
            <LockScreen
              platform={platform}
              clock="9:00"
              date="Monday, October 26"
              notifications={[SAMPLE_PUSH]}
            />
            <div className="w-full max-w-[22rem]">
              <Notification platform={platform} {...SAMPLE_PUSH} />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
