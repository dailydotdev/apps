import classNames from 'classnames';
import React, { ReactElement, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Nav, SidebarAside, SidebarScrollWrapper } from './common';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useBanner } from '../../hooks/useBanner';
import { useAuthContext } from '../../contexts/AuthContext';
import { SidebarOnboardingChecklistCard } from '../checklist/SidebarOnboardingChecklistCard';
import { ChecklistViewState } from '../../lib/checklist';
import { MobileMenuIcon } from './MobileMenuIcon';
import { MainSection } from './sections/MainSection';
import { NetworkSection } from './sections/NetworkSection';
import { CustomFeedSection } from './sections/CustomFeedSection';
import { DiscoverSection } from './sections/DiscoverSection';
import { ResourceSection } from './sections/ResourceSection';
import { BookmarkSection } from './sections/BookmarkSection';
import { usePlusSubscription } from '../../hooks';

type SidebarDesktopProps = {
  featureTheme?: {
    logo?: string;
    logoText?: string;
  };
  isNavButtons?: boolean;
  onNavTabClick?: (tab: string) => void;
};
export const SidebarDesktop = ({
  featureTheme,
  isNavButtons,
  onNavTabClick,
}: SidebarDesktopProps): ReactElement => {
  const router = useRouter();
  const { sidebarExpanded, onboardingChecklistView, toggleSidebarExpanded } =
    useSettingsContext();
  const { isAvailable: isBannerAvailable } = useBanner();
  const { isLoggedIn } = useAuthContext();
  const activePage = router.asPath || router.pathname;
  const { showPlusSubscription } = usePlusSubscription();

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
      <MobileMenuIcon
        sidebarExpanded={sidebarExpanded}
        toggleSidebarExpanded={toggleSidebarExpanded}
      />
      <SidebarScrollWrapper>
        <Nav>
          <MainSection
            {...defaultRenderSectionProps}
            onNavTabClick={onNavTabClick}
            isItemsButton={isNavButtons}
          />
          <NetworkSection
            {...defaultRenderSectionProps}
            title="Network"
            isItemsButton={isNavButtons}
          />
          <CustomFeedSection
            {...defaultRenderSectionProps}
            title="Custom feeds"
            isItemsButton={false}
          />
          {showPlusSubscription && (
            <BookmarkSection
              {...defaultRenderSectionProps}
              title="Bookmarks"
              isItemsButton={false}
            />
          )}
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
