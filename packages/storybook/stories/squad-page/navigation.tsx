import type { ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  BellIcon,
  LinkIcon,
  MenuIcon,
  SettingsIcon,
  UpvoteIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  companyLinks,
  feedEntries,
  formatCount,
  pinnedEntry,
  polls,
  products,
  squad,
} from './data';
import {
  Avatar,
  CardList,
  isAdmin,
  isBlocked,
  isJoined,
  isLoggedIn,
  isStaff,
  linkIcon,
  VerifiedMark,
  Viewer,
} from './kit';
import { Kit2Styles } from './kit2';
import { PostsArea, SquadComposer, SquadHeader, SquadWidgets } from './home';
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

// The squad's left column is gone. The profile header and the profile's
// right column (Official company page, Rules, Team, Stack and tools,
// Overview, Links) stay exactly as they are. What the column carried
// besides those, the pages (Home, Releases, Products, Discussions, Polls)
// and the team's Manage section, has to live in the header or the centre.
// Ten ways to do that, one idea each, all on the same base.

/* ------------------------------------------------------------------ model */

export enum Nav {
  Tabs = 'tabs',
  Segments = 'segments',
  Groups = 'groups',
  Switcher = 'switcher',
  Sticky = 'sticky',
  Toolbar = 'toolbar',
  Rail = 'rail',
  Dock = 'dock',
  Chips = 'chips',
  Shelves = 'shelves',
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
    id: Nav.Tabs,
    title: 'Tabs',
    after: 'X profile, GitHub organization',
    idea: 'One underline row of five text tabs under the header: Posts, Releases, Products, Discussions, Polls. Nothing else changes.',
    costs: 'Holds five or six; past that the row scrolls.',
  },
  {
    id: Nav.Segments,
    title: 'Segments',
    after: 'iOS segmented control, Skool',
    idea: 'A centred pill control with four segments: Feed, Releases, Products, Community. Discussions and Polls share Community and switch inside it.',
    costs:
      'Four or five is the ceiling for a pill, so new pages join a segment.',
  },
  {
    id: Nav.Groups,
    title: 'Groups',
    after: 'LinkedIn Page, Steam community hub',
    idea: 'Three big words, Feed, Company, Community, and a row of small chips under the active one: Company holds Releases and Products; Community holds Discussions, Polls and Followers.',
    costs: 'Two clicks to a second-level page the first time.',
  },
  {
    id: Nav.Switcher,
    title: 'Switcher',
    after: 'Notion page title, Slack channel header',
    idea: 'No row. The page title under the header is a dropdown: Posts, Releases, Products, Discussions, Polls, each with a one-line description. The current page is always the biggest word.',
    costs: 'The other pages are hidden until the title is opened.',
  },
  {
    id: Nav.Sticky,
    title: 'Sticky',
    after: 'YouTube channel, LinkedIn on mobile',
    idea: 'The tab row, plus a scroll rule: when it reaches the top it sticks, and the logo, name and Follow slide into it. Navigation and the primary action stay in reach at any depth.',
    costs: 'One row of viewport is spent on every page once scrolled.',
  },
  {
    id: Nav.Toolbar,
    title: 'Toolbar',
    after: 'Linear, GitHub repository header',
    idea: 'The centre card has no hero. A 56px bar carries the logo, the name, the tabs and the actions; the feed starts one line down. The right column already tells who this is.',
    costs: 'The banner, tagline and stats are gone from the centre.',
  },
  {
    id: Nav.Rail,
    title: 'Rail',
    after: 'Discord server rail, Slack workspace switcher',
    idea: 'The column shrinks to a sticky icon rail beside the centre card: one glyph per page, labels on hover, the gear at the bottom for staff. The column is shifted, not removed.',
    costs: 'Icons carry no scent; a first visit reads tooltips.',
  },
  {
    id: Nav.Dock,
    title: 'Dock',
    after: 'iOS tab bar, Arc, Raycast',
    idea: 'A floating pill at the bottom of the centre column with five icon-and-label tabs. The header has no row; the dock is in reach at every scroll depth.',
    costs:
      'It covers the last card, and desktop readers do not expect navigation at the bottom.',
  },
  {
    id: Nav.Chips,
    title: 'Chips',
    after: 'Threads and Bluesky feed switches',
    idea: 'One feed. Chips on the toolbar filter it by kind: All, Releases, Discussions, Polls. Products is a chip too, and swaps the body for the catalogue.',
    costs:
      'Releases lose their log shape, and a chip is a filter that has to act like a page for Products.',
  },
  {
    id: Nav.Shelves,
    title: 'Shelves',
    after: 'YouTube channel Home, Patreon Home',
    idea: 'Home is a stack of shelves: the latest release, the products, the open poll, the latest posts, each with See all. A page opens over Home with a back button.',
    costs: 'The feed no longer dominates Home; it starts one click away.',
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

const labelOf = (page: SquadPage): string =>
  page.id === 'home' ? 'Posts' : page.label;

const isPage = (id: string): boolean => pages.some((page) => page.id === id);

const descriptions: Record<string, string> = {
  home: 'Everything the squad posts, newest first',
  releases: 'The changelog, fed from docs.coderabbit.ai',
  products: 'What CodeRabbit makes, with ratings',
  discussions: 'Questions, feedback and bug reports',
  polls: 'The team asks, followers vote',
};

/* ------------------------------------------------------------- furniture */

export const ManageButton = ({
  viewer,
  onSelect,
  align = 'right',
}: {
  viewer: Viewer;
  onSelect: (id: string) => void;
  align?: 'right' | 'left';
}): ReactElement | null => {
  const [open, setOpen] = useState(false);

  if (!isStaff(viewer)) {
    return null;
  }
  const items = manage.pages.filter(
    (item) => isAdmin(viewer) || !item.adminOnly,
  );

  return (
    <div className="relative">
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<SettingsIcon />}
        aria-label="Manage"
        title="Manage"
        onClick={() => setOpen((value) => !value)}
      />
      {open && (
        <ul
          className={classNames(
            'sq-elevated absolute top-full z-popup mt-1 flex w-52 flex-col rounded-12 bg-background-default p-1',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
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

export const FollowButton = ({
  viewer,
  size = ButtonSize.Small,
}: {
  viewer: Viewer;
  size?: ButtonSize;
}): ReactElement => {
  const { config } = useWorkspace();

  if (isJoined(viewer)) {
    return (
      <Button variant={ButtonVariant.Secondary} size={size}>
        Following
      </Button>
    );
  }

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={size}
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

/** The profile header, with the team's gear beside the actions. */
const Header = ({ viewer, onSelect }: View): ReactElement => (
  <SquadHeader
    viewer={viewer}
    standalone
    onOpenMembers={() => onSelect('members')}
    extra={<ManageButton viewer={viewer} onSelect={onSelect} />}
  />
);

/** The profile's right column, untouched. */
const Widgets = ({ viewer, onSelect }: View): ReactElement => (
  <SquadWidgets
    viewer={viewer}
    onOpenRules={() => onSelect('rules')}
    onOpenFaq={() => onSelect('faq')}
  />
);

const Frame = ({
  children,
  aside,
  before,
  after,
}: {
  children: ReactNode;
  aside: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
}): ReactElement => (
  <div className="m-auto flex w-full max-w-[72rem] gap-4 p-4 pb-6">
    {before}
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="rounded-16 border border-border-subtlest-tertiary">
        {children}
      </div>
      {after}
    </main>
    <aside className="flex w-80 shrink-0 flex-col gap-4">{aside}</aside>
  </div>
);

const Posts = ({
  viewer,
  entries = feedEntries.slice(0, 6),
  pinned = pinnedEntry,
  toolbarChildren,
}: {
  viewer: Viewer;
  entries?: typeof feedEntries;
  pinned?: typeof pinnedEntry;
  toolbarChildren?: ReactNode;
}): ReactElement => (
  <PostsArea
    sort="Latest"
    entries={entries}
    pinned={pinned}
    composer={<SquadComposer viewer={viewer} />}
    toolbarChildren={toolbarChildren}
  />
);

const Body = ({ id, viewer }: { id: string; viewer: Viewer }): ReactElement => {
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

const titles: Record<string, string> = {
  rules: 'Rules',
  faq: 'FAQ',
  members: 'Followers',
  moderation: 'Moderation',
  feed: 'Content feed',
  analytics: 'Analytics',
  settings: 'Settings',
};

/** A page that opened over the centre, and the way back. */
const Over = ({
  id,
  onBack,
  children,
}: {
  id: string;
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
      <span className="font-bold text-text-primary typo-callout">
        {titles[id] ?? id}
      </span>
    </div>
    {children}
  </>
);

/** The centre below the navigation: a page, or something opened over it. */
const Centre = ({ viewer, active, onSelect }: View): ReactElement =>
  isPage(active) ? (
    <Body id={active} viewer={viewer} />
  ) : (
    <Over id={active} onBack={() => onSelect('home')}>
      <Body id={active} viewer={viewer} />
    </Over>
  );

const Underline = ({
  active,
  onSelect,
  className,
  tight = false,
}: {
  active: string;
  onSelect: (id: string) => void;
  className?: string;
  tight?: boolean;
}): ReactElement => (
  <div className={classNames('flex items-center px-3', className)}>
    {pages.map((page) => {
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

/* ---------------------------------------------------------------- 01 tabs */

const TabsView = (view: View): ReactElement => (
  <Frame aside={<Widgets {...view} />}>
    <Header {...view} />
    <Underline
      active={view.active}
      onSelect={view.onSelect}
      className="border-t border-border-subtlest-tertiary"
    />
    <Centre {...view} />
  </Frame>
);

/* ------------------------------------------------------------ 02 segments */

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

const segments = [
  { id: 'home', label: 'Feed' },
  { id: 'releases', label: 'Releases' },
  { id: 'products', label: 'Products' },
  { id: 'discussions', label: 'Community' },
];

const community = [
  { id: 'discussions', label: 'Discussions' },
  { id: 'polls', label: 'Polls' },
];

const SegmentsView = (view: View): ReactElement => {
  const { active, onSelect } = view;
  const segment =
    active === 'polls' ? 'discussions' : isPage(active) ? active : 'home';

  return (
    <Frame aside={<Widgets {...view} />}>
      <Header {...view} />
      <div className="flex flex-col items-center gap-2 border-t border-border-subtlest-tertiary py-3">
        <Pills items={segments} active={segment} onSelect={onSelect} />
        {(active === 'discussions' || active === 'polls') && (
          <Pills
            items={community}
            active={active}
            onSelect={onSelect}
            size="sm"
          />
        )}
      </div>
      <Centre {...view} />
    </Frame>
  );
};

/* -------------------------------------------------------------- 03 groups */

const groups = [
  { id: 'feed', label: 'Feed', pages: ['home'] },
  { id: 'company', label: 'Company', pages: ['releases', 'products'] },
  {
    id: 'community',
    label: 'Community',
    pages: ['discussions', 'polls', 'members'],
  },
];

const chipLabel: Record<string, string> = {
  releases: 'Releases',
  products: 'Products',
  discussions: 'Discussions',
  polls: 'Polls',
  members: 'Followers',
};

const GroupsView = (view: View): ReactElement => {
  const { viewer, active, onSelect } = view;
  const group =
    groups.find((candidate) => candidate.pages.includes(active)) ?? groups[0];

  return (
    <Frame aside={<Widgets {...view} />}>
      <Header {...view} />
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
            {descriptions.home}
          </span>
        )}
      </div>
      <div className="border-t border-border-subtlest-tertiary">
        {group.pages.includes(active) ? (
          <Body id={active} viewer={viewer} />
        ) : (
          <Over id={active} onBack={() => onSelect('home')}>
            <Body id={active} viewer={viewer} />
          </Over>
        )}
      </div>
    </Frame>
  );
};

/* ------------------------------------------------------------ 04 switcher */

const SwitcherView = (view: View): ReactElement => {
  const { active, onSelect } = view;
  const [open, setOpen] = useState(false);
  const current = pages.find((page) => page.id === active);

  return (
    <Frame aside={<Widgets {...view} />}>
      <Header {...view} />
      <div className="relative flex items-center gap-3 border-t border-border-subtlest-tertiary px-6 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="-ml-2 flex items-center gap-2 rounded-12 px-2 py-1 font-bold text-text-primary typo-title3 hover:bg-surface-float"
        >
          {current ? labelOf(current) : titles[active] ?? active}
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
            {pages.map((page) => (
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
        <Centre {...view} />
      </div>
    </Frame>
  );
};

/* -------------------------------------------------------------- 05 sticky */

const Slide = ({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex shrink-0 items-center overflow-hidden transition-all duration-200',
      className,
    )}
    style={{ maxWidth: open ? '18rem' : 0, opacity: open ? 1 : 0 }}
  >
    {children}
  </div>
);

const StickyTabs = ({ viewer, active, onSelect }: View): ReactElement => {
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useLayoutEffect(() => {
    const node = sentinel.current;
    if (!node) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { root: node.closest('.ws-scroll'), threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} className="h-px" />
      <div
        className={classNames(
          'sticky top-0 z-3 flex items-center border-t border-border-subtlest-tertiary bg-background-default px-3',
          stuck && 'shadow-2',
        )}
      >
        <Slide open={stuck} className="gap-2">
          <img
            src={squad.image}
            alt=""
            className="size-6 shrink-0 rounded-6 object-cover"
          />
          <span className="flex items-center gap-1 whitespace-nowrap font-bold text-text-primary typo-callout">
            {squad.name}
            <VerifiedMark label={false} />
          </span>
          <span className="mx-1 h-5 w-px shrink-0 bg-border-subtlest-tertiary" />
        </Slide>
        <Underline
          active={active}
          onSelect={onSelect}
          className="min-w-0 flex-1 px-0"
          tight={stuck}
        />
        <Slide open={stuck} className="gap-1">
          <FollowButton viewer={viewer} size={ButtonSize.XSmall} />
          {isJoined(viewer) && (
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.XSmall}
              icon={<BellIcon />}
              aria-label="Notifications"
            />
          )}
        </Slide>
      </div>
    </>
  );
};

const StickyView = (view: View): ReactElement => (
  <Frame aside={<Widgets {...view} />}>
    <Header {...view} />
    <StickyTabs {...view} />
    <Centre {...view} />
  </Frame>
);

/* ------------------------------------------------------------- 06 toolbar */

const ToolbarView = (view: View): ReactElement => {
  const { viewer, onSelect } = view;

  return (
    <Frame aside={<Widgets {...view} />}>
      <div className="flex h-14 items-center gap-2 px-4">
        <img
          src={squad.image}
          alt=""
          className="size-7 rounded-8 object-cover"
        />
        <span className="flex items-center gap-1 font-bold text-text-primary typo-callout">
          {squad.name}
          <VerifiedMark label={false} />
        </span>
        <span className="mx-1 h-6 w-px bg-border-subtlest-tertiary" />
        <Underline
          active={view.active}
          onSelect={onSelect}
          className="min-w-0 flex-1 px-0"
          tight
        />
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
      </div>
      <div className="border-t border-border-subtlest-tertiary">
        <Centre {...view} />
      </div>
    </Frame>
  );
};

/* ---------------------------------------------------------------- 07 rail */

const RailView = (view: View): ReactElement => {
  const { viewer, active, onSelect } = view;

  return (
    <Frame
      aside={<Widgets {...view} />}
      before={
        <nav className="sticky top-4 flex h-fit w-12 shrink-0 flex-col items-center gap-1 rounded-16 border border-border-subtlest-tertiary py-2">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              title={labelOf(page)}
              onClick={() => onSelect(page.id)}
              className={classNames(
                'flex size-9 items-center justify-center rounded-10 transition-colors',
                active === page.id
                  ? 'bg-surface-float text-text-primary'
                  : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
              )}
            >
              {iconFor(page)}
            </button>
          ))}
          <span className="my-1 h-px w-5 bg-border-subtlest-tertiary" />
          {companyLinks.slice(0, 3).map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              className="flex size-9 items-center justify-center rounded-10 text-text-quaternary transition-colors hover:bg-surface-float hover:text-text-primary"
            >
              {linkIcon(link.id)}
            </a>
          ))}
          {isStaff(viewer) && (
            <>
              <span className="my-1 h-px w-5 bg-border-subtlest-tertiary" />
              <ManageButton viewer={viewer} onSelect={onSelect} align="left" />
            </>
          )}
        </nav>
      }
    >
      <SquadHeader
        viewer={viewer}
        standalone
        onOpenMembers={() => onSelect('members')}
      />
      <div className="border-t border-border-subtlest-tertiary">
        <Centre {...view} />
      </div>
    </Frame>
  );
};

/* ---------------------------------------------------------------- 08 dock */

const DockView = (view: View): ReactElement => {
  const { active, onSelect } = view;

  return (
    <Frame
      aside={<Widgets {...view} />}
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
            {pages.map((page) => (
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
      <Header {...view} />
      <div className="border-t border-border-subtlest-tertiary">
        <Centre {...view} />
      </div>
    </Frame>
  );
};

/* --------------------------------------------------------------- 09 chips */

const chips = [
  { id: 'home', label: 'All' },
  { id: 'releases', label: 'Releases' },
  { id: 'discussions', label: 'Discussions' },
  { id: 'polls', label: 'Polls' },
  { id: 'products', label: 'Products' },
];

const releaseEntries = feedEntries.filter((_, index) => index % 3 !== 2);
const discussionEntries = feedEntries.filter((_, index) => index % 3 === 2);

const ChipRow = ({ active, onSelect }: Omit<View, 'viewer'>): ReactElement => (
  <div className="flex items-center gap-1">
    {chips.map((chip) => (
      <button
        key={chip.id}
        type="button"
        onClick={() => onSelect(chip.id)}
        className={classNames(
          'rounded-[999px] px-3 py-1 typo-callout transition-colors',
          active === chip.id
            ? 'bg-text-primary font-bold text-background-default'
            : 'bg-surface-float text-text-secondary hover:text-text-primary',
        )}
      >
        {chip.label}
      </button>
    ))}
  </div>
);

const ChipsView = (view: View): ReactElement => {
  const { viewer, active, onSelect } = view;
  const row = <ChipRow active={active} onSelect={onSelect} />;
  const centre = (): ReactElement => {
    switch (active) {
      case 'releases':
        return (
          <Posts
            viewer={viewer}
            entries={releaseEntries.slice(0, 6)}
            pinned={undefined}
            toolbarChildren={row}
          />
        );
      case 'discussions':
        return (
          <Posts
            viewer={viewer}
            entries={discussionEntries.slice(0, 6)}
            pinned={undefined}
            toolbarChildren={row}
          />
        );
      case 'polls':
        return (
          <div className="flex flex-col gap-4 p-6 pb-0">
            <div className="flex items-center gap-2">{row}</div>
            <PollsPage viewer={viewer} />
          </div>
        );
      case 'products':
        return (
          <div className="flex flex-col gap-4 p-6 pb-0">
            <div className="flex items-center gap-2">{row}</div>
            <ProductsPage viewer={viewer} />
          </div>
        );
      case 'home':
        return <Posts viewer={viewer} toolbarChildren={row} />;
      default:
        return (
          <Over id={active} onBack={() => onSelect('home')}>
            <Body id={active} viewer={viewer} />
          </Over>
        );
    }
  };

  return (
    <Frame aside={<Widgets {...view} />}>
      <Header {...view} />
      <div className="border-t border-border-subtlest-tertiary">{centre()}</div>
    </Frame>
  );
};

/* ------------------------------------------------------------- 10 shelves */

const Shelf = ({
  title,
  count,
  onOpen,
  children,
}: {
  title: string;
  count?: number;
  onOpen: () => void;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="font-bold text-text-primary typo-body">{title}</span>
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.XSmall}
        icon={<ArrowIcon className="rotate-90" />}
        iconPosition={ButtonIconPosition.Right}
        onClick={onOpen}
      >
        See all{count ? ` ${count}` : ''}
      </Button>
    </div>
    {children}
  </section>
);

const latestRelease =
  feedEntries.find((entry) => entry.image === null) ?? feedEntries[0];
const poll = polls[0];

const ShelvesHome = ({ viewer, onSelect }: View): ReactElement => (
  <div className="flex flex-col gap-8 p-6">
    <SquadComposer viewer={viewer} />
    <Shelf title="Latest release" onOpen={() => onSelect('releases')}>
      <CardList entries={[latestRelease]} />
    </Shelf>
    <Shelf
      title="Products"
      count={products.length}
      onOpen={() => onSelect('products')}
    >
      <ul className="grid grid-cols-3 gap-3">
        {products.slice(0, 3).map((product) => (
          <li
            key={product.id}
            className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3"
          >
            <img
              src={product.image}
              alt=""
              className="size-9 rounded-10 object-cover"
            />
            <span className="truncate font-bold text-text-primary typo-callout">
              {product.name}
            </span>
            <span className="line-clamp-2 text-text-tertiary typo-footnote">
              {product.tagline}
            </span>
            <span className="sq-nums mt-auto flex items-center gap-0.5 text-text-quaternary typo-caption1">
              <UpvoteIcon size={IconSize.XSmall} />
              {formatCount(product.inStacks)}
            </span>
          </li>
        ))}
      </ul>
    </Shelf>
    <Shelf title="Open poll" onOpen={() => onSelect('polls')}>
      <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
        <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
          <Avatar member={poll.author} size={1.25} />
          {poll.author.name} asks
        </div>
        <span className="font-bold text-text-primary typo-body">
          {poll.question}
        </span>
        <div className="flex flex-col gap-1.5">
          {poll.options.map((option, index) => (
            <div
              key={option}
              className="relative flex items-center justify-between overflow-hidden rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 typo-footnote"
            >
              <span
                className="absolute inset-y-0 left-0 bg-accent-cabbage-flat"
                style={{ width: `${poll.split[index]}%` }}
              />
              <span className="relative text-text-primary">{option}</span>
              <span className="sq-nums relative text-text-tertiary">
                {poll.split[index]}%
              </span>
            </div>
          ))}
        </div>
        <span className="sq-nums text-text-quaternary typo-caption1">
          {poll.votes.toLocaleString()} votes
        </span>
      </div>
    </Shelf>
    <Shelf title="Latest posts" onOpen={() => onSelect('posts')}>
      <CardList entries={feedEntries.slice(0, 3)} />
    </Shelf>
  </div>
);

const ShelvesView = (view: View): ReactElement => {
  const { viewer, active, onSelect } = view;

  return (
    <Frame aside={<Widgets {...view} />}>
      <Header {...view} />
      <div className="border-t border-border-subtlest-tertiary">
        {active === 'home' ? (
          <ShelvesHome {...view} />
        ) : (
          <Over
            id={active === 'posts' ? 'home' : active}
            onBack={() => onSelect('home')}
          >
            <Body id={active === 'posts' ? 'home' : active} viewer={viewer} />
          </Over>
        )}
      </div>
    </Frame>
  );
};

/* ---------------------------------------------------------------- shell */

const viewsByNav: Record<Nav, (view: View) => ReactElement> = {
  [Nav.Tabs]: TabsView,
  [Nav.Segments]: SegmentsView,
  [Nav.Groups]: GroupsView,
  [Nav.Switcher]: SwitcherView,
  [Nav.Sticky]: StickyView,
  [Nav.Toolbar]: ToolbarView,
  [Nav.Rail]: RailView,
  [Nav.Dock]: DockView,
  [Nav.Chips]: ChipsView,
  [Nav.Shelves]: ShelvesView,
};

export const navPageIds = [
  ...pages.map((page) => page.id),
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
