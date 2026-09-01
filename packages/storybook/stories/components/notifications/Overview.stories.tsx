import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders from '../../extension/_providers';

// Landing page for the notification surfaces: the layout rules the feed row
// now follows, then a map of every surface and what to check on each.

const meta: Meta = {
  title: 'Components/Notifications/Overview',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Start here. The layout rules a notification row follows, a map of every notification surface and where it lives, and the known gaps between them.',
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
      'Which line leads — headline on a post arrival, actor sentence otherwise (see "Row anatomy")',
      'Where the timestamp lands: it follows the last grey line, or stands alone when there is none',
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
      'KNOWN GAP: renders the title only — no headline, no post, no time. A post arrival still reads "New post in <source>" here while the feed row leads with the headline.',
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
    <h1 className="font-bold typo-title1">Notifications</h1>
    <p className="mt-3 max-w-[44rem] text-text-secondary typo-body">
      Every notification surface, collected in one folder. The row rules are
      below; each story then isolates a surface and lists what to check on it.
      Toggle the Storybook theme (light / dark) on each to check contrast both
      ways.
    </p>

    <section className="mt-6 rounded-16 border border-border-subtlest-tertiary p-5">
      <h2 className="font-bold typo-title3">The row rules</h2>
      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-text-secondary typo-callout">
        <li>
          <b>Two genres.</b> A <i>content arrival</i> (SourcePostAdded,
          SquadPostAdded, UserPostAdded) makes the article headline the payload
          — the sentence announcing it is boilerplate that repeats on every row.
          A <i>social</i> row makes the person the payload. The row leads with
          whichever it is.
        </li>
        <li>
          <b>Attribution comes from the avatars, not the copy.</b> A content
          arrival shows <Pill>The New Stack</Pill> or <Pill>Luffy in AI</Pill>{' '}
          under the headline — never &quot;New post in …&quot;, which carries no
          information inside the notifications inbox.
        </li>
        <li>
          <b>The timestamp follows the last grey line</b> —{' '}
          <Pill>The New Stack · 3h</Pill>,{' '}
          <Pill>Scaling our cache layer · 5h</Pill>. A row with no grey text at
          all gets it on a line of its own. It never rides the leading line.
        </li>
      </ol>
      <p className="mt-3 text-text-tertiary typo-footnote">
        Live examples of all four shapes: Notifications / List item — all types
        / Row anatomy.
      </p>
    </section>

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
          Type scale: the leading line uses <Pill>typo-callout</Pill>; grey
          lines use <Pill>typo-subhead</Pill> / <Pill>typo-footnote</Pill> at{' '}
          <Pill>text-tertiary</Pill>. The original &quot;hard to read&quot;
          report was not about contrast — it was the headline sitting in the
          grey tier while boilerplate held the primary one.
        </li>
        <li>
          A line the timestamp rides must be a single-line <Pill>truncate</Pill>{' '}
          flex row with the time as a sibling. <Pill>multi-truncate</Pill> is{' '}
          <Pill>display: -webkit-box</Pill> and blockifies as a flex item,
          losing its clamp and width; a global{' '}
          <Pill>
            * {'{'} flex-shrink: 0 {'}'}
          </Pill>{' '}
          means the text must opt back into shrinking or it overflows the row.
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
