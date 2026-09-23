import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AddUserIcon,
  AnalyticsIcon,
  ArrowIcon,
  BellIcon,
  CardIcon,
  CompassIcon,
  DiscussIcon,
  DocsIcon,
  DragIcon,
  EyeCancelIcon,
  HomeIcon,
  HotIcon,
  LinkIcon,
  LockIcon,
  MegaphoneIcon,
  MenuIcon,
  OpenLinkIcon,
  PlayIcon,
  PlusIcon,
  PollIcon,
  SearchIcon,
  SettingsIcon,
  SparkleIcon,
  SquadIcon,
  StarIcon,
  TimerIcon,
  UpvoteIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import type { SquadPoll } from './data';
import {
  entriesByMonth,
  feedEntries,
  formatCount,
  formatDay,
  formatSince,
  companyLinks,
  pinnedEntry,
  polls,
  products,
  rules,
  squad,
  team,
} from './data';
import {
  Avatar,
  CardList,
  Facepile,
  linkIcon,
  VerifiedMark,
  Viewer,
} from './kit';
import { Composer, Kit2Styles } from './kit2';
import { PollList } from '@dailydotdev/shared/src/components/cards/poll/PollList';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { PostsToolbar, SquadHome } from './home';

// Round three: the Whop mindset. A squad is not a page with widgets, it is a
// workspace. The owner composes a left column of pages (a feed, a chat, a
// document, a link, a bounty board, a job list), each page type renders its
// own UI in the main area, and the app's own rail stays where it is. Three
// columns, like Whop: communities rail, this community's pages, the page.

/* ------------------------------------------------------------- page model */

export enum PageType {
  Home = 'home',
  /** A saved filter on the squad feed with its own posting rule. */
  Channel = 'channel',
  Releases = 'releases',
  Polls = 'polls',
  Doc = 'doc',
  Rules = 'rules',
  Link = 'link',
  Products = 'products',
  Members = 'members',
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
  /** One line under the channel name on its page. */
  description?: string;
}

export interface SidebarSection {
  id: string;
  label?: string;
  pages: SquadPage[];
  /** Only rendered for admins. */
  admin?: boolean;
}

// The shape every developer community converges on. Reddit calls the channel
// a post flair (Needs help, Discussion, Show and tell, News, Resource,
// Announcement), GitHub Discussions ships the same list as its default
// categories (Announcements, General, Ideas, Polls, Q&A, Show and tell) and
// Discord servers name them #announcements #general #help #showcase #jobs.
// Recurring threads are Reddit's other invention: the monthly Who's hiring,
// the weekly easy-questions thread, Showoff Saturday. Rules and a Read-first
// wiki are the sidebar on every subreddit. daily.dev already has the parts:
// post types, posting gates, scheduled posts, pinning, the welcome post.

const page = (
  id: string,
  label: string,
  type: PageType,
  extra: Partial<SquadPage> = {},
): SquadPage => ({ id, label, type, ...extra });

const channels = {
  discussions: page('discussions', 'Discussions', PageType.Channel, {
    description:
      'Questions, opinions, feedback, bug reports. If it needs an answer, it lives here.',
  }),
  polls: page('polls', 'Polls', PageType.Polls, { badge: 1 }),
};

const docs = {
  rules: page('rules', 'Rules', PageType.Rules),
  faq: page('faq', 'FAQ', PageType.Doc),
};

const common = {
  home: page('home', 'Home', PageType.Home),
  members: page('members', 'Members', PageType.Members),
  products: page('products', 'Products', PageType.Products),
  releases: page('releases', 'Releases', PageType.Releases, { badge: 1 }),
};

const link = (id: string, label: string, href: string): SquadPage =>
  page(id, label, PageType.Link, { href });

const manage: SidebarSection = {
  id: 'manage',
  label: 'Manage',
  admin: true,
  pages: [
    page('analytics', 'Analytics', PageType.Analytics),
    page('moderation', 'Moderation', PageType.Moderation, { badge: 3 }),
    page('settings', 'Settings', PageType.Settings),
  ],
};

export const sections: SidebarSection[] = [
  {
    id: 'top',
    pages: [common.home, common.releases, common.products],
  },
  {
    id: 'channels',
    label: 'Channels',
    pages: [channels.discussions, channels.polls],
  },
  {
    id: 'docs',
    label: 'Documentation',
    pages: [docs.rules, docs.faq],
  },
  {
    id: 'links',
    label: 'Links',
    pages: companyLinks.map((item) => link(item.id, item.label, item.href)),
  },
  manage,
];

export const allPages: SquadPage[] = [
  ...sections.flatMap((section) => section.pages),
  common.members,
].filter(
  (candidate, index, list) =>
    list.findIndex((other) => other.id === candidate.id) === index,
);

export const pageIcon = (type: PageType, size = IconSize.Small): ReactElement =>
  ({
    [PageType.Home]: <HomeIcon size={size} />,
    [PageType.Channel]: <MegaphoneIcon size={size} />,
    [PageType.Releases]: <SparkleIcon size={size} secondary />,
    [PageType.Polls]: <PollIcon size={size} />,
    [PageType.Doc]: <DocsIcon size={size} />,
    [PageType.Rules]: <DocsIcon size={size} />,
    [PageType.Link]: <LinkIcon size={size} />,
    [PageType.Products]: <CardIcon size={size} />,
    [PageType.Members]: <UserIcon size={size} />,
    [PageType.Analytics]: <AnalyticsIcon size={size} />,
    [PageType.Moderation]: <TimerIcon size={size} />,
    [PageType.Settings]: <SettingsIcon size={size} />,
    [PageType.Add]: <PlusIcon size={size} />,
  }[type]);

/** Channels get their own glyphs; everything else keeps the type's. */
const channelIcons: Record<string, ReactElement> = {
  discussions: <DiscussIcon size={IconSize.Small} />,
  polls: <PollIcon size={IconSize.Small} />,
};

export const iconFor = (item: SquadPage): ReactElement =>
  channelIcons[item.id] ??
  (item.type === PageType.Link ? linkIcon(item.id) : pageIcon(item.type));

/** What an admin can add, grouped the way a community thinks about it. */
export const pageCatalogue: {
  group: string;
  items: {
    type: PageType;
    title: string;
    description: string;
    exists: boolean;
  }[];
}[] = [
  {
    group: 'Channels',
    items: [
      {
        type: PageType.Channel,
        title: 'Discussions',
        description:
          'The feed, with a posting rule. Questions, feedback and bug reports live here too.',
        exists: true,
      },
      {
        type: PageType.Polls,
        title: 'Polls',
        description:
          'The poll post type, on its own page. The team asks, members vote.',
        exists: true,
      },
    ],
  },
  {
    group: 'Documentation',
    items: [
      {
        type: PageType.Rules,
        title: 'Rules',
        description:
          'Numbered, one line each, expandable. Also shown on Home and before a first post.',
        exists: false,
      },
      {
        type: PageType.Doc,
        title: 'FAQ or wiki',
        description: 'A freeform post rendered as a page.',
        exists: true,
      },
      {
        type: PageType.Doc,
        title: 'Page',
        description: 'Any long-form document: a welcome, a roadmap, a guide.',
        exists: true,
      },
    ],
  },
  {
    group: 'Company',
    items: [
      {
        type: PageType.Releases,
        title: 'Releases',
        description:
          'Every release post as a log, grouped by month, filterable by kind. Reads like GitHub Releases.',
        exists: false,
      },
      {
        type: PageType.Products,
        title: 'Products',
        description:
          'Everything the company makes. Imported from Product Hunt, G2, GitHub or a URL; each row links to the member stack.',
        exists: false,
      },
    ],
  },
  {
    group: 'Links and people',
    items: [
      {
        type: PageType.Link,
        title: 'Link',
        description:
          'Docs, GitHub, X, YouTube, LinkedIn, Discord. Opens in a new tab.',
        exists: true,
      },
      {
        type: PageType.Members,
        title: 'Members',
        description: 'Everyone in the squad, with the team on top.',
        exists: true,
      },
    ],
  },
];

/* ------------------------------------------------------------------ shell */

const shellCss = `
.ws-scroll { scrollbar-width: thin; scrollbar-color: var(--theme-border-subtlest-tertiary) transparent; }
.ws-item .ws-item-tools { opacity: 0; }
.ws-active::before {
  content: '';
  position: absolute;
  left: -0.5rem;
  top: 0.4rem;
  bottom: 0.4rem;
  width: 2px;
  border-radius: 2px;
  background: var(--theme-accent-cabbage-default);
}
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
      'ws-item group relative flex w-full items-center gap-2.5 rounded-10 px-2.5 py-1.5 text-left typo-callout transition-colors',
      active
        ? 'ws-active bg-surface-float font-bold text-text-primary'
        : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
    )}
  >
    <span
      className={classNames(
        'flex shrink-0',
        active
          ? 'text-text-primary'
          : 'text-text-quaternary group-hover:text-text-primary',
      )}
    >
      {iconFor(page)}
    </span>
    <span className="truncate">{page.label}</span>
    {page.href && (
      <OpenLinkIcon
        size={IconSize.XSmall}
        className="ml-auto shrink-0 text-text-quaternary opacity-0 transition-opacity group-hover:opacity-100"
      />
    )}
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
      <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary p-4">
        <div className="flex items-center gap-3">
          <img
            src={squad.image}
            alt=""
            className="size-10 rounded-12 bg-background-default object-cover ring-1 ring-border-subtlest-tertiary"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1 truncate font-bold text-text-primary typo-callout">
              {squad.name}
              <VerifiedMark label={false} className="shrink-0" />
            </span>
            <span className="truncate text-text-tertiary typo-caption1">
              Verified · {squad.company.website}
            </span>
          </div>
        </div>
        {viewer === Viewer.Visitor && (
          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Medium}
            className="w-full"
          >
            Join squad
          </Button>
        )}
        {viewer === Viewer.Member && (
          <div className="grid grid-cols-3 gap-1">
            {[
              [<BellIcon key="bell" size={IconSize.Small} />, 'Alerts'],
              [<AddUserIcon key="invite" size={IconSize.Small} />, 'Invite'],
              [<LinkIcon key="share" size={IconSize.Small} />, 'Share'],
            ].map(([icon, label]) => (
              <button
                type="button"
                key={label as string}
                className="flex flex-col items-center gap-0.5 rounded-10 bg-surface-float py-2 text-text-tertiary typo-caption1 transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        )}
        {admin && (
          <div className="flex items-center justify-between rounded-10 bg-surface-float px-3 py-1.5 text-text-tertiary typo-caption1">
            Preview as
            <span className="flex items-center gap-1 font-bold text-text-primary">
              Admin
              <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
            </span>
          </div>
        )}
      </header>
      <div className="flex flex-col gap-4 px-2 py-3">
        {sections
          .filter((section) => !section.admin || admin)
          .map((section) => (
            <div key={section.id} className="flex flex-col gap-0.5">
              {section.label && (
                <div className="flex items-center justify-between px-2 pb-1">
                  <span className="flex items-center gap-1 font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption2">
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
    <span className="text-text-tertiary">{iconFor(page)}</span>
    <span className="font-bold text-text-primary typo-callout">
      {page.label}
    </span>
    {page.restricted && (
      <span className="ml-1 flex items-center gap-1 rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1">
        <LockIcon size={IconSize.XSmall} />
        Team only
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

/** Home is the profile page's skeleton, for a squad. See home.tsx. */
const HomePage = ({
  viewer,
  onOpenMembers,
  onOpenRules,
  onOpenFaq,
}: {
  viewer: Viewer;
  onOpenMembers: () => void;
  onOpenRules: () => void;
  onOpenFaq: () => void;
}): ReactElement => (
  <SquadHome
    viewer={viewer}
    onOpenMembers={onOpenMembers}
    onOpenRules={onOpenRules}
    onOpenFaq={onOpenFaq}
  />
);

/**
 * A channel is the squad feed filtered to one flair, with a posting rule of
 * its own. The strip under the bar says what belongs here and who may post,
 * the way a subreddit's flair description and posting rule do.
 */
const ChannelPage = ({
  page: channel,
  viewer,
}: {
  page: SquadPage;
  viewer: Viewer;
}): ReactElement => {
  const canPost =
    viewer === Viewer.Admin ||
    (viewer === Viewer.Member && !channel.restricted);

  return (
    <Column>
      {channel.description && (
        <div className="flex items-center justify-between gap-4 rounded-12 bg-surface-float px-4 py-3">
          <span className="text-text-secondary typo-footnote">
            {channel.description}
          </span>
          {canPost ? (
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              Post to {channel.label}
            </Button>
          ) : (
            <span className="flex shrink-0 items-center gap-1 text-text-quaternary typo-caption1">
              <LockIcon size={IconSize.XSmall} />
              {channel.restricted ? 'Team only' : 'Join to post'}
            </span>
          )}
        </div>
      )}
      <PostsToolbar sort="Latest" />
      <CardList entries={feedEntries.slice(0, 5)} />
    </Column>
  );
};

/** Reddit's rules widget, as a page: numbered, one line each, with the why. */
const RulesPage = (): ReactElement => (
  <Column width="max-w-[44rem]" className="gap-6">
    <div className="flex flex-col gap-1">
      <h1 className="font-bold text-text-primary typo-large-title">Rules</h1>
      <p className="text-text-tertiary typo-callout">
        Shown once before your first post. Moderators remove what breaks them.
      </p>
    </div>
    <ol className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
      {rules.map(([title, body], index) => (
        <li key={title} className="flex gap-4 px-5 py-4">
          <span className="sq-nums w-5 shrink-0 font-bold text-text-quaternary typo-callout">
            {index + 1}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-text-primary typo-callout">
              {title}
            </span>
            <span className="text-text-tertiary typo-footnote">{body}</span>
          </div>
        </li>
      ))}
    </ol>
  </Column>
);

/** A freeform post, rendered as a page: the FAQ, or any document. */
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

const releaseKinds = ['All', 'Features', 'Fixes', 'Betas'];

/**
 * The changelog as a log, not a feed: GitHub Releases' shape. Every post
 * flaired as a release lands here grouped by month, newest first, with the
 * kind as a filter. The Announcements channel is where they are discussed;
 * this is where they are found.
 */
const ReleasesPage = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <Column width="max-w-[52rem]" className="gap-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {releaseKinds.map((kind, index) => (
          <button
            type="button"
            key={kind}
            className={classNames(
              'rounded-10 px-3 py-1.5 typo-callout',
              index === 0
                ? 'bg-surface-float font-bold text-text-primary'
                : 'text-text-tertiary hover:text-text-primary',
            )}
          >
            {kind}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="sq-nums text-text-tertiary typo-footnote">
          <b className="text-text-primary">{squad.totalPosts}</b> releases
        </span>
        {viewer === Viewer.Admin && (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
          >
            New release
          </Button>
        )}
      </div>
    </div>
    <div className="flex flex-col gap-8">
      {entriesByMonth.map((group, groupIndex) => (
        <section key={group.month} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption2">
            {group.month}
            {groupIndex === 0 && (
              <span className="rounded-6 bg-accent-cabbage-flat px-1.5 normal-case tracking-normal text-accent-cabbage-default">
                Latest
              </span>
            )}
          </h2>
          <ol className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
            {group.items.map((entry) => (
              <li
                key={entry.id}
                className="group flex gap-4 px-4 py-4 hover:bg-surface-float"
              >
                <time className="sq-nums w-14 shrink-0 pt-0.5 text-text-tertiary typo-footnote">
                  {formatDay(entry.createdAt)}
                </time>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="font-bold text-text-primary typo-callout">
                    {entry.title}
                  </span>
                  <p className="line-clamp-2 text-text-secondary typo-footnote">
                    {entry.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-quaternary typo-caption1">
                    <span className="flex items-center gap-1.5">
                      <Avatar member={entry.author} size={1} />
                      {entry.author.name}
                    </span>
                    {entry.tags.slice(0, 2).map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                    <span className="sq-nums ml-auto flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <UpvoteIcon size={IconSize.XSmall} />
                        {entry.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <DiscussIcon size={IconSize.XSmall} />
                        {entry.comments}
                      </span>
                    </span>
                  </div>
                </div>
                {entry.image && (
                  <img
                    src={entry.image}
                    alt=""
                    className="h-14 w-24 shrink-0 rounded-10 object-cover"
                  />
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  </Column>
);

const noop = () => undefined;
const cardHandlers = {
  onPostClick: noop,
  onPostAuxClick: noop,
  onUpvoteClick: noop,
  onDownvoteClick: noop,
  onCommentClick: noop,
  onBookmarkClick: noop,
  onCopyLinkClick: noop,
  onShare: noop,
  onReadArticleClick: noop,
};

const pollSource = {
  id: squad.handle,
  handle: squad.handle,
  name: squad.name,
  permalink: squad.permalink,
  image: squad.image,
  type: 'squad' as const,
  active: true,
  public: true,
};

/** A quiz question as a real poll post, so the production poll card renders it. */
const toPollPost = (poll: SquadPoll, picked?: number): Post =>
  ({
    id: poll.id,
    title: poll.question,
    permalink: `https://daily.dev/posts/${poll.id}`,
    commentsPermalink: `https://daily.dev/posts/${poll.id}`,
    createdAt: '2026-09-20T09:00:00.000Z',
    endsAt: poll.endsAt,
    type: PostType.Poll,
    source: pollSource,
    author: {
      id: poll.author.id,
      name: poll.author.name,
      username: poll.author.username,
      image: poll.author.image,
      permalink: `https://daily.dev/${poll.author.username}`,
    },
    numUpvotes: 31,
    numComments: 12,
    numPollVotes: poll.votes,
    pollOptions: poll.options.map((text, index) => ({
      id: `${poll.id}-${index}`,
      text,
      order: index + 1,
      numVotes: Math.round((poll.split[index] / 100) * poll.votes),
    })),
    tags: ['dailydev'],
    userState: {
      vote: UserVote.None,
      flags: { feedbackDismiss: false },
      ...(picked !== undefined && {
        pollOption: { id: `${poll.id}-${picked}` },
      }),
    },
  } as unknown as Post);

/**
 * Polls, on the production poll card. The company asks, members vote in
 * place, the card flips to its results. The click is caught before the
 * card's own vote mutation so the story stays offline.
 */
const PollsPage = ({ viewer }: { viewer: Viewer }): ReactElement => {
  const [votes, setVotes] = useState<Record<string, number>>({});

  return (
    <Column className="gap-4">
      <div className="flex items-center justify-between gap-4 rounded-12 bg-surface-float px-4 py-3">
        <span className="text-text-secondary typo-footnote">
          What the team wants to know from you. One vote each, results when you
          vote.
        </span>
        {viewer === Viewer.Admin ? (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
          >
            New poll
          </Button>
        ) : (
          <span className="sq-nums shrink-0 text-text-quaternary typo-caption1">
            {polls.length} open
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {polls.map((poll) => {
          const picked = votes[poll.id];

          return (
            <div
              key={poll.id}
              onClickCapture={(event) => {
                if (picked !== undefined || viewer === Viewer.Visitor) {
                  return;
                }
                const option = (event.target as HTMLElement)
                  .closest('button')
                  ?.textContent?.trim();
                const index = poll.options.indexOf(option ?? '');
                if (index === -1) {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                setVotes((current) => ({ ...current, [poll.id]: index }));
              }}
            >
              <PollList post={toPollPost(poll, picked)} {...cardHandlers} />
            </div>
          );
        })}
      </div>
    </Column>
  );
};

const importSources = ['Product Hunt', 'G2', 'Trustpilot', 'GitHub', 'A URL'];

/**
 * Everything the company makes, on one page. Listings are imported, not
 * typed: paste a Product Hunt, G2, Trustpilot or GitHub link and the card
 * arrives with the logo, tagline, category and the source's rating. The
 * daily.dev part is the stack: each product is a tool members can add, and
 * the card says how many already have.
 */
const ProductsPage = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <Column width="max-w-[56rem]">
    {viewer === Viewer.Admin ? (
      <div className="flex flex-col gap-3 rounded-16 border border-dashed border-border-subtlest-secondary p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary typo-callout">
            Import a product
          </span>
          <span className="text-text-quaternary typo-caption1">
            Synced weekly. Edit anything after import.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-quaternary typo-callout">
            <LinkIcon size={IconSize.Small} />
            Paste a Product Hunt, G2, Trustpilot, GitHub or website link
          </div>
          <Button variant={ButtonVariant.Primary} size={ButtonSize.Medium}>
            Import
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-text-tertiary typo-caption1">
          <span className="mr-1">Or connect</span>
          {importSources.map((source) => (
            <span
              key={source}
              className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 text-text-secondary"
            >
              {source}
            </span>
          ))}
        </div>
      </div>
    ) : (
      <p className="max-w-[52ch] text-text-secondary typo-callout">
        Everything {squad.company.website} makes. Add one to your stack and it
        shows on your profile.
      </p>
    )}
    {/* Product Hunt's list: logo, name and tagline on one line, chips under,
        and the tall box on the right. Theirs counts upvotes; ours counts
        stacks and is the Add button. */}
    <ol className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
      {products.map((product, index) => (
        <li
          key={product.id}
          className="group flex items-center gap-4 px-4 py-3 hover:bg-surface-float"
        >
          <span className="sq-nums w-5 shrink-0 text-right text-text-quaternary typo-footnote">
            {index + 1}.
          </span>
          <img
            src={product.image}
            alt=""
            className="size-14 shrink-0 rounded-12 bg-background-default object-cover p-1"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="truncate font-bold text-text-primary typo-callout">
                {product.name}
              </span>
              <span className="hidden text-text-quaternary laptop:inline">
                ·
              </span>
              <span className="truncate text-text-secondary typo-callout">
                {product.tagline}
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-tertiary typo-caption1">
              {product.rating && (
                <span className="sq-nums flex items-center gap-1">
                  <StarIcon
                    size={IconSize.XSmall}
                    secondary
                    className="text-text-primary"
                  />
                  <span className="text-text-primary">
                    {product.rating.toFixed(1)}
                  </span>
                  {formatCount(product.reviews ?? 0)} on {product.source}
                </span>
              )}
              <span className="rounded-6 bg-surface-float px-1.5 py-0.5">
                {product.category}
              </span>
              <span className="rounded-6 bg-surface-float px-1.5 py-0.5">
                {product.pricing}
              </span>
              {product.links.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1 hover:text-text-primary"
                >
                  <OpenLinkIcon size={IconSize.XSmall} />
                  {item.label}
                </a>
              ))}
            </span>
          </div>
          <button
            type="button"
            className="sq-nums flex w-16 shrink-0 flex-col items-center gap-0.5 rounded-12 border border-border-subtlest-tertiary bg-background-default py-2 text-text-primary transition-colors hover:border-accent-cabbage-default hover:text-accent-cabbage-default"
            aria-label={`Add ${product.name} to your stack`}
          >
            <PlusIcon size={IconSize.Small} />
            <span className="font-bold typo-callout">
              {formatCount(product.inStacks)}
            </span>
            <span className="text-text-quaternary typo-caption2">stacks</span>
          </button>
        </li>
      ))}
    </ol>
  </Column>
);

const MembersPage = (): ReactElement => (
  <Column>
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1 text-text-tertiary typo-callout">
        <span className="sq-nums font-bold text-text-primary">
          {formatCount(squad.membersCount)}
        </span>
        members
        <span className="mx-1 text-text-quaternary">·</span>
        <span className="size-1.5 rounded-full bg-status-success" />
        <span className="sq-nums text-text-secondary">38</span>
        online
      </span>
      <div className="flex h-9 w-64 items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-quaternary typo-footnote">
        <SearchIcon size={IconSize.Small} />
        Search members
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <span className="font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption2">
        Team
      </span>
      <div className="grid grid-cols-2 gap-2">
        {team.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3"
          >
            <Avatar member={member} size={2.5} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-bold text-text-primary typo-callout">
                {member.name}
              </span>
              <span className="truncate text-text-tertiary typo-footnote">
                {member.title}
              </span>
            </div>
            <span className="shrink-0 rounded-6 bg-background-default px-1.5 py-0.5 text-text-tertiary typo-caption2">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <span className="font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption2">
        Newest members
      </span>
      <div className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-12 border border-border-subtlest-tertiary">
        {[...team]
          .reverse()
          .slice(0, 4)
          .map((member, index) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <Avatar member={member} size={2} />
              <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
                {member.name}
              </span>
              <span className="text-text-quaternary typo-caption1">
                Joined {index + 1}d ago
              </span>
            </div>
          ))}
      </div>
    </div>
  </Column>
);

const AddPage = (): ReactElement => (
  <Column width="max-w-[52rem]" className="gap-8">
    <div className="flex flex-col gap-1">
      <h1 className="font-bold text-text-primary typo-title2">Add a page</h1>
      <p className="text-text-tertiary typo-callout">
        Pick what the page is. You name it and choose the section afterwards.
      </p>
    </div>
    {pageCatalogue.map((group) => (
      <div key={group.group} className="flex flex-col gap-3">
        <span className="font-bold uppercase tracking-wide text-text-quaternary typo-caption2">
          {group.group}
        </span>
        <div className="grid grid-cols-2 gap-3">
          {group.items.map((item) => (
            <button
              type="button"
              key={item.title}
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
      </div>
    ))}
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
  page: current,
  viewer,
  onSelect,
}: {
  page: SquadPage;
  viewer: Viewer;
  onSelect: (page: SquadPage) => void;
}): ReactElement => {
  switch (current.type) {
    case PageType.Home:
      return (
        <HomePage
          viewer={viewer}
          onOpenMembers={() => onSelect(common.members)}
          onOpenRules={() => onSelect(docs.rules)}
          onOpenFaq={() => onSelect(docs.faq)}
        />
      );
    case PageType.Channel:
      return <ChannelPage page={current} viewer={viewer} />;
    case PageType.Releases:
      return <ReleasesPage viewer={viewer} />;
    case PageType.Polls:
      return <PollsPage viewer={viewer} />;
    case PageType.Doc:
      return <DocPage page={current} />;
    case PageType.Rules:
      return <RulesPage />;
    case PageType.Products:
      return <ProductsPage viewer={viewer} />;
    case PageType.Members:
      return <MembersPage />;
    case PageType.Add:
      return <AddPage />;
    default:
      return <AdminPlaceholder page={current} />;
  }
};

const pageBarTools = (page: SquadPage, viewer: Viewer): ReactNode => {
  switch (page.type) {
    case PageType.Home:
    case PageType.Channel:
      return viewer === Viewer.Admin ? (
        <IconButton icon={<SettingsIcon />} label="Page settings" />
      ) : null;
    case PageType.Products:
      return viewer === Viewer.Admin ? (
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          Sync now
        </Button>
      ) : null;
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
        <div className="flex-1">
          <PageBody page={active} viewer={viewer} onSelect={onSelect} />
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
