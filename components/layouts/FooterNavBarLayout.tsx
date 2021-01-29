import React, { ReactElement, ReactNode } from 'react';
import HomeIcon from '../../icons/home.svg';
import BookmarkIcon from '../../icons/bookmark.svg';
import FilterIcon from '../../icons/filter.svg';
import styled from '@emotion/styled';
import { size1px, size2, sizeN } from '../../styles/sizes';
import TertiaryButton from '../buttons/TertiaryButton';
import Link from 'next/link';
import { useRouter } from 'next/router';
import onPageLoad from '../../lib/onPageLoad';
import dynamicParent from '../../lib/dynamicParent';
import { FlippedProps, FlipperProps } from 'flip-toolkit/lib/types';
import { ActiveTabIndicator } from '../utilities';
import { css, Global } from '@emotion/react';
import { laptop } from '../../styles/media';

const flipperLoader = () =>
  onPageLoad('complete').then(
    () => import(/* webpackChunkName: "reactFlip" */ 'react-flip-toolkit'),
  );

const Flipper = dynamicParent<FlipperProps>(
  () => flipperLoader().then((mod) => mod.Flipper),
  'div',
);
const Flipped = dynamicParent<FlippedProps>(
  () => flipperLoader().then((mod) => mod.Flipped),
  React.Fragment,
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
  grid-column-gap: ${size2};
  grid-auto-flow: column;
  background: var(--theme-background-primary);
  border-top: ${size1px} solid var(--theme-divider-tertiary);
  z-index: 2;

  > div {
    position: relative;
  }

  ${ActiveTabIndicator} {
    top: 0;
    bottom: unset;
    width: ${sizeN(12)};
  }
`;

const globalStyle = css`
  main {
    margin-bottom: ${navBarHeight};
  }

  ${laptop} {
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

type Tab = { path: string; title: string; icon: ReactNode };
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
  const router = useRouter();
  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);

  return (
    <>
      <Global styles={globalStyle} />
      <NavBar flipKey={selectedTab} spring="veryGentle" element="nav">
        {tabs.map((tab, index) => (
          <div key={tab.path}>
            <Link href={tab.path} prefetch={false} passHref>
              <TertiaryButton
                buttonSize="large"
                as="a"
                icon={tab.icon}
                title={tab.title}
                pressed={index === selectedTab}
              />
            </Link>
            <Flipped flipId="activeTabIndicator">
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
