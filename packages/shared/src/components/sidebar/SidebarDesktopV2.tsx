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
import { Nav, SidebarAside, SidebarScrollWrapper, ListIcon } from './common';
import type { SidebarMenuItem } from './common';
import { Section } from './Section';
import { isSidebarSettingsPath } from './sidebarCategory';
import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useBanner } from '../../hooks/useBanner';
import { MainSection } from './sections/MainSection';
import { PinnedSection } from './sections/PinnedSection';
import { RecentSection } from './sections/RecentSection';
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
  CreditCardIcon,
  DevCardIcon,
  DevPlusIcon,
  DocsIcon,
  ExitIcon,
  EyeIcon,
  FeedbackIcon,
  FlagIcon,
  InviteIcon,
  JobIcon,
  JoystickIcon,
  MegaphoneIcon,
  MenuIcon,
  MoonIcon,
  PhoneIcon,
  PlusIcon,
  PrivacyIcon,
  SearchIcon,
  SettingsIcon,
  SidebarArrowLeft,
  SunIcon,
  TerminalIcon,
  TrendingIcon,
} from '../icons';
import { ThemeAutoIcon } from '../icons/ThemeAuto';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { useSpotlight } from '../spotlight/SpotlightContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { SidebarHeaderStats } from './SidebarHeaderStats';
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
import { isAppleDevice } from '../../lib/func';
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
import { HorizontalSeparator } from '../utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

const shortcutKeys = [isAppleDevice() ? '⌘' : 'Ctrl', 'K'];
const settingsDefaultPath = `${settingsUrl}/profile`;

// Square icon button shared by the theme/support footer controls.
const footerIconButtonClass =
  'focus-outline flex size-9 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary';

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
      side="top"
      content={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <button
        type="button"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={footerIconButtonClass}
        onClick={onToggleTheme}
      >
        <ActiveIcon size={IconSize.Small} aria-hidden />
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
            footerIconButtonClass,
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
          <ProfileMenuSection items={supportItems} />
          <HorizontalSeparator />
          <ProfileMenuSection items={legalItems} />
        </InteractivePopup>
      )}
    </>
  );
};

// Profile menu anchored to the footer avatar/name row. A curated, lean subset
// of the production ProfileMenu (built from the shared ProfileSection rows).
// The footer stats strip already surfaces streak/cores/reputation, so this
// menu stays navigation + account only.
const SidebarProfileButton = (): ReactElement | null => {
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
          'focus-outline flex min-w-0 flex-1 items-center gap-2 rounded-12 px-1 py-1 transition-colors hover:bg-surface-hover',
          isOpen && 'bg-surface-hover',
        )}
      >
        <span className="relative shrink-0">
          <ProfilePicture
            user={user}
            size={ProfileImageSize.Medium}
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
        <Typography
          bold
          truncate
          type={TypographyType.Subhead}
          className="min-w-0 flex-1 text-left"
        >
          {user.name ?? user.username}
        </Typography>
        <MenuIcon
          size={IconSize.Small}
          aria-hidden
          className="shrink-0 text-text-tertiary"
        />
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
  } = useSettingsContext();
  const { logEvent } = useLogContext();
  const { isAvailable: isBannerAvailable } = useBanner();
  const { open: openSpotlight } = useSpotlight();
  const { isLoggedIn } = useAuthContext();
  const { openModal } = useLazyModal();
  const { unreadCount } = useNotificationContext();
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

  // Linear-style collapse: when not pinned open, the whole panel slides
  // off-screen and the content reclaims the width (MainLayout drops its left
  // padding). Hovering the left edge peeks the panel back in as an overlay
  // without shifting the content behind it.
  const [isPeeking, setIsPeeking] = useState(false);
  // After a click-to-collapse the cursor still sits where the panel was;
  // suppress the peek until it actually leaves and re-enters the edge zone so
  // the first click collapses instead of instantly re-peeking.
  const peekSuppressedRef = useRef(false);
  const isCollapsedHoverMode = !sidebarExpanded && !forceExpanded;
  const isHoverExpanded = isCollapsedHoverMode && isPeeking;
  const isExpanded = sidebarExpanded || forceExpanded || isHoverExpanded;

  const onToggleExpanded = useCallback(() => {
    logEvent({ event_name: `${sidebarExpanded ? 'open' : 'close'} sidebar` });
    if (sidebarExpanded) {
      peekSuppressedRef.current = true;
      setIsPeeking(false);
    }
    toggleSidebarExpanded();
  }, [logEvent, sidebarExpanded, toggleSidebarExpanded]);

  const handlePeekEnter = useCallback(() => {
    if (peekSuppressedRef.current) {
      return;
    }
    setIsPeeking(true);
  }, []);

  const handleAsideLeave = useCallback(() => {
    peekSuppressedRef.current = false;
    setIsPeeking(false);
  }, []);

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded: true,
      shouldShowLabel: true,
      activePage,
    }),
    [activePage],
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

  // Notifications + Quests are top-level destinations that don't belong to any
  // grouped section, so they render as a small flat block under the primary
  // Home items (Linear keeps Inbox/single destinations flat too).
  const utilityItems: SidebarMenuItem[] = useMemo(() => {
    if (!isLoggedIn) {
      return [];
    }
    const items: SidebarMenuItem[] = [
      {
        title: 'Notifications',
        path: `${webappUrl}notifications`,
        isForcedLink: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <BellIcon secondary={active} />} />
        ),
        rightIcon: countBadge(unreadCount),
      },
    ];
    if (showQuests) {
      items.push({
        title: 'Quests',
        path: `${webappUrl}game-center`,
        isForcedLink: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <JoystickIcon secondary={active} />} />
        ),
        rightIcon: countBadge(claimableQuestCount),
      });
    }
    return items;
  }, [claimableQuestCount, countBadge, isLoggedIn, showQuests, unreadCount]);

  return (
    <>
      {/* Reopen affordance + peek hover zone, rendered as siblings so the
          aside's transform doesn't drag them off-screen with it. */}
      {isCollapsedHoverMode && !isHoverExpanded && (
        <>
          <div
            aria-hidden
            onMouseEnter={handlePeekEnter}
            className="fixed inset-y-0 left-0 z-sidebar hidden w-3 laptop:block"
          />
          <Tooltip side="right" content="Open sidebar">
            <button
              type="button"
              onClick={onToggleExpanded}
              aria-label="Open sidebar"
              aria-expanded={false}
              className="focus-outline fixed left-2 top-5 z-sidebarOverlay hidden size-8 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary laptop:flex"
            >
              <SidebarArrowLeft
                size={IconSize.Small}
                aria-hidden
                className="rotate-180"
              />
            </button>
          </Tooltip>
        </>
      )}

      <SidebarAside
        data-testid="sidebar-aside"
        onMouseLeave={handleAsideLeave}
        className={classNames(
          'laptop:bottom-0 laptop:h-dvh laptop:min-h-dvh laptop:w-[19rem] laptop:border-r-0',
          isExpanded ? 'laptop:translate-x-0' : 'laptop:-translate-x-full',
          isBannerAvailable
            ? 'laptop:[--safe-area-top-offset:2rem]'
            : 'laptop:[--safe-area-top-offset:0rem]',
          // Paint the exact V2 page background (same color-mix MainLayout uses)
          // so the sidebar and feed read as one continuous surface — the feed
          // floats as a box on top, with no divider between them. Opaque so the
          // peek overlay stays legible over the feed.
          !featureTheme &&
            'laptop:!bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]',
          featureTheme && 'laptop:!bg-transparent',
          // While peeking, the panel floats over the feed: round the free edge
          // and add a shadow so it reads as an overlay — no border, keeping the
          // one-box design intact.
          isHoverExpanded && 'laptop:rounded-r-16 laptop:shadow-3',
          suppressTransition,
        )}
      >
        {/* Definite-height, clipped flex column so the nav scrolls and the
            header/footer stay pinned on-screen regardless of list length. */}
        <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden">
          <header className="flex flex-col gap-2 px-3 pb-1 pt-5">
            <div className="flex items-center gap-1.5 pl-1">
              <Link href={webappUrl} passHref prefetch={false}>
                <a
                  href={webappUrl}
                  aria-label="Home"
                  onClick={onLogoClick}
                  className="focus-outline hover:opacity-80 flex items-center rounded-12 text-text-primary transition-opacity"
                >
                  <LogoIcon className={{ container: 'h-5 w-auto' }} />
                </a>
              </Link>
              <Typography
                bold
                type={TypographyType.Body}
                className="min-w-0 flex-1 truncate"
              >
                daily.dev
              </Typography>
              {isLoggedIn && (
                <Tooltip side="bottom" content="New post">
                  <Button
                    type="button"
                    variant={ButtonVariant.Float}
                    size={ButtonSize.Small}
                    icon={<PlusIcon />}
                    aria-label="New post"
                    onClick={() => openModal({ type: LazyModal.SmartComposer })}
                  />
                </Tooltip>
              )}
              {!forceExpanded && (
                <Tooltip
                  side="bottom"
                  content={
                    sidebarExpanded ? 'Close sidebar' : 'Pin sidebar open'
                  }
                >
                  <button
                    type="button"
                    onClick={onToggleExpanded}
                    aria-label={
                      sidebarExpanded ? 'Close sidebar' : 'Pin sidebar open'
                    }
                    aria-expanded={sidebarExpanded}
                    className="focus-outline flex size-8 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <SidebarArrowLeft
                      size={IconSize.Small}
                      aria-hidden
                      className={classNames(!sidebarExpanded && 'rotate-180')}
                    />
                  </button>
                </Tooltip>
              )}
            </div>

            <Tooltip side="bottom" content="Search">
              <button
                type="button"
                aria-label="Search"
                onClick={openSpotlight}
                className="focus-outline flex h-9 w-full items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 text-text-tertiary transition-colors hover:border-border-subtlest-secondary hover:text-text-primary"
              >
                <SearchIcon size={IconSize.Small} aria-hidden />
                <span className="flex-1 text-left typo-callout">Search</span>
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
            </Tooltip>
          </header>

          {isLoggedIn && additionalButtons && (
            <div className="flex items-center gap-1 px-3 pb-1 pt-1">
              {additionalButtons}
            </div>
          )}

          <SidebarScrollWrapper className="mt-1 min-h-0 flex-1">
            <Nav className="!pt-0">
              {forceExpanded ? (
                // Settings pages render their navigation only here, so the panel
                // takes over and shows the settings sections instead of the app
                // nav (the collapse toggle is hidden while forceExpanded).
                <SettingsPanelSection
                  {...defaultRenderSectionProps}
                  isItemsButton={false}
                />
              ) : (
                <>
                  <MainSection
                    {...defaultRenderSectionProps}
                    onNavTabClick={onNavTabClick}
                    isItemsButton={isNavButtons ?? false}
                  />
                  {utilityItems.length > 0 && (
                    <Section
                      {...defaultRenderSectionProps}
                      items={utilityItems}
                      isItemsButton={false}
                    />
                  )}
                  {isLoggedIn && (
                    <PinnedSection
                      {...defaultRenderSectionProps}
                      isItemsButton={false}
                    />
                  )}
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
                  <CustomFeedSection
                    {...defaultRenderSectionProps}
                    onNavTabClick={onNavTabClick}
                    title="Feeds"
                    isItemsButton={false}
                  />
                  {isLoggedIn && (
                    <RecentSection
                      {...defaultRenderSectionProps}
                      isItemsButton={false}
                    />
                  )}
                </>
              )}
            </Nav>
          </SidebarScrollWrapper>

          {/* Rendered outside the scroll so its popover isn't clipped; the
            widget self-hides when there's no active help campaign. */}
          {!forceExpanded && (
            <div className="px-1">
              <HelpWidget sidebarExpanded />
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-border-subtlest-quaternary px-3 py-3">
            {isLoggedIn && (
              <SidebarHeaderStats streakPopoverPlacement="right" />
            )}
            <div className="flex items-center gap-1">
              {isLoggedIn && <SidebarProfileButton />}
              <div
                className={classNames(
                  'flex items-center gap-1',
                  !isLoggedIn && 'ml-auto',
                )}
              >
                <SidebarThemeButton />
                <SidebarSupportButton />
              </div>
            </div>
            {showFeedbackWidget && <FeedbackWidget placement="sidebar" />}
          </div>
        </div>
      </SidebarAside>
    </>
  );
};
