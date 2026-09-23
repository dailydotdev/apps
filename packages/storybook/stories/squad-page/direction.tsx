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
import { feedEntries, formatCount, pinnedEntry, products, squad } from './data';
import { VerifiedMark, Viewer } from './kit';
import { Kit2Styles } from './kit2';
import { PostsArea, SquadComposer, SquadHeader, SquadWidgets } from './home';
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

const releaseEntries = feedEntries.filter((entry) => entry.image === null);
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

const Feed = ({ viewer }: { viewer: Viewer }): ReactElement => {
  const [chip, setChip] = useState('all');
  const row = <ChipRow active={chip} onSelect={setChip} />;

  if (chip === 'polls') {
    return (
      <div className="flex flex-col gap-4 p-6 pb-0">
        <div className="flex items-center gap-2">{row}</div>
        <PollsPage viewer={viewer} />
      </div>
    );
  }
  if (chip === 'releases') {
    return (
      <div className="flex flex-col gap-4 p-6 pb-0">
        <div className="flex items-center gap-2">{row}</div>
        <ReleasesPage viewer={viewer} />
      </div>
    );
  }

  return (
    <PostsArea
      sort="Latest"
      entries={
        chip === 'discussions'
          ? discussionEntries.slice(0, 6)
          : feedEntries.slice(0, 6)
      }
      pinned={chip === 'all' ? pinnedEntry : undefined}
      composer={<SquadComposer viewer={viewer} />}
      toolbarChildren={row}
    />
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
