import React, { ReactElement, useContext } from 'react';
import Link from 'next/link';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
// eslint-disable-next-line import/no-extraneous-dependencies
import dynamicParent, {
  DynamicParentPlaceholder,
} from '@dailydotdev/shared/src/lib/dynamicParent';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { ActiveTabIndicator } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import classNames from 'classnames';
import styles from './NavBar.module.css';

const flipperLoader = () =>
  import(/* webpackChunkName: "reactFlip" */ 'react-flip-toolkit');

const Flipper = dynamicParent(
  () => flipperLoader().then((mod) => mod.Flipper),
  DynamicParentPlaceholder,
);
const Flipped = dynamicParent(
  () => flipperLoader().then((mod) => mod.Flipped),
  DynamicParentPlaceholder,
);

export type Tab = { path: string; title: string };

const basePath = `/[userId]`;
export const tabs: Tab[] = [
  {
    path: basePath,
    title: 'Readme',
  },
  {
    path: `${basePath}/posts`,
    title: 'Posts',
  },
  {
    path: `${basePath}/replies`,
    title: 'Replies',
  },
  {
    path: `${basePath}/upvoted`,
    title: 'Upvoted',
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
      className={classNames('relative flex px-4 justify-between', styles.nav)}
    >
      {tabs.map((tab, index) => (
        <div key={tab.path}>
          <Link href={getTabHref(tab)} passHref>
            <Button
              tag="a"
              size={ButtonSize.Small}
              pressed={selectedTab === index}
              variant={ButtonVariant.Tertiary}
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
