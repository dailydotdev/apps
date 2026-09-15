import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { KitStyles, Viewer } from './kit';
import { ChannelTab, LayoutChannel } from './LayoutChannel';
import { CommunityFeed, LayoutCommunity } from './LayoutCommunity';
import { LayoutPublication } from './LayoutPublication';
import { LayoutHub } from './LayoutHub';

const meta: Meta = {
  title: 'Squad Page/1. Layout directions',
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
    <div className="mx-auto flex w-full max-w-[82rem] flex-col gap-14">
      {children}
    </div>
  </div>
);

const Prose = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex max-w-[76ch] flex-col gap-3 text-text-secondary typo-body',
      className,
    )}
  >
    {children}
  </div>
);

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

const Direction = ({
  letter,
  title,
  from,
  optimises,
  strengths,
  costs,
  mobile,
  children,
}: {
  letter: string;
  title: string;
  from: string;
  optimises: string;
  strengths: string;
  costs: string;
  mobile: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-6">
    <div className="grid gap-8" style={{ gridTemplateColumns: '22rem 1fr' }}>
      <div className="flex flex-col gap-2">
        <Eyebrow>Direction {letter}</Eyebrow>
        <h2 className="font-bold typo-mega3">{title}</h2>
        <p className="text-text-tertiary typo-callout">Borrowed from {from}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4 typo-callout">
        {[
          ['Optimises for', optimises],
          ['Strengths', strengths],
          ['Costs', costs],
          ['On mobile', mobile],
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

type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <Page>
      <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-10">
        <Eyebrow>Squad page · Layout directions</Eyebrow>
        <h1 className="max-w-[24ch] font-bold typo-giga3">
          Four ways to structure a company&apos;s home on daily.dev
        </h1>
        <Prose>
          <p>
            Verified company pages will be sold on the strength of this page.
            Today the squad page is a stack of loosely related widgets:
            identity, stats, description, action bar, moderators, top members,
            stack, composer, and only then the posts. The cover image every
            squad can already upload is never shown.
          </p>
          <p>
            Each direction below is the same real squad (@daily_updates, 11.5K
            members, its live posts and team) rebuilt on a different skeleton,
            with production feed cards where cards appear. Choose the skeleton.
            The high-fidelity mockups (desktop and mobile, visitor / member /
            admin, private and empty states, machine sources) follow from that
            choice.
          </p>
          <p className="text-text-quaternary typo-callout">
            Illustrative, not on the API yet: the Verified mark, links, company
            facts, the stack items and open roles. Everything else is real.
          </p>
        </Prose>
      </header>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>What the page has to do</Eyebrow>
          <h2 className="font-bold typo-title1">
            Six rules every direction obeys
          </h2>
        </div>
        <ol className="grid grid-cols-3 gap-6">
          {[
            [
              'The feed is the product, the header is the introduction.',
              'Content starts inside the first screen on a laptop. The current page needs a scroll and a half.',
            ],
            [
              'Identity is shown, not listed.',
              'Cover, logo, verified mark and one line of meta replace five stacked rows.',
            ],
            [
              'One primary action per viewer.',
              'Join for a visitor, New post for a member. Admin tools never compete with either.',
            ],
            [
              'Proof, not decoration.',
              'Members with faces, activity in tabular figures, the team with real titles.',
            ],
            [
              'Owner-curated slots.',
              'A featured post, links, stack, open roles. Shaping the page is what a company pays for.',
            ],
            [
              'One skeleton for squads and sources.',
              'A publication (machine source) gets the same structure with different content types.',
            ],
          ].map(([rule, why], index) => (
            <li
              key={rule}
              className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5"
            >
              <span className="sq-nums font-bold text-text-quaternary typo-caption1">
                0{index + 1}
              </span>
              <span className="font-bold text-text-primary typo-callout">
                {rule}
              </span>
              <span className="text-text-tertiary typo-footnote">{why}</span>
            </li>
          ))}
        </ol>
      </section>

      <Direction
        letter="A"
        title="Channel"
        from="YouTube channels, Twitch, LinkedIn company pages."
        optimises="Content. The feed gets the full width and three production cards per row."
        strengths="Instantly familiar. The cover makes any squad look produced. Tabs give a company page room to grow (Members, Stack, Jobs) without touching the feed."
        costs="What builds trust on first visit (description, team, stats) sits behind the About tab, so the header carries one tagline and the numbers. Tabs are routes and need URL and SEO work."
        mobile="Cover shrinks, identity stacks, tabs scroll horizontally. Nothing changes structurally."
      >
        <LayoutChannel />
        <p className="text-text-quaternary typo-footnote">
          The About tab, where the rest of the identity moves to.
        </p>
        <LayoutChannel tab={ChannelTab.About} />
      </Direction>

      <Direction
        letter="B"
        title="Community"
        from="Reddit, and the member and about panels of Discord."
        optimises="Trust while scrolling. A sticky rail keeps About, Team, Stack and Roles next to every post."
        strengths="Visitor and buyer both get everything at once. The company's slots are permanently visible. Maps to the v2 shell's floating card and to how people already read Reddit."
        costs="The feed narrows to two cards, or list mode. The rail needs discipline or it becomes today's widget stack rotated ninety degrees."
        mobile="The rail becomes an About sheet behind a button in the identity row, or the first tab under it."
      >
        <LayoutCommunity />
        <p className="text-text-quaternary typo-footnote">
          The same direction in list mode, which the column also suits.
        </p>
        <LayoutCommunity feed={CommunityFeed.List} />
      </Direction>

      <Direction
        letter="C"
        title="Publication"
        from="Substack, the Linear and Vercel changelogs, and Whoop's restraint."
        optimises="Reading. One centred column, the latest release as the lead, then a dated timeline grouped by month."
        strengths="The most premium of the four. A changelog squad reads as an official product surface. The cover becomes light behind the masthead, so a weak cover still looks good."
        costs="The timeline is a new content presentation and does not suit chatty squads with many short posts. Announcement-style squads fit; the others would default to the Cards view."
        mobile="Already one column. The date moves above the entry."
      >
        <LayoutPublication />
      </Direction>

      <Direction
        letter="D"
        title="Hub"
        from="GitHub organisation pages, Notion sites."
        optimises="The company. Its own section navigation and a curated Overview make the squad a small site inside daily.dev."
        strengths="The most room for a paying company: announcements, discussions, roles and about as first-class sections, and an Overview they compose themselves."
        costs="A second left navigation next to the app's own sidebar. Sections need content, so small squads feel empty. The biggest build."
        mobile="The section nav becomes a horizontal scroller under the identity row."
      >
        <LayoutHub />
      </Direction>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>Side by side</Eyebrow>
          <h2 className="font-bold typo-title1">Comparison</h2>
        </div>
        <Table
          head={[
            'Direction',
            'First screen shows',
            'Feed width',
            'Where "about" lives',
            'Company slots',
            'Build',
            'Best for',
          ]}
          rows={[
            [
              'A · Channel',
              'Cover, identity, tagline, tabs, toolbar, first row of cards',
              'Full, 3 cards',
              'About tab',
              'Tabs: Members, Stack, Jobs',
              'Medium. Tabs are new routes.',
              'Any squad. Content-heavy squads most.',
            ],
            [
              'B · Community',
              'Cover, identity, toolbar, 2 cards, About + Team in the rail',
              '2 cards or list',
              'Sticky right rail',
              'Rail panels: Links, Stack, Roles',
              'Medium. Rail is new, feed unchanged.',
              'Every squad and source. The default.',
            ],
            [
              'C · Publication',
              'Masthead, team, CTA, latest release, first timeline rows',
              'One column',
              'Masthead strip',
              'Featured slot only',
              'Medium-high. Timeline is a new list mode.',
              'Changelogs, announcement squads, publications.',
            ],
            [
              'D · Hub',
              'Cover, identity, section nav, latest announcement, 3 cards',
              'Full inside main, 3 cards',
              'About section',
              'Sections: Announcements, Roles, About, curated Overview',
              'High. Sections, nav, overview composer.',
              'Paying company pages with enough content.',
            ],
          ]}
        />
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>Recommendation</Eyebrow>
          <h2 className="font-bold typo-title1">
            Start from B. Borrow the band from A and the lead from C.
          </h2>
        </div>
        <Prose>
          <p>
            The rail fixes what is wrong with the current page: the information
            that earns trust is scattered down the header and pushed out of the
            first screen. B keeps it on screen without hiding it in a tab, and
            it gives a paying company permanent real estate beside its content
            on every scroll, which is the thing they are buying. The feed stays
            the hero, and list mode already exists.
          </p>
          <p>
            Take A&apos;s cover and identity band as the top of B, and take
            C&apos;s featured slot as an owner-curated lead above the feed. Give
            the changelog squad C&apos;s timeline as a feed view mode rather
            than a separate page, so announcement squads can feel like an
            official surface without a second layout to maintain.
          </p>
          <p>
            D is the right end state if company pages become a product line of
            their own, with sections a company fills over time. It is not where
            to start: it competes with the app&apos;s own navigation and needs
            content to not feel empty.
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
    {children}
  </div>
);

export const Channel: StoryObj<{ viewer: Viewer; tab: ChannelTab }> = {
  args: { viewer: Viewer.Visitor, tab: ChannelTab.Posts },
  argTypes: {
    viewer: viewerControl,
    tab: {
      control: 'inline-radio' as const,
      options: [ChannelTab.Posts, ChannelTab.About],
    },
  },
  render: (args) => (
    <Full>
      <LayoutChannel {...args} />
    </Full>
  ),
};

export const Community: StoryObj<{ viewer: Viewer; feed: CommunityFeed }> = {
  args: { viewer: Viewer.Visitor, feed: CommunityFeed.Grid },
  argTypes: {
    viewer: viewerControl,
    feed: {
      control: 'inline-radio' as const,
      options: [CommunityFeed.Grid, CommunityFeed.List],
    },
  },
  render: (args) => (
    <Full>
      <LayoutCommunity {...args} />
    </Full>
  ),
};

export const Publication: StoryObj<{ viewer: Viewer }> = {
  args: { viewer: Viewer.Visitor },
  argTypes: { viewer: viewerControl },
  render: (args) => (
    <Full>
      <LayoutPublication {...args} />
    </Full>
  ),
};

export const Hub: StoryObj<{ viewer: Viewer }> = {
  args: { viewer: Viewer.Visitor },
  argTypes: { viewer: viewerControl },
  render: (args) => (
    <Full>
      <LayoutHub {...args} />
    </Full>
  ),
};
