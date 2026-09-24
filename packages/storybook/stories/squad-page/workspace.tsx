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
  DiscussIcon,
  DocsIcon,
  DragIcon,
  EarthIcon,
  EditIcon,
  EyeCancelIcon,
  HomeIcon,
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
  SlackIcon,
  SparkleIcon,
  StarIcon,
  TimerIcon,
  TrashIcon,
  UpvoteIcon,
  UserIcon,
  VIcon,
  WarningIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
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
  isAdmin,
  isBlocked,
  isJoined,
  isLoggedIn,
  isStaff,
  linkIcon,
  VerifiedMark,
  Viewer,
} from './kit';
import { Composer, Kit2Styles } from './kit2';
import { PollList } from '@dailydotdev/shared/src/components/cards/poll/PollList';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { PostsToolbar, SquadHome } from './home';
import { ClassicSidebar } from './rail';
import type { SquadConfig, WorkspaceState } from './state';
import {
  ContentSource,
  defaultConfig,
  MemberRole,
  PostingGate,
  useWorkspace,
  WorkspaceContext,
} from './state';

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
  /** Where the content comes from: the RSS feed a company page is fed by. */
  Feed = 'feed',
  Add = 'add',
  /** A member's own posts in the queue. */
  Pending = 'pending',
  /** The invitation link landing. */
  Invite = 'invite',
  NotFound = 'not-found',
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
  /** Moderators do not see it; only admins. */
  adminOnly?: boolean;
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

export const channels = {
  discussions: page('discussions', 'Discussions', PageType.Channel, {
    description:
      'Questions, opinions, feedback, bug reports. If it needs an answer, it lives here.',
  }),
  polls: page('polls', 'Polls', PageType.Polls, { badge: 1 }),
};

export const docs = {
  rules: page('rules', 'Rules', PageType.Rules),
  faq: page('faq', 'FAQ', PageType.Doc),
};

export const common = {
  home: page('home', 'Home', PageType.Home),
  members: page('members', 'Followers', PageType.Members),
  products: page('products', 'Products', PageType.Products),
  releases: page('releases', 'Releases', PageType.Releases, { badge: 1 }),
};

/** Pages with no sidebar row: reached from a strip, a link, or a bad URL. */
export const hidden = {
  pending: page('pending', 'Pending posts', PageType.Pending),
  invite: page('invite', 'Invitation', PageType.Invite),
  notFound: page('not-found', 'Not found', PageType.NotFound),
};

const link = (id: string, label: string, href: string): SquadPage =>
  page(id, label, PageType.Link, { href });

export const manage: SidebarSection = {
  id: 'manage',
  label: 'Manage',
  admin: true,
  pages: [
    page('feed', 'Content feed', PageType.Feed, { adminOnly: true }),
    page('moderation', 'Moderation', PageType.Moderation, { badge: 3 }),
    page('analytics', 'Analytics', PageType.Analytics, { adminOnly: true }),
    page('settings', 'Settings', PageType.Settings, { adminOnly: true }),
  ],
};

export {
  ContentSource,
  defaultConfig,
  MemberRole,
  PostingGate,
  postingState,
  useWorkspace,
  WorkspaceContext,
} from './state';
export type { SquadConfig, WorkspaceState } from './state';

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
  ...Object.values(hidden),
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
    [PageType.Feed]: <MegaphoneIcon size={size} />,
    [PageType.Add]: <PlusIcon size={size} />,
    [PageType.Pending]: <TimerIcon size={size} />,
    [PageType.Invite]: <AddUserIcon size={size} />,
    [PageType.NotFound]: <SearchIcon size={size} />,
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
        title: 'Followers',
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

/** Production's sidebar outside layout v2, collapsed to its icons. */
export const Rail = ({ loggedIn }: { loggedIn?: boolean }): ReactElement => (
  <ClassicSidebar loggedIn={loggedIn} />
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
  const admin = isAdmin(viewer);
  const staff = isStaff(viewer);
  const { source, config } = useWorkspace();
  const canInvite = staff || config.memberInviteRole === MemberRole.Member;

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
        {viewer === Viewer.Anonymous && (
          <div className="flex flex-col gap-2">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              className="w-full"
            >
              Sign up to follow
            </Button>
            <span className="text-center text-text-tertiary typo-caption1">
              Already on daily.dev?{' '}
              <span className="text-text-link">Log in</span>
            </span>
          </div>
        )}
        {viewer === Viewer.Visitor && config.isPublic && (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            className="w-full"
          >
            Follow
          </Button>
        )}
        {viewer === Viewer.Visitor && !config.isPublic && (
          <div className="flex items-center gap-2 rounded-10 bg-surface-float px-3 py-2 text-text-tertiary typo-caption1">
            <LockIcon size={IconSize.Small} />
            Private squad. Followers join by invitation link.
          </div>
        )}
        {isBlocked(viewer) && (
          <div className="flex flex-col gap-2">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              className="w-full"
              disabled
            >
              Follow
            </Button>
            <span className="text-center text-text-tertiary typo-caption1">
              You are not allowed to follow this Squad
            </span>
          </div>
        )}
        {(viewer === Viewer.Member || viewer === Viewer.Moderator) && (
          <div
            className={classNames(
              'grid gap-1',
              canInvite ? 'grid-cols-3' : 'grid-cols-2',
            )}
          >
            {[
              [<BellIcon key="bell" size={IconSize.Small} />, 'Alerts'],
              ...(canInvite
                ? [
                    [
                      <AddUserIcon key="invite" size={IconSize.Small} />,
                      'Invite',
                    ],
                  ]
                : []),
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
        {staff && (
          <div className="flex items-center justify-between rounded-10 bg-surface-float px-3 py-1.5 text-text-tertiary typo-caption1">
            Preview as
            <span className="flex items-center gap-1 font-bold text-text-primary">
              {admin ? 'Admin' : 'Moderator'}
              <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
            </span>
          </div>
        )}
      </header>
      <div className="flex flex-col gap-4 px-2 py-3">
        {sections
          .filter((section) => !section.admin || staff)
          .map((section) => ({
            ...section,
            pages: section.pages.filter(
              (item) =>
                (!item.adminOnly || admin) &&
                (item.type !== PageType.Feed || source === ContentSource.Feed),
            ),
          }))
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
export const PageBar = ({
  page,
  children,
}: {
  page: SquadPage;
  children?: ReactNode;
}): ReactElement => (
  <div className="sticky top-0 z-3 flex h-12 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-default px-6">
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
  bare = false,
  className,
}: {
  children: ReactNode;
  width?: string;
  /** Inside another page's column: no width cap or padding of its own. */
  bare?: boolean;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex w-full flex-col gap-5',
      !bare && 'mx-auto px-6 py-6',
      !bare && width,
      className,
    )}
  >
    {children}
  </div>
);

/** Home is the profile page's skeleton, for a squad. See home.tsx. */
const HomePage = ({
  viewer,
  empty,
  onOpenMembers,
  onOpenRules,
  onOpenFaq,
  onOpenPending,
}: {
  viewer: Viewer;
  empty: boolean;
  onOpenMembers: () => void;
  onOpenRules: () => void;
  onOpenFaq: () => void;
  onOpenPending: () => void;
}): ReactElement => (
  <SquadHome
    viewer={viewer}
    empty={empty}
    onOpenMembers={onOpenMembers}
    onOpenRules={onOpenRules}
    onOpenFaq={onOpenFaq}
    onOpenPending={onOpenPending}
  />
);

/**
 * A channel is the squad feed filtered to one flair, with a posting rule of
 * its own. The strip under the bar says what belongs here and who may post,
 * the way a subreddit's flair description and posting rule do.
 */
export const ChannelPage = ({
  page: channel,
  viewer,
}: {
  page: SquadPage;
  viewer: Viewer;
}): ReactElement => {
  const canPost = isStaff(viewer) || (isJoined(viewer) && !channel.restricted);

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
              {channel.restricted
                ? 'Team only'
                : isLoggedIn(viewer)
                ? 'Follow to post'
                : 'Sign up to post'}
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
export const RulesPage = (): ReactElement => (
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
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
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
export const DocPage = ({ page }: { page: SquadPage }): ReactElement => (
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
        ? `Everything the ${squad.name} team ships, announced here first. Releases, betas, the reasoning behind changes, and a place to tell us what broke.`
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
        Ask in <span className="text-text-link">Discussions</span>; the team
        answers there.
      </li>
      <li>
        The public API is open:{' '}
        <span className="text-text-link">docs.coderabbit.ai</span>.
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
export const ReleasesPage = ({
  viewer,
  bare,
}: {
  viewer: Viewer;
  bare?: boolean;
}): ReactElement => {
  const { source, empty } = useWorkspace();

  return (
    <Column width="max-w-[52rem]" bare={bare} className="gap-6">
      {source === ContentSource.Feed && (
        <div className="flex items-center gap-3 rounded-12 bg-surface-float px-4 py-2.5 text-text-tertiary typo-footnote">
          <MegaphoneIcon size={IconSize.Small} />
          <span className="min-w-0 flex-1">
            Published from the company&apos;s feed,{' '}
            <span className="text-text-secondary">{squad.feedUrl}</span>. Every
            item becomes a post here the hour it goes live.
          </span>
          <span className="sq-nums shrink-0 text-text-quaternary typo-caption1">
            Synced 2h ago
          </span>
        </div>
      )}
      {empty && (
        <div className="flex flex-col items-center gap-2 rounded-16 border border-dashed border-border-subtlest-secondary px-6 py-12 text-center">
          <span className="font-bold text-text-primary typo-callout">
            No releases yet
          </span>
          <span className="max-w-[40ch] text-text-tertiary typo-footnote">
            {source === ContentSource.Feed
              ? 'The feed is connected. The first item lands here the hour it is published.'
              : 'Post the first release and it starts the log.'}
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          {isStaff(viewer) && source === ContentSource.Manual && (
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              New release
            </Button>
          )}
          {isAdmin(viewer) && source === ContentSource.Feed && (
            <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
              Feed settings
            </Button>
          )}
        </div>
      </div>
      <div className={classNames('flex flex-col gap-8', empty && 'hidden')}>
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
};

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
    tags: ['coderabbit'],
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
export const PollsPage = ({
  viewer,
  bare,
}: {
  viewer: Viewer;
  bare?: boolean;
}): ReactElement => {
  const [votes, setVotes] = useState<Record<string, number>>({});

  return (
    <Column bare={bare} className="gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-12 bg-surface-float px-4 py-3">
        <span className="min-w-0 flex-1 text-text-secondary typo-footnote">
          What the team wants to know from you. One vote each, results when you
          vote.
        </span>
        {isStaff(viewer) ? (
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
                if (picked !== undefined || !isJoined(viewer)) {
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
export const ProductsPage = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <Column width="max-w-[56rem]">
    {isAdmin(viewer) ? (
      <div className="flex flex-col gap-3 rounded-16 border border-dashed border-border-subtlest-secondary p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
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
        Everything {squad.name} makes. Add one to your stack and it shows on
        your profile.
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
              <span className="min-w-0 shrink truncate font-bold text-text-primary typo-callout">
                {product.name}
              </span>
              <span className="hidden text-text-quaternary laptop:inline">
                ·
              </span>
              <span className="min-w-0 shrink truncate text-text-secondary typo-callout">
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

enum MemberTab {
  All = 'Followers',
  Moderators = 'Moderators',
  Blocked = 'Blocked',
}

const roleActions: Record<string, string[]> = {
  Admin: ['Demote to moderator', 'Demote to follower'],
  Moderator: ['Make admin', 'Demote to follower'],
  Member: ['Make admin', 'Promote to moderator'],
};

/* The team snapshot is all admins and moderators; the tail plays members. */
const roleOf = (member: (typeof team)[number]): string =>
  team.indexOf(member) >= 5 ? 'Member' : member.role;

/**
 * Production's SquadMemberModal as a page: three tabs (Blocked for staff
 * only), search, Copy invitation link first when the viewer may invite,
 * a role badge on every row, and the per-member menu for staff.
 */
export const MembersPage = ({ viewer }: { viewer: Viewer }): ReactElement => {
  const { config } = useWorkspace();
  const [tab, setTab] = useState<MemberTab>(MemberTab.All);
  const [menu, setMenu] = useState<string | null>(null);
  const staff = isStaff(viewer);
  const canInvite =
    isJoined(viewer) &&
    (staff || config.memberInviteRole === MemberRole.Member);
  const tabs = [
    MemberTab.All,
    MemberTab.Moderators,
    ...(staff ? [MemberTab.Blocked] : []),
  ];
  const blocked = team.slice(6, 8);
  const rows =
    tab === MemberTab.Blocked
      ? blocked
      : tab === MemberTab.Moderators
      ? team.filter((member) => roleOf(member) !== 'Member')
      : team;

  return (
    <Column>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={classNames(
                'rounded-[999px] px-3 py-1 typo-callout transition-colors',
                tab === item
                  ? 'bg-surface-float font-bold text-text-primary'
                  : 'text-text-tertiary hover:text-text-primary',
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex h-9 w-full items-center gap-2 rounded-12 border tablet:w-56 border-border-subtlest-tertiary bg-surface-float px-3 text-text-quaternary typo-footnote">
          <SearchIcon size={IconSize.Small} />
          Search followers
        </div>
      </div>
      <span className="text-text-tertiary typo-footnote">
        <b className="sq-nums text-text-primary">
          {tab === MemberTab.Blocked
            ? blocked.length
            : tab === MemberTab.Moderators
            ? rows.length
            : formatCount(squad.membersCount)}
        </b>{' '}
        {tab.toLowerCase()}
      </span>
      {rows.length === 0 ? (
        <div className="rounded-16 border border-border-subtlest-tertiary px-6 py-10 text-center text-text-tertiary typo-callout">
          No blocked followers found
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
          {canInvite && tab !== MemberTab.Blocked && (
            <button
              type="button"
              className="flex items-center gap-3 px-4 py-3 text-left text-text-primary typo-callout hover:bg-surface-float"
            >
              <span className="flex size-8 items-center justify-center rounded-[999px] bg-surface-float text-text-secondary">
                <AddUserIcon size={IconSize.Small} />
              </span>
              Copy invitation link
            </button>
          )}
          {rows.map((member) => (
            <div
              key={member.id}
              className="relative flex items-center gap-3 px-4 py-2.5"
            >
              <Avatar member={member} size={2} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2 truncate font-bold text-text-primary typo-callout">
                  {member.name}
                  {tab !== MemberTab.Blocked && roleOf(member) !== 'Member' && (
                    <span className="rounded-6 bg-surface-float px-1.5 py-0.5 font-normal text-text-tertiary typo-caption2">
                      {roleOf(member) === 'Moderator' ? 'Mod' : roleOf(member)}
                    </span>
                  )}
                </span>
                <span className="truncate text-text-tertiary typo-footnote">
                  @{member.username}
                </span>
              </div>
              {tab === MemberTab.Blocked ? (
                staff && (
                  <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
                    Unblock
                  </Button>
                )
              ) : staff ? (
                <Button
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Small}
                  icon={<MenuIcon />}
                  aria-label="Member options"
                  onClick={() => setMenu(menu === member.id ? null : member.id)}
                />
              ) : (
                <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
                  Follow
                </Button>
              )}
              {menu === member.id && (
                <ul className="sq-elevated absolute right-4 top-full z-popup -mt-1 flex w-56 flex-col rounded-12 bg-background-default p-1">
                  {[
                    ...(isAdmin(viewer)
                      ? roleActions[roleOf(member)] ?? []
                      : []),
                    'Report follower',
                    'Block follower',
                    'Gift daily.dev Plus',
                  ].map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => setMenu(null)}
                        className={classNames(
                          'flex w-full items-center rounded-8 px-2 py-1.5 text-left typo-callout hover:bg-surface-float',
                          label === 'Block follower'
                            ? 'text-status-error'
                            : 'text-text-secondary hover:text-text-primary',
                        )}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </Column>
  );
};

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

const pendingPosts = feedEntries.slice(3, 6);

/**
 * Production's moderation queue for a moderator: Approve all above two or
 * more, spam warnings, the poll item, Decline with its reason list, and
 * the all-done state.
 */
export const ModerationPage = (): ReactElement => {
  const { empty } = useWorkspace();
  const [declining, setDeclining] = useState<string | null>(null);

  if (empty) {
    return (
      <Column>
        <div className="flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary px-6 py-14 text-center">
          <VIcon size={IconSize.Large} className="text-status-success" />
          <span className="font-bold text-text-primary typo-title3">
            All done!
          </span>
          <span className="text-text-tertiary typo-footnote">
            All caught up! There are no posts waiting for your review right now.
          </span>
        </div>
      </Column>
    );
  }

  return (
    <Column>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="min-w-0 flex-1 basis-60 text-text-secondary typo-callout">
          <b className="sq-nums text-text-primary">{pendingPosts.length + 1}</b>{' '}
          posts waiting. Approve and they go live; decline and the author hears
          why.
        </span>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<VIcon secondary />}
        >
          Approve all {pendingPosts.length + 1} posts
        </Button>
      </div>
      <div className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
        {[...pendingPosts, null].map((entry, index) => {
          const key = entry?.id ?? 'poll';
          const author = entry?.author ?? polls[1].author;
          return (
            <div key={key} className="flex flex-col gap-3 p-4">
              {index === 0 && (
                <span className="flex items-center gap-2 rounded-10 bg-accent-bun-subtlest px-3 py-1.5 text-text-primary typo-footnote">
                  <WarningIcon size={IconSize.Small} />
                  Shared in multiple Squads - Spam alert
                </span>
              )}
              <div className="flex items-center gap-3">
                <Avatar member={author} size={2} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold text-text-primary typo-footnote">
                    {author.name}
                  </span>
                  <span className="text-text-tertiary typo-caption1">
                    {entry ? formatDay(entry.createdAt) : 'Today'}
                    {index === 2 && ' · Resubmitted Post'}
                    {!entry && ' · Poll'}
                  </span>
                </div>
              </div>
              {entry ? (
                <div className="flex gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-bold text-text-primary typo-callout">
                      {entry.title}
                    </span>
                    <span className="line-clamp-2 text-text-tertiary typo-footnote">
                      {entry.summary}
                    </span>
                  </div>
                  {entry.image && (
                    <img
                      src={entry.image}
                      alt=""
                      className="h-16 w-28 shrink-0 rounded-10 object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-text-primary typo-callout">
                    {polls[1].question}
                  </span>
                  <ul className="flex flex-col gap-1">
                    {polls[1].options.map((option) => (
                      <li
                        key={option}
                        className="rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 text-text-secondary typo-footnote"
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {declining === key ? (
                <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3">
                  <span className="font-bold text-text-primary typo-footnote">
                    Select a reason for declining
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rejectReasons.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setDeclining(null)}
                        className="rounded-[999px] border border-border-subtlest-tertiary px-2.5 py-1 text-text-secondary typo-caption1 hover:border-border-subtlest-primary hover:text-text-primary"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant={ButtonVariant.Float}
                    size={ButtonSize.Small}
                    className="flex-1"
                    onClick={() => setDeclining(key)}
                  >
                    Decline
                  </Button>
                  <Button
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Small}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Column>
  );
};

const feedItems = feedEntries.slice(0, 4);

/**
 * The company page's engine. A verified page is a squad fed by the
 * company's RSS: items land in Releases as posts, daily.dev runs the feed
 * and the moderation, the company keeps the keys. This is the admin's view
 * of that arrangement.
 */
export const FeedSourcePage = (): ReactElement => (
  <Column width="max-w-[52rem]" className="gap-6">
    <div className="flex items-center gap-3 rounded-16 border border-accent-cabbage-default bg-accent-cabbage-flat px-4 py-3">
      <VerifiedMark label={false} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold text-text-primary typo-callout">
          Managed by daily.dev
        </span>
        <span className="text-text-tertiary typo-footnote">
          Your feed is imported, moderated and kept in sync by our team. You
          keep the keys: pause, edit any post, or write your own.
        </span>
      </div>
      <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
        Contact your manager
      </Button>
    </div>
    <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <div className="flex items-center justify-between">
        <span className="font-bold text-text-primary typo-callout">Source</span>
        <span className="flex items-center gap-1.5 text-status-success typo-caption1">
          <span className="size-1.5 rounded-full bg-status-success" />
          Healthy
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
        {[
          ['Feed', squad.feedUrl],
          ['Publishes to', 'Releases'],
          ['Checked', 'Every hour · last 2h ago'],
          [
            'Imported',
            `${squad.totalPosts} items since ${formatSince(squad.createdAt)}`,
          ],
          ['Author on posts', 'The team member in the item, or the squad'],
          ['Auto-publish', 'On · new items go live without review'],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-text-quaternary typo-caption1">{label}</dt>
            <dd className="text-text-primary typo-callout">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex gap-2 border-t border-border-subtlest-tertiary pt-3">
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          Sync now
        </Button>
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          Pause feed
        </Button>
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          Add a feed
        </Button>
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <span className="font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption2">
        Recent imports
      </span>
      <ol className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
        {feedItems.map((entry) => (
          <li key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
              {entry.title}
            </span>
            <span className="sq-nums shrink-0 text-text-quaternary typo-caption1">
              {formatDay(entry.createdAt)}
            </span>
            <span className="shrink-0 rounded-6 bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption2">
              Published
            </span>
          </li>
        ))}
      </ol>
    </div>
  </Column>
);

/**
 * Production's Unauthorized screen, word for word: a private squad has no
 * request-to-join, the invitation link is the only door. Shown to every
 * non-member on every page but Home.
 */
export const PrivateWall = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <Column>
    <div className="flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary px-6 py-14 text-center">
      <LockIcon
        secondary
        size={IconSize.XLarge}
        className="text-text-secondary"
      />
      <span className="font-bold text-text-primary typo-title3">
        Oops! This link leads to a private discussion
      </span>
      <span className="max-w-[44ch] text-text-tertiary typo-footnote">
        You don&apos;t seem to have access to this page. Try to ask the person
        who shared this link with you for permissions.
      </span>
      <div className="mt-2 flex gap-2">
        <Button variant={ButtonVariant.Primary} size={ButtonSize.Medium}>
          Back home
        </Button>
        {!isLoggedIn(viewer) && (
          <Button variant={ButtonVariant.Float} size={ButtonSize.Medium}>
            Log in
          </Button>
        )}
      </div>
    </div>
  </Column>
);

/** Production's Custom404: a deleted squad, a bad handle. */
export const NotFoundPage = (): ReactElement => (
  <Column>
    <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <span className="font-bold text-text-primary typo-mega3">
        Why are you here?
      </span>
      <span className="text-text-tertiary typo-body">
        You&apos;re not supposed to be here.
      </span>
      <div className="mt-3 flex gap-2">
        <Button variant={ButtonVariant.Primary} size={ButtonSize.Medium}>
          Go home
        </Button>
        <Button variant={ButtonVariant.Float} size={ButtonSize.Medium}>
          Find Squads
        </Button>
      </div>
    </div>
  </Column>
);

/**
 * Production's /squads/[handle]/[token], the invitation landing: the
 * inviter, the squad card, Join, and who is waiting inside. A member is
 * redirected past it; a blocked user is told at the door.
 */
export const InvitePage = ({ viewer }: { viewer: Viewer }): ReactElement => {
  const inviter = team[2];
  const others = team.filter((member) => member.id !== inviter.id);

  return (
    <Column
      width="max-w-[40rem]"
      className="items-center gap-6 py-12 text-center"
    >
      <h1 className="font-bold text-text-primary typo-title1">
        You are invited to join {squad.name}
      </h1>
      <p className="text-text-tertiary typo-body">
        {squad.name} is your place to stay up to date as a Squad. You and other
        followers can share knowledge and content in one place. Follow now to
        start collaborating.
      </p>
      <div className="flex items-center gap-4 text-left">
        <Avatar member={inviter} size={2.5} />
        <p className="text-text-tertiary typo-body">
          <b className="text-text-primary">{inviter.name}</b>{' '}
          <span className="text-text-link">(@{inviter.username})</span> has
          invited you to <b className="text-text-primary">{squad.name}</b>
        </p>
      </div>
      <div className="flex w-full items-center gap-4 rounded-24 border border-accent-cabbage-default p-6 text-left">
        <img src={squad.image} alt="" className="size-16 shrink-0 rounded-16" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1 font-bold text-text-primary typo-body">
            {squad.name}
            <VerifiedMark label={false} />
          </span>
          <span className="text-text-tertiary typo-callout">
            @{squad.handle}
          </span>
          <span className="mt-2 text-text-tertiary typo-callout">
            {squad.description}
          </span>
        </div>
        {isJoined(viewer) ? (
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Large}>
            Open Squad
          </Button>
        ) : (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            disabled={isBlocked(viewer)}
          >
            Follow
          </Button>
        )}
      </div>
      {isBlocked(viewer) && (
        <span className="rounded-12 bg-surface-float px-4 py-2 text-text-secondary typo-callout">
          🚫 You no longer have access to this Squad.
        </span>
      )}
      {isJoined(viewer) && (
        <span className="rounded-12 bg-surface-float px-4 py-2 text-text-secondary typo-callout">
          You already follow this page. Production sends you straight to it.
        </span>
      )}
      <p className="text-text-tertiary typo-body">
        {inviter.name} and {formatCount(squad.membersCount - 1)} others are
        waiting for you inside. Join them now!
      </p>
      <Facepile members={others} max={8} size={2} />
      {!isLoggedIn(viewer) && (
        <span className="text-text-quaternary typo-caption1">
          Follow opens sign up first; the invitation is kept through it.
        </span>
      )}
    </Column>
  );
};

/* ------------------------------------------------------------- settings */

const Radio = ({
  options,
  value,
  onChange,
  disabled = false,
}: {
  options: { value: string; label: string; hint?: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-2', disabled && 'opacity-40')}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        disabled={disabled}
        onClick={() => onChange(option.value)}
        className="flex items-start gap-2.5 text-left"
      >
        <span
          className={classNames(
            'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[999px] border',
            value === option.value
              ? 'border-accent-cabbage-default'
              : 'border-border-subtlest-primary',
          )}
        >
          {value === option.value && (
            <span className="size-2 rounded-[999px] bg-accent-cabbage-default" />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-text-primary typo-callout">{option.label}</span>
          {option.hint && (
            <span className="text-text-tertiary typo-footnote">
              {option.hint}
            </span>
          )}
        </span>
      </button>
    ))}
  </div>
);

const Field = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}): ReactElement => (
  <label className="flex flex-col gap-1">
    <span className="text-text-tertiary typo-caption1">{label}</span>
    <span className="flex h-10 items-center rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-primary typo-callout">
      {value}
    </span>
    {hint && <span className="text-text-quaternary typo-caption1">{hint}</span>}
  </label>
);

const SettingsSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <div className="flex flex-col gap-0.5">
      <span className="font-bold text-text-primary typo-body">{title}</span>
      {description && (
        <span className="text-text-tertiary typo-footnote">{description}</span>
      )}
    </div>
    {children}
  </section>
);

/**
 * Production's Squad settings (Details.tsx and the settings sections),
 * section for section, inside the workspace instead of on /edit. The
 * company page adds where the posts come from.
 */
export const SettingsPage = (): ReactElement => {
  const { config, source } = useWorkspace();
  const [state, setState] = useState(config);
  const membersOnly = state.memberPostingRole === MemberRole.Moderator;
  const roleOptions = [
    { value: MemberRole.Member, label: 'All members (recommended)' },
    { value: MemberRole.Moderator, label: 'Only moderators' },
  ];

  return (
    <Column width="max-w-[44rem]" className="gap-8">
      <SettingsSection title="Squad details">
        <div className="flex items-center gap-4">
          <img src={squad.image} alt="" className="size-16 rounded-16" />
          <div className="flex gap-2">
            <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
              Change image
            </Button>
            <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
              Upload cover
            </Button>
          </div>
        </div>
        <Field label="Squad name" value={squad.name} />
        <Field
          label="Squad handle"
          value={`@${squad.handle}`}
          hint={`daily.dev/squads/${squad.handle}`}
        />
        <Field
          label="Squad description"
          value={squad.description}
          hint="250 characters"
        />
      </SettingsSection>

      <SettingsSection title="Squad type">
        <Radio
          value={state.isPublic ? 'public' : 'private'}
          onChange={(value) =>
            setState((current) => ({
              ...current,
              isPublic: value === 'public',
            }))
          }
          options={[
            {
              value: 'public',
              label: 'Public',
              hint: 'Listed in the directory, open to anyone. Needs a category.',
            },
            {
              value: 'private',
              label: 'Private',
              hint: 'Squad is invite-only, hidden from the directory, and perfect for teams and smaller groups of people who know each other and want to collaborate privately.',
            },
          ]}
        />
        {state.isPublic && (
          <Field
            label="Category"
            value={state.category ?? 'Select a category'}
          />
        )}
      </SettingsSection>

      <SettingsSection
        title="🔒 Moderation settings"
        description="Choose who is allowed to post new content in this Squad, and whether their posts are reviewed first."
      >
        <SettingsSection title="Post content">
          <Radio
            value={state.memberPostingRole}
            onChange={(value) =>
              setState((current) => ({
                ...current,
                memberPostingRole: value as MemberRole,
                postingGate:
                  value === MemberRole.Moderator
                    ? PostingGate.None
                    : current.postingGate,
              }))
            }
            options={roleOptions}
          />
        </SettingsSection>
        <SettingsSection
          title="Posting requirements"
          description={
            membersOnly
              ? 'Only admins and moderators can post; their posts are auto-published.'
              : undefined
          }
        >
          <Radio
            disabled={membersOnly}
            value={state.postingGate}
            onChange={(value) =>
              setState((current) => ({
                ...current,
                postingGate: value as PostingGate,
              }))
            }
            options={[
              {
                value: PostingGate.None,
                label: 'Anyone can post',
                hint: 'All members can post. No review.',
              },
              {
                value: PostingGate.Moderation,
                label: 'Require post approval',
                hint: 'All members can post. Every post is reviewed.',
              },
              {
                value: PostingGate.Reputation,
                label: 'Require a minimum reputation',
                hint: 'Only members with enough reputation can post. No review.',
              },
            ]}
          />
          {state.postingGate === PostingGate.Reputation && !membersOnly && (
            <div className="max-w-60">
              <Field
                label="Minimum reputation"
                value={String(state.postingMinReputation)}
              />
            </div>
          )}
        </SettingsSection>
        <SettingsSection
          title="Invitation permissions"
          description="Choose who is allowed to invite new members to this Squad."
        >
          <Radio
            value={state.memberInviteRole}
            onChange={(value) =>
              setState((current) => ({
                ...current,
                memberInviteRole: value as MemberRole,
              }))
            }
            options={roleOptions}
          />
        </SettingsSection>
      </SettingsSection>

      <SettingsSection title="Integrations">
        <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-4 py-3">
          <SlackIcon size={IconSize.Medium} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-text-primary typo-callout">
              Slack
            </span>
            <span className="text-text-tertiary typo-footnote">
              {config.slack
                ? 'Posting new posts to #product-updates'
                : 'Post every new post to a channel.'}
            </span>
          </div>
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
            {config.slack ? 'Manage' : 'Connect to Slack'}
          </Button>
        </div>
        {source === ContentSource.Feed && (
          <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-4 py-3">
            <MegaphoneIcon size={IconSize.Medium} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-bold text-text-primary typo-callout">
                Content feed
              </span>
              <span className="text-text-tertiary typo-footnote">
                {squad.feedUrl}, checked every hour, managed by daily.dev.
              </span>
            </div>
            <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
              Open
            </Button>
          </div>
        )}
      </SettingsSection>

      <SettingsSection title="🚨 Danger zone">
        <div className="flex flex-col gap-3 rounded-16 border border-status-error p-4">
          <span className="font-bold text-text-primary typo-callout">
            Deleting your Squad will:
          </span>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-text-tertiary typo-footnote">
            <li>Permanently delete your Squad.</li>
            <li>
              Permanently delete all Squad&apos;s content, including your posts
              and others, comments, upvotes, etc
            </li>
            <li>Allow your Squad name to become available to anyone.</li>
          </ul>
          <span className="text-text-quaternary typo-caption1">
            Important: deleting your Squad is unrecoverable and cannot be
            undone. Feel free to contact support@daily.dev with any questions.
          </span>
          <div>
            <Button
              variant={ButtonVariant.Secondary}
              color={ButtonColor.Ketchup}
              size={ButtonSize.Small}
              icon={<TrashIcon />}
            >
              Delete Squad
            </Button>
          </div>
        </div>
      </SettingsSection>
      <div className="sticky bottom-0 flex justify-end border-t border-border-subtlest-tertiary bg-background-default py-3">
        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={ButtonSize.Medium}
        >
          Save
        </Button>
      </div>
    </Column>
  );
};

/* ------------------------------------------------------------ analytics */

const days = Array.from({ length: 45 }, (_, index) => {
  const seed = (index * 7) % 13;
  return { organic: 40 + seed * 9, boosted: index > 30 ? 60 + seed * 6 : 0 };
});

/** Production's /squads/[handle]/analytics: two tiles, the chart, the list. */
export const AnalyticsPage = (): ReactElement => {
  const { config, empty } = useWorkspace();
  const max = Math.max(...days.map((day) => day.organic + day.boosted));

  return (
    <Column width="max-w-[52rem]" className="gap-6">
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Impressions', formatCount(empty ? 0 : 184200)],
          ['Unique reach', formatCount(empty ? 0 : 61400)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-4"
          >
            <span className="text-text-tertiary typo-footnote">{label}</span>
            <span className="sq-nums font-bold text-text-primary typo-title2">
              {value}
            </span>
            <span className="text-text-quaternary typo-caption1">
              Last 45 days
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary typo-callout">
            Impressions per day
          </span>
          <span className="flex items-center gap-3 text-text-tertiary typo-caption1">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-2 bg-text-disabled" />
              Organic
            </span>
            {config.campaign && (
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-2 bg-accent-cabbage-default" />
                Boosted
              </span>
            )}
          </span>
        </div>
        {empty ? (
          <div className="flex h-32 items-center justify-center text-text-tertiary typo-footnote">
            No impressions data in the last 45 days.
          </div>
        ) : (
          <div className="flex h-32 gap-0.5">
            {days.map((day, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div
                key={index}
                className="flex h-full flex-1 flex-col justify-end gap-px"
              >
                {config.campaign && day.boosted > 0 && (
                  <span
                    className="w-full rounded-t-2 bg-accent-cabbage-default"
                    style={{ height: `${(day.boosted / max) * 100}%` }}
                  />
                )}
                <span
                  className="w-full rounded-t-2 bg-text-disabled"
                  style={{ height: `${(day.organic / max) * 100}%` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <dl className="grid grid-cols-4 gap-3">
        {[
          ['Upvotes', formatCount(squad.totalUpvotes)],
          ['Upvotes ratio', '4.5%'],
          ['Comments', '2.1K'],
          ['Bookmarks', '3.8K'],
          ['Awards', String(squad.totalAwards)],
          ['Shares', '912'],
          ['Clicks', '48.2K'],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-0.5 rounded-12 border border-border-subtlest-tertiary px-3 py-2.5"
          >
            <dt className="text-text-tertiary typo-caption1">{label}</dt>
            <dd className="sq-nums font-bold text-text-primary typo-callout">
              {empty ? '0' : value}
            </dd>
          </div>
        ))}
      </dl>
    </Column>
  );
};

/* --------------------------------------------------------------- pending */

const rejectReasons = [
  'Off-topic post unrelated to the Squad',
  "Violates the Squad's code of conduct",
  'Too promotional without adding value',
  'Duplicate or similar content already posted',
  'Lacks quality or clarity',
  'Inappropriate, NSFW or offensive post',
  'Post is spam or scam',
  'Misinformation or false claims',
  'Copyright or legal issue',
  'Other',
];

/**
 * Production's /squads/moderate for the author: their own posts in the
 * queue, Pending or Rejected, with the moderator's reason, and Edit or
 * Delete on each. The moderator's queue is ModerationPage.
 */
export const PendingPostsPage = (): ReactElement => {
  const { config } = useWorkspace();
  const items = feedEntries.slice(3, 3 + Math.max(config.ownPending, 0));

  if (items.length === 0) {
    return (
      <Column>
        <div className="flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary px-6 py-14 text-center">
          <VIcon size={IconSize.Large} className="text-status-success" />
          <span className="font-bold text-text-primary typo-title3">
            All done!
          </span>
          <span className="text-text-tertiary typo-footnote">
            All caught up! No posts are pending
          </span>
        </div>
      </Column>
    );
  }

  return (
    <Column>
      <span className="text-text-secondary typo-callout">
        Your posts waiting for a moderator of {squad.name}. You hear when they
        are reviewed.
      </span>
      <div className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
        {items.map((entry, index) => {
          const rejected = index === 1;
          return (
            <div key={entry.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar member={entry.author} size={2} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold text-text-primary typo-footnote">
                    {entry.author.name}
                  </span>
                  <span className="text-text-tertiary typo-caption1">
                    {formatDay(entry.createdAt)}
                    {index === 2 && ' · Resubmitted Post'}
                  </span>
                </div>
                <Button
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  icon={rejected ? <WarningIcon /> : <TimerIcon />}
                  disabled
                >
                  {rejected ? 'Rejected' : 'Pending'}
                </Button>
                <Button
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Small}
                  icon={<EditIcon />}
                  aria-label="Edit post"
                />
                <Button
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Small}
                  icon={<TrashIcon />}
                  aria-label="Delete post"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-bold text-text-primary typo-callout">
                    {entry.title}
                  </span>
                  <span className="line-clamp-2 text-text-tertiary typo-footnote">
                    {entry.summary}
                  </span>
                </div>
                {entry.image && (
                  <img
                    src={entry.image}
                    alt=""
                    className="h-16 w-28 shrink-0 rounded-10 object-cover"
                  />
                )}
              </div>
              {rejected && (
                <div className="rounded-12 bg-accent-bun-subtlest px-3 py-2 text-text-primary typo-footnote">
                  Your post in {squad.name} was not approved for the following
                  reason: {rejectReasons[2]}. Please review the feedback and
                  consider making changes before resubmitting.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Column>
  );
};

export const AdminPlaceholder = ({
  page,
}: {
  page: SquadPage;
}): ReactElement => (
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
  const { isPrivate, empty } = useWorkspace();

  if (
    isPrivate &&
    !isJoined(viewer) &&
    current.type !== PageType.Home &&
    current.type !== PageType.Invite &&
    current.type !== PageType.NotFound
  ) {
    return <PrivateWall viewer={viewer} />;
  }

  switch (current.type) {
    case PageType.Home:
      return (
        <HomePage
          viewer={viewer}
          empty={empty}
          onOpenMembers={() => onSelect(common.members)}
          onOpenRules={() => onSelect(docs.rules)}
          onOpenFaq={() => onSelect(docs.faq)}
          onOpenPending={() => onSelect(hidden.pending)}
        />
      );
    case PageType.Moderation:
      return <ModerationPage />;
    case PageType.Pending:
      return <PendingPostsPage />;
    case PageType.Settings:
      return <SettingsPage />;
    case PageType.Analytics:
      return <AnalyticsPage />;
    case PageType.Invite:
      return <InvitePage viewer={viewer} />;
    case PageType.NotFound:
      return <NotFoundPage />;
    case PageType.Feed:
      return <FeedSourcePage />;
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
      return <MembersPage viewer={viewer} />;
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
      return isAdmin(viewer) ? (
        <IconButton icon={<SettingsIcon />} label="Page settings" />
      ) : null;
    case PageType.Products:
      return isAdmin(viewer) ? (
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          Sync now
        </Button>
      ) : null;
    case PageType.Doc:
      return isStaff(viewer) ? (
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
  source = ContentSource.Feed,
  empty = false,
  isPrivate = false,
  config,
  height = 56,
  width = 1440,
}: {
  viewer?: Viewer;
  initialPage?: SquadPage;
  source?: ContentSource;
  empty?: boolean;
  isPrivate?: boolean;
  config?: Partial<SquadConfig>;
  /** rem */
  height?: number;
  width?: number;
}): ReactElement => {
  const [active, setActive] = useState<SquadPage>(initialPage);
  const state: WorkspaceState = {
    viewer,
    source,
    empty,
    isPrivate,
    config: { ...defaultConfig, isPublic: !isPrivate, ...config },
  };

  const standalonePage =
    active.type === PageType.Invite || active.type === PageType.NotFound;

  const onSelect = (page: SquadPage) => {
    if (page.href) {
      return;
    }
    setActive(page);
  };

  return (
    <WorkspaceContext.Provider value={state}>
      <div
        style={{ width, maxWidth: '100%', height: `${height}rem` }}
        className="sq-elevated flex overflow-hidden rounded-16 bg-background-default text-text-primary"
      >
        <WorkspaceStyles />
        <Kit2Styles />
        <Rail />
        {!standalonePage && (
          <SquadSidebar active={active} viewer={viewer} onSelect={onSelect} />
        )}
        <main className="ws-scroll flex min-w-0 flex-1 flex-col overflow-y-auto">
          {active.type !== PageType.Home && !standalonePage && (
            <PageBar page={active}>{pageBarTools(active, viewer)}</PageBar>
          )}
          <div className="flex-1">
            <PageBody page={active} viewer={viewer} onSelect={onSelect} />
          </div>
        </main>
      </div>
    </WorkspaceContext.Provider>
  );
};

export const findPage = (id: string): SquadPage =>
  allPages.find((page) => page.id === id) ?? allPages[0];

export const addPage: SquadPage = {
  id: 'add',
  label: 'Add a page',
  type: PageType.Add,
};
