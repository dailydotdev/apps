import React, { ReactElement, useContext } from 'react';
import Link from 'next/link';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
// eslint-disable-next-line import/no-extraneous-dependencies
import { FlippedProps, FlipperProps } from 'flip-toolkit/lib/types';
import dynamicParent from '@dailydotdev/shared/src/lib/dynamicParent';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { ActiveTabIndicator } from '@dailydotdev/shared/src/components/utilities';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import classNames from 'classnames';
import styles from './NavBar.module.css';

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
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const getTabHref = (tab: Tab) =>
    tab.path.replace('[userId]', profile.username || profile.id);

  return (
    <Flipper
      flipKey={selectedTab}
      spring="veryGentle"
      element="nav"
      shouldLoad={windowLoaded}
      className={classNames('relative flex mt-6 -mx-6', styles.nav)}
    >
      {tabs.map((tab, index) => (
        <div key={tab.path}>
          <Link href={getTabHref(tab)} passHref>
            <Button
              tag="a"
              buttonSize="large"
              pressed={selectedTab === index}
              className="btn-tertiary"
            >
              {tab.title}
            </Button>
          </Link>
          <Flipped flipId="activeTabIndicator" shouldLoad={windowLoaded}>
            {selectedTab === index && (
              <ActiveTabIndicator className="bottom-0 w-4" />
            )}
          </Flipped>
        </div>
      ))}
    </Flipper>
  );
}
