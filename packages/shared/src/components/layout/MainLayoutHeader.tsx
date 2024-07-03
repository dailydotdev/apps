import classNames from 'classnames';
import React, { ReactElement, ReactNode, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import LoginButton from '../LoginButton';
import ProfileButton from '../profile/ProfileButton';
import HeaderLogo from './HeaderLogo';
import { CreatePostButton } from '../post/write';
import { useViewSize, ViewSize } from '../../hooks';
import { useReadingStreak } from '../../hooks/streaks';
import { LogoPosition } from '../Logo';
import NotificationsBell from '../notifications/NotificationsBell';
import FeedNav from '../feeds/FeedNav';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { feature } from '../../lib/featureManagement';
import { useFeature } from '../GrowthBookProvider';
import { HypeButton } from '../referral';
import { useSettingsContext } from '../../contexts/SettingsContext';

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
  const router = useRouter();
  const isSearchPage = !!router.pathname?.startsWith('/search');
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });
  const isLaptop = useViewSize(ViewSize.Laptop);
  const hypeCampaign = useFeature(feature.hypeCampaign);

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
              isSearchPage
                ? 'absolute right-0 laptop:relative laptop:top-0'
                : 'hidden laptop:flex',
              hasBanner && 'tablet:top-18',
            ),
            field: 'mx-2 laptop:mx-auto',
          }}
        />
      ),
    [isLoggedIn, loadedSettings, isSearchPage, hasBanner],
  );

  if (loadedSettings && !isLaptop) {
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
            {hypeCampaign && <HypeButton className="ml-4" />}
          </div>
          <RenderSearchPanel />
          <RenderButtons />
        </>
      )}
    </header>
  );
}

export default MainLayoutHeader;
