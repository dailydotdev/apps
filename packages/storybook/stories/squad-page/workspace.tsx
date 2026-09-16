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
  CalendarIcon,
  CardIcon,
  CompassIcon,
  DiscussIcon,
  DocsIcon,
  DragIcon,
  EyeCancelIcon,
  HelpIcon,
  HomeIcon,
  InfoIcon,
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
  PollIcon,
  SearchIcon,
  SendAirplaneIcon,
  SettingsIcon,
  SparkleIcon,
  SquadIcon,
  StarIcon,
  TimerIcon,
  UpvoteIcon,
  UserIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import type { QuizQuestion, TeamMember } from './data';
import {
  entriesByMonth,
  feedEntries,
  formatCount,
  formatDay,
  formatSince,
  jobs,
  pinnedEntry,
  products,
  quiz,
  ratingBreakdown,
  reviewSources,
  reviews,
  rules,
  squad,
  team,
} from './data';
import { Avatar, CardList, Facepile, VerifiedMark, Viewer } from './kit';
import { Composer, Kit2Styles } from './kit2';
import { PollList } from '@dailydotdev/shared/src/components/cards/poll/PollList';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { PostsToolbar, SquadAbout, SquadHome } from './home';

// Round three: the Whop mindset. A squad is not a page with widgets, it is a
// workspace. The owner composes a left column of pages (a feed, a chat, a
// document, a link, a bounty board, a job list), each page type renders its
// own UI in the main area, and the app's own rail stays where it is. Three
// columns, like Whop: communities rail, this community's pages, the page.

/* ------------------------------------------------------------- page model */

export enum PageType {
  Home = 'home',
  About = 'about',
  /** A saved filter on the squad feed with its own posting rule. */
  Channel = 'channel',
  Reviews = 'reviews',
  Releases = 'releases',
  Quiz = 'quiz',
  Doc = 'doc',
  Rules = 'rules',
  Recurring = 'recurring',
  Chat = 'chat',
  Link = 'link',
  Jobs = 'jobs',
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
  announcements: page('announcements', 'Announcements', PageType.Channel, {
    restricted: true,
    badge: 2,
    description: 'Releases and news from the team. Only the team posts here.',
  }),
  discussions: page('discussions', 'Discussions', PageType.Channel, {
    description:
      'Questions, opinions, feedback, bug reports. If it needs an answer, it lives here.',
  }),
  reviews: page('reviews', 'Reviews', PageType.Reviews, { badge: 4 }),
  quiz: page('quiz', 'Quiz', PageType.Quiz),
  links: page('links', 'Links', PageType.Channel, {
    description: "Articles, videos and tools worth the squad's time.",
  }),
  polls: page('polls', 'Polls', PageType.Channel),
};

const docs = {
  rules: page('rules', 'Rules', PageType.Rules),
  faq: page('faq', 'FAQ', PageType.Doc),
};

const common = {
  home: page('home', 'Home', PageType.Home),
  about: page('about', 'About', PageType.About),
  chat: page('chat', 'Chat', PageType.Chat, { badge: 14 }),
  recurring: page('recurring', 'Recurring threads', PageType.Recurring),
  members: page('members', 'Members', PageType.Members),
  jobs: page('jobs', 'Open roles', PageType.Jobs, { badge: 2 }),
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

export enum SidebarPreset {
  /** A company squad: the changelog, a product community, a DevRel team. */
  Company = 'company',
  /** A topic squad: Learn Python, DevOps, Go developers. */
  Community = 'community',
}

export const presets: Record<SidebarPreset, SidebarSection[]> = {
  [SidebarPreset.Company]: [
    {
      id: 'top',
      pages: [
        common.home,
        common.about,
        common.releases,
        common.products,
        common.jobs,
      ],
    },
    {
      id: 'channels',
      label: 'Channels',
      pages: [
        channels.announcements,
        channels.discussions,
        channels.reviews,
        channels.quiz,
      ],
    },
    {
      id: 'docs',
      label: 'Documentation',
      pages: [docs.rules, docs.faq],
    },
    {
      id: 'links',
      label: 'Links',
      pages: [
        link('docs', 'Docs', 'https://docs.daily.dev'),
        link('github', 'GitHub', 'https://github.com/dailydotdev'),
        link('status', 'Status', 'https://status.daily.dev'),
        link('discord', 'Discord', 'https://discord.gg/dailydev'),
      ],
    },
    manage,
  ],
  [SidebarPreset.Community]: [
    { id: 'top', pages: [common.home, common.about, common.chat] },
    {
      id: 'channels',
      label: 'Channels',
      pages: [
        channels.announcements,
        channels.discussions,
        channels.links,
        channels.polls,
        channels.quiz,
      ],
    },
    {
      id: 'recurring',
      label: 'Recurring',
      pages: [common.recurring],
    },
    {
      id: 'docs',
      label: 'Documentation',
      pages: [docs.rules, docs.faq],
    },
    {
      id: 'links',
      label: 'Links',
      pages: [
        link('official-docs', 'Official docs', 'https://docs.python.org'),
        link('discord', 'Discord', 'https://discord.gg/python'),
        link('related', 'Related squads', 'https://daily.dev/squads/discover'),
      ],
    },
    manage,
  ],
};

export const sections = presets[SidebarPreset.Company];

export const allPages: SquadPage[] = [
  ...Object.values(presets)
    .flat()
    .flatMap((section) => section.pages),
  common.members,
].filter(
  (candidate, index, list) =>
    list.findIndex((other) => other.id === candidate.id) === index,
);

export const pageIcon = (type: PageType, size = IconSize.Small): ReactElement =>
  ({
    [PageType.Home]: <HomeIcon size={size} />,
    [PageType.About]: <InfoIcon size={size} />,
    [PageType.Channel]: <MegaphoneIcon size={size} />,
    [PageType.Reviews]: <StarIcon size={size} />,
    [PageType.Releases]: <SparkleIcon size={size} secondary />,
    [PageType.Quiz]: <HelpIcon size={size} />,
    [PageType.Doc]: <DocsIcon size={size} />,
    [PageType.Rules]: <DocsIcon size={size} />,
    [PageType.Recurring]: <CalendarIcon size={size} />,
    [PageType.Chat]: <DiscussIcon size={size} />,
    [PageType.Link]: <LinkIcon size={size} />,
    [PageType.Jobs]: <JobIcon size={size} />,
    [PageType.Products]: <CardIcon size={size} />,
    [PageType.Members]: <UserIcon size={size} />,
    [PageType.Analytics]: <AnalyticsIcon size={size} />,
    [PageType.Moderation]: <TimerIcon size={size} />,
    [PageType.Settings]: <SettingsIcon size={size} />,
    [PageType.Add]: <PlusIcon size={size} />,
  }[type]);

/** Channels get their own glyphs; everything else keeps the type's. */
const channelIcons: Record<string, ReactElement> = {
  announcements: <MegaphoneIcon size={IconSize.Small} />,
  discussions: <DiscussIcon size={IconSize.Small} />,
  reviews: <StarIcon size={IconSize.Small} />,
  quiz: <HelpIcon size={IconSize.Small} />,
  links: <LinkIcon size={IconSize.Small} />,
  polls: <PollIcon size={IconSize.Small} />,
};

export const iconFor = (item: SquadPage): ReactElement =>
  channelIcons[item.id] ?? pageIcon(item.type);

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
        title: 'Announcements',
        description: 'Team only. Releases, news, the pinned monthly notes.',
        exists: true,
      },
      {
        type: PageType.Channel,
        title: 'Discussions',
        description:
          'General. Questions, feedback and bug reports live here too.',
        exists: true,
      },
      {
        type: PageType.Reviews,
        title: 'Reviews',
        description:
          'Stars and a review from members, with every rating the company has on the web pulled into one score.',
        exists: false,
      },
      {
        type: PageType.Quiz,
        title: 'Quiz',
        description:
          'Poll cards with a right answer, generated from your docs, releases and products. A score at the end.',
        exists: false,
      },
      {
        type: PageType.Channel,
        title: 'Links',
        description:
          'Shared articles, videos and tools. The post type daily.dev is built on.',
        exists: true,
      },
      {
        type: PageType.Channel,
        title: 'Polls',
        description: 'The poll post type, on its own.',
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
    group: 'Recurring',
    items: [
      {
        type: PageType.Recurring,
        title: 'Recurring thread',
        description:
          "Who's hiring monthly, an easy-questions weekly, a showoff day. A scheduled post that pins itself when live.",
        exists: false,
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
          'Everything the company makes. Imported from Product Hunt, G2, GitHub or a URL; each card links to the member stack.',
        exists: false,
      },
      {
        type: PageType.Jobs,
        title: 'Open roles',
        description: 'Recruiter listings, inside the squad.',
        exists: true,
      },
    ],
  },
  {
    group: 'Links and people',
    items: [
      {
        type: PageType.Link,
        title: 'Link',
        description: 'Docs, GitHub, Discord, status page, a related squad.',
        exists: true,
      },
      {
        type: PageType.Members,
        title: 'Members',
        description: 'Everyone in the squad, with the team on top.',
        exists: true,
      },
      {
        type: PageType.Chat,
        title: 'Chat',
        description: 'A real-time room. New for daily.dev, last on the list.',
        exists: false,
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
  preset = SidebarPreset.Company,
  className,
}: {
  active: SquadPage;
  viewer: Viewer;
  onSelect: (page: SquadPage) => void;
  preset?: SidebarPreset;
  className?: string;
}): ReactElement => {
  const admin = viewer === Viewer.Admin;
  const sidebarSections = presets[preset];

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
        {sidebarSections
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
}: {
  viewer: Viewer;
  onOpenMembers: () => void;
  onOpenRules: () => void;
}): ReactElement => (
  <SquadHome
    viewer={viewer}
    onOpenMembers={onOpenMembers}
    onOpenRules={onOpenRules}
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

const recurring = [
  {
    title: "Who's hiring",
    cadence: 'Monthly, first Monday',
    channel: 'Discussions',
    status: 'Live now · 41 comments',
    live: true,
  },
  {
    title: 'Easy questions thread',
    cadence: 'Weekly, Monday',
    channel: 'Discussions',
    status: 'Live now · 12 comments',
    live: true,
  },
  {
    title: 'Weekly quiz',
    cadence: 'Weekly, Friday',
    channel: 'Quiz',
    status: 'Next in 3 days',
    live: false,
  },
  {
    title: 'Release notes',
    cadence: 'Monthly, last Friday',
    channel: 'Announcements',
    status: 'Next in 12 days',
    live: false,
  },
];

/**
 * The threads a community runs on a schedule. Each is a scheduled post
 * that pins itself while live; the page is where members find the open
 * one and admins set the cadence.
 */
const RecurringPage = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <Column>
    <div className="flex items-center justify-between">
      <p className="max-w-[52ch] text-text-secondary typo-callout">
        Threads that come back on a schedule. The live one is pinned in its
        channel until the next one opens.
      </p>
      {viewer === Viewer.Admin && (
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
        >
          New recurring thread
        </Button>
      )}
    </div>
    <div className="flex flex-col gap-3">
      {recurring.map((thread) => (
        <div
          key={thread.title}
          className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-background-default text-text-tertiary">
            <CalendarIcon size={IconSize.Small} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-bold text-text-primary typo-callout">
              {thread.title}
            </span>
            <span className="text-text-tertiary typo-footnote">
              {thread.cadence} · in {thread.channel}
            </span>
          </div>
          <span
            className={classNames(
              'flex items-center gap-1.5 whitespace-nowrap typo-footnote',
              thread.live ? 'text-text-primary' : 'text-text-quaternary',
            )}
          >
            {thread.live && (
              <span className="size-1.5 rounded-full bg-status-success" />
            )}
            {thread.status}
          </span>
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
            {thread.live ? 'Open' : 'Remind me'}
          </Button>
        </div>
      ))}
    </div>
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

const Stars = ({
  value,
  size = IconSize.Small,
  onPick,
}: {
  value: number;
  size?: IconSize;
  onPick?: (value: number) => void;
}): ReactElement => (
  <span className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        type="button"
        key={star}
        disabled={!onPick}
        onClick={() => onPick?.(star)}
        aria-label={`${star} star${star > 1 ? 's' : ''}`}
        className={classNames(
          'flex',
          star <= Math.round(value)
            ? 'text-accent-cheese-default'
            : 'text-text-disabled',
          onPick && 'transition-transform hover:scale-110',
        )}
      >
        <StarIcon size={size} secondary={star <= Math.round(value)} />
      </button>
    ))}
  </span>
);

const squadRating = 4.7;
const squadReviewCount = 312;
const webRatings = reviewSources.reduce((sum, item) => sum + item.count, 0);
const webRating =
  reviewSources.reduce((sum, item) => sum + item.rating * item.count, 0) /
  webRatings;

/**
 * Reviews are not posts. Members pick stars and write, the team replies in
 * line, and the top of the page pulls every rating the company has on the
 * web into one number next to the squad's own. Trustpilot's page shape,
 * with G2, the stores and Product Hunt beside it.
 */
const ReviewsPage = ({ viewer }: { viewer: Viewer }): ReactElement => {
  const [draft, setDraft] = useState(0);

  return (
    <Column width="max-w-[52rem]" className="gap-6">
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
          <span className="text-text-tertiary typo-footnote">On daily.dev</span>
          <div className="flex items-end gap-3">
            <span className="sq-nums font-bold leading-none text-text-primary typo-mega2">
              {squadRating.toFixed(1)}
            </span>
            <div className="flex flex-col gap-1 pb-1">
              <Stars value={squadRating} />
              <span className="sq-nums text-text-tertiary typo-caption1">
                {squadReviewCount} member reviews
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            {ratingBreakdown.map(([stars, share]) => (
              <div
                key={stars}
                className="flex items-center gap-2 typo-caption1"
              >
                <span className="sq-nums w-3 text-text-tertiary">{stars}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-6 bg-background-default">
                  <span
                    className="block h-full rounded-6 bg-accent-cheese-default"
                    style={{ width: `${share}%` }}
                  />
                </span>
                <span className="sq-nums w-8 text-right text-text-quaternary">
                  {share}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-text-tertiary typo-footnote">
              Across the web
            </span>
            <span className="sq-nums text-text-tertiary typo-caption1">
              <b className="text-text-primary typo-callout">
                {webRating.toFixed(1)}
              </b>{' '}
              from {formatCount(webRatings)} ratings
            </span>
          </div>
          <ul className="flex flex-col divide-y divide-border-subtlest-tertiary">
            {reviewSources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.href}
                  className="flex items-center gap-3 py-2 hover:text-text-primary"
                >
                  <img
                    src={source.image}
                    alt=""
                    className="size-5 rounded-4 bg-background-default p-0.5"
                  />
                  <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
                    {source.name}
                  </span>
                  <Stars value={source.rating} size={IconSize.XSmall} />
                  <span className="sq-nums w-8 text-right font-bold text-text-primary typo-callout">
                    {source.rating.toFixed(1)}
                  </span>
                  <span className="sq-nums w-12 text-right text-text-quaternary typo-caption1">
                    {formatCount(source.count)}
                  </span>
                  <OpenLinkIcon
                    size={IconSize.XSmall}
                    className="text-text-quaternary"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {viewer === Viewer.Visitor ? (
        <div className="flex items-center justify-between rounded-16 border border-border-subtlest-tertiary px-4 py-3 text-text-tertiary typo-footnote">
          Join the squad to rate and review
          <Stars value={0} size={IconSize.XSmall} />
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar member={team[2]} size={2} />
              <span className="font-bold text-text-primary typo-callout">
                Rate daily.dev
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Stars value={draft} size={IconSize.Medium} onPick={setDraft} />
              <span className="sq-nums w-14 text-text-tertiary typo-caption1">
                {draft
                  ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][draft]
                  : ''}
              </span>
            </div>
          </div>
          <div className="min-h-[4.5rem] rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-quaternary typo-callout">
            What works, what does not, what you would tell a friend.
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-quaternary typo-caption1">
              Reviews are public and carry your profile.
            </span>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={!draft}
            >
              Post review
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="sq-nums text-text-tertiary typo-callout">
          <b className="text-text-primary">{squadReviewCount}</b> reviews
        </span>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="rotate-180" />}
          iconPosition={ButtonIconPosition.Right}
        >
          Most helpful
        </Button>
      </div>
      <ol className="flex flex-col divide-y divide-border-subtlest-tertiary">
        {reviews.map((review) => (
          <li key={review.id} className="flex flex-col gap-3 py-5 first:pt-0">
            <div className="flex items-center gap-3">
              <Avatar member={review.author} size={2.25} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-bold text-text-primary typo-callout">
                  {review.author.name}
                </span>
                <span className="text-text-quaternary typo-caption1">
                  Member · {review.date}
                </span>
              </div>
              <Stars value={review.rating} size={IconSize.XSmall} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-text-primary typo-callout">
                {review.title}
              </span>
              <p className="text-text-secondary typo-callout">{review.body}</p>
            </div>
            <div className="flex items-center gap-3 text-text-tertiary typo-caption1">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-text-primary"
              >
                <UpvoteIcon size={IconSize.XSmall} />
                Helpful · {review.helpful}
              </button>
              <button type="button" className="hover:text-text-primary">
                Share
              </button>
            </div>
            {review.reply && (
              <div className="ml-4 flex gap-3 rounded-12 border-l-2 border-accent-cabbage-default bg-surface-float px-4 py-3">
                <Avatar member={review.reply.author} size={1.75} />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-2 typo-caption1">
                    <span className="font-bold text-text-primary">
                      {review.reply.author.name}
                    </span>
                    <span className="rounded-6 bg-accent-cabbage-flat px-1.5 text-accent-cabbage-default typo-caption2">
                      Team
                    </span>
                    <span className="text-text-quaternary">
                      {review.reply.date}
                    </span>
                  </span>
                  <span className="text-text-secondary typo-footnote">
                    {review.reply.body}
                  </span>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Medium}
        className="w-full"
      >
        Load more
      </Button>
    </Column>
  );
};

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

const quizSource = {
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
const toQuizPost = (question: QuizQuestion, picked?: number): Post =>
  ({
    id: question.id,
    title: question.question,
    permalink: `https://daily.dev/posts/${question.id}`,
    commentsPermalink: `https://daily.dev/posts/${question.id}`,
    createdAt: '2026-09-15T09:00:00.000Z',
    endsAt: '2026-09-22T09:00:00.000Z',
    type: PostType.Poll,
    source: quizSource,
    author: {
      id: team[3].id,
      name: team[3].name,
      username: team[3].username,
      image: team[3].image,
      permalink: `https://daily.dev/${team[3].username}`,
    },
    numUpvotes: 24,
    numComments: 6,
    numPollVotes: quiz.played,
    pollOptions: question.options.map((text, index) => ({
      id: `${question.id}-${index}`,
      text,
      order: index + 1,
      numVotes: Math.round((question.split[index] / 100) * quiz.played),
    })),
    tags: ['dailydev'],
    userState: {
      vote: UserVote.None,
      flags: { feedbackDismiss: false },
      ...(picked !== undefined && {
        pollOption: { id: `${question.id}-${picked}` },
      }),
    },
  } as unknown as Post);

/**
 * The quiz is the poll post, exactly the production list card, one per
 * question. The page owns the answer: an option click is caught before the
 * card's own vote handler, the card re-renders in its results state, and a
 * line under it says which option was right and where the question came
 * from. A score lands once every card is answered.
 */
const QuizPage = ({ viewer }: { viewer: Viewer }): ReactElement => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answered = Object.keys(answers).length;
  const total = quiz.questions.length;
  const correct = quiz.questions.filter(
    (question) => answers[question.id] === question.answer,
  ).length;
  const done = answered === total;

  return (
    <Column className="gap-5">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-text-primary typo-title3">
            {quiz.title}
          </h1>
          <span className="sq-nums text-text-tertiary typo-footnote">
            {total} questions · {formatCount(quiz.played)} played · generated
            from this month&apos;s releases
          </span>
        </div>
        {viewer === Viewer.Admin ? (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<SparkleIcon secondary />}
          >
            Generate a quiz
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <span className="sq-nums text-text-tertiary typo-caption1">
              {answered} of {total} answered
            </span>
            <span className="h-1.5 w-32 overflow-hidden rounded-6 bg-surface-float">
              <span
                className="block h-full rounded-6 bg-accent-cabbage-default transition-[width]"
                style={{ width: `${(answered / total) * 100}%` }}
              />
            </span>
          </div>
        )}
      </div>

      {done && (
        <div className="flex items-center gap-4 rounded-16 border border-accent-cabbage-default bg-accent-cabbage-flat p-4">
          <span className="sq-nums font-bold leading-none text-text-primary typo-mega3">
            {correct}/{total}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-text-primary typo-callout">
              {correct === total
                ? 'Perfect.'
                : correct >= total / 2
                ? 'Nice.'
                : 'Next week.'}
            </span>
            <span className="text-text-tertiary typo-footnote">
              Better than {Math.min(98, 30 + correct * 17)}% of the squad.
            </span>
          </div>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            icon={<LinkIcon />}
          >
            Share result
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {quiz.questions.map((question) => {
          const picked = answers[question.id];
          const revealed = picked !== undefined;

          return (
            <div key={question.id} className="flex flex-col gap-2">
              <div
                onClickCapture={(event) => {
                  if (revealed || viewer === Viewer.Visitor) {
                    return;
                  }
                  const option = (event.target as HTMLElement)
                    .closest('button')
                    ?.textContent?.trim();
                  const index = question.options.indexOf(option ?? '');
                  if (index === -1) {
                    return;
                  }
                  event.preventDefault();
                  event.stopPropagation();
                  setAnswers((current) => ({
                    ...current,
                    [question.id]: index,
                  }));
                }}
              >
                <PollList
                  post={toQuizPost(question, picked)}
                  {...cardHandlers}
                />
              </div>
              <div className="flex items-center gap-2 px-4 text-text-tertiary typo-caption1">
                {revealed ? (
                  <>
                    <span
                      className={classNames(
                        'flex items-center gap-1 font-bold',
                        picked === question.answer
                          ? 'text-status-success'
                          : 'text-status-error',
                      )}
                    >
                      {picked === question.answer && (
                        <VIcon size={IconSize.XSmall} />
                      )}
                      {picked === question.answer
                        ? 'Right'
                        : `Right answer: ${question.options[question.answer]}`}
                    </span>
                    <span className="text-text-quaternary">·</span>
                    <span className="truncate">From: {question.source}</span>
                  </>
                ) : (
                  <span>
                    {viewer === Viewer.Visitor
                      ? 'Join to play'
                      : 'Pick an answer to see how the squad voted'}
                  </span>
                )}
              </div>
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
        />
      );
    case PageType.About:
      return (
        <Column width="max-w-[46rem]">
          <SquadAbout viewer={viewer} />
        </Column>
      );
    case PageType.Channel:
      return <ChannelPage page={current} viewer={viewer} />;
    case PageType.Reviews:
      return <ReviewsPage viewer={viewer} />;
    case PageType.Releases:
      return <ReleasesPage viewer={viewer} />;
    case PageType.Quiz:
      return <QuizPage viewer={viewer} />;
    case PageType.Chat:
      return <ChatPage />;
    case PageType.Doc:
      return <DocPage page={current} />;
    case PageType.Rules:
      return <RulesPage />;
    case PageType.Recurring:
      return <RecurringPage viewer={viewer} />;
    case PageType.Jobs:
      return <JobsPage />;
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
    case PageType.Reviews:
      return viewer === Viewer.Admin ? (
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          Sources
        </Button>
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
  preset = SidebarPreset.Company,
  height = 56,
  width = 1440,
}: {
  viewer?: Viewer;
  initialPage?: SquadPage;
  preset?: SidebarPreset;
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
      <SquadSidebar
        active={active}
        viewer={viewer}
        onSelect={onSelect}
        preset={preset}
      />
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
