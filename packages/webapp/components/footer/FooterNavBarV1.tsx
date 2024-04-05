import React, { isValidElement, ReactElement, ReactNode } from 'react';
import {
  AiIcon,
  HomeIcon,
  SourceIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from 'next/link';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import classNames from 'classnames';
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

export function FooterNavBarV1({
  activeTab,
}: FooterNavBarContainerProps): ReactElement {
  return (
    <>
      {mobileUxTabs.map((tab) => {
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
