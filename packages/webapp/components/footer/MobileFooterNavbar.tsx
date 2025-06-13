import type { ReactElement, ReactNode } from 'react';
import React, { isValidElement, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { Flipper } from 'react-flip-toolkit';
import {
  AiIcon,
  BellIcon,
  BookmarkIcon,
  DevPlusIcon,
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

import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { FooterTab } from './common';
import { blurClasses } from './common';
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
  const { user, squads, isValidRegion } = useContext(AuthContext);
  const feedName = getFeedName(router.pathname, { hasUser: !!user });
  const activeNav = useActiveNav(feedName);
  const showPlusButton = isValidRegion && !user?.isPlus;
  const hasSquads = squads?.length > 0;
  const squadsUrl = hasSquads
    ? squadCategoriesPaths['My Squads']
    : squadCategoriesPaths.discover;

  const tabs: (FooterTab | ReactNode)[] = useMemo(() => {
    const centerTab = showPlusButton ? (
      <Link key="subscribe-plus" href="/plus">
        <div className="flex flex-col items-center text-accent-avocado-default">
          <DevPlusIcon size={IconSize.Medium} />
          <Typography tag={TypographyTag.Span} type={TypographyType.Caption2}>
            Upgrade
          </Typography>
        </div>
      </Link>
    ) : (
      {
        requiresLogin: true,
        path: '/bookmarks',
        title: 'Bookmarks',
        icon: (active: boolean) => (
          <BookmarkIcon secondary={active} size={IconSize.Medium} />
        ),
      }
    );

    return [
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
      centerTab,
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
  }, [squadsUrl, showPlusButton]);

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
