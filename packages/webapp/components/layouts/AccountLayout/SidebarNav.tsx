import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { disabledRefetch } from '@dailydotdev/shared/src/lib/func';
import { useRouter } from 'next/router';
import { isTouchDevice } from '@dailydotdev/shared/src/lib/tooltip';
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
  const router = useRouter();
  const client = useQueryClient();
  const closeSideNav = useCallback(
    () => client.setQueryData(['account_nav_open'], false),
    [client],
  );
  const { data: isOpen } = useQuery({
    queryKey: ['account_nav_open'],
    queryFn: () => false,
    ...disabledRefetch,
  });
  const { user } = useAuthContext();

  useEffect(() => {
    if (!isTouchDevice()) {
      return;
    }

    router.events.on('routeChangeStart', closeSideNav);

    // eslint-disable-next-line consistent-return
    return () => {
      router.events.off('routeChangeStart', closeSideNav);
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex flex-col transition-transform ease-in-out tablet:translate-x-[unset] tablet:items-center tablet:px-6 tablet:pt-6',
        isOpen ? 'translate-x-0' : ' -translate-x-full',
        className,
      )}
    >
      <span className="mb-6 flex w-full flex-row items-center justify-between border-b border-border-subtlest-tertiary p-2 tablet:hidden">
        <span className="ml-4 font-bold typo-title3">Account Settings</span>
        <CloseButton onClick={closeSideNav} />
      </span>
      <div className="px-6 tablet:px-0">
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
    </div>
  );
}

export default SidebarNav;
