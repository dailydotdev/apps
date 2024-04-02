import React, { ReactElement } from 'react';
import Link from 'next/link';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ActiveTabIndicator } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import classNames from 'classnames';
import { useMobileUxExperiment } from '@dailydotdev/shared/src/hooks/useMobileUxExperiment';
import styles from './NavBar.module.css';

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
  const { isNewMobileLayout } = useMobileUxExperiment();

  const getTabHref = (tab: Tab) =>
    tab.path.replace('[userId]', profile.username || profile.id);

  return (
    <div
      className={classNames(
        'sticky top-12 z-3 -mt-px flex justify-around bg-background-default tablet:top-14 tablet:justify-start',
        styles.nav,
        isNewMobileLayout && 'tablet:!top-0',
      )}
    >
      {tabs.map((tab, index) => (
        <div key={tab.path}>
          <Link href={getTabHref(tab)} passHref scroll={false}>
            <Button
              tag="a"
              size={ButtonSize.Medium}
              pressed={selectedTab === index}
              variant={ButtonVariant.Tertiary}
            >
              {tab.title}
            </Button>
          </Link>
          {selectedTab === index && (
            <ActiveTabIndicator className="bottom-0 w-4" />
          )}
        </div>
      ))}
    </div>
  );
}
