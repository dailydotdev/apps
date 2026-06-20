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
  createSidebarSeparatorItem,
  isSidebarItemActive,
  ListIcon,
  Nav,
  railTabClass,
  railTabLabelClass,
  SidebarAside,
  SidebarScrollWrapper,
} from './common';
import type { SidebarMenuItem } from './common';
import { Section } from './Section';
import { getSidebarCategoryForPath, SidebarCategory } from './sidebarCategory';
import type { SidebarCategoryId } from './sidebarCategory';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useBanner } from '../../hooks/useBanner';
import { ExploreSection } from './sections/ExploreSection';
import { ProfilePanelSection } from './sections/ProfilePanelSection';
import { SettingsPanelSection } from './sections/SettingsPanelSection';
import type { ComposerKind } from '../post/composer/types';
import { QuestRailIcon } from '../quest/QuestRailIcon';
import { useClaimableQuestCount } from '../../hooks/useQuestDashboard';
import { Bubble } from '../tooltips/utils';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { NetworkSection } from './sections/NetworkSection';
import { GameCenterSection } from './sections/GameCenterSection';
import { HelpWidget } from '../help/HelpWidget';
import {
  BellIcon,
  BrowserGroupIcon,
  CompassIcon,
  CreditCardIcon,
  DocsIcon,
  EditIcon,
  ExitIcon,
  EyeIcon,
  FlagIcon,
  GiftIcon,
  HelpIcon,
  HomeIcon,
  LinkIcon,
  MegaphoneIcon,
  MenuIcon,
  MicrophoneIcon,
  MoveToIcon,
  NewPostIcon,
  PhoneIcon,
  PollIcon,
  PrivacyIcon,
  SearchIcon,
  SettingsIcon,
  SidebarArrowLeft,
  SourceIcon,
  TerminalIcon,
  TrendingIcon,
} from '../icons';
import { useSettingsBooleanFlag } from '../../hooks/useSettingsBooleanFlag';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { RailHoverPanel } from './RailHoverPanel';
import { StreakPopover } from './StreakPopover';
import { StreakRing } from './StreakRing';
import { useSpotlight } from '../spotlight/SpotlightContext';
import { useAuthContext } from '../../contexts/AuthContext';
import NotificationsBell from '../notifications/NotificationsBell';
import { NotificationsRailPanel } from '../notifications/NotificationsRailPanel';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import Link from '../utilities/Link';
import { SharedFeedPage, HorizontalSeparator } from '../utilities';
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
import LogoIcon from '../../svg/LogoIcon';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { ProfileSection as ProfileMenuSection } from '../ProfileMenu/ProfileSection';
import type { ProfileSectionItemProps } from '../ProfileMenu/ProfileSectionItem';
import { ThemeSection } from '../ProfileMenu/sections/ThemeSection';
import { LogoutReason } from '../../lib/user';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useCanPurchaseCores } from '../../hooks/useCoresFeature';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import { FeedbackWidget } from '../feedback';
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
    label: 'Explore',
    defaultPath: `${webappUrl}posts`,
    icon: (active) => (
      <CompassIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    // Rendered via the avatar (not the tablist loop); listed here so panel
    // title / label lookups resolve. The icon is unused — the avatar renders
    // the user's profile picture.
    id: SidebarCategory.Profile,
    // Surfaced as the panel title and the avatar tooltip/label.
    label: 'You',
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
];

const railButtonClass =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus-outline';
// Shared group so the rail's click popups (support, profile menu, streak) are
// mutually exclusive — opening one closes the others.
const RAIL_POPUP_GROUP = 'sidebar-rail';
// How long the urgency tooltip auto-surfaces when the streak turns critical.
const STREAK_CRITICAL_TOOLTIP_MS = 5000;
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
// Vertical slack (px) added to the safe-zone triangle so the pointer can dip
// slightly past the panel's top/bottom edge while arcing in without losing it.
const SAFE_ZONE_BUFFER = 26;

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

// Theme toggling now lives in the profile dropdown (ThemeSection, matching
// production). The rail slot is reused for a quick "Invite friends" shortcut.
const SidebarInviteButton = (): ReactElement => (
  <Tooltip side="right" content="Invite friends">
    <Link href={`${settingsUrl}/invite`} passHref>
      <a aria-label="Invite friends" className={railButtonClass}>
        <GiftIcon size={IconSize.Small} aria-hidden />
      </a>
    </Link>
  </Tooltip>
);

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
  const { isOpen, onUpdate, wrapHandler } =
    useInteractivePopup(RAIL_POPUP_GROUP);

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
          <ProfileMenuSection items={supportItems} linkIconHoverOnly />
          <HorizontalSeparator />
          <ProfileMenuSection items={legalItems} linkIconHoverOnly />
        </InteractivePopup>
      )}
    </>
  );
};

// Options for the rail "+" hover panel. Each opens the composer modal with the
// matching kind preselected (not a dedicated page). Built as SidebarMenuItem
// rows so the list matches the other category panels.
const createMenuOptions: {
  title: string;
  kind: ComposerKind;
  icon: (active: boolean) => ReactElement;
}[] = [
  {
    title: 'Free form',
    kind: 'text',
    icon: (active) => <ListIcon Icon={() => <EditIcon secondary={active} />} />,
  },
  {
    title: 'Share a link',
    kind: 'link',
    icon: (active) => <ListIcon Icon={() => <LinkIcon secondary={active} />} />,
  },
  {
    title: 'Poll',
    kind: 'poll',
    icon: (active) => <ListIcon Icon={() => <PollIcon secondary={active} />} />,
  },
  {
    title: 'Live',
    kind: 'standup',
    icon: (active) => (
      <ListIcon Icon={() => <MicrophoneIcon secondary={active} />} />
    ),
  },
];

// Account/app controls that used to live in the avatar dropdown now sit behind
// a bottom-rail gear (sibling to Invite/Support). Profile-related items moved
// to the avatar panel; this keeps the leftover account/app/billing actions.
const SidebarSettingsButton = (): ReactElement => {
  const { logout } = useAuthContext();
  const { isOpen, onUpdate, wrapHandler } =
    useInteractivePopup(RAIL_POPUP_GROUP);
  const { openModal } = useLazyModal();
  const canPurchaseCores = useCanPurchaseCores();

  const settingsItems: ProfileSectionItemProps[] = [
    { title: 'Settings', href: settingsDefaultPath, icon: SettingsIcon },
    { title: 'Appearance', href: `${settingsUrl}/appearance`, icon: EyeIcon },
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

  const logoutItems: ProfileSectionItemProps[] = [
    {
      title: 'Log out',
      icon: ExitIcon,
      onClick: () => logout(LogoutReason.ManualLogout),
    },
  ];

  return (
    <>
      <Tooltip side="right" content="Settings">
        <button
          type="button"
          aria-label="Settings"
          aria-expanded={isOpen}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
          className={classNames(
            railButtonClass,
            isOpen && 'bg-background-default !text-text-primary',
          )}
        >
          <SettingsIcon secondary={isOpen} size={IconSize.Small} aria-hidden />
        </button>
      </Tooltip>
      {isOpen && (
        <InteractivePopup
          closeOutsideClick
          onClose={() => onUpdate(false)}
          position={InteractivePopupPosition.SidebarSupportMenu}
          className="flex w-64 flex-col gap-2 !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
        >
          <ThemeSection className="px-1" />
          <HorizontalSeparator />
          <ProfileMenuSection items={settingsItems} linkIconHoverOnly />
          <HorizontalSeparator />
          <ProfileMenuSection items={billingItems} linkIconHoverOnly />
          <HorizontalSeparator />
          <ProfileMenuSection items={logoutItems} linkIconHoverOnly />
        </InteractivePopup>
      )}
    </>
  );
};

// The avatar is a rail tab: it opens the Profile context panel (your feeds,
// activity, pins, custom feeds) like every other category — no dropdown menu.
// The streak chip is still its own button, opening the streak calendar.
const SidebarProfileButton = ({
  isSelected,
  isExpanded,
  panel,
  onSelect,
  onPreview,
  onPreviewLeave,
}: {
  isSelected: boolean;
  isExpanded: boolean;
  panel: ReactElement;
  onSelect: () => void;
  onPreview: () => void;
  onPreviewLeave: (event: React.MouseEvent) => void;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const {
    isEnabled: isStreakEnabled,
    isLoading: isStreakLoading,
    streak,
    state: streakState,
    count: streakCount,
    hasReadToday,
    copy: streakCopy,
  } = useStreakRingState();
  const { isOpen: isStreakOpen, onUpdate: setStreakOpen } =
    useInteractivePopup(RAIL_POPUP_GROUP);
  const streakChipRef = useRef<HTMLButtonElement>(null);
  // Only on critical: auto-open the streak tooltip to nudge the user for ~5s,
  // then hide it (or sooner, the moment they hover the streak). Re-arms each
  // time the streak re-enters the critical state.
  const [autoOpenStreakTooltip, setAutoOpenStreakTooltip] = useState(false);
  const prevStreakCriticalRef = useRef(false);
  useEffect(() => {
    const isCritical = streakState === 'critical';
    const wasCritical = prevStreakCriticalRef.current;
    prevStreakCriticalRef.current = isCritical;
    if (isCritical && !wasCritical) {
      setAutoOpenStreakTooltip(true);
      const timeout = setTimeout(
        () => setAutoOpenStreakTooltip(false),
        STREAK_CRITICAL_TOOLTIP_MS,
      );
      return () => clearTimeout(timeout);
    }
    if (!isCritical) {
      setAutoOpenStreakTooltip(false);
    }
    return undefined;
  }, [streakState]);

  if (!user) {
    return null;
  }

  const avatarButton = (
    <Tooltip
      side="right"
      content="You"
      collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
    >
      <button
        type="button"
        role="tab"
        aria-label="You"
        aria-selected={isSelected}
        aria-controls="sidebar-context-panel"
        onClick={onSelect}
        // Avatar scales up a touch on hover — no glow. `block` on the image
        // kills the inline baseline gap. A ring marks the selected state.
        className={classNames(
          'focus-outline size-full overflow-hidden rounded-12 transition-transform hover:scale-105',
          isSelected && 'ring-2 ring-text-primary',
        )}
      >
        <ProfilePicture
          user={user}
          size={ProfileImageSize.Large}
          nativeLazyLoading
          className="block"
        />
      </button>
    </Tooltip>
  );

  return (
    <>
      <RailHoverCard label="You" panel={panel} enabled={!isExpanded}>
        <div
          className="relative mb-2.5 flex w-full justify-center"
          data-sidebar-preview={SidebarCategory.Profile}
          onMouseEnter={onPreview}
          onMouseLeave={onPreviewLeave}
        >
          {isStreakEnabled ? (
            // Shared StreakRing renders the "border legend" visual (avatar in a
            // bordered box; flame + count break through the bottom border). The
            // avatar (profile panel) and the chip (streak popover) are two
            // distinct buttons — all state visuals live in StreakRing /
            // useStreakRingState.
            <StreakRing
              state={streakState}
              count={streakCount}
              hasReadToday={hasReadToday}
              isLoading={isStreakLoading}
              chipRef={streakChipRef}
              chipAriaLabel={`Reading streak: ${streakCount} days. ${streakCopy}`}
              chipAriaExpanded={isStreakOpen}
              onChipClick={(event) => {
                event.stopPropagation();
                setStreakOpen(!isStreakOpen);
              }}
              chipTooltip={streakCopy}
              chipTooltipOpen={autoOpenStreakTooltip}
              onMouseEnter={() => setAutoOpenStreakTooltip(false)}
              avatar={avatarButton}
            />
          ) : (
            avatarButton
          )}
        </div>
      </RailHoverCard>
      {isStreakOpen && streak && (
        <StreakPopover
          streak={streak}
          triggerRef={streakChipRef}
          onClose={() => setStreakOpen(false)}
        />
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
  const { openModal, modal } = useLazyModal();
  const { isLoggedIn, user } = useAuthContext();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  // The flat Home button targets the "For You" feed. On extension there's no
  // router, so it always uses the explicit /my-feed path.
  let myFeedPath = isCustomDefaultFeed ? '/my-feed' : '/';
  if (isExtension) {
    myFeedPath = '/my-feed';
  }
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
  // items fold into a 3-dots "More" dropdown. Fold order: Quests, then
  // Notifications. Explore, Squads and New post always stay. Measured against
  // the nav list's height so it tracks the viewport like Slack's sidebar.
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
      // Ignore zero-height measurements (e.g. a hidden/not-yet-laid-out mount)
      // so we don't briefly fold every item into the "More" menu.
      if (list.clientHeight <= 0) {
        return;
      }
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
  // When the For You feed is the current page, the Home button reads as
  // selected — fill its icon (secondary) instead of the outline.
  const isHomeActive = isSidebarItemActive(activePage, myFeedPath);

  const resolvedBaseCategory = useMemo((): SidebarCategoryId => {
    // The home / For You feed is a logged-in user's personal hub, so it
    // defaults to the Profile panel rather than Explore. Anonymous users (no
    // profile panel) fall back to Explore.
    if (isLoggedIn && isHomeActive) {
      return SidebarCategory.Profile;
    }
    // The user's own profile page (`/<username>` and its sub-pages) also keeps
    // the Profile panel — the avatar navigates here, so it must resolve back to
    // Profile (otherwise the optimistic pending category never clears).
    const path = activePage.split('?')[0];
    const ownProfileBase = user?.username ? `/${user.username}` : null;
    if (
      isLoggedIn &&
      ownProfileBase &&
      (path === ownProfileBase || path.startsWith(`${ownProfileBase}/`))
    ) {
      return SidebarCategory.Profile;
    }
    if (isFeedPage) {
      return SidebarCategory.Main;
    }
    return getSidebarCategoryForPath(activePage);
  }, [activePage, isFeedPage, isHomeActive, isLoggedIn, user?.username]);

  // Opening a single post (`/posts/[id]`) shouldn't change the sidebar context
  // — the panel behind the post page keeps whatever you came from (History,
  // a Squad, etc.). Remember the last non-post category (committed renders
  // only, so it's concurrent-safe) and reuse it on posts.
  const isPostPage = router.pathname === '/posts/[id]';
  const lastNonPostCategoryRef = useRef<SidebarCategoryId>(
    SidebarCategory.Main,
  );
  useEffect(() => {
    if (!isPostPage) {
      lastNonPostCategoryRef.current = resolvedBaseCategory;
    }
  }, [isPostPage, resolvedBaseCategory]);
  const resolvedCategory = isPostPage
    ? lastNonPostCategoryRef.current
    : resolvedBaseCategory;

  // Optimistic override so a rail click feels instant even when
  // router.push is async. Cleared once the URL catches up.
  const [pendingCategory, setPendingCategory] =
    useState<SidebarCategoryId | null>(null);
  const selectedCategory = pendingCategory ?? resolvedCategory;
  // On settings pages the sidebar collapses to a single full-width settings
  // panel (no rail), so hover-preview is irrelevant — pin the panel to Settings.
  const isSettingsSelected = selectedCategory === SidebarCategory.Settings;

  // Hovering a rail tab previews that category's panel without committing to
  // it; the panel falls back to the selected/pinned category. Cleared when the
  // cursor leaves the sidebar (see handleRailMouseLeave).
  const [hoveredCategory, setHoveredCategory] =
    useState<SidebarCategoryId | null>(null);
  const activeCategory = isSettingsSelected
    ? SidebarCategory.Settings
    : hoveredCategory ?? selectedCategory;
  // Hovering the "+" previews the create-post options panel (takes precedence
  // over a hovered category). Clicking "+" opens the composer modal instead.
  const [isCreateHovered, setIsCreateHovered] = useState(false);

  // Clear the optimistic override once the route actually settles (activePage
  // changed). The category resolved from the URL is now authoritative — keeping
  // a stale pending value would strand the panel on the wrong category until a
  // refresh (e.g. after the avatar navigates and you then open Settings). The
  // pending value still bridges the click→route-change gap for instant feedback.
  useEffect(() => {
    setPendingCategory(null);
  }, [activePage]);

  // Settings load client-side, so on a hard refresh `sidebarExpanded`
  // flips from its `false` default to the user's stored value once
  // `loadedSettings` resolves. The width/opacity transitions below would
  // animate that initial settle, making the sidebar appear to slide/fade
  // in. Keep transitions off until settings have loaded so the sidebar
  // snaps into its final state on first paint and only genuine user
  // toggles animate afterwards.
  const [isRailHovered, setIsRailHovered] = useState(false);
  // After a click-to-collapse the cursor is still over the sidebar. Suppress
  // the hover-peek until it actually leaves and re-enters, so the first click
  // collapses instead of instantly re-expanding under the cursor.
  const peekSuppressedRef = useRef(false);
  // Prediction-cone "safe zone": while the pointer arcs from the active tab
  // into the panel, block the rail tabs' pointer events so clipping a
  // neighbouring tab can't switch the preview (menu-aim done with pointer
  // blocking rather than fragile slope guesses).
  const panelRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const safeBlockedRef = useRef(false);
  const safePolyRef = useRef<Array<[number, number]> | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
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
  // Scoped to when focus is inside the sidebar; otherwise a global Escape
  // (closing a modal, blurring a field) would yank the panel back to Main.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      if (!sidebarRef.current?.contains(document.activeElement)) {
        return;
      }
      setPendingCategory(SidebarCategory.Main);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded: true,
      shouldShowLabel: true,
      activePage,
      compact: true,
    }),
    [activePage],
  );

  const getCategoryDefaultPath = useCallback(
    (category: SidebarCategoryId): string | null => {
      if (category === SidebarCategory.Settings) {
        return settingsDefaultPath;
      }
      return (
        sidebarCategories.find((entry) => entry.id === category)?.defaultPath ??
        null
      );
    },
    [],
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

  // Avatar click opens the Profile panel and navigates to the user's profile
  // page. Like a rail tab, it sets the pending category for instant feedback.
  const onSelectProfile = useCallback(() => {
    setPendingCategory(SidebarCategory.Profile);
    if (!user) {
      return;
    }
    const targetPath = `${webappUrl}${user.username}`;
    Promise.resolve(router.push(targetPath)).catch(() => undefined);
  }, [router, user]);

  // The flat Home button switches to the "For You" feed. It mirrors the rail
  // tabs' optimistic panel switch (Main = Explore) while the route resolves.
  const onHomeClick = useCallback(() => {
    // Home opens the Profile panel by default (logged in); Explore for anon.
    setPendingCategory(
      isLoggedIn ? SidebarCategory.Profile : SidebarCategory.Main,
    );
    onNavTabClick?.(isCustomDefaultFeed ? SharedFeedPage.MyFeed : '/');
  }, [isCustomDefaultFeed, isLoggedIn, onNavTabClick]);

  // Remember the last non-settings location so "Back to app" returns the user
  // where they were rather than always dumping them on the home feed.
  const lastAppPathRef = useRef(webappUrl);
  useEffect(() => {
    if (getSidebarCategoryForPath(activePage) !== SidebarCategory.Settings) {
      lastAppPathRef.current = activePage;
    }
  }, [activePage]);

  const onBackToApp = useCallback(() => {
    setPendingCategory(SidebarCategory.Main);
    Promise.resolve(router.push(lastAppPathRef.current)).catch(() => undefined);
  }, [router]);

  // Entering settings collapses the rail, so any stale hover/create preview
  // would otherwise leak into the settings panel — clear it.
  useEffect(() => {
    if (isSettingsSelected) {
      setHoveredCategory(null);
      setIsCreateHovered(false);
    }
  }, [isSettingsSelected]);

  const onToggleExpanded = useCallback(() => {
    logEvent({
      event_name: `${sidebarExpanded ? 'open' : 'close'} sidebar`,
    });
    if (sidebarExpanded) {
      peekSuppressedRef.current = true;
      setIsRailHovered(false);
    }
    toggleSidebarExpanded();
  }, [logEvent, sidebarExpanded, toggleSidebarExpanded]);

  // `[` toggles the sidebar open/closed (mirrors the collapse toggle button).
  // Skipped while typing into a field so it doesn't hijack the bracket key.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '[' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      ) {
        return;
      }
      onToggleExpanded();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleExpanded]);

  const exitSafeZone = useCallback(() => {
    safeBlockedRef.current = false;
    safePolyRef.current = null;
  }, []);

  const handleRailMouseLeave = useCallback(() => {
    peekSuppressedRef.current = false;
    setIsRailHovered(false);
    setHoveredCategory(null);
    setIsCreateHovered(false);
    lastPointerRef.current = null;
    exitSafeZone();
  }, [exitSafeZone]);

  // --- Prediction cone ---------------------------------------------------
  // `commitPreview` maps a rail trigger key to the panel preview it shows.
  // Hovering a panel-bearing icon is also what opens the collapsed peek — the
  // rail no longer expands just because the cursor entered it, so empty space
  // and panel-less icons (logo, Home, Search, Invite, Support, Settings) never
  // pop the panel open.
  const commitPreview = useCallback((key: string) => {
    // While arcing toward the panel, ignore hover-switches but DON'T block
    // pointer events — blocking the tabs swallowed real clicks (the panel is
    // already open, so there's nothing to re-open here).
    if (safeBlockedRef.current) {
      return;
    }
    if (!peekSuppressedRef.current) {
      setIsRailHovered(true);
    }
    if (key === 'create') {
      setIsCreateHovered(true);
      // Clear any category preview so a previously-hovered tab (e.g. Quests)
      // doesn't keep its hover/preview state while the New post panel shows.
      setHoveredCategory(null);
      return;
    }
    setIsCreateHovered(false);
    setHoveredCategory(key as SidebarCategoryId);
  }, []);

  const enterSafeZone = useCallback((x: number, y: number) => {
    const panel = panelRef.current?.getBoundingClientRect();
    if (!panel || panel.width < 8) {
      return;
    }
    // Triangle from the pointer to the panel's near (left) edge, padded
    // vertically. While the pointer stays inside it, hover-switches are
    // ignored (via commitPreview's guard) — but tabs stay clickable.
    safePolyRef.current = [
      [x, y],
      [panel.left, panel.top - SAFE_ZONE_BUFFER],
      [panel.left, panel.bottom + SAFE_ZONE_BUFFER],
    ];
    safeBlockedRef.current = true;
  }, []);

  const pointInPolygon = (
    x: number,
    y: number,
    poly: Array<[number, number]>,
  ): boolean => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  };

  // Enter the safe zone when the pointer leaves the *active* trigger heading
  // toward the panel (rightward). Pointer blocking then takes over.
  const handlePreviewLeave = useCallback(
    (key: string, event: React.MouseEvent) => {
      if (safeBlockedRef.current) {
        return;
      }
      const activeKey = isCreateHovered ? 'create' : activeCategory;
      if (key !== activeKey) {
        return;
      }
      const prev = lastPointerRef.current;
      // Heading rightward off the active trigger = arcing toward the panel.
      // enterSafeZone no-ops when the panel isn't actually open.
      if (prev && event.clientX - prev.x > 0) {
        enterSafeZone(event.clientX, event.clientY);
      }
    },
    [isCreateHovered, activeCategory, enterSafeZone],
  );

  const handleRailMouseMove = useCallback(
    (event: React.MouseEvent) => {
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      if (!safeBlockedRef.current) {
        return;
      }
      const panel = panelRef.current?.getBoundingClientRect();
      if (!panel) {
        exitSafeZone();
        return;
      }
      const { clientX: x, clientY: y } = event;
      const overPanel =
        x >= panel.left &&
        x <= panel.right &&
        y >= panel.top &&
        y <= panel.bottom;
      if (overPanel) {
        // Reached the panel — keep the current preview, release the block.
        exitSafeZone();
        return;
      }
      if (safePolyRef.current && pointInPolygon(x, y, safePolyRef.current)) {
        return;
      }
      // Left the safe zone without reaching the panel — honour the trigger
      // the pointer actually landed on.
      exitSafeZone();
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      const trigger = el?.closest('[data-sidebar-preview]');
      const key = trigger?.getAttribute('data-sidebar-preview');
      if (key) {
        commitPreview(key);
      }
    },
    [exitSafeZone, commitPreview],
  );

  useEffect(() => () => exitSafeZone(), [exitSafeZone]);

  const renderCategorySection = (category: SidebarCategoryId): ReactElement => {
    if (category === SidebarCategory.Squads) {
      return (
        <NetworkSection
          {...defaultRenderSectionProps}
          isItemsButton={isNavButtons ?? false}
          asPin
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
        <ProfilePanelSection
          {...defaultRenderSectionProps}
          onNavTabClick={onNavTabClick}
          isItemsButton={false}
        />
      );
    }
    return (
      <ExploreSection
        {...defaultRenderSectionProps}
        onNavTabClick={onNavTabClick}
        isItemsButton={isNavButtons ?? false}
      />
    );
  };

  // Settings pages render their navigation only inside this context panel, so
  // a collapsed sidebar would leave no way to move between settings sections.
  // Force the panel open and hide the collapse toggle while on settings —
  // without touching the user's stored `sidebarExpanded` preference, so the
  // sidebar returns to its chosen state once they navigate away.
  const forceExpanded = isSettingsSelected;
  // Reddit-style peek: when the sidebar is collapsed (not pinned open),
  // hovering anywhere over the rail expands the full sidebar as an overlay on
  // top of the content. The content keeps its rail-width offset (MainLayout
  // pads from `sidebarExpanded`, which the hover never touches), so nothing
  // behind the sidebar shifts — it just paints over the feed.
  const isCollapsedHoverMode = !sidebarExpanded && !forceExpanded;
  const isHoverExpanded = isCollapsedHoverMode && isRailHovered;
  const isExpanded = sidebarExpanded || forceExpanded || isHoverExpanded;

  const renderCategoryTab = (
    categoryId: SidebarCategoryId,
  ): ReactElement | null => {
    const category = sidebarCategories.find((entry) => entry.id === categoryId);
    if (!category) {
      return null;
    }
    // The "selected" (white) indicator tracks the committed category so it
    // never moves while you hover/preview other tabs — you always know where
    // you are. Hovering only previews the panel and shows the row's hover
    // background; it doesn't claim the selected state.
    const isSelected = selectedCategory === category.id;
    const isPreviewing = !isSelected && activeCategory === category.id;
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
          data-sidebar-preview={category.id}
          aria-controls="sidebar-context-panel"
          aria-label={category.label}
          aria-selected={isSelected}
          onClick={() => onSelectCategory(category.id)}
          onMouseEnter={() => {
            onPrefetchCategory(category.id);
            commitPreview(category.id);
          }}
          onMouseLeave={(event) => handlePreviewLeave(category.id, event)}
          onFocus={() => onPrefetchCategory(category.id)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setPendingCategory(SidebarCategory.Main);
            }
          }}
          className={classNames(
            railTabClass,
            isSelected && 'bg-background-default !text-text-primary',
            isPreviewing && 'bg-surface-hover text-text-primary',
          )}
        >
          <span className="relative flex items-center justify-center">
            {category.icon(isSelected)}
          </span>
          {!isCompact && (
            <span className={railTabLabelClass}>{category.label}</span>
          )}
          {category.id === SidebarCategory.GameCenter && showQuestBadge && (
            // Pin the badge to the button's top-right corner (not the icon's)
            // so the quest level ring + number stay fully visible.
            <Bubble className="right-1 top-1 px-1">
              {claimableQuestCount}
            </Bubble>
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

  const createMenuItems = useMemo<SidebarMenuItem[]>(
    () => [
      ...createMenuOptions.map(({ title, kind, icon }) => ({
        icon,
        title,
        // SidebarItem/ClickableNavItem dispatches `action` (not `onClick`) and
        // requires a `path` for link items — a path-less `onClick` row throws.
        action: () =>
          openModal({
            type: LazyModal.SmartComposer,
            props: { initialKind: kind },
          }),
      })),
      // Divider below the post types, then the Posting settings page shortcut
      // (→ /settings/composition) — its open-link icon reveals on row hover.
      createSidebarSeparatorItem('create-settings-divider'),
      {
        title: 'Posting settings',
        path: `${settingsUrl}/composition`,
        isForcedLink: true,
        showOpenLinkIcon: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SettingsIcon secondary={active} />} />
        ),
      },
    ],
    [openModal],
  );

  // The panel reflects the create-post options when hovering "+" OR while the
  // composer modal it opens is still open — otherwise clicking "+" would shift
  // the background panel back to the feed as focus leaves the rail (a glitch).
  const isComposerOpen = modal?.type === LazyModal.SmartComposer;
  const showCreatePanel = isCreateHovered || isComposerOpen;
  const renderSelectedSection = (): ReactElement =>
    showCreatePanel ? (
      <Section
        {...defaultRenderSectionProps}
        items={createMenuItems}
        isItemsButton={false}
      />
    ) : (
      renderCategorySection(activeCategory)
    );

  const activeLabel = sidebarCategories.find(
    (category) => category.id === activeCategory,
  )?.label;
  // Preview state (panel content/title) vs committed selection (the bell's
  // filled indicator) — kept separate so hover-preview never moves the
  // selected indicator.
  const isNotificationsActive =
    activeCategory === SidebarCategory.Notifications;
  const isNotificationsSelected =
    selectedCategory === SidebarCategory.Notifications;
  const isHomePanel =
    !showCreatePanel && activeCategory === SidebarCategory.Main;
  const isUtilityPanelSelected = !isHomePanel;
  const utilityPanelTitle = (() => {
    if (showCreatePanel) {
      return 'New post';
    }
    if (activeCategory === SidebarCategory.Settings) {
      return 'Settings';
    }
    if (isNotificationsActive) {
      return 'Notifications';
    }
    return activeLabel ?? '';
  })();

  return (
    <SidebarAside
      ref={sidebarRef}
      data-testid="sidebar-aside"
      onMouseLeave={handleRailMouseLeave}
      onMouseMove={handleRailMouseMove}
      className={classNames(
        'laptop:bottom-0 laptop:h-dvh laptop:min-h-dvh laptop:flex-row laptop:border-r-0',
        isExpanded ? railExpandedWidth : railCollapsedWidth,
        isBannerAvailable
          ? 'laptop:[--safe-area-top-offset:2rem]'
          : 'laptop:[--safe-area-top-offset:0rem]',
        // Match the V2 page background exactly (same color-mix MainLayout uses)
        // so the rail + panel blend with the rest of the app in every state —
        // collapsed, peeking overlay and pinned. It's opaque, which the peek
        // overlay needs to paint over the feed.
        !featureTheme &&
          'laptop:!bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]',
        // While peeking, the panel floats over the feed — add a right border so
        // its edge reads clearly against the content behind it.
        isHoverExpanded &&
          'laptop:!border-r laptop:border-border-subtlest-tertiary',
        featureTheme && 'bg-transparent',
        suppressTransition,
      )}
    >
      {isExpanded && !isSettingsSelected && (
        <span
          aria-hidden
          className={classNames(
            'pointer-events-none absolute inset-y-0 hidden border-r border-border-subtlest-quaternary laptop:block',
            railSeparatorLeft,
          )}
        />
      )}
      {!isSettingsSelected && (
        <nav
          aria-label="Primary navigation"
          className={classNames(
            // pt matches the streak tile's side gap (54px tile centred in the
            // 68px content = 7px + px-1.5 6px = 13px) so its top/left/right
            // spacing is equal.
            'flex h-dvh min-h-dvh shrink-0 flex-col items-center gap-1 px-1.5 pb-3 pt-[13px]',
            railNavWidth,
          )}
        >
          <Tooltip
            side="right"
            content="daily.dev"
            collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
          >
            {/* mt nudges the logo down so it lines up vertically with the
                panel title row (which sits at pt-6). */}
            <div className="mb-1 mt-2.5">
              <Link href={webappUrl} passHref prefetch={false}>
                <a
                  href={webappUrl}
                  aria-label="daily.dev"
                  className="focus-outline hover:opacity-80 flex size-10 items-center justify-center rounded-12 text-text-primary transition-opacity"
                  onClick={onLogoClick}
                >
                  <LogoIcon className={{ container: 'h-4 w-auto' }} />
                </a>
              </Link>
            </div>
          </Tooltip>

          <Tooltip
            side="right"
            content="Home"
            collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
          >
            <Link href={myFeedPath} passHref>
              <a
                href={myFeedPath}
                aria-label="Home"
                // Matches the Search icon: same size, hover background and
                // tertiary color; the icon fills (and goes primary) when the
                // For You feed is the current page.
                className={classNames(
                  'focus-outline flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary',
                  isHomeActive && '!text-text-primary',
                )}
                onClick={onHomeClick}
              >
                <HomeIcon
                  secondary={isHomeActive}
                  size={IconSize.Small}
                  aria-hidden
                />
              </a>
            </Link>
          </Tooltip>

          <Tooltip
            side="right"
            // The ⌘K hint moved off the rail and into the tooltip to save
            // vertical space — same treatment as the sidebar-toggle shortcut.
            content={
              <span className="flex items-center gap-2">
                Search
                <span className="flex items-center gap-0.5">
                  {shortcutKeys.map((key) => (
                    <kbd
                      key={key}
                      className="rounded-4 border border-border-subtlest-tertiary px-1 font-sans text-text-secondary typo-caption2"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
              </span>
            }
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
            className="my-2 h-px w-6 bg-border-subtlest-quaternary"
          />

          {isLoggedIn && (
            <SidebarProfileButton
              isSelected={selectedCategory === SidebarCategory.Profile}
              isExpanded={isExpanded}
              panel={renderCategorySection(SidebarCategory.Profile)}
              onSelect={onSelectProfile}
              onPreview={() => commitPreview(SidebarCategory.Profile)}
              onPreviewLeave={(event) =>
                handlePreviewLeave(SidebarCategory.Profile, event)
              }
            />
          )}

          <div
            ref={navListRef}
            role="tablist"
            aria-label="Sidebar categories"
            // overflow-visible (not hidden) so the focus-visible ring on the
            // selected/focused tab isn't clipped on its edges. The "More" fold
            // already guarantees the items fit, so nothing actually overflows.
            className="flex min-h-0 w-full flex-1 flex-col items-center gap-1"
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
                  <div
                    className="w-full"
                    data-sidebar-preview={SidebarCategory.Notifications}
                    onMouseEnter={() =>
                      commitPreview(SidebarCategory.Notifications)
                    }
                    onMouseLeave={(event) =>
                      handlePreviewLeave(SidebarCategory.Notifications, event)
                    }
                  >
                    <NotificationsBell
                      rail
                      noTooltip
                      railHideLabel={isCompact}
                      active={isNotificationsSelected}
                    />
                  </div>
                </RailHoverCard>
              ) : (
                <React.Fragment key={id}>
                  {renderCategoryTab(id)}
                </React.Fragment>
              ),
            )}

            {isLoggedIn && (
              <Tooltip
                side="right"
                content="New post"
                collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
              >
                <Button
                  id="sidebar-create-post"
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Small}
                  icon={<NewPostIcon />}
                  aria-label="New post"
                  aria-controls="sidebar-context-panel"
                  data-sidebar-preview="create"
                  onMouseEnter={() => commitPreview('create')}
                  onMouseLeave={(event: React.MouseEvent) =>
                    handlePreviewLeave('create', event)
                  }
                  onFocus={() => setIsCreateHovered(true)}
                  onBlur={() => setIsCreateHovered(false)}
                  onClick={() => openModal({ type: LazyModal.SmartComposer })}
                  className="mt-2 !size-9 !rounded-12 [&_svg]:!size-6"
                />
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
                  {!isCompact && (
                    <span className={railTabLabelClass}>More</span>
                  )}
                </button>
              </RailHoverCard>
            )}
          </div>

          {/* Utility actions (not tabs) — Invite/Support/Settings open their
              own popups, so this is a plain group rather than a tablist.
              Hovering it closes any open collapsed-peek so these panel-less
              icons never leave a stale panel showing. */}
          <div
            aria-label="Sidebar utilities"
            onMouseEnter={handleRailMouseLeave}
            className="mt-auto flex w-full flex-col items-center gap-1"
          >
            <SidebarInviteButton />
            <SidebarSupportButton />
            {isLoggedIn && <SidebarSettingsButton />}
          </div>
        </nav>
      )}

      {/*
        Slide-between-anchors toggle button. It tracks the *visible* right edge
        (`isExpanded`) so it follows the panel when peeking and never collides
        with the panel title. Its glyph/label reflect the *pinned* state
        (`sidebarExpanded`) — i.e. what a click does: pin open vs collapse.
        - Pinned open: ghost chip, arrow points left ("Close sidebar").
        - Collapsed: bordered chip, arrow points right ("Open sidebar").
        Hidden on settings pages, where the panel is force-expanded and
        collapsing it would hide the only settings navigation.
      */}
      {!forceExpanded && (
        <Tooltip
          side="right"
          content={
            <span className="flex items-center gap-2">
              {sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
              <kbd className="rounded-4 border border-border-subtlest-tertiary px-1 font-sans text-text-secondary typo-caption2">
                [
              </kbd>
            </span>
          }
          collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
        >
          <div
            className={classNames(
              'absolute top-6 z-1 hidden h-10 items-center transition-[left] duration-300 ease-in-out laptop:flex',
              isExpanded ? railToggleOpenLeft : railToggleClosedLeft,
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
        ref={panelRef}
        id="sidebar-context-panel"
        role="tabpanel"
        aria-labelledby={
          showCreatePanel
            ? 'sidebar-create-post'
            : `sidebar-category-${activeCategory}`
        }
        aria-label={
          showCreatePanel
            ? 'New post'
            : `${activeLabel ?? 'Settings'} navigation`
        }
        className={classNames(
          'relative flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[opacity,width] duration-300',
          // Settings collapses the rail, so the panel fills the whole sidebar.
          // eslint-disable-next-line no-nested-ternary
          isSettingsSelected
            ? 'w-full opacity-100'
            : isExpanded
            ? 'w-60 opacity-100'
            : 'pointer-events-none w-0 opacity-0',
          suppressTransition,
        )}
      >
        {/* pl-5 lines the panel title up with the list rows' icon glyphs
            (icons sit ~8px into their w-9 column) and the section titles. */}
        <div className="pl-5 pr-3 pt-6">
          {isSettingsSelected ? (
            <Button
              type="button"
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              // Smaller glyph, flipped to point left (it's a back action).
              icon={
                <MoveToIcon size={IconSize.Size16} className="-scale-x-100" />
              }
              onClick={onBackToApp}
              className="-ml-1"
            >
              Back to app
            </Button>
          ) : (
            <div className="flex h-10 items-center gap-1">
              <Typography bold type={TypographyType.Callout}>
                {utilityPanelTitle}
              </Typography>
            </div>
          )}
        </div>

        {isLoggedIn && !isUtilityPanelSelected && additionalButtons && (
          <div className="mt-2 flex items-center gap-1 px-3">
            {additionalButtons}
          </div>
        )}

        <SidebarScrollWrapper
          className={classNames(
            'mt-1 min-h-0 flex-1',
            showFeedbackWidget && !isUtilityPanelSelected && 'pb-16',
          )}
        >
          <Nav className={isUtilityPanelSelected ? '!pb-2 !pt-0' : '!pt-0'}>
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
