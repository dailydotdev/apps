import type { ReactElement } from 'react';
import React, { isValidElement } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import classNames from 'classnames';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { FooterNavBarContainerProps, FooterTab } from './common';
import { getNavPath } from './common';
import type { FooterNavBarItemProps } from './FooterNavBarItem';
import { FooterNavBarItem } from './FooterNavBarItem';

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
  tabs,
}: FooterNavBarContainerProps): ReactElement {
  return (
    <>
      {tabs.map((tab) => {
        if (isValidElement(tab)) {
          return tab;
        }

        const current = tab as FooterTab;
        const isActive = current.title === activeTab;
        return <Tab key={current.title} tab={current} isActive={isActive} />;
      })}
    </>
  );
}
