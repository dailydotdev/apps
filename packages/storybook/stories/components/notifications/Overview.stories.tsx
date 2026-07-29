import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders from '../../extension/_providers';

// Landing page for the notifications readability audit. Collects every
// notification surface in one folder and calls out the concrete levers to pull
// on each one, so improving readability is a guided pass rather than a hunt.

const meta: Meta = {
  title: 'Components/Notifications/Overview',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Start here. A map of every notification surface, where it lives in the codebase, and the specific readability levers to review on each.',
      },
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

type Story = StoryObj;

interface SurfaceRow {
  story: string;
  surface: string;
  source: string;
  levers: string[];
}

const surfaces: SurfaceRow[] = [
  {
    story: 'Bell & badge',
    surface: 'Header / rail bell + unread count Bubble',
    source: 'shared/components/notifications/NotificationsBell.tsx',
    levers: [
      'Badge contrast (white on cabbage) against the bell',
      'Badge offset / size — does it clip the bell glyph?',
      'The "20+" cap (getUnreadText) — is the threshold right?',
      'Rail "Alerts" label legibility at caption2',
    ],
  },
  {
    story: 'Icons & badges',
    surface: 'Lead type icons + category badges',
    source: 'shared/components/notifications/NotificationIcon.tsx + utils.ts',
    levers: [
      'Glyph contrast inside the rounded surface-float chip',
      'Category badge color per food token (avocado / cabbage / blueCheese / onion / cheese / bun)',
      'White glyph legibility at XXSmall on the colored badge',
      'Which types deserve a badge vs. fall into "Updates"',
    ],
  },
  {
    story: 'List item — all types',
    surface: 'A single feed row (NotificationItem)',
    source: 'shared/components/notifications/NotificationItem.tsx',
    levers: [
      'Title weight/size (bold typo-callout) vs. 2-line clamp',
      'Meta line: time + description at typo-footnote text-tertiary — is it readable?',
      'When description AND post title both show — is the hierarchy clear?',
      'Unread state (bg-surface-float) — is it distinct enough?',
      'Avatar + corner badge + attachment alignment down the column',
    ],
  },
  {
    story: 'Full page',
    surface: 'The /notifications page',
    source: 'webapp/components/notifications/NotificationsFeed.tsx',
    levers: [
      'Time-group headers (Today / This week / …) at typo-footnote text-tertiary',
      'Filter tabs density and active underline',
      'Row-to-row rhythm and divider treatment',
      'Empty-state copy per filter',
    ],
  },
  {
    story: 'In-app popup',
    surface: 'Real-time push-style popup',
    source: 'shared/components/notifications/InAppNotificationItem.tsx',
    levers: [
      'Title contrast on the accent-pepper-subtler card',
      '3-line clamp — where do long titles get cut?',
      'Icon + avatar lockup spacing',
    ],
  },
  {
    story: 'Toast (live)',
    surface: 'Transient app toast',
    source: 'shared/components/notifications/Toast.tsx',
    levers: [
      'Inverting chip — text/icon resolve against the chip, not the page',
      'Status icon color vibrance per variant',
      'Action button + dismiss ring legibility',
    ],
  },
];

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-6 bg-surface-float px-1.5 py-0.5 font-mono text-text-secondary typo-caption2">
    {children}
  </span>
);

const NotificationsOverview = (): React.ReactElement => (
  <div className="mx-auto max-w-[56rem] p-8 text-text-primary">
    <h1 className="font-bold typo-title1">Notifications — readability audit</h1>
    <p className="mt-3 max-w-[44rem] text-text-secondary typo-body">
      Every notification surface, collected in one folder. The feedback is that
      notifications aren&apos;t readable enough — so each story below isolates a
      surface and lists the concrete levers to tune. Toggle the Storybook theme
      (light / dark) on each to check contrast both ways. Work top to bottom.
    </p>

    <div className="mt-8 flex flex-col gap-4">
      {surfaces.map((row, index) => (
        <section
          key={row.story}
          className="rounded-16 border border-border-subtlest-tertiary p-5"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-bold text-text-tertiary typo-footnote">
              {index + 1}.
            </span>
            <h2 className="font-bold typo-title3">{row.surface}</h2>
          </div>
          <p className="mt-1 text-text-tertiary typo-footnote">
            Story:{' '}
            <span className="text-text-secondary">
              Notifications / {row.story}
            </span>{' '}
            · <Pill>{row.source}</Pill>
          </p>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
            {row.levers.map((lever) => (
              <li key={lever}>{lever}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>

    <section className="mt-8 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
      <h2 className="font-bold typo-title3">Shared readability levers</h2>
      <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
        <li>
          Type scale: titles use <Pill>typo-callout</Pill> bold; meta uses{' '}
          <Pill>typo-footnote</Pill>. Most &quot;hard to read&quot; reports trace
          back to the footnote meta line at <Pill>text-tertiary</Pill> /{' '}
          <Pill>text-quaternary</Pill>.
        </li>
        <li>
          Color tokens only (<Pill>text-primary</Pill>,{' '}
          <Pill>text-secondary</Pill>, …) — no raw colors (ESLint{' '}
          <Pill>no-custom-color</Pill>).
        </li>
        <li>
          Check both themes and the mobile viewport — the kebab menu and badge
          offsets differ on mobile.
        </li>
      </ul>
    </section>
  </div>
);

export const Start: Story = {
  name: 'Start here',
  render: () => <NotificationsOverview />,
};
