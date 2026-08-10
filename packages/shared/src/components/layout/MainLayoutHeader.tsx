import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import HeaderLogo from './HeaderLogo';
import { useViewSize, ViewSize } from '../../hooks';
import { useReadingStreak } from '../../hooks/streaks';
import { LogoPosition } from '../Logo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useActiveFeedNameContext } from '../../contexts';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { SharedFeedPage } from '../utilities';
import FeedNav from '../feeds/FeedNav';
import useActiveNav from '../../hooks/useActiveNav';
import { AgentExploreEntry } from '../../features/interests/components/AgentExploreEntry';

export interface MainLayoutHeaderProps {
  hasBanner?: boolean;
  sidebarRendered?: boolean;
  additionalButtons?: ReactNode;
  onLogoClick?: (e: React.MouseEvent) => unknown;
}

const SpotlightTrigger = dynamic(
  () =>
    import(
      /* webpackChunkName: "spotlightTrigger" */ '../spotlight/SpotlightTrigger'
    ),
);

const HeaderButtons = dynamic(
  () => import(/* webpackChunkName: "headerButtons" */ './HeaderButtons'),
  { ssr: false },
);

function MainLayoutHeader({
  hasBanner,
  sidebarRendered,
  additionalButtons,
  onLogoClick,
}: MainLayoutHeaderProps): ReactElement {
  const { loadedSettings } = useSettingsContext();
  const [hasHydrated, setHasHydrated] = useState(false);
  const { streak, isStreaksEnabled } = useReadingStreak();
  const isStreakLarge = (streak?.current ?? 0) > 99; // if we exceed 100, we need to display it differently in the UI
  const { feedName } = useActiveFeedNameContext();
  const activeFeedName = feedName ?? SharedFeedPage.Popular;
  const { isAnyExplore, isSearch } = useFeedName({
    feedName: activeFeedName,
  });
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isSearchPage = isSearch || isAnyExplore;
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });
  const { profile } = useActiveNav(activeFeedName);
  const shouldUseLoadedSettings = loadedSettings && hasHydrated;
  const isMobileProfile = profile && !isLaptop;
  const isMobile = !isLaptop;
  const isMobileSearchPage =
    shouldUseLoadedSettings && isMobile && isSearchPage;
  const shouldRenderFeedNav =
    shouldUseLoadedSettings && isMobile && !isSearchPage;

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const renderSearchPanel = useCallback(
    () =>
      shouldUseLoadedSettings && (
        <div
          className={classNames(
            'left-0 top-0 z-header mx-2 items-center py-3 tablet:left-16 laptop:left-0',
            // Every header child is flex-shrink:0 via the global reset, so a
            // crowded action rail overflows the header instead of compressing
            // it. The search is the one element that can afford to give up
            // width, so it absorbs the squeeze at desktop widths. Laptop-scoped
            // so the mobile search page keeps its original layout.
            'laptop:min-w-0 laptop:flex-1',
            isSearchPage
              ? 'relative right-0 tablet:!left-0 laptop:top-0'
              : 'hidden laptop:flex',
            hasBanner && 'tablet:top-18',
          )}
        >
          {/* This slot is the whole mobile Explore header, so the pair replaces
              the field rather than stacking a second Search under it. */}
          {isAnyExplore && !isSearch ? (
            <AgentExploreEntry fallback={<SpotlightTrigger />} />
          ) : (
            <SpotlightTrigger />
          )}
        </div>
      ),
    [shouldUseLoadedSettings, isSearchPage, isAnyExplore, isSearch, hasBanner],
  );

  if (shouldRenderFeedNav) {
    return (
      <>
        <FeedNav />
      </>
    );
  }

  return (
    <header
      className={classNames(
        isMobileSearchPage
          ? 'sticky top-0 w-full bg-background-default tablet:pl-16'
          : 'fixed top-0 h-14 flex-row content-center items-center justify-center gap-3 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3 tablet:px-8 laptop:left-0 laptop:h-16 laptop:w-full laptop:px-4',
        'z-header',
        !isMobileSearchPage &&
          (isMobileProfile ? 'hidden laptop:flex' : 'flex'),
        hasBanner && 'laptop:[--safe-area-top-offset:2rem]',
        !isMobileSearchPage && isSearchPage && 'mb-16 laptop:mb-0',
        !isMobileSearchPage && scrollClassName,
      )}
      style={featureTheme ? featureTheme.navbar : undefined}
    >
      {isMobileSearchPage
        ? renderSearchPanel()
        : sidebarRendered !== undefined && (
            <>
              <div>
                <HeaderLogo
                  position={
                    isStreaksEnabled && isStreakLarge
                      ? LogoPosition.Relative
                      : LogoPosition.Absolute
                  }
                  onLogoClick={onLogoClick}
                />
              </div>
              {renderSearchPanel()}
              <HeaderButtons additionalButtons={additionalButtons} />
            </>
          )}
    </header>
  );
}

export default MainLayoutHeader;
