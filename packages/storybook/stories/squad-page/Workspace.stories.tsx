import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { KitStyles, Viewer } from './kit';
import { SquadHome } from './home';
import {
  addPage,
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

/* --------------------------------------------------------------- stories */

export const Overview: StoryObj = {
  render: () => (
    <Page>
      <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-10">
        <Eyebrow>Squad page · Round three</Eyebrow>
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
            Real squad, real posts, real team. Chat, Bounties, Leaderboard,
            Events, the online count and the Verified mark are illustrative.
            Click around in the playground below; it is live.
          </p>
        </Prose>
      </header>

      <Section eyebrow="Try it" title="The workspace, as a member">
        <Caption>
          Click the pages in the second column. Home is the identity block plus
          the feed. Announcements is a feed where only the team posts. Chat is a
          room. Start here is a document. Bounties pay Cores. Open roles is
          Recruiter. The links open outside.
        </Caption>
        <WorkspaceShell viewer={Viewer.Member} />
      </Section>

      <Section eyebrow="Parity" title="Home is the profile page, for a squad">
        <Caption>
          A person and a squad are the same kind of thing on daily.dev, so their
          pages share one skeleton. Left: the live profile page. Right: the
          squad&apos;s Home. Same card, same cover height, same avatar seat,
          same name, meta, actions and stats stack, same divided sections
          beneath, same widget column. Only the nouns change.
        </Caption>
        <div className="flex gap-6 overflow-x-auto">
          {[
            [
              'Profile, as it ships today',
              <img
                key="profile"
                src="/squad-page/profile-reference.png"
                alt="The daily.dev profile page"
                className="w-full rounded-16 border border-border-subtlest-tertiary"
              />,
            ],
            [
              'Squad Home, same skeleton',
              <div
                key="squad"
                className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
              >
                <SquadHome viewer={Viewer.Visitor} />
              </div>,
            ],
          ].map(([label, node]) => (
            <div
              key={label as string}
              className="flex shrink-0 flex-col gap-2"
              style={{ width: 1152, zoom: 0.62 }}
            >
              <span className="text-text-quaternary typo-callout">{label}</span>
              {node}
            </div>
          ))}
        </div>
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
              'Company badge · location',
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
              'About me: social links + readme',
              'About: links + readme',
              'A squad gets a readme. Companies will write one.',
            ],
            [
              'Stack',
              'Stack and tools',
              "The source stack already exists; it moves into the profile's row style.",
            ],
            [
              'Activity: Posts / Replies / Upvoted, card rail, Show more',
              'Activity: Posts / Announcements / Polls, card rail, Show more',
              'The pinned post leads the rail with its flag. Show more opens the Posts page.',
            ],
            [
              'Work experience, education',
              'Open roles',
              'Recruiter listings in the experience row style.',
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
              'A Feed page with posting restricted to admins and moderators',
            ],
            [
              'Chat app',
              'Nothing. Slack integration posts out, not in',
              'Chat page. New. The biggest build here',
            ],
            [
              '"Start here" document',
              'A freeform post',
              'A Page: a freeform post rendered as a document, with Edit for admins',
            ],
            [
              'Content Rewards, Bounties',
              'Cores and Awards',
              'Bounties page: the company pays Cores for content it wants',
            ],
            [
              'Products, Reviews tabs',
              'Plus, Recruiter',
              'Open roles page from Recruiter. No reviews',
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

      <Section eyebrow="Catalogue" title="What a page can be">
        <Caption>
          Six of the ten exist as primitives already. The new ones are ranked by
          how much they sell a verified company page: Bounties and Leaderboard
          give a company a reason to be here; Chat is the biggest build and the
          last to do.
        </Caption>
        <div className="grid grid-cols-5 gap-3">
          {pageCatalogue.map((item) => (
            <div
              key={item.type}
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
      </Section>

      <Section eyebrow="The pages" title="One shell, every page type">
        <div className="flex flex-col gap-10">
          <Screen
            title="Home, as a visitor"
            note="The only page with an identity block. Join is in the sidebar and in the header; the pinned post and the feed follow."
          >
            <WorkspaceShell
              viewer={Viewer.Visitor}
              initialPage={findPage('home')}
              height={48}
            />
          </Screen>
          <Screen
            title="Announcements, as an admin"
            note="A feed page with posting restricted. The lock in the sidebar and the page bar say so. The composer appears only for people who can post here."
          >
            <WorkspaceShell
              viewer={Viewer.Admin}
              initialPage={findPage('announcements')}
              height={44}
            />
          </Screen>
          <Screen
            title="Chat"
            note="A room. Members only, online count in the page bar. New for daily.dev and deliberately last on the build list."
          >
            <WorkspaceShell
              viewer={Viewer.Member}
              initialPage={findPage('chat')}
              height={44}
            />
          </Screen>
          <Screen
            title="Start here, a document page"
            note="A freeform post rendered as a page: title, a video, headings, links. Admins get Edit page in the bar. This is where Whop communities put their onboarding, and where a company puts its story."
          >
            <WorkspaceShell
              viewer={Viewer.Admin}
              initialPage={findPage('start-here')}
              height={48}
            />
          </Screen>
          <Screen
            title="Bounties"
            note="The company pays Cores for content it wants. Claim, post, get paid on acceptance. This is the page that makes a verified company page worth paying for."
          >
            <WorkspaceShell
              viewer={Viewer.Member}
              initialPage={findPage('bounties')}
              height={36}
            />
          </Screen>
          <Screen
            title="Open roles"
            note="Recruiter listings inside the squad. Exists today as a product; here it is a page the company switches on."
          >
            <WorkspaceShell
              viewer={Viewer.Member}
              initialPage={findPage('jobs')}
              height={32}
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
            under the squad name (Home, Announcements, Chat, Start here, and so
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
              'The pages column with Home, Feed, Page (document) and Link. Sections, order, hide.',
              'Every one of these is an existing primitive: the feed, a freeform post, a URL. The column is the whole shift; the pages are already here.',
            ],
            [
              '2',
              'Add a page, Preview as, page settings.',
              'Turns the column from a layout into a product the owner shapes. This is what a verified company page is sold on.',
            ],
            [
              '3',
              'Restricted feeds (Announcements), Team, Stack, Open roles as pages.',
              'Small: a posting rule on a feed, and three surfaces we already render, moved into the column.',
            ],
            [
              '4',
              'Bounties and Leaderboard.',
              'The reasons to come back. Bounties reuse Cores; the leaderboard is a query.',
            ],
            [
              '5',
              'Chat.',
              'Real-time, retention, moderation. Worth doing, not worth blocking the rest on.',
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

export const Playground: StoryObj<{ viewer: Viewer; page: string }> = {
  args: { viewer: Viewer.Member, page: 'home' },
  argTypes: {
    viewer: {
      control: 'inline-radio' as const,
      options: [Viewer.Visitor, Viewer.Member, Viewer.Admin],
    },
    page: {
      control: 'select' as const,
      options: [...allPages.map((page) => page.id), 'add'],
    },
  },
  render: (args) => (
    <Full>
      <WorkspaceShell
        key={`${args.viewer}-${args.page}`}
        viewer={args.viewer}
        initialPage={args.page === 'add' ? addPage : findPage(args.page)}
        height={60}
      />
    </Full>
  ),
};
