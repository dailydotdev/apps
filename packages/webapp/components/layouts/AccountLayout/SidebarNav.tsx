import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useFeatureTheme } from '@dailydotdev/shared/src/hooks/utils/useFeatureTheme';
import SidebarNavItem from './SidebarNavItem';
import type { AccountPage } from './common';
import { accountPage } from './common';

const pageKeys = Object.keys(accountPage) as AccountPage[];

function SidebarNav(): ReactElement {
  const { user } = useAuthContext();
  const featureTheme = useFeatureTheme();

  if (!user) {
    return null;
  }

  return (
    <div
      className={classNames(
        'absolute z-3 ml-auto flex min-h-full w-full flex-col border-l border-border-subtlest-tertiary bg-background-default transition-transform ease-in-out tablet:relative tablet:w-[unset] tablet:translate-x-[unset] tablet:items-center tablet:px-6 tablet:pt-6',
        featureTheme ? 'bg-transparent' : 'bg-background-default',
      )}
    >
      {pageKeys.map((key) => {
        const href = `/account${accountPage[key].href}`;
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
