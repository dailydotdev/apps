import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Nav, SidebarAside, SidebarScrollWrapper } from './common';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useBanner } from '../../hooks/useBanner';
import { MainSection } from './sections/MainSection';
import { CustomFeedSection } from './sections/CustomFeedSection';
import { DiscoverSection } from './sections/DiscoverSection';
import { CreatePostButton } from '../post/write';
import { ButtonIconPosition, ButtonSize } from '../buttons/Button';
import { BookmarkSection } from './sections/BookmarkSection';
import { NetworkSection } from './sections/NetworkSection';
import { HelpWidget } from '../help/HelpWidget';
import {
  BookmarkIcon,
  FeedbackIcon,
  HomeIcon,
  JoystickIcon,
  SearchIcon,
  SettingsIcon,
  SidebarArrowLeft,
  SidebarArrowRight,
  SquadIcon,
} from '../icons';
import { fromCDN } from '../../lib/links';
import { IconSize } from '../Icon';
import {
  SidebarSelectedCategory,
  SidebarSettingsFlags,
} from '../../graphql/settings';
import { Tooltip } from '../tooltip/Tooltip';
import { useSpotlight } from '../spotlight/useSpotlight';
import { useAuthContext } from '../../contexts/AuthContext';
import NotificationsBell from '../notifications/NotificationsBell';
import ProfileButton from '../profile/ProfileButton';
import { HighlightPostSidebarWidget } from '../cards/highlight/HighlightPostSidebarWidget';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { useReadingStreak } from '../../hooks/streaks';
import Link from '../utilities/Link';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { FeedbackWidget } from '../feedback';
import { isAppleDevice } from '../../lib/func';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { useInteractivePopup } from '../../hooks/utils/useInteractivePopup';
import { ResourceSection } from '../ProfileMenu/sections/ResourceSection';
import { InnerProfileSettingsMenu } from '../profile/ProfileSettingsMenu';
import { QuestButton } from '../quest/QuestButton';
import { AchievementTrackerPanel } from '../filters/AchievementTrackerButton';
import { Typography, TypographyType } from '../typography/Typography';

type SidebarCategoryConfig = {
  id: SidebarSelectedCategory;
  label: string;
  icon: (active: boolean) => ReactElement;
};

const sidebarCategories: SidebarCategoryConfig[] = [
  {
    id: SidebarSelectedCategory.Main,
    label: 'Home',
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
    icon: (active) => (
      <SquadIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarSelectedCategory.Saved,
    label: 'Saved',
    icon: (active) => (
      <BookmarkIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarSelectedCategory.GameCenter,
    label: 'Game Center',
    icon: (active) => (
      <JoystickIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
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
    category === SidebarSelectedCategory.Discover ||
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
          <ResourceSection />
        </InteractivePopup>
      )}
    </>
  );
};

const SidebarStreakButton = (): ReactElement | null => {
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();

  if (!isStreaksEnabled || !streak) {
    return null;
  }

  return (
    <ReadingStreakButton
      streak={streak}
      isLoading={isLoading}
      compact
      iconPosition={ButtonIconPosition.Right}
      iconSize={IconSize.Size16}
      appendTooltipToBody
      className="h-7 rounded-10 px-1.5 hover:bg-surface-hover"
    />
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
  const { isLoggedIn } = useAuthContext();
  const activePage = activePageProp || router.asPath || router.pathname;
  const isFeedPage = activePage.includes('/feeds/');
  const [selectedCategory, setSelectedCategory] = useState(
    isFeedPage
      ? SidebarSelectedCategory.Main
      : normalizeSidebarCategory(
          flags?.sidebarSelectedCategory ?? getSidebarCategoryForPath(activePage),
        ),
  );

  useEffect(() => {
    const activeCategory = getSidebarCategoryForPath(activePage);

    if (isFeedPage) {
      setSelectedCategory(SidebarSelectedCategory.Main);
      return;
    }

    setSelectedCategory(
      activeCategory === SidebarSelectedCategory.Main
        ? normalizeSidebarCategory(flags?.sidebarSelectedCategory)
        : activeCategory,
    );
  }, [activePage, flags?.sidebarSelectedCategory, isFeedPage]);

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded: true,
      shouldShowLabel: true,
      activePage,
    }),
    [activePage],
  );

  const onSelectCategory = useCallback(
    (category: SidebarSelectedCategory) => {
      setSelectedCategory(category);
      updateFlag(SidebarSettingsFlags.SelectedCategory, category);
      if (category === SidebarSelectedCategory.GameCenter) {
        router.push(`${webappUrl}game-center`).catch(() => undefined);
      }
    },
    [router, updateFlag],
  );

  const onToggleExpanded = useCallback(() => {
    logEvent({
      event_name: `${sidebarExpanded ? 'open' : 'close'} sidebar`,
    });
    toggleSidebarExpanded();
  }, [logEvent, sidebarExpanded, toggleSidebarExpanded]);

  const renderSelectedSection = (): ReactElement => {
    if (selectedCategory === SidebarSelectedCategory.Squads) {
      return (
        <NetworkSection
          {...defaultRenderSectionProps}
          title="Squads"
          isItemsButton={isNavButtons ?? false}
        />
      );
    }

    if (selectedCategory === SidebarSelectedCategory.Saved) {
      return (
        <BookmarkSection
          {...defaultRenderSectionProps}
          title="Saved"
          isItemsButton={false}
        />
      );
    }

    if (selectedCategory === SidebarSelectedCategory.Settings) {
      return <InnerProfileSettingsMenu className="px-3" />;
    }

    if (selectedCategory === SidebarSelectedCategory.GameCenter) {
      return (
        <div className="flex flex-col">
          <QuestButton panelOnly />
          <AchievementTrackerPanel />
        </div>
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
        <DiscoverSection
          {...defaultRenderSectionProps}
          title="Discover"
          isItemsButton={isNavButtons ?? false}
        />
      </>
    );
  };

  const selectedLabel = sidebarCategories.find(
    (category) => category.id === selectedCategory,
  )?.label;
  const isSettingsSelected =
    selectedCategory === SidebarSelectedCategory.Settings;
  const isGameCenterSelected =
    selectedCategory === SidebarSelectedCategory.GameCenter;
  const isUtilityPanelSelected = isSettingsSelected || isGameCenterSelected;

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
        className="flex h-dvh min-h-dvh w-16 shrink-0 flex-col items-center gap-1 px-3 py-3"
      >
        <Tooltip side="right" content="Home">
          <div>
            <Link href={webappUrl} passHref prefetch={false}>
              <a
                aria-label="Home"
                className="focus-outline flex size-10 items-center justify-center overflow-hidden rounded-12 transition-opacity hover:opacity-80"
                onClick={onLogoClick}
              >
                <img
                  src={fromCDN('/assets/sidebar-app-icon.png')}
                  alt=""
                  className="size-full object-cover"
                />
              </a>
            </Link>
          </div>
        </Tooltip>

        <Tooltip side="right" content="Search">
          <button
            type="button"
            aria-label="Search"
            onClick={openSpotlight}
            className="flex size-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus-outline"
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
            const isSelected = selectedCategory === category.id;

            return (
              <React.Fragment key={category.id}>
                {category.id === SidebarSelectedCategory.Saved &&
                  isLoggedIn && <NotificationsBell rail />}
                <Tooltip side="right" content={category.label}>
                  <button
                    type="button"
                    role="tab"
                    id={`sidebar-category-${category.id}`}
                    aria-controls="sidebar-context-panel"
                    aria-label={category.label}
                    aria-selected={isSelected}
                    onClick={() => onSelectCategory(category.id)}
                    className={classNames(
                      railButtonClass,
                      isSelected && 'bg-background-default text-white',
                    )}
                  >
                    {category.icon(isSelected)}
                  </button>
                </Tooltip>
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col items-center gap-1">
          <Tooltip side="right" content="Settings">
            <div>
              <Link href={settingsUrl} passHref>
                <a
                  id={`sidebar-category-${SidebarSelectedCategory.Settings}`}
                  aria-label="Settings"
                  className={classNames(
                    railButtonClass,
                    isSettingsSelected &&
                      'bg-background-default text-white',
                  )}
                  onClick={() =>
                    onSelectCategory(SidebarSelectedCategory.Settings)
                  }
                >
                  <SettingsIcon
                    secondary={isSettingsSelected}
                    size={IconSize.Small}
                    aria-hidden
                  />
                </a>
              </Link>
            </div>
          </Tooltip>

          <SidebarSupportButton />
        </div>
      </nav>

      {!sidebarExpanded && (
        <Tooltip side="right" content="Open sidebar">
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-label="Open sidebar"
            className="focus-outline absolute left-16 top-4 z-1 hidden size-6 -translate-x-1/2 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-background-default text-text-tertiary shadow-1 transition-colors hover:bg-surface-hover hover:text-text-primary laptop:flex"
          >
            <SidebarArrowRight size={IconSize.XSmall} aria-hidden />
          </button>
        </Tooltip>
      )}

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
        {isSettingsSelected ? (
          <div className="flex h-10 items-center px-3 pt-3">
            <Typography bold type={TypographyType.Body}>
              Settings
            </Typography>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1 px-2 pt-3">
            {isLoggedIn ? (
              <ProfileButton compact className="max-w-[calc(100%-5.25rem)]" />
            ) : (
              <div className="flex-1" />
            )}

            <div className="ml-auto flex shrink-0 items-center gap-1">
              {isLoggedIn && <SidebarStreakButton />}

              <Tooltip side="bottom" content="Close sidebar">
                <button
                  type="button"
                  onClick={onToggleExpanded}
                  aria-label="Close sidebar"
                  className="focus-outline flex size-7 shrink-0 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  <SidebarArrowLeft size={IconSize.XSmall} aria-hidden />
                </button>
              </Tooltip>
            </div>
          </div>
        )}

        {!isUtilityPanelSelected && (
          <div className="px-3 pt-2">
            <CreatePostButton
              className="!flex w-full justify-start whitespace-nowrap"
              size={ButtonSize.Small}
              showIcon
            />
          </div>
        )}

        {isLoggedIn && !isUtilityPanelSelected && additionalButtons && (
          <div className="mt-2 flex items-center gap-1 px-3">
            {additionalButtons}
          </div>
        )}

        <SidebarScrollWrapper
          className={classNames(
            'mt-2 min-h-0 flex-1',
            showFeedbackWidget && !isUtilityPanelSelected && 'pb-16',
          )}
        >
          <Nav>{renderSelectedSection()}</Nav>
          {selectedCategory === SidebarSelectedCategory.Main && (
            <div className="px-3 pb-3">
              <HighlightPostSidebarWidget />
            </div>
          )}
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
