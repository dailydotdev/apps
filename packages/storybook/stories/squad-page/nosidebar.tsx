import type { ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  DiscussIcon,
  OpenLinkIcon,
  PollIcon,
  SettingsIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Entry } from './data';
import {
  companyLinks,
  feedEntries,
  formatCount,
  formatDay,
  pinnedEntry,
  polls,
  products,
  squad,
} from './data';
import { CardList, isAdmin, isJoined, isStaff, linkIcon, Viewer } from './kit';
import { Composer, Kit2Styles } from './kit2';
import {
  Highlight,
  HomeFrame,
  LinksWidget,
  OverviewWidget,
  PostsArea,
  PostsToolbar,
  RulesWidget,
  SquadHeader,
  TeamWidget,
  VerifiedWidget,
  Widget,
} from './home';
import type { SquadPage } from './workspace';
import {
  AdminPlaceholder,
  ChannelPage,
  channels,
  common,
  ContentSource,
  defaultConfig,
  DocPage,
  docs,
  FeedSourcePage,
  iconFor,
  manage,
  MembersPage,
  ModerationPage,
  pageIcon,
  PollsPage,
  ProductsPage,
  Rail,
  ReleasesPage,
  RulesPage,
  WorkspaceContext,
  WorkspaceStyles,
} from './workspace';

// The same squad without the pages column. Everything the sidebar carried
// (the pages, the documents, the links, the manage entry, Join) has to live
// in the page itself: the header, the feed, or the right column. Five ways
// to seat it, each borrowed from a product that never had a sidebar.

/* ------------------------------------------------------------------ model */

export enum Layout {
  Tabs = 'tabs',
  Chips = 'chips',
  Overview = 'overview',
  Bookmarks = 'bookmarks',
  Highlights = 'highlights',
}

export interface LayoutSpec {
  id: Layout;
  title: string;
  reference: string;
  /** What carries the pages. */
  carries: string;
  /** What it costs. */
  tradeoff: string;
}

export const layouts: LayoutSpec[] = [
  {
    id: Layout.Tabs,
    title: 'Tabs',
    reference: 'X profile, GitHub organization, Reddit community',
    carries:
      'One tab row under the identity block: Posts, Releases, Products, Discussions, Polls. The header stays on every tab. Rules and FAQ live in the Rules widget, Members behind the count, Manage in the header.',
    tradeoff:
      'The safest and the closest to the profile page. It only holds as long as the row holds: past six pages the tabs start scrolling.',
  },
  {
    id: Layout.Chips,
    title: 'Chips',
    reference: 'Threads and Bluesky feed switches, Discord forum tags',
    carries:
      'There is one feed. Chips in the toolbar filter it by kind: All, Releases, Discussions, Polls. Products, Rules and FAQ become widgets with See all; a page opened from a widget slides in over the feed with a back button.',
    tradeoff:
      'Truly one page and the feed dominates. Releases lose their log shape (month groups, kind filter) unless the chip swaps the body, and a page opened from a widget is a modal in disguise.',
  },
  {
    id: Layout.Overview,
    title: 'Overview',
    reference: 'YouTube channel Home, Product Hunt product page',
    carries:
      'Home is a stack of shelves: the latest posts, the latest releases, the products, the poll of the week, each with See all. A sticky jump row under the header scrolls to a shelf; See all opens the full page with a back button.',
    tradeoff:
      'Everything visible at once, which is what you asked for, and the shelves make a fed page look alive. The feed no longer dominates on Home; it starts one click away.',
  },
  {
    id: Layout.Bookmarks,
    title: 'Bookmarks',
    reference: 'Reddit community bookmarks, the widget column of a subreddit',
    carries:
      'The center is posts and nothing else. The right column carries a Pages card (Releases, Products, Discussions, Polls, Members) above Rules, Team and Links. A page opens in the center with a back button.',
    tradeoff:
      'The pages column moved to the right and got shorter. The cleanest center, the most invisible navigation.',
  },
  {
    id: Layout.Highlights,
    title: 'Highlights',
    reference: 'Instagram highlights, Whop on mobile, Discord server tabs',
    carries:
      'A strip of round buttons under the stats: every page and every link, one glyph each, external ones marked. The center is posts until a highlight is picked; the strip stays and marks the active one.',
    tradeoff:
      'The most visual and the most mobile-ready, since the strip scrolls. Labels are short by force, and a strip of twelve glyphs asks the visitor to read icons.',
  },
];

const pages: Record<string, SquadPage> = Object.fromEntries(
  [
    common.home,
    common.releases,
    common.products,
    channels.discussions,
    channels.polls,
    docs.rules,
    docs.faq,
    common.members,
    ...manage.pages,
  ].map((page) => [page.id, page]),
);

export const pageIds = Object.keys(pages);

const contentPages = [
  common.releases,
  common.products,
  channels.discussions,
  channels.polls,
];

interface View {
  viewer: Viewer;
  active: string;
  onSelect: (id: string) => void;
}

/* --------------------------------------------------------------- pieces */

const PageContent = ({
  id,
  viewer,
}: {
  id: string;
  viewer: Viewer;
}): ReactElement => {
  switch (id) {
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
    default:
      return <AdminPlaceholder page={pages[id]} />;
  }
};

const Posts = ({
  viewer,
  entries = feedEntries.slice(0, 6),
  pinned = pinnedEntry,
  toolbarChildren,
}: {
  viewer: Viewer;
  entries?: Entry[];
  pinned?: Entry;
  toolbarChildren?: ReactNode;
}): ReactElement => (
  <PostsArea
    sort="Latest"
    entries={entries}
    pinned={pinned}
    composer={isJoined(viewer) && <Composer />}
    toolbarChildren={toolbarChildren}
  />
);

/** The way back to the feed when a page opened over it. */
const BackBar = ({
  page,
  onBack,
  label = 'Back to posts',
}: {
  page: SquadPage;
  onBack: () => void;
  label?: string;
}): ReactElement => (
  <div className="flex h-12 items-center gap-2 border-b border-border-subtlest-tertiary px-4">
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      icon={<ArrowIcon className="-rotate-90" />}
      aria-label={label}
      onClick={onBack}
    />
    <span className="text-text-tertiary">{iconFor(page)}</span>
    <span className="font-bold text-text-primary typo-callout">
      {page.label}
    </span>
  </div>
);

/** The sidebar's Manage section, as a menu on the header. */
const ManageMenu = ({
  viewer,
  onSelect,
}: {
  viewer: Viewer;
  onSelect: (id: string) => void;
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
        onClick={() => setOpen((value) => !value)}
      >
        Manage
      </Button>
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

const Header = ({ viewer, onSelect }: View): ReactElement => (
  <SquadHeader
    viewer={viewer}
    standalone
    onOpenMembers={() => onSelect('members')}
    extra={<ManageMenu viewer={viewer} onSelect={onSelect} />}
  />
);

const rulesWidget = (onSelect: (id: string) => void): ReactElement => (
  <RulesWidget
    onOpenRules={() => onSelect('rules')}
    onOpenFaq={() => onSelect('faq')}
  />
);

const SeeAll = ({
  count,
  onClick,
}: {
  count?: number;
  onClick: () => void;
}): ReactElement => (
  <Button
    variant={ButtonVariant.Float}
    size={ButtonSize.XSmall}
    icon={<ArrowIcon className="rotate-90" />}
    iconPosition={ButtonIconPosition.Right}
    onClick={onClick}
  >
    See all{count ? ` ${count}` : ''}
  </Button>
);

const ProductRow = ({
  product,
  wide = false,
}: {
  product: (typeof products)[number];
  wide?: boolean;
}): ReactElement => (
  <div className="flex items-center gap-3">
    <img
      src={product.image}
      alt=""
      className={classNames(
        'shrink-0 rounded-10 object-cover',
        wide ? 'size-10' : 'size-8',
      )}
    />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold text-text-primary typo-callout">
        {product.name}
      </span>
      <span className="truncate text-text-tertiary typo-footnote">
        {product.tagline}
      </span>
    </div>
    <span className="sq-nums flex shrink-0 items-center gap-0.5 text-text-tertiary typo-caption1">
      <UpvoteIcon size={IconSize.XSmall} />
      {formatCount(product.inStacks)}
    </span>
  </div>
);

const ProductsWidget = ({ onOpen }: { onOpen: () => void }): ReactElement => (
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
        <li key={product.id}>
          <ProductRow product={product} />
        </li>
      ))}
    </ul>
  </Widget>
);

/* ----------------------------------------------------------------- tabs */

const tabs = [common.home, ...contentPages];

const TabRow = ({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}): ReactElement => (
  <div className="flex items-center border-t border-border-subtlest-tertiary px-3">
    {tabs.map((tab) => {
      const isActive = active === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={classNames(
            'relative flex items-center gap-1.5 px-3 py-3 typo-callout transition-colors',
            isActive
              ? 'font-bold text-text-primary'
              : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          {tab.id === 'home' ? 'Posts' : tab.label}
          {tab.badge && !isActive && (
            <span className="size-1.5 rounded-[999px] bg-accent-cabbage-default" />
          )}
          {isActive && (
            <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-2 bg-accent-cabbage-default" />
          )}
        </button>
      );
    })}
  </div>
);

const TabsView = (view: View): ReactElement => {
  const { viewer, active, onSelect } = view;
  const isTab = tabs.some((tab) => tab.id === active);

  return (
    <HomeFrame
      header={<Header {...view} />}
      widgets={
        <>
          <VerifiedWidget />
          {rulesWidget(onSelect)}
          <TeamWidget />
          <OverviewWidget />
          <LinksWidget />
        </>
      }
    >
      <TabRow active={active} onSelect={onSelect} />
      {active === 'home' ? (
        <Posts viewer={viewer} />
      ) : (
        <>
          {!isTab && (
            <BackBar page={pages[active]} onBack={() => onSelect('home')} />
          )}
          <PageContent id={active} viewer={viewer} />
        </>
      )}
    </HomeFrame>
  );
};

/* ---------------------------------------------------------------- chips */

const chips = [
  { id: 'all', label: 'All' },
  { id: 'releases', label: 'Releases' },
  { id: 'discussions', label: 'Discussions' },
  { id: 'polls', label: 'Polls' },
];

/* Illustrative split of the one feed into its kinds. */
const releaseEntries = feedEntries.filter((_, index) => index % 3 !== 2);
const discussionEntries = feedEntries.filter((_, index) => index % 3 === 2);

const ChipRow = ({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}): ReactElement => (
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
  const [chip, setChip] = useState('all');
  const row = <ChipRow active={chip} onSelect={setChip} />;

  const feed = (): ReactElement => {
    switch (chip) {
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
            entries={discussionEntries}
            pinned={undefined}
            toolbarChildren={row}
          />
        );
      case 'polls':
        return (
          <>
            <div className="flex flex-col gap-4 px-6 pt-6">
              {isJoined(viewer) && <Composer />}
              <PostsToolbar sort="Latest">{row}</PostsToolbar>
            </div>
            <PollsPage viewer={viewer} />
          </>
        );
      default:
        return <Posts viewer={viewer} toolbarChildren={row} />;
    }
  };

  return (
    <HomeFrame
      header={<Header {...view} />}
      widgets={
        <>
          <VerifiedWidget />
          <ProductsWidget onOpen={() => onSelect('products')} />
          {rulesWidget(onSelect)}
          <TeamWidget />
          <LinksWidget />
        </>
      }
    >
      <div className="border-t border-border-subtlest-tertiary">
        {active === 'home' ? (
          feed()
        ) : (
          <>
            <BackBar page={pages[active]} onBack={() => onSelect('home')} />
            <PageContent id={active} viewer={viewer} />
          </>
        )}
      </div>
    </HomeFrame>
  );
};

/* ------------------------------------------------------------- overview */

const shelves = [
  { id: 'posts', label: 'Posts' },
  { id: 'releases', label: 'Releases' },
  { id: 'products', label: 'Products' },
  { id: 'polls', label: 'Polls' },
];

const Shelf = ({
  title,
  count,
  onOpen,
  children,
  anchor,
}: {
  title: string;
  count?: number;
  onOpen: () => void;
  children: ReactNode;
  anchor: (node: HTMLElement | null) => void;
}): ReactElement => (
  <section ref={anchor} className="flex scroll-mt-14 flex-col gap-3 px-6 py-5">
    <div className="flex items-center justify-between">
      <span className="font-bold text-text-primary typo-body">{title}</span>
      <SeeAll count={count} onClick={onOpen} />
    </div>
    {children}
  </section>
);

const releaseKind = (index: number): string =>
  ['Feature', 'Fix', 'Beta'][index % 3];

const PollPreview = ({
  poll,
}: {
  poll: (typeof polls)[number];
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
      <PollIcon size={IconSize.XSmall} />
      Poll by {poll.author.name}
      <span className="sq-nums ml-auto">{formatCount(poll.votes)} votes</span>
    </div>
    <span className="font-bold text-text-primary typo-callout">
      {poll.question}
    </span>
    <ul className="flex flex-col gap-1.5">
      {poll.options.map((option, index) => (
        <li
          key={option}
          className="relative flex items-center justify-between overflow-hidden rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 typo-footnote"
        >
          <span
            className="absolute inset-y-0 left-0 bg-action-share-default opacity-40"
            style={{ width: `${poll.split[index]}%` }}
          />
          <span className="relative text-text-primary">{option}</span>
          <span className="sq-nums relative text-text-secondary">
            {poll.split[index]}%
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const OverviewView = (view: View): ReactElement => {
  const { viewer, active, onSelect } = view;
  const anchors = useRef<Record<string, HTMLElement | null>>({});
  const [current, setCurrent] = useState('posts');
  const jump = (id: string) => {
    setCurrent(id);
    anchors.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const anchor = (id: string) => (node: HTMLElement | null) => {
    anchors.current[id] = node;
  };

  return (
    <HomeFrame
      header={<Header {...view} />}
      widgets={
        <>
          <VerifiedWidget />
          {rulesWidget(onSelect)}
          <TeamWidget />
          <OverviewWidget />
          <LinksWidget />
        </>
      }
    >
      {active === 'home' ? (
        <>
          <div className="sticky top-0 z-3 flex items-center gap-1 border-y border-border-subtlest-tertiary bg-background-default px-4 py-2">
            {shelves.map((shelf) => (
              <button
                key={shelf.id}
                type="button"
                onClick={() => jump(shelf.id)}
                className={classNames(
                  'rounded-[999px] px-3 py-1 typo-callout transition-colors',
                  current === shelf.id
                    ? 'bg-surface-float font-bold text-text-primary'
                    : 'text-text-tertiary hover:text-text-primary',
                )}
              >
                {shelf.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
            <Shelf
              anchor={anchor('posts')}
              title="Latest posts"
              onOpen={() => onSelect('posts')}
            >
              {isJoined(viewer) && <Composer />}
              <Highlight entry={pinnedEntry} />
              <CardList entries={feedEntries.slice(0, 3)} />
            </Shelf>
            <Shelf
              anchor={anchor('releases')}
              title="Releases"
              count={feedEntries.length}
              onOpen={() => onSelect('releases')}
            >
              <ul className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary px-4">
                {feedEntries.slice(0, 4).map((entry, index) => (
                  <li key={entry.id} className="flex items-center gap-3 py-2.5">
                    <span className="sq-nums w-16 shrink-0 text-text-quaternary typo-caption1">
                      {formatDay(entry.createdAt)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
                      {entry.title}
                    </span>
                    <span className="shrink-0 rounded-6 bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption2">
                      {releaseKind(index)}
                    </span>
                  </li>
                ))}
              </ul>
            </Shelf>
            <Shelf
              anchor={anchor('products')}
              title="Products"
              count={products.length}
              onOpen={() => onSelect('products')}
            >
              <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                {products.slice(0, 4).map((product) => (
                  <li key={product.id}>
                    <ProductRow product={product} wide />
                  </li>
                ))}
              </ul>
            </Shelf>
            <Shelf
              anchor={anchor('polls')}
              title="Poll of the week"
              count={polls.length}
              onOpen={() => onSelect('polls')}
            >
              <PollPreview poll={polls[0]} />
            </Shelf>
          </div>
        </>
      ) : (
        <>
          <BackBar
            page={
              active === 'posts'
                ? { ...common.home, label: 'Posts' }
                : pages[active]
            }
            onBack={() => onSelect('home')}
            label="Back to overview"
          />
          {active === 'posts' ? (
            <Posts viewer={viewer} />
          ) : (
            <PageContent id={active} viewer={viewer} />
          )}
        </>
      )}
    </HomeFrame>
  );
};

/* ------------------------------------------------------------ bookmarks */

const counts: Record<string, string> = {
  releases: String(feedEntries.length),
  products: String(products.length),
  polls: String(polls.length),
  members: formatCount(squad.membersCount),
};

const PagesWidget = ({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}): ReactElement => (
  <Widget title="Pages">
    <ul className="mt-3 flex flex-col">
      {[...contentPages, common.members].map((page) => (
        <li key={page.id}>
          <button
            type="button"
            onClick={() => onSelect(page.id)}
            className={classNames(
              'flex w-full items-center gap-2.5 rounded-10 px-2 py-2 text-left typo-callout transition-colors hover:bg-surface-float',
              active === page.id
                ? 'bg-surface-float font-bold text-text-primary'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <span className="text-text-tertiary">{iconFor(page)}</span>
            <span className="min-w-0 flex-1 truncate">{page.label}</span>
            {page.badge && (
              <span className="size-1.5 rounded-[999px] bg-accent-cabbage-default" />
            )}
            <span className="sq-nums text-text-quaternary typo-caption1">
              {counts[page.id]}
            </span>
          </button>
        </li>
      ))}
    </ul>
  </Widget>
);

const BookmarksView = (view: View): ReactElement => {
  const { viewer, active, onSelect } = view;

  return (
    <HomeFrame
      header={<Header {...view} />}
      widgets={
        <>
          <VerifiedWidget />
          <PagesWidget active={active} onSelect={onSelect} />
          {rulesWidget(onSelect)}
          <TeamWidget />
          <LinksWidget />
        </>
      }
    >
      <div className="border-t border-border-subtlest-tertiary">
        {active === 'home' ? (
          <Posts viewer={viewer} />
        ) : (
          <>
            <BackBar page={pages[active]} onBack={() => onSelect('home')} />
            <PageContent id={active} viewer={viewer} />
          </>
        )}
      </div>
    </HomeFrame>
  );
};

/* ----------------------------------------------------------- highlights */

const bigIcon = (page: SquadPage): ReactElement =>
  ({
    discussions: <DiscussIcon size={IconSize.Medium} />,
    polls: <PollIcon size={IconSize.Medium} />,
  }[page.id] ?? pageIcon(page.type, IconSize.Medium));

const HighlightButton = ({
  label,
  icon,
  active = false,
  external = false,
  href,
  onClick,
}: {
  label: string;
  icon: ReactElement;
  active?: boolean;
  external?: boolean;
  href?: string;
  onClick?: () => void;
}): ReactElement => {
  const className = 'flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5';
  const body = (
    <>
      <span
        className={classNames(
          'relative flex size-12 items-center justify-center rounded-[999px] border transition-colors',
          active
            ? 'border-accent-cabbage-default bg-surface-float text-accent-cabbage-default'
            : 'border-border-subtlest-tertiary bg-surface-float text-text-secondary group-hover:border-border-subtlest-secondary group-hover:text-text-primary',
        )}
      >
        {icon}
        {external && (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-[999px] bg-background-default text-text-quaternary">
            <OpenLinkIcon size={IconSize.XXSmall} />
          </span>
        )}
      </span>
      <span
        className={classNames(
          'max-w-full truncate typo-caption1',
          active ? 'font-bold text-text-primary' : 'text-text-tertiary',
        )}
      >
        {label}
      </span>
    </>
  );

  return href ? (
    <a href={href} className={classNames(className, 'group')}>
      {body}
    </a>
  ) : (
    <button
      type="button"
      onClick={onClick}
      className={classNames(className, 'group')}
    >
      {body}
    </button>
  );
};

const HighlightStrip = ({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}): ReactElement => (
  <div className="ws-scroll flex items-start gap-1 overflow-x-auto border-t border-border-subtlest-tertiary px-4 py-3">
    {[...contentPages, docs.rules, docs.faq].map((page) => (
      <HighlightButton
        key={page.id}
        label={page.label}
        icon={bigIcon(page)}
        active={active === page.id}
        onClick={() => onSelect(active === page.id ? 'home' : page.id)}
      />
    ))}
    <span className="mx-1 h-12 w-px shrink-0 self-start bg-border-subtlest-tertiary" />
    {companyLinks.map((item) => (
      <HighlightButton
        key={item.id}
        label={item.label}
        icon={linkIcon(item.id, IconSize.Medium)}
        href={item.href}
        external
      />
    ))}
  </div>
);

const HighlightsView = (view: View): ReactElement => {
  const { viewer, active, onSelect } = view;

  return (
    <HomeFrame
      header={<Header {...view} />}
      widgets={
        <>
          <VerifiedWidget />
          <TeamWidget />
          <OverviewWidget />
        </>
      }
    >
      <HighlightStrip active={active} onSelect={onSelect} />
      <div className="border-t border-border-subtlest-tertiary">
        {active === 'home' ? (
          <Posts viewer={viewer} />
        ) : (
          <>
            {!contentPages.some((page) => page.id === active) &&
              active !== 'rules' &&
              active !== 'faq' && (
                <BackBar page={pages[active]} onBack={() => onSelect('home')} />
              )}
            <PageContent id={active} viewer={viewer} />
          </>
        )}
      </div>
    </HomeFrame>
  );
};

/* ---------------------------------------------------------------- shell */

const views: Record<Layout, (view: View) => ReactElement> = {
  [Layout.Tabs]: TabsView,
  [Layout.Chips]: ChipsView,
  [Layout.Overview]: OverviewView,
  [Layout.Bookmarks]: BookmarksView,
  [Layout.Highlights]: HighlightsView,
};

export const NoSidebarShell = ({
  layout,
  viewer = Viewer.Visitor,
  initialPage = 'home',
  height = 48,
  width = 1440,
}: {
  layout: Layout;
  viewer?: Viewer;
  initialPage?: string;
  /** rem */
  height?: number;
  width?: number;
}): ReactElement => {
  const [active, setActive] = useState(initialPage);
  const View = views[layout];

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
