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
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { feedEntries, formatCount, products, squad } from './data';
import { CardList, VerifiedMark, Viewer } from './kit';
import { Kit2Styles } from './kit2';
import { MobileFooterNav, TabletSidebar } from './rail';
import { PinnedArea, PinStyle, feedUnder } from './pins';
import { SquadComposer, SquadHeader, SquadWidgets } from './home';
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
  <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary px-4 py-4 tablet:px-6">
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
  /** Below laptop the right column is gone; its widgets live here. */
  { id: 'about', label: 'About', compactOnly: true },
];

const discussionEntries = feedEntries.filter((_, index) => index % 3 === 2);

/** A label that keeps its bold width, so selecting it moves nothing. */
const SteadyLabel = ({ children }: { children: string }): ReactElement => (
  <span className="grid justify-items-center">
    <span aria-hidden className="invisible col-start-1 row-start-1 font-bold">
      {children}
    </span>
    <span className="col-start-1 row-start-1">{children}</span>
  </span>
);

/** One row: the kinds as chips. */
const FeedToolbar = ({
  chip,
  onChip,
}: {
  chip: string;
  onChip: (id: string) => void;
}): ReactElement => {
  return (
    <div className="flex h-9 items-center gap-1">
      <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {chips.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChip(item.id)}
            className={classNames(
              'shrink-0 rounded-[999px] px-3 py-1.5 typo-callout transition-colors',
              item.compactOnly && 'laptop:hidden',
              chip === item.id
                ? 'bg-surface-float font-bold text-text-primary'
                : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
            )}
          >
            <SteadyLabel>{item.label}</SteadyLabel>
          </button>
        ))}
      </div>
    </div>
  );
};

const Feed = ({
  viewer,
  pinStyle,
  onSelect,
}: {
  viewer: Viewer;
  pinStyle: PinStyle;
  onSelect: (id: string) => void;
}): ReactElement => {
  const [chip, setChip] = useState('all');
  let body: ReactElement;
  if (chip === 'about') {
    body = (
      <div className="flex flex-col gap-4 laptop:hidden">
        <SquadWidgets
          viewer={viewer}
          onOpenRules={() => onSelect('rules')}
          onOpenFaq={() => onSelect('faq')}
        />
      </div>
    );
  } else if (chip === 'polls') {
    body = <PollsPage viewer={viewer} bare />;
  } else if (chip === 'releases') {
    body = <ReleasesPage viewer={viewer} bare />;
  } else {
    body = (
      <>
        {chip === 'all' && <PinnedArea style={pinStyle} />}
        <CardList
          entries={
            chip === 'discussions'
              ? discussionEntries.slice(0, 6)
              : feedUnder(pinStyle).slice(0, 6)
          }
        />
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Medium}
          className="w-full"
        >
          Load more
        </Button>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 tablet:p-6">
      <SquadComposer viewer={viewer} />
      <FeedToolbar chip={chip} onChip={setChip} />
      {body}
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
      <span className="hidden items-center gap-1 font-bold text-text-primary typo-callout tablet:flex">
        {squad.name}
        <VerifiedMark label={false} />
      </span>
    </button>
    <span className="hidden text-text-quaternary typo-callout tablet:inline">
      /
    </span>
    <span className="min-w-0 flex-1 truncate text-text-tertiary typo-callout">
      {titles[id] ?? id}
    </span>
    <div className="shrink-0">
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
  <div className="m-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="border-border-subtlest-tertiary laptop:rounded-16 laptop:border">
        {children}
      </div>
    </main>
    <aside className="hidden w-80 shrink-0 flex-col gap-4 laptop:flex">
      {aside}
    </aside>
  </div>
);

export const DirectionPage = ({
  viewer,
  active,
  onSelect,
  pinStyle = PinStyle.Reddit,
}: {
  viewer: Viewer;
  active: string;
  onSelect: (id: string) => void;
  pinStyle?: PinStyle;
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
          <Feed viewer={viewer} pinStyle={pinStyle} onSelect={onSelect} />
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
  pinStyle,
  fluid = false,
}: {
  viewer?: Viewer;
  initialPage?: string;
  /** rem */
  height?: number;
  width?: number;
  pinStyle?: PinStyle;
  /**
   * Fill the viewport and let its breakpoints decide the layout, the way
   * the app does: the classic sidebar from laptop, the tablet column from
   * 656px, the floating tab bar on phones.
   */
  fluid?: boolean;
}): ReactElement => {
  const [active, setActive] = useState(initialPage);
  const loggedIn = viewer !== Viewer.Anonymous;
  const page = (
    <main className="ws-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
      <DirectionPage
        viewer={viewer}
        active={active}
        onSelect={setActive}
        pinStyle={pinStyle}
      />
    </main>
  );

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
