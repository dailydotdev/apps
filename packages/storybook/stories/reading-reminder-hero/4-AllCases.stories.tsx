import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Picks, PicksPost } from '@dailydotdev/shared/src/graphql/picks';
import { WeeklyPicksHeroCard } from '@dailydotdev/shared/src/components/picks/WeeklyPicksHero';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import ExtensionProviders from '../extension/_providers';
import type { DeviceName } from '../sources/device';
import { Device } from '../sources/device';
import { FeedMock } from './FeedMock';
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
// themes, the reminder next to Weekly picks, every kind of hour, who gets
// what, and how each platform asks for push.

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
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
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
  height = 420,
  render,
}: {
  theme: 'light' | 'dark';
  height?: number;
  render: (isLaptop: boolean) => ReactNode;
}): ReactElement => (
  <div className="grid grid-cols-1 items-start gap-4 laptop:grid-cols-[14rem_1fr_1.4fr]">
    {devices.map(({ name, isLaptop }) => (
      <Device
        key={name}
        device={name}
        theme={theme}
        height={isLaptop ? 420 : height}
        url="/"
      >
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
      intro="What readers get now, rendered with the production components and props: ReadingReminderFeedHero inline on phones and tablets, TopHero in the strip above the feed from 1024px up. In light theme the phone and tablet card loses its eyebrow line and its button background."
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
    note: 'The hour they see the card, in their timezone, rounded down.',
  },
  {
    step: 'picking',
    title: 'Other time',
    note: '9 AM, 1 PM and 8 PM, with the current hour in place of the nearest one.',
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

// 3. Next to Weekly picks

const post = (id: string, placeholder: number): PicksPost => ({
  id,
  permalink: `https://app.daily.dev/posts/${id}`,
  commentsPermalink: `https://app.daily.dev/posts/${id}`,
  image: `https://media.daily.dev/image/upload/f_auto/v1/placeholders/${placeholder}`,
  type: 'article',
});

const week = [post('a', 1), post('b', 6), post('c', 11)];

const picks: Picks = {
  id: 'picks-demo',
  weekStart: '2026-11-16',
  author: {
    id: defaultUser.id,
    name: defaultUser.name,
    username: defaultUser.username,
    image: defaultUser.image,
    permalink: defaultUser.permalink,
  },
  items: week.map((item, index) => ({ post: item, position: index + 1 })),
};

type PicksState = 'nudge' | 'live';

const PicksCard = ({
  isLaptop,
  state,
}: {
  isLaptop: boolean;
  state: PicksState;
}): ReactElement =>
  state === 'nudge' ? (
    <WeeklyPicksHeroCard
      variant={isLaptop ? 'strip' : 'panel'}
      state="nudge"
      signals={{ upvotes: 4, bookmarks: 2, reads: 6, posts: week }}
      weekPosts={week}
      onDismiss={noop}
    />
  ) : (
    <WeeklyPicksHeroCard
      variant={isLaptop ? 'strip' : 'panel'}
      state="live"
      picks={picks}
      viewCount={12}
      onDismiss={noop}
    />
  );

const picksGroups: {
  side: 'today' | 'proposed';
  state: PicksState;
  title: string;
  note: string;
}[] = [
  {
    side: 'today',
    state: 'nudge',
    title: 'Today · picks not made yet',
    note: 'Production components: WeeklyPicksHeroCard (nudge) and the reminder hero.',
  },
  {
    side: 'proposed',
    state: 'nudge',
    title: 'Proposed · picks not made yet',
    note: 'The proposed reminder next to the unchanged Weekly picks card.',
  },
  {
    side: 'today',
    state: 'live',
    title: 'Today · picks are out',
    note: 'WeeklyPicksHeroCard (live) and the reminder hero.',
  },
  {
    side: 'proposed',
    state: 'live',
    title: 'Proposed · picks are out',
    note: 'The proposed reminder next to the unchanged live card.',
  },
];

export const WithWeeklyPicks: StoryObj<CaseArgs> = {
  name: 'Next to Weekly picks',
  render: ({ themes, readingHour }) => (
    <Page
      title="Next to Weekly picks"
      intro={
        <>
          From Thursday, readers whose week clears the bar also get the Weekly
          picks card (#7316). Below laptop it sits above the feed, so the two
          cards stack; on laptop both go in the strip, which splits in two. The
          Weekly picks panel is a copy of today’s reminder panel, fixed dark
          colors included, so it shares the light-theme bug and will look out of
          place next to the new reminder until it follows the same design.
        </>
      }
    >
      {picksGroups.map(({ side, state, title, note }) => (
        <Group key={`${side}-${state}`} title={title} note={note}>
          {themesOf(themes).map((theme) => (
            <DeviceRow
              key={theme}
              theme={theme}
              height={800}
              render={(isLaptop) => (
                <>
                  <PicksCard isLaptop={isLaptop} state={state} />
                  {side === 'today' && (
                    <TodayHero
                      isLaptop={isLaptop}
                      onEnable={noop}
                      onClose={noop}
                    />
                  )}
                  {side === 'proposed' &&
                    (isLaptop ? (
                      <ProposedTopHero
                        step="offer"
                        readingHour={readingHour}
                        className="order-first"
                        onClose={noop}
                      />
                    ) : (
                      <ProposedHero
                        step="offer"
                        readingHour={readingHour}
                        onClose={noop}
                      />
                    ))}
                </>
              )}
            />
          ))}
        </Group>
      ))}
    </Page>
  ),
};

// 4. Hours

const hourCases: { hour: number; note: string }[] = [
  { hour: 0, note: 'Midnight: open question, keep or move to morning?' },
  { hour: 2, note: 'Late night: open question.' },
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
      intro="The offer and the Other time choices for hours across the day, on the feed card and the laptop card. The current hour replaces the nearest preset, and each choice shows a sun or a moon."
    >
      {hourCases.map(({ hour, note }) => (
        <Group key={hour} title={`Seen at ${shortHour(hour)}`} note={note}>
          <div className="grid grid-cols-1 items-start gap-4 laptop:grid-cols-2">
            <ProposedHero step="offer" readingHour={hour} onClose={noop} />
            <ProposedHero step="picking" readingHour={hour} onClose={noop} />
            <ProposedTopHero step="offer" readingHour={hour} onClose={noop} />
            <ProposedTopHero step="picking" readingHour={hour} onClose={noop} />
          </div>
        </Group>
      ))}
    </Page>
  ),
};

// 5. Who gets what

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
    reader: 'Phone or tablet feed with other top content',
    today: 'none',
    proposed: 'none',
    note: 'Unless keepTopHero is set.',
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
                ? 'grid grid-cols-1 items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3 laptop:grid-cols-[1fr_7rem_7rem_23.4375rem]'
                : 'grid grid-cols-1 items-center gap-3 rounded-16 border border-accent-cabbage-default bg-surface-float p-3 laptop:grid-cols-[1fr_7rem_7rem_23.4375rem]'
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
              <ProposedHero
                className="!mb-0"
                step={proposed === 'paused' ? 'paused' : 'offer'}
                readingHour={readingHour}
                onClose={noop}
              />
            )}
          </div>
        ))}
      </div>
    </Page>
  ),
};

// 6. Platforms

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
