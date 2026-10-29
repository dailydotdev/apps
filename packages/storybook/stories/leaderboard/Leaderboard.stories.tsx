import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders from '../extension/_providers';
import { Bullets, Callout, DesktopFrame, Eyebrow } from './kit';
import { Today } from './layouts1';
import { Circles } from './layouts2';
import {
  SingleScroll,
  SingleScrollFull,
  SingleScrollWithWidgets,
} from './layouts4';
import { SidebarCircles, ToolbarFilters } from './layouts5';

const meta: Meta = {
  title: 'Leaderboard/Redesign',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

/** The gaps the page analysis found, so each layout says which it closes. */
enum Gap {
  Time = 'Time filter',
  Labels = 'Units and ranks 1–10',
  Climb = 'How to climb',
  You = 'Your rank up top',
  Return = 'Reason to return or share',
  Circles = 'Personal filters',
  Profiles = 'Faster profile browsing',
  Newcomers = 'A shot for newcomers',
}

const GAPS = Object.values(Gap);

interface Layout {
  id: string;
  /** Replaces "Layout N" above the name. */
  eyebrow?: string;
  name: string;
  pitch: string;
  render: () => ReactNode;
  height?: number;
  /** Off when the layout brings its own header row. */
  search?: boolean;
  closes: Gap[];
  pros: string[];
  cons: string[];
  measure: string;
  inspiredBy: string;
}

// Every layout labels units and numbers ranks 1–10; it's table stakes.
const LAYOUTS: Layout[] = [
  {
    id: 'circles',
    eyebrow: 'Where we are: Circles',
    name: 'Circles',
    pitch:
      'Pick who you compare with: everyone, the people you follow, your company, your country or a squad. Smaller circles turn "#4,000" into "#3 of 12", and an invite card grows the circle.',
    render: () => <Circles />,
    height: 1060,
    closes: [Gap.Time, Gap.Labels, Gap.You, Gap.Circles, Gap.Return],
    pros: [
      'The most personal: competing with people you know works best',
      'Company and squad boards give teams and squad admins a reason to rally',
      'Natural home for referrals',
    ],
    cons: [
      'Empty for readers who follow nobody, so it needs a good empty state',
      'Company boards rely on verified work emails',
    ],
    measure:
      'Follows and invites per visit; return visits from readers with a non-global circle.',
    inspiredBy: 'Strava clubs and Peloton friend boards',
  },
  {
    id: 'circles-toolbar',
    eyebrow: 'Circles filters · 1',
    name: 'One toolbar row',
    pitch:
      'Scope and board become two dropdowns side by side, with the time switch at the far end of the same row. The scope menu lists every circle with its size and your rank in it.',
    render: () => <ToolbarFilters />,
    height: 900,
    closes: [Gap.Time, Gap.Labels, Gap.You, Gap.Circles],
    pros: [
      'The most compact and conventional option',
      'One row for all three filters, so the list starts higher',
      'Menus have room for counts and your rank',
    ],
    cons: [
      'Choices are hidden in menus',
      'Nothing visual makes a circle feel personal',
    ],
    measure: 'Time to first filter change and circle switches per visit.',
    inspiredBy: 'Analytics dashboards (GitHub Insights, Vercel)',
  },
  {
    id: 'circles-sidebar',
    eyebrow: 'Circles filters · 2',
    name: 'Circles in a side list',
    pitch:
      'Circles move to a vertical list on the left, each with its size and your rank in it, so you can see at a glance where you do best. Board and time sit as small controls above the list. Adding a squad is the last item.',
    render: () => <SidebarCircles />,
    height: 900,
    closes: [Gap.Time, Gap.Labels, Gap.You, Gap.Circles],
    pros: [
      'Your rank in every circle is visible at once, which is a reason to click',
      'Scales to many squads without scrolling sideways',
      'Board and time stay small and out of the way',
    ],
    cons: [
      'Three columns (circles, list, widgets) on one screen',
      'The circle list repeats on every visit even if you never change it',
    ],
    measure: 'Circle switches and squad adds per visit.',
    inspiredBy: 'Slack and Discord channel lists',
  },
  {
    id: 'single-scroll',
    eyebrow: 'Option B',
    name: 'A single scroll with sections, no tabs',
    pitch:
      'The page reads top to bottom, each section answering one question: You (rank, change, one next step), Around you (two above and below in your circle), Leaders this week (top 10), Standouts worth a follow, and Every leaderboard: all 8 categories from today’s page with the top 3 and your position, under one This week / All time switch. Circle and board are shown by the sections, not picked with controls.',
    render: () => <SingleScroll />,
    height: 2040,
    closes: [
      Gap.Time,
      Gap.Labels,
      Gap.Climb,
      Gap.You,
      Gap.Circles,
      Gap.Profiles,
      Gap.Newcomers,
    ],
    pros: [
      'Zero navigation: the first screen answers “where do I stand” and “who’s ahead”',
      'Keeps everything we validated: you, neighbors, leaders, standouts',
      'Works for the loyal group that checks in every few days',
    ],
    cons: [
      'A longer page',
      'Less control for people who want one specific board',
    ],
    measure:
      'Next-step clicks, follows from Around you and Standouts, and return visits within 7 days.',
    inspiredBy: 'Duolingo’s league screen and Strava’s weekly summary',
  },
  {
    id: 'single-scroll-widgets',
    eyebrow: 'Option B + widgets',
    name: 'Option B with the team widgets beside it',
    pitch:
      'The same single scroll, with a column beside it for the two widgets from Circles: Bring your team (with the referral ladder line) and Post this board to Slack (the weekly team digest). The column stays in view while you scroll, so the main flow is untouched.',
    render: () => <SingleScrollWithWidgets />,
    height: 2040,
    closes: [
      Gap.Time,
      Gap.Labels,
      Gap.Climb,
      Gap.You,
      Gap.Return,
      Gap.Circles,
      Gap.Profiles,
      Gap.Newcomers,
    ],
    pros: [
      'Everything Option B does, plus two growth loops: invites and the Slack digest',
      'The widgets sit next to the content they’re about (your circle, your team) without interrupting it',
      'Both widgets already exist in production or are in review',
    ],
    cons: [
      'A second column makes the page a little busier',
      'The Slack widget only makes sense for people with a company and a connected workspace',
    ],
    measure:
      'Invite link copies and digests added per visit, on top of Option B’s metrics.',
    inspiredBy: 'Option B and the Circles widgets',
  },
  {
    id: 'single-scroll-full',
    eyebrow: 'Option B · full width',
    name: 'Option B across the full page, like the squads directory',
    pitch:
      'The same sections as Option B on the squads directory’s full-width frame. The first row is two compact action cards: your rank with Snapshot, and Invite a friend for Plus. Each says the action and what it gets you, and ends on one button. Leaders this week runs in three columns like Popular Squads, Standouts is one row of small cards, and Every leaderboard goes four across.',
    render: () => <SingleScrollFull />,
    height: 1300,
    closes: [
      Gap.Time,
      Gap.Labels,
      Gap.Climb,
      Gap.You,
      Gap.Return,
      Gap.Circles,
      Gap.Profiles,
      Gap.Newcomers,
    ],
    pros: [
      'Matches the squads directory, so Explore feels like one product',
      'Uses the width: your rank and the Plus invite in the first screen',
      'Every leaderboard fits in two rows of four',
      'The invite sits in the first screen, next to your rank',
    ],
    cons: [
      'Wide rows are harder to scan than one column on large screens',
      'More content in the first screen than the narrow version',
    ],
    measure:
      'Same metrics as Option B, plus invite copies from the first row.',
    inspiredBy: 'The squads directory’s Discover page (#6843)',
  },
];

interface Borrowed {
  feature: string;
  prs: number[];
  where: string;
  layouts: string[];
}

const pr = (number: number): string =>
  `https://github.com/dailydotdev/apps/pull/${number}`;

// Recent work this page reuses, so each piece ships on something real.
const BORROWED: Borrowed[] = [
  {
    feature: 'Share your rank',
    prs: [6778, 6761, 6792],
    where:
      'The snapshot share panel (Slack, copy link, save image) with a rank card that has a public, verifiable page like creator achievements.',
    layouts: ['board-browser', 'you-hub', 'hub'],
  },
  {
    feature: 'Replay',
    prs: [6812],
    where:
      'Leaderboard moves become a Replay card ("You climbed 14 places"), and the page links to this week’s deck.',
    layouts: ['you-hub', 'this-week', 'hub'],
  },
  {
    feature: 'Quests',
    prs: [6847, 6774],
    where:
      'Next steps carry XP, and a weekly "Climb one spot" quest sits under your rank.',
    layouts: ['board-browser', 'you-hub', 'hub'],
  },
  {
    feature: 'Referral ladder',
    prs: [6750],
    where:
      'The referrals board shows the ladder: "1 more friend unlocks 3 months of Plus". Eligible users only.',
    layouts: ['board-browser', 'you-hub', 'circles', 'hub'],
  },
  {
    feature: 'Slack team digest',
    prs: [6762],
    where:
      'The company circle offers to post its top readers to the team’s channel every Monday, with team stats.',
    layouts: ['circles', 'hub'],
  },
  {
    feature: 'Verified company squads',
    prs: [6795, 6740],
    where:
      'Companies with a Verified Company Squad get the seal, their brand color and an Open squad button.',
    layouts: ['circles', 'compact-grid', 'hub'],
  },
  {
    feature: 'Plugin makers board',
    prs: [6848],
    where: 'A new board from marketplace plugin upvotes, marked New.',
    layouts: ['board-browser', 'compact-grid', 'hub'],
  },
];

/* --------------------------------------------------------------- furniture */

const GapPill = ({ gap, on }: { gap: Gap; on: boolean }): ReactElement => (
  <span
    className={classNames(
      'rounded-8 px-2 py-0.5 typo-caption1',
      on
        ? 'bg-accent-avocado-flat font-bold text-accent-avocado-default'
        : 'bg-surface-float text-text-quaternary line-through',
    )}
  >
    {gap}
  </span>
);

const LayoutSection = ({
  index,
  layout,
}: {
  index: number;
  layout: Layout;
}): ReactElement => (
  <section id={layout.id} className="flex flex-col gap-5 scroll-mt-6">
    <div className="flex flex-col gap-2">
      <Eyebrow>{layout.eyebrow ?? `Layout ${index}`}</Eyebrow>
      <h2 className="font-bold typo-title1">{layout.name}</h2>
      <p className="max-w-[90ch] text-text-secondary typo-body">
        {layout.pitch}
      </p>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {GAPS.map((gap) => (
          <GapPill key={gap} gap={gap} on={layout.closes.includes(gap)} />
        ))}
      </div>
    </div>
    <DesktopFrame height={layout.height} search={layout.search}>
      {layout.render()}
    </DesktopFrame>
    <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
      <Callout tone="good" title="Why it could win">
        <Bullets items={layout.pros} />
      </Callout>
      <Callout tone="bad" title="What it costs">
        <Bullets items={layout.cons} />
      </Callout>
      <Callout title="What would prove it">
        <p>{layout.measure}</p>
        <p className="pt-2 text-text-quaternary typo-footnote">
          Inspired by {layout.inspiredBy}
        </p>
      </Callout>
    </div>
  </section>
);

const Fact = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-4">
    <span className="font-bold typo-title1">{value}</span>
    <span className="text-text-secondary typo-callout">{label}</span>
  </div>
);

const AllLayouts = (): ReactElement => (
  <ExtensionProviders>
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary laptop:px-10">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-14">
        <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-10">
          <Eyebrow>Leaderboard redesign · web</Eyebrow>
          <h1 className="max-w-[30ch] font-bold typo-mega3">
            Simpler ways to arrange the leaderboard
          </h1>
          <div className="flex max-w-[85ch] flex-col gap-3 text-text-secondary typo-body">
            <p>
              Today the page is 9 all-time top-10 lists in a 2-column grid. The
              same people top every list, scores have no units, ranks 4–10 have
              no number, and nothing tells you how to climb. Below is Circles,
              two ways to control its filters, then Option B and Option B with
              widgets. Each is a 1440×900 desktop window with mock data, and
              everything is clickable.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 laptop:grid-cols-4">
            <Fact value="~94%" label="of visitors are logged in" />
            <Fact value="64%" label="of views lead straight to a profile" />
            <Fact value="2–3%" label="of views open a top-100 list" />
            <Fact value="7 vs 4" label="views per user, mobile vs desktop" />
          </div>
          <nav className="flex flex-wrap gap-2 pt-2">
            {LAYOUTS.map((layout, index) => (
              <a
                key={layout.id}
                href={`#${layout.id}`}
                className="rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 font-bold text-text-secondary typo-footnote hover:text-text-primary"
              >
                {index + 1}. {layout.name}
              </a>
            ))}
          </nav>
        </header>

        <section className="flex flex-col gap-5">
          <h2 className="font-bold typo-title1">What good leaderboards do</h2>
          <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
            <Callout title="Show people they can win">
              Absolute all-time boards reward seniority. Weekly resets
              (Duolingo, GitHub trending) and relative boards that show your
              near neighbors give everyone a goal they can reach. Studies in
              learning settings found relative boards felt less like peer
              pressure and, in one study, raised engagement.
            </Callout>
            <Callout title="Pair the big board with a personal one">
              Keep a global hall of fame for status, and add a smaller, personal
              board (around you, your follows, your company, your squad) for
              motivation. Hide or soften the bottom of the table.
            </Callout>
            <Callout title="Turn every number into a next step">
              Label what each score counts, say how it is earned, and show the
              exact gap to the next spot with a button that helps close it. A
              rank without a way to improve it doesn’t change behavior.
            </Callout>
            <Callout title="Give a reason to come back">
              A visible deadline (resets Monday), change since last week, and
              moments worth sharing (podium, rank card, climber of the week).
            </Callout>
            <Callout title="Serve what people already do">
              Here that is browsing profiles. Hover cards and follow buttons on
              rows cut the open-and-come-back trip.
            </Callout>
            <Callout title="Celebrate newcomers on purpose">
              Newcomer spotlights put fresh faces in front of millions of
              developers, which is good for them and for the feed.
            </Callout>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="font-bold typo-title1">Built from recent work</h2>
          <p className="max-w-[90ch] text-text-secondary typo-body">
            These pieces come from features we shipped or are shipping. Each one
            is already in Circles below.
          </p>
          <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full typo-callout">
              <thead className="bg-background-subtle text-left text-text-tertiary typo-footnote">
                <tr>
                  <th className="px-4 py-2">Feature</th>
                  <th className="px-4 py-2">PRs</th>
                  <th className="px-4 py-2">On this page</th>
                  <th className="px-4 py-2">Layouts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtlest-tertiary">
                {BORROWED.filter((item) =>
                  item.layouts.some((id) =>
                    LAYOUTS.some((layout) => layout.id === id),
                  ),
                ).map((item) => (
                  <tr key={item.feature} className="align-top">
                    <td className="px-4 py-3 font-bold">{item.feature}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {item.prs.map((number, index) => (
                        <React.Fragment key={number}>
                          {index > 0 && ', '}
                          <a
                            href={pr(number)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-text-link hover:underline"
                          >
                            #{number}
                          </a>
                        </React.Fragment>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {item.where}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {item.layouts
                        .filter((id) =>
                          LAYOUTS.some((layout) => layout.id === id),
                        )
                        .map((id, index) => (
                          <React.Fragment key={id}>
                            {index > 0 && ', '}
                            <a href={`#${id}`} className="hover:underline">
                              {LAYOUTS.findIndex((layout) => layout.id === id) +
                                1}
                            </a>
                          </React.Fragment>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="font-bold typo-title1">Baseline: today’s page</h2>
          <p className="max-w-[90ch] text-text-secondary typo-body">
            Built from the production <code>UserTopList</code> with the same
            mock developers, so the comparison is fair.
          </p>
          <DesktopFrame>
            <Today />
          </DesktopFrame>
          <Callout title="Everything you can do on today’s page is kept">
            <Bullets
              items={[
                'Search people: the search field in the header.',
                'Open a profile: every row opens it, and hovering shows a profile card (today a tooltip) with level, reputation and Follow.',
                'Full numbers: hover an abbreviated score like 45.8K to see 45,812, as today’s tooltip does.',
                'Top 100 for each board: Show the top 100 under the list.',
                'Your position when you’re outside the top 10: pinned on every board instead of a row at the bottom.',
                'Medals for the top 3, with the same hover sparkle (the production badge).',
                'Level badge on the Highest level board.',
                'Hot takes are gone: #6877 removed them from /users and the rest of the app.',
                'Companies by verified employees, now with the count shown.',
                'Logged-out sign up: still needed. Circles assumes a logged-in reader, so logged-out visitors get the Everyone circle and a slim sign-up bar.',
              ]}
            />
          </Callout>
        </section>

        {LAYOUTS.map((layout, index) => (
          <LayoutSection key={layout.id} index={index + 1} layout={layout} />
        ))}
      </div>
    </div>
  </ExtensionProviders>
);

export const Layouts: Story = {
  name: 'All layouts',
  render: () => <AllLayouts />,
};
