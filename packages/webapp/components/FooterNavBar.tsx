import React, {
  isValidElement,
  ReactElement,
  useContext,
  useMemo,
} from 'react';
import { Flipper } from 'react-flip-toolkit';
import classNames from 'classnames';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import ScrollToTopButton from '@dailydotdev/shared/src/components/ScrollToTopButton';
import { Post } from '@dailydotdev/shared/src/graphql/posts';
import { NewComment } from '@dailydotdev/shared/src/components/post/NewComment';
import { useMobileUxExperiment } from '@dailydotdev/shared/src/hooks/useMobileUxExperiment';
import useActiveNav, {
  UseActiveNav,
} from '@dailydotdev/shared/src/hooks/useActiveNav';
import { getFeedName } from '@dailydotdev/shared/src/lib/feed';
import styles from './FooterNavBar.module.css';
import { FooterTab } from './footer/common';
import { FooterNavBarV1, mobileUxTabs } from './footer/FooterNavBarV1';
import { FooterNavBarControl, tabs } from './footer/FooterNavBarControl';

interface FooterNavBarProps {
  showNav?: boolean;
  post?: Post;
}

const selectedMapToTitle: Record<keyof UseActiveNav, string> = {
  home: 'Home',
  search: 'Search',
  bookmarks: 'Bookmarks',
  notifications: 'Notifications',
  squads: 'Squads',
  profile: 'Profile',
};

const combinedTabs = tabs.concat(
  ...(mobileUxTabs.filter((tab) => !isValidElement(tab)) as FooterTab[]),
);

export default function FooterNavBar({
  showNav = false,
  post,
}: FooterNavBarProps): ReactElement {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { isNewMobileLayout } = useMobileUxExperiment();
  const feedName = getFeedName(router.pathname, { hasUser: !!user });
  const activeNav = useActiveNav(feedName);
  const activeTab = useMemo(() => {
    const activeKey = Object.keys(activeNav).find((key) => activeNav[key]);

    if (activeKey) {
      return selectedMapToTitle[activeKey];
    }

    const active = combinedTabs.find((tab) => tab.path === router?.pathname);

    return active?.title;
  }, [activeNav, router?.pathname]);

  const activeClasses =
    'bg-blur-highlight shadow-[0_4px_30px_rgba(0,0,0.1)] backdrop-blur-[2.5rem]';

  const Component = isNewMobileLayout ? FooterNavBarV1 : FooterNavBarControl;

  return (
    <div
      className={classNames(
        'fixed !bottom-0 left-0 z-2 w-full',
        isNewMobileLayout
          ? 'bg-gradient-to-t from-blur-baseline via-blur-bg via-70% to-transparent p-2'
          : post && 'bg-blur-bg backdrop-blur-20',
      )}
    >
      {isNewMobileLayout && (
        <div className="absolute bottom-0 left-0 right-0 h-[calc(100%-1.25rem)] backdrop-blur-[2.5rem]" />
      )}
      {post ? (
        <div className="mb-2 w-full px-2 tablet:hidden">
          <NewComment
            post={post}
            className={{ container: classNames(activeClasses, 'h-12') }}
          />
        </div>
      ) : (
        <ScrollToTopButton />
      )}
      <Flipper
        flipKey={activeTab}
        spring="veryGentle"
        element="nav"
        className={classNames(
          'grid h-14 w-full grid-flow-col items-center justify-between px-3',
          !showNav && 'hidden',
          styles.footerNavBar,
          isNewMobileLayout
            ? classNames('rounded-16', !post && activeClasses)
            : 'rounded-t-24 bg-background-default',
          !post && 'border-t border-theme-divider-tertiary',
        )}
      >
        <Component activeTab={activeTab} />
      </Flipper>
    </div>
  );
}
