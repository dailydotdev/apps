import classNames from 'classnames';
import React, { ReactElement, ReactNode, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../contexts/AuthContext';
import LoginButton from '../LoginButton';
import ProfileButton from '../profile/ProfileButton';
import HeaderLogo from './HeaderLogo';
import { CreatePostButton } from '../post/write';
import { useConditionalFeature, useViewSize, ViewSize } from '../../hooks';
import { useReadingStreak } from '../../hooks/streaks';
import { LogoPosition } from '../Logo';
import NotificationsBell from '../notifications/NotificationsBell';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useActiveFeedNameContext } from '../../contexts';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { feature } from '../../lib/featureManagement';
import FeedNav from '../feeds/FeedNav';

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

function MainLayoutHeader({
  hasBanner,
  sidebarRendered,
  additionalButtons,
  onLogoClick,
}: MainLayoutHeaderProps): ReactElement {
  const { user, isLoggedIn } = useAuthContext();
  const { loadedSettings } = useSettingsContext();
  const { streak, isStreaksEnabled } = useReadingStreak();
  const isStreakLarge = streak?.current > 99; // if we exceed 100, we need to display it differently in the UI
  const { feedName } = useActiveFeedNameContext();
  const { isAnyExplore, isSearch } = useFeedName({
    feedName,
  });
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { value: mobileExploreTab } = useConditionalFeature({
    feature: feature.mobileExploreTab,
    shouldEvaluate: !isLaptop,
  });
  const isSearchPage = isSearch || (isAnyExplore && mobileExploreTab);
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });

  const RenderButtons = useCallback(() => {
    return (
      <div className="ml-auto flex justify-end gap-3">
        {loadedSettings && (
          <>
            <CreatePostButton />
            {additionalButtons}
            {isLoggedIn ? (
              <>
                <NotificationsBell />
                <ProfileButton className="hidden laptop:flex" />
              </>
            ) : (
              <LoginButton
                className={{
                  container: 'gap-4',
                  button: 'hidden laptop:block',
                }}
              />
            )}
          </>
        )}
      </div>
    );
  }, [additionalButtons, isLoggedIn, loadedSettings]);

  const RenderSearchPanel = useCallback(
    () =>
      loadedSettings &&
      isLoggedIn && (
        <SearchPanel
          className={{
            container: classNames(
              'left-0 top-0 z-header mr-auto items-center py-3 tablet:left-16 laptop:left-0 laptopL:mx-auto laptopL:w-full',
              mobileExploreTab && isSearchPage
                ? 'tablet:relative tablet:!left-0'
                : undefined,
              isSearchPage
                ? 'relative right-0 tablet:absolute laptop:relative laptop:top-0'
                : 'hidden laptop:flex',
              hasBanner && 'tablet:top-18',
            ),
            field: 'mx-2 laptop:mx-auto',
          }}
        />
      ),
    [loadedSettings, isLoggedIn, mobileExploreTab, isSearchPage, hasBanner],
  );

  if (loadedSettings && !isLaptop) {
    if (mobileExploreTab && isSearchPage) {
      return (
        <div className="sticky top-0 z-header w-full bg-background-default tablet:pl-16">
          <RenderSearchPanel />
          {!isSearch && (
            <h3 className="mx-4 flex h-12 items-center font-bold typo-body">
              Explore
            </h3>
          )}
        </div>
      );
    }

    return (
      <>
        <FeedNav />
        <RenderSearchPanel />
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
              user={user}
              onLogoClick={onLogoClick}
              greeting={false}
            />
          </div>
          <RenderSearchPanel />
          <RenderButtons />
        </>
      )}
    </header>
  );
}

export default MainLayoutHeader;
