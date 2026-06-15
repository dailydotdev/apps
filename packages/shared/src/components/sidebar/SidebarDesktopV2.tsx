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
import { MainSection } from './sections/MainSection';
import { PinnedSection } from './sections/PinnedSection';
import { RecentSection } from './sections/RecentSection';
import { CustomFeedSection } from './sections/CustomFeedSection';
import { SettingsPanelSection } from './sections/SettingsPanelSection';
import type { ComposerKind } from '../post/composer/types';
import { QuestRailIcon } from '../quest/QuestRailIcon';
import { useClaimableQuestCount } from '../../hooks/useQuestDashboard';
import { Bubble } from '../tooltips/utils';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BookmarkSection } from './sections/BookmarkSection';
import { NetworkSection } from './sections/NetworkSection';
import { GameCenterSection } from './sections/GameCenterSection';
import { HelpWidget } from '../help/HelpWidget';
import {
  AnalyticsIcon,
  AppIcon,
  BellIcon,
  BookmarkIcon,
  BrowserGroupIcon,
  CreditCardIcon,
  DevCardIcon,
  DevPlusIcon,
  DocsIcon,
  EditIcon,
  ExitIcon,
  EyeIcon,
  FlagIcon,
  GiftIcon,
  HelpIcon,
  HomeIcon,
  InviteIcon,
  JobIcon,
  LinkIcon,
  MegaphoneIcon,
  MenuIcon,
  MicrophoneIcon,
  MoveToIcon,
  NewPostIcon,
  PhoneIcon,
  PlusIcon,
  PollIcon,
  PrivacyIcon,
  ReadingStreakIcon,
  SearchIcon,
  SettingsIcon,
  SidebarArrowLeft,
  SourceIcon,
  TerminalIcon,
  TrendingIcon,
} from '../icons';
import { useSettingsBooleanFlag } from '../../hooks/useSettingsBooleanFlag';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { Origin, TargetId } from '../../lib/log';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { RailHoverPanel } from './RailHoverPanel';
import { StreakPopover } from './StreakPopover';
import { useSpotlight } from '../spotlight/SpotlightContext';
import { useAuthContext } from '../../contexts/AuthContext';
import NotificationsBell from '../notifications/NotificationsBell';
import { NotificationsRailPanel } from '../notifications/NotificationsRailPanel';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { SidebarProfileStats } from './SidebarProfileStats';
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
import { ThemeSection } from '../ProfileMenu/sections/ThemeSection';
import { UpgradeToPlus } from '../UpgradeToPlus';
import { LogoutReason } from '../../lib/user';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useCanPurchaseCores } from '../../hooks/useCoresFeature';
import { useSquadNavigation } from '../../hooks';
import { useAddBookmarkFolder } from '../../hooks/bookmark/useAddBookmarkFolder';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
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
];

const railButtonClass =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus-outline';
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

// Profile menu anchored to the bottom rail avatar. A curated, lean subset of
// the production ProfileMenu (built from the shared ProfileSection item rows)
// plus the rail-specific reputation/cores stats card.
const SidebarProfileButton = ({
  onPreviewHref,
}: {
  onPreviewHref: (href: string) => void;
}): ReactElement | null => {
  const { user, logout } = useAuthContext();
  const { isOpen, onUpdate, wrapHandler } = useInteractivePopup();
  const { openModal } = useLazyModal();
  const canPurchaseCores = useCanPurchaseCores();
  // The reading streak rides the avatar as a chip pinned to its bottom edge:
  // the avatar opens the profile menu, the chip opens the streak calendar.
  const {
    isEnabled: isStreakEnabled,
    streak,
    count: streakCount,
    hasReadToday,
    ringClassName: streakRingClassName,
    copy: streakCopy,
    isUrgent: isStreakUrgent,
    autoOpenTooltip: autoOpenStreakTooltip,
  } = useStreakRingState();
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const streakChipRef = useRef<HTMLButtonElement>(null);

  if (!user) {
    return null;
  }

  // Optimistically switch the context panel to the link's category on click —
  // same instant feedback as a rail-tab click — so the panel doesn't visibly
  // lag a slow route transition (especially the heavy Settings pages).
  const withPreview = (
    items: ProfileSectionItemProps[],
  ): ProfileSectionItemProps[] =>
    items.map((item) => {
      if (!item.href || item.external) {
        return item;
      }
      const { href, onClick } = item;
      return {
        ...item,
        onClick: () => {
          onPreviewHref(href);
          onClick?.();
        },
      };
    });

  const mainItems: ProfileSectionItemProps[] = [
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
    { title: 'Appearance', href: `${settingsUrl}/appearance`, icon: EyeIcon },
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
      <div className="relative mb-4 flex justify-center">
        <button
          type="button"
          aria-label="Open profile menu"
          aria-expanded={isOpen}
          onClick={wrapHandler(() => onUpdate(!isOpen))}
          className="focus-outline rounded-[15px] transition-transform hover:scale-105"
        >
          <span className="relative block">
            <ProfilePicture
              user={user}
              size={ProfileImageSize.Large}
              nativeLazyLoading
            />
            {/* Streak status ring as a 3px border overlay (separate layer so it
                can animate without moving the avatar). The inset/radius keep it
                concentric: outer 15px = avatar rounded-12 + 3px. */}
            {isStreakEnabled && (
              <span
                aria-hidden
                className={classNames(
                  'pointer-events-none absolute -inset-[3px] rounded-[15px] border-[3px] transition-colors',
                  streakRingClassName,
                )}
              />
            )}
          </span>
        </button>
        {isStreakEnabled && (
          <Tooltip
            side="right"
            content={streakCopy}
            open={autoOpenStreakTooltip || undefined}
          >
            <button
              ref={streakChipRef}
              type="button"
              aria-label={`Reading streak: ${streakCount} days. ${streakCopy}`}
              aria-expanded={isStreakOpen}
              onClick={(event) => {
                event.stopPropagation();
                setIsStreakOpen((open) => !open);
              }}
              className={classNames(
                'focus-outline absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center gap-0.5 rounded-8 border bg-background-default py-0.5 pl-1 pr-1.5 transition-colors',
                isStreakUrgent
                  ? 'border-status-warning'
                  : 'border-border-subtlest-tertiary hover:border-accent-bacon-default',
              )}
            >
              <ReadingStreakIcon
                secondary={hasReadToday}
                size={IconSize.Size16}
                className="text-accent-bacon-default"
              />
              <Typography
                type={TypographyType.Caption2}
                bold
                className="tabular-nums text-text-primary"
              >
                {streakCount}
              </Typography>
            </button>
          </Tooltip>
        )}
      </div>
      {isStreakOpen && streak && (
        <StreakPopover
          streak={streak}
          triggerRef={streakChipRef}
          onClose={() => setIsStreakOpen(false)}
          placement="bottom"
        />
      )}
      {isOpen && (
        <InteractivePopup
          closeOutsideClick
          onClose={() => onUpdate(false)}
          position={InteractivePopupPosition.SidebarProfileMenu}
          className="flex max-h-[calc(100dvh-4rem)] w-72 flex-col gap-3 overflow-y-auto !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
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
            <ProfileMenuSection items={withPreview(mainItems)} />

            <HorizontalSeparator />

            <ThemeSection className="px-1" />

            <HorizontalSeparator />

            <ProfileMenuSection items={withPreview(settingsItems)} />

            <HorizontalSeparator />

            <ProfileMenuSection items={withPreview(billingItems)} />

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
  const { openModal } = useLazyModal();
  const { isLoggedIn } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { openNewSquad } = useSquadNavigation();
  const addBookmarkFolder = useAddBookmarkFolder();
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

  // Profile-dropdown links navigate via `<Link>` and bypass `onSelectCategory`,
  // so the panel would otherwise wait for the route to resolve before swapping.
  // Map the link's path to its category and switch optimistically on click.
  const onPreviewHref = useCallback((href: string) => {
    const { pathname } = new URL(href, 'http://_');
    setPendingCategory(getSidebarCategoryForPath(pathname));
  }, []);

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

  const handleRailMouseEnter = useCallback(() => {
    if (peekSuppressedRef.current) {
      return;
    }
    setIsRailHovered(true);
  }, []);

  const exitSafeZone = useCallback(() => {
    safeBlockedRef.current = false;
    safePolyRef.current = null;
    if (navListRef.current) {
      navListRef.current.style.pointerEvents = '';
    }
  }, []);

  const handleRailMouseLeave = useCallback(() => {
    peekSuppressedRef.current = false;
    setIsRailHovered(false);
    setHoveredCategory(null);
    setIsCreateHovered(false);
    lastPointerRef.current = null;
    exitSafeZone();
  }, [exitSafeZone]);

  // --- Prediction cone via pointer-events blocking -----------------------
  // `commitPreview` maps a rail trigger key to the panel preview it shows.
  const commitPreview = useCallback((key: string) => {
    if (key === 'create') {
      setIsCreateHovered(true);
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
    // vertically. While the pointer stays inside it the tabs are inert.
    safePolyRef.current = [
      [x, y],
      [panel.left, panel.top - SAFE_ZONE_BUFFER],
      [panel.left, panel.bottom + SAFE_ZONE_BUFFER],
    ];
    safeBlockedRef.current = true;
    if (navListRef.current) {
      navListRef.current.style.pointerEvents = 'none';
    }
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
  const forceExpanded = isSettingsSelected;
  // Reddit-style peek: when the sidebar is collapsed (not pinned open),
  // hovering anywhere over the rail expands the full sidebar as an overlay on
  // top of the content. The content keeps its rail-width offset (MainLayout
  // pads from `sidebarExpanded`, which the hover never touches), so nothing
  // behind the sidebar shifts — it just paints over the feed.
  const isCollapsedHoverMode = !sidebarExpanded && !forceExpanded;
  const isHoverExpanded = isCollapsedHoverMode && isRailHovered;
  const isExpanded = sidebarExpanded || forceExpanded || isHoverExpanded;

  // ChatGPT-style affordance: while collapsed, the whole sidebar reads as a
  // resize handle (ew cursor). Clicking the empty surface pins it open — same
  // as the toggle — while clicks on nav items / avatar / toggle keep their own
  // behavior.
  const pinFromEmptyClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!isCollapsedHoverMode) {
      return;
    }
    const target = event.target as HTMLElement;
    if (
      target.closest(
        'a, button, input, select, textarea, [role="tab"], [role="button"], [role="menuitem"]',
      )
    ) {
      return;
    }
    onToggleExpanded();
  };

  const renderCategoryTab = (
    categoryId: SidebarCategoryId,
  ): ReactElement | null => {
    const category = sidebarCategories.find((entry) => entry.id === categoryId);
    if (!category) {
      return null;
    }
    const isSelected = activeCategory === category.id;
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
    () =>
      createMenuOptions.map(({ title, kind, icon }) => ({
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
    [openModal],
  );

  // The panel reflects the create-post options when hovering "+", otherwise
  // the active category (hovered preview, else the selected/pinned one).
  const renderSelectedSection = (): ReactElement =>
    isCreateHovered ? (
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
  const isNotificationsSelected =
    activeCategory === SidebarCategory.Notifications;
  const isHomePanel =
    !isCreateHovered && activeCategory === SidebarCategory.Main;
  const isUtilityPanelSelected = !isHomePanel;
  const utilityPanelTitle = (() => {
    if (isCreateHovered) {
      return 'New post';
    }
    if (activeCategory === SidebarCategory.Settings) {
      return 'Settings';
    }
    if (isNotificationsSelected) {
      return 'Notifications';
    }
    return activeLabel ?? '';
  })();

  // Single-section panels (Squads/Saved) host their "+" add action in the panel
  // title strip — next to the title — rather than as a row inside the section.
  const panelAddAction = (() => {
    if (isCreateHovered) {
      return null;
    }
    if (activeCategory === SidebarCategory.Squads) {
      return {
        label: 'New Squad',
        onClick: () => openNewSquad({ origin: Origin.Sidebar }),
      };
    }
    if (activeCategory === SidebarCategory.Saved) {
      return { label: 'New folder', onClick: addBookmarkFolder };
    }
    return null;
  })();

  return (
    <SidebarAside
      data-testid="sidebar-aside"
      onMouseEnter={handleRailMouseEnter}
      onMouseLeave={handleRailMouseLeave}
      onMouseMove={handleRailMouseMove}
      onClick={pinFromEmptyClick}
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
        // Collapsed sidebar reads as a resize handle: click the empty surface
        // to pin it open.
        isCollapsedHoverMode && 'laptop:cursor-ew-resize',
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
            'flex h-dvh min-h-dvh shrink-0 flex-col items-center gap-1 px-1.5 pb-3 pt-6',
            railNavWidth,
          )}
        >
          {isLoggedIn && <SidebarProfileButton onPreviewHref={onPreviewHref} />}

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

          <div className="mt-auto flex w-full flex-col items-center gap-2">
            <div
              role="tablist"
              aria-label="Sidebar utilities"
              className="flex w-full flex-col items-center gap-1"
            >
              <SidebarInviteButton />
              <SidebarSupportButton />
            </div>
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
                    <span className="relative">
                      <LogoIcon className={{ container: 'h-4 w-auto' }} />
                      {isPlus && (
                        <DevPlusIcon
                          aria-hidden
                          size={IconSize.XXSmall}
                          className="absolute right-0 top-0 -translate-y-2/3 translate-x-2/3 text-action-plus-default"
                        />
                      )}
                    </span>
                  </a>
                </Link>
              </div>
            </Tooltip>
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
          isCreateHovered
            ? 'sidebar-create-post'
            : `sidebar-category-${activeCategory}`
        }
        aria-label={
          isCreateHovered
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
        <div className="pl-4 pr-3 pt-6">
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
            <div className="flex h-10 items-center justify-between gap-1">
              <Typography bold type={TypographyType.Callout}>
                {utilityPanelTitle}
              </Typography>
              {panelAddAction && (
                <Tooltip side="bottom" content={panelAddAction.label}>
                  <button
                    type="button"
                    onClick={panelAddAction.onClick}
                    aria-label={panelAddAction.label}
                    // `mr-9` keeps the "+" clear of the collapse toggle that
                    // floats over the panel's top-right corner.
                    className="focus-outline mr-9 flex size-7 shrink-0 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <PlusIcon size={IconSize.XSmall} aria-hidden />
                  </button>
                </Tooltip>
              )}
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
