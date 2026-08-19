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
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  createSidebarSeparatorItem,
  isSidebarItemActive,
  ListIcon,
  Nav,
  RAIL_ICON_SIZE,
  railCountBubbleClass,
  railDividerBgClass,
  railDividerBorderClass,
  railGlyphBoxClass,
  railTabClass,
  railTabLabelClass,
  SidebarAside,
  sidebarDragGhostClass,
  sidebarDragSlotClass,
  SidebarScrollWrapper,
} from './common';
import type { SidebarMenuItem } from './common';
import { Section } from './Section';
import { mergeRailOrder } from './railOrder';
import { getSidebarCategoryForPath, SidebarCategory } from './sidebarCategory';
import type { SidebarCategoryId } from './sidebarCategory';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useBanner } from '../../hooks/useBanner';
import { ExploreSection } from './sections/ExploreSection';
import { ProfilePanelSection } from './sections/ProfilePanelSection';
import { SettingsPanelSection } from './sections/SettingsPanelSection';
import type { ComposerKind } from '../post/composer/types';
import { useClaimableQuestCount } from '../../hooks/useQuestDashboard';
import { Bubble } from '../tooltips/utils';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { NetworkSection } from './sections/NetworkSection';
import { StreakQuestsSection } from './sections/StreakQuestsSection';
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
  HotIcon,
  JoystickIcon,
  LinkIcon,
  MegaphoneIcon,
  MicrophoneIcon,
  MoveToIcon,
  NewPostIcon,
  PhoneIcon,
  PollIcon,
  PrivacyIcon,
  SearchIcon,
  SettingsIcon,
  SidebarArrowLeft,
  SquadIcon,
  TerminalIcon,
  TrendingIcon,
} from '../icons';
import { useSettingsBooleanFlag } from '../../hooks/useSettingsBooleanFlag';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { RailHoverPanel } from './RailHoverPanel';
import { StreakBadge } from './StreakBadge';
import {
  SidebarShortcutsDock,
  useSidebarShortcutItems,
} from './SidebarShortcutsDock';
import { RailMoreMenu } from './RailMoreMenu';
import {
  SidebarDragStateProvider,
  useSidebarDragState,
} from './useSidebarDragState';
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
import usePersistentContext from '../../hooks/usePersistentContext';
import { ProfileSection as ProfileMenuSection } from '../ProfileMenu/ProfileSection';
import type { ProfileSectionItemProps } from '../ProfileMenu/ProfileSectionItem';
import { ThemeSection } from '../ProfileMenu/sections/ThemeSection';
import { LogoutReason } from '../../lib/user';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useCanPurchaseCores } from '../../hooks/useCoresFeature';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import { FeedbackWidget } from '../feedback/FeedbackWidget';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

type SidebarCategoryConfig = {
  id: SidebarCategoryId;
  label: string;
  // Optional because Profile has no glyph: the rail draws the user's avatar,
  // and being pinned it never folds into the "More" menu, which is the only
  // other place a category's icon is used.
  icon?: (active: boolean) => ReactElement;
  defaultPath?: string;
};

const sidebarCategories: SidebarCategoryConfig[] = [
  {
    // The discovery tab. Home is deliberately NOT a tab: naming this one
    // "Home" made the discovery destinations inside its panel read as
    // already-arrived-at, so people stopped looking for them. Home lives on
    // the brand mark above instead.
    id: SidebarCategory.Main,
    label: 'Explore',
    defaultPath: `${webappUrl}posts`,
    icon: (active) => (
      <CompassIcon
        secondary={active}
        size={RAIL_ICON_SIZE}
        aria-hidden
        // Optical correction: the compass is a thin hollow circle, which reads
        // smaller than the denser glyphs beside it at the same box size. A
        // circle needs a few percent of overshoot to look equal.
        className="scale-105"
      />
    ),
  },
  {
    // Rendered via the avatar (not the tablist loop); listed here so panel
    // title / label lookups resolve. No icon — see SidebarCategoryConfig.
    id: SidebarCategory.Profile,
    // Surfaced as the panel title and the avatar tooltip/label.
    label: 'You',
  },
  {
    id: SidebarCategory.Squads,
    label: 'Squads',
    defaultPath: `${webappUrl}squads/discover`,
    icon: (active) => (
      <SquadIcon secondary={active} size={RAIL_ICON_SIZE} aria-hidden />
    ),
  },
  {
    // The reading-streak tab. Its panel leads with the streak details, then a
    // Game Center link and the daily quests. Clicking the rail icon lands on
    // Game Center; the streak/quests detail is one hover away in the panel.
    id: SidebarCategory.GameCenter,
    label: 'Streak',
    defaultPath: `${webappUrl}game-center`,
    icon: (active) => (
      <HotIcon secondary={active} size={RAIL_ICON_SIZE} aria-hidden />
    ),
  },
];

// Fallback release for the post-drag click guard — see releaseRailDragClickGuard.
const RAIL_DRAG_CLICK_GUARD_FALLBACK_MS = 500;
// The overflow budget below has to know how tall each rail row is, which means
// restating class strings as numbers. Keep every one of them here, each naming
// the exact class it mirrors, so editing a class has one obvious place to
// follow — a silent desync only shows up as one tab too many or too few folding
// into "More" at a particular viewport height, which nothing in CI can catch.
const RAIL_ROW_GAP_PX = 4; // `gap-1` on the rail column
const SHORTCUT_ROW_PX = 40; // shortcut dot row height
const CREATE_BUTTON_PX = 36; // New post `!size-9`
const CREATE_MARGIN_Y_PX = 16; // New post `my-2`
const SEP_PX = 1 + 24; // framing separator `h-px` + its `my-3`

// New post is reorderable alongside the tabs, so it needs an id in the rail
// order. It matches the key the panel preview already uses for the create panel.
const RAIL_CREATE_ID = 'create';
type RailItemId = SidebarCategoryId | typeof RAIL_CREATE_ID;
// Rail items that never fold into "More" — they keep their slot at every
// viewport height. Both are "you" controls rather than browsing destinations:
// New post is the rail's primary action, and the avatar is the account entry
// point, which sits last in the default order and would otherwise be the FIRST
// thing to disappear on a short viewport (overflow peels from the end).
const PINNED_RAIL_IDS: RailItemId[] = [RAIL_CREATE_ID, SidebarCategory.Profile];

const railButtonClass =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-hover hover:text-text-primary active:scale-90 motion-reduce:transition-none focus-outline';
// Shared group so the rail's click popups (support, profile menu, streak) are
// mutually exclusive — opening one closes the others.
const RAIL_POPUP_GROUP = 'sidebar-rail';
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
const SAFE_ZONE_WATCHDOG_MS = 800;

export const pointInPolygon = (
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

export const shouldKeepSafeZone = (
  x: number,
  y: number,
  panel: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
  poly: Array<[number, number]> | null,
): boolean => {
  const overPanel =
    x >= panel.left && x <= panel.right && y >= panel.top && y <= panel.bottom;
  return overPanel || (!!poly && pointInPolygon(x, y, poly));
};

// Wraps a rail category tab so it can be reordered by cursor drag. Drag
// listeners sit on this outer element; the tab's own button stays the focus
// target. PointerSensor's distance constraint (set on the DndContext) means a
// plain click still selects the category instead of starting a drag.
const SortableRailTab = ({
  id,
  children,
  consumeClickGuard,
}: {
  id: string;
  children: ReactNode;
  // Armed while a rail drag is live — see `releaseRailDragClickGuard`. Returns
  // whether the guard was armed and disarms it.
  consumeClickGuard: () => boolean;
}): ReactElement => {
  const { setNodeRef, listeners, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      // This sortable wrapper sits between the `role="tablist"` and each
      // `role="tab"`. Without a presentational role the tabs are nested inside
      // anonymous generics rather than owned by the tablist, which is what
      // makes a screen reader's "tab N of M" counting unreliable. The div is
      // not focusable and carries no ARIA of its own, so the role is honoured
      // and the tab inside it is unaffected.
      role="presentation"
      // Capture phase so the drop's stray click dies before it reaches the tab
      // button or the notifications bell's anchor (which would navigate). The
      // click CONSUMES the guard — a timer release can't be trusted here (see
      // releaseRailDragClickGuard).
      onClickCapture={(event) => {
        if (!consumeClickGuard()) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      }}
      // Translate only, never CSS.Transform — that also emits the sortable's
      // scale, which dnd-kit sets to the size ratio between the dragged item
      // and the one it displaces. The rail mixes tall tabs with the shorter
      // New post button, so that ratio squashed/stretched them mid-drag.
      //
      // While dragging, the REAL element stays parked here as a slot skeleton
      // and a DragOverlay ghost follows the cursor (same architecture as the
      // shortcuts dock). That is what makes the notifications tab safe to
      // drag: its live anchor is never under the pointer at release, so the
      // browser's post-drag click can't hit the link and natively navigate —
      // no guard timing can promise that while the real anchor rides along
      // with the cursor.
      style={{
        transform: isDragging ? undefined : CSS.Translate.toString(transform),
        transition,
      }}
      className={classNames(
        // `relative z-1` keeps every tab painted above the sliding selected
        // pill (an absolute z-0 indicator behind them in the tablist).
        'relative z-1 w-full touch-none rounded-12 transition-colors',
        // Landing skeleton: the dock's shared slot treatment, with the item's
        // own content faded out rather than removed so the slot keeps its exact
        // height. EVERY item gets one, New post included — it is the only thing
        // telling you where the drop will land. (New post still lifts bare, but
        // that is about the ghost, not the slot it leaves behind.)
        isDragging && sidebarDragSlotClass,
        isDragging ? '[&>*]:opacity-0' : 'cursor-grab',
      )}
    >
      {children}
    </div>
  );
};

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
  // Never let the panel pop open while something is being dragged — its portal
  // (z-tooltip) would render over the drag ghost.
  const { isDragging } = useSidebarDragState();

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next && (suppressOpenRef.current || isDragging)) {
        return;
      }
      setOpen(next);
    },
    [isDragging],
  );

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
      open={open && !isDragging}
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
          className="rail-popup-panel z-tooltip"
        >
          <RailHoverPanel title={label}>{panel}</RailHoverPanel>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Portal>
    </HoverCardPrimitive.Root>
  );
};

// Theme toggling now lives in the profile dropdown (ThemeSection, matching
// production), so the rail gift is the "Invite friends" shortcut.
const SidebarInviteButton = (): ReactElement => (
  <Tooltip side="right" content="Invite friends">
    <Link href={`${settingsUrl}/invite`} passHref>
      <a aria-label="Invite friends" className={railButtonClass}>
        <GiftIcon size={RAIL_ICON_SIZE} aria-hidden />
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
          <HelpIcon secondary={isOpen} size={RAIL_ICON_SIZE} aria-hidden />
        </button>
      </Tooltip>
      {isOpen && (
        <InteractivePopup
          closeOutsideClick
          onClose={() => onUpdate(false)}
          position={InteractivePopupPosition.SidebarSupportMenu}
          className="animate-rail-popup-in flex w-64 flex-col gap-2 !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
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
          <SettingsIcon secondary={isOpen} size={RAIL_ICON_SIZE} aria-hidden />
        </button>
      </Tooltip>
      {isOpen && (
        <InteractivePopup
          closeOutsideClick
          onClose={() => onUpdate(false)}
          position={InteractivePopupPosition.SidebarSupportMenu}
          className="animate-rail-popup-in flex w-64 flex-col gap-2 !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
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
// Styled identically to the category tabs (icon + label below, same hover and
// selected states) — the profile picture stands in for the glyph icon.
const SidebarProfileButton = ({
  isSelected,
  isPreviewing,
  isCompact,
  isExpanded,
  panel,
  onSelect,
  onPreview,
  onPreviewLeave,
}: {
  isSelected: boolean;
  isPreviewing: boolean;
  isCompact: boolean;
  isExpanded: boolean;
  panel: ReactElement;
  onSelect: () => void;
  onPreview: () => void;
  onPreviewLeave: (event: React.MouseEvent) => void;
}): ReactElement | null => {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <RailHoverCard label="You" panel={panel} enabled={!isExpanded}>
      <button
        type="button"
        role="tab"
        aria-label="You"
        aria-selected={isSelected}
        aria-controls="sidebar-context-panel"
        data-sidebar-preview={SidebarCategory.Profile}
        onClick={onSelect}
        onMouseEnter={onPreview}
        onMouseLeave={onPreviewLeave}
        className={classNames(
          railTabClass,
          // The selected pill is a single shared indicator that slides between
          // tabs (see the tablist); the button only owns its text color.
          isSelected && '!text-text-primary',
          isPreviewing && 'bg-surface-hover text-text-primary',
        )}
      >
        {/* Fixed 24px slot (the shared rail glyph box) with a 20px avatar
          inside: a solid photo reads far heavier than the outline glyphs beside
          it, so it needs to be optically smaller to look the same size. The
          slot keeps this tab's height identical to the others. */}
        <span className={railGlyphBoxClass}>
          <ProfilePicture
            user={user}
            size={ProfileImageSize.Small}
            nativeLazyLoading
            // 1px frame around the avatar when this is the selected tab. A ring
            // (not a border) so the image doesn't shrink/shift on select.
            className={classNames(
              '!rounded-8',
              isSelected && 'ring-1 ring-text-primary',
            )}
          />
        </span>
        {!isCompact && <span className={railTabLabelClass}>You</span>}
      </button>
    </RailHoverCard>
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
    optOutReadingStreak,
    isGamificationEnabled,
  } = useSettingsContext();
  // The reading-streak rail tab: hidden entirely when all gamification is off;
  // when only streaks are off (but quests/levels/etc. remain) it stays but reads
  // as the broader "Quests" / Game Center tab instead of a streak.
  const showGameCenterTab = isGamificationEnabled;
  const isStreakTabAStreak = !optOutReadingStreak;
  // Short label under the rail tab icon (and the More-menu row): "Streak" /
  // "Quests" — kept compact for the narrow rail (the tab usually shows the day
  // count anyway).
  const gameCenterLabel = isStreakTabAStreak ? 'Streak' : 'Quests';
  // Fuller title for the panel + hover card: "Current Streak" when streaks are
  // on (the panel leads with the current-streak hero), else "Daily Quests".
  const gameCenterPanelTitle = isStreakTabAStreak
    ? 'Current Streak'
    : 'Daily Quests';
  const { logEvent } = useLogContext();
  const { isAvailable: isBannerAvailable } = useBanner();
  const { open: openSpotlight } = useSpotlight();
  const { openModal, modal } = useLazyModal();
  const { isLoggedIn, user } = useAuthContext();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  // The brand mark targets the "For You" feed. On extension there's no router,
  // so it always uses the explicit my-feed path — absolute, so opening it in a
  // new tab lands on the webapp instead of chrome-extension://<id>/my-feed.
  let myFeedPath = isCustomDefaultFeed ? '/my-feed' : '/';
  if (isExtension) {
    myFeedPath = `${webappUrl}my-feed`;
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

  // Drives the Streak tab's status: flame fills once you've read today and is
  // tinted by state (safe / at-risk / critical / freeze); the label shows the
  // day count. Reuses the same state machine the avatar streak ring used.
  const {
    isEnabled: isStreakEnabled,
    state: streakState,
    count: streakCount,
    hasReadToday: streakReadToday,
    copy: streakCopy,
  } = useStreakRingState();

  // The reorderable rail items: the tabs (each opens a panel), including the
  // avatar/"You" tab, plus New post — all draggable into any order and
  // persisted. Logo / Search / settings stay fixed outside this list.
  const reorderableRailItems = useMemo(
    () =>
      [
        SidebarCategory.Main,
        SidebarCategory.Squads,
        isLoggedIn ? SidebarCategory.Notifications : null,
        // Drops out of the rail entirely when all gamification is opted out.
        showGameCenterTab ? SidebarCategory.GameCenter : null,
        // The avatar sits at the end of the tabs, directly above New post —
        // "you" is the account context, not a browsing destination.
        isLoggedIn ? SidebarCategory.Profile : null,
        isLoggedIn ? RAIL_CREATE_ID : null,
      ].filter(Boolean) as RailItemId[],
    [isLoggedIn, showGameCenterTab],
  );
  const [storedRailOrder, setStoredRailOrder] = usePersistentContext<
    RailItemId[]
  >('sidebar_rail_order', reorderableRailItems);
  // Local override applied synchronously in onDragEnd (same pattern as the
  // shortcuts dock). The persisted value round-trips through a react-query
  // mutation, so its re-render lands a beat AFTER dnd-kit clears the sortable
  // transforms — one visible frame of the OLD order at the drop, i.e. the tab
  // flashed back to its original slot before jumping to the new one. A plain
  // setState here commits in the same React update as dnd-kit's drag-end
  // state, so the drop renders the new order immediately.
  const [railOrderOverride, setRailOrderOverride] = useState<
    RailItemId[] | null
  >(null);
  useEffect(() => {
    // Drop the override once the persisted value catches up, so later external
    // changes to the stored order aren't shadowed.
    if (!railOrderOverride) {
      return;
    }
    if ((storedRailOrder ?? []).join('|') === railOrderOverride.join('|')) {
      setRailOrderOverride(null);
    }
  }, [storedRailOrder, railOrderOverride]);
  const railOrder = useMemo(
    () =>
      mergeRailOrder(
        railOrderOverride ?? storedRailOrder ?? [],
        reorderableRailItems,
      ),
    [reorderableRailItems, storedRailOrder, railOrderOverride],
  );
  // Only the browsing tabs fold into "More" — see PINNED_RAIL_IDS.
  const foldableTabIds = useMemo(
    () =>
      railOrder.filter(
        (id) => !PINNED_RAIL_IDS.includes(id),
      ) as SidebarCategoryId[],
    [railOrder],
  );

  // Overflow, measured against the content-independent (flex-1) height of the
  // lower region that holds the tabs + dock — so folding never changes the
  // measurement and it can't oscillate. Above the threshold tabs are inline and
  // the dock scrolls; below it (short viewport) the whole rail folds into one
  // click "More" menu (tabs list + Shortcuts category).
  const SHORTCUTS_MIN_INLINE = 3;
  const lowerRegionRef = useRef<HTMLDivElement>(null);
  const [regionHeight, setRegionHeight] = useState(Number.POSITIVE_INFINITY);
  useEffect(() => {
    const region = lowerRegionRef.current;
    if (!region || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const measure = () => {
      if (region.clientHeight > 0) {
        setRegionHeight(region.clientHeight);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(region);
    return () => observer.disconnect();
  }, []);

  const { resolved: shortcutItems } = useSidebarShortcutItems();
  const shortcutCount = isLoggedIn ? shortcutItems.length : 0;
  const iconRowPx = SHORTCUT_ROW_PX + RAIL_ROW_GAP_PX;
  const tabRowPx = (isCompact ? 44 : 56) + RAIL_ROW_GAP_PX;
  const tabCount = foldableTabIds.length;
  // The pinned items sit inside the measured region but never fold into
  // "More" — reserve their rows up front so the tabs/dock budget is only what's
  // left, and folding still peels off one tab at a time. Both are logged-in
  // only, so at logged-out they cost nothing. The avatar is a normal tab row;
  // New post is its own smaller chip.
  const createRowPx = isLoggedIn
    ? CREATE_BUTTON_PX + CREATE_MARGIN_Y_PX + RAIL_ROW_GAP_PX
    : 0;
  const profileRowPx = isLoggedIn ? tabRowPx : 0;
  const availableHeight = regionHeight - createRowPx - profileRowPx;
  const minDockPx =
    shortcutCount > 0 ? SEP_PX + SHORTCUTS_MIN_INLINE * iconRowPx : 0;
  // Progressive overflow (a "priority+" rail). Stage 1: everything fits — all
  // tabs inline plus a usefully-sized, scrollable shortcuts dock; no "More".
  const fitsAllInline = availableHeight >= tabCount * tabRowPx + minDockPx;
  // Otherwise a "More" tab (same row height) collects the overflow. Keep as
  // many tabs inline as fit ABOVE that row and drop the lowest-priority tabs
  // (end of railOrder) into More ONE AT A TIME as the viewport shrinks — never
  // all at once, which left the rail looking empty. The inline dock is dropped
  // here; its shortcuts move into the same More menu (one combined dropdown).
  const tabsThatFitWithMore = Math.max(
    0,
    Math.floor((availableHeight - tabRowPx) / tabRowPx),
  );
  const visibleTabCount = fitsAllInline
    ? tabCount
    : Math.min(tabCount, tabsThatFitWithMore);
  const visibleTabIds = foldableTabIds.slice(0, visibleTabCount);
  const overflowTabIds = fitsAllInline
    ? []
    : foldableTabIds.slice(visibleTabCount);
  // What the rail actually renders, in the user's order: every tab that fits,
  // plus the pinned items — which are never dropped.
  const visibleRailIds = new Set<RailItemId>([
    ...PINNED_RAIL_IDS,
    ...visibleTabIds,
  ]);
  const visibleCategoryIds = railOrder.filter((id) => visibleRailIds.has(id));
  // More is needed when any tab overflows, or when all tabs still fit inline
  // but the shortcuts can't get a usable inline dock (so they collapse in).
  const moreNeeded =
    isLoggedIn &&
    (overflowTabIds.length > 0 || (!fitsAllInline && shortcutCount > 0));
  // Render the dock whenever it fits inline — even with zero shortcuts — so its
  // customize "•••" button is present and can reveal on rail hover to let you
  // add the first shortcut. (Gating on shortcutCount>0 hid the only entry point
  // when empty.) The framing separator shows whenever the dock is rendered (not
  // gated on shortcutCount) so adding the first shortcut doesn't shift anything:
  // the empty "•••" and the with-shortcuts state look identical.
  const showInlineDock = isLoggedIn && fitsAllInline;

  const railSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const isDraggingRef = useRef(false);
  // Shared "any sidebar drag active" flag. Every drag system (tab reorder, the
  // shortcuts dock, and panel-row→dock) flips this so tooltips, hover-card
  // panels and the panel-preview all stand down for the duration of a drag —
  // they were rendering over the drag ghost and making it feel broken.
  const [isAnyDragging, setIsAnyDragging] = useState(false);
  const setSidebarDragging = useCallback((value: boolean) => {
    isDraggingRef.current = value;
    setIsAnyDragging(value);
  }, []);
  const dragStateValue = useMemo(
    () => ({ isDragging: isAnyDragging, setDragging: setSidebarDragging }),
    [isAnyDragging, setSidebarDragging],
  );
  // Ending a drag makes the browser dispatch a `click` on whatever sits under
  // the cursor, and dnd-kit doesn't swallow it. Armed at drag start; CONSUMED
  // by that stray click in SortableRailTab's capture handler. It cannot be
  // released on a short timer: dnd-kit runs onDragEnd synchronously inside the
  // pointerup listener, while the browser's click arrives tasks later
  // (pointerup → mouseup → click) — a 0ms timer disarmed the guard in between
  // and the click sailed through. Every other rail tab survives that click
  // because `onSelectCategory` skips `router.push` for the current page —
  // Notifications is the one item rendered as a plain link, so its click
  // always navigated and reloaded /notifications. The timer below is only a
  // fallback for drags that end with no click at all (Escape, pointer
  // released outside the window), sized so a real post-drop click always
  // consumes the guard first.
  const railDragClickGuardRef = useRef(false);
  const consumeRailDragClickGuard = useCallback(() => {
    if (!railDragClickGuardRef.current) {
      return false;
    }
    railDragClickGuardRef.current = false;
    return true;
  }, []);
  const railDragClickGuardCleanupRef = useRef<() => void>();
  const releaseRailDragClickGuard = useCallback(() => {
    railDragClickGuardCleanupRef.current?.();
    const disarm = () => {
      railDragClickGuardRef.current = false;
    };
    // The stray post-drop click always arrives before the user can press again,
    // so the next pointerdown means the guard has either done its job or was
    // never going to — drops that end over the shortcuts dock, outside the rail
    // or on Escape produce no click at all, and without this the guard stayed
    // armed for the full fallback window and ate the user's next real click.
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    const cleanup = () => {
      clearTimeout(timer);
      controller.abort();
      railDragClickGuardCleanupRef.current = undefined;
    };
    const finish = () => {
      cleanup();
      disarm();
    };
    globalThis.window?.addEventListener('pointerdown', finish, {
      signal: controller.signal,
      once: true,
    });
    timer = setTimeout(finish, RAIL_DRAG_CLICK_GUARD_FALLBACK_MS);
    railDragClickGuardCleanupRef.current = cleanup;
  }, []);
  useEffect(() => () => railDragClickGuardCleanupRef.current?.(), []);
  // Which rail item is being dragged — drives the DragOverlay ghost while the
  // in-list original shows as a slot skeleton.
  const [activeRailId, setActiveRailId] = useState<RailItemId | null>(null);
  // The live (in-progress) reorder, mirrored in a ref so onDragOver/onDragEnd
  // read the latest order without a stale-closure risk (same as the dock).
  const liveRailOrderRef = useRef<RailItemId[] | null>(null);
  const handleRailDragStart = useCallback(
    (event: DragStartEvent) => {
      railDragClickGuardRef.current = true;
      setActiveRailId(event.active.id as RailItemId);
      liveRailOrderRef.current = railOrder;
      setSidebarDragging(true);
    },
    [railOrder, setSidebarDragging],
  );
  // Live reorder: as the dragged item passes over a slot, reorder the rendered
  // list so its parked slot skeleton moves into that slot — the same live
  // landing indicator the shortcuts dock shows. Persisted only on drop.
  const handleRailDragOver = useCallback(
    (event: DragOverEvent) => {
      const id = event.active.id as RailItemId;
      const over = (event.over?.id as RailItemId) ?? null;
      if (!over || over === id) {
        return;
      }
      const base = liveRailOrderRef.current ?? railOrder;
      const from = base.indexOf(id);
      const to = base.indexOf(over);
      if (from === -1 || to === -1 || from === to) {
        return;
      }
      const next = arrayMove(base, from, to);
      liveRailOrderRef.current = next;
      setRailOrderOverride(next);
    },
    [railOrder],
  );
  const handleRailDragEnd = useCallback(() => {
    setSidebarDragging(false);
    setActiveRailId(null);
    releaseRailDragClickGuard();
    // The rendered order was already updated live in onDragOver (so there's
    // nothing to move here — at drop the item is over its own slot); just
    // commit it. If nothing actually moved, drop the override.
    const liveOrder = liveRailOrderRef.current;
    liveRailOrderRef.current = null;
    if (!liveOrder) {
      return;
    }
    if (liveOrder.join('|') === (storedRailOrder ?? []).join('|')) {
      setRailOrderOverride(null);
      return;
    }
    // If the write fails, drop the override so the rail falls back to what is
    // actually stored. Keeping it would strand the user on an order that only
    // exists in memory: the clearing effect fires when the stored order matches
    // the override, which after a rejection it never will, so they would see a
    // saved-looking order that is gone on reload with no signal anywhere.
    setStoredRailOrder(liveOrder).catch((error) => {
      setRailOrderOverride(null);
      // eslint-disable-next-line no-console
      console.error('Failed to persist sidebar rail order', error);
    });
  }, [
    releaseRailDragClickGuard,
    setStoredRailOrder,
    setSidebarDragging,
    storedRailOrder,
  ]);
  const activePage = activePageProp || router.asPath || router.pathname || '';
  const isFeedPage = activePage.includes('/feeds/');
  // When the For You feed is the current page, the brand mark reads as
  // selected — fill its home glyph (secondary) instead of the outline.
  const isHomeActive = isSidebarItemActive(activePage, myFeedPath);

  const resolvedBaseCategory = useMemo((): SidebarCategoryId => {
    // The user's own profile page (`/<username>` and its sub-pages) keeps the
    // Profile panel — the avatar navigates here, so it must resolve back to
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
  }, [activePage, isFeedPage, isLoggedIn, user?.username]);

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
  // Set on a "New post" click and held until the composer modal fully closes,
  // so the panel stays on the create options through the open transition
  // instead of briefly flashing back to the resolved category.
  const [createPinned, setCreatePinned] = useState(false);

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
  // into the panel, ignore neighbouring rail hovers so clipping a nearby row
  // can't switch the preview.
  const panelRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const safeBlockedRef = useRef(false);
  const safePolyRef = useRef<Array<[number, number]> | null>(null);
  const safeZoneWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [safeZoneActive, setSafeZoneActive] = useState(false);
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

  // Shared "selected pill" that slides between rail tabs (FLIP-style shared
  // layout) instead of the background jumping instantly. It tracks whichever
  // tab carries `aria-selected` — robust across the heterogeneous tabs (avatar,
  // category buttons, notifications bell) without each owning its own pill. We
  // measure with getBoundingClientRect (transform-aware) relative to the
  // tablist, so reorder/overflow just re-anchor it.
  const tablistRef = useRef<HTMLDivElement>(null);
  const [selectedPill, setSelectedPill] = useState({ y: 0, h: 0, show: false });
  const [pillReady, setPillReady] = useState(false);
  const visibleTabKey = visibleCategoryIds.join('|');
  useEffect(() => {
    const container = tablistRef.current;
    if (!container) {
      return undefined;
    }
    // Hide the pill mid-drag — its layout slot is in flux and the dragged tab
    // is lifted; it re-anchors (and fades back) once the order settles.
    if (isAnyDragging) {
      setSelectedPill((prev) => (prev.show ? { ...prev, show: false } : prev));
      return undefined;
    }
    const measure = () => {
      const selected = container.querySelector('[aria-selected="true"]');
      if (!(selected instanceof HTMLElement)) {
        setSelectedPill((prev) => ({ ...prev, show: false }));
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const rect = selected.getBoundingClientRect();
      setSelectedPill({
        y: rect.top - containerRect.top,
        h: rect.height,
        show: true,
      });
    };
    // rAF: measure after layout settles. setTimeout: re-measure after dnd-kit's
    // drop animation (~250ms) finishes, in case the selected tab was the one
    // just dragged and is still transforming toward its final slot.
    const raf = requestAnimationFrame(measure);
    const settle = setTimeout(measure, 300);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [selectedCategory, visibleTabKey, isCompact, isAnyDragging]);
  // Enable the slide transition only after the first placement so the pill
  // doesn't animate in from the top on mount (it just appears in place).
  useEffect(() => {
    if (!selectedPill.show || pillReady) {
      return undefined;
    }
    const raf = requestAnimationFrame(() => setPillReady(true));
    return () => cancelAnimationFrame(raf);
  }, [selectedPill.show, pillReady]);

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

  // The brand mark switches to the "For You" feed. It mirrors the rail tabs'
  // optimistic panel switch (home resolves to the Explore panel) while the
  // route resolves.
  const onHomeClick = useCallback(() => {
    setPendingCategory(SidebarCategory.Main);
    onNavTabClick?.(isCustomDefaultFeed ? SharedFeedPage.MyFeed : '/');
  }, [isCustomDefaultFeed, onNavTabClick]);

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
    if (safeZoneWatchdogRef.current) {
      clearTimeout(safeZoneWatchdogRef.current);
      safeZoneWatchdogRef.current = null;
    }
    safeBlockedRef.current = false;
    safePolyRef.current = null;
    setSafeZoneActive(false);
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
    // already open, so there's nothing to re-open here). Also ignore the hover
    // that fires under the cursor mid-drag so reordering doesn't flip panels.
    if (safeBlockedRef.current || isDraggingRef.current) {
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

  const releaseSafeZoneAtPoint = useCallback(
    (x: number, y: number) => {
      const panel = panelRef.current?.getBoundingClientRect();
      if (!panel) {
        exitSafeZone();
        return;
      }
      if (shouldKeepSafeZone(x, y, panel, safePolyRef.current)) {
        return;
      }
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

  const enterSafeZone = useCallback(
    (x: number, y: number) => {
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
      setSafeZoneActive(true);
      if (safeZoneWatchdogRef.current) {
        clearTimeout(safeZoneWatchdogRef.current);
      }
      safeZoneWatchdogRef.current = setTimeout(
        exitSafeZone,
        SAFE_ZONE_WATCHDOG_MS,
      );
    },
    [exitSafeZone],
  );

  // Enter the safe zone when the pointer leaves the *active* trigger heading
  // toward the panel (rightward). Document-level tracking releases the block
  // even if the pointer leaves the rail before the next rail mousemove.
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
      releaseSafeZoneAtPoint(event.clientX, event.clientY);
    },
    [releaseSafeZoneAtPoint],
  );

  useEffect(() => {
    if (!safeZoneActive) {
      return undefined;
    }
    const handlePointerMove = (event: PointerEvent) => {
      releaseSafeZoneAtPoint(event.clientX, event.clientY);
    };
    const handleRelease = () => exitSafeZone();
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        exitSafeZone();
      }
    };
    document.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('pointerup', handleRelease);
    window.addEventListener('blur', handleRelease);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handleRelease);
      window.removeEventListener('blur', handleRelease);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [exitSafeZone, releaseSafeZoneAtPoint, safeZoneActive]);

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
      return <StreakQuestsSection />;
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
    // Icon-less categories (Profile) draw their own tab and never reach here.
    if (!category?.icon) {
      return null;
    }
    // The "selected" (white) indicator tracks the committed category so it
    // never moves while you hover/preview other tabs — you always know where
    // you are. Hovering only previews the panel and shows the row's hover
    // background; it doesn't claim the selected state.
    const isSelected = selectedCategory === category.id;
    const isPreviewing = !isSelected && activeCategory === category.id;
    // The gamification tab. With reading streaks on it's the "Streak" tab: the
    // state-driven StreakBadge stands in for the glyph and the day count is the
    // label. With streaks off (but other gamification on) it reads as the
    // broader "Quests"/Game Center — a joystick glyph + "Quests" label.
    const isStreakTab = category.id === SidebarCategory.GameCenter;
    const showStreakBadge =
      isStreakTab && isStreakTabAStreak && isStreakEnabled;
    const displayLabel = isStreakTab ? gameCenterLabel : category.label;
    // The hover card + aria use the fuller panel title ("Current Streak");
    // the tab icon's own label stays the short `displayLabel`.
    const panelTitle = isStreakTab ? gameCenterPanelTitle : category.label;
    let iconNode: ReactElement;
    if (showStreakBadge) {
      iconNode = (
        <StreakBadge
          state={streakState}
          hasReadToday={streakReadToday}
          selected={isSelected}
        />
      );
    } else if (isStreakTab && !isStreakTabAStreak) {
      iconNode = (
        <JoystickIcon
          secondary={isSelected}
          size={RAIL_ICON_SIZE}
          aria-hidden
        />
      );
    } else {
      iconNode = category.icon(isSelected);
    }
    const labelText =
      showStreakBadge && streakCount > 0 ? `${streakCount}` : displayLabel;
    const ariaLabel = showStreakBadge ? streakCopy : panelTitle;
    return (
      <RailHoverCard
        label={panelTitle}
        panel={renderCategorySection(category.id)}
        enabled={!isExpanded}
      >
        <button
          type="button"
          role="tab"
          id={`sidebar-category-${category.id}`}
          data-sidebar-preview={category.id}
          aria-controls="sidebar-context-panel"
          aria-label={ariaLabel}
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
            // The selected pill is the shared sliding indicator in the tablist;
            // the button only owns its text color (a bg here would paint over
            // the sliding pill and kill the morph). Every tab — streak included —
            // uses the same white selected label.
            isSelected && '!text-text-primary',
            // `group/streaktab` scopes the StreakBadge's hover-white border to
            // this tab. The tab background matches every other tab (float on
            // hover, neutral pill when selected) — the streak's pink lives only
            // on its square StreakBadge.
            isStreakTab && 'group/streaktab',
            isPreviewing && 'bg-surface-hover text-text-primary',
          )}
        >
          <span className="relative flex items-center justify-center">
            {iconNode}
            {category.id === SidebarCategory.GameCenter && showQuestBadge && (
              // Inside the glyph box, not the button, and on the shared recipe —
              // so this lands in exactly the same spot as the Activity bell's
              // count. Anchored to the button it resolved against the tab's full
              // height (label included) and sat visibly higher and further right
              // than the bell's, at a different numeral size.
              <Bubble className={railCountBubbleClass}>
                {claimableQuestCount}
              </Bubble>
            )}
          </span>
          {!isCompact && <span className={railTabLabelClass}>{labelText}</span>}
        </button>
      </RailHoverCard>
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
  const showCreatePanel = isCreateHovered || isComposerOpen || createPinned;
  // Release the pin once any modal opened from "New post" has fully closed.
  useEffect(() => {
    if (!modal) {
      setCreatePinned(false);
    }
  }, [modal]);
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

  const activeLabel =
    activeCategory === SidebarCategory.GameCenter
      ? gameCenterPanelTitle
      : sidebarCategories.find((category) => category.id === activeCategory)
          ?.label;
  // Preview state (panel content/title) vs committed selection (the bell's
  // filled indicator) — kept separate so hover-preview never moves the
  // selected indicator.
  const isNotificationsActive =
    activeCategory === SidebarCategory.Notifications;
  const isNotificationsSelected =
    selectedCategory === SidebarCategory.Notifications;

  // New post is reorderable with the tabs but is an action, not a panel tab, so
  // it carries no `aria-selected` and the sliding pill (which tracks
  // `aria-selected`) ignores it and stays on the committed category.
  //
  // KNOWN TRADE-OFF: a `role="tablist"` is only supposed to own `role="tab"`
  // children, and this button sits among them, so a screen reader's "tab N of
  // M" counting is off by this item. Both ways out cost something and neither
  // is ours to pick unilaterally: making it a real `role="tab"` is valid markup
  // but tells a screen reader it switches panels when pressing it opens the
  // composer dialog, and lifting it out of the tablist means it can no longer
  // be reordered in among the tabs — which is the product requirement it exists
  // for. Raised on the PR for a product/a11y call.
  const renderCreateButton = (): ReactElement => (
    // The sortable wrapper is a full-width block and the tabs centre their own
    // content; this button is a fixed 36px, so it needs the centring itself.
    <div className="flex justify-center">
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
          data-sidebar-preview={RAIL_CREATE_ID}
          onMouseEnter={() => commitPreview(RAIL_CREATE_ID)}
          onMouseLeave={(event: React.MouseEvent) =>
            handlePreviewLeave(RAIL_CREATE_ID, event)
          }
          onFocus={() => setIsCreateHovered(true)}
          onBlur={() => setIsCreateHovered(false)}
          onClick={() => {
            // Pin the create panel from the click until the composer modal
            // closes, so the panel can't flash back to the resolved category
            // (e.g. Profile) in the open transition.
            setCreatePinned(true);
            openModal({ type: LazyModal.SmartComposer });
          }}
          // my-2 mirrors the tabs' own py-2, so dropping this button between
          // two tabs keeps the rail's vertical rhythm instead of bunching up.
          // Same tactile press as the other rail buttons (Button has no
          // transition of its own, so adding one here is additive).
          className="my-2 !size-9 !rounded-12 transition-transform duration-150 ease-out active:scale-90 motion-reduce:transition-none [&_svg]:!size-6"
        />
      </Tooltip>
    </div>
  );

  // Resolve a rail item by id. New post and Notifications are the two that
  // aren't plain categories (an action button and the bell with its unread
  // badge); everything else goes through renderCategoryTab.
  // Runs once per ghost mount (the overlay only re-mounts when the dragged item
  // changes; dnd-kit moves it by transforming the wrapper, not by re-rendering).
  const stripRailGhostIds = useCallback((node: HTMLDivElement | null) => {
    node?.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  }, []);

  const renderRailTab = (id: RailItemId): ReactElement => {
    if (id === RAIL_CREATE_ID) {
      return renderCreateButton();
    }
    if (id === SidebarCategory.Profile) {
      return (
        <SidebarProfileButton
          isSelected={selectedCategory === SidebarCategory.Profile}
          isPreviewing={
            selectedCategory !== SidebarCategory.Profile &&
            activeCategory === SidebarCategory.Profile
          }
          isCompact={isCompact}
          isExpanded={isExpanded}
          panel={renderCategorySection(SidebarCategory.Profile)}
          onSelect={onSelectProfile}
          onPreview={() => commitPreview(SidebarCategory.Profile)}
          onPreviewLeave={(event) =>
            handlePreviewLeave(SidebarCategory.Profile, event)
          }
        />
      );
    }
    if (id === SidebarCategory.Notifications) {
      return (
        <RailHoverCard
          label="Notifications"
          panel={<NotificationsRailPanel />}
          enabled={!isExpanded}
        >
          <div
            className="w-full"
            data-sidebar-preview={SidebarCategory.Notifications}
            onMouseEnter={() => commitPreview(SidebarCategory.Notifications)}
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
      );
    }
    return renderCategoryTab(id) ?? <></>;
  };
  const isHomePanel =
    !showCreatePanel && activeCategory === SidebarCategory.Main;
  const isUtilityPanelSelected = !isHomePanel;
  // The streak/quests panel owns its own height: the hero stays fixed up top and
  // the quest list fills the rest of the panel and scrolls inside that area
  // (rather than a fixed-height scroll box leaving dead space below). For that
  // the Nav must stretch to the scroll wrapper, so the section can flex-fill it.
  const isStreakPanel =
    !showCreatePanel && activeCategory === SidebarCategory.GameCenter;
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

  // Content of the rail "More" menu: each overflowed tab as a navigable row,
  // then a Shortcuts category listing every pinned shortcut. Only the tabs that
  // didn't fit inline are listed here — the inline tabs aren't repeated.
  const renderMoreMenuContent = (
    overflowIds: SidebarCategoryId[],
  ): ReactElement => {
    const rowClass =
      'focus-outline flex items-center gap-3 rounded-10 px-3 py-2 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary';
    const tabRows = overflowIds.map((id) => {
      if (id === SidebarCategory.Notifications) {
        return {
          key: id as string,
          label: 'Notifications',
          href: `${webappUrl}notifications`,
          icon: <BellIcon size={IconSize.Small} aria-hidden />,
        };
      }
      if (id === SidebarCategory.GameCenter) {
        const category = sidebarCategories.find((entry) => entry.id === id);
        return {
          key: id as string,
          label: gameCenterLabel,
          href: category?.defaultPath ?? webappUrl,
          icon: isStreakTabAStreak ? (
            <HotIcon size={IconSize.Small} aria-hidden />
          ) : (
            <JoystickIcon size={IconSize.Small} aria-hidden />
          ),
        };
      }
      // Only the foldable browsing tabs reach here — the avatar is pinned to
      // the rail, so there is no Profile row (and no avatar href) to build.
      const category = sidebarCategories.find((entry) => entry.id === id);
      return {
        key: id as string,
        label: category?.label ?? '',
        href: category?.defaultPath ?? webappUrl,
        icon: category?.icon?.(false) ?? null,
      };
    });
    return (
      <div className="flex flex-col gap-0.5">
        {tabRows.map((row) => (
          <Link key={row.key} href={row.href} passHref>
            <a className={rowClass}>
              <span className="flex size-5 items-center justify-center">
                {row.icon}
              </span>
              <Typography type={TypographyType.Callout}>{row.label}</Typography>
            </a>
          </Link>
        ))}
        {shortcutItems.length > 0 && (
          <>
            {tabRows.length > 0 && <HorizontalSeparator className="my-1" />}
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="px-3 pb-1 pt-0.5"
            >
              Shortcuts
            </Typography>
            {shortcutItems.map((shortcut) => (
              <Link
                key={`shortcut-${shortcut.key}`}
                href={shortcut.path}
                passHref
              >
                <a className={rowClass}>
                  <span className="flex size-5 items-center justify-center">
                    {shortcut.icon(false)}
                  </span>
                  <Typography type={TypographyType.Callout}>
                    {shortcut.label}
                  </Typography>
                </a>
              </Link>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <SidebarDragStateProvider value={dragStateValue}>
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
              // The shared divider token (`-quaternary`), same as the rail's
              // separators and the panel's HorizontalSeparators — see
              // railDividerBorderClass for why dividers sit one step below the
              // container borders around them.
              'pointer-events-none absolute inset-y-0 hidden border-r laptop:block',
              railDividerBorderClass,
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
              // `group/rail` is what reveals the brand mark's home glyph: the
              // swap is triggered by the pointer being anywhere on the rail,
              // not just on the logo, so the way home is visible while you're
              // reading the tabs rather than only after you already found it.
              'group/rail flex h-dvh min-h-dvh shrink-0 flex-col items-center gap-1 px-1.5 pb-3 pt-[13px]',
              railNavWidth,
            )}
          >
            <Tooltip
              side="right"
              content="Home"
              collisionPadding={RAIL_TOOLTIP_COLLISION_PADDING}
            >
              {/* mt nudges the logo down so it lines up vertically with the
                panel title row (which sits at pt-6); no mb so the gap below
                matches the uniform gap-1 rhythm of the rest of the rail. */}
              <div className="mt-2.5">
                <Link href={myFeedPath} passHref>
                  <a
                    href={myFeedPath}
                    aria-label="Home"
                    aria-current={isHomeActive ? 'page' : undefined}
                    // The brand mark doubles as the Home button: the daily.dev
                    // logo at rest, crossfading into the home glyph while the
                    // pointer is anywhere on the rail (`group/rail`, set on the
                    // nav) so the destination is obvious without having to
                    // hover the mark itself. `group/home` scopes the
                    // keyboard-focus swap and the direct-hover tint to this
                    // button alone — an unnamed `group` here would also match
                    // the sidebar-wide group on SidebarAside, which covers the
                    // panel too.
                    className="focus-outline group/home flex size-10 items-center justify-center rounded-12 text-text-primary transition-[background-color,transform] duration-150 ease-out hover:bg-surface-hover active:scale-90 motion-reduce:transition-none"
                    onClick={(event) => {
                      // Keep the removed logo link's click contract — the
                      // extension resets its feed/search state there.
                      onLogoClick?.(event);
                      // ONE owner for the destination. The extension's
                      // `onLogoClick` defaults the event and switches the feed
                      // in place (to My Feed on the new tab); running Home's
                      // handler afterwards would immediately overwrite that
                      // with the default feed, so the brand mark would stop
                      // landing on My Feed. On the webapp `onLogoClick` is
                      // undefined, so Home still owns the click.
                      if (event.defaultPrevented) {
                        return;
                      }
                      onHomeClick();
                    }}
                  >
                    <span className={railGlyphBoxClass}>
                      <LogoIcon
                        className={{
                          container:
                            'h-[1.125rem] w-auto transition-[opacity,transform] duration-150 ease-out group-hover/rail:scale-75 group-hover/rail:opacity-0 group-focus-visible/home:scale-75 group-focus-visible/home:opacity-0 motion-reduce:transition-none',
                        }}
                      />
                      <span
                        aria-hidden
                        className={classNames(
                          'absolute inset-0 flex scale-75 items-center justify-center opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover/rail:scale-100 group-hover/rail:opacity-100 group-focus-visible/home:scale-100 group-focus-visible/home:opacity-100 motion-reduce:transition-none',
                          // Filled white when the feed IS the current page;
                          // elsewhere it's an inactive grey outline that goes
                          // white on direct hover — exactly how the Search icon
                          // behaves. (The logo keeps its own fill, so this only
                          // colours the home glyph.)
                          isHomeActive
                            ? 'text-text-primary'
                            : 'text-text-tertiary group-hover/home:text-text-primary',
                        )}
                      >
                        <HomeIcon
                          secondary={isHomeActive}
                          size={RAIL_ICON_SIZE}
                          aria-hidden
                        />
                      </span>
                    </span>
                  </a>
                </Link>
              </div>
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
                className="focus-outline flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-hover hover:text-text-primary active:scale-90 motion-reduce:transition-none"
              >
                <SearchIcon size={RAIL_ICON_SIZE} aria-hidden />
              </button>
            </Tooltip>

            <div
              aria-hidden
              className={classNames('my-1 h-px w-6', railDividerBgClass)}
            />

            {/* The tabs + shortcuts dock live in this flex-1 region; its height
              is content-independent, so it's the stable measurement that drives
              the overflow stages. When too short for the tabs, the whole thing
              collapses into a single click "More" menu (tabs + a Shortcuts
              category). Otherwise the tabs are fixed and only the dock scrolls
              between the framing separators. */}
            <div
              ref={lowerRegionRef}
              className="flex min-h-0 w-full flex-1 flex-col items-center gap-1"
            >
              {/* Rail tabs that fit — fixed above the scrollable dock / More.
                As the viewport shrinks, the lowest-priority tabs peel off into
                the "More" menu one at a time (visibleCategoryIds), so the rail
                always stays populated instead of emptying out all at once. */}
              <div
                ref={tablistRef}
                role="tablist"
                aria-label="Sidebar categories"
                className="relative flex w-full flex-col items-center gap-1"
              >
                {/* The selected pill — a single background that slides between
                  tabs. Sits behind them (z-0; tabs are relative z-1). The
                  transition turns on only after the first placement so it
                  appears in place rather than sliding from the top. */}
                <span
                  aria-hidden
                  className={classNames(
                    'pointer-events-none absolute inset-x-0 top-0 z-0 rounded-12 bg-background-default',
                    // Every tab — the reading-streak one included — uses the same
                    // neutral selected pill. The streak's pink lives only on its
                    // square StreakBadge (via the badge's selected state).
                    pillReady &&
                      'transition-[transform,height,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
                  )}
                  style={{
                    height: selectedPill.h,
                    transform: `translateY(${selectedPill.y}px)`,
                    opacity: selectedPill.show ? 1 : 0,
                  }}
                />
                <DndContext
                  sensors={railSensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleRailDragStart}
                  onDragOver={handleRailDragOver}
                  onDragEnd={handleRailDragEnd}
                  onDragCancel={() => {
                    setSidebarDragging(false);
                    setActiveRailId(null);
                    liveRailOrderRef.current = null;
                    setRailOrderOverride(null);
                    releaseRailDragClickGuard();
                  }}
                >
                  <SortableContext
                    items={visibleCategoryIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {visibleCategoryIds.map((id) => (
                      <SortableRailTab
                        key={id}
                        id={id}
                        consumeClickGuard={consumeRailDragClickGuard}
                      >
                        {renderRailTab(id)}
                      </SortableRailTab>
                    ))}
                  </SortableContext>
                  {/* Pointer-events-none ghost that follows the cursor; the
                    real element (with the bell's live anchor) stays parked in
                    the list. No drop animation: the synchronous order override
                    already renders the item in its final slot at release. */}
                  <DragOverlay dropAnimation={null}>
                    {activeRailId ? (
                      // Tabs lift as the glass chip the shortcuts dock uses
                      // (shared recipe in common.tsx) so both drag systems look
                      // identical. New post is already a filled chip with no
                      // hover surface, so it lifts bare — a chip around a chip
                      // reads as a double background.
                      <div
                        // The ghost is a visual clone of a tab that is still
                        // mounted in the list, so without this the document
                        // carries two `#sidebar-*` nodes and a second
                        // `role="tab"`/`aria-selected` outside the tablist for
                        // the length of the drag. `aria-hidden` takes the clone
                        // out of the a11y tree; the ref drops the duplicated
                        // ids so nothing can resolve to the wrong node.
                        aria-hidden
                        ref={stripRailGhostIds}
                        className={classNames(
                          // `pointer-events-none` is not decoration. dnd-kit's
                          // DragOverlay only sets `position:fixed;touch-action:
                          // none` — it does NOT disable pointer events — and the
                          // overlay tracks the cursor, so the pointer sits on the
                          // ghost and the tab inside it matches `:hover`. That
                          // painted `hover:bg-surface-hover` (12%) across the
                          // whole chip on top of the ghost's own 8%, which is
                          // what made it read as a solid block no matter how far
                          // the ghost's own fill was lowered.
                          'pointer-events-none w-full scale-110 cursor-grabbing transition-all duration-150',
                          activeRailId !== RAIL_CREATE_ID &&
                            sidebarDragGhostClass,
                        )}
                      >
                        {renderRailTab(activeRailId)}
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>

              {/* Top frame separator. With shortcuts it's always visible. With
                zero shortcuts it reveals on sidebar hover in step with the empty
                "•••" button (which is hover-only), so an empty dock shows neither
                by default. Its space is always reserved (opacity only), so adding
                the first shortcut never shifts anything. */}
              {showInlineDock && (
                <div
                  aria-hidden
                  className={classNames(
                    // Symmetric margins so the line sits exactly midway between
                    // New post above it and the shortcuts "•••" below it.
                    'my-3 h-px w-6',
                    railDividerBgClass,
                    shortcutCount === 0 &&
                      'opacity-0 transition-opacity group-hover:opacity-100',
                  )}
                />
              )}

              {/* ONLY the shortcuts dock scrolls — between the framing
                separators. The tiny -mx/px keeps focus rings from being
                clipped. */}
              {showInlineDock && (
                <div className="no-scrollbar -mx-0.5 flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-0.5">
                  <SidebarShortcutsDock />
                </div>
              )}

              {/* The "More" tab: collects the overflowed tabs and (once the
                inline dock can't fit) all the shortcuts, in one dropdown. */}
              {moreNeeded && (
                <RailMoreMenu compact={isCompact}>
                  {renderMoreMenuContent(overflowTabIds)}
                </RailMoreMenu>
              )}
            </div>

            {/* Utility actions (not tabs) — Invite/Support/Settings — fixed at
              the bottom, outside the scroll. They open their own popups, so this
              is a plain group rather than a tablist. Hovering it closes any open
              collapsed-peek so these panel-less icons never leave a stale panel
              showing. */}
            <div
              aria-label="Sidebar utilities"
              onMouseEnter={handleRailMouseLeave}
              className="flex w-full flex-col items-center gap-1"
            >
              {/* Keyed on isLoggedIn (a constant, not shortcutCount or the
                height-derived overflow state): it sits OUTSIDE the measured
                region, so a height-dependent condition could flip-flop the
                overflow threshold — and a shortcutCount-dependent one would
                shift when the first shortcut is added. Constant = neither. */}
              {isLoggedIn && (
                <div
                  aria-hidden
                  className={classNames('my-1 h-px w-6', railDividerBgClass)}
                />
              )}
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
            <Nav
              className={classNames(
                isUtilityPanelSelected ? '!pb-2 !pt-0' : '!pt-0',
                isStreakPanel && 'min-h-0 flex-1',
              )}
            >
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
    </SidebarDragStateProvider>
  );
};
