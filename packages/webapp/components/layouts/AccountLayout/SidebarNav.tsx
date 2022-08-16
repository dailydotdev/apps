import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import Link from 'next/link';
import SidebarNavItem from './SidebarNavItem';
import {
  AccountPage,
  accountPage,
  accountSidebarPages,
  AccountSidebarPagesSection,
} from './common';

interface SidebarNavProps {
  className?: string;
  activePage?: AccountPage;
  basePath?: string;
}

const pageKeys = Object.keys(accountPage) as AccountPage[];

function SidebarNav({
  className,
  basePath = '',
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
          href={`/${basePath}${accountPage[key].href}`}
          icon={accountPage[key].getIcon({
            user,
            isActive: key === activePage,
          })}
        />
      ))}
      <AccountSidebarPagesSection>
        {accountSidebarPages.map((accountSidebarPage) => (
          <Link
            href={accountSidebarPage.href}
            passHref
            key={accountSidebarPage.title}
          >
            <a
              className="my-3 w-full typo-callout text-theme-label-tertiary"
              target={accountSidebarPage.target}
            >
              {accountSidebarPage.title}
            </a>
          </Link>
        ))}
      </AccountSidebarPagesSection>
    </div>
  );
}

export default SidebarNav;
