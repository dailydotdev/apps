import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useCallback } from 'react';
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

  const RenderSearchPanel = useCallback(
    () =>
      loadedSettings && (
        <SearchPanel
          className={{
            container: classNames(
              'z-header tablet:left-16 laptop:left-0 left-0 top-0 items-center py-3',
              isSearchPage
                ? 'tablet:!left-0 laptop:top-0 relative right-0'
                : 'laptop:flex hidden',
              hasBanner && 'tablet:top-18',
            ),
            field: 'laptop:mx-auto mx-2',
          }}
        />
      ),
    [loadedSettings, isSearchPage, hasBanner],
  );

  if (loadedSettings && !isLaptop) {
    if (isSearchPage) {
      return (
        <div className="z-header bg-background-default tablet:pl-16 sticky top-0 w-full">
          <RenderSearchPanel />
          {!isSearch && <MobileExploreHeader path={feedName as string} />}
        </div>
      );
    }

    return (
      <>
        <FeedNav />
      </>
    );
  }

  return (
    <header
      className={classNames(
        'z-header border-border-subtlest-tertiary tablet:px-8 laptop:left-0 laptop:h-16 laptop:w-full laptop:px-4 sticky top-0 flex h-14 flex-row content-center items-center justify-center gap-3 border-b px-4 py-3',
        hasBanner && 'laptop:top-8',
        isSearchPage && 'laptop:mb-0 mb-16',
        scrollClassName,
      )}
      style={featureTheme ? featureTheme.navbar : undefined}
    >
      {sidebarRendered !== undefined && (
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
          <RenderSearchPanel />
          <HeaderButtons additionalButtons={additionalButtons} />
        </>
      )}
    </header>
  );
}

export default MainLayoutHeader;
