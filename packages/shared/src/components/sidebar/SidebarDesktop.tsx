import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Nav, SidebarAside, SidebarScrollWrapper } from './common';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useBanner } from '../../hooks/useBanner';
import { useAuthContext } from '../../contexts/AuthContext';
import { SidebarOnboardingChecklistCard } from '../checklist/SidebarOnboardingChecklistCard';
import { ChecklistViewState } from '../../lib/checklist';
import { MainSection } from './sections/MainSection';
import { NetworkSection } from './sections/NetworkSection';
import { CustomFeedSection } from './sections/CustomFeedSection';
import { DiscoverSection } from './sections/DiscoverSection';
import { ResourceSection } from './sections/ResourceSection';
import { BookmarkSection } from './sections/BookmarkSection';
import { SidebarMenuIcon } from './SidebarMenuIcon';
import { CreatePostButton } from '../post/write';
import { ButtonSize } from '../buttons/Button';

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
  const { sidebarExpanded, onboardingChecklistView } = useSettingsContext();
  const { isAvailable: isBannerAvailable } = useBanner();
  const { isLoggedIn } = useAuthContext();
  const activePage = activePageProp || router.asPath || router.pathname;

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded,
      shouldShowLabel: sidebarExpanded,
      activePage,
    }),
    [sidebarExpanded, activePage],
  );

  const isHiddenOnboardingChecklistView =
    onboardingChecklistView === ChecklistViewState.Hidden;

  return (
    <SidebarAside
      data-testid="sidebar-aside"
      className={classNames(
        sidebarExpanded ? 'laptop:w-60' : 'laptop:w-11',
        isBannerAvailable
          ? 'laptop:top-24 laptop:h-[calc(100vh-theme(space.24))]'
          : 'laptop:top-16 laptop:h-[calc(100vh-theme(space.16))]',
        featureTheme && 'bg-transparent',
      )}
    >
      <SidebarScrollWrapper>
        <Nav>
          <SidebarMenuIcon />
          <CreatePostButton
            className={classNames(
              'mb-4 !flex whitespace-nowrap',
              sidebarExpanded ? 'mx-4' : 'mx-auto',
            )}
            compact={!sidebarExpanded}
            size={sidebarExpanded ? ButtonSize.Small : ButtonSize.XSmall}
            showIcon
          />
          <MainSection
            {...defaultRenderSectionProps}
            onNavTabClick={onNavTabClick}
            isItemsButton={isNavButtons}
          />
          <CustomFeedSection
            {...defaultRenderSectionProps}
            onNavTabClick={onNavTabClick}
            title="Custom feeds"
            isItemsButton={false}
          />
          <NetworkSection
            {...defaultRenderSectionProps}
            title="Network"
            isItemsButton={isNavButtons}
          />
          <BookmarkSection
            {...defaultRenderSectionProps}
            title="Bookmarks"
            isItemsButton={false}
          />
          <DiscoverSection
            {...defaultRenderSectionProps}
            title="Discover"
            isItemsButton={isNavButtons}
          />
          <ResourceSection
            {...defaultRenderSectionProps}
            title="Resources"
            isItemsButton={false}
          />
        </Nav>
        {isLoggedIn && sidebarExpanded && !isHiddenOnboardingChecklistView && (
          <>
            <div className="flex-1" />
            <SidebarOnboardingChecklistCard />
          </>
        )}
      </SidebarScrollWrapper>
    </SidebarAside>
  );
};
