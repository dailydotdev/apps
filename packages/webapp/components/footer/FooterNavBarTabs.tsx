import React, { isValidElement, ReactElement, ReactNode, useMemo } from 'react';
import {
  AiIcon,
  BellIcon,
  HomeIcon,
  SourceIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from 'next/link';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import classNames from 'classnames';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { FooterNavBarContainerProps, FooterTab, getNavPath } from './common';
import { FooterPlusButton } from './FooterPlusButton';
import { FooterNavBarItem, FooterNavBarItemProps } from './FooterNavBarItem';

export const mobileUxTabs: (FooterTab | ReactNode)[] = [
  {
    requiresLogin: true,
    path: '/',
    title: 'Home',
    icon: (active: boolean) => (
      <HomeIcon secondary={active} size={IconSize.Medium} />
    ),
  },
  {
    requiresLogin: true,
    path: '/search',
    title: 'Search',
    icon: (active: boolean) => (
      <AiIcon secondary={active} size={IconSize.Medium} />
    ),
  },
  <FooterPlusButton key="write-action" />,
  {
    path: '/squads',
    title: 'Squads',
    icon: (active: boolean) => (
      <SourceIcon secondary={active} size={IconSize.Medium} />
    ),
  },
  {
    requiresLogin: true,
    path: (user) => user?.permalink,
    title: 'Profile',
    icon: (active: boolean) => (
      <UserIcon secondary={active} size={IconSize.Medium} />
    ),
  },
];

interface TabProps extends Pick<FooterNavBarItemProps, 'isActive'> {
  tab: FooterTab;
}

const Tab = ({ tab, isActive }: TabProps) => {
  const { user } = useAuthContext();

  return (
    <FooterNavBarItem
      isActive={isActive}
      className="flex h-full flex-col items-center justify-center py-2"
    >
      <Link
        href={
          !user && tab.requiresLogin
            ? '/onboarding'
            : getNavPath(tab.path, user)
        }
        passHref
      >
        <a
          className={classNames(
            'flex flex-col items-center justify-center',
            !isActive && 'text-text-tertiary',
          )}
        >
          {tab.icon(isActive)}
          <span className="typo-caption2">{tab.title}</span>
        </a>
      </Link>
    </FooterNavBarItem>
  );
};

const Notifications = ({ active }: { active: boolean }): JSX.Element => {
  const { unreadCount } = useNotificationContext();

  return (
    <div className="relative">
      <BellIcon secondary={active} size={IconSize.Medium} />
      {!!unreadCount && (
        <Bubble
          className={classNames('-right-1.5 -top-1.5 cursor-pointer px-1')}
        >
          {getUnreadText(unreadCount)}
        </Bubble>
      )}
    </div>
  );
};

export function FooterNavBarTabs({
  activeTab,
}: FooterNavBarContainerProps): ReactElement {
  const notificationsNavBar = useFeature(feature.notificationsNavBar);

  const tabs = useMemo(() => {
    if (notificationsNavBar) {
      mobileUxTabs.pop();
      mobileUxTabs.splice(-1, 0, {
        requiresLogin: true,
        path: '/notifications',
        title: 'Notifications',
        icon: (active: boolean) => <Notifications active={active} />,
      });
    }

    return mobileUxTabs;
  }, [notificationsNavBar]);

  return (
    <>
      {tabs.map((tab) => {
        if (isValidElement(tab)) {
          return tab;
        }

        const current = tab as FooterTab;

        return (
          <Tab
            key={current.title}
            tab={current}
            isActive={current.title === activeTab}
          />
        );
      })}
    </>
  );
}
