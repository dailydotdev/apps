import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { KitStyles, Viewer } from './kit';
import { Kit2Styles } from './kit2';
import { V1Modules } from './V1Modules';
import { V2Bento } from './V2Bento';
import { V3Focus } from './V3Focus';
import { V4Shelf } from './V4Shelf';
import { V5Console } from './V5Console';

const meta: Meta = {
  title: 'Squad Page/2. Round two, one page',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

/* ------------------------------------------------------------ furniture */

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-default px-8 pb-24 pt-10 text-text-primary">
    <KitStyles />
    <Kit2Styles />
    <div className="mx-auto flex w-full max-w-[82rem] flex-col gap-14">
      {children}
    </div>
  </div>
);

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

const Prose = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex max-w-[76ch] flex-col gap-3 text-text-secondary typo-body">
    {children}
  </div>
);

const Variant = ({
  number,
  title,
  idea,
  clever,
  customize,
  risk,
  children,
}: {
  number: string;
  title: string;
  idea: string;
  clever: string;
  customize: string;
  risk: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-6">
    <div className="grid gap-8" style={{ gridTemplateColumns: '22rem 1fr' }}>
      <div className="flex flex-col gap-2">
        <Eyebrow>Variant {number}</Eyebrow>
        <h2 className="font-bold typo-mega3">{title}</h2>
        <p className="text-text-tertiary typo-callout">{idea}</p>
      </div>
      <dl className="grid grid-cols-3 gap-x-8 gap-y-4 typo-callout">
        {[
          ['The clever bit', clever],
          ['Where the owner customises', customize],
          ['Watch out for', risk],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="font-bold text-text-primary typo-footnote">
              {label}
            </dt>
            <dd className="text-text-secondary">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </section>
);

const Caption = ({ children }: { children: ReactNode }): ReactElement => (
  <p className="text-text-quaternary typo-footnote">{children}</p>
);

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full min-w-[60rem] border-collapse text-left">
      <thead>
        <tr className="bg-surface-float">
          {head.map((cell) => (
            <th
              key={cell}
              className="px-4 py-3 font-bold text-text-secondary typo-caption1"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={rowIndex}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className={classNames(
                  'px-4 py-3 typo-footnote',
                  cellIndex === 0
                    ? 'whitespace-nowrap font-bold text-text-primary'
                    : 'text-text-tertiary',
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* --------------------------------------------------------------- stories */

export const Overview: StoryObj = {
  render: () => (
    <Page>
      <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-10">
        <Eyebrow>Squad page · Round two</Eyebrow>
        <h1 className="max-w-[24ch] font-bold typo-giga3">
          One page. Everything visible. Tiles the owner arranges.
        </h1>
        <Prose>
          <p>
            Round one was judged: the banner with the overlapping avatar reads
            as Facebook, the two-column rail read as messy, the timeline is not
            our product, and the hub had the structure but not the voice. The
            brief for this round is X and Reddit&apos;s simplicity with
            WHOOP&apos;s idea of a community page: a set of tiles the owner
            orders by priority, where each tile is a doorway, not a destination.
          </p>
          <p>
            So every variant here shares four decisions. No banner: the cover
            becomes an ambient glow, so the brand is light on the page rather
            than a billboard. The identity is one row. The tiles are one uniform
            component (icon, title, at most three rows, opens on click) and an
            admin can drag them, hide them, and add more. And nothing is behind
            a tab: posts and everything about the squad are on the same screen.
          </p>
          <p className="text-text-quaternary typo-callout">
            Same real squad and production cards as round one. Verified mark,
            links, company facts, stack, roles, the weekly leaderboard and the
            activity pulse are illustrative. Switch any variant&apos;s story to
            the Admin viewer to see the customise state.
          </p>
        </Prose>
      </header>

      <Variant
        number="1"
        title="Modules"
        idea="The WHOOP reading, straight. A single column of posts and a column of tiles the owner orders."
        clever="Tiles are one component, so a leaderboard and a job listing sit next to each other without the page looking assembled from parts. Numbers stay out of the header."
        customize="Drag to reorder, hide from the tile menu, add from a menu of modules: leaderboard, events, poll, newsletter, Slack, roles, custom link."
        risk="It is quiet. If the company wants a billboard, this is not it."
      >
        <V1Modules />
        <Caption>
          Admin view: drag handles on hover and the add-a-module tile.
        </Caption>
        <V1Modules viewer={Viewer.Admin} />
      </Variant>

      <Variant
        number="2"
        title="Bento"
        idea="The tiles are the header. The identity is the largest tile, the cover lives inside it, and the feed runs full width beneath."
        clever="The cover comes back, but inside a tile, so it is part of the grid rather than a banner over it. Members and Activity read like WHOOP dials: one big number each."
        customize="Every tile in the bento except identity can be swapped, moved or hidden. The grid keeps its shape."
        risk="It reads as a dashboard. Small squads with nothing to fill the tiles will look thin."
      >
        <V2Bento />
      </Variant>

      <Variant
        number="3"
        title="Focus"
        idea="X. One column of posts with a composer in the first seat, the identity as a sticky bar that stays while you scroll, and a right column of hairlines instead of cards."
        clever="The identity never leaves the screen, so Join is always one click away and the page never loses its name. The only colour is the Join button and the glow."
        customize="Sections in the right column are the same tiles, drawn flat. Same reorder and hide."
        risk="The least branded of the five. A paying company gets less presence than in the others."
      >
        <V3Focus viewer={Viewer.Member} />
      </Variant>

      <Variant
        number="4"
        title="Shelf"
        idea="The tiles sit in one horizontal shelf between the identity and the feed. Four in view, the fifth peeks, the feed keeps three cards."
        clever="Everything is above the feed and nothing is beside it, so the feed is exactly the feed the rest of the product has. The shelf is also how any of the others should collapse on a phone."
        customize="Order is the shelf order. The first four tiles are the ones a visitor sees without scrolling, which makes the owner's choice matter."
        risk="Horizontal scrolling on desktop hides tiles five and beyond. Tiles have to be fixed height, so long content gets cut."
      >
        <V4Shelf />
      </Variant>

      <Variant
        number="5"
        title="Console"
        idea="WHOOP's team screen as a left panel: identity, one oversized number, the pulse and the leaderboard, with the feed taking the rest."
        clever="The panel is the community's dashboard. Members, activity and top contributors give a reason to come back that is not the posts."
        customize="The panel below the numbers is the tile column. Reorder, hide, add."
        risk="A second left column next to the app's own navigation. On a laptop the feed drops to two cards."
      >
        <V5Console />
      </Variant>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>Side by side</Eyebrow>
          <h2 className="font-bold typo-title1">Comparison</h2>
        </div>
        <Table
          head={[
            'Variant',
            'Tiles live',
            'Feed',
            'Brand presence',
            'First screen',
            'Best for',
          ]}
          rows={[
            [
              '1 · Modules',
              'Right column, cards',
              'One column, list cards',
              'Glow + logo',
              'Identity, 3 posts, 4 tiles',
              'The default. Every squad, every source.',
            ],
            [
              '2 · Bento',
              'Above the feed, grid',
              'Full width, 3 cards',
              'Cover inside the identity tile',
              'Identity, 5 tiles, first card row',
              'Company pages with numbers worth showing.',
            ],
            [
              '3 · Focus',
              'Right column, flat',
              'One column, list cards, composer',
              'Glow only',
              'Identity, composer, 3 posts, 3 sections',
              'Active squads where posting is the point.',
            ],
            [
              '4 · Shelf',
              'One row above the feed',
              'Full width, 3 cards',
              'Glow + logo',
              'Identity, 4 tiles, first card row',
              'Squads with many modules. Mobile, for all of them.',
            ],
            [
              '5 · Console',
              'Left panel',
              '2 cards',
              'Glow inside the panel',
              'Identity, big number, pulse, leaderboard, 2 posts',
              'Communities that run on activity and rank.',
            ],
          ]}
        />
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>Recommendation</Eyebrow>
          <h2 className="font-bold typo-title1">
            Modules on desktop, Shelf on a phone. Same tiles.
          </h2>
        </div>
        <Prose>
          <p>
            Variant 1 is the one that looks like daily.dev already had it. The
            feed is the feed, the tiles are one component, and the owner
            arranging them is the WHOOP idea without a dashboard. Variant 4 is
            the same tiles turned into a row, which is what the column has to
            become on a phone anyway, so building both is building one.
          </p>
          <p>
            Take two tiles from Variant 5 as defaults for a verified company
            page: Activity and Top this week. They are the reason a member comes
            back, and they are numbers the company can point at. Variant 2 is
            the strongest visual and worth keeping as the identity tile if we
            ever want the cover back inside the grid rather than above it.
          </p>
        </Prose>
      </section>
    </Page>
  ),
};

const viewerControl = {
  control: 'inline-radio' as const,
  options: [Viewer.Visitor, Viewer.Member, Viewer.Admin],
};

const Full = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex min-h-screen justify-center bg-background-subtle p-8">
    <KitStyles />
    <Kit2Styles />
    {children}
  </div>
);

type ViewerStory = StoryObj<{ viewer: Viewer }>;
const viewerArgs = {
  args: { viewer: Viewer.Visitor },
  argTypes: { viewer: viewerControl },
};

export const Modules: ViewerStory = {
  ...viewerArgs,
  render: (args) => (
    <Full>
      <V1Modules {...args} />
    </Full>
  ),
};

export const Bento: ViewerStory = {
  ...viewerArgs,
  render: (args) => (
    <Full>
      <V2Bento {...args} />
    </Full>
  ),
};

export const Focus: ViewerStory = {
  ...viewerArgs,
  args: { viewer: Viewer.Member },
  render: (args) => (
    <Full>
      <V3Focus {...args} />
    </Full>
  ),
};

export const Shelf: ViewerStory = {
  ...viewerArgs,
  render: (args) => (
    <Full>
      <V4Shelf {...args} />
    </Full>
  ),
};

export const Console: ViewerStory = {
  ...viewerArgs,
  render: (args) => (
    <Full>
      <V5Console {...args} />
    </Full>
  ),
};
