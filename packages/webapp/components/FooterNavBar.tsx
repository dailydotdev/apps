import React, {
  isValidElement,
  ReactElement,
  ReactNode,
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
import {
  AiIcon,
  BellIcon,
  HomeIcon,
  SourceIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { squadCategoriesPaths } from '@dailydotdev/shared/src/lib/constants';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { FooterTab } from './footer/common';
import { FooterNavBarTabs } from './footer/FooterNavBarTabs';
import { FooterPlusButton } from './footer/FooterPlusButton';

interface FooterNavBarProps {
  showNav?: boolean;
  post?: Post;
}

const Notifications = ({ active }: { active: boolean }): JSX.Element => {
  const { unreadCount } = useNotificationContext();

  return (
    <div className="relative">
      <BellIcon secondary={active} size={IconSize.Medium} />
      {!!unreadCount && (
        <Bubble className="-right-1.5 -top-1.5 cursor-pointer px-1">
          {getUnreadText(unreadCount)}
        </Bubble>
      )}
    </div>
  );
};

const selectedMapToTitle: Record<keyof UseActiveNav, string> = {
  home: 'Home',
  explore: 'Explore',
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
  const { user, squads } = useContext(AuthContext);
  const feedName = getFeedName(router.pathname, { hasUser: !!user });
  const activeNav = useActiveNav(feedName);

  const hasSquads = squads?.length > 0;
  const squadsUrl = hasSquads
    ? squadCategoriesPaths['My Squads']
    : squadCategoriesPaths.discover;

  const tabs: (FooterTab | ReactNode)[] = [
    {
      requiresLogin: true,
      path: '/',
      title: 'Home',
      icon: (active: boolean) => (
        <HomeIcon secondary={active} size={IconSize.Medium} />
      ),
    },
    {
      requiresLogin: false,
      path: '/posts',
      title: 'Explore',
      icon: (active: boolean) => (
        <AiIcon secondary={active} size={IconSize.Medium} />
      ),
    },
    <FooterPlusButton key="write-action" />,
    {
      requiresLogin: true,
      path: '/notifications',
      title: 'Activity',
      icon: (active: boolean) => <Notifications active={active} />,
    },
    {
      path: squadsUrl,
      title: 'Squads',
      icon: (active: boolean) => (
        <SourceIcon secondary={active} size={IconSize.Medium} />
      ),
    },
  ];

  const activeTab = useMemo(() => {
    const activeKey = Object.keys(activeNav).find((key) => activeNav[key]);

    if (activeKey) {
      return selectedMapToTitle[activeKey];
    }

    const active = (
      tabs.filter((tab) => !isValidElement(tab)) as FooterTab[]
    ).find((tab) => tab.path === router?.pathname);

    return active?.title;
  }, [activeNav, router?.pathname, tabs]);

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
          <FooterNavBarTabs activeTab={activeTab} tabs={tabs} />
        </Flipper>
      )}
    </div>
  );
}
