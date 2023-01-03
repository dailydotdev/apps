import React, { HTMLAttributes, ReactElement, useContext } from 'react';
import { Flipped, Flipper } from 'react-flip-toolkit';
import HomeIcon from '@dailydotdev/shared/src/components/icons/Home';
import BookmarkIcon from '@dailydotdev/shared/src/components/icons/Bookmark';
import SearchIcon from '@dailydotdev/shared/src/components/icons/Search';
import FilterIcon from '@dailydotdev/shared/src/components/icons/Filter';
import BellIcon from '@dailydotdev/shared/src/components/icons/Bell';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { LinkWithTooltip } from '@dailydotdev/shared/src/components/tooltips/LinkWithTooltip';
import { ActiveTabIndicator } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import classNames from 'classnames';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import {
  AnalyticsEvent,
  NotificationTarget,
} from '@dailydotdev/shared/src/lib/analytics';
import styles from './FooterNavBar.module.css';

type Tab = {
  path: string;
  title: string;
  icon: (active: boolean, unread?: number) => ReactElement;
  requiresLogin?: boolean;
  shouldShowLogin?: boolean;
  onClick?: () => void;
};

const notificationsPath = '/notifications';
export const tabs: Tab[] = [
  {
    path: '/',
    title: 'Home',
    icon: (active: boolean) => <HomeIcon secondary={active} size="xxlarge" />,
  },
  {
    path: '/bookmarks',
    title: 'Bookmarks',
    icon: (active: boolean) => (
      <BookmarkIcon secondary={active} size="xxlarge" />
    ),
    shouldShowLogin: true,
  },
  {
    path: '/search',
    title: 'Search',
    icon: (active: boolean) => <SearchIcon secondary={active} size="xxlarge" />,
  },
  {
    requiresLogin: true,
    shouldShowLogin: true,
    path: notificationsPath,
    title: 'Notifications',
    icon: (active: boolean, unreadCount) => (
      <span className="relative">
        {unreadCount > 0 ? (
          <Bubble className="top-0 right-0 px-1 translate-x-1/2">
            {getUnreadText(unreadCount)}
          </Bubble>
        ) : null}
        <BellIcon secondary={active} size="xxlarge" />
      </span>
    ),
  },
  {
    path: '/filters',
    title: 'Filters',
    icon: (active: boolean) => <FilterIcon secondary={active} size="xxlarge" />,
  },
];

export default function FooterNavBar(): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const { unreadCount } = useNotificationContext();
  const { trackEvent } = useAnalyticsContext();
  const router = useRouter();
  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);

  const buttonProps: HTMLAttributes<HTMLButtonElement> & {
    buttonSize: ButtonSize;
  } = {
    className: 'btn-tertiary',
    style: { width: '100%' },
    buttonSize: 'large',
  };

  const onNavigateNotifications = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotificationIcon,
      target_id: NotificationTarget.Footer,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });
  };

  const onItemClick = {
    [notificationsPath]: onNavigateNotifications,
  };

  return (
    <Flipper
      flipKey={selectedTab}
      spring="veryGentle"
      element="nav"
      className={classNames(
        'fixed grid left-0 bottom-0 w-full grid-flow-col items-center bg-theme-bg-primary border-t border-theme-divider-tertiary z-2',
        styles.footerNavBar,
      )}
    >
      {tabs.map((tab, index) =>
        tab.requiresLogin && !user ? null : (
          <div key={tab.path} className="relative">
            {!tab.shouldShowLogin || user ? (
              <LinkWithTooltip
                href={tab.path}
                prefetch={false}
                passHref
                tooltip={{ content: tab.title }}
              >
                <Button
                  {...buttonProps}
                  tag="a"
                  icon={tab.icon(index === selectedTab, unreadCount)}
                  pressed={index === selectedTab}
                  onClick={onItemClick[tab.path]}
                />
              </LinkWithTooltip>
            ) : (
              <SimpleTooltip content={tab.title}>
                <Button
                  {...buttonProps}
                  icon={tab.icon(index === selectedTab, unreadCount)}
                  onClick={() => showLogin(AuthTriggers.Bookmark)}
                />
              </SimpleTooltip>
            )}
            <Flipped flipId="activeTabIndicator">
              {selectedTab === index && (
                <ActiveTabIndicator
                  className="w-12"
                  style={{ top: '-0.125rem' }}
                />
              )}
            </Flipped>
          </div>
        ),
      )}
    </Flipper>
  );
}
