import React, { ReactElement, ReactNode, useContext } from 'react';
import HomeIcon from '../../icons/home.svg';
import BookmarkIcon from '../../icons/bookmark.svg';
import FilterIcon from '../../icons/filter.svg';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';
import TertiaryButton from '../buttons/TertiaryButton';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamicParent from '../../lib/dynamicParent';
import { FlippedProps, FlipperProps } from 'flip-toolkit/lib/types';
import { ActiveTabIndicator } from '../utilities';
import { css, Global } from '@emotion/react';
import { laptop } from '../../styles/media';
import AuthContext from '../AuthContext';
import useMedia from '../../lib/useMedia';
import dynamic from 'next/dynamic';
import LoadingContext from '../LoadingContext';

export const footerNavBarBreakpoint = laptop;

const flipperLoader = () =>
  import(/* webpackChunkName: "reactFlip" */ 'react-flip-toolkit');

const Flipper = dynamicParent<FlipperProps>(
  () => flipperLoader().then((mod) => mod.Flipper),
  'div',
);
const Flipped = dynamicParent<FlippedProps>(
  () => flipperLoader().then((mod) => mod.Flipped),
  React.Fragment,
);

const Sidebar = dynamic(
  () => import(/* webpackChunkName: "Sidebar" */ '../Sidebar'),
);

type FooterNavBarLayoutProps = { children?: ReactNode };

const navBarHeight = '3.063rem';

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

const globalStyle = css`
  main {
    margin-bottom: ${navBarHeight};
  }

  ${footerNavBarBreakpoint} {
    ${NavBar} {
      && {
        display: none;
      }
    }

    main {
      margin-bottom: 0;
    }
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

export default function FooterNavBarLayout({
  children,
}: FooterNavBarLayoutProps): ReactElement {
  const { windowLoaded } = useContext(LoadingContext);
  const { user, showLogin } = useContext(AuthContext);
  const router = useRouter();
  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);
  const showSidebar = useMedia(
    [footerNavBarBreakpoint.replace('@media ', '')],
    [true],
    false,
  );

  return (
    <>
      <Global styles={globalStyle} />
      {showSidebar && windowLoaded && <Sidebar />}
      <NavBar
        flipKey={selectedTab}
        spring="veryGentle"
        element="nav"
        shouldLoad={windowLoaded}
      >
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
            <Flipped flipId="activeTabIndicator" shouldLoad={windowLoaded}>
              {selectedTab === index && <ActiveTabIndicator />}
            </Flipped>
          </div>
        ))}
      </NavBar>
      {children}
    </>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <FooterNavBarLayout>{page}</FooterNavBarLayout>
);
