import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { AnalyticsEvent, NotificationTarget } from '../../lib/analytics';
import { webappUrl } from '../../lib/constants';
import { Button, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
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

export interface MainLayoutHeaderProps {
  greeting?: boolean;
  hasBanner?: boolean;
  sidebarRendered?: boolean;
  optOutWeeklyGoal?: boolean;
  additionalButtons?: ReactNode;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  onMobileSidebarToggle: (state: boolean) => unknown;
}

function MainLayoutHeader({
  greeting,
  hasBanner,
  sidebarRendered,
  optOutWeeklyGoal,
  additionalButtons,
  onLogoClick,
  onMobileSidebarToggle,
}: MainLayoutHeaderProps): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const { unreadCount } = useNotificationContext();
  const { user, loadingUser } = useContext(AuthContext);
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
      <>
        <CreatePostButton
          className={classNames(
            'mr-0 laptop:mr-4',
            optOutWeeklyGoal ? 'tablet:mr-0' : 'tablet:mr-4',
          )}
        />
        {!hideButton && user && (
          <>
            {sidebarRendered && <SearchReferralButton className="mr-3" />}
            <LinkWithTooltip
              tooltip={{ placement: 'bottom', content: 'Notifications' }}
              href={`${webappUrl}notifications`}
            >
              <div className="relative mr-4 hidden laptop:flex">
                <Button
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Small}
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
                  <Bubble className="right-0 top-0 -translate-y-1/2 translate-x-1/2 cursor-pointer px-1 shadow-bubble-cabbage">
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
      </>
    );
  };

  return (
    <header
      className={classNames(
        'relative z-header flex h-14 flex-row items-center justify-between border-b border-theme-divider-tertiary bg-theme-bg-primary px-4 py-3 tablet:px-8 laptop:sticky laptop:left-0 laptop:w-full laptop:flex-row laptop:px-4',
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
          <div className="flex flex-1 flex-row justify-center laptop:justify-start">
            <HeaderLogo
              user={user}
              onLogoClick={onLogoClick}
              greeting={greeting}
            />
          </div>
          {isReady ? renderButtons() : null}
        </>
      )}
    </header>
  );
}

export default MainLayoutHeader;
