import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Device, DevicePair } from './shell';
import { Callout, DocPage, DocSection, ProsCons } from './doc';
import { CategoryHub } from './layouts/CategoryHub';
import { bootAsAnonymous } from '../extension/_providers';

const meta: Meta = {
  title: 'Squads Discover/2. Layouts',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

const LayoutPage = ({
  eyebrow,
  title,
  intro,
  render,
  pros,
  cons,
  measure,
  packs,
  extra,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  render: () => ReactNode;
  pros: string[];
  cons: string[];
  measure: string;
  /** Where this layout carries starter packs. */
  packs?: ReactNode;
  extra?: ReactNode;
}): ReactElement => (
  <DocPage eyebrow={eyebrow} title={title} intro={intro}>
    <DocSection
      title="Desktop and phone"
      lead="One responsive component in two real viewports. Everything is interactive: join (with Undo; a joined row drops its button), and switch tabs and watch the URL."
    >
      <DevicePair render={render} />
    </DocSection>
    {packs && (
      <Callout tone="brand" title="Starter packs in this layout">
        {packs}
      </Callout>
    )}
    <ProsCons pros={pros} cons={cons} measure={measure} />
    {extra}
  </DocPage>
);

export const CategoryHubStory: Story = {
  name: 'Topic hub (chosen)',
  render: () => (
    <LayoutPage
      eyebrow="The chosen direction"
      title="Topic hub: today's tabs, a Featured mosaic, and squad-page inner pages"
      intro={
        <p>
          Today&apos;s tab bar (Discover, My Squads, Featured, then every topic)
          with no page title, search at its start and a Subtle New Squad at its
          end. Discover holds the Featured mosaic (opening on the first block
          with only the right arrow, the next block peeking and fading; a Google
          Play banner rail on phones), Trending this week in three columns, the
          starter packs and a tile per topic. Every other tab opens in the
          production squad page&apos;s frame: the same rows as Trending, with
          descriptions, in a bordered card and, from laptop, a column of
          Promoted, Starter packs and Trending widgets. Tabs and tiles switch in
          place. Try them in either frame.
        </p>
      }
      render={() => <CategoryHub />}
      packs="Their own section on Discover, between Trending and the topic tiles. On a topic, its own pack opens the list, and the Starter packs widget beside it offers the others."
      pros={[
        'All 11 topics visible at once on phones, which no other layout manages',
        'Very light first screen, and the tiles are big, easy tap targets',
        'Topic pages can carry SEO',
      ]}
      cons={[
        'Adds a tap before most squads, a poor fit for short phone visits',
        'Only Featured and Trending have joinable squads on the first phone screen',
        'The tab bar scrolls sideways on phones, so only the first few tabs show',
        'Many featured squads only have the generic banner, which the mosaic puts front and centre',
      ]}
      measure="Joins per visit and the share of visits that open a topic (tile or tab), compared with today's page and its tab use."
    />
  ),
};

interface Breakpoint {
  width: number;
  name: string;
  discover: string;
  inner: string;
}

/** Every screen in the design system, and what the topic hub does at each. */
const breakpoints: Breakpoint[] = [
  {
    width: 375,
    name: 'Base (phones)',
    discover:
      'Topic tabs as the first row, search icon first and a Subtle New Squad icon last. Featured is the Google Play banner rail, one banner and the next peeking. Trending: one column of 4. Starter packs: one column. Topic tiles: 2 across. Footer nav.',
    inner:
      'The list in one column, opened by the topic’s starter pack and then the Promoted widget’s campaign as a row. Starter packs and Trending this week close the page. No inner tabs.',
  },
  {
    width: 420,
    name: 'mobileL',
    discover: 'No change: nothing in the topic hub switches here.',
    inner: 'No change.',
  },
  {
    width: 500,
    name: 'mobileXL',
    discover: 'No change.',
    inner: 'No change.',
  },
  {
    width: 550,
    name: 'mobileXXL',
    discover: 'No change.',
    inner: 'No change.',
  },
  {
    width: 656,
    name: 'tablet',
    discover:
      'Featured switches from the banner rail to the mosaic: the big tile plus 2 small, the next block peeking and fading, swiped (no arrows). Starter packs stay one column, so their text stays on one line. Trending stays one column of 4, topic tiles stay 2 across, the footer nav stays.',
    inner:
      'The list goes to 2 columns, and Starter packs and Trending sit side by side at the end.',
  },
  {
    width: 1020,
    name: 'laptop',
    discover:
      'The v2 rail and floating card replace the footer nav, and the topic tabs move into the header strip between search and New Squad. Trending goes to 3 columns of 3, starter packs to 2, topic tiles to 4. The mosaic stays big + 2 and gains its arrows.',
    inner:
      'The production squad-page frame, 1024px wide: the list as one column inside the card and the 320px widget column beside it (Promoted, Starter packs, Trending). The topic’s own pack keeps opening the list; the Starter packs widget offers the other packs.',
  },
  {
    width: 1360,
    name: 'laptopL',
    discover:
      'The mosaic goes to the big tile plus 4 small, starter packs to 3 columns.',
    inner: 'The frame widens to 1152px and the list goes to 2 columns.',
  },
  {
    width: 1668,
    name: 'laptopXL',
    discover:
      'No layout change: every block keeps stretching with the window (see the table below).',
    inner: 'No change: the frame stays 1152px, centred, with growing margins.',
  },
  {
    width: 1976,
    name: 'desktop',
    discover: 'No layout change, more stretching.',
    inner: 'No change.',
  },
  {
    width: 2156,
    name: 'desktopL',
    discover: 'No layout change, more stretching.',
    inner: 'No change.',
  },
];

const frameHeight = (width: number): number => {
  if (width < 656) {
    return 812;
  }
  return width < 1020 ? 1024 : 1000;
};

/** One breakpoint: Discover and an inner page, side by side until laptop. */
const BreakpointFrames = ({ width }: { width: number }): ReactElement => {
  const wide = width >= 1020;
  const height = frameHeight(width);
  return (
    <div
      className={
        wide ? 'flex flex-col gap-6' : 'flex flex-wrap items-start gap-6'
      }
    >
      <Device fit={wide} width={width} height={height} label="Discover">
        <CategoryHub />
      </Device>
      <Device fit={wide} width={width} height={height} label="Inner page · AI">
        <CategoryHub initialCategory="ai" />
      </Device>
    </div>
  );
};

const breakpointRows: ReactNode[][] = [
  ['1020', '870', '500×416', '242×200 (2 per block)', '269', '196'],
  ['1280', '1130', '673×416', '329×200 (2 per block)', '355', '261'],
  ['1440', '1290', '581×416', '283×200', '409', '301'],
  ['1680', '1530', '701×416', '343×200', '489', '361'],
  ['1920', '1770', '821×416', '403×200', '569', '421'],
  ['2560', '2410', '1141×416', '563×200', '782', '581'],
];

export const InnerPageStory: Story = {
  name: 'Topic hub · inner page',
  render: () => (
    <DocPage
      eyebrow="The chosen direction"
      title="Inner page: a topic in the squad page's frame"
      intro={
        <p>
          What every tab other than Discover opens, here on AI. The production
          squad page&apos;s frame: the topic&apos;s own starter pack opening the
          list, Verified Company Squads under their label, then More in AI with
          the promoted Squad in the second slot, in the same rows as Trending
          (Join on the right, the description under members and handle) in a
          bordered card. From laptop, the Promoted, Starter packs (the other
          packs) and Trending this week widgets sit beside it. Phones get the
          list alone. Switch tabs to see Featured or My Squads in the same
          frame.
        </p>
      }
    >
      <DocSection title="Desktop and phone">
        <DevicePair render={() => <CategoryHub initialCategory="ai" />} />
      </DocSection>
    </DocPage>
  ),
};

export const LoggedOutStory: Story = {
  name: 'Topic hub · logged out',
  beforeEach: () => {
    bootAsAnonymous();
  },
  render: () => (
    <DocPage
      eyebrow="The chosen direction"
      title="Topic hub for a logged-out visitor"
      intro={
        <p>
          What a logged-out visitor sees. As in production: no My Squads tab,
          nothing joined, and the sign-up banner (PublicPageSignupBanner) pinned
          to the bottom of the window from laptop, with room left so the last
          row still scrolls clear of it. Phones get no banner.
        </p>
      }
    >
      <DocSection title="Desktop and phone">
        <DevicePair joined={[]} render={() => <CategoryHub loggedOut />} />
      </DocSection>
      <DocSection
        title="Tablet"
        lead="As in production: the icon rail, the tabs without My Squads, and no sign-up prompt at any point on the page. The banner is laptop only and the phone's Log in and Open app sit in the phone block."
      >
        <Device fit width={820} height={1000} label="Tablet · 820" joined={[]}>
          <CategoryHub loggedOut />
        </Device>
      </DocSection>
    </DocPage>
  ),
};

export const BreakpointsStory: Story = {
  name: 'Topic hub · Breakpoints',
  render: () => (
    <DocPage
      eyebrow="Topic hub · Breakpoints"
      title="The topic hub at every breakpoint"
      intro={
        <p>
          Every breakpoint in the design system, from a 375px phone to desktopL,
          each with the Discover tab and an inner page (AI). Every frame is the
          real viewport, scaled to fit on the wide ones, so the app&apos;s own
          breakpoints apply.
        </p>
      }
    >
      <DocSection
        title="What changes where"
        lead="The topic hub only switches at tablet, laptop and laptopL. The mobile steps change nothing, and from laptopXL up the Discover tab just stretches while the inner page stays capped."
      >
        <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
          <table className="w-full min-w-[56rem] text-left typo-callout">
            <thead className="bg-surface-float text-text-tertiary typo-footnote">
              <tr>
                {['Breakpoint', 'From', 'Discover tab', 'Inner page'].map(
                  (cell) => (
                    <th key={cell} className="px-4 py-2 font-bold">
                      {cell}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtlest-quaternary">
              {breakpoints.map((point) => (
                <tr key={point.width} className="align-top">
                  <td className="px-4 py-3 font-bold">{point.name}</td>
                  <td className="sd-nums px-4 py-3 text-text-secondary">
                    {point.width === 375 ? '0' : point.width}px
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {point.discover}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {point.inner}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>
      <DocSection
        title="What stretches"
        lead="Measured in the frames below. Every block grows with the window: the mosaic's height is fixed, so its tiles get wider and flatter, and list rows put more empty space between a name and its Join."
      >
        <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
          <table className="w-full min-w-[48rem] text-left typo-callout">
            <thead className="bg-surface-float text-text-tertiary typo-footnote">
              <tr>
                {[
                  'Window',
                  'Content width',
                  'Big tile',
                  'Small tile',
                  'Trending / pack column',
                  'Topic tile width',
                ].map((cell) => (
                  <th key={cell} className="px-4 py-2 font-bold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="sd-nums divide-y divide-border-subtlest-quaternary">
              {breakpointRows.map((row) => (
                <tr key={String(row[0])}>
                  {row.map((cell, index) => (
                    <td
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      className={
                        index === 0
                          ? 'px-4 py-2 font-bold'
                          : 'px-4 py-2 text-text-secondary'
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
          <Callout title="Option 1 · Cap the page">
            A max width for the content (around 1360px, centred) from laptopL
            up. Everything stays as it looks at 1440; wider windows get margins.
            Simplest, and the same idea as a reading column.
          </Callout>
          <Callout title="Option 2 · Add columns">
            Keep it full width but add columns as it grows: Trending and packs
            go to 4 at laptopXL, topic tiles to 6, the mosaic to two blocks side
            by side. Uses the space, more to design and QA.
          </Callout>
          <Callout title="Option 3 · Both">
            More columns at laptopXL (1668+), then cap at around 1920 so a 1440p
            monitor does not get 780px-wide rows.
          </Callout>
        </div>
        <Callout title="At the small end (1020–1359)">
          Below 1360px the mosaic already drops to two small tiles per block, so
          names have room. Trending is the remaining squeeze there: it could
          drop to 2 columns below laptopL.
        </Callout>
      </DocSection>
      {breakpoints.map((point) => (
        <DocSection
          key={point.width}
          title={`${point.name} · ${point.width}px`}
          lead={`Discover: ${point.discover} Inner page: ${point.inner}`}
        >
          <BreakpointFrames width={point.width} />
        </DocSection>
      ))}
    </DocPage>
  ),
};
