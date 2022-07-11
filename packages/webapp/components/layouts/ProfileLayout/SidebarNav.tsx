import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import SidebarNavItem from './SidebarNavItem';
import { AccountPage, accountPage } from './common';

interface SidebarNavProps {
  className?: string;
  activePage?: AccountPage;
}

const pageKeys = Object.keys(accountPage) as AccountPage[];

function SidebarNav({
  className,
  activePage = AccountPage.Profile,
}: SidebarNavProps): ReactElement {
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  return (
    <div className={classNames('flex flex-col items-center', className)}>
      {pageKeys.map((key) => (
        <SidebarNavItem
          key={key}
          title={accountPage[key].title}
          href={`/${user.username}${accountPage[key].href}`}
          icon={accountPage[key].getIcon({
            user,
            isActive: key === activePage,
          })}
        />
      ))}
    </div>
  );
}

export default SidebarNav;
