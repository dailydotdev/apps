import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useFeatureTheme } from '@dailydotdev/shared/src/hooks/utils/useFeatureTheme';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities';
import { ProfileMenuHeader } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenuHeader';
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
        'ml-auto flex min-h-full flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-2 tablet:w-64',
        featureTheme ? 'bg-transparent' : undefined,
      )}
    >
      <ProfileMenuHeader className="px-1" shouldOpenProfile />

      <HorizontalSeparator />

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
