import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
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
  const { sidebarExpanded } = useSettingsContext();
  const { isAvailable: isBannerAvailable } = useBanner();
  const activePage = activePageProp || router.asPath || router.pathname;

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded,
      shouldShowLabel: sidebarExpanded,
      activePage,
    }),
    [sidebarExpanded, activePage],
  );

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
          {/* Primary Action */}
          <div
            className={classNames(
              'mb-2 transition-[padding] duration-300',
              sidebarExpanded ? 'px-2' : 'px-1',
            )}
          >
            <CreatePostButton
              className={classNames(
                '!flex w-full whitespace-nowrap',
                sidebarExpanded ? 'justify-start' : 'justify-center',
              )}
              compact={!sidebarExpanded}
              size={sidebarExpanded ? ButtonSize.Small : ButtonSize.XSmall}
              showIcon
            />
          </div>

          {/* Primary Navigation - Always visible */}
          <MainSection
            {...defaultRenderSectionProps}
            onNavTabClick={onNavTabClick}
            isItemsButton={isNavButtons}
          />

          {/* User Content Sections */}
          <CustomFeedSection
            {...defaultRenderSectionProps}
            onNavTabClick={onNavTabClick}
            title="Feeds"
            isItemsButton={false}
          />
          <NetworkSection
            {...defaultRenderSectionProps}
            title="Squads"
            isItemsButton={isNavButtons}
            key="network-section"
          />
          <BookmarkSection
            {...defaultRenderSectionProps}
            title="Saved"
            isItemsButton={false}
            key="bookmark-section"
          />

          {/* Discovery Section */}
          <DiscoverSection
            {...defaultRenderSectionProps}
            title="Discover"
            isItemsButton={isNavButtons}
          />
        </Nav>
      </SidebarScrollWrapper>
    </SidebarAside>
  );
};
