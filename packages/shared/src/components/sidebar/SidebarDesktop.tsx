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
import useCustomFeedHeader from '../../hooks/feed/useCustomFeedHeader';

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
  const { customFeedPlacement } = useCustomFeedHeader();

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded,
      shouldShowLabel: sidebarExpanded,
      activePage,
    }),
    [sidebarExpanded, activePage],
  );

  // For experiment purposes. Can insert the winning order directly into the return jsx on cleanup.
  const bookmarkAndNetworkSection = useMemo(() => {
    const sections: ReactElement[] = [
      <NetworkSection
        {...defaultRenderSectionProps}
        title="Network"
        isItemsButton={isNavButtons}
        key="network-section"
      />,
      <BookmarkSection
        {...defaultRenderSectionProps}
        title="Bookmarks"
        isItemsButton={false}
        key="bookmark-section"
      />,
    ];
    return customFeedPlacement ? sections.reverse() : sections;
  }, [defaultRenderSectionProps, customFeedPlacement, isNavButtons]);

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
          {!customFeedPlacement && (
            <CustomFeedSection
              {...defaultRenderSectionProps}
              onNavTabClick={onNavTabClick}
              title="Custom feeds"
              isItemsButton={false}
            />
          )}
          {bookmarkAndNetworkSection}
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
