import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Nav, SidebarAside, SidebarScrollWrapper, ListIcon } from './common';
import type { SidebarMenuItem } from './common';
import { Section } from './Section';
import { isSidebarSettingsPath } from './sidebarCategory';
import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useBanner } from '../../hooks/useBanner';
import { PinnedSection } from './sections/PinnedSection';
import { CustomFeedSection } from './sections/CustomFeedSection';
import { BookmarkSection } from './sections/BookmarkSection';
import { NetworkSection } from './sections/NetworkSection';
import { SettingsPanelSection } from './sections/SettingsPanelSection';
import { useClaimableQuestCount } from '../../hooks/useQuestDashboard';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { HelpWidget } from '../help/HelpWidget';
import {
  AnalyticsIcon,
  AppIcon,
  BellIcon,
  BrowserGroupIcon,
  ComposeIcon,
  CreditCardIcon,
  DevCardIcon,
  DevPlusIcon,
  DocsIcon,
  ExitIcon,
  EyeIcon,
  FlagIcon,
  HelpIcon,
  HomeIcon,
  HotIcon,
  InviteIcon,
  JobIcon,
  JoystickIcon,
  MagicIcon,
  MegaphoneIcon,
  MoonIcon,
  MoveToIcon,
  PhoneIcon,
  PrivacyIcon,
  SearchIcon,
  SettingsIcon,
  SquadIcon,
  SunIcon,
  TerminalIcon,
  TrendingIcon,
} from '../icons';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { useSpotlight } from '../spotlight/SpotlightContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { SidebarProfileStats } from './SidebarProfileStats';
import { SidebarStreakButton } from './SidebarStreakButton';
import Link from '../utilities/Link';
import {
  appsUrl,
  businessWebsiteUrl,
  docs,
  downloadBrowserExtension,
  feedback,
  privacyPolicy,
  settingsUrl,
  termsOfService,
  webappUrl,
} from '../../lib/constants';
import { isAppleDevice, isExtension } from '../../lib/func';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { OtherFeedPage } from '../../lib/query';
import { SharedFeedPage, HorizontalSeparator } from '../utilities';
import LogoIcon from '../../svg/LogoIcon';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { ProfileSection as ProfileMenuSection } from '../ProfileMenu/ProfileSection';
import type { ProfileSectionItemProps } from '../ProfileMenu/ProfileSectionItem';
import { ProfileMenuHeader } from '../ProfileMenu/ProfileMenuHeader';
import { UpgradeToPlus } from '../UpgradeToPlus';
import { LogoutReason } from '../../lib/user';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useCanPurchaseCores } from '../../hooks/useCoresFeature';
import { FeedbackWidget } from '../feedback';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

const shortcutKeys = [isAppleDevice() ? '⌘' : 'Ctrl', 'K'];
// Sidebar collapse/expand shortcut (plain bracket key, like Linear).
const sidebarToggleShortcut = '[';
const settingsDefaultPath = `${settingsUrl}/profile`;

// Resizable panel bounds (px). 304px = 19rem keeps the default in step with
// the `var(--sidebar-width, 19rem)` fallback used before settings load.
const SIDEBAR_DEFAULT_WIDTH = 304;
const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 420;
// Collapsed icon-rail width (px) — must match the `w-14` class + MainLayout.
const SIDEBAR_RAIL_WIDTH = 56;
// Below this cursor X a drag collapses (from open) / doesn't open (from rail).
const SIDEBAR_COLLAPSE_AT = 180;

// Compact square icon button (Linear-sized: 32px hit area, 16px glyph) shared
// by the header search and the footer support controls.
const iconButtonClass =
  'focus-outline flex size-8 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary [&_svg]:!size-4';

const SidebarThemeButton = (): ReactElement => {
  const { setTheme, themeMode } = useSettingsContext();
  const { logEvent } = useLogContext();
  const isDark = themeMode === ThemeMode.Dark;
  const Icon = isDark ? SunIcon : MoonIcon;

  const onToggle = () => {
    const nextMode = isDark ? ThemeMode.Light : ThemeMode.Dark;
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.Theme,
      target_id: nextMode,
    });
    setTheme(nextMode);
  };

  return (
    <Tooltip
      side="top"
      content={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <button
        type="button"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={iconButtonClass}
        onClick={onToggle}
      >
        <Icon size={IconSize.Small} aria-hidden />
      </button>
    </Tooltip>
  );
};

const supportItems: ProfileSectionItemProps[] = [
  {
    title: 'Get the mobile app',
    href: appsUrl,
    icon: PhoneIcon,
    external: true,
  },
  {
    title: 'Get the browser extension',
    href: downloadBrowserExtension,
    icon: BrowserGroupIcon,
    external: true,
  },
  {
    title: 'Changelog',
    href: `${webappUrl}sources/daily_updates`,
    icon: TerminalIcon,
  },
  { title: 'Docs', href: docs, icon: DocsIcon, external: true },
  { title: 'Report a bug', href: feedback, icon: FlagIcon, external: true },
];

const legalItems: ProfileSectionItemProps[] = [
  {
    title: 'Privacy policy',
    href: privacyPolicy,
    icon: PrivacyIcon,
    external: true,
  },
  {
    title: 'Terms of service',
    href: termsOfService,
    icon: DocsIcon,
    external: true,
  },
];

const SidebarSupportButton = (): ReactElement => {
  const { isOpen, onUpdate, wrapHandler } = useInteractivePopup();

  return (
    <>
      <Tooltip side="top" content="Support">
        <button
          type="button"
          aria-label="Support"
          aria-expanded={isOpen}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
          className={classNames(
            iconButtonClass,
            isOpen && 'bg-background-default !text-text-primary',
          )}
        >
          <HelpIcon secondary={isOpen} size={IconSize.Small} aria-hidden />
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
          <ProfileMenuSection items={supportItems} />
          <HorizontalSeparator />
          <ProfileMenuSection items={legalItems} />
        </InteractivePopup>
      )}
    </>
  );
};

// Profile switcher in the sidebar header (avatar + name), opening a curated
// menu built from the shared ProfileSection rows: reputation/cores stats,
// account links, and log out.
const SidebarProfileButton = ({
  iconOnly = false,
}: {
  iconOnly?: boolean;
} = {}): ReactElement | null => {
  const { user, logout } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { isOpen, onUpdate, wrapHandler } = useInteractivePopup();
  const { openModal } = useLazyModal();
  const canPurchaseCores = useCanPurchaseCores();

  if (!user) {
    return null;
  }

  const mainItems: ProfileSectionItemProps[] = [
    {
      title: 'Your profile',
      href: `${webappUrl}${user.username}`,
      icon: EyeIcon,
    },
    { title: 'Analytics', href: `${webappUrl}analytics`, icon: AnalyticsIcon },
    { title: 'Jobs', href: `${webappUrl}jobs`, icon: JobIcon },
    {
      title: 'DevCard',
      href: `${settingsUrl}/customization/devcard`,
      icon: DevCardIcon,
    },
    {
      title: 'Invite friends',
      href: `${settingsUrl}/invite`,
      icon: InviteIcon,
    },
  ];

  const billingItems: ProfileSectionItemProps[] = [
    {
      title: 'Subscriptions',
      href: `${settingsUrl}/subscription`,
      icon: CreditCardIcon,
    },
    ...(canPurchaseCores
      ? [
          {
            title: 'Ads dashboard',
            icon: TrendingIcon,
            onClick: () => openModal({ type: LazyModal.AdsDashboard }),
          } satisfies ProfileSectionItemProps,
        ]
      : []),
    {
      title: 'Advertise',
      href: businessWebsiteUrl,
      icon: MegaphoneIcon,
      external: true,
    },
  ];

  const settingsItems: ProfileSectionItemProps[] = [
    { title: 'Settings', href: settingsDefaultPath, icon: SettingsIcon },
    {
      title: 'Feed settings',
      href: `${settingsUrl}/feed/general`,
      icon: AppIcon,
    },
  ];

  const logoutItems: ProfileSectionItemProps[] = [
    {
      title: 'Log out',
      icon: ExitIcon,
      onClick: () => logout(LogoutReason.ManualLogout),
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
          'focus-outline flex items-center rounded-12 transition-colors hover:bg-surface-hover',
          isOpen && 'bg-surface-hover',
          iconOnly ? 'justify-center p-1' : 'min-w-0 flex-1 gap-2 px-1 py-1',
        )}
      >
        <span className="relative shrink-0">
          <ProfilePicture
            user={user}
            size={ProfileImageSize.Small}
            nativeLazyLoading
          />
          {isPlus && (
            <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-background-default">
              <DevPlusIcon
                secondary
                size={IconSize.Size16}
                className="text-action-plus-default"
              />
            </span>
          )}
        </span>
        {!iconOnly && (
          <Typography
            bold
            truncate
            type={TypographyType.Footnote}
            className="min-w-0 flex-1 text-left"
          >
            {user.name ?? user.username}
          </Typography>
        )}
      </button>
      {isOpen && (
        <InteractivePopup
          closeOutsideClick
          onClose={() => onUpdate(false)}
          position={InteractivePopupPosition.SidebarProfileMenu}
          className="flex max-h-[calc(100dvh-6rem)] w-72 flex-col gap-3 overflow-y-auto !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
        >
          <Link href={`${webappUrl}${user.username}`} passHref>
            <a className="rounded-10 px-1 py-1 hover:bg-surface-hover">
              <ProfileMenuHeader profileImageSize={ProfileImageSize.Medium} />
            </a>
          </Link>

          <SidebarProfileStats />

          <UpgradeToPlus
            target={TargetId.ProfileDropdown}
            size={ButtonSize.Small}
            className="flex-initial"
          />

          <nav className="flex flex-col gap-2">
            <ProfileMenuSection items={mainItems} />
            <HorizontalSeparator />
            <ProfileMenuSection items={settingsItems} />
            <HorizontalSeparator />
            <ProfileMenuSection items={billingItems} />
            <HorizontalSeparator />
            <ProfileMenuSection items={logoutItems} />
          </nav>
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
    flags,
    updateFlag,
  } = useSettingsContext();
  const { logEvent } = useLogContext();
  const { isAvailable: isBannerAvailable } = useBanner();
  const { open: openSpotlight } = useSpotlight();
  const { isLoggedIn } = useAuthContext();
  const { openModal } = useLazyModal();
  const { unreadCount } = useNotificationContext();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const claimableQuestCount = useClaimableQuestCount();
  const showQuests = isLoggedIn && !optOutQuestSystem;
  const activePage = activePageProp || router.asPath || router.pathname || '';

  // Settings pages render their navigation only inside this panel, so a
  // collapsed sidebar would strand them with no way to move between sections.
  // Force it open there without touching the stored preference.
  const forceExpanded = isSidebarSettingsPath(activePage);

  // Settings load client-side, so on a hard refresh `sidebarExpanded` settles
  // from its `false` default to the stored value. Keep transitions off until
  // settings load so the panel snaps into place on first paint and only real
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

  // Pinned-open vs collapsed. Collapsed isn't hidden — it's a persistent
  // icon-only rail (production-style); hovering it does NOT open the panel.
  // The panel only opens when pinned (resize grip / "[" / feed-header button).
  // Settings force the full panel open. `isPanelOpen` = labels + full layout.
  const isExpanded = sidebarExpanded || forceExpanded;
  const isPanelOpen = isExpanded;

  // The panel width is resizable and persisted. The live value lives in the
  // `--sidebar-width` CSS variable so the sidebar and the main content (which
  // pads by the same variable in MainLayout) resize together, 1:1, while
  // dragging — without re-rendering on every pointer move.
  const resolvedWidth = Math.min(
    SIDEBAR_MAX_WIDTH,
    Math.max(SIDEBAR_MIN_WIDTH, flags?.sidebarWidth ?? SIDEBAR_DEFAULT_WIDTH),
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      `${resolvedWidth}px`,
    );
  }, [resolvedWidth, sidebarExpanded]);

  // Collapse/expand shortcut: the plain "[" key (like Linear). Ignored with
  // modifiers (so ⌘/Ctrl+[ stays browser "back") and while typing.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.key !== '[') {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target?.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }
      event.preventDefault();
      logEvent({
        event_name: `${sidebarExpanded ? 'close' : 'open'} sidebar`,
      });
      toggleSidebarExpanded();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [logEvent, sidebarExpanded, toggleSidebarExpanded]);

  // Highlights the resize grip while actively dragging (toggled at drag
  // start/end only — never on pointer move, so it doesn't re-render mid-drag).
  const [isResizing, setIsResizing] = useState(false);

  // Grip drag: when open, resize the panel live / pull past the threshold to
  // collapse. When collapsed, pull the rail open — the width grows from the
  // rail and tracks the cursor; a plain click opens too. Transitions are
  // suppressed only during the active drag so it tracks 1:1, then eases on
  // release for a smooth open/close.
  const onResizeHandleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const root = document.documentElement;
      const startedCollapsed = !isExpanded;
      const startX = event.clientX;
      let lastCursorX: number | null = null;
      let moved = false;
      setIsResizing(true);
      root.classList.add('sidebar-resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      if (startedCollapsed) {
        root.style.setProperty('--sidebar-width', `${SIDEBAR_RAIL_WIDTH}px`);
      }

      const onMove = (moveEvent: MouseEvent) => {
        if (Math.abs(moveEvent.clientX - startX) > 3) {
          moved = true;
        }
        lastCursorX = moveEvent.clientX;
        const minWidth = startedCollapsed
          ? SIDEBAR_RAIL_WIDTH
          : SIDEBAR_MIN_WIDTH;
        const width = Math.min(
          SIDEBAR_MAX_WIDTH,
          Math.max(minWidth, moveEvent.clientX),
        );
        root.style.setProperty('--sidebar-width', `${width}px`);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        setIsResizing(false);
        root.classList.remove('sidebar-resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        if (startedCollapsed) {
          const draggedOpen =
            lastCursorX != null && lastCursorX >= SIDEBAR_COLLAPSE_AT;
          if (!moved || draggedOpen) {
            if (moved && lastCursorX != null) {
              const width = Math.min(
                SIDEBAR_MAX_WIDTH,
                Math.max(SIDEBAR_MIN_WIDTH, lastCursorX),
              );
              root.style.setProperty('--sidebar-width', `${width}px`);
              updateFlag('sidebarWidth', width);
            } else {
              // Plain click → open at the stored width (animates from the rail).
              root.style.setProperty('--sidebar-width', `${resolvedWidth}px`);
            }
            logEvent({ event_name: 'open sidebar' });
            toggleSidebarExpanded();
          } else {
            // Released too narrow → settle back to the rail.
            root.style.setProperty('--sidebar-width', `${resolvedWidth}px`);
          }
          return;
        }

        if (lastCursorX == null) {
          return;
        }
        if (lastCursorX < SIDEBAR_COLLAPSE_AT) {
          logEvent({ event_name: 'close sidebar' });
          toggleSidebarExpanded();
          return;
        }
        const width = Math.min(
          SIDEBAR_MAX_WIDTH,
          Math.max(SIDEBAR_MIN_WIDTH, lastCursorX),
        );
        root.style.setProperty('--sidebar-width', `${width}px`);
        updateFlag('sidebarWidth', width);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [isExpanded, resolvedWidth, logEvent, toggleSidebarExpanded, updateFlag],
  );

  const defaultRenderSectionProps = useMemo(
    () => ({
      // When the panel is open, sections show titles + labels; collapsed to
      // the rail they become icon-only with tooltips and divider headers.
      sidebarExpanded: isPanelOpen,
      shouldShowLabel: isPanelOpen,
      activePage,
      // Compact (Linear-style) rows + section headers for the single panel.
      compact: true,
    }),
    [activePage, isPanelOpen],
  );

  const countBadge = useCallback(
    (count: number): SidebarMenuItem['rightIcon'] =>
      count > 0
        ? () => (
            <Typography
              bold
              color={TypographyColor.Secondary}
              type={TypographyType.Caption1}
              className="rounded-6 bg-background-subtle px-1.5"
            >
              {count > 99 ? '99+' : count}
            </Typography>
          )
        : undefined,
    [],
  );

  // The primary nav, in an explicit (v2-only) order:
  // For You, Following, Notifications, Quests, Explore, Happening Now, History.
  // Built here rather than via the shared MainSection so the order — which
  // interleaves Notifications/Quests with the feed items — stays v2-specific
  // and doesn't affect the v1 sidebar.
  const primaryItems: SidebarMenuItem[] = useMemo(() => {
    // Mirror MainSection's "For You" target so navigation + active state match.
    let myFeedPath = isCustomDefaultFeed ? '/my-feed' : '/';
    if (isExtension) {
      myFeedPath = '/my-feed';
    }

    const items: (SidebarMenuItem | false)[] = [
      isLoggedIn
        ? {
            title: 'For You',
            path: myFeedPath,
            action: () =>
              onNavTabClick?.(
                isCustomDefaultFeed ? SharedFeedPage.MyFeed : '/',
              ),
            icon: (active: boolean) => (
              <ListIcon Icon={() => <MagicIcon secondary={active} />} />
            ),
          }
        : {
            title: 'Home',
            path: '/',
            action: () => onNavTabClick?.('/'),
            icon: (active: boolean) => (
              <ListIcon Icon={() => <HomeIcon secondary={active} />} />
            ),
          },
      {
        title: 'Following',
        path: '/following',
        action: () => onNavTabClick?.(OtherFeedPage.Following),
        requiresLogin: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SquadIcon secondary={active} />} />
        ),
      },
      isLoggedIn && {
        title: 'Notifications',
        path: `${webappUrl}notifications`,
        isForcedLink: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <BellIcon secondary={active} />} />
        ),
        rightIcon: countBadge(unreadCount),
      },
      showQuests && {
        title: 'Quests',
        path: `${webappUrl}game-center`,
        isForcedLink: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <JoystickIcon secondary={active} />} />
        ),
        rightIcon: countBadge(claimableQuestCount),
      },
      {
        title: 'Explore',
        path: '/posts',
        action: () => onNavTabClick?.(OtherFeedPage.Explore),
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HotIcon secondary={active} />} />
        ),
      },
      {
        title: 'Happening Now',
        path: `${webappUrl}highlights`,
        isForcedLink: true,
        requiresLogin: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <MegaphoneIcon secondary={active} />} />
        ),
      },
      {
        title: 'History',
        path: `${webappUrl}history`,
        isForcedLink: true,
        requiresLogin: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EyeIcon secondary={active} />} />
        ),
      },
    ];

    return items.filter(Boolean) as SidebarMenuItem[];
  }, [
    claimableQuestCount,
    countBadge,
    isCustomDefaultFeed,
    isLoggedIn,
    onNavTabClick,
    showQuests,
    unreadCount,
  ]);

  return (
    <SidebarAside
      data-testid="sidebar-aside"
      data-resizable-pane
      className={classNames(
        'laptop:bottom-0 laptop:h-dvh laptop:min-h-dvh laptop:border-r-0',
        // Open (or mid drag-to-open from the rail): width tracks the resizable
        // `--sidebar-width` variable (19rem fallback before settings load).
        // Collapsed: a narrow icon rail.
        isPanelOpen || isResizing
          ? 'laptop:w-[var(--sidebar-width,19rem)]'
          : 'laptop:w-14',
        // While dragging the rail open, float over the feed so content doesn't
        // jump — it settles into flow when the open state is committed.
        !isPanelOpen && isResizing && 'laptop:z-sidebarOverlay laptop:shadow-3',
        isBannerAvailable
          ? 'laptop:[--safe-area-top-offset:2rem]'
          : 'laptop:[--safe-area-top-offset:0rem]',
        // Paint the exact V2 page background (same color-mix MainLayout uses)
        // so the sidebar and feed read as one continuous surface — the feed
        // floats as a box on top, with no divider between them.
        !featureTheme &&
          'laptop:!bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]',
        featureTheme && 'laptop:!bg-transparent',
        suppressTransition,
      )}
    >
      {/* Definite-height, clipped flex column so the nav scrolls and the
          header/footer stay pinned on-screen regardless of list length. */}
      <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden">
        {/* Settings take over the panel with a single Back control. When
              open, the full profile/streak/compose top bar shows; collapsed,
              the rail shows the same controls as centered icons. */}
        {forceExpanded && (
          <header className="px-2 pb-1 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="focus-outline flex w-full items-center gap-2 rounded-10 px-1.5 py-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <MoveToIcon
                size={IconSize.Size16}
                aria-hidden
                className="rotate-180"
              />
              <Typography bold type={TypographyType.Footnote}>
                Back
              </Typography>
            </button>
          </header>
        )}
        {!forceExpanded && isPanelOpen && (
          <header className="px-2 pb-2 pt-4">
            <div className="flex items-center gap-0.5">
              {isLoggedIn ? (
                <SidebarProfileButton />
              ) : (
                <>
                  <Link href={webappUrl} passHref prefetch={false}>
                    <a
                      href={webappUrl}
                      aria-label="Home"
                      onClick={onLogoClick}
                      className="focus-outline hover:opacity-80 flex items-center gap-2 rounded-12 px-1 text-text-primary transition-opacity"
                    >
                      <LogoIcon className={{ container: 'h-5 w-auto' }} />
                      <Typography
                        bold
                        type={TypographyType.Footnote}
                        className="min-w-0 truncate"
                      >
                        daily.dev
                      </Typography>
                    </a>
                  </Link>
                  <span className="flex-1" />
                </>
              )}
              {isLoggedIn && <SidebarStreakButton />}
              {isLoggedIn && (
                <Tooltip side="bottom" content="New post">
                  <Button
                    type="button"
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Small}
                    icon={<ComposeIcon />}
                    aria-label="New post"
                    onClick={() => openModal({ type: LazyModal.SmartComposer })}
                    className="ml-2 !size-7 [&_svg]:!size-4"
                  />
                </Tooltip>
              )}
            </div>
          </header>
        )}
        {!forceExpanded && !isPanelOpen && (
          <header className="flex flex-col items-center gap-1 px-2 pb-2 pt-4">
            {isLoggedIn ? (
              <SidebarProfileButton iconOnly />
            ) : (
              <Link href={webappUrl} passHref prefetch={false}>
                <a
                  href={webappUrl}
                  aria-label="Home"
                  onClick={onLogoClick}
                  className="focus-outline hover:opacity-80 flex size-8 items-center justify-center rounded-12 text-text-primary transition-opacity"
                >
                  <LogoIcon className={{ container: 'h-5 w-auto' }} />
                </a>
              </Link>
            )}
            {isLoggedIn && <SidebarStreakButton />}
            {isLoggedIn && (
              <Tooltip side="right" content="New post">
                <Button
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Small}
                  icon={<ComposeIcon />}
                  aria-label="New post"
                  onClick={() => openModal({ type: LazyModal.SmartComposer })}
                  className="!size-8 [&_svg]:!size-4"
                />
              </Tooltip>
            )}
          </header>
        )}

        {isLoggedIn && isPanelOpen && additionalButtons && (
          <div className="flex items-center gap-1 px-3 pb-1 pt-1">
            {additionalButtons}
          </div>
        )}

        <SidebarScrollWrapper className="mt-1 min-h-0 flex-1">
          <Nav className="!pt-0">
            {forceExpanded ? (
              // Settings (and other inner pages) render their navigation only
              // here; the Back control lives in the header above.
              <SettingsPanelSection
                {...defaultRenderSectionProps}
                isItemsButton={false}
              />
            ) : (
              <>
                {/* Search scrolls with the list (a field when open, a
                      centered icon in the rail). */}
                {isPanelOpen ? (
                  <div className="px-2 pb-1">
                    <button
                      type="button"
                      aria-label="Search"
                      onClick={openSpotlight}
                      className="focus-outline flex h-8 w-full items-center gap-2 rounded-10 border border-border-subtlest-tertiary px-2.5 text-text-tertiary transition-colors hover:border-border-subtlest-secondary hover:text-text-primary"
                    >
                      <SearchIcon size={IconSize.Size16} aria-hidden />
                      <span className="flex-1 text-left typo-footnote">
                        Search
                      </span>
                      <span
                        aria-hidden
                        className="flex items-center gap-0.5 text-text-quaternary typo-caption2"
                      >
                        {shortcutKeys.map((key) => (
                          <kbd key={key} className="font-sans">
                            {key}
                          </kbd>
                        ))}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center pb-1">
                    <Tooltip
                      side="right"
                      content={`Search · ${shortcutKeys.join('')}`}
                    >
                      <button
                        type="button"
                        aria-label="Search"
                        onClick={openSpotlight}
                        className={iconButtonClass}
                      >
                        <SearchIcon size={IconSize.Size16} aria-hidden />
                      </button>
                    </Tooltip>
                  </div>
                )}
                <Section
                  {...defaultRenderSectionProps}
                  items={primaryItems}
                  isItemsButton={isNavButtons ?? false}
                  className="!mt-0"
                />
                {isLoggedIn && (
                  <PinnedSection
                    {...defaultRenderSectionProps}
                    isItemsButton={false}
                  />
                )}
                <CustomFeedSection
                  {...defaultRenderSectionProps}
                  onNavTabClick={onNavTabClick}
                  title="Feeds"
                  isItemsButton={false}
                />
                <BookmarkSection
                  {...defaultRenderSectionProps}
                  title="Saved"
                  isItemsButton={false}
                />
                <NetworkSection
                  {...defaultRenderSectionProps}
                  title="Squads"
                  isItemsButton={isNavButtons ?? false}
                />
              </>
            )}
          </Nav>
        </SidebarScrollWrapper>

        {/* Rendered outside the scroll so its popover isn't clipped; the
            widget self-hides when there's no active help campaign. Hidden in
            the rail (no room for the card). */}
        {!forceExpanded && isPanelOpen && (
          <div className="px-1">
            <HelpWidget sidebarExpanded />
          </div>
        )}

        {/* Footer strip: open → daily.dev brand (→ home) on the left with the
              theme + support icons on the right; collapsed → the same icons
              stacked and centered in the rail. */}
        <div className="flex flex-col gap-2 border-t border-border-subtlest-quaternary px-2 py-2">
          {showFeedbackWidget && isPanelOpen && (
            <FeedbackWidget placement="sidebar" />
          )}
          <div
            className={classNames(
              'flex',
              isPanelOpen
                ? 'items-center gap-1'
                : 'flex-col items-center gap-1',
            )}
          >
            {/* Open: logo sits at the start of the row. Rail: logo drops to the
                very bottom, below the support icon. */}
            {isPanelOpen && (
              <>
                <Link href={webappUrl} passHref prefetch={false}>
                  <a
                    href={webappUrl}
                    aria-label="daily.dev home"
                    onClick={onLogoClick}
                    className="focus-outline flex min-w-0 items-center gap-1.5 rounded-10 px-1.5 py-1.5 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <LogoIcon className={{ container: 'h-4 w-auto' }} />
                    <Typography
                      type={TypographyType.Footnote}
                      className="min-w-0 truncate"
                    >
                      daily.dev
                    </Typography>
                  </a>
                </Link>
                <span className="flex-1" />
              </>
            )}
            <SidebarThemeButton />
            <SidebarSupportButton />
            {!isPanelOpen && (
              <Link href={webappUrl} passHref prefetch={false}>
                <a
                  href={webappUrl}
                  aria-label="daily.dev home"
                  onClick={onLogoClick}
                  className="focus-outline flex size-8 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  <LogoIcon className={{ container: 'h-4 w-auto' }} />
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grip on the sidebar's right edge — always present (the resize
          affordance), in both the rail and the open panel. Open: drag to
          resize / pull past the threshold to collapse. Collapsed rail: drag to
          pull open (or click). One mousedown handler covers click + drag, so
          both states share a smooth transition. */}
      {!forceExpanded && (
        <Tooltip
          side="right"
          content={
            isExpanded ? (
              <span className="flex flex-col gap-0.5">
                <span>Drag to resize</span>
                <span className="text-text-tertiary">
                  Toggle sidebar · {sidebarToggleShortcut}
                </span>
              </span>
            ) : (
              <span className="flex flex-col gap-0.5">
                <span>Drag or click to open</span>
                <span className="text-text-tertiary">
                  Toggle sidebar · {sidebarToggleShortcut}
                </span>
              </span>
            )
          }
        >
          <button
            type="button"
            aria-label={
              isExpanded
                ? `Resize sidebar, toggle with ${sidebarToggleShortcut}`
                : 'Open sidebar'
            }
            onMouseDown={onResizeHandleMouseDown}
            className="group/resize z-10 absolute inset-y-0 -right-1.5 hidden w-3 cursor-col-resize laptop:block"
          >
            {/* Full-height strip that tints top-to-bottom on hover/drag. */}
            <span
              aria-hidden
              className={classNames(
                'pointer-events-none absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 transition-colors duration-150',
                isResizing
                  ? 'bg-surface-hover'
                  : 'bg-transparent group-hover/resize:bg-surface-hover',
              )}
            />
            {/* Always-visible grip: a rounded rectangle, thin + light by
                  default, widening and turning blue on hover/drag. */}
            <span
              aria-hidden
              className={classNames(
                'pointer-events-none absolute left-1/2 top-1/2 h-9 -translate-x-1/2 -translate-y-1/2 rounded-4 transition-all duration-150',
                isResizing
                  ? 'w-1 bg-accent-blueCheese-default'
                  : 'w-0.5 bg-border-subtlest-secondary group-hover/resize:w-1 group-hover/resize:bg-accent-blueCheese-default',
              )}
            />
          </button>
        </Tooltip>
      )}
    </SidebarAside>
  );
};
