import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import dynamic from 'next/dynamic';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { AnalyticsEvent, NotificationTarget } from '../../lib/analytics';
import { webappUrl } from '../../lib/constants';
import { Button, ButtonVariant } from '../buttons/ButtonV2';
import BellIcon from '../icons/Bell';
import HamburgerIcon from '../icons/Hamburger';
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
import {
  ReferralCampaignKey,
  useReferralCampaign,
  useViewSize,
  ViewSize,
} from '../../hooks';
import { SearchReferralButton } from '../referral/SearchReferralButton';
import { useStreakExperiment } from '../../hooks/streaks';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
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
  const { trackEvent } = useAnalyticsContext();
  const { unreadCount } = useNotificationContext();
  const { user, loadingUser } = useContext(AuthContext);
  const { shouldShowStreak } = useStreakExperiment();
  const hideButton = loadingUser;
  const isMobile = useViewSize(ViewSize.MobileL);

  const headerButton = (() => {
    if (hideButton) {
      return null;
    }

    if (user && user?.infoConfirmed) {
      return <ProfileButton className="hidden laptop:flex" />;
    }

    return <LoginButton className="hidden laptop:block" />;
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
  const { isReady } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Search,
  });

  const renderButtons = () => {
    return (
      <div className="flex gap-3">
        <CreatePostButton />
        {user && shouldShowStreak && <ReadingStreakButton />}
        {!hideButton && user && (
          <>
            {sidebarRendered && <SearchReferralButton />}
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
        'relative z-header flex h-16 flex-row items-center justify-between gap-3 border-b border-theme-divider-tertiary bg-theme-bg-primary px-4 py-3 tablet:px-8 laptop:sticky laptop:left-0 laptop:w-full laptop:flex-row laptop:px-4',
        hasBanner ? 'laptop:top-8' : 'laptop:top-0',
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
          <div className="flex flex-row justify-center laptop:justify-start">
            <HeaderLogo
              user={user}
              onLogoClick={onLogoClick}
              greeting={greeting}
            />
          </div>
          {searchVersion === SearchExperiment.V1 && <SearchPanel />}
          {isReady ? renderButtons() : null}
        </>
      )}
    </header>
  );
}

export default MainLayoutHeader;
