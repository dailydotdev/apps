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

/* ------------------------------------------------------------- furniture */

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
      <Button variant={ButtonVariant.Subtle} size={size}>
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

/** The profile header; the team's pages open from its options menu. */
const Header = ({ viewer, onSelect }: View): ReactElement => (
  <SquadHeader
    viewer={viewer}
    standalone
    onOpenMembers={() => onSelect('members')}
    onManage={onSelect}
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

/* ---------------------------------------------------------------- 01 tabs */

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
        variant={ButtonVariant.Subtle}
        size={ButtonSize.XSmall}
        icon={<ArrowIcon size={IconSize.Size16} className="rotate-90" />}
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
