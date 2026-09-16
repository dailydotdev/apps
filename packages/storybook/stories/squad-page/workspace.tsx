import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AddUserIcon,
  AnalyticsIcon,
  ArrowIcon,
  BellIcon,
  CalendarIcon,
  CompassIcon,
  CoreIcon,
  DiscussIcon,
  DocsIcon,
  DragIcon,
  EyeCancelIcon,
  HomeIcon,
  HotIcon,
  JobIcon,
  LinkIcon,
  LockIcon,
  MegaphoneIcon,
  MenuIcon,
  OpenLinkIcon,
  PinIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  SendAirplaneIcon,
  SettingsIcon,
  SquadIcon,
  TerminalIcon,
  TimerIcon,
  TrendingIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import type { TeamMember } from './data';
import {
  feedEntries,
  formatCount,
  formatSince,
  jobs,
  pinnedEntry,
  squad,
  stack,
  team,
} from './data';
import { Avatar, CardList, Facepile, VerifiedMark, Viewer } from './kit';
import { Composer, Kit2Styles, LeaderboardBody } from './kit2';

// Round three: the Whop mindset. A squad is not a page with widgets, it is a
// workspace. The owner composes a left column of pages (a feed, a chat, a
// document, a link, a bounty board, a job list), each page type renders its
// own UI in the main area, and the app's own rail stays where it is. Three
// columns, like Whop: communities rail, this community's pages, the page.

/* ------------------------------------------------------------- page model */

export enum PageType {
  Home = 'home',
  Feed = 'feed',
  Doc = 'doc',
  Chat = 'chat',
  Link = 'link',
  Jobs = 'jobs',
  Bounties = 'bounties',
  Leaderboard = 'leaderboard',
  Members = 'members',
  Stack = 'stack',
  Events = 'events',
  Analytics = 'analytics',
  Moderation = 'moderation',
  Settings = 'settings',
  Add = 'add',
}

export interface SquadPage {
  id: string;
  label: string;
  type: PageType;
  /** Unread or open count, shown as a bubble. */
  badge?: number;
  /** Only admins and moderators can post. */
  restricted?: boolean;
  /** Opens outside daily.dev. */
  href?: string;
}

export interface SidebarSection {
  id: string;
  label?: string;
  pages: SquadPage[];
  /** Only rendered for admins. */
  admin?: boolean;
}

export const sections: SidebarSection[] = [
  {
    id: 'top',
    pages: [
      { id: 'home', label: 'Home', type: PageType.Home },
      {
        id: 'announcements',
        label: 'Announcements',
        type: PageType.Feed,
        badge: 2,
        restricted: true,
      },
      { id: 'chat', label: 'Chat', type: PageType.Chat, badge: 14 },
    ],
  },
  {
    id: 'start',
    label: 'Get started',
    pages: [
      { id: 'start-here', label: 'Start here', type: PageType.Doc },
      { id: 'rules', label: 'Rules and how to post', type: PageType.Doc },
      { id: 'faq', label: 'FAQ', type: PageType.Doc },
    ],
  },
  {
    id: 'earn',
    label: 'Earn',
    pages: [
      { id: 'bounties', label: 'Bounties', type: PageType.Bounties, badge: 3 },
      { id: 'leaderboard', label: 'Leaderboard', type: PageType.Leaderboard },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    pages: [
      { id: 'jobs', label: 'Open roles', type: PageType.Jobs, badge: 2 },
      { id: 'stack', label: 'Stack and tools', type: PageType.Stack },
      { id: 'team', label: 'Team', type: PageType.Members },
      {
        id: 'website',
        label: 'daily.dev',
        type: PageType.Link,
        href: 'https://daily.dev',
      },
      {
        id: 'github',
        label: 'GitHub',
        type: PageType.Link,
        href: 'https://github.com/dailydotdev',
      },
    ],
  },
  {
    id: 'manage',
    label: 'Manage',
    admin: true,
    pages: [
      { id: 'analytics', label: 'Analytics', type: PageType.Analytics },
      {
        id: 'moderation',
        label: 'Moderation',
        type: PageType.Moderation,
        badge: 3,
      },
      { id: 'settings', label: 'Settings', type: PageType.Settings },
    ],
  },
];

export const allPages = sections.flatMap((section) => section.pages);

export const pageIcon = (type: PageType, size = IconSize.Small): ReactElement =>
  ({
    [PageType.Home]: <HomeIcon size={size} />,
    [PageType.Feed]: <MegaphoneIcon size={size} />,
    [PageType.Doc]: <DocsIcon size={size} />,
    [PageType.Chat]: <DiscussIcon size={size} />,
    [PageType.Link]: <OpenLinkIcon size={size} />,
    [PageType.Jobs]: <JobIcon size={size} />,
    [PageType.Bounties]: <CoreIcon size={size} />,
    [PageType.Leaderboard]: <TrendingIcon size={size} />,
    [PageType.Members]: <UserIcon size={size} />,
    [PageType.Stack]: <TerminalIcon size={size} />,
    [PageType.Events]: <CalendarIcon size={size} />,
    [PageType.Analytics]: <AnalyticsIcon size={size} />,
    [PageType.Moderation]: <TimerIcon size={size} />,
    [PageType.Settings]: <SettingsIcon size={size} />,
    [PageType.Add]: <PlusIcon size={size} />,
  }[type]);

/** What an admin can add. The catalogue is the product. */
export const pageCatalogue: {
  type: PageType;
  title: string;
  description: string;
  exists: boolean;
}[] = [
  {
    type: PageType.Feed,
    title: 'Feed',
    description:
      'A stream of posts. Restrict posting to admins and it becomes Announcements.',
    exists: true,
  },
  {
    type: PageType.Doc,
    title: 'Page',
    description:
      'A long-form document: a welcome, the rules, an FAQ, a roadmap. A freeform post, rendered as a page.',
    exists: true,
  },
  {
    type: PageType.Chat,
    title: 'Chat',
    description: 'A real-time room for members. New for daily.dev.',
    exists: false,
  },
  {
    type: PageType.Link,
    title: 'Link',
    description: 'Website, GitHub, Discord, Slack. Opens in a new tab.',
    exists: true,
  },
  {
    type: PageType.Jobs,
    title: 'Open roles',
    description: 'Your Recruiter listings, inside the squad.',
    exists: true,
  },
  {
    type: PageType.Bounties,
    title: 'Bounties',
    description:
      'Pay Cores for the content you want: tutorials, reviews, integrations.',
    exists: false,
  },
  {
    type: PageType.Leaderboard,
    title: 'Leaderboard',
    description: 'Top contributors this week, month, all time.',
    exists: false,
  },
  {
    type: PageType.Events,
    title: 'Events',
    description: 'Livestreams, office hours, launches. With reminders.',
    exists: false,
  },
  {
    type: PageType.Members,
    title: 'Members',
    description: 'Everyone in the squad, with the team on top.',
    exists: true,
  },
  {
    type: PageType.Stack,
    title: 'Stack and tools',
    description: 'What the company builds with.',
    exists: true,
  },
];

/* ------------------------------------------------------------------ shell */

const shellCss = `
.ws-scroll { scrollbar-width: thin; scrollbar-color: var(--theme-border-subtlest-tertiary) transparent; }
.ws-item .ws-item-tools { opacity: 0; }
.ws-item:hover .ws-item-tools { opacity: 1; }
.ws-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, color-mix(in srgb, var(--theme-background-default), transparent 20%), transparent 60%);
}
`;

export const WorkspaceStyles = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: shellCss }} />
);

const railTab =
  'flex w-full flex-col items-center gap-0.5 rounded-12 px-1 py-2 typo-caption2 text-text-tertiary hover:bg-surface-hover hover:text-text-primary';

/** The v2 rail, as it is today. Nothing here changes for the workspace. */
const Rail = (): ReactElement => (
  <nav className="flex w-20 shrink-0 flex-col items-center gap-0.5 border-r border-border-subtlest-tertiary px-2 py-3">
    <a
      href="/"
      aria-label="Home"
      className="mb-2 flex size-10 items-center justify-center"
    >
      <LogoIcon className={{ container: 'h-6 w-6' }} />
    </a>
    <button
      type="button"
      className="mb-2 flex size-9 items-center justify-center rounded-12 bg-text-primary text-background-default"
      aria-label="New post"
    >
      <PlusIcon size={IconSize.Medium} />
    </button>
    <button type="button" className={railTab}>
      <SearchIcon size={IconSize.Medium} />
      Search
    </button>
    <button type="button" className={railTab}>
      <CompassIcon size={IconSize.Medium} className="scale-105" />
      Explore
    </button>
    <button
      type="button"
      className={classNames(railTab, 'bg-surface-float !text-text-primary')}
    >
      <SquadIcon size={IconSize.Medium} secondary />
      Squads
    </button>
    <button type="button" className={railTab}>
      <HotIcon size={IconSize.Medium} />
      Streak
    </button>
    <div className="mt-auto flex flex-col items-center gap-2">
      <button type="button" className={railTab}>
        <BellIcon size={IconSize.Medium} />
      </button>
      <Avatar member={team[2]} size={2} />
    </div>
  </nav>
);

const Badge = ({ value }: { value: number }): ReactElement => (
  <span className="sq-nums ml-auto rounded-8 bg-surface-float px-1.5 font-bold text-text-tertiary typo-caption2">
    {value}
  </span>
);

const SidebarItem = ({
  page,
  active,
  admin,
  onSelect,
}: {
  page: SquadPage;
  active: boolean;
  admin: boolean;
  onSelect: (page: SquadPage) => void;
}): ReactElement => (
  <button
    type="button"
    onClick={() => onSelect(page)}
    className={classNames(
      'ws-item group flex w-full items-center gap-2 rounded-10 px-2 py-1.5 text-left typo-callout',
      active
        ? 'bg-surface-float font-bold text-text-primary'
        : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
    )}
  >
    <span
      className={classNames('flex shrink-0', active && 'text-text-primary')}
    >
      {pageIcon(page.type)}
    </span>
    <span className="truncate">{page.label}</span>
    {page.restricted && (
      <LockIcon
        size={IconSize.XSmall}
        className="shrink-0 text-text-quaternary"
      />
    )}
    {typeof page.badge === 'number' && <Badge value={page.badge} />}
    {admin && (
      <span
        className={classNames(
          'ws-item-tools flex items-center gap-1 text-text-quaternary',
          typeof page.badge !== 'number' && 'ml-auto',
        )}
      >
        <EyeCancelIcon size={IconSize.XSmall} />
        <DragIcon size={IconSize.XSmall} />
      </span>
    )}
  </button>
);

export const SquadSidebar = ({
  active,
  viewer,
  onSelect,
  className,
}: {
  active: SquadPage;
  viewer: Viewer;
  onSelect: (page: SquadPage) => void;
  className?: string;
}): ReactElement => {
  const admin = viewer === Viewer.Admin;

  return (
    <aside
      className={classNames(
        'ws-scroll flex w-64 shrink-0 flex-col overflow-y-auto border-r border-border-subtlest-tertiary',
        className,
      )}
    >
      <header className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
        <img
          src={squad.image}
          alt=""
          className="size-9 rounded-10 object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1 truncate font-bold text-text-primary typo-callout">
            {squad.name}
            <VerifiedMark label={false} className="shrink-0" />
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap text-text-tertiary typo-caption1">
            {formatCount(squad.membersCount)} members
            <span className="ml-1 size-1.5 rounded-full bg-status-success" />
            38 online
          </span>
        </div>
      </header>
      {admin && (
        <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-2 text-text-tertiary typo-caption1">
          Preview as
          <span className="flex items-center gap-1 rounded-8 bg-surface-float px-2 py-0.5 font-bold text-text-primary">
            Admin
            <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
          </span>
        </div>
      )}
      <div className="flex flex-col gap-4 px-2 py-3">
        {sections
          .filter((section) => !section.admin || admin)
          .map((section) => (
            <div key={section.id} className="flex flex-col gap-0.5">
              {section.label && (
                <div className="flex items-center justify-between px-2 pb-1">
                  <span className="flex items-center gap-1 font-bold uppercase tracking-wide text-text-quaternary typo-caption2">
                    {section.label}
                    <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
                  </span>
                  {admin && (
                    <button
                      type="button"
                      aria-label={`Add a page to ${section.label}`}
                      className="text-text-quaternary hover:text-text-primary"
                      onClick={() =>
                        onSelect({
                          id: 'add',
                          label: 'Add a page',
                          type: PageType.Add,
                        })
                      }
                    >
                      <PlusIcon size={IconSize.XSmall} />
                    </button>
                  )}
                </div>
              )}
              {section.pages.map((page) => (
                <SidebarItem
                  key={page.id}
                  page={page}
                  active={page.id === active.id}
                  admin={admin}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ))}
        {admin && (
          <button
            type="button"
            onClick={() =>
              onSelect({ id: 'add', label: 'Add a page', type: PageType.Add })
            }
            className={classNames(
              'flex items-center gap-2 rounded-10 border border-dashed border-border-subtlest-secondary px-2 py-1.5 text-text-tertiary typo-callout hover:border-border-subtlest-primary hover:text-text-primary',
              active.type === PageType.Add &&
                'border-border-subtlest-primary text-text-primary',
            )}
          >
            <PlusIcon size={IconSize.Small} />
            Add a page
          </button>
        )}
      </div>
      {viewer === Viewer.Visitor && (
        <div className="mt-auto border-t border-border-subtlest-tertiary p-3">
          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Medium}
            className="w-full"
          >
            Join squad
          </Button>
        </div>
      )}
    </aside>
  );
};

/** Every page's top strip: where you are, and what you can do here. */
const PageBar = ({
  page,
  children,
}: {
  page: SquadPage;
  children?: ReactNode;
}): ReactElement => (
  <div className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-default px-6">
    <span className="text-text-tertiary">{pageIcon(page.type)}</span>
    <span className="font-bold text-text-primary typo-callout">
      {page.label}
    </span>
    {page.restricted && (
      <span className="ml-1 flex items-center gap-1 rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1">
        <LockIcon size={IconSize.XSmall} />
        Admins and moderators post here
      </span>
    )}
    <div className="ml-auto flex items-center gap-1">{children}</div>
  </div>
);

const IconButton = ({
  icon,
  label,
}: {
  icon: ReactElement;
  label: string;
}): ReactElement => (
  <Button
    variant={ButtonVariant.Float}
    size={ButtonSize.Small}
    icon={icon}
    aria-label={label}
  />
);

/* ------------------------------------------------------------------ pages */

const Column = ({
  children,
  width = 'max-w-[46rem]',
  className,
}: {
  children: ReactNode;
  width?: string;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'mx-auto flex w-full flex-col gap-5 px-6 py-6',
      width,
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Home is Whop's identity block in daily.dev's clothes: a short cover with
 * the logo at its foot, name, one line of meta, "joined by" as proof, then
 * the feed. It is the only page with an identity block; the sidebar carries
 * the name everywhere else.
 */
const HomePage = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <Column>
    <div className="flex flex-col gap-4">
      <div className="ws-cover relative h-36 overflow-hidden rounded-16">
        <img
          src={squad.headerImage}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="-mt-12 flex items-end gap-4 px-4">
        <img
          src={squad.image}
          alt=""
          className="sq-elevated relative size-20 shrink-0 rounded-16 bg-background-default object-cover ring-4 ring-background-default"
        />
        <div className="relative flex min-w-0 flex-1 items-end justify-between gap-4 pb-1">
          <div className="flex flex-col">
            <h1 className="flex items-center gap-2 font-bold text-text-primary typo-title2">
              {squad.name}
              <VerifiedMark label={false} />
            </h1>
            <span className="text-text-tertiary typo-footnote">
              @{squad.handle} ·{' '}
              <span className="text-text-link">{squad.category}</span>
              {' · '}Since {formatSince(squad.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {viewer === Viewer.Visitor ? (
              <Button
                variant={ButtonVariant.Primary}
                color={ButtonColor.Cabbage}
                size={ButtonSize.Medium}
              >
                Join squad
              </Button>
            ) : (
              <>
                <IconButton icon={<AddUserIcon />} label="Invite" />
                <IconButton icon={<BellIcon />} label="Notifications" />
              </>
            )}
            <IconButton icon={<MenuIcon />} label="More" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-4">
        <p className="text-text-secondary typo-callout">{squad.tagline}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-tertiary typo-footnote">
          <span>{squad.company.location}</span>
          <span className="text-text-quaternary">·</span>
          <span className="flex items-center gap-1">
            Created by <Avatar member={team[0]} size={1.125} />
            <span className="text-text-primary">{team[0].name}</span>
          </span>
          <span className="text-text-quaternary">·</span>
          <span className="flex items-center gap-1 text-text-link">
            <OpenLinkIcon size={IconSize.XSmall} /> daily.dev
          </span>
        </div>
        <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
          <Facepile members={team} max={3} size={1.25} />
          Joined by <span className="text-text-primary">
            {team[3].name}
          </span>, <span className="text-text-primary">{team[4].name}</span> and{' '}
          {formatCount(squad.membersCount - 2)} others
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-2.5">
      <PinIcon size={IconSize.Small} className="text-text-tertiary" />
      <span className="truncate text-text-primary typo-callout">
        {pinnedEntry.title}
      </span>
      <span className="ml-auto whitespace-nowrap text-text-quaternary typo-footnote">
        Pinned
      </span>
    </div>
    {viewer !== Viewer.Visitor && <Composer />}
    <CardList entries={feedEntries.slice(0, 4)} />
  </Column>
);

const FeedPage = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <Column>
    {viewer === Viewer.Admin && <Composer member={team[2]} />}
    <CardList entries={feedEntries.slice(0, 5)} />
  </Column>
);

const chat: { member: TeamMember; text: string; time: string }[] = [
  {
    member: team[3],
    text: 'API tokens are live for everyone. Non-Plus limits are 200 req/month for now, tell me if that feels tight.',
    time: '09:12',
  },
  {
    member: team[4],
    text: 'Claude Code integration guide is up, statusline plugin uses the same token.',
    time: '09:15',
  },
  {
    member: team[6],
    text: 'Seeing a spike in token creation already. 340 in the first hour.',
    time: '09:41',
  },
  {
    member: team[1],
    text: 'World redesign with a coding agent: anyone tried it with Cursor yet? Curious how the preview behaves.',
    time: '10:03',
  },
  {
    member: team[2],
    text: 'Cursor works. The preview is local first, then publish. I will post a short clip in Announcements.',
    time: '10:06',
  },
];

const ChatPage = (): ReactElement => (
  <div className="flex h-full flex-col">
    <div className="ws-scroll flex flex-1 flex-col justify-end gap-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto mb-6 flex flex-col items-center gap-2 text-center">
        <img src={squad.image} alt="" className="size-14 rounded-16" />
        <span className="font-bold text-text-primary typo-title3">#chat</span>
        <span className="max-w-[40ch] text-text-tertiary typo-footnote">
          The room for {squad.name}. Members only, kept for 30 days.
        </span>
      </div>
      {chat.map((message, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="flex gap-3 rounded-12 px-3 py-2 hover:bg-surface-float"
        >
          <Avatar member={message.member} size={2.25} />
          <div className="flex min-w-0 flex-col">
            <span className="flex items-baseline gap-2">
              <span className="font-bold text-text-primary typo-callout">
                {message.member.name}
              </span>
              <span className="text-text-quaternary typo-caption1">
                {message.time}
              </span>
            </span>
            <span className="text-text-secondary typo-callout">
              {message.text}
            </span>
          </div>
        </div>
      ))}
    </div>
    <div className="border-t border-border-subtlest-tertiary px-6 py-4">
      <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-3">
        <span className="flex-1 text-text-quaternary typo-callout">
          Message #chat
        </span>
        <SendAirplaneIcon
          size={IconSize.Small}
          className="text-text-tertiary"
        />
      </div>
    </div>
  </div>
);

/** A freeform post, rendered as a page. Whop's "Start here", in our reader. */
const DocPage = ({ page }: { page: SquadPage }): ReactElement => (
  <Column width="max-w-[44rem]" className="gap-6">
    <h1 className="font-bold text-text-primary typo-large-title">
      {page.id === 'start-here'
        ? `Welcome to ${squad.name}`
        : page.id === 'rules'
        ? 'Rules and how to post'
        : 'Frequently asked questions'}
    </h1>
    <p className="text-text-secondary typo-body">
      {page.id === 'start-here'
        ? 'Everything the daily.dev team ships, announced here first. Releases, betas, the reasoning behind changes, and a place to tell us what broke.'
        : page.id === 'rules'
        ? 'This squad is a changelog. Posts from the team are announcements; posts from members are questions, bug reports and feedback about a release.'
        : 'Answers to the questions we get every week, kept current by the team.'}
    </p>
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-16 bg-surface-float">
      <img
        src={feedEntries[0].image ?? ''}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <span className="sq-elevated relative flex size-14 items-center justify-center rounded-full bg-background-default text-text-primary">
        <PlayIcon size={IconSize.Medium} />
      </span>
    </div>
    <h2 className="font-bold text-text-primary typo-title3">Where to start</h2>
    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-text-secondary typo-body">
      <li>
        Read <span className="text-text-link">Announcements</span> for what
        shipped this week.
      </li>
      <li>Turn on notifications for the squad so a release finds you.</li>
      <li>
        Something broke? Post it to Home with the{' '}
        <span className="font-bold">#bug</span> tag and a team member picks it
        up.
      </li>
    </ul>
    <h2 className="font-bold text-text-primary typo-title3">Get involved</h2>
    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-text-secondary typo-body">
      <li>
        Earn Cores on the <span className="text-text-link">Bounties</span>{' '}
        board.
      </li>
      <li>
        The public API is open:{' '}
        <span className="text-text-link">docs.daily.dev/api</span>.
      </li>
    </ul>
    <div className="flex items-center gap-2 border-t border-border-subtlest-tertiary pt-4 text-text-quaternary typo-footnote">
      <Avatar member={team[3]} size={1.25} />
      Maintained by {team[3].name} · Updated 2 days ago
    </div>
  </Column>
);

const bounties = [
  {
    title:
      'Write a tutorial: build a morning briefing agent with the public API',
    reward: 1500,
    claims: 4,
    due: 'Oct 3',
  },
  {
    title: 'Record a 60 second walkthrough of World',
    reward: 800,
    claims: 2,
    due: 'Sep 28',
  },
  {
    title: 'Review the Claude statusline plugin, honestly',
    reward: 500,
    claims: 9,
    due: 'Open',
  },
];

const BountiesPage = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <Column>
    <div className="flex items-center justify-between">
      <p className="max-w-[52ch] text-text-secondary typo-callout">
        Content the team pays for, in Cores. Claim one, post it to the squad,
        get paid when it is accepted.
      </p>
      {viewer === Viewer.Admin && (
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
        >
          New bounty
        </Button>
      )}
    </div>
    <div className="flex flex-col gap-3">
      {bounties.map((bounty) => (
        <div
          key={bounty.title}
          className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-bold text-text-primary typo-callout">
              {bounty.title}
            </span>
            <span className="text-text-tertiary typo-footnote">
              {bounty.claims} claimed · Due {bounty.due}
            </span>
          </div>
          <span className="sq-nums flex items-center gap-1 rounded-10 bg-background-default px-3 py-1.5 font-bold text-text-primary typo-callout">
            <CoreIcon size={IconSize.Small} />
            {formatCount(bounty.reward)}
          </span>
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
            Claim
          </Button>
        </div>
      ))}
    </div>
  </Column>
);

const JobsPage = (): ReactElement => (
  <Column>
    <p className="max-w-[52ch] text-text-secondary typo-callout">
      Open roles at daily.dev, from Recruiter. Apply with your daily.dev
      profile.
    </p>
    <div className="flex flex-col gap-3">
      {jobs.map((job) => (
        <div
          key={job.title}
          className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
        >
          <img src={squad.image} alt="" className="size-10 rounded-10" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-text-primary typo-callout">
              {job.title}
            </span>
            <span className="text-text-tertiary typo-footnote">
              {job.location} · {job.type}
            </span>
          </div>
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
            View role
          </Button>
        </div>
      ))}
    </div>
  </Column>
);

const LeaderboardPage = (): ReactElement => (
  <Column width="max-w-[36rem]">
    <div className="flex items-center gap-1">
      {['This week', 'This month', 'All time'].map((range, index) => (
        <button
          type="button"
          key={range}
          className={classNames(
            'rounded-10 px-3 py-1.5 typo-callout',
            index === 0
              ? 'bg-surface-float font-bold text-text-primary'
              : 'text-text-tertiary',
          )}
        >
          {range}
        </button>
      ))}
    </div>
    <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <LeaderboardBody rows={5} highlight />
    </div>
    <p className="text-text-quaternary typo-footnote">
      Points are upvotes received on posts and comments in this squad.
    </p>
  </Column>
);

const MembersPage = (): ReactElement => (
  <Column>
    <div className="flex flex-col gap-2">
      <span className="font-bold uppercase tracking-wide text-text-quaternary typo-caption2">
        Team
      </span>
      <div className="grid grid-cols-2 gap-3">
        {team.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3"
          >
            <Avatar member={member} size={2.5} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-bold text-text-primary typo-callout">
                {member.name}
              </span>
              <span className="truncate text-text-tertiary typo-footnote">
                {member.title} · {member.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <span className="text-text-tertiary typo-footnote">
      and {formatCount(squad.membersCount - team.length)} members
    </span>
  </Column>
);

const StackPage = (): ReactElement => (
  <Column>
    <p className="max-w-[52ch] text-text-secondary typo-callout">
      What daily.dev is built with.
    </p>
    <div className="grid grid-cols-3 gap-3">
      {stack.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3"
        >
          <img src={item.image} alt="" className="size-6 rounded-6" />
          <span className="font-bold text-text-primary typo-callout">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  </Column>
);

const AddPage = (): ReactElement => (
  <Column width="max-w-[52rem]">
    <div className="flex flex-col gap-1">
      <h1 className="font-bold text-text-primary typo-title2">Add a page</h1>
      <p className="text-text-tertiary typo-callout">
        Pick what the page is. You name it and choose the section afterwards.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {pageCatalogue.map((item) => (
        <button
          type="button"
          key={item.type}
          className="flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left hover:border-border-subtlest-primary"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-10 bg-background-default text-text-primary">
            {pageIcon(item.type, IconSize.Small)}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-2 font-bold text-text-primary typo-callout">
              {item.title}
              {!item.exists && (
                <span className="rounded-6 bg-accent-cabbage-flat px-1.5 text-accent-cabbage-default typo-caption2">
                  New
                </span>
              )}
            </span>
            <span className="text-text-tertiary typo-footnote">
              {item.description}
            </span>
          </span>
        </button>
      ))}
    </div>
  </Column>
);

const AdminPlaceholder = ({ page }: { page: SquadPage }): ReactElement => (
  <Column>
    <div className="flex flex-col items-center gap-2 rounded-16 border border-dashed border-border-subtlest-secondary p-10 text-center">
      <span className="text-text-tertiary">
        {pageIcon(page.type, IconSize.Large)}
      </span>
      <span className="font-bold text-text-primary typo-callout">
        {page.label}
      </span>
      <span className="max-w-[40ch] text-text-tertiary typo-footnote">
        The existing {page.label.toLowerCase()} screen, opened inside the
        workspace instead of on its own route.
      </span>
    </div>
  </Column>
);

const PageBody = ({
  page,
  viewer,
}: {
  page: SquadPage;
  viewer: Viewer;
}): ReactElement => {
  switch (page.type) {
    case PageType.Home:
      return <HomePage viewer={viewer} />;
    case PageType.Feed:
      return <FeedPage viewer={viewer} />;
    case PageType.Chat:
      return <ChatPage />;
    case PageType.Doc:
      return <DocPage page={page} />;
    case PageType.Bounties:
      return <BountiesPage viewer={viewer} />;
    case PageType.Jobs:
      return <JobsPage />;
    case PageType.Leaderboard:
      return <LeaderboardPage />;
    case PageType.Members:
      return <MembersPage />;
    case PageType.Stack:
      return <StackPage />;
    case PageType.Add:
      return <AddPage />;
    default:
      return <AdminPlaceholder page={page} />;
  }
};

const pageBarTools = (page: SquadPage, viewer: Viewer): ReactNode => {
  switch (page.type) {
    case PageType.Home:
    case PageType.Feed:
      return (
        <>
          <IconButton icon={<SearchIcon />} label="Search" />
          {viewer === Viewer.Admin && (
            <IconButton icon={<SettingsIcon />} label="Page settings" />
          )}
        </>
      );
    case PageType.Chat:
      return (
        <>
          <span className="mr-2 flex items-center gap-1 text-text-tertiary typo-caption1">
            <span className="size-1.5 rounded-full bg-status-success" />
            38 online
          </span>
          <IconButton icon={<UserIcon />} label="Members" />
          <IconButton icon={<BellIcon />} label="Notifications" />
        </>
      );
    case PageType.Doc:
      return viewer === Viewer.Admin ? (
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          Edit page
        </Button>
      ) : (
        <IconButton icon={<LinkIcon />} label="Copy link" />
      );
    default:
      return null;
  }
};

/* -------------------------------------------------------------- workspace */

export const WorkspaceShell = ({
  viewer = Viewer.Member,
  initialPage = allPages[0],
  height = 56,
  width = 1440,
}: {
  viewer?: Viewer;
  initialPage?: SquadPage;
  /** rem */
  height?: number;
  width?: number;
}): ReactElement => {
  const [active, setActive] = useState<SquadPage>(initialPage);

  const onSelect = (page: SquadPage) => {
    if (page.href) {
      return;
    }
    setActive(page);
  };

  return (
    <div
      style={{ width, maxWidth: '100%', height: `${height}rem` }}
      className="sq-elevated flex overflow-hidden rounded-16 bg-background-default text-text-primary"
    >
      <WorkspaceStyles />
      <Kit2Styles />
      <Rail />
      <SquadSidebar active={active} viewer={viewer} onSelect={onSelect} />
      <main className="ws-scroll flex min-w-0 flex-1 flex-col overflow-y-auto">
        {active.type !== PageType.Home && (
          <PageBar page={active}>{pageBarTools(active, viewer)}</PageBar>
        )}
        <div
          className={classNames(
            'flex-1',
            active.type === PageType.Chat && 'flex min-h-0 flex-col',
          )}
        >
          <PageBody page={active} viewer={viewer} />
        </div>
      </main>
    </div>
  );
};

export const findPage = (id: string): SquadPage =>
  allPages.find((page) => page.id === id) ?? allPages[0];

export const addPage: SquadPage = {
  id: 'add',
  label: 'Add a page',
  type: PageType.Add,
};
