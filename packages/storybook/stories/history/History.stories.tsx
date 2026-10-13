import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { Frame, HistoryStyles } from './kit';
import { Today } from './layouts/Today';
import { Widgets } from './layouts/Widgets';
import { VideosFirst } from './layouts/VideosFirst';
import { Reader } from './layouts/Reader';

const meta: Meta = {
  title: 'History/Layouts',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

/* ------------------------------------------------------------ furniture */

/** The six gaps from the /history analysis, so each layout can cite them. */
const gaps = {
  find: 'Find a post',
  filter: 'Filters and date jump',
  privacy: 'Pause, Clear all, Undo',
  return: 'A reason to come back',
  stats: 'Reading stats',
  rows: 'Lighter rows',
} as const;

type Gap = keyof typeof gaps;

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

const Section = ({
  id,
  title,
  lead,
  children,
}: {
  id?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <section id={id} className="flex scroll-mt-6 flex-col gap-5">
    <div className="flex flex-col gap-2">
      <h2 className="font-bold typo-title1">{title}</h2>
      {lead && (
        <div className="max-w-[90ch] text-text-secondary typo-callout">
          {lead}
        </div>
      )}
    </div>
    {children}
  </section>
);

const Card = ({
  title,
  children,
  tone = 'neutral',
}: {
  title: ReactNode;
  children: ReactNode;
  tone?: 'neutral' | 'brand';
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-2 rounded-20 border p-5',
      tone === 'brand'
        ? 'border-accent-cabbage-default bg-overlay-float-cabbage'
        : 'border-border-subtlest-tertiary',
    )}
  >
    <h3 className="font-bold typo-body">{title}</h3>
    <div className="flex flex-col gap-2 text-text-secondary typo-callout">
      {children}
    </div>
  </div>
);

interface Layout {
  id: string;
  number: string;
  name: string;
  pitch: string;
  borrows: string;
  solves: Gap[];
  tradeoff: string;
  backend?: string;
  render: () => ReactNode;
}

const layouts: Layout[] = [
  {
    id: 'clean-list',
    number: '1',
    name: 'List with widgets',
    pitch:
      'The list in production’s squads discover frame (/squads/discover/<topic>): one bordered card for search, chips and the list, and a widget column beside it. The column holds your reading streak (this week as flames, longest streak, total reading days), your week in reading (totals, the last seven days as bars, and top tags and sources that filter the list), and the profile’s own Reading Overview widget, unchanged.',
    borrows: 'Squads discover topic pages, Spotify Recently played',
    solves: ['find', 'filter', 'rows', 'stats', 'return'],
    tradeoff:
      'The widget column takes 20rem from the list, and it needs the streak and the week’s totals on page load.',
    backend:
      'Search over the TLDR, tags and source (today it searches titles only).',
    render: () => <Widgets />,
  },
  {
    id: 'videos',
    number: '2',
    name: 'Videos first',
    pitch:
      'Each day opens with the videos you watched, as a row of big cards: thumbnail with its length, title and source. The day’s articles follow on the usual timeline. Search, chips and every row action stay the same.',
    borrows: 'YouTube watch history, Netflix viewing activity',
    solves: ['find', 'filter', 'rows'],
    tradeoff:
      'Videos are a small share of reads, so many days have no row and the page looks uneven. Big cards take a lot of space on days with one video.',
    render: () => <VideosFirst />,
  },
  {
    id: 'reader',
    number: '3',
    name: 'Reader pane',
    pitch:
      'A mail-style split in production’s squads discover frame, mirrored: the history in the widget column on the left, and the real post page for the selected read on the right, in its tablet layout, with upvote, downvote, copy link and ⋯ on its source line. Arrow keys move, Enter opens and Delete removes. You can tell "is this the one?" without opening five tabs.',
    borrows: 'Gmail, Linear, Readwise Reader',
    solves: ['find', 'rows', 'return'],
    tradeoff:
      'Desktop only. It’s built for people who come to find something, and they are 22% of visits. Opening a post here is a post view, so it needs its own event to keep reading stats honest.',
    render: () => <Reader />,
  },
];

const GapTags = ({ solves }: { solves: Gap[] }): ReactElement => (
  <div className="flex flex-wrap gap-1.5">
    {solves.map((gap) => (
      <span
        key={gap}
        className="rounded-8 bg-surface-float px-2 py-0.5 text-text-secondary typo-footnote"
      >
        {gaps[gap]}
      </span>
    ))}
  </div>
);

const LayoutSection = ({ layout }: { layout: Layout }): ReactElement => (
  <Section
    id={layout.id}
    title={
      <span className="flex items-baseline gap-3">
        <span className="text-text-quaternary">{layout.number}</span>
        {layout.name}
      </span>
    }
  >
    <div className="grid grid-cols-1 gap-6 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <p className="text-text-secondary typo-body">{layout.pitch}</p>
      <div className="flex flex-col gap-3 typo-footnote">
        <span className="text-text-tertiary">
          Borrows from{' '}
          <span className="text-text-secondary">{layout.borrows}</span>
        </span>
        <GapTags solves={layout.solves} />
        <span className="text-text-tertiary">
          <span className="font-bold text-text-secondary">Trade-off: </span>
          {layout.tradeoff}
        </span>
        {layout.backend && (
          <span className="text-text-tertiary">
            <span className="font-bold text-text-secondary">Backend: </span>
            {layout.backend}
          </span>
        )}
      </div>
    </div>
    <Frame>{layout.render()}</Frame>
  </Section>
);

/* ---------------------------------------------------------------- page */

const AllLayoutsPage = (): ReactElement => (
  <ExtensionProviders>
    <HistoryStyles />
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary laptop:px-10">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-16">
        <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
          <Eyebrow>History redesign · web</Eyebrow>
          <h1 className="max-w-[30ch] font-bold typo-mega3">
            Three layouts for /history
          </h1>
          <div className="flex max-w-[80ch] flex-col gap-3 text-text-secondary typo-body">
            <p>
              Today /history is a log: you scroll it, then leave. In the last 28
              days about 3.7k people opened it on desktop. Only about 22% of
              them opened a post, and search, votes and shares were close to
              unused. Each layout below takes a different answer to “what is
              this page for” and works with the same three weeks of real posts.
            </p>
            <p>
              Every frame is a 1440×900 laptop and works: search and filter, use
              a row’s actions, and remove a post and Undo. Each frame keeps its
              own state.
            </p>
          </div>
        </header>

        <Section
          title="Best practice for history pages"
          lead="What browsers, YouTube, Google and reading apps have settled on, and what it means for us."
        >
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
            <Card title="Recognition beats recall">
              <p>
                People rarely remember a title. They remember the image, the
                source, roughly when, and what it was about. Show the image and
                source first. Group by day, session or topic, so time and
                subject do the remembering.
              </p>
            </Card>
            <Card title="Search everything you have">
              <p>
                Chrome and YouTube search the full page, not just titles. Ours
                should also match the TLDR, tags and source. When the title
                isn’t what matched, say what did (“Matched in TLDR”).
              </p>
            </Card>
            <Card title="Filters for how memory works">
              <p>
                Google My Activity filters by date and product. We need the same
                kind of shortcuts: Today, This week, a tag, a source, articles
                or videos. Jumping to a date lets people say “last Tuesday” in
                one click.
              </p>
            </Card>
            <Card title="Privacy is table stakes">
              <p>
                Every browser and YouTube offers Pause, Clear all and per-item
                removal, and Google adds auto-delete. Removal is instant and
                comes with Undo, never a confirm dialog. Clear all is the only
                action that asks first.
              </p>
            </Card>
            <Card title="Rows stay quiet">
              <p>
                Instead of four always-on buttons per row, the row itself opens
                the post. Hover reveals the one or two most common actions, and
                the rest go in ⋯. State you already set (upvoted, saved) shows
                as a quiet mark, not a lit button.
              </p>
            </Card>
            <Card title="Give it a pulse">
              <p>
                Logs get visited, then left. What brings people back is what
                changed: new comments on things you read (GitHub, HN threads),
                your recent activity (Spotify), or a weekly summary (Screen
                Time).
              </p>
            </Card>
          </div>
        </Section>

        <nav className="flex flex-col gap-3">
          <Eyebrow>Jump to</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {[{ id: 'today', number: '0', name: 'Today' }, ...layouts].map(
              (layout) => (
                <a
                  key={layout.id}
                  href={`#${layout.id}`}
                  className="flex h-9 items-center gap-2 rounded-12 bg-surface-float px-3 font-bold typo-callout hover:bg-surface-hover"
                >
                  <span className="text-text-quaternary">{layout.number}</span>
                  {layout.name}
                </a>
              ),
            )}
          </div>
        </nav>

        <Section
          id="today"
          title={
            <span className="flex items-baseline gap-3">
              <span className="text-text-quaternary">0</span>
              Today (production)
            </span>
          }
          lead="For reference: the bordered 42.5rem column, a title-only search, day labels, and up, down, copy and ⋯ on every row. Static."
        >
          <Frame>
            <Today />
          </Frame>
        </Section>

        {layouts.map((layout) => (
          <LayoutSection key={layout.id} layout={layout} />
        ))}

        <Section
          title="Side by side"
          lead="Which of the six gaps from the analysis each layout covers."
        >
          <div className="overflow-x-auto rounded-20 border border-border-subtlest-tertiary">
            <table className="w-full text-left typo-callout">
              <thead>
                <tr className="border-b border-border-subtlest-tertiary text-text-tertiary typo-footnote">
                  <th className="p-3 font-bold">Layout</th>
                  {Object.values(gaps).map((label) => (
                    <th key={label} className="p-3 text-center font-bold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {layouts.map((layout) => (
                  <tr
                    key={layout.id}
                    className="border-b border-border-subtlest-quaternary last:border-0"
                  >
                    <td className="p-3 font-bold">
                      <span className="mr-2 text-text-quaternary">
                        {layout.number}
                      </span>
                      {layout.name}
                    </td>
                    {(Object.keys(gaps) as Gap[]).map((gap) => (
                      <td key={gap} className="p-3 text-center">
                        {layout.solves.includes(gap) ? (
                          <span className="text-accent-avocado-default">●</span>
                        ) : (
                          <span className="text-text-disabled">·</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Recommendation">
          <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
            <Card tone="brand" title="Ship: 1">
              <p>
                Use the list with widgets as the base, since it closes the
                privacy, row and stats gaps for little risk, in a frame the
                squads pages already ship. Videos first (2) is worth testing on
                top of it if video watching keeps growing.
              </p>
            </Card>
            <Card title="Before any of it">
              <p>
                Fix measurement: log the page view once, and add click and
                remove events with origin history. Without them, none of these
                layouts can be judged against today.
              </p>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  </ExtensionProviders>
);

export const AllLayouts: Story = {
  name: 'All layouts',
  render: () => <AllLayoutsPage />,
};

/** One layout alone, at its real 1440×900 size, for linking and demos. */
const LayoutOnly = ({ id }: { id: string }): ReactElement => {
  const layout = layouts.find((entry) => entry.id === id) as Layout;
  return (
    <ExtensionProviders>
      <HistoryStyles />
      <div className="min-h-screen bg-background-default">
        <Frame>{layout.render()}</Frame>
      </div>
    </ExtensionProviders>
  );
};

export const ListWithWidgets: Story = {
  name: '1. List with widgets',
  render: () => <LayoutOnly id="clean-list" />,
};

export const VideosFirstLayout: Story = {
  name: '2. Videos first',
  render: () => <LayoutOnly id="videos" />,
};

export const ReaderPane: Story = {
  name: '3. Reader pane',
  render: () => <LayoutOnly id="reader" />,
};
