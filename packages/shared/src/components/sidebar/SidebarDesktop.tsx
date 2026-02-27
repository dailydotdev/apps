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
  disabled?: boolean;
};
export const SidebarDesktop = ({
  activePage: activePageProp,
  featureTheme,
  isNavButtons,
  onNavTabClick,
  disabled,
}: SidebarDesktopProps): ReactElement => {
  const router = useRouter();
  const { sidebarExpanded } = useSettingsContext();
  const { isAvailable: isBannerAvailable } = useBanner();
  const activePage = activePageProp || router.asPath || router.pathname;

  const effectiveExpanded = disabled ? false : sidebarExpanded;

  const defaultRenderSectionProps = useMemo(
    () => ({
      sidebarExpanded: effectiveExpanded,
      shouldShowLabel: effectiveExpanded,
      activePage,
    }),
    [effectiveExpanded, activePage],
  );

  return (
    <SidebarAside
      data-testid="sidebar-aside"
      className={classNames(
        effectiveExpanded ? 'laptop:w-60' : 'laptop:w-11',
        isBannerAvailable
          ? 'laptop:top-24 laptop:h-[calc(100vh-theme(space.24))]'
          : 'laptop:top-16 laptop:h-[calc(100vh-theme(space.16))]',
        featureTheme && 'bg-transparent',
        disabled && 'pointer-events-none select-none',
      )}
      aria-disabled={disabled || undefined}
    >
      <SidebarScrollWrapper>
        <Nav
          className={classNames(
            disabled &&
              '[&_a]:!text-text-disabled [&_button]:!text-text-disabled [&_span]:!text-text-disabled [&_svg]:!text-text-disabled',
          )}
        >
          {!disabled && <SidebarMenuIcon />}
          {!disabled && (
            <div
              className={classNames(
                'mb-2 flex items-center justify-center transition-[padding] duration-300',
                effectiveExpanded ? 'px-2' : 'px-1',
              )}
            >
              <CreatePostButton
                className={classNames(
                  '!flex whitespace-nowrap',
                  effectiveExpanded ? 'w-full justify-start' : 'justify-center',
                )}
                compact={!effectiveExpanded}
                size={ButtonSize.Small}
                showIcon
              />
            </div>
          )}

          {/* Primary Navigation - Always visible */}
          <MainSection
            {...defaultRenderSectionProps}
            onNavTabClick={onNavTabClick}
            isItemsButton={isNavButtons ?? false}
          />

          {!disabled && (
            <>
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
                isItemsButton={isNavButtons ?? false}
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
                isItemsButton={isNavButtons ?? false}
              />
            </>
          )}
        </Nav>
      </SidebarScrollWrapper>
    </SidebarAside>
  );
};
