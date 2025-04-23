import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import SidebarNavItem from './SidebarNavItem';
import type { AccountPage } from './common';
import { accountPage } from './common';

interface SidebarNavProps {
  className?: string;
  basePath?: string;
}

const pageKeys = Object.keys(accountPage) as AccountPage[];

function SidebarNav({
  className,
  basePath = '',
}: SidebarNavProps): ReactElement {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex flex-col transition-transform ease-in-out tablet:translate-x-[unset] tablet:items-center tablet:px-6 tablet:pt-6',
        className,
      )}
    >
      {pageKeys.map((key) => {
        const href = `/${basePath}${accountPage[key].href}`;
        const isActive = globalThis?.window?.location.pathname === href;

        return (
          <SidebarNavItem
            key={key}
            title={accountPage[key].title}
            href={href}
            isActive={isActive}
            icon={accountPage[key].getIcon({ user, isActive })}
          />
        );
      })}
    </div>
  );
}

export default SidebarNav;
