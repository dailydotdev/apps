import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { MailIcon } from '@dailydotdev/shared/src/components/icons/Mail';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { ShieldCheckIcon } from '@dailydotdev/shared/src/components/icons/ShieldCheck';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { TourIcon } from '@dailydotdev/shared/src/components/icons/Tour';
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
  title: 'Hero Cover/Final/1. Home layout',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/*
 * The home page around the rail, at every breakpoint production has
 * (styles/media.ts: phone < 656, tablet 656, laptop 1020, laptopL 1360,
 * laptopXL 1668, desktop 1976). Built on production as it is on main:
 * the v2 left rail from laptop up (SidebarDesktopV2), the rail's own
 * header and edit mode (feedWidgets/FeedWidgetRailHeader), the chips
 * (ExploreChipsBar on laptop, UnifiedMobileFeedNav on tablet, the shell's
 * HomeSegments on phones) and the phones' sheet (shell/ExploreSortMenu).
 * What changes is the order: the rail first, then the feed's tabs, which
 * pin to the top once the rail scrolls away.
 */

type Device =
  | 'phone'
  | 'tablet'
  | 'laptop'
  | 'laptopL'
  | 'laptopXL'
  | 'desktop';

const devices: Record<
  Device,
  { label: string; width: number; columns: number; hasSideRail: boolean }
> = {
  phone: { label: 'Phone · 375', width: 375, columns: 1, hasSideRail: false },
  tablet: { label: 'Tablet · 768', width: 768, columns: 2, hasSideRail: true },
  laptop: {
    label: 'Laptop · 1020',
    width: 1020,
    columns: 3,
    hasSideRail: true,
  },
  laptopL: {
    label: 'Laptop L · 1360',
    width: 1360,
    columns: 4,
    hasSideRail: true,
  },
  laptopXL: {
    label: 'Laptop XL · 1668',
    width: 1668,
    columns: 5,
    hasSideRail: true,
  },
  desktop: {
    label: 'Desktop · 1976',
    width: 1976,
    columns: 6,
    hasSideRail: true,
  },
};

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
const greeting = `${
  (hour < 12 && 'Good morning') ||
  (hour < 18 && 'Good afternoon') ||
  'Good evening'
}, Tsahi`;
const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

type Sort = 'Recommended' | 'By date';
const sorts: Sort[] = ['Recommended', 'By date'];

/* ------------------------------------------------------------------ */
/* Production chrome around the page                                   */
/* ------------------------------------------------------------------ */

const sideRailIcons = [
  HomeIcon,
  SearchIcon,
  SquadIcon,
  BellIcon,
  ReadingStreakIcon,
];

/** SidebarDesktopV2, reduced to its column: where New post and Plus live today. */
const SideRail = (): ReactElement => (
  <aside className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-border-subtlest-tertiary py-4">
    <span className="mb-2 flex size-9 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
      d
    </span>
    {sideRailIcons.map((Icon, index) => (
      <span
        key={Icon.name || index}
        className={classNames(
          'flex size-10 items-center justify-center rounded-12 text-text-tertiary',
          index === 0 && 'bg-surface-float text-text-primary',
        )}
      >
        <Icon size={IconSize.Small} />
      </span>
    ))}
    <span className="mt-auto flex size-10 items-center justify-center rounded-12 bg-text-primary text-surface-invert">
      <PlusIcon size={IconSize.Small} />
    </span>
  </aside>
);

/** The phone's ShellBlock top row, as production draws it. */
const PhoneShellTop = (): ReactElement => (
  <div className="flex h-12 shrink-0 items-center gap-2 px-4">
    <span className="flex-1 font-bold text-text-primary typo-title3">
      daily.dev
    </span>
    <span className="flex h-8 items-center gap-1 rounded-10 bg-surface-float px-2 text-text-primary typo-footnote">
      <TourIcon size={IconSize.Size16} />
      2/6
    </span>
    <span className="flex h-8 items-center gap-1 rounded-10 bg-surface-float px-2 font-bold text-accent-bacon-default typo-footnote">
      <ReadingStreakIcon secondary size={IconSize.Size16} />
      849
    </span>
    <span className="flex size-8 items-center justify-center rounded-10 bg-surface-float text-accent-bacon-default">
      <DevPlusIcon size={IconSize.Size16} />
    </span>
    <span className="flex size-8 items-center justify-center rounded-10 bg-surface-float text-text-primary">
      <MailIcon size={IconSize.Size16} />
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/* The rail's header                                                   */
/* ------------------------------------------------------------------ */

const IntroQuestButton = ({
  isCompact,
}: {
  isCompact?: boolean;
}): ReactElement => (
  <Button
    variant={ButtonVariant.Float}
    size={ButtonSize.Small}
    icon={<TourIcon />}
    title="Introduction"
  >
    {isCompact ? '2/6' : 'Getting started · 2/6'}
  </Button>
);

/**
 * FeedWidgetRailHeader with the page's actions added before the rail's own
 * controls: the Customize gear, then the arrows at the far right. In edit
 * mode the page's actions step aside (edit mode is a mode: only what works
 * in it shows), the subtitle says how to edit, and Hide widgets, New widget
 * and Done take the gear's place, beside the arrows that stay put.
 */
const HomeHeader = ({
  device,
  isEditing = false,
  onToggleEditing,
  onAdd,
  onArrow,
  isPlus,
  hasQuests = true,
}: {
  device: Device;
  isEditing?: boolean;
  onToggleEditing?: () => void;
  onAdd?: () => void;
  onArrow?: (direction: -1 | 1) => void;
  isPlus?: boolean;
  hasQuests?: boolean;
}): ReactElement => {
  const isPhone = device === 'phone';
  const isTablet = device === 'tablet';
  const isWide = device === 'laptopXL' || device === 'desktop';
  return (
    // The rail ends editing on a press outside it; its own controls live
    // here now, so the header counts as part of the rail.
    <header
      data-rail-overlay
      className="relative flex min-h-12 items-center gap-2"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={classNames(
            'truncate font-bold text-text-primary',
            isPhone ? 'typo-body' : 'typo-title3',
          )}
        >
          {greeting}
        </span>
        <span className="truncate text-text-tertiary typo-footnote">
          {isEditing
            ? 'Drag to move, or drag a corner to resize'
            : `${isPhone ? '' : `${today} · `}12 new since yesterday`}
        </span>
      </div>
      {!isPhone && !isEditing && (
        <span className="flex items-center gap-2">
          {hasQuests && <IntroQuestButton isCompact={!isWide} />}
          {!isPlus && (
            <Button
              variant={ButtonVariant.Primary}
              color={ButtonColor.Bacon}
              size={ButtonSize.Small}
              icon={<DevPlusIcon />}
              aria-label={isTablet ? 'Get Plus' : undefined}
            >
              {isTablet ? undefined : 'Get Plus'}
            </Button>
          )}
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            aria-label={isTablet ? 'New post' : undefined}
          >
            {isTablet ? undefined : 'New post'}
          </Button>
          <span
            aria-hidden
            className="mx-1 h-6 w-px bg-border-subtlest-tertiary"
          />
        </span>
      )}
      {isEditing ? (
        <>
          {!isPhone && (
            <Button variant={ButtonVariant.Tertiary} size={ButtonSize.Small}>
              Hide widgets
            </Button>
          )}
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={onAdd}
          >
            New widget
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            aria-pressed
            onClick={onToggleEditing}
          >
            Done
          </Button>
        </>
      ) : (
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<SettingsIcon />}
          aria-label="Customize widgets"
          title="Customize widgets"
          aria-pressed={false}
          onClick={onToggleEditing}
        />
      )}
      {!isPhone && (
        <div className="flex items-center gap-1">
          {([-1, 1] as const).map((direction) => (
            <Button
              key={direction}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={
                <ArrowIcon
                  className={direction === -1 ? '-rotate-90' : 'rotate-90'}
                />
              }
              aria-label={
                direction === -1
                  ? 'Scroll widgets left'
                  : 'Scroll widgets right'
              }
              onClick={() => onArrow?.(direction)}
            />
          ))}
        </div>
      )}
    </header>
  );
};

/* ------------------------------------------------------------------ */
/* The feed's tabs                                                     */
/* ------------------------------------------------------------------ */

const SortMenu = ({
  sort,
  onSort,
}: {
  sort: Sort;
  onSort: (sort: Sort) => void;
}): ReactElement => (
  <div
    role="menu"
    className="absolute left-0 top-full z-3 mt-2 flex w-52 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default p-1.5 shadow-2"
  >
    <span className="px-2.5 pb-1 pt-1.5 font-bold text-text-tertiary typo-caption1">
      Sort
    </span>
    {sorts.map((option) => (
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

/**
 * The phone's For you sheet: ExploreSortMenu's Drawer and SheetChoice rows
 * for the sort, then Feed settings, which lives here on phones instead of
 * on the tab bar.
 */
const SortDrawer = ({
  sort,
  onSort,
}: {
  sort: Sort;
  onSort: (sort: Sort) => void;
}): ReactElement => (
  <div className="fixed inset-0 z-3 flex flex-col justify-end bg-overlay-quaternary-onion">
    <div className="flex flex-col rounded-t-24 bg-background-default pb-6 pt-3">
      <span className="mx-auto mb-3 h-1 w-10 rounded-max bg-surface-float" />
      <span className="px-4 pb-1 font-bold text-text-primary typo-body">
        For you
      </span>
      <span className="px-4 pb-1 pt-2 font-bold text-text-tertiary typo-caption1">
        Sort
      </span>
      {sorts.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSort(option)}
          className={classNames(
            'flex h-12 items-center gap-2 px-4 text-left typo-callout',
            sort === option
              ? 'font-bold text-text-primary'
              : 'text-text-secondary',
          )}
        >
          {option}
          {sort === option && (
            <span className="size-2 rounded-max bg-text-primary" />
          )}
        </button>
      ))}
      <span className="mx-4 my-1 h-px bg-border-subtlest-tertiary" />
      <button
        type="button"
        className="flex h-12 items-center gap-3 px-4 text-left text-text-primary typo-callout"
      >
        <FilterIcon size={IconSize.Small} className="text-text-tertiary" />
        <span className="flex-1">Feed settings</span>
        <ArrowIcon
          size={IconSize.Size16}
          className="rotate-90 text-text-quaternary"
        />
      </button>
    </div>
  </div>
);

type TabKind = 'laptop' | 'tablet' | 'phone';

const feedsFor: Record<TabKind, string[]> = {
  // ExploreChipsBar: For you and the reader's custom feeds.
  laptop: ['For you', 'Agentic Engineering', 'Frontend'],
  // UnifiedMobileFeedNav: feeds, then the places after a divider.
  tablet: [
    'For you',
    'Agentic Engineering',
    '|',
    'Following',
    'Popular',
    'Bookmarks',
  ],
  // HomeSegments.
  phone: ['For you', 'Happening now', 'Following', 'Agentic Engineering'],
};

const chipClass: Record<TabKind, (isActive: boolean) => string> = {
  laptop: (isActive) =>
    classNames(
      'relative flex h-8 items-center gap-1 rounded-10 px-3 font-bold typo-callout',
      isActive
        ? 'bg-surface-float text-text-primary after:absolute after:bottom-0 after:left-1/4 after:w-1/2 after:border-b-2 after:border-text-primary'
        : 'text-text-tertiary hover:text-text-primary',
    ),
  tablet: (isActive) =>
    classNames(
      'flex items-center gap-1 rounded-10 border px-2.5 py-1.5 font-bold typo-callout',
      isActive
        ? 'border-border-subtlest-tertiary bg-surface-float text-text-primary'
        : 'border-transparent text-text-tertiary',
    ),
  phone: (isActive) =>
    classNames(
      'flex h-7 items-center gap-0.5 rounded-8 border px-2 font-bold typo-footnote',
      isActive
        ? 'border-border-subtlest-secondary bg-surface-float text-text-primary'
        : 'border-transparent text-text-tertiary',
    ),
};

/**
 * The feed's tab row under the rail. For you holds its sort: clicking the
 * active tab again opens it (a menu from laptop up, a sheet on phones),
 * so the separate sort icon goes. Right of the tabs: the clickbait shield
 * as an icon, then Feed settings with its label where there is room.
 */
const TabRow = ({
  device,
  isMenuOpenInitially = false,
}: {
  device: Device;
  isMenuOpenInitially?: boolean;
}): ReactElement => {
  const [sort, setSort] = useState<Sort>('Recommended');
  const [isMenuOpen, setIsMenuOpen] = useState(isMenuOpenInitially);
  const kind: TabKind =
    (device === 'phone' && 'phone') ||
    (device === 'tablet' && 'tablet') ||
    'laptop';
  const isPhone = kind === 'phone';
  const iconSize = isPhone ? IconSize.Size16 : IconSize.Small;
  const choose = (value: Sort) => {
    setSort(value);
    setIsMenuOpen(false);
  };
  return (
    <div
      className={classNames(
        'flex items-center gap-2 border-b border-border-subtlest-tertiary bg-background-default',
        isPhone ? 'h-11 px-4' : 'py-2',
      )}
    >
      <div className="relative min-w-0 flex-1">
        <nav
          className={classNames(
            'no-scrollbar flex items-center overflow-x-auto',
            isPhone ? 'gap-1' : 'gap-2',
          )}
          // The row scrolls; a fade at its end says there is more, as
          // ExploreChipsBar does.
          style={{
            maskImage:
              'linear-gradient(to right, black calc(100% - 2.5rem), transparent)',
          }}
        >
          {feedsFor[kind].map((tab, index) => {
            if (tab === '|') {
              return (
                <span
                  key="divider"
                  aria-hidden
                  className="h-5 w-px shrink-0 bg-border-subtlest-tertiary"
                />
              );
            }
            const isActive = index === 0;
            return (
              <button
                key={tab}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                aria-haspopup={isActive ? 'menu' : undefined}
                aria-expanded={isActive ? isMenuOpen : undefined}
                onClick={() => isActive && setIsMenuOpen((value) => !value)}
                className={classNames('shrink-0', chipClass[kind](isActive))}
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
                      isMenuOpen && !isPhone ? 'rotate-0' : 'rotate-180',
                    )}
                  />
                )}
              </button>
            );
          })}
          <Button
            variant={ButtonVariant.Tertiary}
            size={isPhone ? ButtonSize.XSmall : ButtonSize.Small}
            aria-label="New feed"
            icon={<PlusIcon />}
            className="shrink-0"
          />
        </nav>
        {isMenuOpen && !isPhone && <SortMenu sort={sort} onSort={choose} />}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!isPhone && (
          <Button
            variant={
              kind === 'laptop' ? ButtonVariant.Tertiary : ButtonVariant.Float
            }
            size={ButtonSize.Small}
            aria-label="Clickbait Shield on"
            title="Toggle Clickbait Shield on/off"
            icon={
              <ShieldCheckIcon
                size={iconSize}
                className="text-status-success"
              />
            }
          />
        )}
        {!isPhone && (
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<FilterIcon size={iconSize} />}
          >
            Feed settings
          </Button>
        )}
      </div>
      {isPhone && isMenuOpen && <SortDrawer sort={sort} onSort={choose} />}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* The page at one breakpoint                                          */
/* ------------------------------------------------------------------ */

const Feed = ({ columns }: { columns: number }): ReactElement => (
  <div
    className={classNames('grid', columns === 1 ? 'gap-4' : 'gap-8')}
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {realPosts.slice(10, 10 + Math.max(2, columns * 2)).map((post) => (
      <ArticleGrid key={post.id} post={post} {...cardHandlers} />
    ))}
  </div>
);

/** A device frame at its real width, scaled down when it doesn't fit. */
const ScaledFrame = ({
  width,
  height,
  maxWidth = 1380,
  children,
}: {
  width: number;
  height: number;
  maxWidth?: number;
  children: ReactNode;
}): ReactElement => {
  const scale = Math.min(1, maxWidth / width);
  return (
    <div
      className="shrink-0 overflow-hidden rounded-24 border border-border-subtlest-quaternary"
      style={{ width: width * scale, height: height * scale }}
    >
      <div
        // The transform also makes this the containing block for the
        // phone's fixed drawer, so it opens inside the frame.
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * The home page at one breakpoint, scrolling inside its frame: the rail's
 * header, the rail, then the tabs, which stick once the rail is gone.
 * Customize and the arrows work; scroll inside to see the tabs pin.
 */
const Home = ({
  device,
  height,
  isPlus,
  hasQuests,
  isMenuOpen,
  isEditingInitially = false,
  scrollTop,
}: {
  device: Device;
  height?: number;
  isPlus?: boolean;
  hasQuests?: boolean;
  isMenuOpen?: boolean;
  isEditingInitially?: boolean;
  /** Start scrolled, so the pinned tabs show without scrolling. */
  scrollTop?: number;
}): ReactElement => {
  const spec = devices[device];
  const isPhone = device === 'phone';
  const frameHeight = height ?? (isPhone ? 760 : 900);
  const controller = useRef<RailController | null>(null);
  const [isEditing, setIsEditing] = useState(isEditingInitially);
  const pad = isPhone ? 'px-4' : 'px-6';
  return (
    <ScaledFrame width={spec.width} height={frameHeight}>
      <div className="relative flex h-full bg-background-default">
        {spec.hasSideRail && <SideRail />}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {isPhone && <PhoneShellTop />}
          <div
            className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto"
            ref={(el) => {
              if (el && scrollTop !== undefined && el.scrollTop === 0) {
                // eslint-disable-next-line no-param-reassign
                el.scrollTop = scrollTop;
              }
            }}
          >
            <div className={classNames('flex flex-col gap-4 pt-4', pad)}>
              <HomeHeader
                device={device}
                isPlus={isPlus}
                hasQuests={hasQuests}
                isEditing={isEditing}
                onToggleEditing={() => setIsEditing((value) => !value)}
                onAdd={() => controller.current?.openGallery()}
                onArrow={(direction) =>
                  controller.current?.scrollByPage(direction)
                }
              />
              <WidgetRail
                initialWidgets={
                  isPhone ? [rw('featured', 'm'), ...rail().slice(1)] : rail()
                }
                strips={campaignStrips.slice(0, 1)}
                columns={spec.columns}
                isPhone={isPhone}
                showAdSlot={!isPhone}
                cellHeight={isPhone ? '11.25rem' : '12.5rem'}
                header="none"
                isEditing={isEditing}
                onEditingChange={setIsEditing}
                controllerRef={controller}
              />
            </div>
            <div
              className={classNames('sticky top-0 z-2 mt-2', !isPhone && pad)}
            >
              <TabRow device={device} isMenuOpenInitially={isMenuOpen} />
            </div>
            <div className={classNames('pb-6 pt-3', pad)}>
              <Feed columns={spec.columns} />
            </div>
          </div>
        </div>
      </div>
    </ScaledFrame>
  );
};

/* ------------------------------------------------------------------ */
/* The page                                                            */
/* ------------------------------------------------------------------ */

const decisions: [string, string][] = [
  [
    'Order',
    'The rail’s header, the rail, then the feed’s tabs, then the feed, at every size. Today the tabs sit above the rail on laptop (the page-header strip) and on tablet (the sticky FeedNav); they move under it, so they split the widgets from the feed.',
  ],
  [
    'Header',
    'Production’s rail header (greeting in title3, the date and what’s new) gains the page’s actions: Getting started until it’s done (moved up from the tab row), Get Plus for non-Plus readers, New post. Then, after a divider, the rail’s own controls: the Customize gear, then the arrows at the far right.',
  ],
  [
    'Customize',
    'No hover pencil on widgets: a gear, left of the arrows, is the way in. In edit mode the page’s actions step aside, the subtitle says how to edit (“Drag to move, or drag a corner to resize”), and Hide widgets, New widget and a primary Done take the gear’s place. The arrows stay at the far right, since editing needs them. Escape or a click outside also ends editing.',
  ],
  [
    'Tabs',
    'The feeds stay where production has them at each size: For you and custom feeds on laptop; feeds and places on tablet; For you, Happening now, Following and custom feeds on phones. Sorting moves into For you: tapping the active tab again opens Recommended or By date, a menu from laptop up and a sheet on phones (with Feed settings), so the sort icon goes. A non-default sort shows on the tab (For you · By date).',
  ],
  [
    'Right of tabs',
    'The clickbait shield stays as an icon and Feed settings gets its label, from tablet up. On phones Feed settings sits in the For you sheet with the sort, so the bar keeps only the feeds and + for a new feed.',
  ],
  [
    'Sticky',
    'Once the rail scrolls away, the tab row pins to the top with a hairline under it, on every size. On phones it pins under the shell’s top row, which keeps its production behavior.',
  ],
  [
    'Overlap',
    'From laptop up, New post and Plus also live in the left rail (SidebarDesktopV2). The header repeats them on the home page only, where the rail’s greeting gives them a place; product to confirm the duplication.',
  ],
];

const sizeNotes: Record<Device, string> = {
  phone:
    'Production’s shell top row stays (logo, Getting started, streak, Plus, Messages). Under it the rail’s header: the greeting and the Customize gear; no arrows (the rail swipes) and no ad in the rail (it returns to the feed). The tabs are production’s segments and + for a new feed; tapping For you again opens its sheet, with the sort and Feed settings.',
  tablet:
    'The left rail, then the header: Getting started as 2/6, Get Plus and New post as icons, the Customize gear and the arrows. Two widget columns. The tabs use production’s tablet chips (feeds, then places after a divider); the shield and Feed settings with its label.',
  laptop:
    'The v2 left rail. Three columns. The header keeps every label but Getting started (2/6). The tabs are production’s chips: For you, custom feeds, +.',
  laptopL: 'Four columns; the same header and tabs.',
  laptopXL: 'Five columns; Getting started gets its full label.',
  desktop: 'Six columns, the widest rail.',
};

export const HomeLayout: StoryObj = {
  name: '1. Home layout',
  render: () => (
    <Page
      chapter="Final · 1"
      question="How does the home page sit around the rail, at every size?"
      title="Home layout"
      goal="Give the rail a header with the page’s actions and production’s Customize, move the feed’s tabs under the rail so the widgets and the feed read as two parts, pin the tabs on scroll, and fold sorting into For you, at every breakpoint production has."
      metric="Customize and New post clicks from the header, tab switches per visit, and sort changes, against today’s layout."
    >
      <Case title="What changes">
        <dl
          className="grid max-w-[64rem] gap-x-6 gap-y-2.5 typo-callout"
          style={{ gridTemplateColumns: '9rem 1fr' }}
        >
          {decisions.map(([term, text]) => (
            <React.Fragment key={term}>
              <dt className="font-bold text-text-primary">{term}</dt>
              <dd className="text-text-secondary">{text}</dd>
            </React.Fragment>
          ))}
        </dl>
      </Case>

      {(Object.keys(devices) as Device[]).map((device) => (
        <Case
          key={device}
          title={devices[device].label}
          note={`${sizeNotes[device]} Scroll inside the frame to see the tabs pin; Customize and the arrows work.`}
        >
          <Home device={device} />
        </Case>
      ))}

      <Case
        title="Customize, then Done"
        note="The gear opens edit mode: the page’s actions step aside so nothing that can’t be used while editing stays on screen, the subtitle explains the gestures, and Hide widgets, New widget and Done take the gear’s place. Done is a click inside the rail’s controls, so it ends editing once."
      >
        <div className="flex flex-col gap-6">
          <Home device="laptopXL" height={520} isEditingInitially />
          <div className="flex flex-wrap gap-6">
            <Home device="tablet" height={520} isEditingInitially />
            <Home device="phone" height={520} isEditingInitially />
          </div>
        </div>
      </Case>

      <Case
        title="For you, sort open"
        note="Tapping the active For you tab opens its sort: a menu from laptop up; on phones a sheet with the sort and Feed settings."
      >
        <div className="flex flex-wrap items-start gap-6">
          <Home device="laptopL" height={720} isMenuOpen scrollTop={420} />
          <Home device="phone" height={700} isMenuOpen />
        </div>
      </Case>

      <Case
        title="Pinned on scroll"
        note="The rail scrolled away: the tab row stays at the top."
      >
        <div className="flex flex-wrap items-start gap-6">
          <Home device="laptopXL" height={460} scrollTop={640} />
          <Home device="tablet" height={460} scrollTop={640} />
          <Home device="phone" height={460} scrollTop={460} />
        </div>
      </Case>

      <Case
        title="Who sees what"
        note="Plus readers don’t see Get Plus; Getting started leaves the header once the intro quests are done."
      >
        <div className="flex flex-col gap-6">
          <Home device="laptopL" height={300} isPlus />
          <Home device="laptopL" height={300} hasQuests={false} />
        </div>
      </Case>
    </Page>
  ),
};
