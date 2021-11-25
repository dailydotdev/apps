import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import Link from 'next/link';
import { Flipper, Flipped } from 'react-flip-toolkit';
import HomeIcon from '@dailydotdev/shared/icons/home.svg';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import LayoutIcon from '@dailydotdev/shared/icons/layout.svg';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { ActiveTabIndicator } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import classNames from 'classnames';
import FilterRedDot from '@dailydotdev/shared/src/components/filters/FilterRedDot';
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
    path: '/filters',
    title: 'Filters',
    icon: <FilterRedDot />,
  },
  {
    path: '/settings',
    title: 'Settings',
    icon: <LayoutIcon />,
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
            <Link href={tab.path} prefetch={false} passHref>
              <SimpleTooltip content={tab.title}>
                <Button
                  {...buttonProps}
                  tag="a"
                  icon={tab.icon}
                  pressed={index === selectedTab}
                />
              </SimpleTooltip>
            </Link>
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
