import classNames from 'classnames';
import React, { ReactElement, ReactNode, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../contexts/AuthContext';
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
  const { user } = useAuthContext();
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
              'left-0 top-0 z-header mr-auto items-center py-3 tablet:left-16 laptop:left-0 laptopL:mx-auto laptopL:w-full',
              isSearchPage
                ? 'relative right-0 tablet:!left-0 laptop:top-0'
                : 'hidden laptop:flex',
              hasBanner && 'tablet:top-18',
            ),
            field: 'mx-2 laptop:mx-auto',
          }}
        />
      ),
    [loadedSettings, isSearchPage, hasBanner],
  );

  if (loadedSettings && !isLaptop) {
    if (isSearchPage) {
      return (
        <div className="sticky top-0 z-header w-full bg-background-default tablet:pl-16">
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
        'sticky top-0 z-header flex h-14 flex-row content-center items-center justify-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3 tablet:px-8 laptop:left-0 laptop:h-16 laptop:w-full laptop:px-4 laptopL:grid laptopL:auto-cols-fr laptopL:grid-flow-col',
        hasBanner && 'laptop:top-8',
        isSearchPage && 'mb-16 laptop:mb-0',
        scrollClassName,
      )}
      style={featureTheme ? featureTheme.navbar : undefined}
    >
      {sidebarRendered !== undefined && (
        <>
          <div
            className={classNames(
              'flex flex-1  laptop:flex-none laptop:justify-start',
              isStreaksEnabled && isStreakLarge
                ? 'justify-start'
                : 'justify-center',
            )}
          >
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
