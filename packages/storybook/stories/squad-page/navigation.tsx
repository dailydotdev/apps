import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  BellIcon,
  LinkIcon,
  MenuIcon,
  OpenLinkIcon,
  SettingsIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  companyLinks,
  feedEntries,
  formatCount,
  formatSince,
  pinnedEntry,
  products,
  squad,
  team,
} from './data';
import {
  Avatar,
  isBlocked,
  isJoined,
  isLoggedIn,
  isStaff,
  isAdmin,
  linkIcon,
  VerifiedMark,
  Viewer,
} from './kit';
import { Kit2Styles } from './kit2';
import { PostsArea, SquadComposer, Widget } from './home';
import { AboutPage } from './composite';
import type { SquadPage } from './workspace';
import {
  AnalyticsPage,
  ChannelPage,
  channels,
  common,
  ContentSource,
  defaultConfig,
  docs,
  DocPage,
  FeedSourcePage,
  iconFor,
  manage,
  MembersPage,
  ModerationPage,
  PollsPage,
  ProductsPage,
  Rail,
  ReleasesPage,
  RulesPage,
  SettingsPage,
  useWorkspace,
  WorkspaceContext,
  WorkspaceStyles,
} from './workspace';

// Ten ways to carry what the squad sidebar carried, each one idea and
// nothing else, on one lean header. The sidebar held Home, Releases,
// Products, Discussions, Polls, Rules, FAQ, the links, Followers, and the
// team's Manage section. Every variant below answers the same question:
// where does a visitor click to get to Releases, and what else is on
// screen while they decide.

/* ------------------------------------------------------------------ model */

export enum Nav {
  Profile = 'profile',
  Segments = 'segments',
  Groups = 'groups',
  Toolbar = 'toolbar',
  Switcher = 'switcher',
  Rail = 'rail',
  Index = 'index',
  Card = 'card',
  Dock = 'dock',
  Filter = 'filter',
}

export interface NavSpec {
  id: Nav;
  title: string;
  after: string;
  idea: string;
  costs: string;
}

export const specs: NavSpec[] = [
  {
    id: Nav.Profile,
    title: 'Profile',
    after: 'X, Threads, GitHub organization',
    idea: 'One row of six text tabs under the header, nothing else on the page. Rules, FAQ, links and the team live in About. Followers is the count. Manage is a gear.',
    costs:
      'Nothing is previewed: a visitor learns what Releases holds by clicking it.',
  },
  {
    id: Nav.Segments,
    title: 'Segments',
    after: 'iOS segmented control, Skool',
    idea: 'A centred pill control with five segments: Feed, Releases, Products, Community, About. Discussions and Polls share Community and switch inside it.',
    costs:
      'Five is the ceiling for a pill control, so every new page has to join an existing segment.',
  },
  {
    id: Nav.Groups,
    title: 'Groups',
    after: 'LinkedIn Page, Steam community hub',
    idea: 'Three big tabs, Feed, Company, Community, and a small row of chips under the active one: Company holds Releases, Products, About; Community holds Discussions, Polls, Followers.',
    costs:
      'Two clicks to a second-level page the first time, and the grouping has to be right.',
  },
  {
    id: Nav.Toolbar,
    title: 'Toolbar',
    after: 'Linear, Notion, GitHub repository header',
    idea: 'No hero. One 56px bar carries the logo, the name, the tabs, Follow and the icons. The page starts one line down and the identity moves into a small card beside the feed.',
    costs:
      'The company loses its banner and the page reads as a tool, not a home.',
  },
  {
    id: Nav.Switcher,
    title: 'Switcher',
    after: 'Notion page title, Slack channel header',
    idea: 'No tabs. The page title is a dropdown: Posts, Releases, Products, Discussions, Polls, About, each with a one-line description. The current page is always the biggest word on screen.',
    costs:
      'The other pages are hidden until the title is opened, which costs discoverability.',
  },
  {
    id: Nav.Rail,
    title: 'Rail',
    after: 'Discord server rail, Slack workspace switcher',
    idea: 'The sidebar shrinks to an icon rail glued to the left of the content card: one glyph per page, external links marked, the gear at the bottom, labels on hover.',
    costs:
      'Icons carry no scent on their own; a first-time visitor reads tooltips.',
  },
  {
    id: Nav.Index,
    title: 'Index',
    after: 'Documentation tables of contents, Stripe docs',
    idea: 'The pages as a plain sticky text list on the right, unboxed, grouped like the sidebar was: pages, documents, links, then Manage. The feed keeps the centre.',
    costs: 'The right column is where readers have learned to look last.',
  },
  {
    id: Nav.Card,
    title: 'Card',
    after: 'LinkedIn profile card, Facebook profile',
    idea: 'The sidebar becomes the identity card. Logo, name, tagline, Follow, then the pages as a text list, then the links, in one card on the left. No banner, no header; the content card is the page.',
    costs:
      'It is still a left column, just a warmer one, and the banner is gone.',
  },
  {
    id: Nav.Dock,
    title: 'Dock',
    after: 'iOS tab bar, Arc, Raycast',
    idea: 'A floating pill at the bottom of the scroll with six icon-and-label tabs. The header has no row at all; the dock is in reach at every scroll depth.',
    costs:
      'A dock over content covers the last card, and desktop readers do not expect navigation at the bottom.',
  },
  {
    id: Nav.Filter,
    title: 'Filter',
    after: 'Threads feed switch, Bluesky',
    idea: 'One feed. A view control on the toolbar, All posts, Releases, Discussions, Polls, changes what the feed shows. Products and About are two cards beside it that open over the feed.',
    costs:
      'Releases lose their log shape, and Products has no seat of its own.',
  },
];

interface View {
  viewer: Viewer;
  active: string;
  onSelect: (id: string) => void;
}

const pages: SquadPage[] = [
  common.home,
  common.releases,
  common.products,
  channels.discussions,
  channels.polls,
];

const aboutPage: SquadPage = {
  id: 'about',
  label: 'About',
  type: docs.rules.type,
};

const navPages: SquadPage[] = [...pages, aboutPage];

const labelOf = (page: SquadPage): string =>
  page.id === 'home' ? 'Posts' : page.label;

const descriptions: Record<string, string> = {
  home: 'Everything the squad posts, newest first',
  releases: 'The changelog, fed from docs.coderabbit.ai',
  products: 'What CodeRabbit makes, with ratings',
  discussions: 'Questions, feedback and bug reports',
  polls: 'The team asks, followers vote',
  about: 'Company, rules, FAQ, team and links',
};

/* ------------------------------------------------------------- furniture */

const ManageButton = ({
  viewer,
  onSelect,
  className,
}: {
  viewer: Viewer;
  onSelect: (id: string) => void;
  className?: string;
}): ReactElement | null => {
  const [open, setOpen] = useState(false);

  if (!isStaff(viewer)) {
    return null;
  }
  const items = manage.pages.filter(
    (item) => isAdmin(viewer) || !item.adminOnly,
  );

  return (
    <div className={classNames('relative', className)}>
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<SettingsIcon />}
        aria-label="Manage"
        onClick={() => setOpen((value) => !value)}
      />
      {open && (
        <ul className="sq-elevated absolute right-0 top-full z-popup mt-1 flex w-52 flex-col rounded-12 bg-background-default p-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(item.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-8 px-2 py-1.5 text-left text-text-secondary typo-callout hover:bg-surface-float hover:text-text-primary"
              >
                {iconFor(item)}
                {item.label}
                {item.badge && (
                  <span className="sq-nums ml-auto rounded-8 bg-surface-float px-1.5 font-bold text-text-tertiary typo-caption2">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FollowButton = ({
  viewer,
  size = ButtonSize.Small,
  className,
}: {
  viewer: Viewer;
  size?: ButtonSize;
  className?: string;
}): ReactElement => {
  const { config } = useWorkspace();

  if (isJoined(viewer)) {
    return (
      <Button
        variant={ButtonVariant.Secondary}
        size={size}
        icon={<VIcon />}
        className={className}
      >
        Following
      </Button>
    );
  }

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={size}
      className={className}
      disabled={isBlocked(viewer) || !config.isPublic}
    >
      {!config.isPublic
        ? 'Invite only'
        : isLoggedIn(viewer)
        ? 'Follow'
        : 'Sign up to follow'}
    </Button>
  );
};

const Actions = ({
  viewer,
  onSelect,
}: {
  viewer: Viewer;
  onSelect: (id: string) => void;
}): ReactElement => (
  <div className="flex shrink-0 items-center gap-1">
    <FollowButton viewer={viewer} />
    {isJoined(viewer) && (
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<BellIcon />}
        aria-label="Notifications"
      />
    )}
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      icon={<LinkIcon />}
      aria-label="Share"
    />
    <ManageButton viewer={viewer} onSelect={onSelect} />
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      icon={<MenuIcon />}
      aria-label="More"
    />
  </div>
);

const Meta = ({ className }: { className?: string }): ReactElement => (
  <div
    className={classNames(
      'flex flex-wrap items-center gap-x-2 text-text-tertiary typo-footnote',
      className,
    )}
  >
    <span className="text-text-secondary">{squad.company.website}</span>
    <span className="text-text-quaternary">·</span>
    <span>{squad.category}</span>
    <span className="text-text-quaternary">·</span>
    <span>
      <b className="sq-nums text-text-secondary">
        {formatCount(squad.membersCount)}
      </b>{' '}
      followers
    </span>
    <span className="text-text-quaternary">·</span>
    <span>Since {formatSince(squad.createdAt)}</span>
  </div>
);

/** Cover, logo, name, one line of tagline, one line of meta, the actions. */
const LeanHeader = ({
  viewer,
  onSelect,
  cover = true,
  flush = false,
}: {
  viewer: Viewer;
  onSelect: (id: string) => void;
  cover?: boolean;
  /** The cover sits against a rail on its left, so only the right corner rounds. */
  flush?: boolean;
}): ReactElement => (
  <div className="flex flex-col">
    {cover && (
      <div
        className={classNames(
          'relative h-28 overflow-hidden',
          flush ? 'rounded-tr-[0.9375rem]' : 'rounded-t-[0.9375rem]',
        )}
      >
        <img
          src={squad.headerImage}
          alt=""
          className="h-full w-full object-cover object-top"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-16"
          style={{
            background:
              'linear-gradient(to top, var(--theme-background-default), transparent)',
          }}
        />
      </div>
    )}
    <div
      className={classNames(
        'flex items-start gap-4 px-6 pb-5',
        cover ? '-mt-8' : 'pt-5',
      )}
    >
      <img
        src={squad.image}
        alt=""
        className="relative size-16 shrink-0 rounded-14 bg-background-default object-cover ring-4 ring-background-default"
      />
      <div
        className={classNames(
          'flex min-w-0 flex-1 flex-col gap-1',
          cover && 'pt-9',
        )}
      >
        <h1 className="flex items-center gap-1.5 font-bold text-text-primary typo-title3">
          {squad.name}
          <VerifiedMark label={false} />
        </h1>
        <p className="truncate text-text-secondary typo-callout">
          {squad.tagline}
        </p>
        <Meta />
      </div>
      <div className={classNames(cover && 'pt-9')}>
        <Actions viewer={viewer} onSelect={onSelect} />
      </div>
    </div>
  </div>
);

const Frame = ({
  children,
  aside,
  after,
  width = 'max-w-[72rem]',
  asideWidth = 'w-72',
}: {
  children: ReactNode;
  aside?: ReactNode;
  after?: ReactNode;
  width?: string;
  asideWidth?: string;
}): ReactElement => (
  <div className={classNames('m-auto flex w-full flex-col p-4 pb-6', width)}>
    <div className="flex gap-4">
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="rounded-16 border border-border-subtlest-tertiary">
          {children}
        </div>
      </main>
      {aside && (
        <aside
          className={classNames('flex shrink-0 flex-col gap-4', asideWidth)}
        >
          {aside}
        </aside>
      )}
    </div>
    {after}
  </div>
);

const Posts = ({
  viewer,
  entries = feedEntries.slice(0, 6),
  toolbarChildren,
  sort = 'Latest',
}: {
  viewer: Viewer;
  entries?: typeof feedEntries;
  toolbarChildren?: ReactNode;
  sort?: string;
}): ReactElement => (
  <PostsArea
    sort={sort}
    entries={entries}
    pinned={pinnedEntry}
    composer={<SquadComposer viewer={viewer} />}
    toolbarChildren={toolbarChildren}
  />
);

const Body = ({
  id,
  viewer,
  onSelect,
}: {
  id: string;
  viewer: Viewer;
  onSelect: (id: string) => void;
}): ReactElement => {
  switch (id) {
    case 'home':
      return <Posts viewer={viewer} />;
    case 'releases':
      return <ReleasesPage viewer={viewer} />;
    case 'products':
      return <ProductsPage viewer={viewer} />;
    case 'discussions':
      return <ChannelPage page={channels.discussions} viewer={viewer} />;
    case 'polls':
      return <PollsPage viewer={viewer} />;
    case 'about':
      return (
        <AboutPage viewer={viewer} onOpenMembers={() => onSelect('members')} />
      );
    case 'rules':
      return <RulesPage />;
    case 'faq':
      return <DocPage page={docs.faq} />;
    case 'members':
      return <MembersPage viewer={viewer} />;
    case 'moderation':
      return <ModerationPage />;
    case 'feed':
      return <FeedSourcePage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <Posts viewer={viewer} />;
  }
};

/** A page that opened over the feed, and the way back. */
const Over = ({
  label,
  onBack,
  children,
}: {
  label: string;
  onBack: () => void;
  children: ReactNode;
}): ReactElement => (
  <>
    <div className="flex h-12 items-center gap-2 border-t border-border-subtlest-tertiary px-4">
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<ArrowIcon className="-rotate-90" />}
        aria-label="Back"
        onClick={onBack}
      />
      <span className="font-bold text-text-primary typo-callout">{label}</span>
    </div>
    {children}
  </>
);

const isNavPage = (id: string): boolean =>
  navPages.some((page) => page.id === id);

const Underline = ({
  items,
  active,
  onSelect,
  className,
  tight = false,
}: {
  items: SquadPage[];
  active: string;
  onSelect: (id: string) => void;
  className?: string;
  tight?: boolean;
}): ReactElement => (
  <div className={classNames('flex items-center px-3', className)}>
    {items.map((page) => {
      const isActive = active === page.id;
      return (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelect(page.id)}
          className={classNames(
            'relative py-3 typo-callout transition-colors',
            tight ? 'px-2' : 'px-3',
            isActive
              ? 'font-bold text-text-primary'
              : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          {labelOf(page)}
          {isActive && (
            <span
              className={classNames(
                'absolute bottom-0 h-0.5 rounded-2 bg-accent-cabbage-default',
                tight ? 'inset-x-2' : 'inset-x-3',
              )}
            />
          )}
        </button>
      );
    })}
  </div>
);

/* ------------------------------------------------------------- 01 profile */

const ProfileView = ({ viewer, active, onSelect }: View): ReactElement => (
  <Frame width="max-w-[52rem]">
    <LeanHeader viewer={viewer} onSelect={onSelect} />
    <Underline
      items={navPages}
      active={active}
      onSelect={onSelect}
      className="border-t border-border-subtlest-tertiary"
    />
    {isNavPage(active) ? (
      <Body id={active} viewer={viewer} onSelect={onSelect} />
    ) : (
      <Over label={active} onBack={() => onSelect('home')}>
        <Body id={active} viewer={viewer} onSelect={onSelect} />
      </Over>
    )}
  </Frame>
);

/* ------------------------------------------------------------ 02 segments */

const segments = [
  { id: 'home', label: 'Feed' },
  { id: 'releases', label: 'Releases' },
  { id: 'products', label: 'Products' },
  { id: 'discussions', label: 'Community' },
  { id: 'about', label: 'About' },
];

const Pills = ({
  items,
  active,
  onSelect,
  size = 'md',
}: {
  items: { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
  size?: 'sm' | 'md';
}): ReactElement => (
  <div className="flex items-center gap-0.5 rounded-[999px] bg-surface-float p-1">
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelect(item.id)}
        className={classNames(
          'rounded-[999px] transition-colors',
          size === 'md'
            ? 'px-4 py-1.5 typo-callout'
            : 'px-3 py-1 typo-footnote',
          active === item.id
            ? 'bg-background-default font-bold text-text-primary shadow-2'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {item.label}
      </button>
    ))}
  </div>
);

const community = [
  { id: 'discussions', label: 'Discussions' },
  { id: 'polls', label: 'Polls' },
];

const SegmentsView = ({ viewer, active, onSelect }: View): ReactElement => {
  const segment =
    active === 'polls' ? 'discussions' : isNavPage(active) ? active : 'home';

  return (
    <Frame width="max-w-[52rem]">
      <LeanHeader viewer={viewer} onSelect={onSelect} />
      <div className="flex justify-center border-t border-border-subtlest-tertiary py-3">
        <Pills items={segments} active={segment} onSelect={onSelect} />
      </div>
      {(active === 'discussions' || active === 'polls') && (
        <div className="flex justify-center pb-1">
          <Pills
            items={community}
            active={active}
            onSelect={onSelect}
            size="sm"
          />
        </div>
      )}
      {isNavPage(active) ? (
        <Body id={active} viewer={viewer} onSelect={onSelect} />
      ) : (
        <Over label={active} onBack={() => onSelect('home')}>
          <Body id={active} viewer={viewer} onSelect={onSelect} />
        </Over>
      )}
    </Frame>
  );
};

/* -------------------------------------------------------------- 03 groups */

const groups: { id: string; label: string; pages: string[] }[] = [
  { id: 'feed', label: 'Feed', pages: ['home'] },
  { id: 'company', label: 'Company', pages: ['releases', 'products', 'about'] },
  {
    id: 'community',
    label: 'Community',
    pages: ['discussions', 'polls', 'members'],
  },
];

const chipLabel: Record<string, string> = {
  releases: 'Releases',
  products: 'Products',
  about: 'About',
  discussions: 'Discussions',
  polls: 'Polls',
  members: 'Followers',
};

const GroupsView = ({ viewer, active, onSelect }: View): ReactElement => {
  const group =
    groups.find((candidate) => candidate.pages.includes(active)) ?? groups[0];

  return (
    <Frame width="max-w-[52rem]">
      <LeanHeader viewer={viewer} onSelect={onSelect} />
      <div className="flex items-center gap-1 border-t border-border-subtlest-tertiary px-4 pt-3">
        {groups.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            onClick={() => onSelect(candidate.pages[0])}
            className={classNames(
              'rounded-10 px-3 py-1.5 font-bold typo-body transition-colors',
              group.id === candidate.id
                ? 'text-text-primary'
                : 'text-text-quaternary hover:text-text-secondary',
            )}
          >
            {candidate.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 px-6 pb-3 pt-1">
        {group.pages.length > 1 ? (
          group.pages.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={classNames(
                'rounded-[999px] px-3 py-1 typo-footnote transition-colors',
                active === id
                  ? 'bg-text-primary font-bold text-background-default'
                  : 'bg-surface-float text-text-secondary hover:text-text-primary',
              )}
            >
              {chipLabel[id]}
            </button>
          ))
        ) : (
          <span className="py-1 text-text-quaternary typo-footnote">
            Everything the squad posts, newest first
          </span>
        )}
      </div>
      <div className="border-t border-border-subtlest-tertiary">
        <Body id={active} viewer={viewer} onSelect={onSelect} />
      </div>
    </Frame>
  );
};

/* ------------------------------------------------------------- 04 toolbar */

const IdentityCard = ({
  onOpenMembers,
}: {
  onOpenMembers: () => void;
}): ReactElement => (
  <Widget
    title={
      <span className="flex items-center gap-1.5">
        {squad.name}
        <VerifiedMark label={false} />
      </span>
    }
  >
    <p className="mt-2 text-text-secondary typo-footnote">{squad.tagline}</p>
    <Meta className="mt-2" />
    <div className="mt-3 flex flex-wrap gap-1">
      {companyLinks.map((link) => (
        <Button
          key={link.id}
          tag="a"
          href={link.href}
          target="_blank"
          rel="noopener"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.XSmall}
          icon={linkIcon(link.id, IconSize.XSmall)}
          aria-label={link.label}
        />
      ))}
    </div>
    <button
      type="button"
      onClick={onOpenMembers}
      className="mt-3 flex items-center gap-2 text-text-tertiary typo-footnote hover:text-text-primary"
    >
      <span className="flex -space-x-1.5">
        {team.slice(0, 5).map((member) => (
          <Avatar
            key={member.id}
            member={member}
            size={1.5}
            className="ring-2 ring-background-default"
          />
        ))}
      </span>
      Team of {team.length}
    </button>
  </Widget>
);

const ToolbarView = ({ viewer, active, onSelect }: View): ReactElement => (
  <Frame
    asideWidth="w-60"
    aside={
      active === 'home' && (
        <IdentityCard onOpenMembers={() => onSelect('members')} />
      )
    }
  >
    <div className="flex h-14 items-center gap-2 px-4">
      <img src={squad.image} alt="" className="size-7 rounded-8 object-cover" />
      <span className="flex items-center gap-1 font-bold text-text-primary typo-callout">
        {squad.name}
        <VerifiedMark label={false} />
      </span>
      <span className="mx-1 h-6 w-px bg-border-subtlest-tertiary" />
      <Underline
        items={navPages}
        active={active}
        onSelect={onSelect}
        className="min-w-0 flex-1 px-0"
        tight
      />
      <Actions viewer={viewer} onSelect={onSelect} />
    </div>
    <div className="border-t border-border-subtlest-tertiary">
      {isNavPage(active) ? (
        <Body id={active} viewer={viewer} onSelect={onSelect} />
      ) : (
        <Over label={active} onBack={() => onSelect('home')}>
          <Body id={active} viewer={viewer} onSelect={onSelect} />
        </Over>
      )}
    </div>
  </Frame>
);

/* ------------------------------------------------------------ 05 switcher */

const SwitcherView = ({ viewer, active, onSelect }: View): ReactElement => {
  const [open, setOpen] = useState(false);
  const current = navPages.find((page) => page.id === active);

  return (
    <Frame width="max-w-[52rem]">
      <LeanHeader viewer={viewer} onSelect={onSelect} />
      <div className="relative flex items-center gap-3 border-t border-border-subtlest-tertiary px-6 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-2 rounded-12 px-2 py-1 -ml-2 font-bold text-text-primary typo-title3 hover:bg-surface-float"
        >
          {current ? labelOf(current) : active}
          <ArrowIcon
            size={IconSize.Small}
            className={classNames(
              'text-text-tertiary transition-transform',
              open ? '' : 'rotate-180',
            )}
          />
        </button>
        {current && (
          <span className="text-text-quaternary typo-footnote">
            {descriptions[current.id]}
          </span>
        )}
        {open && (
          <ul className="sq-elevated absolute left-4 top-full z-popup mt-1 flex w-80 flex-col rounded-12 bg-background-default p-1">
            {navPages.map((page) => (
              <li key={page.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(page.id);
                    setOpen(false);
                  }}
                  className={classNames(
                    'flex w-full items-start gap-3 rounded-8 px-2 py-2 text-left hover:bg-surface-float',
                    active === page.id
                      ? 'text-text-primary'
                      : 'text-text-secondary',
                  )}
                >
                  <span className="mt-0.5 text-text-tertiary">
                    {iconFor(page)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-bold typo-callout">
                      {labelOf(page)}
                    </span>
                    <span className="text-text-quaternary typo-caption1">
                      {descriptions[page.id]}
                    </span>
                  </span>
                  {active === page.id && (
                    <VIcon
                      size={IconSize.Small}
                      className="mt-1 text-accent-cabbage-default"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-border-subtlest-tertiary">
        {isNavPage(active) ? (
          <Body id={active} viewer={viewer} onSelect={onSelect} />
        ) : (
          <Over label={active} onBack={() => onSelect('home')}>
            <Body id={active} viewer={viewer} onSelect={onSelect} />
          </Over>
        )}
      </div>
    </Frame>
  );
};

/* ---------------------------------------------------------------- 06 rail */

const railPages: SquadPage[] = [...pages, docs.rules, docs.faq, common.members];

const RailView = ({ viewer, active, onSelect }: View): ReactElement => (
  <div className="m-auto flex w-full max-w-[72rem] p-4 pb-6">
    <div className="flex min-w-0 flex-1 rounded-16 border border-border-subtlest-tertiary">
      <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border-subtlest-tertiary py-3">
        {railPages.map((page) => (
          <button
            key={page.id}
            type="button"
            title={labelOf(page)}
            onClick={() => onSelect(page.id)}
            className={classNames(
              'flex size-10 items-center justify-center rounded-12 transition-colors',
              active === page.id
                ? 'bg-surface-float text-text-primary'
                : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
            )}
          >
            {iconFor(page)}
          </button>
        ))}
        <span className="my-1 h-px w-6 bg-border-subtlest-tertiary" />
        {companyLinks.slice(0, 3).map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`${link.label} ↗`}
            className="flex size-10 items-center justify-center rounded-12 text-text-quaternary transition-colors hover:bg-surface-float hover:text-text-primary"
          >
            {linkIcon(link.id)}
          </a>
        ))}
        {isStaff(viewer) && (
          <div className="mt-auto">
            <ManageButton viewer={viewer} onSelect={onSelect} />
          </div>
        )}
      </nav>
      <div className="flex min-w-0 flex-1 flex-col">
        <LeanHeader viewer={viewer} onSelect={onSelect} flush />
        <div className="border-t border-border-subtlest-tertiary">
          <Body id={active} viewer={viewer} onSelect={onSelect} />
        </div>
      </div>
    </div>
  </div>
);

/* --------------------------------------------------------------- 07 index */

const IndexList = ({ viewer, active, onSelect }: View): ReactElement => {
  const Item = ({
    id,
    label,
    external,
    href,
  }: {
    id: string;
    label: string;
    external?: boolean;
    href?: string;
  }): ReactElement => {
    const className = classNames(
      'flex items-center gap-2 border-l-2 py-1.5 pl-3 text-left typo-callout transition-colors',
      active === id
        ? 'border-accent-cabbage-default font-bold text-text-primary'
        : 'border-transparent text-text-tertiary hover:text-text-primary',
    );
    return external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
        <OpenLinkIcon size={IconSize.XSmall} className="text-text-quaternary" />
      </a>
    ) : (
      <button type="button" onClick={() => onSelect(id)} className={className}>
        {label}
      </button>
    );
  };
  const Group = ({
    label,
    children,
  }: {
    label?: string;
    children: ReactNode;
  }) => (
    <div className="flex flex-col">
      {label && (
        <span className="mb-1 pl-3 font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption2">
          {label}
        </span>
      )}
      {children}
    </div>
  );

  return (
    <nav className="sticky top-4 flex flex-col gap-5">
      <Group>
        {pages.map((page) => (
          <Item key={page.id} id={page.id} label={labelOf(page)} />
        ))}
      </Group>
      <Group label="Read first">
        <Item id="rules" label="Rules" />
        <Item id="faq" label="FAQ" />
      </Group>
      <Group label="Links">
        {companyLinks.map((link) => (
          <Item
            key={link.id}
            id={link.id}
            label={link.label}
            external
            href={link.href}
          />
        ))}
      </Group>
      <Group label="People">
        <Item
          id="members"
          label={`Followers · ${formatCount(squad.membersCount)}`}
        />
      </Group>
      {isStaff(viewer) && (
        <Group label="Manage">
          {manage.pages
            .filter((item) => isAdmin(viewer) || !item.adminOnly)
            .map((item) => (
              <Item key={item.id} id={item.id} label={item.label} />
            ))}
        </Group>
      )}
    </nav>
  );
};

const IndexView = (view: View): ReactElement => (
  <div className="m-auto flex w-full max-w-[72rem] gap-8 p-4 pb-6">
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="rounded-16 border border-border-subtlest-tertiary">
        <LeanHeader viewer={view.viewer} onSelect={view.onSelect} />
        <div className="border-t border-border-subtlest-tertiary">
          <Body
            id={view.active}
            viewer={view.viewer}
            onSelect={view.onSelect}
          />
        </div>
      </div>
    </main>
    <aside className="w-52 shrink-0">
      <IndexList {...view} />
    </aside>
  </div>
);

/* ---------------------------------------------------------------- 08 card */

const CardView = ({ viewer, active, onSelect }: View): ReactElement => (
  <div className="m-auto flex w-full max-w-[72rem] gap-4 p-4 pb-6">
    <aside className="w-72 shrink-0">
      <div className="sticky top-4 flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-5">
        <img
          src={squad.image}
          alt=""
          className="size-16 rounded-14 object-cover"
        />
        <div className="flex flex-col gap-1">
          <h1 className="flex items-center gap-1.5 font-bold text-text-primary typo-title3">
            {squad.name}
            <VerifiedMark label={false} />
          </h1>
          <p className="text-text-secondary typo-footnote">{squad.tagline}</p>
          <Meta className="mt-1" />
        </div>
        <div className="flex items-center gap-1">
          <FollowButton viewer={viewer} className="flex-1" />
          {isJoined(viewer) && (
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<BellIcon />}
              aria-label="Notifications"
            />
          )}
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<LinkIcon />}
            aria-label="Share"
          />
          <ManageButton viewer={viewer} onSelect={onSelect} />
        </div>
        <nav className="-mx-2 flex flex-col border-t border-border-subtlest-tertiary pt-3">
          {[...navPages, common.members].map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => onSelect(page.id)}
              className={classNames(
                'flex items-center gap-2.5 rounded-10 px-2 py-1.5 text-left typo-callout transition-colors',
                active === page.id
                  ? 'bg-surface-float font-bold text-text-primary'
                  : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
              )}
            >
              {iconFor(page)}
              {page.id === 'members' ? 'Followers' : labelOf(page)}
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap gap-1 border-t border-border-subtlest-tertiary pt-3">
          {companyLinks.map((link) => (
            <Button
              key={link.id}
              tag="a"
              href={link.href}
              target="_blank"
              rel="noopener"
              variant={ButtonVariant.Subtle}
              size={ButtonSize.XSmall}
              icon={linkIcon(link.id, IconSize.XSmall)}
              aria-label={link.label}
            />
          ))}
        </div>
      </div>
    </aside>
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="rounded-16 border border-border-subtlest-tertiary">
        <Body id={active} viewer={viewer} onSelect={onSelect} />
      </div>
    </main>
  </div>
);

/* ---------------------------------------------------------------- 09 dock */

const DockView = ({ viewer, active, onSelect }: View): ReactElement => (
  <Frame
    width="max-w-[52rem]"
    after={
      <div className="sticky bottom-4 z-3 mt-4 flex justify-center">
        <nav
          className="sq-elevated flex items-center gap-0.5 rounded-[999px] p-1"
          style={{
            background:
              'color-mix(in srgb, var(--theme-background-default) 82%, transparent)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {navPages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => onSelect(page.id)}
              className={classNames(
                'flex items-center gap-1.5 rounded-[999px] px-3 py-2 typo-footnote transition-colors',
                active === page.id
                  ? 'bg-text-primary font-bold text-background-default'
                  : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
              )}
            >
              {iconFor(page)}
              {labelOf(page)}
            </button>
          ))}
        </nav>
      </div>
    }
  >
    <LeanHeader viewer={viewer} onSelect={onSelect} />
    <div className="border-t border-border-subtlest-tertiary">
      {isNavPage(active) ? (
        <Body id={active} viewer={viewer} onSelect={onSelect} />
      ) : (
        <Over label={active} onBack={() => onSelect('home')}>
          <Body id={active} viewer={viewer} onSelect={onSelect} />
        </Over>
      )}
    </div>
  </Frame>
);

/* -------------------------------------------------------------- 10 filter */

const views = [
  { id: 'all', label: 'All posts' },
  { id: 'releases', label: 'Releases' },
  { id: 'discussions', label: 'Discussions' },
  { id: 'polls', label: 'Polls' },
];

const releaseEntries = feedEntries.filter((_, index) => index % 3 !== 2);
const discussionEntries = feedEntries.filter((_, index) => index % 3 === 2);

const ViewMenu = ({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}): ReactElement => {
  const [open, setOpen] = useState(false);
  const current = views.find((view) => view.id === active) ?? views[0];

  return (
    <div className="relative">
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<ArrowIcon className={open ? '' : 'rotate-180'} />}
        onClick={() => setOpen((value) => !value)}
      >
        {current.label}
      </Button>
      {open && (
        <ul className="sq-elevated absolute left-0 top-full z-popup mt-1 flex w-44 flex-col rounded-12 bg-background-default p-1">
          {views.map((view) => (
            <li key={view.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(view.id);
                  setOpen(false);
                }}
                className={classNames(
                  'flex w-full items-center rounded-8 px-2 py-1.5 text-left typo-callout hover:bg-surface-float',
                  view.id === active
                    ? 'font-bold text-text-primary'
                    : 'text-text-secondary',
                )}
              >
                {view.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ProductsCard = ({ onOpen }: { onOpen: () => void }): ReactElement => (
  <Widget
    title="Products"
    action={
      <button
        type="button"
        onClick={onOpen}
        className="text-text-tertiary typo-footnote hover:text-text-primary"
      >
        See all {products.length}
      </button>
    }
  >
    <ul className="mt-3 flex flex-col gap-2.5">
      {products.slice(0, 3).map((product) => (
        <li key={product.id} className="flex items-center gap-3">
          <img
            src={product.image}
            alt=""
            className="size-8 shrink-0 rounded-10 object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {product.name}
            </span>
            <span className="truncate text-text-tertiary typo-footnote">
              {product.tagline}
            </span>
          </div>
        </li>
      ))}
    </ul>
  </Widget>
);

const FilterView = ({ viewer, active, onSelect }: View): ReactElement => {
  const [view, setView] = useState('all');
  const overFeed = active !== 'home';
  const entries =
    view === 'releases'
      ? releaseEntries.slice(0, 6)
      : view === 'discussions'
      ? discussionEntries.slice(0, 6)
      : view === 'polls'
      ? feedEntries.slice(2, 4)
      : feedEntries.slice(0, 6);

  return (
    <Frame
      aside={
        <>
          <ProductsCard onOpen={() => onSelect('products')} />
          <IdentityCard onOpenMembers={() => onSelect('members')} />
        </>
      }
    >
      <LeanHeader viewer={viewer} onSelect={onSelect} />
      <div className="border-t border-border-subtlest-tertiary">
        {overFeed ? (
          <Over label={active} onBack={() => onSelect('home')}>
            <Body id={active} viewer={viewer} onSelect={onSelect} />
          </Over>
        ) : view === 'polls' ? (
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
              <ViewMenu active={view} onSelect={setView} />
            </div>
            <PollsPage viewer={viewer} />
          </div>
        ) : (
          <PostsArea
            sort={view === 'all' ? 'Latest' : 'Latest'}
            entries={entries}
            pinned={view === 'all' ? pinnedEntry : undefined}
            composer={view === 'all' && <SquadComposer viewer={viewer} />}
            toolbarChildren={<ViewMenu active={view} onSelect={setView} />}
          />
        )}
      </div>
    </Frame>
  );
};

/* ---------------------------------------------------------------- shell */

const viewsByNav: Record<Nav, (view: View) => ReactElement> = {
  [Nav.Profile]: ProfileView,
  [Nav.Segments]: SegmentsView,
  [Nav.Groups]: GroupsView,
  [Nav.Toolbar]: ToolbarView,
  [Nav.Switcher]: SwitcherView,
  [Nav.Rail]: RailView,
  [Nav.Index]: IndexView,
  [Nav.Card]: CardView,
  [Nav.Dock]: DockView,
  [Nav.Filter]: FilterView,
};

export const navPageIds = [
  ...navPages.map((page) => page.id),
  'rules',
  'faq',
  'members',
  ...manage.pages.map((page) => page.id),
];

export const NavShell = ({
  nav,
  viewer = Viewer.Visitor,
  initialPage = 'home',
  height = 48,
  width = 1440,
}: {
  nav: Nav;
  viewer?: Viewer;
  initialPage?: string;
  /** rem */
  height?: number;
  width?: number;
}): ReactElement => {
  const [active, setActive] = useState(initialPage);
  const View = viewsByNav[nav];

  return (
    <WorkspaceContext.Provider
      value={{
        viewer,
        source: ContentSource.Feed,
        empty: false,
        isPrivate: false,
        config: defaultConfig,
      }}
    >
      <div
        style={{ width, maxWidth: '100%', height: `${height}rem` }}
        className="sq-elevated flex overflow-hidden rounded-16 bg-background-default text-text-primary"
      >
        <WorkspaceStyles />
        <Kit2Styles />
        <Rail />
        <main className="ws-scroll flex min-w-0 flex-1 flex-col overflow-y-auto">
          <View viewer={viewer} active={active} onSelect={setActive} />
        </main>
      </div>
    </WorkspaceContext.Provider>
  );
};
