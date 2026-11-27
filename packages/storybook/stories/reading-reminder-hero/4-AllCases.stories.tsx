import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { DeviceName } from '../sources/device';
import { Device } from '../sources/device';
import { FeedInDevice, FeedMock, StripInLaptop } from './FeedMock';
import type { HeroStep, PromptPlatform } from './ProposedHero';
import {
  PermissionPrompt,
  ProposedHero,
  ProposedTopHero,
  shortHour,
} from './ProposedHero';
import type { TodayKind } from './TodayHero';
import { TodayHero } from './TodayHero';

// Every case the slot can be in, for a careful pass before building: what
// production shows today, each proposed state on every device in both
// themes, every kind of hour, who gets what, and how each platform asks for
// push.

type Themes = 'both' | 'light' | 'dark';

interface CaseArgs {
  themes: Themes;
  readingHour: number;
}

const meta: Meta<CaseArgs> = {
  title: 'Growth/Reading reminder hero/4. All cases',
  parameters: { layout: 'fullscreen' },
  args: { themes: 'both', readingHour: 20 },
  argTypes: {
    themes: {
      name: 'Themes',
      control: 'inline-radio',
      options: ['both', 'light', 'dark'],
    },
    readingHour: {
      name: 'Hour they see the card',
      control: { type: 'range', min: 0, max: 23, step: 1 },
    },
  },
};

export default meta;

const noop = (): void => undefined;

const themesOf = (themes: Themes): ('light' | 'dark')[] =>
  themes === 'both' ? ['light', 'dark'] : [themes];

const devices: { name: DeviceName; isLaptop: boolean }[] = [
  { name: 'phone', isLaptop: false },
  { name: 'tablet', isLaptop: false },
  { name: 'laptop', isLaptop: true },
];

const Page = ({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-8 px-4 py-8 tablet:px-8">
    <header className="flex max-w-[48rem] flex-col gap-2">
      <h1 className="font-bold text-text-primary typo-title1">{title}</h1>
      <p className="text-text-secondary typo-body">{intro}</p>
    </header>
    {children}
  </div>
);

const Group = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6">
    <div className="flex max-w-[48rem] flex-col gap-1">
      <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
      {note && <p className="text-text-tertiary typo-footnote">{note}</p>}
    </div>
    {children}
  </section>
);

/** Phone, tablet and laptop side by side, phones kept at their own width. */
const DeviceRow = ({
  theme,
  render,
}: {
  theme: 'light' | 'dark';
  render: (isLaptop: boolean) => ReactNode;
}): ReactElement => (
  <div className="grid grid-cols-1 items-start gap-4 laptop:grid-cols-[14rem_1fr_1.4fr]">
    {devices.map(({ name, isLaptop }) => (
      <Device key={name} device={name} theme={theme} height={420} url="/">
        <FeedMock isLaptop={isLaptop} hero={render(isLaptop)} />
      </Device>
    ))}
  </div>
);

// 1. Production today

const todayKinds: { kind: TodayKind; title: string; note: string }[] = [
  {
    kind: 'reminder',
    title: 'Reading reminder offer',
    note: 'Readers with no reading reminder. Copy from the reading_reminder_hero_copy default.',
  },
  {
    kind: 'paused',
    title: 'Paused reminder prompt (#7013)',
    note: 'Readers whose reminder is saved but paused because push is off. Takes the slot first.',
  },
];

export const Today: StoryObj<CaseArgs> = {
  name: 'Today in production',
  render: ({ themes }) => (
    <Page
      title="Today in production"
      intro="What readers get now, rendered with the production components and props: ReadingReminderFeedHero inline on phones and tablets, TopHero in the strip above the feed from 1020px up. On phones and tablets, in light theme its small title line (“Never miss a learning day”) and the button’s background disappear."
    >
      {todayKinds.map(({ kind, title, note }) => (
        <Group key={kind} title={title} note={note}>
          {themesOf(themes).map((theme) => (
            <DeviceRow
              key={theme}
              theme={theme}
              render={(isLaptop) => (
                <TodayHero
                  isLaptop={isLaptop}
                  kind={kind}
                  onEnable={noop}
                  onClose={noop}
                />
              )}
            />
          ))}
        </Group>
      ))}
    </Page>
  ),
};

// 2. Every proposed state

const stepNotes: { step: HeroStep; title: string; note: string }[] = [
  {
    step: 'offer',
    title: 'Offer',
    note: 'The hour they see the card, in their timezone, rounded down; 9 AM between midnight and 5 AM.',
  },
  {
    step: 'picking',
    title: 'Other time',
    note: '9 AM, 1 PM and 8 PM, with the offered hour in place of the nearest one.',
  },
  {
    step: 'asking',
    title: 'Asking for push',
    note: 'Behind the system prompt. Nothing saved yet.',
  },
  {
    step: 'saved',
    title: 'Saved',
    note: 'Push on and the reminder saved; the card leaves after about 2.5s.',
  },
  {
    step: 'denied',
    title: 'Blocked',
    note: 'Push blocked: nothing saved. Production shows ReEnableNotifications steps for the platform here.',
  },
  {
    step: 'paused',
    title: 'Paused reminder prompt',
    note: 'The existing prompt, in the new layout.',
  },
];

export const ProposedStates: StoryObj<CaseArgs> = {
  name: 'Proposed · every state',
  render: ({ themes, readingHour }) => (
    <Page
      title="Every proposed state, every device"
      intro="Each state on phone, tablet and laptop, in the themes picked in the controls. Phones and tablets get the feed card, laptop the strip card."
    >
      {stepNotes.map(({ step, title, note }) => (
        <Group key={step} title={title} note={note}>
          {themesOf(themes).map((theme) => (
            <DeviceRow
              key={theme}
              theme={theme}
              render={(isLaptop) =>
                isLaptop ? (
                  <ProposedTopHero
                    step={step}
                    readingHour={readingHour}
                    className="order-first"
                    onClose={noop}
                  />
                ) : (
                  <ProposedHero
                    step={step}
                    readingHour={readingHour}
                    onClose={noop}
                  />
                )
              }
            />
          ))}
        </Group>
      ))}
    </Page>
  ),
};

// 3. Hours

const hourCases: { hour: number; note: string }[] = [
  {
    hour: 0,
    note: 'Midnight to 5 AM: offers 9 AM instead of the current hour.',
  },
  { hour: 2, note: 'Late night: offers 9 AM too, arriving later today.' },
  { hour: 5, note: 'From 5 AM the current hour is offered as is.' },
  { hour: 7, note: 'Early morning.' },
  { hour: 9, note: 'One of the presets: the choices stay 9, 1, 8.' },
  { hour: 12, note: 'Noon: replaces 1 PM in the choices.' },
  { hour: 17, note: 'Evening: replaces 8 PM in the choices.' },
  { hour: 20, note: 'The mockup’s example.' },
  { hour: 23, note: 'Late evening: replaces 8 PM.' },
];

export const Hours: StoryObj<CaseArgs> = {
  name: 'Hours',
  render: () => (
    <Page
      title="Every kind of hour"
      intro="The offer and the Other time choices for hours across the day, on a phone and on the laptop card. The offered hour replaces the nearest preset (9 AM between midnight and 5 AM), and each choice shows a sun or a moon."
    >
      {hourCases.map(({ hour, note }) => (
        <Group key={hour} title={`Seen at ${shortHour(hour)}`} note={note}>
          <div className="grid grid-cols-1 items-start gap-4 laptop:grid-cols-[14rem_14rem_minmax(0,1fr)]">
            <FeedInDevice
              device="phone"
              height={440}
              hero={
                <ProposedHero step="offer" readingHour={hour} onClose={noop} />
              }
            />
            <FeedInDevice
              device="phone"
              height={440}
              hero={
                <ProposedHero
                  step="picking"
                  readingHour={hour}
                  onClose={noop}
                />
              }
            />
            <div className="flex flex-col gap-3">
              <StripInLaptop
                hero={
                  <ProposedTopHero
                    step="offer"
                    readingHour={hour}
                    onClose={noop}
                  />
                }
              />
              <StripInLaptop
                hero={
                  <ProposedTopHero
                    step="picking"
                    readingHour={hour}
                    onClose={noop}
                  />
                }
              />
            </div>
          </div>
        </Group>
      ))}
    </Page>
  ),
};

// 4. Who gets what

type Outcome = 'offer' | 'paused' | 'none';

const outcomeLabel: Record<Outcome, string> = {
  offer: 'Offer',
  paused: 'Paused prompt',
  none: 'Nothing',
};

const whoCases: {
  reader: string;
  today: Outcome;
  proposed: Outcome;
  note?: string;
}[] = [
  {
    reader: 'Logged in, no reminder, home feed',
    today: 'offer',
    proposed: 'offer',
  },
  { reader: 'Logged out', today: 'none', proposed: 'none' },
  {
    reader: 'Reminder saved, push on',
    today: 'none',
    proposed: 'none',
  },
  {
    reader: 'Reminder saved, push off (paused)',
    today: 'paused',
    proposed: 'paused',
    note: 'The paused prompt only shows where push is supported.',
  },
  { reader: 'Signed up today', today: 'none', proposed: 'none' },
  {
    reader: 'Closed it on this device',
    today: 'none',
    proposed: 'none',
  },
  {
    reader: 'Closed it on another device',
    today: 'offer',
    proposed: 'none',
    note: 'The close moves to the account.',
  },
  {
    reader: 'Already saw it today',
    today: 'none',
    proposed: 'none',
    note: 'Once a day per device; it stays for the session once shown.',
  },
  {
    reader: 'Opened another feed first today, then the home feed',
    today: 'none',
    proposed: 'offer',
    note: 'Today the day is used up on any feed where they qualify, even with no card shown. Proposed: stamp only when shown.',
  },
  {
    reader: 'iOS Safari, not installed (no web push)',
    today: 'offer',
    proposed: 'none',
    note: 'Today it saves a reminder that can’t arrive.',
  },
  {
    reader: 'Push blocked in the browser',
    today: 'offer',
    proposed: 'offer',
    note: 'Proposed: tapping goes to the blocked state, nothing saved.',
  },
  {
    reader: 'Push already allowed',
    today: 'offer',
    proposed: 'offer',
    note: 'Proposed: tapping saves at once, no prompt.',
  },
  {
    reader: 'Not on the home feed',
    today: 'none',
    proposed: 'none',
  },
  {
    reader: 'Extension new tab',
    today: 'none',
    proposed: 'none',
    note: 'The page check never passes there.',
  },
  {
    reader: 'Feed with other top content (e.g. explore chips in list layout)',
    today: 'none',
    proposed: 'none',
    note: 'keepTopHero would keep it, but only tests set it.',
  },
  {
    reader: 'Feed hero on (without feed widgets)',
    today: 'none',
    proposed: 'none',
    note: 'disableTopHero hides it.',
  },
  {
    reader: 'Weekly picks is showing',
    today: 'offer',
    proposed: 'none',
    note: 'Today both cards show. Proposed: Weekly picks takes the slot; the reminder waits for a later visit.',
  },
  {
    reader: 'Weekly picks still deciding',
    today: 'none',
    proposed: 'none',
    note: 'Held back until Weekly picks decides, since Weekly picks takes the slot when it shows.',
  },
];

const OutcomeTag = ({ outcome }: { outcome: Outcome }): ReactElement => (
  <span
    className={
      outcome === 'none'
        ? 'rounded-6 bg-surface-float px-1.5 py-0.5 font-bold text-text-tertiary typo-caption1'
        : 'rounded-6 bg-accent-cabbage-default px-1.5 py-0.5 font-bold text-white typo-caption1'
    }
  >
    {outcomeLabel[outcome]}
  </span>
);

export const WhoGetsWhat: StoryObj<CaseArgs> = {
  name: 'Who gets what',
  render: ({ readingHour }) => (
    <Page
      title="Who gets what"
      intro="Every reader case and what the slot shows, today and proposed. Rows that change are highlighted. Each outcome is rendered on the right."
    >
      <div className="flex flex-col gap-3">
        {whoCases.map(({ reader, today, proposed, note }) => (
          <div
            key={reader}
            className={
              today === proposed
                ? 'grid grid-cols-1 items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3 laptop:grid-cols-[1fr_7rem_7rem_14rem]'
                : 'grid grid-cols-1 items-center gap-3 rounded-16 border border-accent-cabbage-default bg-surface-float p-3 laptop:grid-cols-[1fr_7rem_7rem_14rem]'
            }
          >
            <div className="flex flex-col gap-1">
              <p className="font-bold text-text-primary typo-callout">
                {reader}
              </p>
              {note && (
                <p className="text-text-tertiary typo-footnote">{note}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-quaternary typo-caption1">Today</span>
              <OutcomeTag outcome={today} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-quaternary typo-caption1">
                Proposed
              </span>
              <OutcomeTag outcome={proposed} />
            </div>
            {proposed === 'none' ? (
              <p className="text-text-tertiary typo-footnote">
                The feed starts with the first row of posts.
              </p>
            ) : (
              <FeedInDevice
                device="phone"
                height={420}
                hero={
                  <ProposedHero
                    step={proposed === 'paused' ? 'paused' : 'offer'}
                    readingHour={readingHour}
                    onClose={noop}
                  />
                }
              />
            )}
          </div>
        ))}
      </div>
    </Page>
  ),
};

// 5. Platforms

const platforms: {
  name: string;
  platform: PromptPlatform | null;
  note: string;
}[] = [
  {
    name: 'Web, desktop and Android browsers',
    platform: 'web',
    note: 'OneSignal web push. The browser asks. After a block it can’t ask again; the card shows the steps.',
  },
  {
    name: 'iOS app',
    platform: 'ios',
    note: 'Native bridge (push-subscribe). iOS asks once; it has no “dismissed”, so a no counts as blocked.',
  },
  {
    name: 'Android app',
    platform: 'android',
    note: 'A Chrome shell using OneSignal web push. Android 13+ asks with its own dialog.',
  },
  {
    name: 'iOS Safari, not installed',
    platform: null,
    note: 'No web push. Proposed: the card is hidden.',
  },
  {
    name: 'Extension new tab',
    platform: null,
    note: 'Never shown, today or proposed.',
  },
];

export const Platforms: StoryObj<CaseArgs> = {
  name: 'Platforms',
  render: ({ readingHour }) => (
    <Page
      title="How each platform asks"
      intro="The asking state with each platform’s permission prompt (stand-ins: the real prompts belong to the browser or the OS), and the platforms where the card doesn’t show."
    >
      <div className="grid grid-cols-1 items-start gap-6 tablet:grid-cols-2 laptopL:grid-cols-3">
        {platforms.map(({ name, platform, note }) => (
          <div key={name} className="flex flex-col gap-2">
            <p className="font-bold text-text-primary typo-callout">{name}</p>
            <p className="min-h-10 text-text-tertiary typo-footnote">{note}</p>
            <div className="relative w-[23.4375rem] max-w-full">
              <Device device="phone" height={560} url="/">
                <FeedMock
                  hero={
                    platform ? (
                      <ProposedHero
                        step="asking"
                        readingHour={readingHour}
                        onClose={noop}
                      />
                    ) : undefined
                  }
                />
              </Device>
              {platform && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 top-6">
                  <PermissionPrompt
                    platform={platform}
                    onAllow={noop}
                    onBlock={noop}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
