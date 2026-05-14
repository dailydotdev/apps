import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { Nav, SidebarAside, SidebarScrollWrapper } from './common';
import {
  ThemeMode,
  themes,
  useSettingsContext,
} from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useBanner } from '../../hooks/useBanner';
import { MainSection } from './sections/MainSection';
import { CustomFeedSection } from './sections/CustomFeedSection';
import { DiscoverSection } from './sections/DiscoverSection';
import { RecentSection } from './sections/RecentSection';
import { ProfileSection } from './sections/ProfileSection';
import { SidebarProfileCompletion } from './SidebarProfileCompletion';
import { SettingsPanelSection } from './sections/SettingsPanelSection';
import { CreatePostButton } from '../post/write';
import { ButtonSize } from '../buttons/Button';
import { BookmarkSection } from './sections/BookmarkSection';
import { NetworkSection } from './sections/NetworkSection';
import { HelpWidget } from '../help/HelpWidget';
import {
  BookmarkIcon,
  FeedbackIcon,
  HomeIcon,
  HotIcon,
  JoystickIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SidebarArrowLeft,
  SquadIcon,
  SunIcon,
  UserIcon,
} from '../icons';
import { ThemeAutoIcon } from '../icons/ThemeAuto';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import type { MenuItemProps } from '../dropdown/common';
import { useSquadNavigation } from '../../hooks';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { IconSize } from '../Icon';
import {
  SidebarSelectedCategory,
  SidebarSettingsFlags,
} from '../../graphql/settings';
import { Tooltip } from '../tooltip/Tooltip';
import { RailHoverPanel } from './RailHoverPanel';
import { useSpotlight } from '../spotlight/useSpotlight';
import { useAuthContext } from '../../contexts/AuthContext';
import NotificationsBell from '../notifications/NotificationsBell';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { SidebarHeaderStats } from './SidebarHeaderStats';
import Link from '../utilities/Link';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { FeedbackWidget } from '../feedback';
import { isAppleDevice } from '../../lib/func';
import LogoIcon from '../../svg/LogoIcon';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { ResourceSection } from '../ProfileMenu/sections/ResourceSection';
import { ProfileMenuFooter } from '../ProfileMenu/ProfileMenuFooter';
import { HorizontalSeparator } from '../utilities';
import { QuestButton } from '../quest/QuestButton';
import { AchievementTrackerPanel } from '../filters/AchievementTrackerButton';
import { Typography, TypographyType } from '../typography/Typography';
import { useRecentPagesTracker } from '../../hooks/feed/useRecentPages';

type SidebarCategoryConfig = {
  id: SidebarSelectedCategory;
  label: string;
  icon: (active: boolean) => ReactElement;
  // Landing path for the rail icon click. Maps each category to the
  // first navigable item shown in its dedicated panel, so clicking a
  // rail icon both selects the panel AND opens the matching page (the
  // first item then highlights as active via `activePage` matching).
  // Profile is dynamic (needs username) and handled at click time.
  defaultPath?: string;
};

const sidebarCategories: SidebarCategoryConfig[] = [
  {
    id: SidebarSelectedCategory.Main,
    label: 'Home',
    defaultPath: webappUrl,
    icon: (active) => (
      <HomeIcon
        secondary={active}
        size={IconSize.Small}
        aria-hidden
        className={active ? '[&_path]:!fill-current' : undefined}
      />
    ),
  },
  {
    id: SidebarSelectedCategory.Squads,
    label: 'Squads',
    // `/squads` server-side redirects to `/squads/discover` — link
    // straight to the destination so we skip the round-trip latency
    // AND so the resolved `activePage` matches the "Find Squads" item
    // path (which we also point at `/squads/discover`).
    defaultPath: `${webappUrl}squads/discover`,
    icon: (active) => (
      <SquadIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarSelectedCategory.Discover,
    label: 'Discover',
    // First DiscoverSection item is "Hot Takes" — but it opens a modal
    // rather than navigating, which would land the user on `/` with a
    // dialog over it. Use the first real page instead so the URL +
    // activePage actually moves to a Discover surface.
    defaultPath: `${webappUrl}tags`,
    icon: (active) => (
      <HotIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarSelectedCategory.Saved,
    label: 'Saved',
    defaultPath: `${webappUrl}bookmarks`,
    icon: (active) => (
      <BookmarkIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarSelectedCategory.GameCenter,
    label: 'Game Center',
    defaultPath: `${webappUrl}game-center`,
    icon: (active) => (
      <JoystickIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarSelectedCategory.Profile,
    label: 'Profile',
    icon: (active) => (
      <UserIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
];

const discoverPathFragments = ['/tags', '/sources', '/users', '/discussed'];
const profilePathFragments = [
  '/analytics',
  '/jobs',
  '/settings/customization/devcard',
  '/wallet',
];

const getSidebarCategoryForPath = (
  activePage: string,
): SidebarSelectedCategory => {
  if (activePage.includes('/bookmarks') || activePage.includes('/briefing')) {
    return SidebarSelectedCategory.Saved;
  }

  if (activePage.includes('/squads')) {
    return SidebarSelectedCategory.Squads;
  }

  if (activePage.includes('/settings')) {
    return SidebarSelectedCategory.Settings;
  }

  if (activePage.includes('/game-center')) {
    return SidebarSelectedCategory.GameCenter;
  }

  if (discoverPathFragments.some((path) => activePage.includes(path))) {
    return SidebarSelectedCategory.Discover;
  }

  if (profilePathFragments.some((path) => activePage.includes(path))) {
    return SidebarSelectedCategory.Profile;
  }

  return SidebarSelectedCategory.Main;
};

const normalizeSidebarCategory = (
  category?: SidebarSelectedCategory,
): SidebarSelectedCategory => {
  if (!category) {
    return SidebarSelectedCategory.Main;
  }

  if (
    category === SidebarSelectedCategory.Feeds ||
    category === SidebarSelectedCategory.Settings ||
    category === SidebarSelectedCategory.GameCenter
  ) {
    return SidebarSelectedCategory.Main;
  }

  return category;
};

const railButtonClass =
  'flex h-10 w-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus-outline';
const shortcutKeys = [isAppleDevice() ? '⌘' : 'Ctrl', 'K'];
const settingsDefaultPath = `${settingsUrl}/profile`;

const RAIL_HOVER_OPEN_DELAY = 250;
const RAIL_HOVER_CLOSE_DELAY = 120;
const RAIL_HOVER_SIDE_OFFSET = 12;
const RAIL_HOVER_PROFILE_ALIGN_OFFSET = -304;
// The shared Tooltip primitive bakes in `collisionPadding={{ top: 75 }}`
// (a leftover from the old global-header layout). On the dual-sidebar
// laptop layout there's no top chrome, so that default shoves tooltips
// for icons near the viewport top (Home, Search, expand/collapse)
// downward — they read as misaligned and visually clipped. A snug
// override re-centers them with the trigger.
const RAIL_TOOLTIP_COLLISION_PADDING = 4;

interface RailHoverCardProps {
  label: string;
  children: ReactNode;
  panel: ReactElement;
  // When `false`, the trigger renders without a popover (used to avoid
  // duplicating the currently-pinned panel that's already visible).
  enabled?: boolean;
  alignOffset?: number;
}

// Slack-style floating preview anchored to a rail icon. The popover
// shows the same content as the dedicated panel but is rendered in a
// portal so it overlays whatever is currently pinned. Radix HoverCard
// gives us the safe-polygon hover bridge for free, so the cursor can
// travel from the rail into the popover without dismissing it.
const RailHoverCard = ({
  label,
  children,
  panel,
  enabled = true,
  alignOffset,
}: RailHoverCardProps) => {
  if (!enabled) {
    return <>{children}</>;
  }
  return (
    <HoverCardPrimitive.Root
      openDelay={RAIL_HOVER_OPEN_DELAY}
      closeDelay={RAIL_HOVER_CLOSE_DELAY}
    >
      <HoverCardPrimitive.Trigger asChild>
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
  const ActiveIcon = themeIconMap[themeMode];

  const onSelectTheme = useCallback(
    (mode: ThemeMode) => {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.Theme,
        target_id: mode,
      });
      setTheme(mode);
    },
    [logEvent, setTheme],
  );

  const options: MenuItemProps[] = themes.map((theme) => {
    const Icon = themeIconMap[theme.value];
    const isActive = theme.value === themeMode;
    return {
      label: theme.label,
      icon: <Icon size={IconSize.Size16} secondary={isActive} aria-hidden />,
      action: () => onSelectTheme(theme.value),
    };
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        tooltip={{ side: 'right', content: 'Change theme' }}
      >
        <button type="button" className={railButtonClass}>
          <ActiveIcon size={IconSize.Small} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="end"
        sideOffset={8}
        className="!min-w-40"
      >
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
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
            isOpen && 'bg-background-default text-text-primary',
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

type SidebarDesktopProps = {
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
export const SidebarDesktop = ({
  activePage: activePageProp,
  featureTheme,
  isNavButtons,
  showFeedbackWidget,
  onNavTabClick,
  onLogoClick,
  additionalButtons,
}: SidebarDesktopProps): ReactElement => {
  const router = useRouter();
  const { flags, sidebarExpanded, toggleSidebarExpanded, updateFlag } =
    useSettingsContext();
  const { logEvent } = useLogContext();
  const { isAvailable: isBannerAvailable } = useBanner();
  const { open: openSpotlight } = useSpotlight();
  const { openNewSquad } = useSquadNavigation();
  const { isLoggedIn, user } = useAuthContext();
  useRecentPagesTracker();
  const activePage = activePageProp || router.asPath || router.pathname || '';
  const isUserProfileActive =
    !!user?.username && activePage.includes(`/${user.username}`);
  const isFeedPage = activePage.includes('/feeds/');

  const resolvedCategory = useMemo((): SidebarSelectedCategory => {
    if (isFeedPage) {
      return SidebarSelectedCategory.Main;
    }
    if (isUserProfileActive) {
      return SidebarSelectedCategory.Profile;
    }
    const activeCategory = getSidebarCategoryForPath(activePage);
    if (activeCategory === SidebarSelectedCategory.Main) {
      return normalizeSidebarCategory(flags?.sidebarSelectedCategory);
    }
    return activeCategory;
  }, [
    activePage,
    flags?.sidebarSelectedCategory,
    isFeedPage,
    isUserProfileActive,
  ]);

  // `pendingCategory` is an optimistic override applied the moment a
  // rail icon is clicked, so the panel switches instantly even though
  // `router.push` is async. Without it we'd flicker:
  //   1. click Profile -> setState(Profile)
  //   2. settings flag updates synchronously -> re-render
  //   3. URL hasn't navigated yet, so `getSidebarCategoryForPath` still
  //      returns the OLD route's category and would clobber Profile
  //   4. URL eventually updates -> snaps back to Profile
  // The override stays in place until the resolved category catches up
  // (URL navigated AND/OR flag landed), then it's cleared so future
  // route changes from elsewhere (back button, deep link) take over.
  const [pendingCategory, setPendingCategory] =
    useState<SidebarSelectedCategory | null>(null);
  const selectedCategory = pendingCategory ?? resolvedCategory;

  useEffect(() => {
    if (pendingCategory !== null && pendingCategory === resolvedCategory) {
      setPendingCategory(null);
    }
  }, [pendingCategory, resolvedCategory]);

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded: true,
      shouldShowLabel: true,
      activePage,
    }),
    [activePage],
  );

  const getCategoryDefaultPath = useCallback(
    (category: SidebarSelectedCategory): string | null => {
      if (category === SidebarSelectedCategory.Profile) {
        return user?.username ? `${webappUrl}${user.username}` : null;
      }
      if (category === SidebarSelectedCategory.Settings) {
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
    (category: SidebarSelectedCategory) => {
      // Snap the panel immediately so the click feels responsive and so
      // the in-flight router.push doesn't race the resolver back to the
      // old URL's category.
      setPendingCategory(category);

      // GameCenter and Settings are pure navigations, not persistent
      // panel states: their landing pages drive the highlight via
      // `getSidebarCategoryForPath`. Persisting them to the server flag
      // would be normalised back to Main on the next read anyway.
      if (
        category !== SidebarSelectedCategory.GameCenter &&
        category !== SidebarSelectedCategory.Settings
      ) {
        updateFlag(SidebarSettingsFlags.SelectedCategory, category);
      }

      const targetPath = getCategoryDefaultPath(category);
      if (!targetPath) {
        return;
      }
      // `defaultPath` is an absolute URL (uses `webappUrl`), but
      // `activePage` is a router asPath like "/squads?x=1". Compare on
      // pathname only so we don't push when already there (the dummy
      // origin handles both absolute + relative targets).
      const targetPathname = new URL(targetPath, 'http://_').pathname;
      const currentPathname = activePage.split('?')[0];
      if (targetPathname !== currentPathname) {
        // `Promise.resolve` wraps the result so we can still attach
        // `.catch` even when consumers (e.g. the next/router test
        // mock) return `undefined` from `push` instead of a real
        // Promise — otherwise tests that fire-click a category in
        // the rail crash with "Cannot read .catch of undefined".
        Promise.resolve(router.push(targetPath)).catch(() => undefined);
      }
    },
    [activePage, getCategoryDefaultPath, router, updateFlag],
  );

  // Warm the route on hover so the click-to-page transition feels
  // instant. Next.js router.prefetch is a no-op in development unless
  // explicitly enabled, but in production it primes the JS chunk + RSC
  // payload for the destination so navigation skips the network wait.
  const onPrefetchCategory = useCallback(
    (category: SidebarSelectedCategory) => {
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

  const renderCategorySection = (
    category: SidebarSelectedCategory,
  ): ReactElement => {
    if (category === SidebarSelectedCategory.Squads) {
      return (
        <NetworkSection
          {...defaultRenderSectionProps}
          isItemsButton={isNavButtons ?? false}
        />
      );
    }

    if (category === SidebarSelectedCategory.Saved) {
      return (
        <BookmarkSection {...defaultRenderSectionProps} isItemsButton={false} />
      );
    }

    if (category === SidebarSelectedCategory.Discover) {
      return (
        <DiscoverSection
          {...defaultRenderSectionProps}
          isItemsButton={isNavButtons ?? false}
        />
      );
    }

    if (category === SidebarSelectedCategory.Settings) {
      return (
        <SettingsPanelSection
          {...defaultRenderSectionProps}
          isItemsButton={false}
        />
      );
    }

    if (category === SidebarSelectedCategory.GameCenter) {
      return (
        <div className="flex flex-col">
          <QuestButton panelOnly />
          <AchievementTrackerPanel />
        </div>
      );
    }

    if (category === SidebarSelectedCategory.Profile) {
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
        <RecentSection
          {...defaultRenderSectionProps}
          title="Recent"
          isItemsButton={false}
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
  const isSettingsSelected =
    selectedCategory === SidebarSelectedCategory.Settings;
  const isHomePanel = selectedCategory === SidebarSelectedCategory.Main;
  const isSquadsPanel = selectedCategory === SidebarSelectedCategory.Squads;
  // Anything that's not the personalised Home panel gets the slim
  // generic header treatment (title left, optional add + close right) and
  // skips the profile chrome, create-post, and feedback widget.
  const isUtilityPanelSelected = !isHomePanel;
  const utilityPanelTitle = isSettingsSelected
    ? 'Settings'
    : selectedLabel ?? '';

  return (
    <SidebarAside
      data-testid="sidebar-aside"
      className={classNames(
        'laptop:bottom-0 laptop:h-dvh laptop:min-h-dvh laptop:flex-row laptop:border-r-0 laptop:bg-transparent',
        sidebarExpanded ? 'laptop:w-[19rem]' : 'laptop:w-16',
        // No global header on laptop with the dual sidebar, so the rail
        // can hug the very top of the viewport. The banner still offsets
        // sticky elements via the existing safe-area CSS var, so we only
        // need to set the laptop offset for the (rare) banner case.
        isBannerAvailable
          ? 'laptop:[--safe-area-top-offset:2rem]'
          : 'laptop:[--safe-area-top-offset:0rem]',
        featureTheme && 'bg-transparent',
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-16 hidden border-r border-border-subtlest-quaternary laptop:block"
      />
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
            if (
              category.id === SidebarSelectedCategory.Profile &&
              !isLoggedIn
            ) {
              return null;
            }

            const isSelected = selectedCategory === category.id;

            return (
              <React.Fragment key={category.id}>
                {category.id === SidebarSelectedCategory.Saved &&
                  isLoggedIn && <NotificationsBell rail />}
                <RailHoverCard
                  label={category.label}
                  panel={renderCategorySection(category.id)}
                  enabled={!isSelected || !sidebarExpanded}
                  alignOffset={
                    category.id === SidebarSelectedCategory.Profile
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
                    className={classNames(
                      railButtonClass,
                      isSelected && 'bg-background-default text-white',
                    )}
                  >
                    {category.icon(isSelected)}
                  </button>
                </RailHoverCard>
              </React.Fragment>
            );
          })}
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
            panel={renderCategorySection(SidebarSelectedCategory.Settings)}
            enabled={!isSettingsSelected || !sidebarExpanded}
          >
            <Link href={settingsDefaultPath} passHref>
              <a
                href={settingsDefaultPath}
                role="tab"
                id={`sidebar-category-${SidebarSelectedCategory.Settings}`}
                aria-controls="sidebar-context-panel"
                aria-selected={isSettingsSelected}
                aria-label="Settings"
                className={classNames(
                  railButtonClass,
                  isSettingsSelected && 'bg-background-default text-white',
                )}
                onClick={() =>
                  onSelectCategory(SidebarSelectedCategory.Settings)
                }
                onMouseEnter={() =>
                  onPrefetchCategory(SidebarSelectedCategory.Settings)
                }
                onFocus={() =>
                  onPrefetchCategory(SidebarSelectedCategory.Settings)
                }
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
        Single toggle button that physically slides between two anchor
        points instead of swapping two separate elements:

        - Open: parked at the right edge of the panel header, ghost-style
          (no border, no background) — the original in-panel close
          button position.
        - Closed: parked at the rail-panel boundary, eye-level with the
          daily.dev logo, with border + background + shadow so it reads
          as a discoverable "open me" handle on the bare rail.

        Wrapping the button in a `top-6 h-10 flex items-center` shell
        anchors its vertical center to the logo row in both states. The
        icon is the same `SidebarArrowLeft` glyph in both states; we
        just rotate 180° + transition `left` / colors / shadow together
        in lockstep with the sidebar's own width transition (300ms).
      */}
      <Tooltip
        side="right"
        content={sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
        collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
      >
        <div
          className={classNames(
            'absolute top-6 z-1 hidden h-10 items-center transition-[left] duration-300 ease-in-out laptop:flex',
            // Open: 264px = panel right edge (304px) - pr-3 (12px) -
            //   button width (28px). Matches the old close-button slot.
            // Closed: 50px = rail-panel separator (64px) - 14px (half
            //   button width). Centers the button exactly on the
            //   separator line so the rail's logo stays fully visible
            //   instead of being half-covered by the button.
            sidebarExpanded ? 'left-[16.5rem]' : 'left-[3.125rem]',
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
                ? // Open: ghost slot in the panel header. Hover gives
                  // a subtle surface-hover wash like other inline
                  // header buttons.
                  'border-transparent bg-transparent shadow-none hover:bg-surface-hover hover:text-text-primary'
                : // Closed: free-floating chip on the rail. Keep the
                  // background steady on hover (any bg swap reads as
                  // a transparency glitch against the rail). Lift the
                  // icon to text-primary and darken the border for
                  // affordance instead.
                  'shadow-1 border-border-subtlest-tertiary bg-background-default hover:border-border-subtlest-secondary hover:text-text-primary',
            )}
          >
            <SidebarArrowLeft
              size={IconSize.XSmall}
              aria-hidden
              className={classNames(
                'transition-transform duration-300 ease-in-out',
                !sidebarExpanded && 'rotate-180',
              )}
            />
          </button>
        </div>
      </Tooltip>

      <section
        id="sidebar-context-panel"
        role="tabpanel"
        aria-labelledby={`sidebar-category-${selectedCategory}`}
        aria-label={`${selectedLabel ?? 'Settings'} navigation`}
        className={classNames(
          'relative flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[opacity,width] duration-300',
          sidebarExpanded
            ? 'w-60 opacity-100'
            : 'pointer-events-none w-0 opacity-0',
        )}
      >
        {isHomePanel ? (
          <div
            className={classNames(
              // Tight `pb-1` (4px) so the New post CTA sits close to
              // the nav list it precedes (For You / Following /
              // Explore). The CTA itself acts as the separator.
              'pb-1',
              // Logged-in: `pt-7` (28px) puts the avatar's vertical
              // center at y≈44 to match the rail's daily.dev logo and
              // the open/close handle. Logged-out: keep `pt-6` for the
              // utility-panel header alignment with `pl-4`.
              isLoggedIn && user ? 'pt-7' : 'pt-6',
            )}
          >
            {isLoggedIn && user ? (
              <section
                aria-label="Your profile"
                // Section gap is small (gap-2 = 8px) so the identity
                // row sits close to the stats strip; the New post CTA
                // gets its own `mt-3` below to add extra breathing room
                // between the strip and the button.
                className="flex flex-col gap-2"
              >
                {/* Identity row — same `px-3` outer padding as the
                    stats strip and New post wrappers below so the
                    avatar's left edge sits on the exact same x as the
                    stats strip border, the New post button border, and
                    every nav item's left edge. No row-wide hover bg
                    (it used to bleed under the absolutely-positioned
                    collapse handle). The link only signals
                    interactivity via a hover underline on the
                    name + handle text. */}
                <div className="px-3">
                  <Link href={`${webappUrl}${user.username}`} passHref>
                    <a className="focus-outline group flex items-center gap-3 text-text-primary">
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
                          className="min-w-0 leading-none group-hover:underline"
                        >
                          {user.name ?? user.username}
                        </Typography>
                        {user.username && (
                          <Typography
                            truncate
                            type={TypographyType.Caption1}
                            className="mt-0.5 min-w-0 leading-none text-text-tertiary group-hover:underline"
                          >
                            @{user.username}
                          </Typography>
                        )}
                      </span>
                    </a>
                  </Link>
                </div>
                <div className="px-3">
                  <SidebarHeaderStats />
                </div>
                <div className="mt-3 px-3">
                  <CreatePostButton
                    compact={false}
                    showIcon
                    size={ButtonSize.Small}
                    // White-on-dark Primary button matched to the stats
                    // strip's outline so the CTA reads as part of the
                    // same widget without needing an enclosing card.
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
                    // Right margin reserves space for the absolute-positioned
                    // sidebar toggle button parked at the panel header's
                    // right edge (`left-[16.5rem]`, size-7 with an 8px gap).
                    className="focus-outline mr-9 flex size-7 shrink-0 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <PlusIcon size={IconSize.XSmall} aria-hidden />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* On the home panel the New post CTA already serves as the
            visual separator between the profile widget and the nav list
            — render the explicit divider only on the other panels
            (Profile completion, etc.) where there's no equivalent
            break. */}
        {!isUtilityPanelSelected && !isHomePanel && (
          <HorizontalSeparator className="mx-3 mt-3" />
        )}

        {isLoggedIn && !isUtilityPanelSelected && additionalButtons && (
          <div className="mt-2 flex items-center gap-1 px-3">
            {additionalButtons}
          </div>
        )}

        <SidebarScrollWrapper
          className={classNames(
            'min-h-0 flex-1',
            // On the home panel keep the gap tight (mt-1 = 4px) so the
            // New post CTA sits visually close to the nav list it
            // precedes; the CTA itself acts as the divider. Other
            // panels keep their previous breathing room.
            // eslint-disable-next-line no-nested-ternary
            isHomePanel ? 'mt-1' : isUtilityPanelSelected ? 'mt-1' : 'mt-2',
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
