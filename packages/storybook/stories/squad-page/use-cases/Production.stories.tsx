import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { ContentSource } from '../workspace';
import { Case, Page } from './shared';
import { productionCases } from './cases';

const meta: Meta = {
  title: 'Squad Page/2. Use cases/Production parity',
  parameters: { layout: 'fullscreen' },
  excludeStories: ['coverage'],
};

export default meta;

// Every state the production squad page has today, and where it lives in
// the new design. Audited from packages/webapp/pages/squads/** and
// packages/shared/src/components/squads/** on 23 Sep 2026. Copy in the
// cases is production's, word for word, unless a row says it changed.

type Status =
  | 'Covered'
  | 'Added'
  | 'Changed'
  | 'Elsewhere'
  | 'Dropped'
  | 'Neither';

interface Row {
  surface: string;
  production: string;
  design: string;
  status: Status;
}

export const coverage: { group: string; rows: Row[] }[] = [
  {
    group: 'Landing and access',
    rows: [
      {
        surface: 'Public squad, anonymous',
        production:
          'Full page, no Join (a quirk: the join button waits for a query that never runs logged out)',
        design:
          'Full page, Sign up to follow last in the header; full width under the stats on a phone',
        status: 'Changed',
      },
      {
        surface: 'Public squad, logged in non-member',
        production: 'Join Squad in the bar, Invitation link in the menu',
        design:
          'Follow, text only, last in the header row; Invitation link in the menu',
        status: 'Covered',
      },
      {
        surface: 'Private squad, non-member',
        production:
          'Unauthorized: “Oops! This link leads to a private discussion”',
        design:
          'The header, rules and team read; the feed and every page are the same Unauthorized copy',
        status: 'Changed',
      },
      {
        surface: 'Private squad, logged out',
        production: 'ProtectedPage redirect to onboarding',
        design: 'Same wall with Log in',
        status: 'Covered',
      },
      {
        surface: 'Blocked member',
        production:
          'Join disabled, tooltip “You are not allowed to follow this Squad”; still gets the bell and Leave',
        design:
          'Follow disabled with the copy under it, lock card, no bell, no Unfollow',
        status: 'Changed',
      },
      {
        surface: 'Invitation link /[handle]/[token]',
        production:
          'Landing with inviter, card, Join Squad, who is waiting; member redirected; blocked toast; invalid toast',
        design: 'Invite page with the same copy and the three outcomes',
        status: 'Covered',
      },
      {
        surface: 'Not found or deleted',
        production: 'Custom404 “Why are you here?”',
        design: 'Not found page, same copy, plus Find Squads',
        status: 'Covered',
      },
      {
        surface: 'Loading skeleton',
        production: 'SquadLoading',
        design:
          'Not drawn; the frame keeps its shape so the skeleton is the frame',
        status: 'Elsewhere',
      },
      {
        surface: 'Notification toast on landing',
        production: '“Get notified about new Squad activity.” once a day',
        design: 'Kept as is, a toast, not part of the page',
        status: 'Elsewhere',
      },
      {
        surface: 'Machine source (RSS) page /sources/[handle]',
        production:
          'Follow, bell, block, related tags, similar sources, rails, archive',
        design:
          'Becomes the squad: Follow stays Follow, the bell keeps its switches, the archive is the Releases chip, newest first',
        status: 'Changed',
      },
    ],
  },
  {
    group: 'Header',
    rows: [
      {
        surface: 'Name, handle, Created, category link',
        production: 'SquadPageHeader meta line',
        design: 'Name, tagline, then one meta line with the category link',
        status: 'Covered',
      },
      {
        surface: 'Privacy state',
        production: 'Featured / Public / Private Squad button',
        design: 'Same three words in the meta line, Featured in cabbage',
        status: 'Covered',
      },
      {
        surface: 'Stats',
        production:
          'Posts, Views, Upvotes, Awards when > 0 (opens the awards list)',
        design: 'Followers with faces, Posts, Views, Upvotes, Awards when > 0',
        status: 'Covered',
      },
      {
        surface: 'Cover image',
        production: 'Uploaded in settings, never shown on the page',
        design: 'Shown, with the fade',
        status: 'Added',
      },
      {
        surface: 'Description',
        production: 'One paragraph',
        design: 'The tagline under the name; the long paragraph is not shown',
        status: 'Changed',
      },
      {
        surface: 'Member short list',
        production: 'Avatars and count, opens the members modal',
        design: 'Faces on the Followers stat, opens the Followers page',
        status: 'Covered',
      },
      {
        surface: 'Moderated by, Top members',
        production: 'Two avatar rows with +N modals',
        design:
          'Team widget, Top followers row for public squads, See all opens Followers',
        status: 'Covered',
      },
      {
        surface: 'Stack & Tools',
        production: 'Chips, +N, Add for editors, dashed empty state',
        design:
          'Right column under Team, the same chips, +N, Add and empty state',
        status: 'Covered',
      },
      {
        surface: 'Invitation link button',
        production: 'Invite permission (memberInviteRole)',
        design:
          'Copy invitation link on Followers and in the options menu, hidden when members may not invite',
        status: 'Covered',
      },
      {
        surface: 'Share squad',
        production: 'Copy link when the user cannot invite',
        design:
          'Share icon in the header for everyone; the Public page & URL card for the team',
        status: 'Covered',
      },
      {
        surface: 'Notifications bell',
        production:
          'Modal: Show new posts on For You, Notify me about new posts, Notify me about new members (admin)',
        design: 'The same three switches behind the bell',
        status: 'Covered',
      },
      {
        surface: 'Pending posts count',
        production: '“N Pending posts” button when moderation is on',
        design:
          'Badge on the Moderation row and the Manage menu; members get their own queue strip on Home',
        status: 'Covered',
      },
      {
        surface: 'Boost',
        production:
          'Public squads, BoostSquad permission; readiness check; Boosting while active',
        design:
          'Boost / View boost for the admin on public squads; readiness and the modal unchanged',
        status: 'Covered',
      },
      {
        surface: 'Slack',
        production: 'Connect to Slack / Manage in the bar',
        design: 'Integrations in Settings',
        status: 'Changed',
      },
      {
        surface: 'Award the squad',
        production: 'Award button for eligible non-admins',
        design: 'Award the squad in the options menu',
        status: 'Changed',
      },
      {
        surface: 'Analytics button',
        production: 'ViewAnalytics',
        design:
          'Analytics widget in the right column for admins, and Analytics under Manage in the options menu',
        status: 'Covered',
      },
      {
        surface: 'Options menu',
        production:
          'Add to custom feed, Squad settings, Invitation link, Learn how Squads work, Feedback, Report Squad, Delete Squad, Leave Squad',
        design:
          'Same items and gates, opened by Manage for the team (Moderation, Content feed, Analytics, Settings); Squad settings is Settings there, and the separate gear is gone',
        status: 'Changed',
      },
    ],
  },
  {
    group: 'Posting',
    rows: [
      {
        surface: 'Share post bar and New post',
        production: 'URL input, reading history, or New post',
        design: 'The composer',
        status: 'Covered',
      },
      {
        surface: 'Cannot post: not a member',
        production: '“Join the Squad to create new posts”',
        design: 'Lock card, Follow instead of Join the Squad',
        status: 'Covered',
      },
      {
        surface: 'Cannot post: moderators only',
        production: '“Only admins and moderators can post”',
        design: 'Lock card, same copy; Discussions says Team only',
        status: 'Covered',
      },
      {
        surface: 'Cannot post: reputation',
        production: '“You need N reputation points to post”',
        design: 'Lock card, Follow instead of Join the Squad',
        status: 'Covered',
      },
      {
        surface: 'Post approval',
        production:
          'Prompt after submit; no feed state; the author finds it on /squads/moderate',
        design:
          'A note under the composer, the member’s queue strip on Home, the Pending posts page',
        status: 'Added',
      },
      {
        surface: 'Rejected post',
        production: 'Status pill and the reason alert',
        design: 'Same, on Pending posts',
        status: 'Covered',
      },
      {
        surface: 'Edit and resubmit, delete pending',
        production: 'Item menu',
        design: 'Edit and Delete on each pending item, Resubmitted Post marker',
        status: 'Covered',
      },
      {
        surface: 'Pinned posts',
        production:
          'Pin to top, Bring forward, Send backward; members collapse them',
        design:
          'Pinned posts row above the feed (Reddit’s highlights); X’s single pinned post kept as a test variant',
        status: 'Covered',
      },
      {
        surface: 'Welcome post',
        production: 'PostType.Welcome, editable by WelcomePostEdit',
        design:
          'The first pinned post; on a fed page the feed strip explains the source',
        status: 'Covered',
      },
      {
        surface: 'Search this squad',
        production: 'PostsSearch in the feed heading',
        design: 'Not on the page for now; the toolbar is the chips only',
        status: 'Dropped',
      },
      {
        surface: 'Empty feed',
        production: '“Get started by sharing your first post…” to everyone',
        design:
          'Copy per role: connect the feed or write for staff, join to hear for the rest',
        status: 'Changed',
      },
      {
        surface: 'Fed by RSS',
        production: 'Does not exist for squads (machine sources only)',
        design: 'Content feed page, Releases strip, Feed settings',
        status: 'Added',
      },
    ],
  },
  {
    group: 'Manage',
    rows: [
      {
        surface: 'Moderation queue',
        production:
          'Approve all, spam warnings, poll item, Decline with ten reasons, all-done state',
        design:
          'Moderation in the Manage area, all of it, with the queue count in the menu',
        status: 'Covered',
      },
      {
        surface: 'Members modal',
        production:
          'Followers / Moderators / Blocked members, search, Copy invitation link, role menu, Unblock',
        design: 'Followers page from the count, and in the Manage area',
        status: 'Covered',
      },
      {
        surface: 'Squad settings',
        production:
          'Details, Squad type, Moderation settings, Integrations, Danger zone',
        design:
          'The Manage area: Details, Posting and invitations, Integrations, Danger zone, under a grouped menu like profile settings',
        status: 'Covered',
      },
      {
        surface: 'Analytics',
        production: 'Impressions, Unique reach, 45-day chart, numbers list',
        design:
          'Analytics in the Manage area, same sections; a summary widget in the right column for admins',
        status: 'Covered',
      },
      {
        surface: 'Delete squad',
        production: 'Danger zone and the menu, with the prompt',
        design: 'Both places; the prompt stays',
        status: 'Covered',
      },
      {
        surface: 'Leave squad',
        production: 'Menu, prompt “Leave {name}”, toast',
        design: 'Unfollow in the menu; prompt and toast unchanged',
        status: 'Covered',
      },
      {
        surface: 'Promotion tour, Squad tour',
        production: 'Carousels in modals',
        design: 'Unchanged, opened from the menu and notifications',
        status: 'Elsewhere',
      },
      {
        surface: 'Preview as',
        production: 'None',
        design:
          'View as a visitor, a switch at the top of the right column; the page renders as a non-follower sees it',
        status: 'Added',
      },
    ],
  },
  {
    group: 'Around the page',
    rows: [
      {
        surface: 'Directory, category pages, My Squads',
        production: '/squads/discover/**',
        design: 'Unchanged',
        status: 'Elsewhere',
      },
      {
        surface: 'Squads rail tab, sidebar rows, pin to sidebar',
        production: 'NetworkSection',
        design: 'Unchanged; the rail stays',
        status: 'Elsewhere',
      },
      {
        surface: 'Feed cards, squad ads, entity card, comment join banner',
        production: 'Cards and post page',
        design: 'Unchanged',
        status: 'Elsewhere',
      },
      {
        surface: 'Share to squad from a post',
        production: 'SquadsToShare',
        design: 'Unchanged',
        status: 'Elsewhere',
      },
      {
        surface: 'Create squad',
        production: '/squads/new, NewSquadModal',
        design: 'Unchanged; a company page is created by daily.dev',
        status: 'Elsewhere',
      },
      {
        surface: 'Bounties, leaderboard',
        production: 'None',
        design: 'None',
        status: 'Neither',
      },
    ],
  },
  {
    group: 'New in the direction',
    rows: [
      {
        surface: 'Kind chips on the feed',
        production: 'None (one feed, no filters)',
        design:
          'All, Releases, Discussions, Polls; About joins them below laptop width',
        status: 'Added',
      },
      {
        surface: 'Products',
        production: 'None',
        design:
          'A shelf above the feed, a Products page, Add product for admins',
        status: 'Added',
      },
      {
        surface: 'Verified company page badge',
        production: 'None (VerifiedCompanyUserBadge is user-only)',
        design: 'Aurora card at the top of the right column',
        status: 'Added',
      },
      {
        surface: 'Composer',
        production: 'Share post bar: URL field and reading history',
        design:
          'The box opens the new composer in free form; Share a link and Poll as shortcuts',
        status: 'Changed',
      },
      {
        surface: 'Manage area',
        production:
          'None (settings, moderation and analytics are separate routes and a modal)',
        design:
          'One settings area opened by Edit page, like Edit profile: grouped menu beside the page on laptop, list then page on phones',
        status: 'Added',
      },
      {
        surface: 'Sub-pages',
        production: 'Modals and separate routes',
        design:
          'They replace the centre card under one header: back, the title, one action',
        status: 'Changed',
      },
    ],
  },
];

const tone: Record<Status, string> = {
  Covered: 'text-status-success',
  Added: 'text-accent-cabbage-default',
  Changed: 'text-accent-cheese-default',
  Elsewhere: 'text-text-tertiary',
  Dropped: 'text-text-quaternary',
  Neither: 'text-text-quaternary',
};

const statusLabel: Record<Status, string> = {
  Covered: 'Covered',
  Added: 'Added',
  Changed: 'Changed',
  Elsewhere: 'Elsewhere',
  Dropped: 'Dropped',
  Neither: 'Not in production, not in the design',
};

const CoverageTable = ({ rows }: { rows: Row[] }): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full min-w-[64rem] border-collapse text-left">
      <thead>
        <tr className="bg-surface-float">
          {['Surface', 'Production today', 'New design', 'Status'].map(
            (cell) => (
              <th
                key={cell}
                className="px-4 py-3 font-bold text-text-secondary typo-caption1"
              >
                {cell}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.surface}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            <td className="px-4 py-3 font-bold text-text-primary typo-footnote">
              {row.surface}
            </td>
            <td className="px-4 py-3 text-text-tertiary typo-footnote">
              {row.production}
            </td>
            <td className="px-4 py-3 text-text-secondary typo-footnote">
              {row.design}
            </td>
            <td
              className={classNames(
                'whitespace-nowrap px-4 py-3 font-bold typo-footnote',
                tone[row.status],
              )}
            >
              {statusLabel[row.status]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <h2 className="font-bold typo-title2">{title}</h2>
    {children}
  </section>
);

const counts = coverage
  .flatMap((group) => group.rows)
  .reduce<Record<Status, number>>(
    (acc, row) => ({ ...acc, [row.status]: (acc[row.status] ?? 0) + 1 }),
    { Covered: 0, Added: 0, Changed: 0, Elsewhere: 0, Dropped: 0, Neither: 0 },
  );

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · Production parity"
      title="Everything the squad page does today"
      intro={
        <>
          <p>
            An audit of the production squad and source code (the routes under
            /squads and /sources, the squads components, the hooks and the
            GraphQL model), every state it can be in, and where each one lives
            in the new design. The cases below render the ones that were missing
            before this pass; the tables list all of them.
          </p>
          <p>
            Statuses: <b className={tone.Covered}>Covered</b> is the same thing
            in a new seat, <b className={tone.Added}>Added</b> is new in the
            design, <b className={tone.Changed}>Changed</b> is a deliberate
            difference, <b className={tone.Elsewhere}>Elsewhere</b> is a surface
            outside this page that stays as it is,{' '}
            <b className={tone.Dropped}>Dropped</b> is gone on purpose, and{' '}
            <b className={tone.Neither}>{statusLabel.Neither}</b> is a pattern
            other platforms have that squads never had and the design does not
            add.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 typo-callout">
            {(Object.keys(counts) as Status[]).map((status) => (
              <span
                key={status}
                className={classNames('font-bold', tone[status])}
              >
                {counts[status]} {statusLabel[status]}
              </span>
            ))}
          </p>
        </>
      }
    >
      <Section title="Cases added in this pass">
        <div className="flex flex-col gap-12">
          {productionCases.map((useCase) => (
            <Case key={useCase.id} useCase={useCase} />
          ))}
        </div>
      </Section>

      {coverage.map((group) => (
        <Section key={group.group} title={group.group}>
          <CoverageTable rows={group.rows} />
        </Section>
      ))}

      <Section title="Production quirks the redesign fixes">
        <ul className="flex max-w-[80ch] list-disc flex-col gap-2 pl-5 text-text-secondary typo-callout">
          <li>
            Logged-out visitors never see Join on a public squad: the button
            waits for a content-preference query that only runs logged in. The
            design shows Sign up to join.
          </li>
          <li>
            The cover image can be uploaded but never shows on the page. The
            design shows it.
          </li>
          <li>
            A blocked member still gets the notifications bell and Leave Squad.
            The design treats blocked as blocked.
          </li>
          <li>
            An author with nothing pending sees loading skeletons forever on the
            pending list. The design shows the all-done copy.
          </li>
          <li>
            The empty feed tells anonymous visitors to share their first post.
            The design speaks to the role.
          </li>
          <li>
            The settings page does not check the Edit permission client side.
            Settings is admin-only in the design.
          </li>
          <li>
            The rejection alert is missing a space after the colon and the
            duplicate-post warning has a stray quote. Both fixed in the copy
            here.
          </li>
        </ul>
      </Section>

      <Section title="What the fed company page adds on top">
        <p className="max-w-[76ch] text-text-secondary typo-callout">
          Nothing above changes for a verified company page. It is a squad with
          three additions: the verified badge, the content feed that fills
          Releases from the company&apos;s RSS (with Feed settings in place of
          New release, and the feed listed under Integrations), and the
          daily.dev manager on the Content feed page. Every gate, role, state
          and menu item here applies to it unchanged; the source is{' '}
          {ContentSource.Feed} by default in these stories.
        </p>
      </Section>
    </Page>
  ),
};
