import type { ReactElement, ReactNode } from 'react';
import React, { isValidElement, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { Flipper } from 'react-flip-toolkit';
import {
  AiIcon,
  BellIcon,
  HomeIcon,
  SourceIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { UseActiveNav } from '@dailydotdev/shared/src/hooks/useActiveNav';
import useActiveNav from '@dailydotdev/shared/src/hooks/useActiveNav';
import { squadCategoriesPaths } from '@dailydotdev/shared/src/lib/constants';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getFeedName } from '@dailydotdev/shared/src/lib/feed';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import type { FooterTab } from './common';
import { blurClasses } from './common';
import { FooterPlusButton } from './FooterPlusButton';
import { FooterNavBarTabs } from './FooterNavBarTabs';

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

const MobileFooterNavbar = ({
  isPostPage,
}: {
  isPostPage: boolean;
}): ReactElement => {
  const router = useRouter();
  const { user, squads } = useContext(AuthContext);
  const feedName = getFeedName(router.pathname, { hasUser: !!user });
  const activeNav = useActiveNav(feedName);

  const hasSquads = squads?.length > 0;
  const squadsUrl = hasSquads
    ? squadCategoriesPaths['My Squads']
    : squadCategoriesPaths.discover;

  const tabs: (FooterTab | ReactNode)[] = useMemo(
    () => [
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
    ],
    [squadsUrl],
  );

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

  const activeClasses = classNames(
    blurClasses,
    'shadow-[0_4px_30px_rgba(0,0,0.1)]',
  );

  return (
    <Flipper
      flipKey={activeTab}
      spring="veryGentle"
      element="nav"
      className={classNames(
        'grid w-full auto-cols-fr grid-flow-col items-center justify-between rounded-16',
        !isPostPage && activeClasses,
        !isPostPage && 'border-t border-border-subtlest-tertiary',
      )}
    >
      <FooterNavBarTabs activeTab={activeTab} tabs={tabs} />
    </Flipper>
  );
};

export default MobileFooterNavbar;
