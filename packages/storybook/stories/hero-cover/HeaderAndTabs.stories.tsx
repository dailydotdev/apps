import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { FlagIcon } from '@dailydotdev/shared/src/components/icons/Flag';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { ShieldCheckIcon } from '@dailydotdev/shared/src/components/icons/ShieldCheck';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { cardHandlers } from '../features/feed/feedHero.mocks';
import { Case, Page } from './parts';
import { realPosts } from './realData';
import type { RailController, RailWidget } from './widgets/rail';
import { rw, WidgetRail } from './widgets/rail';
import { campaignStrips } from './widgets/adSlot';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Header & tabs',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/*
 * Where the feed's controls go once the hero is the rail, on the v2 layout
 * everyone now has. The rail gets a header of its own (the greeting, the
 * page's actions, the rail's arrows); the feed's tabs move under the rail,
 * so the rail and the feed read as two parts, and stick to the top once
 * the rail scrolls away. Sorting moves into the For you tab, as the
 * mobile Explore page does with its Sort drawer (shell/ExploreSortMenu).
 */

const rail = (): RailWidget[] => [
  rw('featured', 'l'),
  rw('happening', 'm'),
  rw('weather', 's'),
  rw('todo', 's'),
  rw('agents', 'm'),
  rw('introquests', 's'),
  rw('shortcuts', 's'),
  rw('streak', 's'),
  rw('notifications', 's'),
];

const hour = new Date().getHours();
const partOfDay =
  (hour < 12 && 'Good morning') ||
  (hour < 18 && 'Good afternoon') ||
  'Good evening';
const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

type Sort = 'Recommended' | 'By date';

/* ------------------------------------------------------------------ */
/* The hero's header                                                   */
/* ------------------------------------------------------------------ */

const ArrowButton = ({
  direction,
  onClick,
}: {
  direction: -1 | 1;
  onClick?: () => void;
}): ReactElement => (
  <Button
    variant={ButtonVariant.Tertiary}
    size={ButtonSize.Small}
    aria-label={direction === 1 ? 'Next widgets' : 'Previous widgets'}
    icon={
      <ArrowIcon
        className={direction === 1 ? 'rotate-90' : '-rotate-90'}
        size={IconSize.Small}
      />
    }
    onClick={onClick}
  />
);

/** Production's IntroQuestButton, moved up: progress at a glance. */
const QuestPill = ({ isCompact }: { isCompact?: boolean }): ReactElement => (
  <Button
    variant={ButtonVariant.Float}
    size={ButtonSize.Small}
    icon={<FlagIcon secondary className="text-accent-avocado-default" />}
  >
    {isCompact ? '2/6' : 'Getting started · 2/6'}
  </Button>
);

const HeroHeader = ({
  arrows = 'header',
  isPlus,
  hasQuests = true,
  isPhone,
  onArrow,
}: {
  /** The rail's arrows: in this header, or floating on the rail's edges. */
  arrows?: 'header' | 'rail';
  isPlus?: boolean;
  /** Intro quests not finished yet. */
  hasQuests?: boolean;
  isPhone?: boolean;
  onArrow?: (direction: -1 | 1) => void;
}): ReactElement => {
  if (isPhone) {
    return (
      <header className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold text-text-primary typo-body">
            {partOfDay}, Tsahi
          </span>
          <span className="truncate text-text-tertiary typo-caption1">
            12 new since yesterday
          </span>
        </div>
        {hasQuests && <QuestPill isCompact />}
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          aria-label="Customize"
          icon={<EditIcon />}
        />
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          aria-label="New post"
          icon={<PlusIcon />}
        />
      </header>
    );
  }
  return (
    <header className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold text-text-primary typo-title2">
          {partOfDay}, Tsahi
        </span>
        <span className="truncate text-text-tertiary typo-footnote">
          {today} · 12 new since yesterday
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {hasQuests && <QuestPill />}
        {!isPlus && (
          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Bacon}
            size={ButtonSize.Small}
            icon={<DevPlusIcon />}
          >
            Get Plus
          </Button>
        )}
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
        >
          New post
        </Button>
        <span
          aria-hidden
          className="mx-1 h-6 w-px bg-border-subtlest-tertiary"
        />
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<EditIcon />}
        >
          Customize
        </Button>
        {arrows === 'header' && (
          <span className="flex items-center">
            <ArrowButton direction={-1} onClick={() => onArrow?.(-1)} />
            <ArrowButton direction={1} onClick={() => onArrow?.(1)} />
          </span>
        )}
      </div>
    </header>
  );
};

/* ------------------------------------------------------------------ */
/* The feed's tab row                                                  */
/* ------------------------------------------------------------------ */

const tabs = ['For you', 'Following', 'Popular', 'Agentic Engineering'];

/** Sort lives in For you: a dropdown on desktop, the Sort drawer on phones. */
const SortMenu = ({
  sort,
  onSort,
}: {
  sort: Sort;
  onSort: (sort: Sort) => void;
}): ReactElement => (
  <div
    role="menu"
    className="absolute left-0 top-full z-3 mt-2 flex w-56 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default p-1.5 shadow-2"
  >
    <span className="px-2.5 pb-1 pt-1.5 font-bold text-text-tertiary typo-caption1">
      Sort For you
    </span>
    {(['Recommended', 'By date'] as Sort[]).map((option) => (
      <button
        key={option}
        type="button"
        role="menuitemradio"
        aria-checked={sort === option}
        onClick={() => onSort(option)}
        className="flex h-9 items-center justify-between rounded-10 px-2.5 text-left text-text-primary typo-footnote hover:bg-surface-hover"
      >
        {option}
        {sort === option && <VIcon size={IconSize.Size16} />}
      </button>
    ))}
  </div>
);

const TabRow = ({
  isPhone,
  isMenuOpenInitially = false,
  isStuck,
}: {
  isPhone?: boolean;
  isMenuOpenInitially?: boolean;
  /** Pinned to the top after the rail scrolled away. */
  isStuck?: boolean;
}): ReactElement => {
  const [sort, setSort] = useState<Sort>('Recommended');
  const [isMenuOpen, setIsMenuOpen] = useState(isMenuOpenInitially);
  return (
    <div
      className={classNames(
        'flex items-center gap-3 bg-background-default py-2',
        isStuck && 'border-b border-border-subtlest-tertiary',
      )}
    >
      <nav
        className={classNames(
          'relative flex min-w-0 flex-1 items-center gap-1',
          isPhone && 'no-scrollbar overflow-x-auto',
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = index === 0;
          return (
            <span key={tab} className="relative shrink-0">
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                aria-haspopup={isActive ? 'menu' : undefined}
                aria-expanded={isActive ? isMenuOpen : undefined}
                onClick={() => isActive && setIsMenuOpen((value) => !value)}
                className={classNames(
                  'flex h-8 items-center gap-1 rounded-10 px-3 typo-callout transition-colors',
                  isActive
                    ? 'bg-surface-float font-bold text-text-primary'
                    : 'text-text-tertiary hover:text-text-primary',
                )}
              >
                {tab}
                {isActive && sort !== 'Recommended' && (
                  <span className="font-normal text-text-tertiary">
                    · {sort}
                  </span>
                )}
                {isActive && (
                  <ArrowIcon
                    size={IconSize.Size16}
                    className={classNames(
                      'text-text-tertiary transition-transform',
                      isMenuOpen ? 'rotate-0' : 'rotate-180',
                    )}
                  />
                )}
              </button>
              {isActive && isMenuOpen && !isPhone && (
                <SortMenu
                  sort={sort}
                  onSort={(value) => {
                    setSort(value);
                    setIsMenuOpen(false);
                  }}
                />
              )}
            </span>
          );
        })}
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          aria-label="New feed"
          icon={<PlusIcon />}
        />
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          aria-label="Clickbait shield on"
          title="Clickbait shield on"
          icon={<ShieldCheckIcon className="text-accent-avocado-default" />}
        />
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<FilterIcon />}
          aria-label={isPhone ? 'Feed settings' : undefined}
        >
          {isPhone ? undefined : 'Feed settings'}
        </Button>
      </div>
      {isPhone && isMenuOpen && <SortDrawer sort={sort} onSort={setSort} />}
    </div>
  );
};

/** The phone's Sort drawer, as on the mobile Explore page. */
const SortDrawer = ({
  sort,
  onSort,
}: {
  sort: Sort;
  onSort: (sort: Sort) => void;
}): ReactElement => (
  <div className="absolute inset-0 z-3 flex flex-col justify-end bg-overlay-quaternary-onion">
    <div className="flex flex-col gap-1 rounded-t-24 bg-background-default px-4 pb-6 pt-3">
      <span className="mx-auto mb-2 h-1 w-10 rounded-max bg-surface-float" />
      <span className="pb-2 font-bold text-text-primary typo-body">
        Sort For you
      </span>
      {(['Recommended', 'By date'] as Sort[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSort(option)}
          className="flex h-12 items-center justify-between border-b border-border-subtlest-tertiary text-left text-text-primary typo-callout last:border-0"
        >
          {option}
          {sort === option && <VIcon size={IconSize.Small} />}
        </button>
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* The page around them                                                */
/* ------------------------------------------------------------------ */

const Feed = ({ columns }: { columns: number }): ReactElement => (
  <div
    className="grid gap-8"
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {realPosts.slice(10, 10 + columns * 2).map((post) => (
      <ArticleGrid key={post.id} post={post} {...cardHandlers} />
    ))}
  </div>
);

/**
 * The home page in a scrolling frame: header, rail, then the tab row that
 * sticks once it reaches the top. Scroll inside it to see the tabs pin.
 */
const HomeFrame = ({
  arrows = 'header',
  isPlus,
  hasQuests,
  isMenuOpen,
  height = '44rem',
}: {
  arrows?: 'header' | 'rail';
  isPlus?: boolean;
  hasQuests?: boolean;
  isMenuOpen?: boolean;
  height?: string;
}): ReactElement => {
  const controller = useRef<RailController | null>(null);
  return (
    <div
      className="no-scrollbar relative overflow-y-auto rounded-24 border border-border-subtlest-quaternary bg-background-default"
      style={{ height, width: '97.5rem' }}
    >
      <div className="flex flex-col gap-5 px-6 pt-6">
        <HeroHeader
          arrows={arrows}
          isPlus={isPlus}
          hasQuests={hasQuests}
          onArrow={(direction) => controller.current?.scrollByPage(direction)}
        />
        <WidgetRail
          initialWidgets={rail()}
          strips={campaignStrips.slice(0, 1)}
          header={arrows === 'rail' ? 'floating' : 'none'}
          controllerRef={controller}
          hasHoverEdit
        />
      </div>
      <div className="sticky top-0 z-2 mt-4 px-6">
        <TabRow isMenuOpenInitially={isMenuOpen} />
      </div>
      <div className="px-6 pb-6 pt-4">
        <Feed columns={5} />
      </div>
    </div>
  );
};

/** The tab row pinned: what the reader sees after the rail scrolls away. */
const StuckFrame = (): ReactElement => (
  <div
    className="relative overflow-hidden rounded-24 border border-border-subtlest-quaternary bg-background-default"
    style={{ height: '22rem', width: '97.5rem' }}
  >
    <div className="px-6">
      <TabRow isStuck />
    </div>
    <div className="px-6 pt-4">
      <Feed columns={5} />
    </div>
  </div>
);

const PhoneFrame = ({
  isMenuOpen,
  children,
}: {
  isMenuOpen?: boolean;
  children?: ReactNode;
}): ReactElement => (
  <div className="relative flex h-[44rem] w-[23.4375rem] shrink-0 flex-col gap-4 overflow-hidden rounded-32 border-4 border-border-subtlest-tertiary bg-background-default px-4 pt-6">
    <HeroHeader isPhone />
    <WidgetRail
      initialWidgets={[rw('featured', 'm'), ...rail().slice(1)]}
      isPhone
      header="none"
      showAdSlot={false}
      cellHeight="11.25rem"
    />
    <TabRow isPhone isMenuOpenInitially={isMenuOpen} />
    {children}
  </div>
);

const Decisions = (): ReactElement => (
  <dl
    className="grid max-w-[64rem] gap-x-6 gap-y-2.5 typo-callout"
    style={{ gridTemplateColumns: '10rem 1fr' }}
  >
    {(
      [
        [
          'Order',
          'Header, then the rail, then the feed’s tabs, then the feed. The tabs move under the rail, so they split the widgets from the feed instead of sitting above both.',
        ],
        [
          'Header',
          'Left: the greeting and what is new. Right: Getting started (until it is done), Get Plus (not for Plus), New post, then the rail’s own controls, Customize and the arrows, after a divider.',
        ],
        [
          'Tabs',
          'Feeds on the left, as today. Sorting moves into For you: click it again for Recommended or By date, a dropdown on desktop and the Sort drawer on phones, so the sort icon goes. A non-default sort shows on the tab (For you · By date).',
        ],
        [
          'Right of tabs',
          'The clickbait shield stays as an icon; Feed settings becomes a labeled button. The intro quest button moves up to the header.',
        ],
        [
          'Sticky',
          'Once the rail scrolls away the tab row pins to the top, on desktop and phones, with a hairline under it. Scrolling back up returns it to its place under the rail.',
        ],
      ] as [string, string][]
    ).map(([term, text]) => (
      <React.Fragment key={term}>
        <dt className="font-bold text-text-primary">{term}</dt>
        <dd className="text-text-secondary">{text}</dd>
      </React.Fragment>
    ))}
  </dl>
);

export const HeaderAndTabs: StoryObj = {
  name: '5. Header & tabs',
  render: () => (
    <Page
      chapter="Final · 5"
      question="Where do the header and the feed’s tabs go around the rail?"
      title="Header & tabs"
      goal="With the v2 layout as everyone’s default, give the rail a header (greeting, page actions, the rail’s arrows), move the feed’s tabs under the rail so the widgets and the feed read as two parts, and keep the tabs in reach by pinning them on scroll."
      metric="Customize and New post clicks from the header, tab switches per visit, and sort changes, against today’s layout."
    >
      <Case title="What changes">
        <Decisions />
      </Case>
      <Case
        title="Desktop, arrows in the header (recommended)"
        note="Scroll inside the frame: the tabs pin to the top once the rail is gone. The arrows page the rail; click For you to open its sort."
      >
        <div className="no-scrollbar overflow-x-auto">
          <HomeFrame />
        </div>
      </Case>
      <Case
        title="Desktop, arrows on the rail’s edges"
        note="The alternative: the arrows float on the rail on hover, right where they act, and the header keeps only page actions and Customize."
      >
        <div className="no-scrollbar overflow-x-auto">
          <HomeFrame arrows="rail" height="34rem" />
        </div>
      </Case>
      <Case
        title="For you, sort open"
        note="Clicking the active For you tab opens its sort. The menu names what it sorts."
      >
        <div className="no-scrollbar overflow-x-auto pb-24">
          <HomeFrame isMenuOpen height="34rem" />
        </div>
      </Case>
      <Case title="Pinned on scroll">
        <div className="no-scrollbar overflow-x-auto">
          <StuckFrame />
        </div>
      </Case>
      <Case
        title="Who sees what"
        note="Plus readers don’t see Get Plus; Getting started leaves the header once the intro quests are done."
      >
        <div className="no-scrollbar flex flex-col gap-6 overflow-x-auto">
          <div className="w-[97.5rem] rounded-24 border border-border-subtlest-quaternary bg-background-default p-6">
            <HeroHeader isPlus />
          </div>
          <div className="w-[97.5rem] rounded-24 border border-border-subtlest-quaternary bg-background-default p-6">
            <HeroHeader hasQuests={false} />
          </div>
        </div>
      </Case>
      <Case
        title="Phone"
        note="The same order. The header keeps the greeting and turns the actions into icons; tabs scroll sideways with Feed settings as an icon; tapping For you again opens the Sort drawer."
      >
        <div className="flex flex-wrap gap-8">
          <PhoneFrame />
          <PhoneFrame isMenuOpen />
        </div>
      </Case>
    </Page>
  ),
};
