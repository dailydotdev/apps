import React, { isValidElement, ReactElement, ReactNode } from 'react';
import {
  AiIcon,
  BellIcon,
  HomeIcon,
  SourceIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from 'next/link';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import classNames from 'classnames';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { FooterNavBarContainerProps, FooterTab, getNavPath } from './common';
import { FooterPlusButton } from './FooterPlusButton';
import { FooterNavBarItem, FooterNavBarItemProps } from './FooterNavBarItem';

const Notifications = ({ active }: { active: boolean }): JSX.Element => {
  const { unreadCount } = useNotificationContext();

  return (
    <div className="relative">
      <BellIcon secondary={active} size={IconSize.Medium} />
      {!!unreadCount && (
        <Bubble className="-right-1.5 -top-1.5 cursor-pointer px-1">
          {getUnreadText(unreadCount)}
        </Bubble>
      )}
    </div>
  );
};

export const tabs: (FooterTab | ReactNode)[] = [
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
    requiresLogin: true,
    path: '/notifications',
    title: 'Activity',
    icon: (active: boolean) => <Notifications active={active} />,
  },
  {
    path: '/squads',
    title: 'Squads',
    icon: (active: boolean) => (
      <SourceIcon secondary={active} size={IconSize.Medium} />
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

export function FooterNavBarTabs({
  activeTab,
}: FooterNavBarContainerProps): ReactElement {
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
