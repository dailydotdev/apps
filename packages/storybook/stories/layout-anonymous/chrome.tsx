import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  AiIcon,
  AppIcon,
  BellIcon,
  BookmarkIcon,
  CompassIcon,
  DevPlusIcon,
  EarthIcon,
  EyeIcon,
  GiftIcon,
  GitHubIcon,
  GoogleIcon,
  HashtagIcon,
  HelpIcon,
  HomeIcon,
  HotIcon,
  MegaphoneIcon,
  NewPostIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SidebarArrowLeft,
  SidebarArrowRight,
  SourceIcon,
  SquadIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import { MedalIcon } from '@dailydotdev/shared/src/components/icons/Medal';
import { BookmarkReminderIcon } from '@dailydotdev/shared/src/components/icons/Bookmark/Reminder';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { KeyboadShortcutLabel } from '@dailydotdev/shared/src/components/KeyboardShortcutLabel';
import {
  ItemInner,
  navBtnClass,
  NavItem,
  RAIL_ICON_SIZE,
  railDividerBgClass,
  railGlyphBoxClass,
  railTabClass,
  railTabLabelClass,
} from '@dailydotdev/shared/src/components/sidebar/common';
import type { SidebarMenuItem } from '@dailydotdev/shared/src/components/sidebar/common';
import { PromotionalBannerView } from '@dailydotdev/shared/src/components/PromotionalBanner';
import type { Banner } from '@dailydotdev/shared/src/graphql/banner';
import { Theme } from '@dailydotdev/shared/src/components/utilities';
import {
  authGradientBg,
  BottomBannerContainer,
} from '@dailydotdev/shared/src/components/marketing/banners/common';
import { authBannerHeadlineClassName } from '@dailydotdev/shared/src/components/auth/AuthenticationBanner';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/auth/OnboardingHeadline';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  cloudinaryAuthBannerBackground,
  cloudinaryAuthBannerBackground1440w,
  cloudinaryAuthBannerBackground1920w,
} from '@dailydotdev/shared/src/lib/image';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { LAYOUT_FRAME_CLASS } from '@dailydotdev/shared/src/lib/layoutVariant';
import type { Audience, Version } from './kit';

// The laptop chrome of each version, drawn from production's own recipes
// (MainLayout, MainLayoutHeader, SidebarDesktopV2, the deleted
// SidebarDesktop) so a frame measures as the real page does. Production's
// shell components read the top window and portal to its body, so inside a
// device frame they would render for the wrong width; these are their
// markup, not their logic. Every default is the one a visitor gets:
// `sidebarCompact` is true for everyone who never touched the density
// setting, so the rail is 64px with no labels, for members too.

const noop = (): void => undefined;

/* ------------------------------------------------------------ v1 header */

/**
 * MainLayoutHeader on a laptop (64px, fixed, z-header): the logo, the
 * Spotlight pill, then HeaderButtons. Signed out that is Get the app, Log
 * in and Sign up.
 */
export const GlobalHeader = ({
  audience = 'anonymous',
  hasBanner = false,
}: {
  audience?: Audience;
  /** Under the promotional banner the header drops by its 2rem. */
  hasBanner?: boolean;
}): ReactElement => (
  <header
    className={classNames(
      'fixed left-0 top-0 z-header hidden h-16 w-full flex-row content-center items-center justify-center gap-3 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3 laptop:flex',
      hasBanner && 'laptop:[--safe-area-top-offset:2rem]',
    )}
  >
    <div>
      <Logo position={LogoPosition.Initial} onLogoClick={noop} />
    </div>
    <div className="left-0 top-0 z-header mx-2 hidden min-w-0 flex-1 items-center py-3 laptop:flex">
      <button
        type="button"
        aria-label="Open search"
        className="relative flex h-12 w-full max-w-[26.25rem] items-center overflow-hidden rounded-12 border border-transparent bg-background-subtle px-3 py-1 text-left transition-colors hover:bg-surface-hover"
      >
        <AiIcon size={IconSize.Large} className="mr-3 text-text-tertiary" />
        <span className="min-w-0 flex-1 text-text-tertiary typo-body">
          Search
        </span>
        <div className="z-1 flex items-center gap-3">
          <KeyboadShortcutLabel keys={['⌘', 'K']} />
        </div>
      </button>
    </div>
    <div className="ml-auto flex justify-end gap-3">
      {audience === 'anonymous' ? (
        <>
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            icon={<PhoneIcon />}
          >
            Get the app
          </Button>
          <span className="flex flex-row gap-4">
            <Button type="button" variant={ButtonVariant.Secondary}>
              Log in
            </Button>
            <Button type="button" variant={ButtonVariant.Primary}>
              Sign up
            </Button>
          </span>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant={ButtonVariant.Float}
            icon={<BellIcon />}
            aria-label="Notifications"
          />
          <Avatar className="size-10 rounded-12" />
        </>
      )}
    </div>
  </header>
);

/* ------------------------------------------------------- v1 sidebar (44px) */

const v1Item = (
  label: string,
  icon: ReactElement,
  {
    active = false,
    locked = false,
  }: { active?: boolean; locked?: boolean } = {},
): ReactElement => (
  <li key={label} className="flex items-center justify-center">
    <button
      type="button"
      aria-label={label}
      title={locked ? `${label} (asks you to sign up)` : label}
      aria-current={active ? 'page' : undefined}
      className={classNames(
        'flex size-9 items-center justify-center rounded-10 transition-colors',
        active
          ? 'bg-surface-float text-text-primary'
          : 'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
      )}
    >
      {icon}
    </button>
  </li>
);

const v1Divider = (key: string): ReactElement => (
  <li
    key={key}
    aria-hidden
    className="mx-2 my-2 h-px bg-border-subtlest-tertiary"
  />
);

const v1Icon = (Icon: typeof HomeIcon, active = false): ReactElement => (
  <Icon secondary={active} className="pointer-events-none h-5 w-5" />
);

/**
 * SidebarDesktop (v1), collapsed, signed out: what production served to
 * visitors until #7017. Under the header (pt-16), 44px wide: the expand
 * toggle, then MainSection (Home, Get Plus, Following, History, Happening
 * Now, Marketplace), Find Squads, the saves, and Discover.
 */
export const V1Sidebar = ({
  active = 'Explore',
  hasBanner = false,
}: {
  active?: string;
  hasBanner?: boolean;
}): ReactElement => (
  <aside
    className={classNames(
      'fixed left-0 top-0 z-sidebar hidden h-full w-11 flex-col border-r border-border-subtlest-tertiary bg-background-default laptop:flex',
      // Starts under the 4rem header (6rem with the banner above it) and
      // gives up that height, the way SidebarDesktop did.
      hasBanner
        ? 'laptop:[--safe-area-top-offset:6rem]'
        : 'laptop:[--safe-area-top-offset:4rem]',
    )}
  >
    <nav className="no-scrollbar flex flex-col overflow-y-auto pb-3 pt-1">
      <div className="flex h-9 items-center justify-center px-1">
        <Button
          type="button"
          aria-label="Expand sidebar"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          className="text-text-tertiary hover:text-text-primary"
          icon={<SidebarArrowRight size={IconSize.Size16} />}
        />
      </div>
      <ul className="flex flex-col gap-1">
        {v1Item('Home', v1Icon(HomeIcon, active === 'Home'), {
          active: active === 'Home',
        })}
        {v1Item(
          'Get Plus',
          <DevPlusIcon className="pointer-events-none h-5 w-5 text-action-plus-default" />,
          { locked: true },
        )}
        {v1Item('Following', v1Icon(SquadIcon), { locked: true })}
        {v1Item('History', v1Icon(EyeIcon), { locked: true })}
        {v1Item('Happening Now', v1Icon(MegaphoneIcon), { locked: true })}
        {v1Item('Marketplace', v1Icon(AppIcon))}
        {v1Divider('network')}
        {v1Item('Find Squads', v1Icon(SourceIcon, active === 'Squads'), {
          active: active === 'Squads',
        })}
        {v1Divider('saved')}
        {v1Item('Quick saves', v1Icon(BookmarkIcon), { locked: true })}
        {v1Item('Read it later', v1Icon(BookmarkReminderIcon), {
          locked: true,
        })}
        {v1Divider('discover')}
        {v1Item('Explore', v1Icon(CompassIcon, active === 'Explore'), {
          active: active === 'Explore',
        })}
        {v1Item('Tags', v1Icon(HashtagIcon, active === 'Tags'), {
          active: active === 'Tags',
        })}
        {v1Item('Sources', v1Icon(EarthIcon, active === 'Sources'), {
          active: active === 'Sources',
        })}
        {v1Item('Leaderboard', v1Icon(MedalIcon, active === 'Leaderboard'), {
          active: active === 'Leaderboard',
        })}
      </ul>
    </nav>
  </aside>
);

/* ------------------------------------------------------------- v2 rail */

export const Avatar = ({ className }: { className?: string }): ReactElement => (
  <img
    alt=""
    src="https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/1"
    className={classNames('object-cover', className)}
  />
);

const railButtonClass =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-hover hover:text-text-primary active:scale-90 motion-reduce:transition-none focus-outline';

export type RailTabId =
  | 'explore'
  | 'squads'
  | 'activity'
  | 'streak'
  | 'you'
  | 'login'
  | 'create';

/** A rail tab (compact: the glyph alone in a 40px row). */
const RailTab = ({
  id,
  label,
  icon,
  selected,
  previewing,
  compact = true,
}: {
  id: RailTabId;
  label: string;
  icon: ReactNode;
  selected?: boolean;
  previewing?: boolean;
  compact?: boolean;
}): ReactElement => (
  <div role="presentation" className="relative z-1 w-full rounded-12">
    <button
      type="button"
      role="tab"
      aria-label={label}
      aria-selected={!!selected}
      data-rail-tab={id}
      className={classNames(
        railTabClass,
        selected && '!text-text-primary',
        previewing && 'bg-surface-hover text-text-primary',
      )}
    >
      <span className={railGlyphBoxClass}>{icon}</span>
      {!compact && <span className={railTabLabelClass}>{label}</span>}
    </button>
  </div>
);

/** The selected pill behind the tablist, parked under the selected tab. */
const SelectedPill = ({
  index,
  rowPx = 40,
}: {
  index: number | null;
  rowPx?: number;
}): ReactElement => (
  <span
    aria-hidden
    className="pointer-events-none absolute inset-x-0 top-0 z-0 rounded-12 bg-background-default"
    style={{
      height: rowPx,
      transform: `translateY(${(index ?? 0) * (rowPx + 2)}px)`,
      opacity: index === null ? 0 : 1,
    }}
  />
);

export interface RailProps {
  version: 'today' | 'proposed';
  audience?: Audience;
  /** Which tab carries the selected pill; `home` lights the Home button. */
  selected?: RailTabId | 'home' | null;
  /** A tab the pointer rests on (hover background, no pill). */
  previewing?: RailTabId;
  /** The panel is pinned open (the user clicked the toggle). */
  expanded?: boolean;
  /**
   * The collapsed rail's peek: the pointer rests on a panel-bearing tab, so
   * the panel opens beside the rail as an overlay over the content, which
   * keeps its collapsed-width offset (production's `isHoverExpanded`).
   */
  peek?: boolean;
  panel?: ReactNode;
  panelTitle?: string;
  /** Under a 2rem promotional banner the rail drops by its height. */
  bannerOffset?: boolean;
  className?: string;
}

/**
 * SidebarDesktopV2's rail at the compact (default) density: 64px, the logo,
 * Home and Search, a divider, the tabs, then the bottom utilities. What the
 * tabs are depends on the audience and, for visitors, on the version:
 *
 * - member: Explore, Squads, Activity, Streak, You, New post, then the
 *   shortcuts dock; Invite, Support and Settings at the bottom.
 * - anonymous today: Explore, Squads, Streak (an empty panel: the streak
 *   needs an account); Invite (→ /settings/invite, a signed-in page) and
 *   Support at the bottom. The logo and the toggle sit under the header.
 * - anonymous proposed: Explore, Squads, then Log in in the avatar's slot;
 *   Get the app and Support at the bottom. Nothing that needs an account.
 */
export const Rail = ({
  version,
  audience = 'anonymous',
  selected = 'explore',
  previewing,
  expanded = false,
  peek = false,
  panel,
  panelTitle,
  bannerOffset = false,
  className,
}: RailProps): ReactElement => {
  const isMember = audience === 'member';
  const isProposed = version === 'proposed';
  // What is visible (pinned or peeking) vs what is pinned: the toggle sits
  // at the visible edge but its glyph says what a click does.
  const isOpen = expanded || peek;
  const tabs: { id: RailTabId; label: string; icon: ReactNode }[] = [
    {
      id: 'explore',
      label: 'Explore',
      icon: (
        <CompassIcon
          secondary={selected === 'explore'}
          size={RAIL_ICON_SIZE}
          className="scale-105"
        />
      ),
    },
    {
      id: 'squads',
      label: 'Squads',
      icon: (
        <SquadIcon secondary={selected === 'squads'} size={RAIL_ICON_SIZE} />
      ),
    },
  ];
  if (isMember) {
    tabs.push({
      id: 'activity',
      label: 'Notifications',
      icon: (
        <BellIcon secondary={selected === 'activity'} size={RAIL_ICON_SIZE} />
      ),
    });
  }
  if (isMember || !isProposed) {
    tabs.push({
      id: 'streak',
      label: 'Streak',
      icon: <HotIcon secondary={selected === 'streak'} size={RAIL_ICON_SIZE} />,
    });
  }
  if (isMember) {
    tabs.push({
      id: 'you',
      label: 'You',
      icon: (
        <Avatar
          className={classNames(
            'size-5 !rounded-8',
            selected === 'you' && 'ring-1 ring-text-primary',
          )}
        />
      ),
    });
  }
  if (!isMember && isProposed) {
    tabs.push({
      id: 'login',
      label: 'Log in',
      icon: <UserIcon secondary={selected === 'login'} size={RAIL_ICON_SIZE} />,
    });
  }
  const selectedIndex = tabs.findIndex((tab) => tab.id === selected);
  const isHome = selected === 'home';

  return (
    <aside
      data-testid="sidebar-aside"
      className={classNames(
        'group fixed left-0 top-0 z-sidebar hidden h-full flex-row bg-background-default transition-[width,transform] duration-300 ease-in-out laptop:flex laptop:h-dvh laptop:min-h-dvh laptop:border-r-0',
        isOpen ? 'laptop:w-[19rem]' : 'laptop:w-16',
        // The promotional banner: the rail drops by its 2rem and gives up
        // the same height (safeArea.css reads this from `.fixed.top-0.h-full`).
        bannerOffset
          ? 'laptop:[--safe-area-top-offset:2rem]'
          : 'laptop:[--safe-area-top-offset:0rem]',
        'laptop:!bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]',
        // While peeking the panel floats over the feed, so its edge gets a
        // border to read against the content behind it.
        peek && 'laptop:!border-r laptop:border-border-subtlest-tertiary',
        className,
      )}
    >
      {isOpen && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-16 hidden border-r !border-border-subtlest-quaternary laptop:block"
        />
      )}
      <nav
        aria-label="Primary navigation"
        className="group/rail flex h-dvh min-h-dvh w-16 shrink-0 flex-col items-center gap-0.5 px-1.5 pb-3 pt-[13px]"
      >
        <div className="mt-2.5">
          <a
            href="/"
            aria-label="daily.dev"
            onClick={(event) => event.preventDefault()}
            className="focus-outline flex size-10 items-center justify-center rounded-12 text-text-primary transition-[background-color,transform] duration-150 ease-out hover:bg-surface-hover"
          >
            <span className={railGlyphBoxClass}>
              <LogoIcon className={{ container: 'h-[1.125rem] w-auto' }} />
            </span>
          </a>
        </div>
        <a
          href="/"
          aria-label="Home"
          aria-current={isHome ? 'page' : undefined}
          onClick={(event) => event.preventDefault()}
          className={classNames(
            railButtonClass,
            isHome && '!text-text-primary',
          )}
        >
          <span className={railGlyphBoxClass}>
            <HomeIcon secondary={isHome} size={RAIL_ICON_SIZE} />
          </span>
        </a>
        <button type="button" aria-label="Search" className={railButtonClass}>
          <SearchIcon size={RAIL_ICON_SIZE} />
        </button>
        <div
          aria-hidden
          className={classNames('my-1 h-px w-6', railDividerBgClass)}
        />

        <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-0.5">
          <div
            role="tablist"
            aria-label="Sidebar categories"
            className="relative flex w-full flex-col items-center gap-0.5"
          >
            <SelectedPill index={selectedIndex >= 0 ? selectedIndex : null} />
            {tabs.map((tab) => (
              <RailTab
                key={tab.id}
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                selected={selected === tab.id}
                previewing={previewing === tab.id}
              />
            ))}
            {isMember && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Small}
                  icon={<NewPostIcon />}
                  aria-label="New post"
                  className="my-2 !size-9 !rounded-12 [&_svg]:!size-6"
                />
              </div>
            )}
          </div>
          {isMember && (
            <>
              <div
                aria-hidden
                className={classNames('mb-2 h-px w-6', railDividerBgClass)}
              />
              <div className="no-scrollbar -mx-0.5 flex min-h-0 w-full flex-1 flex-col items-center gap-0.5 overflow-y-auto px-0.5">
                <span className={railButtonClass} aria-label="Bookmarks">
                  <BookmarkIcon size={RAIL_ICON_SIZE} />
                </span>
                <span className={railButtonClass} aria-label="History">
                  <EyeIcon size={RAIL_ICON_SIZE} />
                </span>
              </div>
            </>
          )}
        </div>

        <div
          aria-label="Sidebar utilities"
          className="flex w-full flex-col items-center gap-0.5"
        >
          {isMember && (
            <div
              aria-hidden
              className={classNames('my-1 h-px w-6', railDividerBgClass)}
            />
          )}
          {isMember || !isProposed ? (
            <a
              href="/settings/invite"
              aria-label="Invite friends"
              title={
                isMember
                  ? 'Invite friends'
                  : 'Invite friends → /settings/invite, which asks you to log in'
              }
              onClick={(event) => event.preventDefault()}
              className={railButtonClass}
            >
              <GiftIcon size={RAIL_ICON_SIZE} />
            </a>
          ) : (
            <button
              type="button"
              aria-label="Get the daily.dev mobile app"
              title="Get the app (opens the QR code popover)"
              className={railButtonClass}
            >
              <PhoneIcon size={RAIL_ICON_SIZE} />
            </button>
          )}
          <button
            type="button"
            aria-label="Support"
            className={railButtonClass}
          >
            <HelpIcon size={RAIL_ICON_SIZE} />
          </button>
          {isMember && (
            <button
              type="button"
              aria-label="Settings"
              className={railButtonClass}
            >
              <SettingsIcon size={RAIL_ICON_SIZE} />
            </button>
          )}
        </div>
      </nav>

      {/* The open/close toggle: tracks the panel's edge. */}
      <div
        className={classNames(
          'absolute top-6 z-1 hidden h-10 items-center laptop:flex',
          isOpen ? 'left-[16.5rem]' : 'left-[3.5rem]',
        )}
      >
        <button
          type="button"
          aria-label={expanded ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={expanded}
          className={classNames(
            'focus-outline flex size-7 items-center justify-center rounded-10 border text-text-tertiary',
            expanded
              ? 'border-transparent bg-transparent hover:bg-surface-hover hover:text-text-primary'
              : 'border-border-subtlest-tertiary bg-background-default hover:border-border-subtlest-secondary hover:text-text-primary',
          )}
        >
          <SidebarArrowLeft
            size={IconSize.XSmall}
            className={classNames(!expanded && 'rotate-180')}
          />
        </button>
      </div>

      <section
        id="sidebar-context-panel"
        role="tabpanel"
        aria-label={`${panelTitle ?? 'Explore'} navigation`}
        className={classNames(
          'relative flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[opacity,width] duration-300',
          isOpen ? 'w-60 opacity-100' : 'pointer-events-none w-0 opacity-0',
        )}
      >
        <div className="flex min-h-0 w-60 flex-1 flex-col">
          <div className="pl-5 pr-3 pt-6">
            <div className="flex h-10 items-center gap-1">
              <Typography bold type={TypographyType.Callout}>
                {panelTitle ?? 'Explore'}
              </Typography>
            </div>
          </div>
          <div className="mt-1 flex min-h-0 flex-1 flex-col overflow-y-auto">
            <nav className="flex flex-col pb-3 !pt-0">{panel}</nav>
          </div>
        </div>
      </section>
    </aside>
  );
};

/* ------------------------------------------------------------ panels */

/** A v2 panel row: the real NavItem + ItemInner around a plain anchor. */
export const PanelRow = ({
  item,
  active = false,
}: {
  item: SidebarMenuItem;
  active?: boolean;
}): ReactElement => (
  <NavItem active={active} className="mx-3 rounded-10">
    <a
      href={item.path ?? '#'}
      onClick={(event) => event.preventDefault()}
      className={navBtnClass}
      title={
        item.requiresLogin ? `${item.title} (asks you to log in)` : undefined
      }
    >
      <ItemInner item={item} shouldShowLabel active={active} />
    </a>
  </NavItem>
);

export const PanelList = ({
  items,
  activeTitle,
}: {
  items: SidebarMenuItem[];
  activeTitle?: string;
}): ReactElement => (
  <ul className="group/section mt-1 flex flex-col">
    {items.map((item) =>
      item.isSeparator ? (
        <li
          key={item.title}
          aria-hidden
          className="mx-3 my-2 h-px !border-border-subtlest-quaternary bg-border-subtlest-quaternary"
        />
      ) : (
        <PanelRow
          key={item.title}
          item={item}
          active={item.title === activeTitle}
        />
      ),
    )}
  </ul>
);

const listIcon =
  (Icon: typeof HomeIcon) =>
  (active: boolean): ReactElement =>
    <Icon secondary={active} className="pointer-events-none h-5 w-5" />;

/** ExploreSection: DiscoverSection's rows, then Recent (empty for a visitor). */
export const exploreItems: SidebarMenuItem[] = [
  { icon: listIcon(CompassIcon), title: 'Explore', path: '/posts' },
  {
    icon: listIcon(MegaphoneIcon),
    title: 'Happening Now',
    path: '/highlights',
  },
  { icon: listIcon(HashtagIcon), title: 'Tags', path: '/tags' },
  { icon: listIcon(EarthIcon), title: 'Sources', path: '/sources' },
  { icon: listIcon(AppIcon), title: 'Marketplace', path: '/marketplace' },
  { icon: listIcon(MedalIcon), title: 'Leaderboard', path: '/users' },
];

/** NetworkSection for a visitor: Find Squads and New Squad (→ login). */
export const squadsItems: SidebarMenuItem[] = [
  {
    icon: listIcon(SourceIcon),
    title: 'Find Squads',
    path: '/squads/discover',
  },
  {
    icon: () => <PlusIcon className="pointer-events-none h-5 w-5" />,
    title: 'New Squad',
    requiresLogin: true,
  },
];

/* ------------------------------------------------------ strips & banners */

/**
 * The proposed sign-in strip: SignInStrip (shared, webapp only), the copy
 * and buttons of the extension's former ExtensionSignInStrip (replaced on the
 * extension by #7035's hijacking cover and feed-header CTAs).
 * Sticky at the top of the window, above the card, so Log in and Sign up
 * stay reachable while the page scrolls, as the fixed header's did.
 */
export const SignInStrip = ({
  className,
  compact = false,
}: {
  className?: string;
  /** The narrower copy for a 1024 laptop. */
  compact?: boolean;
}): ReactElement => (
  <section
    aria-label="Sign in to daily.dev"
    className={classNames(
      // Sticks under whatever fixed chrome the layout has above it: nothing,
      // or the 2rem promotional banner (MainLayout's --sticky-header-offset).
      'sticky top-[var(--sticky-header-offset,0px)] z-3 mx-4 mb-3 laptop:mx-0',
      className,
    )}
  >
    <div className="flex items-center justify-between gap-4 rounded-12 border border-border-subtlest-quaternary bg-background-default px-6 py-4">
      <Typography
        type={TypographyType.Body}
        bold
        className="min-w-0 flex-1 text-text-primary"
      >
        {compact
          ? 'Sign in to personalize your feed.'
          : 'Sign in to personalize your feed and save what matters.'}
      </Typography>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<PhoneIcon />}
          aria-label="Get the daily.dev mobile app"
          className="hidden laptopL:flex"
        >
          Get the app
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
        >
          Log in
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
        >
          Sign up
        </Button>
      </div>
    </div>
  </section>
);

// GeoPersonalizedBanner names the visitor's country; the story shows the
// one the team sees.
const BANNER_COUNTRY = 'Israel';

/**
 * PublicPageSignupBanner (laptop only): the bottom banner the public pages
 * pin to the window. Since #7017 it starts beside the rail (`left-16` at
 * the compact density); before, it ran the full width under the sidebar.
 */
export const SignupBanner = ({
  beside = 'rail',
}: {
  beside?: 'rail' | 'none';
}): ReactElement => (
  <>
    <div aria-hidden className="hidden h-72 laptop:block" />
    <BottomBannerContainer
      className={classNames(
        'hidden min-h-[17.75rem] items-center border-t border-accent-cabbage-default px-10 py-4 pe-[388px] shadow-3 laptop:flex laptopXL:pe-10',
        beside === 'rail' && 'laptop:left-16 laptop:w-[calc(100%-4rem)]',
        authGradientBg,
      )}
    >
      <Image
        className="absolute left-0 top-0 -z-1 h-full w-full"
        src={cloudinaryAuthBannerBackground}
        srcSet={`${cloudinaryAuthBannerBackground1440w} 1440w, ${cloudinaryAuthBannerBackground1920w} 1920w, ${cloudinaryAuthBannerBackground} 2880w`}
        sizes="(max-width: 1440px) 100vw, (max-width: 1920px) 1920px, 100vw"
      />
      <div className="flex w-full max-w-3xl flex-col items-start text-start laptopXL:items-center laptopXL:text-center">
        <OnboardingHeadline
          className={authBannerHeadlineClassName}
          title={`daily.dev is the fastest growing developer platform in ${BANNER_COUNTRY}!`}
          description="We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)"
        />
        <div className="mt-4 flex w-full max-w-[32rem] flex-col gap-4">
          <div className="flex flex-row gap-4">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              className="flex-1"
              icon={<GoogleIcon secondary className="socialIcon" />}
            >
              Continue with Google
            </Button>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Large}
              className="flex-1 !text-text-primary"
              icon={<GitHubIcon className="socialIcon" />}
            >
              Continue with GitHub
            </Button>
          </div>
          <p className="text-text-tertiary typo-callout laptopXL:text-center">
            <span className="underline underline-offset-4">
              Continue with email
            </span>
            {' · '}Already have an account?{' '}
            <span className="text-text-primary underline underline-offset-4">
              Log in
            </span>
          </p>
        </div>
      </div>
    </BottomBannerContainer>
  </>
);

/** The 2rem promotional banner (useBanner) pinned above everything. */
const promoBanner: Banner = {
  timestamp: '2026-10-25T00:00:00.000Z',
  title: 'daily.dev Plus is 30% off this week.',
  subtitle: 'The sale ends Sunday.',
  cta: 'Get Plus',
  url: 'https://app.daily.dev/plus',
  theme: Theme.Cabbage,
};

/**
 * The real PromotionalBanner view (useBanner's 2rem strip): on laptop it is
 * fixed at the top at z-header, and MainLayout drops the rail
 * (--safe-area-top-offset), the content (pt-8) and every sticky offset
 * (--sticky-header-offset) by the same 2rem.
 */
export const PromoBanner = (): ReactElement => (
  <PromotionalBannerView banner={promoBanner} />
);

/* ------------------------------------------------------------ page strip */

/** MainFeedLayout's v2 page header: the Explore sort pills. */
export const ExploreStrip = ({
  active = 'Popular',
}: {
  active?: string;
}): ReactElement => (
  <header className={classNames(pageHeaderClassName, '!py-0')}>
    <div className="flex w-full min-w-0 items-center gap-2">
      <nav
        aria-label="Explore sort"
        className="relative flex min-w-0 flex-1 flex-row flex-nowrap gap-2"
      >
        <ul className="no-scrollbar relative flex flex-1 flex-row flex-nowrap gap-2 overflow-x-auto">
          {['Popular', 'By upvotes', 'By comments', 'By date', 'Best of'].map(
            (label) => {
              const isActive = label === active;
              return (
                <li
                  key={label}
                  className={classNames(
                    'relative py-3',
                    'after:absolute after:bottom-0 after:left-0 after:right-0 after:mx-auto after:w-1/2 after:border-b-2',
                    { 'after:hidden': !isActive },
                  )}
                >
                  <Button
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    size={ButtonSize.Small}
                    pressed={isActive}
                    variant={
                      isActive ? ButtonVariant.Float : ButtonVariant.Tertiary
                    }
                    className="capitalize"
                  >
                    {label}
                  </Button>
                </li>
              );
            },
          )}
        </ul>
      </nav>
    </div>
  </header>
);

/**
 * FeedExploreHeader on v1: the underlined TabContainer that sat under the
 * header, sticky at `tablet:top-[4.5rem]`.
 */
export const V1ExploreTabs = ({
  active = 'Popular',
}: {
  active?: string;
}): ReactElement => (
  <div className="z-header mx-auto flex w-full flex-col border-b border-border-subtlest-tertiary bg-background-default px-6 tablet:sticky tablet:top-[4.5rem]">
    <div className="flex flex-row items-center">
      <ul className="flex flex-row gap-4">
        {['Popular', 'By upvotes', 'By comments', 'By date', 'Best of'].map(
          (label) => {
            const isActive = label === active;
            return (
              <li key={label} className="relative">
                <button
                  type="button"
                  className={classNames(
                    'px-1 py-3 typo-callout',
                    isActive
                      ? 'font-bold text-text-primary'
                      : 'text-text-tertiary',
                  )}
                >
                  {label}
                </button>
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-4 bg-text-primary" />
                )}
              </li>
            );
          },
        )}
      </ul>
    </div>
  </div>
);

/* ---------------------------------------------------------------- shell */

export interface LaptopShellProps {
  version: Version;
  audience?: Audience;
  selected?: RailProps['selected'];
  previewing?: RailTabId;
  expanded?: boolean;
  /** The collapsed rail peeking its panel open on hover (an overlay). */
  peek?: boolean;
  panel?: ReactNode;
  panelTitle?: string;
  /** The bottom signup banner the public pages carry (explore, directories). */
  signupBanner?: boolean;
  /** The 2rem promotional banner. */
  promo?: boolean;
  /** Proposed only: hide the sign-in strip (the rail-only alternative). */
  strip?: boolean;
  compactStrip?: boolean;
  /** Something floating over the page. */
  overlay?: ReactNode;
  children: ReactNode;
}

/**
 * MainLayout on a laptop for one version and audience. Everything a visitor
 * sees is a function of `sidebarOwnsHeader`: before and today it is false
 * for them (header + bare <main>), proposed it is true (rail + card), as it
 * is for a member in every version.
 */
export const LaptopShell = ({
  version,
  audience = 'anonymous',
  selected,
  previewing,
  expanded,
  peek = false,
  panel,
  panelTitle,
  signupBanner = false,
  promo = false,
  strip = true,
  compactStrip = false,
  overlay,
  children,
}: LaptopShellProps): ReactElement => {
  const isMember = audience === 'member';
  const railOwnsHeader = isMember || version === 'proposed';

  if (version === 'before' && !isMember) {
    return (
      <div className="shell-layout min-h-screen bg-background-default text-text-primary antialiased">
        {promo && <PromoBanner />}
        <GlobalHeader audience="anonymous" hasBanner={promo} />
        <V1Sidebar
          active={selected === 'squads' ? 'Squads' : 'Explore'}
          hasBanner={promo}
        />
        <main
          className={classNames(
            'flex flex-col tablet:pl-16 laptop:pl-11 laptop:pt-16',
            promo && 'laptop:pt-24',
          )}
        >
          {children}
          {signupBanner && <SignupBanner beside="none" />}
        </main>
        {overlay}
      </div>
    );
  }

  if (!railOwnsHeader) {
    return (
      <div className="shell-layout min-h-screen bg-background-default text-text-primary antialiased laptop:bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]">
        {promo && <PromoBanner />}
        <GlobalHeader audience="anonymous" hasBanner={promo} />
        <Rail
          version="today"
          audience="anonymous"
          selected={selected}
          previewing={previewing}
          expanded={expanded}
          peek={peek}
          panel={panel}
          panelTitle={panelTitle}
          bannerOffset={promo}
        />
        <main
          className={classNames(
            'flex flex-col tablet:pl-16 laptop:pl-16 laptop:pt-16',
            promo && 'laptop:pt-24',
            expanded && 'laptop:!pl-[19rem]',
          )}
        >
          {children}
          {signupBanner && <SignupBanner />}
        </main>
        {overlay}
      </div>
    );
  }

  return (
    <div className="shell-layout min-h-screen bg-background-default text-text-primary antialiased laptop:bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]">
      {promo && <PromoBanner />}
      <Rail
        version={isMember ? 'today' : 'proposed'}
        audience={audience}
        selected={selected}
        previewing={previewing}
        expanded={expanded}
        peek={peek}
        panel={panel}
        panelTitle={panelTitle}
        bannerOffset={promo}
      />
      <main
        className={classNames(
          'flex flex-col tablet:pl-16 laptop:pl-16',
          promo && 'laptop:pt-8',

          // What a sticky descendant (the sign-in strip) pins under.

          promo
            ? 'laptop:[--sticky-header-offset:2rem]'
            : 'laptop:[--sticky-header-offset:0rem]',
          expanded && 'laptop:!pl-[19rem]',
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col laptop:my-3 laptop:ml-1 laptop:mr-3">
          {!isMember && strip && <SignInStrip compact={compactStrip} />}
          <div
            className={classNames(
              LAYOUT_FRAME_CLASS,
              'relative flex min-h-0 flex-1 flex-col',
              'laptop:overflow-clip laptop:rounded-24 laptop:border laptop:border-border-subtlest-quaternary laptop:bg-background-default laptop:p-0.5',
              promo
                ? 'laptop:min-h-[calc(100vh-3.5rem)]'
                : 'laptop:min-h-[calc(100vh-1.5rem)]',
            )}
          >
            {children}
            {signupBanner && <SignupBanner />}
          </div>
        </div>
      </main>
      {overlay}
    </div>
  );
};
