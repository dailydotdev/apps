import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { AnalyticsEvent, NotificationTarget } from '../../lib/analytics';
import { webappUrl } from '../../lib/constants';
import { Button, ButtonVariant } from '../buttons/Button';
import { BellIcon, HamburgerIcon } from '../icons';
import LoginButton from '../LoginButton';
import MobileHeaderRankProgress from '../MobileHeaderRankProgress';
import {
  checkAtNotificationsPage,
  getUnreadText,
} from '../notifications/utils';
import ProfileButton from '../profile/ProfileButton';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { Bubble } from '../tooltips/utils';
import HeaderLogo from './HeaderLogo';
import { CreatePostButton } from '../post/write';
import { useViewSize, ViewSize } from '../../hooks';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { useReadingStreak } from '../../hooks/streaks';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SearchExperiment } from '../../lib/featureValues';

export interface MainLayoutHeaderProps {
  greeting?: boolean;
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
  greeting,
  hasBanner,
  sidebarRendered,
  optOutWeeklyGoal,
  additionalButtons,
  onLogoClick,
  onMobileSidebarToggle,
}: MainLayoutHeaderProps): ReactElement {
  const searchVersion = useFeature(feature.search);
  const isSearchV1 = searchVersion === SearchExperiment.V1;
  const { trackEvent } = useAnalyticsContext();
  const { unreadCount } = useNotificationContext();
  const { user, loadingUser } = useContext(AuthContext);
  const { streak, isEnabled, isLoading } = useReadingStreak();
  const hideButton = loadingUser || (isEnabled && isLoading);
  const isMobile = useViewSize(ViewSize.MobileL);
  const router = useRouter();
  const isSearchPage = !!router.pathname?.startsWith('/search');

  const headerButton = (() => {
    if (hideButton) {
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

  const hasNotification = !!unreadCount;
  const atNotificationsPage = checkAtNotificationsPage();
  const onNavigateNotifications = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotificationIcon,
      target_id: NotificationTarget.Header,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });
  };

  const RenderButtons = () => {
    return (
      <div className="flex gap-3">
        <CreatePostButton />
        {streak && <ReadingStreakButton streak={streak} />}
        {!hideButton && user && (
          <>
            <LinkWithTooltip
              tooltip={{ placement: 'bottom', content: 'Notifications' }}
              href={`${webappUrl}notifications`}
            >
              <div className="relative hidden laptop:flex">
                <Button
                  variant={ButtonVariant.Float}
                  onClick={onNavigateNotifications}
                  icon={
                    <BellIcon
                      className={classNames(
                        'hover:text-theme-label-primary',
                        atNotificationsPage && 'text-theme-label-primary',
                      )}
                      secondary={atNotificationsPage}
                    />
                  }
                />
                {hasNotification && (
                  <Bubble className="-right-1.5 -top-1.5 cursor-pointer px-1">
                    {getUnreadText(unreadCount)}
                  </Bubble>
                )}
              </div>
            </LinkWithTooltip>
          </>
        )}
        {additionalButtons}
        {headerButton}
        {!sidebarRendered && !optOutWeeklyGoal && !isMobile && (
          <MobileHeaderRankProgress />
        )}
      </div>
    );
  };

  return (
    <header
      className={classNames(
        'sticky top-0 z-header flex h-14 flex-row items-center justify-between gap-3 border-b border-theme-divider-tertiary bg-theme-bg-primary px-4 py-3 tablet:px-8 laptop:left-0 laptop:h-16 laptop:w-full laptop:flex-row laptop:px-4',
        hasBanner && 'laptop:top-8',
        isSearchPage && 'mb-16 laptop:mb-0',
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
          <div className="flex flex-1 justify-center laptop:flex-none laptop:justify-start">
            <HeaderLogo
              user={user}
              onLogoClick={onLogoClick}
              // currently isSearchV1 we do not show greeting
              greeting={isSearchV1 ? false : greeting}
            />
          </div>
          {isSearchV1 && !!user && (
            <SearchPanel
              className={{
                container: classNames(
                  'mx-auto bg-theme-bg-primary py-3 laptop:bg-transparent',
                  isSearchPage
                    ? 'absolute left-0 right-0 top-14 laptop:relative laptop:top-0'
                    : 'hidden laptop:flex',
                ),
                field: 'mx-2 laptop:mx-auto',
              }}
            />
          )}
          <RenderButtons />
        </>
      )}
    </header>
  );
}

export default MainLayoutHeader;
