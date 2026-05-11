import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Nav, SidebarAside, SidebarScrollWrapper } from './common';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useBanner } from '../../hooks/useBanner';
import { MainSection } from './sections/MainSection';
import { CustomFeedSection } from './sections/CustomFeedSection';
import { DiscoverSection } from './sections/DiscoverSection';
import { SidebarMenuIcon } from './SidebarMenuIcon';
import { CreatePostButton } from '../post/write';
import { ButtonSize } from '../buttons/Button';
import { BookmarkSection } from './sections/BookmarkSection';
import { NetworkSection } from './sections/NetworkSection';
import { HelpWidget } from '../help/HelpWidget';
import {
  BookmarkIcon,
  HashtagIcon,
  HomeIcon,
  HotIcon,
  SourceIcon,
} from '../icons';
import { IconSize } from '../Icon';
import {
  SidebarSelectedCategory,
  SidebarSettingsFlags,
} from '../../graphql/settings';
import { Tooltip } from '../tooltip/Tooltip';

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

type SidebarDesktopProps = {
  activePage?: string;
  featureTheme?: {
    logo?: string;
    logoText?: string;
  };
  isNavButtons?: boolean;
  onNavTabClick?: (tab: string) => void;
};
export const SidebarDesktop = ({
  activePage: activePageProp,
  featureTheme,
  isNavButtons,
  onNavTabClick,
}: SidebarDesktopProps): ReactElement => {
  const router = useRouter();
  const { flags, sidebarExpanded, updateFlag } = useSettingsContext();
  const { isAvailable: isBannerAvailable } = useBanner();
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

  return (
    <SidebarAside
      data-testid="sidebar-aside"
      className={classNames(
        'laptop:flex-row laptop:gap-2 laptop:border-r-0 laptop:bg-background-default laptop:p-2',
        sidebarExpanded ? 'laptop:w-[19rem]' : 'laptop:w-16',
        isBannerAvailable
          ? 'laptop:[--safe-area-top-offset:6rem]'
          : 'laptop:[--safe-area-top-offset:4rem]',
        featureTheme && 'bg-transparent',
      )}
    >
      <nav
        role="tablist"
        aria-label="Sidebar categories"
        className="flex h-full w-12 shrink-0 flex-col items-center gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float py-2 shadow-2"
      >
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
                  'flex h-10 w-10 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus-outline',
                  isSelected && 'bg-surface-hover text-text-primary',
                )}
              >
                {category.icon(isSelected)}
              </button>
            </Tooltip>
          );
        })}
      </nav>

      <section
        id="sidebar-context-panel"
        role="tabpanel"
        aria-labelledby={`sidebar-category-${selectedCategory}`}
        aria-label={`${selectedCategory} navigation`}
        className={classNames(
          'flex min-w-0 flex-1 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float shadow-2 transition-[opacity,width] duration-300',
          sidebarExpanded
            ? 'w-60 opacity-100'
            : 'pointer-events-none w-0 opacity-0',
        )}
      >
        <SidebarScrollWrapper className="!h-auto min-h-0 flex-1">
          <Nav>
            <SidebarMenuIcon />
            <div className="mb-2 flex items-center justify-center px-2">
              <CreatePostButton
                className="!flex w-full justify-start whitespace-nowrap"
                size={ButtonSize.Small}
                showIcon
              />
            </div>
            {renderSelectedSection()}
          </Nav>
        </SidebarScrollWrapper>

        <HelpWidget sidebarExpanded />
      </section>
    </SidebarAside>
  );
};
