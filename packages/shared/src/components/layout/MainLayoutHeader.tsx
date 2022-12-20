import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { webappUrl } from '../../lib/constants';
import { Button } from '../buttons/Button';
import BellIcon from '../icons/Bell';
import HamburgerIcon from '../icons/Hamburger';
import LoginButton from '../LoginButton';
import MobileHeaderRankProgress from '../MobileHeaderRankProgress';
import ProfileButton from '../profile/ProfileButton';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { Bubble } from '../tooltips/utils';
import HeaderLogo from './HeaderLogo';

interface ShouldShowLogoProps {
  mobileTitle?: string;
  sidebarRendered?: boolean;
}

export interface MainLayoutHeaderProps extends ShouldShowLogoProps {
  greeting?: boolean;
  hasBanner?: boolean;
  showOnlyLogo?: boolean;
  optOutWeeklyGoal?: boolean;
  additionalButtons?: ReactNode;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  onMobileSidebarToggle: (state: boolean) => unknown;
}

const shouldShowLogo = ({
  mobileTitle,
  sidebarRendered,
}: ShouldShowLogoProps) => {
  return !mobileTitle ? true : mobileTitle && sidebarRendered;
};

const notificationsUrl = `${webappUrl}/notifications`;

const checkAtNotificationsPage = () =>
  notificationsUrl === globalThis.window?.location.href;

function MainLayoutHeader({
  greeting,
  hasBanner,
  mobileTitle,
  showOnlyLogo,
  sidebarRendered,
  optOutWeeklyGoal,
  additionalButtons,
  onLogoClick,
  onMobileSidebarToggle,
}: MainLayoutHeaderProps): ReactElement {
  const { unreadCount } = useNotificationContext();
  const { user, loadingUser } = useContext(AuthContext);
  const hideButton = showOnlyLogo || loadingUser;

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

  return (
    <header
      className={classNames(
        'flex relative laptop:fixed laptop:left-0 z-3 flex-row laptop:flex-row justify-between items-center py-3 px-4 tablet:px-8 laptop:px-4 laptop:w-full h-14 border-b bg-theme-bg-primary border-theme-divider-tertiary',
        hasBanner ? 'laptop:top-8' : 'laptop:top-0',
      )}
    >
      {sidebarRendered !== undefined && (
        <>
          <Button
            className="block laptop:hidden btn-tertiary"
            iconOnly
            onClick={() => onMobileSidebarToggle(true)}
            icon={<HamburgerIcon secondary />}
          />
          <div className="flex flex-row flex-1 justify-center laptop:justify-start">
            {mobileTitle && (
              <h3 className="block laptop:hidden typo-callout">
                {mobileTitle}
              </h3>
            )}
            {shouldShowLogo({ mobileTitle, sidebarRendered }) && (
              <HeaderLogo
                user={user}
                onLogoClick={onLogoClick}
                greeting={greeting}
              />
            )}
          </div>
          {!hideButton && user && (
            <LinkWithTooltip
              tooltip={{ placement: 'left', content: 'Notifications' }}
              href={`${webappUrl}/notifications`}
            >
              <Button
                className="mr-4 btn-tertiary"
                buttonSize="small"
                iconOnly
                icon={
                  <BellIcon
                    className={
                      atNotificationsPage && 'text-theme-label-primary'
                    }
                    secondary={hasNotification}
                  />
                }
              >
                {hasNotification && (
                  <Bubble className="-top-2 -right-3">{unreadCount}</Bubble>
                )}
              </Button>
            </LinkWithTooltip>
          )}
          {additionalButtons}
          {headerButton}
          {!sidebarRendered && !optOutWeeklyGoal && (
            <MobileHeaderRankProgress />
          )}
        </>
      )}
    </header>
  );
}

export default MainLayoutHeader;
