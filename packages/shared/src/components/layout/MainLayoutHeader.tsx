import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import AuthContext from '../../contexts/AuthContext';
import { webappUrl } from '../../lib/constants';
import { Button, ButtonVariant } from '../buttons/Button';
import { HamburgerIcon } from '../icons';
import LoginButton from '../LoginButton';
import MobileHeaderRankProgress from '../MobileHeaderRankProgress';
import ProfileButton from '../profile/ProfileButton';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import HeaderLogo from './HeaderLogo';
import { CreatePostButton } from '../post/write';
import { useViewSize, ViewSize } from '../../hooks';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { useReadingStreak } from '../../hooks/streaks';
import { LogoPosition } from '../Logo';
import NotificationsBell from '../notifications/NotificationsBell';
import FeedNav from '../feeds/FeedNav';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';

export interface MainLayoutHeaderProps {
  hasBanner?: boolean;
  sidebarRendered?: boolean;
  optOutWeeklyGoal?: boolean;
  additionalButtons?: ReactNode;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  onMobileSidebarToggle: (state: boolean) => unknown;
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
  optOutWeeklyGoal,
  additionalButtons,
  onLogoClick,
  onMobileSidebarToggle,
}: MainLayoutHeaderProps): ReactElement {
  const { user, isAuthReady } = useContext(AuthContext);
  const { streak, isEnabled: isStreaksEnabled, isLoading } = useReadingStreak();
  const isMobile = useViewSize(ViewSize.MobileL);
  const isStreakLarge = streak?.current > 99; // if we exceed 100, we need to display it differently in the UI
  const router = useRouter();
  const isSearchPage = !!router.pathname?.startsWith('/search');
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });
  const isLaptop = useViewSize(ViewSize.Laptop);

  const headerButton = (() => {
    if (!user) {
      return null;
    }

    if (user && user?.infoConfirmed) {
      return <ProfileButton className="hidden laptop:flex" />;
    }

    return (
      <LoginButton
        className={{ container: 'gap-4', button: 'hidden laptop:block' }}
      />
    );
  })();

  const RenderButtons = () => {
    return (
      <div className="flex gap-3">
        {isStreaksEnabled && (
          <ReadingStreakButton streak={streak} isLoading={isLoading} compact />
        )}
        <CreatePostButton compact={isStreaksEnabled} />
        {!!user && (
          <>
            <LinkWithTooltip
              tooltip={{ placement: 'bottom', content: 'Notifications' }}
              href={`${webappUrl}notifications`}
            >
              <NotificationsBell />
            </LinkWithTooltip>
          </>
        )}
        {additionalButtons}
        {headerButton}
        {!isStreaksEnabled &&
          !sidebarRendered &&
          !optOutWeeklyGoal &&
          !isMobile && <MobileHeaderRankProgress />}
      </div>
    );
  };

  const RenderSearchPanel = () =>
    !!user && (
      <SearchPanel
        className={{
          container: classNames(
            'left-0 top-0 z-header mx-auto bg-background-default py-3 tablet:left-16 laptop:left-0 laptop:bg-transparent',
            isSearchPage
              ? 'absolute right-0 laptop:relative laptop:top-0'
              : 'hidden laptop:flex',
          ),
          field: 'mx-2 laptop:mx-auto',
        }}
      />
    );

  if (isAuthReady && !isLaptop) {
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
        'sticky top-0 z-header flex h-14 flex-row items-center justify-between gap-3 border-b border-border-subtlest-tertiary px-4 py-3 tablet:px-8 laptop:left-0 laptop:h-16 laptop:w-full laptop:flex-row laptop:px-4',
        hasBanner && 'laptop:top-8',
        isSearchPage && 'mb-16 laptop:mb-0',
        featureTheme && featureTheme.navbar,
        scrollClassName,
      )}
    >
      {sidebarRendered !== undefined && (
        <>
          <Button
            className="block laptop:hidden"
            variant={ButtonVariant.Tertiary}
            onClick={() => onMobileSidebarToggle(true)}
            icon={<HamburgerIcon secondary />}
          />
          <div
            className={classNames(
              'flex flex-1  laptop:flex-none laptop:justify-start',
              isStreakLarge ? 'justify-start' : 'justify-center',
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
