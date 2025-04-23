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
        'ml-auto min-h-full border-l border-border-subtlest-tertiary px-6 pt-6',
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
