import React, { ReactElement } from 'react';
import Link from 'next/link';
import { FloatButton } from '../../Buttons';
import styled from 'styled-components';
import { size05, size4, size6 } from '../../../styles/sizes';
import { laptop } from '../../../styles/media';
import { pageMaxWidth } from '../../../styles/helpers';
import { typoNuggets } from '../../../styles/typography';
import { NextRouter } from 'next/router';
import { PublicProfile } from '../../../lib/user';
import { FlippedProps, FlipperProps } from 'flip-toolkit/lib/types';
import dynamicParent from '../../../lib/dynamicParent';
import onPageLoad from '../../../lib/onPageLoad';

const flipperLoader = () =>
  onPageLoad('complete').then(
    () => /* webpackChunkName: "reactFlip"*/ import('react-flip-toolkit'),
  );

const Flipper = dynamicParent<FlipperProps>(() =>
  flipperLoader().then((mod) => mod.Flipper),
);
const Flipped = dynamicParent<FlippedProps>(() =>
  flipperLoader().then((mod) => mod.Flipped),
);

export type Tab = { path: string; title: string };

const Nav = styled.nav`
  position: relative;
  display: flex;
  margin: ${size6} -${size6} 0;

  :before {
    content: '';
    position: absolute;
    bottom: 0;
    left: -99999px;
    right: -99999px;
    height: 0.063rem;
    width: 100vw;
    margin: 0 auto;
    background: var(--theme-separator);

    ${laptop} {
      width: ${pageMaxWidth};
    }
  }

  & > div {
    position: relative;
  }

  ${FloatButton} {
    padding: ${size4} ${size6};
    ${typoNuggets}

    &.selected {
      color: var(--theme-primary);
    }
  }
`;

const ActiveTabIndicator = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: ${size4};
  height: ${size05};
  margin: 0 auto;
  background: var(--theme-primary);
  border-radius: 0.063rem;
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
  onTabSelected: (index: number) => void;
  router: NextRouter;
};

export default function NavBar({
  selectedTab,
  profile,
  onTabSelected,
  router,
}: NavBarProps): ReactElement {
  const getTabHref = (tab: Tab) =>
    tab.path.replace('[userId]', profile.username || profile.id);

  const onTabClicked = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    onTabSelected(index);
  };

  const applyPageChange = () => {
    // Add delay to keep the animation at 60fps
    setTimeout(async () => {
      await router.push(getTabHref(tabs[selectedTab]));
    }, 100);
  };

  return (
    <Flipper flipKey={selectedTab} spring="veryGentle">
      <Nav>
        {tabs.map((tab, index) => (
          <div key={tab.path}>
            <Link href={getTabHref(tab)} passHref>
              <FloatButton
                as="a"
                className={selectedTab === index ? 'selected' : ''}
                onClick={(event: React.MouseEvent) =>
                  onTabClicked(event, index)
                }
              >
                {tab.title}
              </FloatButton>
            </Link>
            <Flipped flipId="activeTabIndicator" onStart={applyPageChange}>
              {selectedTab === index && <ActiveTabIndicator />}
            </Flipped>
          </div>
        ))}
      </Nav>
    </Flipper>
  );
}
