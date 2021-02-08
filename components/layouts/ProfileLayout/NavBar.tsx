import React, { ReactElement, useContext } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import sizeN from '../../../macros/sizeN.macro';
import { laptop } from '../../../styles/media';
import { pageMaxWidth } from '../../../styles/helpers';
import { PublicProfile } from '../../../lib/user';
import { FlippedProps, FlipperProps } from 'flip-toolkit/lib/types';
import dynamicParent from '../../../lib/dynamicParent';
import TertiaryButton from '../../buttons/TertiaryButton';
import { ActiveTabIndicator } from '../../utilities';
import LoadingContext from '../../LoadingContext';

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

export type Tab = { path: string; title: string };

const Nav = styled(Flipper)`
  position: relative;
  display: flex;
  margin: ${sizeN(6)} -${sizeN(6)} 0;

  :before {
    content: '';
    position: absolute;
    bottom: 0;
    left: -99999px;
    right: -99999px;
    height: 0.063rem;
    width: 100vw;
    margin: 0 auto;
    background: var(--theme-divider-tertiary);

    ${laptop} {
      width: ${pageMaxWidth};
    }
  }

  & > div {
    position: relative;
  }
`;

const basePath = `/[userId]`;
export const tabs: Tab[] = [
  {
    path: basePath,
    title: 'Activity',
  },
  {
    path: `${basePath}/reputation`,
    title: 'Reputation',
  },
];

export type NavBarProps = {
  selectedTab: number;
  profile: PublicProfile;
};

export default function NavBar({
  selectedTab,
  profile,
}: NavBarProps): ReactElement {
  const { windowLoaded } = useContext(LoadingContext);
  const getTabHref = (tab: Tab) =>
    tab.path.replace('[userId]', profile.username || profile.id);

  return (
    <Nav
      flipKey={selectedTab}
      spring="veryGentle"
      element="nav"
      shouldLoad={windowLoaded}
    >
      {tabs.map((tab, index) => (
        <div key={tab.path}>
          <Link href={getTabHref(tab)} passHref>
            <TertiaryButton
              tag="a"
              buttonSize="large"
              pressed={selectedTab === index}
            >
              {tab.title}
            </TertiaryButton>
          </Link>
          <Flipped flipId="activeTabIndicator" shouldLoad={windowLoaded}>
            {selectedTab === index && <ActiveTabIndicator />}
          </Flipped>
        </div>
      ))}
    </Nav>
  );
}
