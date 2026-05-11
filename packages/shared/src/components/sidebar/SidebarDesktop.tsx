import classNames from 'classnames';
import type { ReactElement } from 'react';
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
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BookmarkSection } from './sections/BookmarkSection';
import { NetworkSection } from './sections/NetworkSection';
import { HelpWidget } from '../help/HelpWidget';
import {
  BookmarkIcon,
  HashtagIcon,
  HomeIcon,
  HotIcon,
  SourceIcon,
  SearchIcon,
  SidebarArrowLeft,
  SidebarArrowRight,
} from '../icons';
import { IconSize } from '../Icon';
import {
  SidebarSelectedCategory,
  SidebarSettingsFlags,
} from '../../graphql/settings';
import { Tooltip } from '../tooltip/Tooltip';
import HeaderLogo from '../layout/HeaderLogo';
import { LogoPosition } from '../Logo';
import { useSpotlight } from '../spotlight/useSpotlight';
import { useAuthContext } from '../../contexts/AuthContext';
import NotificationsBell from '../notifications/NotificationsBell';
import { OpportunityEntryButton } from '../opportunity/OpportunityEntryButton';
import { QuestHeaderButton } from '../header/QuestHeaderButton';
import ProfileButton from '../profile/ProfileButton';

type SidebarCategoryConfig = {
  id: SidebarSelectedCategory;
  label: string;
  icon: (active: boolean) => ReactElement;
};

const sidebarCategories: SidebarCategoryConfig[] = [
  {
    id: SidebarSelectedCategory.Main,
    label: 'Main',
    icon: (active) => (
      <HomeIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarSelectedCategory.Feeds,
    label: 'Feeds',
    icon: (active) => (
      <HashtagIcon secondary={active} size={IconSize.Small} aria-hidden />
    ),
  },
  {
    id: SidebarSelectedCategory.Squads,
    label: 'Squads',
    icon: (active) => (
      <SourceIcon secondary={active} size={IconSize.Small} aria-hidden />
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
    id: SidebarSelectedCategory.Discover,
    label: 'Discover',
    icon: (active) => (
      <HotIcon secondary={active} size={IconSize.Small} aria-hidden />
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

  if (activePage.includes('/feeds/')) {
    return SidebarSelectedCategory.Feeds;
  }

  if (
    activePage.includes('/tags') ||
    activePage.includes('/sources') ||
    activePage.includes('/users') ||
    activePage.includes('/discussed')
  ) {
    return SidebarSelectedCategory.Discover;
  }

  return SidebarSelectedCategory.Main;
};

const railButtonClass =
  'flex h-10 w-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus-outline';

type SidebarDesktopProps = {
  activePage?: string;
  featureTheme?: {
    logo?: string;
    logoText?: string;
  };
  isNavButtons?: boolean;
  onNavTabClick?: (tab: string) => void;
  onLogoClick?: (e: React.MouseEvent) => unknown;
};
export const SidebarDesktop = ({
  activePage: activePageProp,
  featureTheme,
  isNavButtons,
  onNavTabClick,
  onLogoClick,
}: SidebarDesktopProps): ReactElement => {
  const router = useRouter();
  const { flags, sidebarExpanded, toggleSidebarExpanded, updateFlag } =
    useSettingsContext();
  const { logEvent } = useLogContext();
  const { isAvailable: isBannerAvailable } = useBanner();
  const { open: openSpotlight } = useSpotlight();
  const { isLoggedIn } = useAuthContext();
  const activePage = activePageProp || router.asPath || router.pathname;
  const [selectedCategory, setSelectedCategory] = useState(
    flags?.sidebarSelectedCategory ?? getSidebarCategoryForPath(activePage),
  );

  useEffect(() => {
    const activeCategory = getSidebarCategoryForPath(activePage);

    setSelectedCategory(
      activeCategory === SidebarSelectedCategory.Main
        ? flags?.sidebarSelectedCategory ?? activeCategory
        : activeCategory,
    );
  }, [activePage, flags?.sidebarSelectedCategory]);

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
    },
    [updateFlag],
  );

  const onToggleExpanded = useCallback(() => {
    logEvent({
      event_name: `${sidebarExpanded ? 'open' : 'close'} sidebar`,
    });
    toggleSidebarExpanded();
  }, [logEvent, sidebarExpanded, toggleSidebarExpanded]);

  const renderSelectedSection = (): ReactElement => {
    if (selectedCategory === SidebarSelectedCategory.Feeds) {
      return (
        <CustomFeedSection
          {...defaultRenderSectionProps}
          onNavTabClick={onNavTabClick}
          title="Feeds"
          isItemsButton={false}
        />
      );
    }

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

    if (selectedCategory === SidebarSelectedCategory.Discover) {
      return (
        <DiscoverSection
          {...defaultRenderSectionProps}
          title="Discover"
          isItemsButton={isNavButtons ?? false}
        />
      );
    }

    return (
      <MainSection
        {...defaultRenderSectionProps}
        title="Main"
        onNavTabClick={onNavTabClick}
        isItemsButton={isNavButtons ?? false}
      />
    );
  };

  const selectedLabel = sidebarCategories.find(
    (category) => category.id === selectedCategory,
  )?.label;

  return (
    <SidebarAside
      data-testid="sidebar-aside"
      className={classNames(
        'laptop:flex-row laptop:border-r-0 laptop:bg-transparent',
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
      <nav
        role="tablist"
        aria-label="Sidebar categories"
        className="flex h-full w-16 shrink-0 flex-col items-center gap-1 px-3 py-3"
      >
        <div className="mb-1 flex h-10 w-10 items-center justify-center">
          <HeaderLogo
            compact
            position={LogoPosition.Empty}
            onLogoClick={onLogoClick}
          />
        </div>
        <div className="mb-2 h-px w-6 bg-border-subtlest-tertiary" />

        {sidebarCategories.map((category) => {
          const isSelected = selectedCategory === category.id;

          return (
            <Tooltip key={category.id} side="right" content={category.label}>
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
                  isSelected && 'bg-surface-float text-text-primary',
                )}
              >
                {category.icon(isSelected)}
              </button>
            </Tooltip>
          );
        })}

        <div className="flex-1" />

        <Tooltip side="right" content="Search">
          <button
            type="button"
            aria-label="Search"
            onClick={openSpotlight}
            className={railButtonClass}
          >
            <SearchIcon size={IconSize.Small} aria-hidden />
          </button>
        </Tooltip>
        {isLoggedIn && (
          <>
            <div className="flex h-10 w-10 items-center justify-center">
              <NotificationsBell />
            </div>
            <div className="flex h-10 w-10 items-center justify-center">
              <ProfileButton settingsIconOnly />
            </div>
          </>
        )}
        <Tooltip
          side="right"
          content={sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
        >
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={onToggleExpanded}
            aria-label={sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
            icon={
              sidebarExpanded ? <SidebarArrowLeft /> : <SidebarArrowRight />
            }
            className="text-text-quaternary hover:text-text-primary"
          />
        </Tooltip>
      </nav>

      <section
        id="sidebar-context-panel"
        role="tabpanel"
        aria-labelledby={`sidebar-category-${selectedCategory}`}
        aria-label={`${selectedLabel ?? selectedCategory} navigation`}
        className={classNames(
          'flex min-w-0 flex-1 flex-col overflow-hidden transition-[opacity,width] duration-300',
          sidebarExpanded
            ? 'w-60 opacity-100'
            : 'pointer-events-none w-0 opacity-0',
        )}
      >
        <div className="px-3 pt-4">
          <CreatePostButton
            className="!flex w-full justify-start whitespace-nowrap"
            size={ButtonSize.Small}
            showIcon
          />
        </div>

        <SidebarScrollWrapper className="!h-auto mt-2 min-h-0 flex-1">
          <Nav>{renderSelectedSection()}</Nav>
        </SidebarScrollWrapper>

        {isLoggedIn && (
          <div className="flex items-center justify-end gap-1 border-t border-border-subtlest-tertiary px-2 py-2">
            <OpportunityEntryButton />
            <QuestHeaderButton compact />
          </div>
        )}

        <HelpWidget sidebarExpanded />
      </section>
    </SidebarAside>
  );
};
