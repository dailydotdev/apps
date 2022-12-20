import React, { HTMLAttributes, ReactElement, useContext } from 'react';
import { Flipped, Flipper } from 'react-flip-toolkit';
import HomeIcon from '@dailydotdev/shared/src/components/icons/Home';
import BookmarkIcon from '@dailydotdev/shared/src/components/icons/Bookmark';
import SearchIcon from '@dailydotdev/shared/src/components/icons/Search';
import FilterIcon from '@dailydotdev/shared/src/components/icons/Filter';
import BellIcon from '@dailydotdev/shared/src/components/icons/Bell';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { LinkWithTooltip } from '@dailydotdev/shared/src/components/tooltips/LinkWithTooltip';
import { ActiveTabIndicator } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import classNames from 'classnames';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import styles from './FooterNavBar.module.css';

type Tab = {
  path: string;
  title: string;
  icon: (active: boolean, unread?: number) => ReactElement;
  requiresLogin?: boolean;
};

export const tabs: Tab[] = [
  {
    path: '/',
    title: 'Home',
    icon: (active: boolean) => <HomeIcon secondary={active} size="xxlarge" />,
  },
  {
    path: '/bookmarks',
    title: 'Bookmarks',
    icon: (active: boolean) => (
      <BookmarkIcon secondary={active} size="xxlarge" />
    ),
    requiresLogin: true,
  },
  {
    path: '/search',
    title: 'Search',
    icon: (active: boolean) => <SearchIcon secondary={active} size="xxlarge" />,
  },
  {
    path: '/notifications',
    title: 'Notifications',
    icon: (active: boolean, unreadCount) => (
      <span className="relative">
        <Bubble className="top-0 px-1 left-[calc(100%-0.75rem)]">
          {unreadCount}
        </Bubble>
        <BellIcon secondary={active} size="xxlarge" />
      </span>
    ),
  },
  {
    path: '/filters',
    title: 'Filters',
    icon: (active: boolean) => <FilterIcon secondary={active} size="xxlarge" />,
  },
];

export default function FooterNavBar(): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const { unreadCount } = useNotificationContext();
  const router = useRouter();
  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);

  const buttonProps: HTMLAttributes<HTMLButtonElement> & {
    buttonSize: ButtonSize;
  } = {
    className: 'btn-tertiary',
    style: { width: '100%' },
    buttonSize: 'large',
  };

  return (
    <Flipper
      flipKey={selectedTab}
      spring="veryGentle"
      element="nav"
      className={classNames(
        'fixed grid left-0 bottom-0 w-full grid-flow-col items-center bg-theme-bg-primary border-t border-theme-divider-tertiary z-2',
        styles.footerNavBar,
      )}
    >
      {tabs.map((tab, index) => (
        <div key={tab.path} className="relative">
          {!tab.requiresLogin || user ? (
            <LinkWithTooltip
              href={tab.path}
              prefetch={false}
              passHref
              tooltip={{ content: tab.title }}
            >
              <Button
                {...buttonProps}
                tag="a"
                icon={tab.icon(index === selectedTab, unreadCount)}
                pressed={index === selectedTab}
              />
            </LinkWithTooltip>
          ) : (
            <SimpleTooltip content={tab.title}>
              <Button
                {...buttonProps}
                icon={tab.icon(index === selectedTab, unreadCount)}
                onClick={() => showLogin(AuthTriggers.Bookmark)}
              />
            </SimpleTooltip>
          )}
          <Flipped flipId="activeTabIndicator">
            {selectedTab === index && (
              <ActiveTabIndicator
                className="w-12"
                style={{ top: '-0.125rem' }}
              />
            )}
          </Flipped>
        </div>
      ))}
    </Flipper>
  );
}
