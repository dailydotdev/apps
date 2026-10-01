import type { ReactElement, ReactNode } from 'react';
import React, { isValidElement, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { Flipper } from 'react-flip-toolkit';
import {
  AiIcon,
  BellIcon,
  HomeIcon,
  MegaphoneIcon,
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
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  NotificationTarget,
  TargetId,
} from '@dailydotdev/shared/src/lib/log';
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
  jobs: 'Jobs',
  highlights: 'Headlines',
};

const MobileFooterNavbar = (): ReactElement => {
  const router = useRouter();
  const { user, squads } = useContext(AuthContext);
  const feedName = getFeedName(router.pathname, { hasUser: !!user });
  const activeNav = useActiveNav(feedName);
  const hasSquads = (squads?.length ?? 0) > 0;
  const squadsUrl = hasSquads
    ? squadCategoriesPaths['My Squads']
    : squadCategoriesPaths.discover;
  const { logEvent } = useLogContext();
  const { unreadCount } = useNotificationContext();

  const tabs: (FooterTab | ReactNode)[] = useMemo(() => {
    const logTabClick = (tab: string) =>
      logEvent({
        event_name: LogEvent.Click,
        target_id: TargetId.MobileFooterNav,
        extra: JSON.stringify({ tab, logged_in: !!user }),
      });

    return [
      {
        requiresLogin: true,
        path: '/',
        title: 'Home',
        icon: (active: boolean) => (
          <HomeIcon secondary={active} size={IconSize.Medium} />
        ),
        onClick: () => logTabClick('home'),
      },
      {
        requiresLogin: false,
        path: '/posts',
        title: 'Explore',
        icon: (active: boolean) => (
          <AiIcon secondary={active} size={IconSize.Medium} />
        ),
        onClick: () => logTabClick('explore'),
      },
      {
        requiresLogin: false,
        path: '/highlights',
        title: 'Headlines',
        icon: (active: boolean) => (
          <MegaphoneIcon secondary={active} size={IconSize.Medium} />
        ),
        onClick: () => logTabClick('headlines'),
      },
      {
        requiresLogin: true,
        path: '/notifications',
        title: 'Activity',
        icon: (active: boolean) => <Notifications active={active} />,
        onClick: () =>
          logEvent({
            event_name: LogEvent.ClickNotificationIcon,
            target_id: NotificationTarget.Footer,
            extra: JSON.stringify({ notifications_number: unreadCount }),
          }),
      },
      {
        path: squadsUrl,
        title: 'Squads',
        icon: (active: boolean) => (
          <SourceIcon secondary={active} size={IconSize.Medium} />
        ),
        onClick: () => logTabClick('squads'),
      },
    ];
  }, [logEvent, squadsUrl, unreadCount, user]);

  const activeTab = useMemo(() => {
    const tabTitles = new Set(
      (tabs.filter((tab) => !isValidElement(tab)) as FooterTab[]).map(
        (tab) => tab.title,
      ),
    );

    const activeKey = (
      Object.keys(activeNav) as Array<keyof UseActiveNav>
    ).find((key) => activeNav[key] && tabTitles.has(selectedMapToTitle[key]));

    if (activeKey) {
      return selectedMapToTitle[activeKey];
    }

    const active = (
      tabs.filter((tab) => !isValidElement(tab)) as FooterTab[]
    ).find((tab) => tab.path === router?.pathname);

    return active?.title ?? '';
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
        'grid w-full select-none auto-cols-fr grid-flow-col items-center justify-between rounded-16',
        activeClasses,
        'footer-navbar border-t border-border-subtlest-tertiary',
      )}
    >
      <FooterNavBarTabs activeTab={activeTab} tabs={tabs} />
    </Flipper>
  );
};

export default MobileFooterNavbar;
