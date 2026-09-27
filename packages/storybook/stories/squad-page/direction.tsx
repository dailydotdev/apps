import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  EyeIcon,
  MiniCloseIcon,
  MoveToIcon,
  PlusIcon,
  SearchIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import { feedEntries, pinnedEntry, polls, products, squad } from './data';
import { CardList, isAdmin, isJoined, isStaff, Viewer } from './kit';
import { Kit2Styles } from './kit2';
import { MobileFooterNav, TabletSidebar } from './rail';
import type { SquadConfig } from './state';
import { useWorkspace } from './state';
import { PreviewModeToggle, SharePageWidget } from './owner';
import type { ManageSection } from './manage';
import { manageSectionIds, ManageView } from './manage';
import { AddProductPage, SaveProductButton } from './productForm';
import { PinnedArea, PinStyle, feedUnder } from './pins';
import { SquadComposer, SquadHeader, SquadWidgets } from './home';
import {
  AnalyticsPage,
  InvitePage,
  NotFoundPage,
  PendingPostsPage,
  PrivateWall,
  ColumnFitContext,
  ContentSource,
  defaultConfig,
  docs,
  DocPage,
  FeedPoll,
  FeedSourcePage,
  manage,
  MembersPage,
  ModerationPage,
  ProductsPage,
  Rail,
  RulesPage,
  SettingsPage,
  WorkspaceContext,
  WorkspaceStyles,
} from './workspace';

// The profile header and the profile's right column, for a squad. Home is
// the products shelf and one feed under a heading with search; anything
// that is not the feed (Rules, FAQ, Members, Products, the team's pages)
// replaces the centre card under a back button and the page title.

/* -------------------------------------------------------------- products */

const ProductsShelf = ({ onOpen }: { onOpen: () => void }): ReactElement => (
  <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary px-4 py-4 tablet:px-6">
    <div className="flex items-center justify-between">
      <span className="font-bold text-text-primary typo-callout">Products</span>
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.XSmall}
        icon={<ArrowIcon size={IconSize.Size16} className="rotate-90" />}
        iconPosition={ButtonIconPosition.Right}
        onClick={onOpen}
      >
        See all {products.length}
      </Button>
    </div>
    <ul
      className="-mx-4 flex gap-3 overflow-x-auto px-4 tablet:-mx-6 tablet:px-6"
      style={{ scrollbarWidth: 'none' }}
    >
      {products.map((product) => (
        <li
          key={product.id}
          className="flex w-56 shrink-0 items-start gap-3 rounded-16 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-secondary"
        >
          <img
            src={product.image}
            alt=""
            className="size-10 shrink-0 rounded-12 object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {product.name}
            </span>
            <span className="line-clamp-2 text-text-tertiary typo-footnote">
              {product.tagline}
            </span>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

/* ------------------------------------------------------------------ feed */

type FeedView = 'feed' | 'about';

/**
 * The row above the feed: the title, About below laptop (the right
 * column's widgets, which sit beside the page from laptop up) and
 * production's search. Searching turns the row into the field, so nothing
 * below it moves; Escape or close puts the row back.
 */
const FeedHeading = ({
  view,
  onView,
  query,
  onQuery,
}: {
  view: FeedView;
  onView: (view: FeedView) => void;
  query: string | null;
  onQuery: (query: string | null) => void;
}): ReactElement => {
  if (query !== null) {
    return (
      <div className="flex items-center gap-2 px-4 tablet:px-0">
        <SearchField
          inputId="squad-posts-search"
          className="flex-1"
          fieldSize="medium"
          placeholder={`Search ${squad.name} posts`}
          aria-label={`Search ${squad.name} posts`}
          autoFocus
          value={query}
          valueChanged={(value) => onQuery(value)}
          onKeyDown={(event) => event.key === 'Escape' && onQuery(null)}
        />
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MiniCloseIcon />}
          aria-label="Close search"
          onClick={() => onQuery(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 tablet:px-0">
      <span className="min-w-0 flex-1 font-bold text-text-primary typo-body">
        {view === 'about' ? `About ${squad.name}` : 'Posts'}
      </span>
      <span className="flex laptop:hidden">
        <Button
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          aria-pressed={view === 'about'}
          onClick={() => onView(view === 'about' ? 'feed' : 'about')}
        >
          {view === 'about' ? 'Posts' : 'About'}
        </Button>
      </span>
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        icon={<SearchIcon />}
        aria-label="Search posts"
        title="Search posts"
        onClick={() => {
          onView('feed');
          onQuery('');
        }}
      />
    </div>
  );
};

const searchable = [pinnedEntry, ...feedEntries];

const SearchResults = ({ query }: { query: string }): ReactElement => {
  const needle = query.trim().toLowerCase();
  const matches = searchable.filter((entry) =>
    [entry.title, entry.summary, ...entry.tags]
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );

  if (!matches.length) {
    return (
      <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
        <span className="font-bold text-text-primary typo-callout">
          No posts match “{query.trim()}”
        </span>
        <span className="text-text-tertiary typo-footnote">
          Try a product name, a tag, or fewer words.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="px-4 text-text-tertiary typo-footnote tablet:px-0">
        {matches.length} {matches.length === 1 ? 'post' : 'posts'} in{' '}
        {squad.name} match “{query.trim()}”
      </span>
      <CardList
        entries={matches.map((entry) => ({ ...entry, pinned: false }))}
      />
    </div>
  );
};

const Feed = ({
  viewer,
  pinStyle,
  onSelect,
  initialView = 'feed',
}: {
  viewer: Viewer;
  pinStyle: PinStyle;
  onSelect: (id: string) => void;
  initialView?: FeedView;
}): ReactElement => {
  const { empty } = useWorkspace();
  const [view, setView] = useState<FeedView>(initialView);
  const [query, setQuery] = useState<string | null>(null);
  const entries = feedUnder(pinStyle).slice(0, 6);

  let body: ReactElement;
  if (query !== null && query.trim()) {
    body = <SearchResults query={query} />;
  } else if (view === 'about') {
    body = (
      <div className="flex flex-col gap-4 px-4 tablet:px-0 laptop:hidden">
        <SquadWidgets
          viewer={viewer}
          onOpenRules={() => onSelect('rules')}
          onOpenFaq={() => onSelect('faq')}
          onOpenAnalytics={() => onSelect('analytics')}
        />
      </div>
    );
  } else if (empty) {
    body = (
      <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
        <span className="font-bold text-text-primary typo-callout">
          Nothing posted yet
        </span>
        <span className="max-w-[44ch] text-text-tertiary typo-footnote">
          {isStaff(viewer)
            ? 'Connect the content feed or write the first post. Members see the rules, the team and the links until then.'
            : 'The team has not posted yet. Join to hear when they do.'}
        </span>
      </div>
    );
  } else {
    body = (
      <>
        <div className="px-4 tablet:px-0">
          <PinnedArea style={pinStyle} />
        </div>
        <div className="flex flex-col gap-3">
          <CardList entries={entries.slice(0, 2)} />
          <FeedPoll viewer={viewer} poll={polls[0]} />
          <CardList entries={entries.slice(2)} />
        </div>
        <div className="px-4 tablet:px-0">
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Medium}
            className="w-full"
          >
            Load more
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4 tablet:p-6">
      <SquadComposer viewer={viewer} />
      <FeedHeading
        view={view}
        onView={setView}
        query={query}
        onQuery={setQuery}
      />
      {body}
    </div>
  );
};

/* -------------------------------------------------------------- sub-page */

const titles: Record<string, string> = {
  rules: 'Rules',
  faq: 'FAQ',
  members: 'Members',
  products: 'Products',
  'add-product': 'Add product',
  moderation: 'Moderation',
  feed: 'Content feed',
  analytics: 'Analytics',
  settings: 'Settings',
  pending: 'Pending posts',
};

/**
 * The sub-page header, the way a profile's Add experience page does it:
 * back, the page's title, and the page's one action on the right.
 */
const SubHeader = ({
  id,
  onBack,
  action,
}: {
  id: string;
  onBack: () => void;
  action?: ReactNode;
}): ReactElement => (
  <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-3">
    <Button
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<MoveToIcon className="rotate-180" />}
      aria-label="Back"
      title="Back"
      onClick={onBack}
    />
    <h1 className="min-w-0 flex-1 truncate font-bold text-text-primary typo-body">
      {titles[id] ?? id}
    </h1>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

const SubPage = ({
  id,
  viewer,
}: {
  id: string;
  viewer: Viewer;
}): ReactElement => {
  switch (id) {
    case 'rules':
      return <RulesPage />;
    case 'faq':
      return <DocPage page={docs.faq} />;
    case 'members':
      return <MembersPage viewer={viewer} />;
    case 'products':
      return <ProductsPage viewer={viewer} />;
    case 'add-product':
      return <AddProductPage />;
    case 'pending':
      return <PendingPostsPage />;
    case 'moderation':
      return <ModerationPage />;
    case 'feed':
      return <FeedSourcePage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <RulesPage />;
  }
};

/* ------------------------------------------------------------------ page */

const Frame = ({
  children,
  aside,
  notice,
}: {
  children: ReactNode;
  aside?: ReactNode;
  /** Above the page card, outside it: the preview strip. */
  notice?: ReactNode;
}): ReactElement => (
  <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
    <main className="flex min-w-0 flex-1 flex-col">
      {notice}
      <div className="border-border-subtlest-tertiary laptop:rounded-16 laptop:border">
        {children}
      </div>
    </main>
    {aside && (
      <aside className="hidden w-80 shrink-0 flex-col gap-4 laptop:flex">
        {aside}
      </aside>
    )}
  </div>
);

const PreviewNotice = ({
  onExit,
  asAdmin,
}: {
  onExit: () => void;
  asAdmin: boolean;
}): ReactElement => (
  <div className="flex items-center gap-3 bg-surface-float px-4 py-2.5 laptop:mb-3 laptop:rounded-16">
    <EyeIcon
      size={IconSize.Small}
      secondary
      className="shrink-0 text-text-tertiary"
    />
    <span className="min-w-0 flex-1 text-text-secondary typo-footnote">
      <b className="text-text-primary">
        You&apos;re viewing the page as a visitor.
      </b>{' '}
      Team tools are hidden.
    </span>
    <Button
      variant={ButtonVariant.Subtle}
      size={ButtonSize.XSmall}
      onClick={onExit}
    >
      {asAdmin ? 'Back to admin view' : 'Back to your view'}
    </Button>
  </div>
);

export const DirectionPage = ({
  viewer: realViewer,
  active,
  onSelect,
  pinStyle = PinStyle.Reddit,
  initialView,
}: {
  viewer: Viewer;
  active: string;
  onSelect: (id: string) => void;
  pinStyle?: PinStyle;
  initialView?: FeedView;
}): ReactElement => {
  const { empty, isPrivate } = useWorkspace();
  const [previewing, setPreviewing] = useState(false);
  const runsPage = isStaff(realViewer);
  // Preview renders the page for a logged-in visitor who has not joined:
  // the public page, without any of the team's controls.
  const viewer = previewing && runsPage ? Viewer.Visitor : realViewer;
  // Production gates a private squad behind its Unauthorized copy; the
  // identity, rules and team stay readable so the door explains itself.
  const walled = isPrivate && !isJoined(viewer);

  if (active.startsWith('manage') && isStaff(viewer)) {
    const section = active.startsWith('manage-')
      ? active.slice('manage-'.length)
      : undefined;
    return (
      <ManageView
        key={active}
        viewer={viewer}
        initialSection={section as ManageSection | undefined}
        onExit={() => onSelect('home')}
      />
    );
  }

  if (active === 'invite' || active === 'not-found') {
    return (
      <Frame>
        <ColumnFitContext.Provider value>
          {active === 'invite' ? (
            <InvitePage viewer={viewer} />
          ) : (
            <NotFoundPage />
          )}
        </ColumnFitContext.Provider>
      </Frame>
    );
  }

  return (
    <Frame
      notice={
        previewing ? (
          <PreviewNotice
            onExit={() => setPreviewing(false)}
            asAdmin={isAdmin(realViewer)}
          />
        ) : undefined
      }
      aside={
        <>
          {runsPage && (
            <PreviewModeToggle
              checked={previewing}
              onToggle={() => setPreviewing((value) => !value)}
            />
          )}
          <SquadWidgets
            afterVerified={runsPage && !previewing && <SharePageWidget />}
            viewer={viewer}
            onOpenRules={() => onSelect('rules')}
            onOpenFaq={() => onSelect('faq')}
            onOpenAnalytics={() => onSelect('analytics')}
          />
        </>
      }
    >
      {active === 'home' ? (
        <>
          <SquadHeader
            viewer={viewer}
            standalone
            onOpenMembers={() => onSelect('members')}
            onManage={onSelect}
          />
          {walled ? (
            <div className="border-t border-border-subtlest-tertiary">
              <ColumnFitContext.Provider value>
                <PrivateWall viewer={viewer} />
              </ColumnFitContext.Provider>
            </div>
          ) : (
            <>
              {!empty && <ProductsShelf onOpen={() => onSelect('products')} />}
              <div className="border-t border-border-subtlest-tertiary">
                <Feed
                  key={viewer}
                  viewer={viewer}
                  pinStyle={pinStyle}
                  onSelect={onSelect}
                  initialView={initialView}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <SubHeader
            id={active}
            onBack={() =>
              onSelect(active === 'add-product' ? 'products' : 'home')
            }
            action={
              (active === 'products' && isAdmin(viewer) && (
                <Button
                  variant={ButtonVariant.Subtle}
                  size={ButtonSize.Small}
                  icon={<PlusIcon />}
                  onClick={() => onSelect('add-product')}
                >
                  Add product
                </Button>
              )) ||
              (active === 'add-product' && (
                <SaveProductButton onSave={() => onSelect('products')} />
              )) ||
              undefined
            }
          />
          <ColumnFitContext.Provider value>
            {walled ? (
              <PrivateWall viewer={viewer} />
            ) : (
              <SubPage id={active} viewer={viewer} />
            )}
          </ColumnFitContext.Provider>
        </>
      )}
    </Frame>
  );
};

/** The team's pages live in the Manage area; Settings opens its Details. */
const toManage: Record<string, string> = {
  moderation: 'manage-moderation',
  feed: 'manage-feed',
  analytics: 'manage-analytics',
  settings: 'manage-details',
};

export const directionPageIds = [
  'home',
  'about',
  'add-product',
  'rules',
  'faq',
  'members',
  'products',
  ...manage.pages.map((page) => page.id),
  'pending',
  'invite',
  'not-found',
  'manage',
  ...manageSectionIds.map((id) => `manage-${id}`),
];

export const DirectionShell = ({
  viewer = Viewer.Visitor,
  initialPage = 'home',
  height = 48,
  width = 1440,
  pinStyle,
  fluid = false,
  source = ContentSource.Feed,
  empty = false,
  isPrivate = false,
  config,
}: {
  viewer?: Viewer;
  /** A page id, or about for the right column's widgets below laptop. */
  initialPage?: string;
  /** rem */
  height?: number;
  width?: number;
  pinStyle?: PinStyle;
  source?: ContentSource;
  empty?: boolean;
  isPrivate?: boolean;
  config?: Partial<SquadConfig>;
  /**
   * Fill the viewport and let its breakpoints decide the layout, the way
   * the app does: the classic sidebar from laptop, the tablet column from
   * 656px, the floating tab bar on phones.
   */
  fluid?: boolean;
}): ReactElement => {
  const aboutPage = initialPage === 'about';
  const [active, setPage] = useState(
    aboutPage ? 'home' : toManage[initialPage] ?? initialPage,
  );
  const setActive = (id: string) => setPage(toManage[id] ?? id);
  const loggedIn = viewer !== Viewer.Anonymous;
  const page = (
    <main className="ws-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
      <DirectionPage
        viewer={viewer}
        active={active}
        onSelect={setActive}
        pinStyle={pinStyle}
        initialView={aboutPage ? 'about' : undefined}
      />
    </main>
  );

  return (
    <WorkspaceContext.Provider
      value={{
        viewer,
        source,
        empty,
        isPrivate,
        config: { ...defaultConfig, ...config },
      }}
    >
      <WorkspaceStyles />
      <Kit2Styles />
      {fluid ? (
        <div className="flex h-dvh w-full flex-col bg-background-default text-text-primary tablet:flex-row">
          <div className="hidden laptop:flex">
            <Rail loggedIn={loggedIn} />
          </div>
          <div className="hidden tablet:flex laptop:hidden">
            <TabletSidebar />
          </div>
          {page}
          <div className="tablet:hidden">
            <MobileFooterNav />
          </div>
        </div>
      ) : (
        <div
          style={{ width, maxWidth: '100%', height: `${height}rem` }}
          className="sq-elevated flex overflow-hidden rounded-16 bg-background-default text-text-primary"
        >
          <Rail loggedIn={loggedIn} />
          {page}
        </div>
      )}
    </WorkspaceContext.Provider>
  );
};
