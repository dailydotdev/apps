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
  UpvoteIcon,
  SearchIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { feedEntries, formatCount, pinnedEntry, products, squad } from './data';
import { CardList, VerifiedMark, Viewer } from './kit';
import { Kit2Styles } from './kit2';
import { Highlight, SquadComposer, SquadHeader, SquadWidgets } from './home';
import { FollowButton, ManageButton } from './navigation';
import {
  AnalyticsPage,
  ContentSource,
  defaultConfig,
  docs,
  DocPage,
  FeedSourcePage,
  manage,
  MembersPage,
  ModerationPage,
  PollsPage,
  ProductsPage,
  Rail,
  ReleasesPage,
  RulesPage,
  SettingsPage,
  WorkspaceContext,
  WorkspaceStyles,
} from './workspace';

// The direction after the navigation round: the profile header and the
// profile's right column stay; Home is the feed with kind chips on its
// toolbar and the products as a shelf between the header and the feed;
// anything that is not the feed (Rules, FAQ, Followers, Products, the
// team's pages) replaces the whole centre card with a page under a compact
// header, the way LinkedIn's company sub-pages do: back, the logo and
// name, the page.

/* -------------------------------------------------------------- products */

const ProductsShelf = ({ onOpen }: { onOpen: () => void }): ReactElement => (
  <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary px-6 py-4">
    <div className="flex items-center justify-between">
      <span className="font-bold text-text-primary typo-callout">Products</span>
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.XSmall}
        icon={<ArrowIcon className="rotate-90" />}
        iconPosition={ButtonIconPosition.Right}
        onClick={onOpen}
      >
        See all {products.length}
      </Button>
    </div>
    <ul
      className="-mx-6 flex gap-3 overflow-x-auto px-6"
      style={{ scrollbarWidth: 'none' }}
    >
      {products.map((product) => (
        <li
          key={product.id}
          className="flex w-56 shrink-0 items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-secondary"
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
            <span className="truncate text-text-tertiary typo-footnote">
              {product.tagline}
            </span>
            <span className="sq-nums mt-0.5 flex items-center gap-0.5 text-text-quaternary typo-caption1">
              <UpvoteIcon size={IconSize.XSmall} />
              {formatCount(product.inStacks)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

/* ----------------------------------------------------------------- chips */

const chips = [
  { id: 'all', label: 'All' },
  { id: 'releases', label: 'Releases' },
  { id: 'discussions', label: 'Discussions' },
  { id: 'polls', label: 'Polls' },
];

const discussionEntries = feedEntries.filter((_, index) => index % 3 === 2);

/**
 * One row: the kinds on the left as chips, the sort and search on the
 * right as quiet text. The active chip and the sort share one weight so
 * the row reads as a single control.
 */
const FeedToolbar = ({
  chip,
  onChip,
}: {
  chip: string;
  onChip: (id: string) => void;
}): ReactElement => (
  <div className="flex items-center gap-1">
    {chips.map((item) => (
      <button
        key={item.id}
        type="button"
        onClick={() => onChip(item.id)}
        className={classNames(
          'rounded-[999px] px-3 py-1.5 typo-callout transition-colors',
          chip === item.id
            ? 'bg-surface-float font-bold text-text-primary'
            : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
        )}
      >
        {item.label}
      </button>
    ))}
    <div className="ml-auto flex items-center gap-1">
      <button
        type="button"
        className="flex items-center gap-1 rounded-[999px] px-3 py-1.5 text-text-tertiary typo-callout transition-colors hover:bg-surface-float hover:text-text-primary"
      >
        Latest
        <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
      </button>
      <button
        type="button"
        aria-label="Search posts"
        className="flex size-8 items-center justify-center rounded-[999px] text-text-tertiary transition-colors hover:bg-surface-float hover:text-text-primary"
      >
        <SearchIcon size={IconSize.Small} />
      </button>
    </div>
  </div>
);

const Feed = ({ viewer }: { viewer: Viewer }): ReactElement => {
  const [chip, setChip] = useState('all');
  const toolbar = <FeedToolbar chip={chip} onChip={setChip} />;

  if (chip === 'polls' || chip === 'releases') {
    return (
      <div className="flex flex-col gap-4 p-6 pb-0">
        <SquadComposer viewer={viewer} />
        {toolbar}
        {chip === 'polls' ? (
          <PollsPage viewer={viewer} />
        ) : (
          <ReleasesPage viewer={viewer} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <SquadComposer viewer={viewer} />
      {toolbar}
      {chip === 'all' && <Highlight entry={pinnedEntry} />}
      <CardList
        entries={
          chip === 'discussions'
            ? discussionEntries.slice(0, 6)
            : feedEntries.slice(0, 6)
        }
      />
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Medium}
        className="w-full"
      >
        Load more
      </Button>
    </div>
  );
};

/* -------------------------------------------------------------- sub-page */

const titles: Record<string, string> = {
  rules: 'Rules',
  faq: 'FAQ',
  members: 'Followers',
  products: 'Products',
  moderation: 'Moderation',
  feed: 'Content feed',
  analytics: 'Analytics',
  settings: 'Settings',
};

/**
 * LinkedIn's company sub-pages keep a strip of the company above the page:
 * back, the logo, the name. The page below carries its own title.
 */
const SubHeader = ({
  viewer,
  id,
  onBack,
}: {
  viewer: Viewer;
  id: string;
  onBack: () => void;
}): ReactElement => (
  <div className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      icon={<ArrowIcon className="-rotate-90" />}
      aria-label="Back to CodeRabbit"
      onClick={onBack}
    />
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-2 rounded-10 py-1 pl-1 pr-2 transition-colors hover:bg-surface-float"
    >
      <img src={squad.image} alt="" className="size-7 rounded-8 object-cover" />
      <span className="flex items-center gap-1 font-bold text-text-primary typo-callout">
        {squad.name}
        <VerifiedMark label={false} />
      </span>
    </button>
    <span className="text-text-quaternary typo-callout">/</span>
    <span className="text-text-tertiary typo-callout">{titles[id] ?? id}</span>
    <div className="ml-auto">
      <FollowButton viewer={viewer} size={ButtonSize.XSmall} />
    </div>
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
}: {
  children: ReactNode;
  aside: ReactNode;
}): ReactElement => (
  <div className="m-auto flex w-full max-w-[72rem] gap-4 p-4 pb-6">
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="rounded-16 border border-border-subtlest-tertiary">
        {children}
      </div>
    </main>
    <aside className="flex w-80 shrink-0 flex-col gap-4">{aside}</aside>
  </div>
);

export const DirectionPage = ({
  viewer,
  active,
  onSelect,
}: {
  viewer: Viewer;
  active: string;
  onSelect: (id: string) => void;
}): ReactElement => (
  <Frame
    aside={
      <SquadWidgets
        viewer={viewer}
        onOpenRules={() => onSelect('rules')}
        onOpenFaq={() => onSelect('faq')}
      />
    }
  >
    {active === 'home' ? (
      <>
        <SquadHeader
          viewer={viewer}
          standalone
          onOpenMembers={() => onSelect('members')}
          extra={<ManageButton viewer={viewer} onSelect={onSelect} />}
        />
        <ProductsShelf onOpen={() => onSelect('products')} />
        <div className="border-t border-border-subtlest-tertiary">
          <Feed viewer={viewer} />
        </div>
      </>
    ) : (
      <>
        <SubHeader
          viewer={viewer}
          id={active}
          onBack={() => onSelect('home')}
        />
        <SubPage id={active} viewer={viewer} />
      </>
    )}
  </Frame>
);

export const directionPageIds = [
  'home',
  'rules',
  'faq',
  'members',
  'products',
  ...manage.pages.map((page) => page.id),
];

export const DirectionShell = ({
  viewer = Viewer.Visitor,
  initialPage = 'home',
  height = 48,
  width = 1440,
}: {
  viewer?: Viewer;
  initialPage?: string;
  /** rem */
  height?: number;
  width?: number;
}): ReactElement => {
  const [active, setActive] = useState(initialPage);

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
          <DirectionPage viewer={viewer} active={active} onSelect={setActive} />
        </main>
      </div>
    </WorkspaceContext.Provider>
  );
};
