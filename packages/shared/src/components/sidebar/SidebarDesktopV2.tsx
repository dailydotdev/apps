import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import {
  Nav,
  railTabClass,
  railTabLabelClass,
  SidebarAside,
  SidebarScrollWrapper,
} from './common';
import { getSidebarCategoryForPath, SidebarCategory } from './sidebarCategory';
import type { SidebarCategoryId } from './sidebarCategory';
import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useBanner } from '../../hooks/useBanner';
import { MainSection } from './sections/MainSection';
import { PinnedSection } from './sections/PinnedSection';
import { RecentSection } from './sections/RecentSection';
import { CustomFeedSection } from './sections/CustomFeedSection';
import { ProfileSection } from './sections/ProfileSection';
import { SidebarProfileCompletion } from './SidebarProfileCompletion';
import { SettingsPanelSection } from './sections/SettingsPanelSection';
import { CreatePostButton } from '../post/write';
import { QuestRailIcon } from '../quest/QuestRailIcon';
import { useClaimableQuestCount } from '../../hooks/useQuestDashboard';
import { Bubble } from '../tooltips/utils';
import { ButtonSize } from '../buttons/Button';
import { BookmarkSection } from './sections/BookmarkSection';
import { NetworkSection } from './sections/NetworkSection';
import { GameCenterSection } from './sections/GameCenterSection';
import { HelpWidget } from '../help/HelpWidget';
import {
  AnalyticsIcon,
  BellIcon,
  BookmarkIcon,
  DevCardIcon,
  FeedbackIcon,
  HomeIcon,
  JobIcon,
  MenuIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SidebarArrowLeft,
  SourceIcon,
  SunIcon,
  UserIcon,
} from '../icons';
import { ThemeAutoIcon } from '../icons/ThemeAuto';
import { useSquadNavigation } from '../../hooks';
import { useSettingsBooleanFlag } from '../../hooks/useSettingsBooleanFlag';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { RailHoverPanel } from './RailHoverPanel';
import { useSpotlight } from '../spotlight/SpotlightContext';
import { useAuthContext } from '../../contexts/AuthContext';
import NotificationsBell from '../notifications/NotificationsBell';
import { NotificationsRailPanel } from '../notifications/NotificationsRailPanel';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { SidebarRailStats } from './SidebarRailStats';
import Link from '../utilities/Link';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { isAppleDevice } from '../../lib/func';
import LogoIcon from '../../svg/LogoIcon';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { ResourceSection } from '../ProfileMenu/sections/ResourceSection';
import { ProfileMenuFooter } from '../ProfileMenu/ProfileMenuFooter';
import { ProfileSection as ProfileMenuSection } from '../ProfileMenu/ProfileSection';
import type { ProfileSectionItemProps } from '../ProfileMenu/ProfileSectionItem';
import { FeedbackWidget } from '../feedback';
import { HorizontalSeparator } from '../utilities';
import { Typography, TypographyType } from '../typography/Typography';

type SidebarCategoryConfig = {
  id: SidebarCategoryId;
  label: string;
  icon: (active: boolean) => ReactElement;
  defaultPath?: string;
};

const sidebarCategories: SidebarCategoryConfig[] = [
  {
    id: SidebarCategory.Main,
    label: 'Home',
    defaultPath: webappUrl,
    icon: (active) => (
      <HomeIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarCategory.Squads,
    label: 'Squads',
    defaultPath: `${webappUrl}squads/discover`,
    icon: (active) => (
      <SourceIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarCategory.GameCenter,
    label: 'Quests',
    // First sub-page in the Game Center category is the Daily quests
    // page (the panel that used to live in the sidebar). Clicking the
    // rail icon lands you there; Game Center proper is one click away
    // via the hover panel.
    defaultPath: `${webappUrl}daily-quests`,
    icon: (active) => <QuestRailIcon active={active} />,
  },
  {
    id: SidebarCategory.Saved,
    label: 'Saved',
    defaultPath: `${webappUrl}bookmarks`,
    icon: (active) => (
      <BookmarkIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarCategory.Profile,
    label: 'Profile',
    icon: (active) => (
      <UserIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
];

const railButtonClass =
  'flex h-10 w-full items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus-outline';
const shortcutKeys = [isAppleDevice() ? '⌘' : 'Ctrl', 'K'];
const settingsDefaultPath = `${settingsUrl}/profile`;

const RAIL_HOVER_OPEN_DELAY = 300;
const RAIL_HOVER_CLOSE_DELAY = 120;
const RAIL_HOVER_SIDE_OFFSET = 12;
// The shared Tooltip primitive bakes in `collisionPadding={{ top: 75 }}` —
// a leftover from the global-header layout. With the dual-sidebar there's
// no top chrome to clip against, so a snug override re-centers tooltips
// with their triggers.
const RAIL_TOOLTIP_COLLISION_PADDING = 4;

interface RailHoverCardProps {
  label: string;
  children: ReactNode;
  panel: ReactElement;
  enabled?: boolean;
  alignOffset?: number;
}

const RailHoverCard = ({
  label,
  children,
  panel,
  enabled = true,
  alignOffset,
}: RailHoverCardProps) => {
  // Controlled open + suppression flag: after a click on the trigger we
  // close the panel and block reopens until the pointer actually leaves
  // the trigger. Otherwise Radix's openDelay timer re-fires while the
  // cursor still rests on the just-clicked item and the panel pops back
  // up after navigation.
  const [open, setOpen] = useState(false);
  const suppressOpenRef = useRef(false);

  const handleOpenChange = useCallback((next: boolean) => {
    if (next && suppressOpenRef.current) {
      return;
    }
    setOpen(next);
  }, []);

  const handleTriggerClick = useCallback(() => {
    suppressOpenRef.current = true;
    setOpen(false);
  }, []);

  const handleTriggerPointerLeave = useCallback(() => {
    suppressOpenRef.current = false;
  }, []);

  if (!enabled) {
    return <>{children}</>;
  }
  return (
    <HoverCardPrimitive.Root
      openDelay={RAIL_HOVER_OPEN_DELAY}
      closeDelay={RAIL_HOVER_CLOSE_DELAY}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <HoverCardPrimitive.Trigger
        asChild
        onClick={handleTriggerClick}
        onPointerLeave={handleTriggerPointerLeave}
      >
        {children}
      </HoverCardPrimitive.Trigger>
      <HoverCardPrimitive.Portal>
        <HoverCardPrimitive.Content
          side="right"
          align="start"
          alignOffset={alignOffset}
          sideOffset={RAIL_HOVER_SIDE_OFFSET}
          collisionPadding={12}
          className="z-tooltip"
        >
          <RailHoverPanel title={label}>{panel}</RailHoverPanel>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Portal>
    </HoverCardPrimitive.Root>
  );
};

const themeIconMap: Record<
  ThemeMode,
  React.ComponentType<{
    secondary?: boolean;
    size?: IconSize;
    'aria-hidden'?: boolean;
  }>
> = {
  [ThemeMode.Dark]: MoonIcon,
  [ThemeMode.Light]: SunIcon,
  [ThemeMode.Auto]: ThemeAutoIcon,
};

const SidebarThemeButton = (): ReactElement => {
  const { setTheme, themeMode } = useSettingsContext();
  const { logEvent } = useLogContext();
  const isDark = themeMode === ThemeMode.Dark;
  const nextMode = isDark ? ThemeMode.Light : ThemeMode.Dark;
  const ActiveIcon = themeIconMap[themeMode];

  const onToggleTheme = useCallback(() => {
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.Theme,
      target_id: nextMode,
    });
    setTheme(nextMode);
  }, [logEvent, nextMode, setTheme]);

  return (
    <Tooltip
      side="right"
      content={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <button
        type="button"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={railButtonClass}
        onClick={onToggleTheme}
      >
        <ActiveIcon size={IconSize.Small} aria-hidden />
      </button>
    </Tooltip>
  );
};

const SidebarSupportButton = (): ReactElement => {
  const { isOpen, onUpdate, wrapHandler } = useInteractivePopup();

  return (
    <>
      <Tooltip side="right" content="Support">
        <button
          type="button"
          aria-label="Support"
          aria-expanded={isOpen}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
          className={classNames(
            railButtonClass,
            isOpen && 'bg-background-default !text-text-primary',
          )}
        >
          <FeedbackIcon secondary={isOpen} size={IconSize.Small} aria-hidden />
        </button>
      </Tooltip>
      {isOpen && (
        <InteractivePopup
          closeOutsideClick
          onClose={() => onUpdate(false)}
          position={InteractivePopupPosition.SidebarSupportMenu}
          className="flex w-64 flex-col gap-2 !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
        >
          <FeedbackWidget placement="support" />
          <ResourceSection />
          <HorizontalSeparator />
          <ProfileMenuFooter />
        </InteractivePopup>
      )}
    </>
  );
};

// Slack-style profile menu anchored to the bottom rail avatar. Replaces the
// old Profile sidebar panel. Cores wallet is intentionally omitted — the
// rail stats cluster already links there.
const SidebarProfileButton = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { isOpen, onUpdate, wrapHandler } = useInteractivePopup();

  if (!user) {
    return null;
  }

  const items: ProfileSectionItemProps[] = [
    {
      title: 'Your profile',
      href: `${webappUrl}${user.username}`,
      icon: UserIcon,
    },
    { title: 'Analytics', href: `${webappUrl}analytics`, icon: AnalyticsIcon },
    { title: 'Jobs', href: `${webappUrl}jobs`, icon: JobIcon },
    { title: 'Settings', href: settingsDefaultPath, icon: SettingsIcon },
    {
      title: 'DevCard',
      href: `${settingsUrl}/customization/devcard`,
      icon: DevCardIcon,
    },
  ];

  return (
    <>
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        onClick={wrapHandler(() => onUpdate(!isOpen))}
        className={classNames(
          'focus-outline flex w-full items-center justify-center rounded-12 py-2 transition-colors hover:bg-surface-hover',
          isOpen && 'bg-surface-hover',
        )}
      >
        <ProfilePicture
          user={user}
          size={ProfileImageSize.Medium}
          nativeLazyLoading
        />
      </button>
      {isOpen && (
        <InteractivePopup
          closeOutsideClick
          onClose={() => onUpdate(false)}
          position={InteractivePopupPosition.SidebarProfileMenu}
          className="flex w-60 flex-col !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-2"
        >
          <ProfileMenuSection items={items} />
        </InteractivePopup>
      )}
    </>
  );
};

type SidebarDesktopV2Props = {
  activePage?: string;
  featureTheme?: {
    logo?: string;
    logoText?: string;
  };
  isNavButtons?: boolean;
  showFeedbackWidget?: boolean;
  onNavTabClick?: (tab: string) => void;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  additionalButtons?: ReactNode;
};

export const SidebarDesktopV2 = ({
  activePage: activePageProp,
  featureTheme,
  isNavButtons,
  showFeedbackWidget,
  onNavTabClick,
  onLogoClick,
  additionalButtons,
}: SidebarDesktopV2Props): ReactElement => {
  const router = useRouter();
  const {
    sidebarExpanded,
    toggleSidebarExpanded,
    loadedSettings,
    optOutQuestSystem,
  } = useSettingsContext();
  const { logEvent } = useLogContext();
  const { isAvailable: isBannerAvailable } = useBanner();
  const { open: openSpotlight } = useSpotlight();
  const { openNewSquad } = useSquadNavigation();
  const { isLoggedIn, user } = useAuthContext();
  const { value: isCompact } = useSettingsBooleanFlag('sidebarCompact');
  // Compact mode reverts to the original icon-only widths (pre-label rail).
  // Both width sets are known-good; MainLayout mirrors the collapsed/expanded
  // padding so the content never overlaps the rail.
  const railCollapsedWidth = isCompact ? 'laptop:w-16' : 'laptop:w-20';
  const railExpandedWidth = isCompact ? 'laptop:w-[19rem]' : 'laptop:w-[20rem]';
  const railNavWidth = isCompact ? 'w-16' : 'w-20';
  const railSeparatorLeft = isCompact ? 'left-16' : 'left-20';
  const railToggleClosedLeft = isCompact ? 'left-[3.5rem]' : 'left-[4.5rem]';
  const railToggleOpenLeft = isCompact ? 'left-[16.5rem]' : 'left-[17.5rem]';
  const claimableQuestCount = useClaimableQuestCount();
  const showQuestBadge = !optOutQuestSystem && claimableQuestCount > 0;

  // --- Vertical "More" overflow -------------------------------------------
  // When the rail is too short to fit every nav item, the lowest-priority
  // items fold into the Settings button, which becomes a 3-dots "More"
  // dropdown. Fold order: Saved, then Quests, then Alerts. Home, Squads and
  // New post always stay. Measured against the nav list's height so it tracks
  // the viewport like Slack's sidebar.
  const navListRef = useRef<HTMLDivElement>(null);
  const [maxNavSlots, setMaxNavSlots] = useState(Number.POSITIVE_INFINITY);
  useEffect(() => {
    const list = navListRef.current;
    if (!list || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const GAP = 4;
    const itemHeight = isCompact ? 44 : 56;
    const measure = () => {
      const slots = Math.floor((list.clientHeight + GAP) / (itemHeight + GAP));
      setMaxNavSlots(Math.max(0, slots));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [isCompact]);

  const overflowOrder = useMemo(
    () =>
      [
        isLoggedIn ? SidebarCategory.Notifications : null,
        SidebarCategory.GameCenter,
        SidebarCategory.Saved,
      ].filter(Boolean) as SidebarCategoryId[],
    [isLoggedIn],
  );
  // Home, Squads and (logged-in) New post never fold. The 3-dots "More"
  // button only appears when something overflows, so it costs a slot then.
  const fixedNavSlots = 2 + (isLoggedIn ? 1 : 0);
  const isNavOverflowing = maxNavSlots < fixedNavSlots + overflowOrder.length;
  const visibleOverflowCount = isNavOverflowing
    ? Math.max(
        0,
        Math.min(overflowOrder.length, maxNavSlots - fixedNavSlots - 1),
      )
    : overflowOrder.length;
  const foldedNavIds = overflowOrder.slice(visibleOverflowCount);
  const activePage = activePageProp || router.asPath || router.pathname || '';
  const isFeedPage = activePage.includes('/feeds/');

  const resolvedCategory = useMemo((): SidebarCategoryId => {
    if (isFeedPage) {
      return SidebarCategory.Main;
    }
    return getSidebarCategoryForPath(activePage);
  }, [activePage, isFeedPage]);

  // Optimistic override so a rail click feels instant even when
  // router.push is async. Cleared once the URL catches up.
  const [pendingCategory, setPendingCategory] =
    useState<SidebarCategoryId | null>(null);
  const selectedCategory = pendingCategory ?? resolvedCategory;

  useEffect(() => {
    if (pendingCategory !== null && pendingCategory === resolvedCategory) {
      setPendingCategory(null);
    }
  }, [pendingCategory, resolvedCategory]);

  // Settings load client-side, so on a hard refresh `sidebarExpanded`
  // flips from its `false` default to the user's stored value once
  // `loadedSettings` resolves. The width/opacity transitions below would
  // animate that initial settle, making the sidebar appear to slide/fade
  // in. Keep transitions off until settings have loaded so the sidebar
  // snaps into its final state on first paint and only genuine user
  // toggles animate afterwards.
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);
  useEffect(() => {
    if (loadedSettings) {
      setTransitionsEnabled(true);
    }
  }, [loadedSettings]);
  const suppressTransition = transitionsEnabled
    ? undefined
    : '!transition-none';

  // Escape resets the pinned panel back to Main so the keyboard story
  // mirrors the click model — Tab+Enter opens a panel, Escape backs out.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPendingCategory(SidebarCategory.Main);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded: true,
      shouldShowLabel: true,
      activePage,
    }),
    [activePage],
  );

  const getCategoryDefaultPath = useCallback(
    (category: SidebarCategoryId): string | null => {
      if (category === SidebarCategory.Profile) {
        return user?.username ? `${webappUrl}${user.username}` : null;
      }
      if (category === SidebarCategory.Settings) {
        return settingsDefaultPath;
      }
      return (
        sidebarCategories.find((entry) => entry.id === category)?.defaultPath ??
        null
      );
    },
    [user?.username],
  );

  const onSelectCategory = useCallback(
    (category: SidebarCategoryId) => {
      setPendingCategory(category);

      // Click navigates to the category's first sub-page (its
      // `defaultPath`) — it no longer auto-expands the sidebar. The
      // sidebar's open/closed state is controlled solely by the user
      // via the dedicated toggle button.
      const targetPath = getCategoryDefaultPath(category);
      if (!targetPath) {
        return;
      }
      const targetPathname = new URL(targetPath, 'http://_').pathname;
      const currentPathname = activePage.split('?')[0];
      if (targetPathname !== currentPathname) {
        // `Promise.resolve` wraps the call so `.catch` still works when
        // the next/router test mock returns `undefined` from `push`.
        Promise.resolve(router.push(targetPath)).catch(() => undefined);
      }
    },
    [activePage, getCategoryDefaultPath, router],
  );

  const onPrefetchCategory = useCallback(
    (category: SidebarCategoryId) => {
      const targetPath = getCategoryDefaultPath(category);
      if (!targetPath) {
        return;
      }
      router.prefetch(targetPath).catch(() => undefined);
    },
    [getCategoryDefaultPath, router],
  );

  const onToggleExpanded = useCallback(() => {
    logEvent({
      event_name: `${sidebarExpanded ? 'open' : 'close'} sidebar`,
    });
    toggleSidebarExpanded();
  }, [logEvent, sidebarExpanded, toggleSidebarExpanded]);

  const renderCategorySection = (category: SidebarCategoryId): ReactElement => {
    if (category === SidebarCategory.Squads) {
      return (
        <NetworkSection
          {...defaultRenderSectionProps}
          isItemsButton={isNavButtons ?? false}
        />
      );
    }
    if (category === SidebarCategory.Saved) {
      return (
        <BookmarkSection {...defaultRenderSectionProps} isItemsButton={false} />
      );
    }
    if (category === SidebarCategory.Settings) {
      return (
        <SettingsPanelSection
          {...defaultRenderSectionProps}
          isItemsButton={false}
        />
      );
    }
    if (category === SidebarCategory.Notifications) {
      return <NotificationsRailPanel />;
    }
    if (category === SidebarCategory.GameCenter) {
      return (
        <GameCenterSection
          {...defaultRenderSectionProps}
          isItemsButton={false}
        />
      );
    }
    if (category === SidebarCategory.Profile) {
      return (
        <>
          <div className="px-3 pb-2">
            <SidebarProfileCompletion />
          </div>
          <ProfileSection
            {...defaultRenderSectionProps}
            isItemsButton={false}
          />
        </>
      );
    }

    return (
      <>
        <MainSection
          {...defaultRenderSectionProps}
          onNavTabClick={onNavTabClick}
          isItemsButton={isNavButtons ?? false}
        />
        <PinnedSection {...defaultRenderSectionProps} isItemsButton={false} />
        <RecentSection {...defaultRenderSectionProps} isItemsButton={false} />
        <CustomFeedSection
          {...defaultRenderSectionProps}
          onNavTabClick={onNavTabClick}
          title="Feeds"
          isItemsButton={false}
        />
      </>
    );
  };

  // Settings pages render their navigation only inside this context panel, so
  // a collapsed sidebar would leave no way to move between settings sections.
  // Force the panel open and hide the collapse toggle while on settings —
  // without touching the user's stored `sidebarExpanded` preference, so the
  // sidebar returns to its chosen state once they navigate away.
  const isSettingsSelected = selectedCategory === SidebarCategory.Settings;
  const forceExpanded = isSettingsSelected;
  const isExpanded = sidebarExpanded || forceExpanded;

  const renderCategoryTab = (
    categoryId: SidebarCategoryId,
  ): ReactElement | null => {
    const category = sidebarCategories.find((entry) => entry.id === categoryId);
    if (!category) {
      return null;
    }
    const isSelected = selectedCategory === category.id;
    return (
      <RailHoverCard
        label={category.label}
        panel={renderCategorySection(category.id)}
        enabled={!isExpanded}
      >
        <button
          type="button"
          role="tab"
          id={`sidebar-category-${category.id}`}
          aria-controls="sidebar-context-panel"
          aria-label={category.label}
          aria-selected={isSelected}
          onClick={() => onSelectCategory(category.id)}
          onMouseEnter={() => onPrefetchCategory(category.id)}
          onFocus={() => onPrefetchCategory(category.id)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setPendingCategory(SidebarCategory.Main);
            }
          }}
          className={classNames(
            railTabClass,
            isSelected && 'bg-background-default !text-text-primary',
          )}
        >
          <span className="relative flex items-center justify-center">
            {category.icon(isSelected)}
            {category.id === SidebarCategory.GameCenter && showQuestBadge && (
              // The quest level ring fills the full icon box, so straddle the
              // badge over the top-right corner to keep the ring + level
              // number visible underneath.
              <Bubble className="right-0 top-0 -translate-y-1/2 translate-x-1/2 px-1">
                {claimableQuestCount}
              </Bubble>
            )}
          </span>
          {!isCompact && (
            <span className={railTabLabelClass}>{category.label}</span>
          )}
        </button>
      </RailHoverCard>
    );
  };

  const renderMorePanel = (): ReactElement => {
    const rows = foldedNavIds.map((id) => {
      if (id === SidebarCategory.Notifications) {
        return {
          key: id as string,
          label: 'Notifications',
          href: `${webappUrl}notifications`,
          icon: <BellIcon size={IconSize.Small} aria-hidden />,
        };
      }
      const category = sidebarCategories.find((entry) => entry.id === id);
      return {
        key: id as string,
        label: category?.label ?? '',
        href: category?.defaultPath ?? webappUrl,
        icon: category?.icon(false) ?? null,
      };
    });
    return (
      <div className="flex flex-col gap-0.5 p-2">
        {rows.map((row) => (
          <Link key={row.key} href={row.href} passHref>
            <a className="focus-outline flex items-center gap-3 rounded-10 px-3 py-2 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary">
              <span className="flex size-5 items-center justify-center">
                {row.icon}
              </span>
              <Typography type={TypographyType.Callout}>{row.label}</Typography>
            </a>
          </Link>
        ))}
      </div>
    );
  };

  const renderSelectedSection = (): ReactElement =>
    renderCategorySection(selectedCategory);

  const selectedLabel = sidebarCategories.find(
    (category) => category.id === selectedCategory,
  )?.label;
  const isNotificationsSelected =
    selectedCategory === SidebarCategory.Notifications;
  const isHomePanel = selectedCategory === SidebarCategory.Main;
  const isSquadsPanel = selectedCategory === SidebarCategory.Squads;
  const isUtilityPanelSelected = !isHomePanel;
  const utilityPanelTitle = (() => {
    if (isSettingsSelected) {
      return 'Settings';
    }
    if (isNotificationsSelected) {
      return 'Notifications';
    }
    return selectedLabel ?? '';
  })();

  return (
    <SidebarAside
      data-testid="sidebar-aside"
      className={classNames(
        'laptop:bottom-0 laptop:h-dvh laptop:min-h-dvh laptop:flex-row laptop:border-r-0 laptop:bg-transparent',
        isExpanded ? railExpandedWidth : railCollapsedWidth,
        isBannerAvailable
          ? 'laptop:[--safe-area-top-offset:2rem]'
          : 'laptop:[--safe-area-top-offset:0rem]',
        featureTheme && 'bg-transparent',
        suppressTransition,
      )}
    >
      {isExpanded && (
        <span
          aria-hidden
          className={classNames(
            'pointer-events-none absolute inset-y-0 hidden border-r border-border-subtlest-quaternary laptop:block',
            railSeparatorLeft,
          )}
        />
      )}
      <nav
        aria-label="Primary navigation"
        className={classNames(
          'flex h-dvh min-h-dvh shrink-0 flex-col items-center gap-1 px-1.5 pb-3 pt-6',
          railNavWidth,
        )}
      >
        <Tooltip
          side="right"
          content="Home"
          collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
        >
          <div>
            <Link href={webappUrl} passHref prefetch={false}>
              <a
                href={webappUrl}
                aria-label="Home"
                className="focus-outline hover:opacity-80 flex size-10 items-center justify-center rounded-12 text-text-primary transition-opacity"
                onClick={onLogoClick}
              >
                <LogoIcon className={{ container: 'h-5 w-auto' }} />
              </a>
            </Link>
          </div>
        </Tooltip>

        <Tooltip
          side="right"
          content="Search"
          collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
        >
          <button
            type="button"
            aria-label="Search"
            onClick={openSpotlight}
            className="focus-outline flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <SearchIcon size={IconSize.Small} aria-hidden />
          </button>
        </Tooltip>
        {!isCompact && (
          <div
            aria-hidden
            className="-mt-1 flex items-center gap-0.5 text-text-quaternary typo-caption2"
          >
            {shortcutKeys.map((key) => (
              <kbd key={key} className="font-sans">
                {key}
              </kbd>
            ))}
          </div>
        )}

        <div
          aria-hidden
          className="my-2 h-px w-6 bg-border-subtlest-quaternary"
        />

        <div
          ref={navListRef}
          role="tablist"
          aria-label="Sidebar categories"
          className="flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-hidden"
        >
          {renderCategoryTab(SidebarCategory.Main)}
          {renderCategoryTab(SidebarCategory.Squads)}

          {overflowOrder.slice(0, visibleOverflowCount).map((id) =>
            id === SidebarCategory.Notifications ? (
              <RailHoverCard
                key={id}
                label="Notifications"
                panel={<NotificationsRailPanel />}
                enabled={!isExpanded}
              >
                <div className="w-full">
                  <NotificationsBell
                    rail
                    noTooltip
                    railHideLabel={isCompact}
                    active={selectedCategory === SidebarCategory.Notifications}
                  />
                </div>
              </RailHoverCard>
            ) : (
              <React.Fragment key={id}>{renderCategoryTab(id)}</React.Fragment>
            ),
          )}

          {isLoggedIn && (
            <Tooltip
              side="right"
              content="New post"
              collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
            >
              <div>
                <CreatePostButton
                  compact
                  showIcon
                  size={ButtonSize.Small}
                  className="!size-9 !rounded-12 [&_svg]:!size-5"
                />
              </div>
            </Tooltip>
          )}

          {isNavOverflowing && (
            <RailHoverCard label="More" panel={renderMorePanel()}>
              <button
                type="button"
                aria-label="More"
                aria-haspopup="menu"
                className={railTabClass}
              >
                <span className="relative flex items-center justify-center">
                  <MenuIcon size={IconSize.Small} aria-hidden />
                </span>
                {!isCompact && <span className={railTabLabelClass}>More</span>}
              </button>
            </RailHoverCard>
          )}
        </div>

        <div className="mt-auto flex w-full flex-col items-center gap-2">
          <div
            role="tablist"
            aria-label="Sidebar utilities"
            className="flex w-full flex-col items-center gap-1"
          >
            <SidebarThemeButton />
            <SidebarSupportButton />
          </div>
          {isLoggedIn && (
            <div className="flex w-full flex-col items-stretch gap-1">
              <SidebarRailStats />
              <SidebarProfileButton />
            </div>
          )}
        </div>
      </nav>

      {/*
        Slide-between-anchors toggle button. Two positions:
        - Open (panel right edge): ghost, no border/bg/shadow
        - Closed (rail/panel boundary): bordered chip with shadow
        Same SidebarArrowLeft glyph, rotated 180° when closed.
        Hidden on settings pages, where the panel is force-expanded and
        collapsing it would hide the only settings navigation.
      */}
      {!forceExpanded && (
        <Tooltip
          side="right"
          content={sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
          collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
        >
          <div
            className={classNames(
              'absolute top-6 z-1 hidden h-10 items-center transition-[left] duration-300 ease-in-out laptop:flex',
              sidebarExpanded ? railToggleOpenLeft : railToggleClosedLeft,
              suppressTransition,
            )}
          >
            <button
              type="button"
              onClick={onToggleExpanded}
              aria-label={sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={sidebarExpanded}
              className={classNames(
                'focus-outline flex size-7 items-center justify-center rounded-10 border text-text-tertiary transition-[background-color,border-color,box-shadow,color] duration-300 ease-in-out',
                sidebarExpanded
                  ? 'border-transparent bg-transparent shadow-none hover:bg-surface-hover hover:text-text-primary'
                  : 'shadow-1 border-border-subtlest-tertiary bg-background-default hover:border-border-subtlest-secondary hover:text-text-primary',
                suppressTransition,
              )}
            >
              <SidebarArrowLeft
                size={IconSize.XSmall}
                aria-hidden
                className={classNames(
                  'transition-transform duration-300 ease-in-out',
                  !sidebarExpanded && 'rotate-180',
                  suppressTransition,
                )}
              />
            </button>
          </div>
        </Tooltip>
      )}

      <section
        id="sidebar-context-panel"
        role="tabpanel"
        aria-labelledby={`sidebar-category-${selectedCategory}`}
        aria-label={`${selectedLabel ?? 'Settings'} navigation`}
        className={classNames(
          'relative flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[opacity,width] duration-300',
          isExpanded ? 'w-60 opacity-100' : 'pointer-events-none w-0 opacity-0',
          suppressTransition,
        )}
      >
        <div className="pl-4 pr-3 pt-6">
          <div className="flex h-10 items-center justify-between gap-1">
            <Typography bold type={TypographyType.Callout}>
              {utilityPanelTitle}
            </Typography>
            {isSquadsPanel && (
              <Tooltip side="bottom" content="New Squad">
                <button
                  type="button"
                  onClick={() => openNewSquad({ origin: Origin.Sidebar })}
                  aria-label="New Squad"
                  className="focus-outline mr-9 flex size-7 shrink-0 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  <PlusIcon size={IconSize.XSmall} aria-hidden />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {isLoggedIn && !isUtilityPanelSelected && additionalButtons && (
          <div className="mt-2 flex items-center gap-1 px-3">
            {additionalButtons}
          </div>
        )}

        <SidebarScrollWrapper
          className={classNames(
            'min-h-0 flex-1',
            isUtilityPanelSelected ? 'mt-1' : 'mt-2',
            showFeedbackWidget && !isUtilityPanelSelected && 'pb-16',
          )}
        >
          <Nav className={isUtilityPanelSelected ? '!pb-2 !pt-0' : undefined}>
            {renderSelectedSection()}
          </Nav>
        </SidebarScrollWrapper>

        {!isUtilityPanelSelected && <HelpWidget sidebarExpanded />}
        {showFeedbackWidget && !isUtilityPanelSelected && (
          <div className="absolute inset-x-3 bottom-3">
            <FeedbackWidget placement="sidebar" />
          </div>
        )}
      </section>
    </SidebarAside>
  );
};
