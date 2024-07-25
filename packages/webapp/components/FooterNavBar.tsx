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
import useActiveNav, {
  UseActiveNav,
} from '@dailydotdev/shared/src/hooks/useActiveNav';
import { getFeedName } from '@dailydotdev/shared/src/lib/feed';
import { FooterTab } from './footer/common';
import { FooterNavBarTabs, tabs } from './footer/FooterNavBarTabs';

interface FooterNavBarProps {
  showNav?: boolean;
  post?: Post;
}

const selectedMapToTitle: Record<keyof UseActiveNav, string> = {
  home: 'Home',
  search: 'Search',
  bookmarks: 'Bookmarks',
  notifications: 'Activity',
  squads: 'Squads',
  profile: 'Profile',
};

export default function FooterNavBar({
  showNav = false,
  post,
}: FooterNavBarProps): ReactElement {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const feedName = getFeedName(router.pathname, { hasUser: !!user });
  const activeNav = useActiveNav(feedName);
  const activeTab = useMemo(() => {
    const activeKey = Object.keys(activeNav).find((key) => activeNav[key]);

    if (activeKey) {
      return selectedMapToTitle[activeKey];
    }

    const active = (
      tabs.filter((tab) => !isValidElement(tab)) as FooterTab[]
    ).find((tab) => tab.path === router?.pathname);

    return active?.title;
  }, [activeNav, router?.pathname]);

  const blurClasses = 'bg-blur-baseline backdrop-blur-[2.5rem]';
  const activeClasses = classNames(
    blurClasses,
    'shadow-[0_4px_30px_rgba(0,0,0.1)]',
  );

  return (
    <div
      className={classNames(
        'fixed !bottom-0 left-0 z-3 w-full',
        showNav &&
          'footer-navbar bg-gradient-to-t from-background-subtle from-70% to-transparent px-2 pt-2',
      )}
    >
      {post ? (
        <div className="my-2 w-full px-2 tablet:hidden">
          <NewComment
            post={post}
            className={{
              container: classNames(
                blurClasses,
                'h-12 shadow-[0_0.25rem_1.5rem_0_var(--theme-shadow-shadow1)]',
              ),
            }}
          />
        </div>
      ) : (
        <ScrollToTopButton />
      )}
      {showNav && (
        <Flipper
          flipKey={activeTab}
          spring="veryGentle"
          element="nav"
          className={classNames(
            'grid w-full auto-cols-fr grid-flow-col items-center justify-between rounded-16',
            !post && activeClasses,
            !post && 'border-t border-border-subtlest-tertiary',
          )}
        >
          <FooterNavBarTabs activeTab={activeTab} />
        </Flipper>
      )}
    </div>
  );
}
