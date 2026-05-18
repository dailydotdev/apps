import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import type { MainLayoutProps } from './MainLayout';
import { FeedbackWidget } from './feedback';

const SidebarDesktopV2 = dynamic(() =>
  import(
    /* webpackChunkName: "sidebarDesktopV2" */ './sidebar/SidebarDesktopV2'
  ).then((mod) => mod.SidebarDesktopV2),
);

// The v2 rail occupies 16rem (icon column + contextual panel) on laptop+.
const SIDEBAR_PADDING_CLASS = 'laptop:pl-[19rem]';

export const MainLayoutV2 = ({
  children,
  className,
  activePage,
  isNavItemsButton,
  onNavTabClick,
  showSidebar = true,
  hideFeedbackWidget = false,
}: MainLayoutProps): ReactElement => {
  const router = useRouter();
  const { isAuthReady } = useAuthContext();
  const resolvedActivePage = activePage ?? router?.asPath ?? router?.pathname;

  return (
    <>
      <main
        data-testid="main-layout-v2"
        className={classNames(
          'relative flex min-h-screen flex-col bg-surface-secondary',
          showSidebar && SIDEBAR_PADDING_CLASS,
          className,
        )}
      >
        {isAuthReady && showSidebar && (
          <SidebarDesktopV2
            activePage={resolvedActivePage}
            isNavButtons={isNavItemsButton}
            onNavTabClick={onNavTabClick}
          />
        )}
        <div
          className={classNames(
            'flex flex-1 flex-col',
            'laptop:m-4 laptop:rounded-24 laptop:border laptop:border-border-subtlest-quaternary laptop:bg-background-default laptop:shadow-2',
          )}
        >
          {children}
        </div>
      </main>
      {!hideFeedbackWidget && <FeedbackWidget />}
    </>
  );
};
