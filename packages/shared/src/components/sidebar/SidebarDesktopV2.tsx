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
import { Nav, SidebarAside, SidebarScrollWrapper } from './common';
import { getSidebarCategoryForPath, SidebarCategory } from './sidebarCategory';
import type { SidebarCategoryId } from './sidebarCategory';
import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useBanner } from '../../hooks/useBanner';
import { MainSection } from './sections/MainSection';
import { CustomFeedSection } from './sections/CustomFeedSection';
import { DiscoverSection } from './sections/DiscoverSection';
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
import { SidebarAnnouncements } from './SidebarAnnouncements';
import {
  BookmarkIcon,
  FeedbackIcon,
  HomeIcon,
  HotIcon,
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
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { RailHoverPanel } from './RailHoverPanel';
import { useSpotlight } from '../spotlight/SpotlightContext';
import { useAuthContext } from '../../contexts/AuthContext';
import NotificationsBell from '../notifications/NotificationsBell';
import { NotificationsRailPanel } from '../notifications/NotificationsRailPanel';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { SidebarHeaderStats } from './SidebarHeaderStats';
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
    id: SidebarCategory.Discover,
    label: 'Discover',
    // Discover's first sub-page is the Explore feed (`/posts`); clicking
    // the rail icon should land you on that page, matching the submenu.
    defaultPath: `${webappUrl}posts`,
    icon: (active) => (
      <HotIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
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
    id: SidebarCategory.GameCenter,
    label: 'Game Center',
    // First sub-page in the Game Center category is the Daily quests
    // page (the panel that used to live in the sidebar). Clicking the
    // rail icon lands you there; Game Center proper is one click away
    // via the hover panel.
    defaultPath: `${webappUrl}daily-quests`,
    icon: (active) => <QuestRailIcon active={active} />,
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
  'flex h-10 w-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus-outline';
const shortcutKeys = [isAppleDevice() ? '⌘' : 'Ctrl', 'K'];
const settingsDefaultPath = `${settingsUrl}/profile`;

const RAIL_HOVER_OPEN_DELAY = 300;
const RAIL_HOVER_CLOSE_DELAY = 120;
const RAIL_HOVER_SIDE_OFFSET = 12;
const RAIL_HOVER_PROFILE_ALIGN_OFFSET = -304;
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
  const claimableQuestCount = useClaimableQuestCount();
  const showQuestBadge = !optOutQuestSystem && claimableQuestCount > 0;
  const activePage = activePageProp || router.asPath || router.pathname || '';
  const isUserProfileActive =
    !!user?.username && activePage.includes(`/${user.username}`);
  const isFeedPage = activePage.includes('/feeds/');

  const resolvedCategory = useMemo((): SidebarCategoryId => {
    if (isFeedPage) {
      return SidebarCategory.Main;
    }
    if (isUserProfileActive) {
      return SidebarCategory.Profile;
    }
    return getSidebarCategoryForPath(activePage);
  }, [activePage, isFeedPage, isUserProfileActive]);

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
    if (category === SidebarCategory.Discover) {
      return (
        <DiscoverSection
          {...defaultRenderSectionProps}
          onNavTabClick={onNavTabClick}
          isItemsButton={isNavButtons ?? false}
        />
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
        <CustomFeedSection
          {...defaultRenderSectionProps}
          onNavTabClick={onNavTabClick}
          title="Feeds"
          isItemsButton={false}
        />
      </>
    );
  };

  const renderSelectedSection = (): ReactElement =>
    renderCategorySection(selectedCategory);

  const selectedLabel = sidebarCategories.find(
    (category) => category.id === selectedCategory,
  )?.label;
  const isSettingsSelected = selectedCategory === SidebarCategory.Settings;
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

  // Settings pages render their navigation only inside this context panel, so
  // a collapsed sidebar would leave no way to move between settings sections.
  // Force the panel open and hide the collapse toggle while on settings —
  // without touching the user's stored `sidebarExpanded` preference, so the
  // sidebar returns to its chosen state once they navigate away.
  const forceExpanded = isSettingsSelected;
  const isExpanded = sidebarExpanded || forceExpanded;

  return (
    <SidebarAside
      data-testid="sidebar-aside"
      className={classNames(
        'laptop:bottom-0 laptop:h-dvh laptop:min-h-dvh laptop:flex-row laptop:border-r-0 laptop:bg-transparent',
        isExpanded ? 'laptop:w-[19rem]' : 'laptop:w-16',
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
          className="pointer-events-none absolute inset-y-0 left-16 hidden border-r border-border-subtlest-quaternary laptop:block"
        />
      )}
      <nav
        aria-label="Primary navigation"
        className="flex h-dvh min-h-dvh w-16 shrink-0 flex-col items-center gap-1 px-3 pb-3 pt-6"
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

        <div
          aria-hidden
          className="my-2 h-px w-6 bg-border-subtlest-quaternary"
        />

        <div
          role="tablist"
          aria-label="Sidebar categories"
          className="flex flex-col items-center gap-1"
        >
          {sidebarCategories.map((category) => {
            if (category.id === SidebarCategory.Profile && !isLoggedIn) {
              return null;
            }

            const isSelected = selectedCategory === category.id;

            return (
              <React.Fragment key={category.id}>
                {category.id === SidebarCategory.Saved && isLoggedIn && (
                  <RailHoverCard
                    label="Notifications"
                    panel={<NotificationsRailPanel />}
                    enabled={!isExpanded}
                  >
                    <div>
                      <NotificationsBell
                        rail
                        noTooltip
                        active={
                          selectedCategory === SidebarCategory.Notifications
                        }
                      />
                    </div>
                  </RailHoverCard>
                )}
                <RailHoverCard
                  label={category.label}
                  panel={renderCategorySection(category.id)}
                  enabled={!isExpanded}
                  alignOffset={
                    category.id === SidebarCategory.Profile
                      ? RAIL_HOVER_PROFILE_ALIGN_OFFSET
                      : undefined
                  }
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
                      railButtonClass,
                      'relative',
                      isSelected && 'bg-background-default !text-text-primary',
                    )}
                  >
                    {category.icon(isSelected)}
                    {category.id === SidebarCategory.GameCenter &&
                      showQuestBadge && (
                        <Bubble className="-right-1 top-0 px-1">
                          {claimableQuestCount}
                        </Bubble>
                      )}
                  </button>
                </RailHoverCard>
              </React.Fragment>
            );
          })}

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
                  className="!size-10 !rounded-12"
                />
              </div>
            </Tooltip>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Sidebar utilities"
          className="mt-auto flex flex-col items-center gap-1"
        >
          <SidebarThemeButton />
          <SidebarSupportButton />

          <RailHoverCard
            label="Settings"
            panel={renderCategorySection(SidebarCategory.Settings)}
            enabled={!isExpanded}
          >
            <Link href={settingsDefaultPath} passHref>
              <a
                href={settingsDefaultPath}
                role="tab"
                id={`sidebar-category-${SidebarCategory.Settings}`}
                aria-controls="sidebar-context-panel"
                aria-selected={isSettingsSelected}
                aria-label="Settings"
                className={classNames(
                  railButtonClass,
                  isSettingsSelected &&
                    'bg-background-default !text-text-primary',
                )}
                onClick={() => onSelectCategory(SidebarCategory.Settings)}
                onMouseEnter={() =>
                  onPrefetchCategory(SidebarCategory.Settings)
                }
                onFocus={() => onPrefetchCategory(SidebarCategory.Settings)}
              >
                <SettingsIcon
                  secondary={isSettingsSelected}
                  size={IconSize.Small}
                  aria-hidden
                />
              </a>
            </Link>
          </RailHoverCard>
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
              sidebarExpanded ? 'left-[16.5rem]' : 'left-[3.5rem]',
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
        {isHomePanel ? (
          <div
            className={classNames('pb-2', isLoggedIn && user ? 'pt-7' : 'pt-6')}
          >
            {isLoggedIn && user ? (
              <section aria-label="Your profile" className="flex flex-col">
                <div className="px-3">
                  <Link href={`${webappUrl}${user.username}`} passHref>
                    <a className="focus-outline inline-flex w-fit max-w-full items-center gap-3 text-text-primary">
                      <ProfilePicture
                        user={user}
                        size={ProfileImageSize.Medium}
                        nativeLazyLoading
                      />
                      <span className="flex min-w-0 flex-col">
                        <Typography
                          bold
                          truncate
                          type={TypographyType.Subhead}
                          className="min-w-0 leading-none hover:underline"
                        >
                          {user.name ?? user.username}
                        </Typography>
                        {user.username && (
                          <Typography
                            truncate
                            type={TypographyType.Caption1}
                            className="mt-0.5 min-w-0 leading-none text-text-tertiary"
                          >
                            @{user.username}
                          </Typography>
                        )}
                      </span>
                    </a>
                  </Link>
                </div>
                <div className="mt-4 px-3">
                  <SidebarHeaderStats />
                </div>
                <div className="mt-3 px-3">
                  <CreatePostButton
                    compact={false}
                    showIcon
                    size={ButtonSize.Small}
                    className="w-full justify-center !border !border-border-subtlest-quaternary"
                  />
                </div>
              </section>
            ) : (
              <div className="flex h-10 items-center px-4">
                <Typography bold type={TypographyType.Callout}>
                  daily.dev
                </Typography>
              </div>
            )}
          </div>
        ) : (
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
        )}

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

        {isExpanded && !isUtilityPanelSelected && (
          <SidebarAnnouncements className="mt-2 px-3 pb-1" />
        )}
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
