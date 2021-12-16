import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit';
import HomeIcon from '@dailydotdev/shared/icons/home.svg';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import SearchIcon from '@dailydotdev/shared/icons/magnifying.svg';
import FilterIcon from '@dailydotdev/shared/icons/outline/filter.svg';
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
import styles from './FooterNavBar.module.css';

type Tab = {
  path: string;
  title: string;
  icon: ReactNode;
  requiresLogin?: boolean;
};

export const tabs: Tab[] = [
  {
    path: '/',
    title: 'Home',
    icon: <HomeIcon />,
  },
  {
    path: '/bookmarks',
    title: 'Bookmarks',
    icon: <BookmarkIcon />,
    requiresLogin: true,
  },
  {
    path: '/search',
    title: 'Search',
    icon: <SearchIcon />,
  },
  {
    path: '/settings',
    title: 'Settings',
    icon: <FilterIcon />,
  },
];

export default function FooterNavBar(): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
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
                icon={tab.icon}
                pressed={index === selectedTab}
              />
            </LinkWithTooltip>
          ) : (
            <SimpleTooltip content={tab.title}>
              <Button
                {...buttonProps}
                icon={tab.icon}
                onClick={() => showLogin('bookmark')}
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
