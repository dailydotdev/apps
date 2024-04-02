import React, { ReactElement, useContext, useState } from 'react';
import { Flipped, Flipper } from 'react-flip-toolkit';
import classNames from 'classnames';
import {
  HomeIcon,
  AiIcon,
  SourceIcon,
  UserIcon,
  BookmarkIcon,
  SearchIcon,
  BellIcon,
  FilterIcon,
  EditIcon,
  LinkIcon,
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
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { useMobileUxExperiment } from '@dailydotdev/shared/src/hooks/useMobileUxExperiment';
import { link } from '@dailydotdev/shared/src/lib/links';
import { Drawer } from '@dailydotdev/shared/src/components/drawers';
import styles from './FooterNavBar.module.css';

type Tab = {
  path?: string | ((user: LoggedUser) => string);
  title?: string;
  icon?: (active: boolean, unread?: number) => ReactElement;
  requiresLogin?: boolean;
  shouldShowLogin?: boolean;
  onClick?: () => void;
  component?: (onClick: () => void) => ReactElement;
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

export const mobileUxTabs: Tab[] = [
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
    component: (onClick: () => void) => (
      <div key="new-post" className="text-center">
        <CreatePostButton onClick={onClick} compact sidebar className="h-8" />
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
  const { isNewMobileLayout } = useMobileUxExperiment();
  const [newPostOptsOpen, toggleNewPostOpts] = useState(false);

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
        {(isNewMobileLayout ? mobileUxTabs : tabs).map(
          (tab, index) =>
            tab.component?.(() => toggleNewPostOpts(true)) ||
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

      <Drawer
        displayCloseButton
        isOpen={newPostOptsOpen}
        onClose={() => {
          toggleNewPostOpts(false);
        }}
      >
        <div className="flex h-auto justify-around p-4">
          <div className="flex flex-col items-center gap-2">
            <Button
              size={ButtonSize.XLarge}
              icon={<EditIcon />}
              variant={ButtonVariant.Float}
              tag="a"
              href={link.post.create}
            />

            <span className="font-normal text-text-tertiary">New post</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              size={ButtonSize.XLarge}
              className="flex flex-col"
              tag="a"
              variant={ButtonVariant.Float}
              href={`${link.post.create}?share=true`}
              icon={<LinkIcon />}
            />

            <span className="font-normal text-text-tertiary">Share a link</span>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
