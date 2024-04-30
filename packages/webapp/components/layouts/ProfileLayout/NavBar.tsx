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
import { useFeatureTheme } from '@dailydotdev/shared/src/hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '@dailydotdev/shared/src/hooks/useScrollTopClassName';
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
  const getTabHref = (tab: Tab) =>
    tab.path.replace('[userId]', profile.username || profile.id);
  const featureTheme = useFeatureTheme();
  const scrollClassname = useScrollTopClassName({ enabled: !!featureTheme });

  return (
    <div
      className={classNames(
        'sticky top-12 z-3 -mt-px flex justify-around bg-background-default tablet:top-0 tablet:justify-start laptop:top-14',
        scrollClassname,
        styles.nav,
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
