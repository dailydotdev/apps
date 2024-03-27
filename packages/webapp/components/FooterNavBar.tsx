import React, { ReactElement, useContext } from 'react';
import { Flipped, Flipper } from 'react-flip-toolkit';
import classNames from 'classnames';
import {
  HomeIcon,
  BookmarkIcon,
  SearchIcon,
  FilterIcon,
  BellIcon,
} from '@dailydotdev/shared/src/components/icons';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { LinkWithTooltip } from '@dailydotdev/shared/src/components/tooltips/LinkWithTooltip';
import { ActiveTabIndicator } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import ScrollToTopButton from '@dailydotdev/shared/src/components/ScrollToTopButton';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import {
  AnalyticsEvent,
  NotificationTarget,
} from '@dailydotdev/shared/src/lib/analytics';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Post } from '@dailydotdev/shared/src/graphql/posts';
import { NewComment } from '@dailydotdev/shared/src/components/post/NewComment';
import styles from './FooterNavBar.module.css';

type Tab = {
  path: string;
  title: string;
  icon: (active: boolean, unread?: number) => ReactElement;
  requiresLogin?: boolean;
  shouldShowLogin?: boolean;
  onClick?: () => void;
};

const notificationsPath = '/notifications';
export const tabs: Tab[] = [
  {
    path: '/',
    title: 'Home',
    icon: (active: boolean) => (
      <HomeIcon secondary={active} size={IconSize.Medium} />
    ),
  },
  {
    path: '/bookmarks',
    title: 'Bookmarks',
    icon: (active: boolean) => (
      <BookmarkIcon secondary={active} size={IconSize.Medium} />
    ),
    shouldShowLogin: true,
  },
  {
    path: '/search',
    title: 'Search',
    icon: (active: boolean) => (
      <SearchIcon secondary={active} size={IconSize.Medium} />
    ),
  },
  {
    requiresLogin: true,
    shouldShowLogin: true,
    path: notificationsPath,
    title: 'Notifications',
    icon: (active: boolean, unreadCount) => (
      <span className="relative">
        {unreadCount > 0 ? (
          <Bubble className="right-0 top-0 translate-x-1/2 px-1">
            {getUnreadText(unreadCount)}
          </Bubble>
        ) : null}
        <BellIcon secondary={active} size={IconSize.Medium} />
      </span>
    ),
  },
  {
    path: '/filters',
    title: 'Filters',
    icon: (active: boolean) => (
      <FilterIcon secondary={active} size={IconSize.Medium} />
    ),
  },
];

interface FooterNavBarProps {
  showNav?: boolean;
  post?: Post;
}

export default function FooterNavBar({
  showNav = false,
  post,
}: FooterNavBarProps): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const { unreadCount } = useNotificationContext();
  const { trackEvent } = useAnalyticsContext();
  const router = useRouter();
  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);

  const buttonProps: ButtonProps<'a' | 'button'> = {
    variant: ButtonVariant.Tertiary,
    style: { width: '100%' },
    size: ButtonSize.Large,
  };

  const onNavigateNotifications = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotificationIcon,
      target_id: NotificationTarget.Footer,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });
  };

  const onItemClick = {
    [notificationsPath]: onNavigateNotifications,
  };

  return (
    <div
      className={classNames(
        'fixed !bottom-0 left-0 z-2 w-full',
        post && 'bg-blur-bg backdrop-blur-20',
      )}
    >
      {post ? (
        <div className="mb-2 w-full px-2 tablet:hidden">
          <NewComment post={post} />
        </div>
      ) : (
        <ScrollToTopButton />
      )}
      <Flipper
        flipKey={selectedTab}
        spring="veryGentle"
        element="nav"
        className={classNames(
          'grid w-full grid-flow-col items-center border-t border-theme-divider-tertiary bg-background-default',
          !showNav && 'hidden',
          styles.footerNavBar,
        )}
      >
        {tabs.map((tab, index) =>
          tab.requiresLogin && !user ? null : (
            <div key={tab.path} className="relative">
              {!tab.shouldShowLogin || user ? (
                <LinkWithTooltip
                  href={tab.path}
                  prefetch={false}
                  passHref
                  tooltip={{ content: tab.title }}
                >
                  <Button
                    {...buttonProps}
                    tag="a"
                    icon={tab.icon(index === selectedTab, unreadCount)}
                    pressed={index === selectedTab}
                    onClick={onItemClick[tab.path]}
                  />
                </LinkWithTooltip>
              ) : (
                <SimpleTooltip content={tab.title}>
                  <Button
                    {...buttonProps}
                    icon={tab.icon(index === selectedTab, unreadCount)}
                    onClick={() =>
                      showLogin({ trigger: AuthTriggers.Bookmark })
                    }
                  />
                </SimpleTooltip>
              )}
              <Flipped flipId="activeTabIndicator">
                {selectedTab === index && (
                  <ActiveTabIndicator
                    className="w-12"
                    style={{ top: '-0.125rem' }}
                  />
                )}
              </Flipped>
            </div>
          ),
        )}
      </Flipper>
    </div>
  );
}
