import React, { ReactElement, useContext } from 'react';
import { Flipped, Flipper } from 'react-flip-toolkit';
import classNames from 'classnames';
import {
  HomeIcon,
  AiIcon,
  SourceIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { LinkWithTooltip } from '@dailydotdev/shared/src/components/tooltips/LinkWithTooltip';
import { ActiveTabIndicator } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonIconPosition,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import ScrollToTopButton from '@dailydotdev/shared/src/components/ScrollToTopButton';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import {
  AnalyticsEvent,
  NotificationTarget,
} from '@dailydotdev/shared/src/lib/analytics';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Post } from '@dailydotdev/shared/src/graphql/posts';
import { NewComment } from '@dailydotdev/shared/src/components/post/NewComment';
import { CreatePostButton } from '@dailydotdev/shared/src/components/post/write';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import styles from './FooterNavBar.module.css';

type Tab = {
  path?: string | ((user: LoggedUser) => string);
  title?: string;
  icon?: (active: boolean, unread?: number) => ReactElement;
  requiresLogin?: boolean;
  shouldShowLogin?: boolean;
  onClick?: () => void;
  component?: ReactElement;
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
    path: '/search',
    title: 'Search',
    icon: (active: boolean) => (
      <AiIcon secondary={active} size={IconSize.Medium} />
    ),
    shouldShowLogin: true,
  },
  {
    component: (
      <div key="new-post" className="text-center">
        <CreatePostButton compact sidebar className="h-8" />
      </div>
    ),
  },
  {
    requiresLogin: true,
    shouldShowLogin: true,
    path: '/squads',
    title: 'Squads',
    icon: (active: boolean) => (
      <SourceIcon secondary={active} size={IconSize.Medium} />
    ),
  },
  {
    requiresLogin: true,
    shouldShowLogin: true,
    path: (user) => user?.permalink,
    title: 'Profile',
    icon: (active: boolean) => (
      <UserIcon secondary={active} size={IconSize.Medium} />
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
    size: ButtonSize.Large,
    className: 'w-full',
  };

  const onNavigateNotifications = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotificationIcon,
      target_id: NotificationTarget.Footer,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });
  };

  const getPath = (path: Tab['path']) => {
    return typeof path === 'string' ? path : path(user);
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
          'grid h-14 w-full grid-flow-col items-center justify-between rounded-t-24 border-t border-theme-divider-tertiary bg-background-default',
          !showNav && 'hidden',
          styles.footerNavBar,
        )}
      >
        {tabs.map(
          (tab, index) =>
            tab.component ||
            (tab.requiresLogin && !user ? null : (
              <div key={tab.title} className="relative">
                {!tab.shouldShowLogin || user ? (
                  <LinkWithTooltip
                    href={getPath(tab.path)}
                    prefetch={false}
                    passHref
                    tooltip={{ content: tab.title }}
                  >
                    <Button
                      {...buttonProps}
                      tag="a"
                      icon={tab.icon(index === selectedTab, unreadCount)}
                      className="px-4 font-normal typo-footnote"
                      iconPosition={ButtonIconPosition.Top}
                      pressed={index === selectedTab}
                      onClick={onItemClick[getPath(tab.path)]}
                    >
                      {tab.title}
                    </Button>
                  </LinkWithTooltip>
                ) : (
                  <SimpleTooltip content={tab.title}>
                    <Button
                      {...buttonProps}
                      icon={tab.icon(index === selectedTab, unreadCount)}
                      iconPosition={ButtonIconPosition.Top}
                      className="font-normal typo-footnote"
                      onClick={() =>
                        showLogin({ trigger: AuthTriggers.Bookmark })
                      }
                    >
                      {tab.title}
                    </Button>
                  </SimpleTooltip>
                )}
                <Flipped flipId="activeTabIndicator">
                  {selectedTab === index && (
                    <ActiveTabIndicator className="-top-0.5 w-6" />
                  )}
                </Flipped>
              </div>
            )),
        )}
      </Flipper>
    </div>
  );
}
