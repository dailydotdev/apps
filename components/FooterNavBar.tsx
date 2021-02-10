import React, { ReactElement, ReactNode, useContext } from 'react';
import Link from 'next/link';
import TertiaryButton from './buttons/TertiaryButton';
import { ActiveTabIndicator } from './utilities';
import styled from '@emotion/styled';
import { Flipper, Flipped } from 'react-flip-toolkit';
import sizeN from '../macros/sizeN.macro';
import rem from '../macros/rem.macro';
import HomeIcon from '../icons/home.svg';
import BookmarkIcon from '../icons/bookmark.svg';
import FilterIcon from '../icons/filter.svg';
import AuthContext from './AuthContext';
import { useRouter } from 'next/router';

export const navBarHeight = '3.063rem';

const NavBar = styled(Flipper)`
  position: fixed;
  display: grid;
  left: 0;
  bottom: 0;
  width: 100%;
  height: ${navBarHeight};
  grid-column-gap: ${sizeN(2)};
  grid-auto-flow: column;
  background: var(--theme-background-primary);
  border-top: ${rem(1)} solid var(--theme-divider-tertiary);
  z-index: 2;

  > div {
    position: relative;
  }

  ${ActiveTabIndicator} {
    top: -${rem(1)};
    bottom: unset;
    width: ${sizeN(12)};
  }

  button,
  a {
    width: 100%;
  }
`;

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
    icon: <FilterIcon />,
  },
];

export default function FooterNavBar(): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const router = useRouter();
  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);

  return (
    <NavBar flipKey={selectedTab} spring="veryGentle" element="nav">
      {tabs.map((tab, index) => (
        <div key={tab.path}>
          {!tab.requiresLogin || user ? (
            <Link href={tab.path} prefetch={false} passHref>
              <TertiaryButton
                buttonSize="large"
                tag="a"
                icon={tab.icon}
                title={tab.title}
                pressed={index === selectedTab}
              />
            </Link>
          ) : (
            <TertiaryButton
              buttonSize="large"
              icon={tab.icon}
              title={tab.title}
              onClick={() => showLogin()}
            />
          )}
          <Flipped flipId="activeTabIndicator">
            {selectedTab === index && <ActiveTabIndicator />}
          </Flipped>
        </div>
      ))}
    </NavBar>
  );
}
