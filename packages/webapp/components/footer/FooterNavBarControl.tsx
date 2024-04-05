import React, { ReactElement } from 'react';
import {
  Button,
  ButtonIconPosition,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import {
  BellIcon,
  BookmarkIcon,
  FilterIcon,
  HomeIcon,
  SearchIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  AnalyticsEvent,
  NotificationTarget,
} from '@dailydotdev/shared/src/lib/analytics';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import Link from 'next/link';
import { FooterNavBarContainerProps, FooterTab, getNavPath } from './common';
import { FooterNavBarItem, FooterNavBarItemProps } from './FooterNavBarItem';

const notificationsPath = '/notifications';

export const tabs: FooterTab[] = [
  {
    path: '/',
    title: 'Home',
    icon: (active: boolean) => (
      <HomeIcon secondary={active} size={IconSize.Medium} />
    ),
  },
  {
    path: '/bookmarks',
    title: 'Bookmarks',
    icon: (active: boolean) => (
      <BookmarkIcon secondary={active} size={IconSize.Medium} />
    ),
    shouldShowLogin: true,
  },
  {
    path: '/search',
    title: 'Search',
    icon: (active: boolean) => (
      <SearchIcon secondary={active} size={IconSize.Medium} />
    ),
  },
  {
    requiresLogin: true,
    shouldShowLogin: true,
    path: notificationsPath,
    title: 'Notifications',
    icon: (active: boolean, unreadCount) => (
      <span className="relative">
        {unreadCount > 0 ? (
          <Bubble className="right-0 top-0 translate-x-1/2 px-1">
            {getUnreadText(unreadCount)}
          </Bubble>
        ) : null}
        <BellIcon secondary={active} size={IconSize.Medium} />
      </span>
    ),
  },
  {
    path: '/filters',
    title: 'Filters',
    icon: (active: boolean) => (
      <FilterIcon secondary={active} size={IconSize.Medium} />
    ),
  },
];

interface TabProps extends Pick<FooterNavBarItemProps, 'isActive'> {
  tab: FooterTab;
  count?: number;
  onClick?: () => void;
}

const Tab = ({ tab, count, isActive, onClick }: TabProps) => {
  const { user, showLogin } = useAuthContext();

  if (tab.requiresLogin && !user) {
    return null;
  }

  const buttonProps: ButtonProps<'a' | 'button'> = {
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Large,
    className: 'w-full',
  };

  return (
    <FooterNavBarItem key={tab.title} isActive={isActive}>
      {!tab.shouldShowLogin || user ? (
        <Link href={getNavPath(tab.path, user)} passHref>
          <Button
            {...buttonProps}
            tag="a"
            icon={tab.icon(isActive, count)}
            className="px-4 font-normal typo-footnote"
            iconPosition={ButtonIconPosition.Top}
            pressed={isActive}
            onClick={onClick}
          >
            {tab.title}
          </Button>
        </Link>
      ) : (
        <Button
          {...buttonProps}
          icon={tab.icon(isActive, count)}
          iconPosition={ButtonIconPosition.Top}
          className="font-normal typo-footnote"
          onClick={() => showLogin({ trigger: AuthTriggers.Bookmark })}
        >
          {tab.title}
        </Button>
      )}
    </FooterNavBarItem>
  );
};

export function FooterNavBarControl({
  activeTab,
}: FooterNavBarContainerProps): ReactElement {
  const { user } = useAuthContext();
  const { trackEvent } = useAnalyticsContext();
  const { unreadCount } = useNotificationContext();

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
    <>
      {tabs.map((tab) => (
        <Tab
          tab={tab}
          key={tab.title}
          count={unreadCount}
          isActive={activeTab === tab.title}
          onClick={onItemClick[getNavPath(tab.path, user)]}
        />
      ))}
    </>
  );
}
