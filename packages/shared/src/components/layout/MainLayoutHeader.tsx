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
import FeedNav from '../feeds/FeedNav';
import { MobileExploreHeader } from '../header/MobileExploreHeader';
import useActiveNav from '../../hooks/useActiveNav';

export interface MainLayoutHeaderProps {
  hasBanner?: boolean;
  sidebarRendered?: boolean;
  additionalButtons?: ReactNode;
  onLogoClick?: (e: React.MouseEvent) => unknown;
}

const SearchPanel = dynamic(
  () =>
    import(
      /* webpackChunkName: "searchPanel" */ '../search/SearchPanel/SearchPanel'
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
  const isStreakLarge = streak?.current > 99; // if we exceed 100, we need to display it differently in the UI
  const { feedName } = useActiveFeedNameContext();
  const { isAnyExplore, isSearch } = useFeedName({
    feedName,
  });
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isSearchPage = isSearch || isAnyExplore;
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });
  const { profile } = useActiveNav(feedName);
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
        <SearchPanel
          className={{
            container: classNames(
              'left-0 top-0 z-header items-center py-3 tablet:left-16 laptop:left-0',
              isSearchPage
                ? 'relative right-0 tablet:!left-0 laptop:top-0'
                : 'hidden laptop:flex',
              hasBanner && 'tablet:top-18',
            ),
            field: 'mx-2 laptop:mx-auto',
          }}
        />
      ),
    [shouldUseLoadedSettings, isSearchPage, hasBanner],
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
        hasBanner && 'laptop:top-8',
        !isMobileSearchPage && isSearchPage && 'mb-16 laptop:mb-0',
        !isMobileSearchPage && scrollClassName,
      )}
      style={featureTheme ? featureTheme.navbar : undefined}
    >
      {isMobileSearchPage ? (
        <>
          {renderSearchPanel()}
          {!isSearch && <MobileExploreHeader path={feedName as string} />}
        </>
      ) : (
        sidebarRendered !== undefined && (
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
        )
      )}
    </header>
  );
}

export default MainLayoutHeader;
