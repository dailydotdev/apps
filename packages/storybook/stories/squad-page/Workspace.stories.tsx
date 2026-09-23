import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { KitStyles, Viewer } from './kit';
import { SquadHome } from './home';
import { ProfileHome, ProfileTab } from './profile';
import {
  addPage,
  ContentSource,
  allPages,
  findPage,
  pageCatalogue,
  pageIcon,
  WorkspaceShell,
  WorkspaceStyles,
} from './workspace';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

const meta: Meta = {
  title: 'Squad Page/3. Workspace',
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
    <WorkspaceStyles />
    <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-14">
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

const Section = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-bold typo-title1">{title}</h2>
    </div>
    {children}
  </section>
);

const Caption = ({ children }: { children: ReactNode }): ReactElement => (
  <p className="max-w-[76ch] text-text-tertiary typo-callout">{children}</p>
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
                    ? 'font-bold text-text-primary'
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

const Screen = ({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col">
      <span className="font-bold text-text-primary typo-callout">{title}</span>
      <span className="max-w-[76ch] text-text-tertiary typo-footnote">
        {note}
      </span>
    </div>
    {children}
  </div>
);

/** Two 1152px pages side by side, scaled so both fit. */
const Pair = ({ items }: { items: [string, ReactNode][] }): ReactElement => (
  <div className="flex gap-6 overflow-x-auto">
    {items.map(([label, node]) => (
      <div
        key={label}
        className="flex shrink-0 flex-col gap-2"
        style={{ width: 1152, zoom: 0.62 }}
      >
        <span className="text-text-quaternary typo-callout">{label}</span>
        <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
          {node}
        </div>
      </div>
    ))}
  </div>
);

/* --------------------------------------------------------------- stories */

export const Overview: StoryObj = {
  render: () => (
    <Page>
      <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-10">
        <Eyebrow>Squad page · The workspace</Eyebrow>
        <h1 className="max-w-[22ch] font-bold typo-giga3">
          A squad is a workspace, not a page.
        </h1>
        <Prose>
          <p>
            Whop&apos;s idea is not a sidebar of widgets. It is that a community
            is a small product the owner assembles: a left column of pages, each
            page a different kind of thing (a feed, a chat, a document, a link,
            a bounty board), and the main area becomes whatever the selected
            page is. The owner adds, names, orders, sections and hides pages. A
            visitor sees a place, not a profile.
          </p>
          <p>
            For daily.dev this is a small structural change with a large product
            surface. The v2 rail already exists and does not move. The
            squad&apos;s pages take the second column. The main area renders the
            page. Home is the only page that carries the identity block; every
            other page is just its content, because the sidebar already says
            where you are.
          </p>
          <p className="text-text-quaternary typo-callout">
            Real squad, real posts, real team. Products, the polls, the rules,
            the links and the verified badge are illustrative. Click around in
            the playground below; it is live.
          </p>
        </Prose>
      </header>

      <Section eyebrow="Try it" title="The workspace, as a member">
        <Caption>
          Click the pages in the second column. Home is the identity block plus
          the feed. Releases is the changelog as a log, Products the list of
          what the company makes. Discussions is the feed with a posting rule;
          Polls is the poll card, one vote each. Rules and FAQ are pages, and
          the rules sit in a widget on Home too. The links open outside.
        </Caption>
        <WorkspaceShell viewer={Viewer.Member} />
      </Section>

      <Section eyebrow="Parity" title="Home is the profile page, for a squad">
        <Caption>
          A person and a squad are the same kind of thing on daily.dev, so their
          pages share one skeleton, and both get the same correction: the posts
          are the page. Everything that used to stack down the column (the
          readme, the stack, the CV, the roles) sits under one About tab, and
          Posts is the default. Left: the profile on the new frame. Right: the
          squad. Same card, cover, avatar seat, name, meta, actions, stats,
          tabs, widget column. Only the nouns change.
        </Caption>
        <Pair
          items={[
            ['Profile, on the new frame', <ProfileHome key="profile" />],
            [
              'Squad Home, same frame',
              <SquadHome key="squad" viewer={Viewer.Visitor} standalone />,
            ],
          ]}
        />
        <Table
          head={['Profile', 'Squad Home', 'Note']}
          rows={[
            [
              'Cover, avatar at the foot of it',
              'Cover, logo in the same seat',
              'Same sizes: h-36 cover, 7.5rem rounded-16 avatar at left-6 top-16.',
            ],
            [
              'Name + Plus mark',
              'Name + Verified mark',
              "The verified mark is the squad's Plus mark: same seat, same size.",
            ],
            ['Bio', 'Tagline', 'One line. The long form lives in About.'],
            [
              'Company badge',
              '"Verified company" · location',
              'The company badge is what makes the page sellable, so it stays in the header.',
            ],
            ['@handle · Joined date', '@handle · Created date', ''],
            [
              'Follow, more',
              'Join, notifications, more',
              'Joined state uses the secondary button with a check, like Following.',
            ],
            [
              'Reputation · Upvotes · Followers · Following',
              'Members · Posts · Views · Upvotes',
              'Same 2x2 grid; members take the reputation seat with the icon.',
            ],
            [
              'Tabs: Activity · About',
              'Tabs: Posts · About',
              'New on both. Posts is the default and takes the whole card.',
            ],
            [
              'Activity: Posts / Replies / Upvoted chips, 2-up card grid, Load more',
              'Posts: Latest / Top / Discussed chips, pinned row, 2-up card grid, Load more',
              'The cards are the page again. Load more, not a rail.',
            ],
            [
              'About: readme, social links, work experience',
              'About: readme, links, stack, open roles',
              'One tab for everything that is not posts.',
            ],
            [
              'Reading overview, Active in squads, Badges',
              'Squad overview, Team, Awards and milestones',
              'Same widget frames. Reading heatmap becomes a posting heatmap.',
            ],
          ]}
        />
      </Section>

      <Section eyebrow="Three columns" title="How it sits inside daily.dev">
        <div className="grid grid-cols-3 gap-4">
          {[
            [
              'The rail',
              'Unchanged. The app: Home, Search, Explore, Squads, Streak, your account. Whop has the same thing on its far left, one icon per community.',
            ],
            [
              'The squad’s pages',
              'New. Owner-composed. Sections with labels, pages with icons and counts, admin-only Manage at the end. The Join button lives here for a visitor, so it is on screen on every page.',
            ],
            [
              'The page',
              'Whatever the selected page is. A page bar names it and holds its actions. Home is the only page with a cover and a name, because everywhere else the sidebar already says where you are.',
            ],
          ].map(([title, body], index) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5"
            >
              <span className="sq-nums font-bold text-text-quaternary typo-caption1">
                0{index + 1}
              </span>
              <span className="font-bold text-text-primary typo-callout">
                {title}
              </span>
              <span className="text-text-tertiary typo-footnote">{body}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Translation" title="Whop to daily.dev">
        <Table
          head={['Whop', 'daily.dev today', 'In the workspace']}
          rows={[
            [
              'Community sidebar with apps and sections',
              'Squad header with Settings and Pending posts tabs',
              'The pages column: sections, pages, counts, hide, reorder',
            ],
            [
              'Home: cover, logo, rating, members, "joined by"',
              'SquadPageHeader: name, stats, moderators, top members, stack',
              'Home page: cover, logo, name, one line of meta, "joined by", pinned, feed',
            ],
            [
              'Announcements app',
              'Any post; pinned posts',
              "Releases: the team's posts as a log, grouped by month",
            ],
            [
              'Chat app',
              'Nothing. Slack integration posts out, not in',
              'Not carried over. Discussions and Polls are where members talk',
            ],
            [
              '"Start here" document',
              'A freeform post',
              'A Page: a freeform post rendered as a document, with Edit for admins',
            ],
            [
              'Content Rewards, Bounties',
              'Cores and Awards',
              'Not carried over. Developer communities do not organise around rewards; awards stay on posts',
            ],
            [
              'Products, Reviews tabs',
              'Plus, Recruiter, the source stack',
              "Products page imported from Product Hunt, G2, Trustpilot, GitHub or a URL, with the source's rating and a link into the member stack",
            ],
            [
              'Links, "Our website"',
              'Website in the description, source stack',
              'Link pages that open in a new tab; Stack and Team as pages',
            ],
            [
              'Add app, Preview as Admin',
              'Nothing',
              'Add a page (the catalogue below), Preview as',
            ],
            [
              'Far-left communities rail',
              'The v2 rail, Squads tab with a panel of your squads',
              'Unchanged',
            ],
          ]}
        />
      </Section>

      <Section
        eyebrow="Research"
        title="How developer communities organise themselves"
      >
        <Caption>
          The subreddits developers actually live in (r/reactjs, r/rust,
          r/golang, r/webdev, r/devops, r/ExperiencedDevs) and the company ones
          (r/nextjs, r/supabase, r/cursor) converge on one shape. GitHub
          Discussions ships that shape as its default categories, and every
          Discord dev server names the same channels. daily.dev already has most
          of the parts; what it lacks is the container.
        </Caption>
        <Table
          head={[
            'Convention',
            'Reddit',
            'GitHub Discussions',
            'Discord',
            'daily.dev today',
            'In the sidebar',
          ]}
          rows={[
            [
              'Post types, chosen when posting',
              'Post flairs: Needs help, Discussion, Show and tell, News, Resource, Announcement',
              'Categories: Announcements, General, Ideas, Polls, Q&A, Show and tell',
              '#announcements #general #help #showcase',
              'Post types (link, freeform, poll, video), tags, posting gates',
              'Channels: one feed, one flair per post, a posting rule per channel',
            ],
            [
              'Team-only news',
              'Announcement flair, mod-only; pinned',
              'Announcements category, maintainers only',
              '#announcements, locked',
              'Pinned posts; posting gate is squad-wide',
              "Releases, the team's log, beside Discussions with a posting rule",
            ],
            [
              'Threads on a schedule',
              "Monthly Who's hiring, weekly Easy questions, Showoff Saturday",
              'Pinned discussions',
              'Scheduled events',
              'Scheduled posts (14 days), pinning',
              'Not carried over. Polls carry the scheduled question instead',
            ],
            [
              'Read before you post',
              'Rules widget (numbered), wiki, FAQ',
              'CONTRIBUTING, discussion guidelines',
              '#rules, #start-here',
              'Welcome post, description',
              'Documentation: Rules and FAQ, with the rules also as a widget on Home',
            ],
            [
              'Where else to go',
              'Sidebar links, related communities, Discord',
              'Repository links',
              'Link channels',
              'Website in the description, source stack',
              'Links: docs, GitHub, status, Discord, related squads',
            ],
            [
              'Who is here',
              'Moderators list, member and online counts',
              'Maintainers',
              'Member list, online',
              'Admins, moderators, top members',
              'Members behind the count on Home; the team in its widget',
            ],
            [
              'Points and rewards',
              'None per community (karma is global)',
              'None',
              'Levels bots, rarely',
              'Reputation, Cores, Awards (global)',
              'Removed from the sidebar. Bounties and a leaderboard are not how developer communities organise; awards stay on posts.',
            ],
          ]}
        />
      </Section>

      <Section eyebrow="Catalogue" title="What a page can be">
        <Caption>
          Grouped the way a company thinks about it. Discussions and Polls are
          the feed and the poll post with a rule each; Rules, Releases and
          Products are the three pages that need new work.
        </Caption>
        <div className="flex flex-col gap-6">
          {pageCatalogue.map((group) => (
            <div key={group.group} className="flex flex-col gap-3">
              <span className="font-bold uppercase tracking-wide text-text-quaternary typo-caption2">
                {group.group}
              </span>
              <div className="grid grid-cols-4 gap-3">
                {group.items.map((item) => (
                  <div
                    key={item.title}
                    className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
                  >
                    <span className="flex items-center justify-between text-text-primary">
                      {pageIcon(item.type, IconSize.Small)}
                      <span
                        className={classNames(
                          'rounded-6 px-1.5 typo-caption2',
                          item.exists
                            ? 'bg-background-default text-text-quaternary'
                            : 'bg-accent-cabbage-flat text-accent-cabbage-default',
                        )}
                      >
                        {item.exists ? 'Exists' : 'New'}
                      </span>
                    </span>
                    <span className="font-bold text-text-primary typo-callout">
                      {item.title}
                    </span>
                    <span className="text-text-tertiary typo-footnote">
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="The pages" title="One shell, every page type">
        <div className="flex flex-col gap-10">
          <Screen
            title="Home, as a visitor"
            note="The only page with an identity block. Join is in the sidebar; the official badge, the rules, the team, activity and links fill the column."
          >
            <WorkspaceShell
              viewer={Viewer.Visitor}
              initialPage={findPage('home')}
              height={48}
            />
          </Screen>
          <Screen
            title="Discussions, as an admin"
            note="The feed with its posting rule in the strip and the same sort, layout and search row as Home. Post to Discussions lands the post in the right place without a picker."
          >
            <WorkspaceShell
              viewer={Viewer.Admin}
              initialPage={findPage('discussions')}
              height={44}
            />
          </Screen>
          <Screen
            title="Polls, as a member"
            note="The production poll card, one per question. The team asks, members vote in place, the card flips to its results."
          >
            <WorkspaceShell
              viewer={Viewer.Member}
              initialPage={findPage('polls')}
              height={44}
            />
          </Screen>
          <Screen
            title="Releases"
            note="The changelog as a log, not a feed: every release post grouped by month, newest first, filterable by kind. GitHub Releases' shape."
          >
            <WorkspaceShell
              viewer={Viewer.Member}
              initialPage={findPage('releases')}
              height={52}
            />
          </Screen>
          <Screen
            title="Products, as an admin"
            note="Everything the company makes, imported from a Product Hunt, G2, Trustpilot, GitHub or website link, as a Product Hunt style list. The box on the right counts stacks and is the add button."
          >
            <WorkspaceShell
              viewer={Viewer.Admin}
              initialPage={findPage('products')}
              height={52}
            />
          </Screen>
          <Screen
            title="Rules"
            note="Reddit's rules widget as a page: numbered, one line and the why. Shown once before a first post; moderators point at a number when they remove something."
          >
            <WorkspaceShell
              viewer={Viewer.Member}
              initialPage={findPage('rules')}
              height={40}
            />
          </Screen>
          <Screen
            title="FAQ, a document page"
            note="A freeform post rendered as a page. Admins get Edit page in the bar."
          >
            <WorkspaceShell
              viewer={Viewer.Admin}
              initialPage={findPage('faq')}
              height={44}
            />
          </Screen>
          <Screen
            title="Members"
            note="Reached from the member count on Home. The team first, then everyone, with search and the newest members."
          >
            <WorkspaceShell
              viewer={Viewer.Member}
              initialPage={findPage('members')}
              height={40}
            />
          </Screen>
          <Screen
            title="Add a page, as an admin"
            note="The catalogue. Pick a type, then name it and choose its section. Every + in the sidebar lands here."
          >
            <WorkspaceShell
              viewer={Viewer.Admin}
              initialPage={addPage}
              height={44}
            />
          </Screen>
        </div>
      </Section>

      <Section eyebrow="Phone" title="The column becomes a strip">
        <Prose>
          <p>
            On a phone the pages column folds into a horizontal strip of chips
            under the squad name (Home, Releases, Products, Discussions, and so
            on, in the owner&apos;s order) and the page fills the screen. The
            squad name opens the full list as a sheet. Nothing is lost, and the
            owner&apos;s order decides what is visible without scrolling, the
            same as on desktop.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="Build order" title="What to build first">
        <Table
          head={['Step', 'What', 'Why first']}
          rows={[
            [
              '1',
              'The pages column with Home, Discussions, FAQ (a document) and Links. Sections, order, hide.',
              'Every one of these is an existing primitive: the feed, a freeform post, a URL. The column is the whole shift; the pages are already here.',
            ],
            [
              '2',
              'The official badge, Add a page, Preview as, page settings.',
              'Turns the column from a layout into a product the owner shapes. This is what a verified company page is sold on.',
            ],
            [
              '3',
              'Polls and Rules as pages.',
              'The poll post already exists; Rules is a page type with a widget on Home.',
            ],
            [
              '4',
              'Releases and Products.',
              'Releases is a flair on a post plus a grouped view; Products needs the import and the stack link.',
            ],
          ]}
        />
      </Section>

      <Section
        eyebrow="Recommendation"
        title="Do this, and take the tiles with it"
      >
        <Prose>
          <p>
            This is the direction. It is simpler than any of the eight layouts
            before it because the page stops trying to be everything at once:
            the sidebar is the table of contents and each page does one thing.
            It is what X and Reddit feel like to use and what Whop lets an owner
            build, and it fits daily.dev&apos;s v2 shell without moving anything
            that exists.
          </p>
          <p>
            Round two is not wasted. The tiles become the Home page&apos;s
            optional strip (Activity, Top this week, Team) for squads that want
            them, and the Shelf is how they collapse on a phone. Everything else
            from rounds one and two can be retired.
          </p>
        </Prose>
      </Section>
    </Page>
  ),
};

const Full = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex min-h-screen items-start justify-center bg-background-subtle p-8">
    <KitStyles />
    <WorkspaceStyles />
    {children}
  </div>
);

export const Playground: StoryObj<{
  viewer: Viewer;
  page: string;
  source: ContentSource;
  empty: boolean;
  isPrivate: boolean;
}> = {
  args: {
    viewer: Viewer.Member,
    page: 'home',
    source: ContentSource.Feed,
    empty: false,
    isPrivate: false,
  },
  argTypes: {
    viewer: {
      control: 'inline-radio' as const,
      options: [
        Viewer.Anonymous,
        Viewer.Visitor,
        Viewer.Member,
        Viewer.Moderator,
        Viewer.Admin,
      ],
    },
    page: {
      control: 'select' as const,
      options: [...allPages.map((page) => page.id), 'add'],
    },
    source: {
      control: 'inline-radio' as const,
      options: [ContentSource.Feed, ContentSource.Manual],
    },
  },
  render: (args) => (
    <Full>
      <WorkspaceShell
        key={`${args.viewer}-${args.page}-${args.source}-${args.empty}-${args.isPrivate}`}
        viewer={args.viewer}
        source={args.source}
        empty={args.empty}
        isPrivate={args.isPrivate}
        initialPage={args.page === 'add' ? addPage : findPage(args.page)}
        height={60}
      />
    </Full>
  ),
};

export const ProfileOnNewFrame: StoryObj<{
  isOwner: boolean;
  tab: ProfileTab;
}> = {
  args: { isOwner: false, tab: ProfileTab.Activity },
  argTypes: {
    tab: {
      control: 'inline-radio' as const,
      options: [ProfileTab.Activity, ProfileTab.About],
    },
  },
  render: (args) => (
    <Full>
      <div className="w-[72rem] max-w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
        <ProfileHome
          key={`${args.isOwner}-${args.tab}`}
          isOwner={args.isOwner}
          initialTab={args.tab}
        />
      </div>
    </Full>
  ),
};
