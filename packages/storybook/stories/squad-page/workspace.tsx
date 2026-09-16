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
  BulletListIcon,
  CalendarIcon,
  CardIcon,
  CompassIcon,
  DiscussIcon,
  DocsIcon,
  DragIcon,
  EyeCancelIcon,
  FeedbackIcon,
  FlagIcon,
  HashtagIcon,
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
  PollIcon,
  SearchIcon,
  SendAirplaneIcon,
  SettingsIcon,
  SquadIcon,
  StarIcon,
  TimerIcon,
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
  products,
  squad,
  team,
} from './data';
import { Avatar, CardList, Facepile, VerifiedMark, Viewer } from './kit';
import { Composer, Kit2Styles } from './kit2';
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
    description: 'Opinions, threads, anything worth talking about.',
  }),
  help: page('help', 'Q&A', PageType.Channel, {
    badge: 5,
    description: 'Ask, answer, mark the answer. Search before you post.',
  }),
  showcase: page('showcase', 'Show and tell', PageType.Channel, {
    description: 'What you built, with the technical details.',
  }),
  links: page('links', 'Links', PageType.Channel, {
    description: "Articles, videos and tools worth the squad's time.",
  }),
  polls: page('polls', 'Polls', PageType.Channel),
  ideas: page('ideas', 'Ideas and feedback', PageType.Channel, {
    badge: 3,
    description: 'Feature requests and feedback. The team reads all of it.',
  }),
  bugs: page('bugs', 'Bugs', PageType.Channel, {
    description: 'Something broke. Steps, browser, screenshot.',
  }),
};

const docs = {
  start: page('start-here', 'Start here', PageType.Doc),
  rules: page('rules', 'Rules', PageType.Rules),
  faq: page('faq', 'FAQ', PageType.Doc),
  roadmap: page('roadmap', 'Roadmap', PageType.Doc),
};

const common = {
  home: page('home', 'Home', PageType.Home),
  about: page('about', 'About', PageType.About),
  chat: page('chat', 'Chat', PageType.Chat, { badge: 14 }),
  recurring: page('recurring', 'Recurring threads', PageType.Recurring),
  members: page('members', 'Members', PageType.Members),
  jobs: page('jobs', 'Open roles', PageType.Jobs, { badge: 2 }),
  products: page('products', 'Products', PageType.Products),
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
    { id: 'top', pages: [common.home, common.about] },
    {
      id: 'channels',
      label: 'Channels',
      pages: [
        channels.announcements,
        channels.discussions,
        channels.help,
        channels.ideas,
        channels.bugs,
        channels.showcase,
      ],
    },
    {
      id: 'read',
      label: 'Read first',
      pages: [docs.start, docs.rules, docs.faq, docs.roadmap],
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
    {
      id: 'company',
      label: 'Company',
      pages: [common.products, common.jobs],
    },
    { id: 'people', label: 'People', pages: [common.members] },
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
        channels.help,
        channels.showcase,
        channels.links,
        channels.polls,
      ],
    },
    {
      id: 'recurring',
      label: 'Recurring',
      pages: [common.recurring],
    },
    {
      id: 'read',
      label: 'Read first',
      pages: [docs.start, docs.rules, docs.faq],
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
    { id: 'people', label: 'People', pages: [common.members] },
    manage,
  ],
};

export const sections = presets[SidebarPreset.Company];

export const allPages: SquadPage[] = Object.values(presets)
  .flat()
  .flatMap((section) => section.pages)
  .filter(
    (candidate, index, list) =>
      list.findIndex((other) => other.id === candidate.id) === index,
  );

export const pageIcon = (type: PageType, size = IconSize.Small): ReactElement =>
  ({
    [PageType.Home]: <HomeIcon size={size} />,
    [PageType.About]: <HashtagIcon size={size} />,
    [PageType.Channel]: <MegaphoneIcon size={size} />,
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
  help: <FeedbackIcon size={IconSize.Small} />,
  showcase: <StarIcon size={IconSize.Small} />,
  links: <LinkIcon size={IconSize.Small} />,
  polls: <PollIcon size={IconSize.Small} />,
  ideas: <BulletListIcon size={IconSize.Small} />,
  bugs: <FlagIcon size={IconSize.Small} />,
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
        description: 'General. The default place a post lands.',
        exists: true,
      },
      {
        type: PageType.Channel,
        title: 'Q&A',
        description:
          'Questions with an accepted answer. Needs help, in Reddit words.',
        exists: false,
      },
      {
        type: PageType.Channel,
        title: 'Show and tell',
        description:
          'Projects and demos. Optionally one day a week, like Showoff Saturday.',
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
      {
        type: PageType.Channel,
        title: 'Ideas and feedback',
        description: 'Feature requests, for a company squad.',
        exists: false,
      },
      {
        type: PageType.Channel,
        title: 'Bugs',
        description: 'Bug reports with a template, for a company squad.',
        exists: false,
      },
    ],
  },
  {
    group: 'Read first',
    items: [
      {
        type: PageType.Doc,
        title: 'Start here',
        description:
          'The welcome post, as a page. Exists on every squad today.',
        exists: true,
      },
      {
        type: PageType.Rules,
        title: 'Rules',
        description:
          'Numbered, one line each, expandable. Shown before the first post.',
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
        title: 'Roadmap',
        description: 'What is coming, for a company squad.',
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
        <div className="flex items-center gap-1 text-text-tertiary typo-caption1">
          <span className="sq-nums text-text-secondary">
            {formatCount(squad.membersCount)}
          </span>
          members
          <span className="mx-1 text-text-quaternary">·</span>
          <span className="size-1.5 rounded-full bg-status-success" />
          <span className="sq-nums text-text-secondary">38</span>
          online
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
const HomePage = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <SquadHome viewer={viewer} />
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

const rules = [
  [
    'Stay on topic',
    'Posts are about daily.dev: releases, questions, feedback, bugs.',
  ],
  [
    'Search before you ask',
    'Q&A and FAQ first. Duplicates get merged into the original.',
  ],
  [
    'Show your work, not your product',
    'Show and tell is for the technical details of what you built. Commercial promotion is removed.',
  ],
  [
    'Bugs get a template',
    'Steps, expected and actual, browser or app version, a screenshot.',
  ],
  [
    'Be useful',
    'Low-effort posts and comments are removed. Answers that help stay.',
  ],
  [
    'One account, one voice',
    'No vote brigading, no sockpuppets, no reposting removed content.',
  ],
];

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
    channel: 'Q&A',
    status: 'Live now · 12 comments',
    live: true,
  },
  {
    title: 'Showoff Saturday',
    cadence: 'Weekly, Saturday',
    channel: 'Show and tell',
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
}: {
  page: SquadPage;
  viewer: Viewer;
}): ReactElement => {
  switch (current.type) {
    case PageType.Home:
      return <HomePage viewer={viewer} />;
    case PageType.About:
      return (
        <Column width="max-w-[46rem]">
          <SquadAbout viewer={viewer} />
        </Column>
      );
    case PageType.Channel:
      return <ChannelPage page={current} viewer={viewer} />;
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
