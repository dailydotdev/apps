import React, { ReactElement, useContext, useMemo, useState } from 'react';
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
import useActiveNav from '@dailydotdev/shared/src/hooks/useActiveNav';
import { getFeedName } from '@dailydotdev/shared/src/lib/feed';
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
  const { isNewMobileLayout } = useMobileUxExperiment();
  const [newPostOptsOpen, toggleNewPostOpts] = useState(false);
  const feedName = getFeedName(router.pathname, {
    hasUser: !!user,
  });
  const activeNav = useActiveNav(feedName);

  const buttonProps: ButtonProps<'a' | 'button'> = {
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Large,
    className: 'w-full',
  };

  const selectedTab = useMemo(() => {
    const computedTabs = isNewMobileLayout ? mobileUxTabs : tabs;

    if (activeNav.home) {
      return computedTabs.findIndex((t) => t.title === 'Home');
    }

    if (activeNav.search) {
      return computedTabs.findIndex((t) => t.title === 'Search');
    }

    if (activeNav.squads) {
      return computedTabs.findIndex((t) => t.title === 'Squads');
    }

    if (activeNav.profile) {
      return computedTabs.findIndex((t) => t.title === 'Profile');
    }

    return computedTabs.findIndex((tab) => tab.path === router?.pathname);
  }, [activeNav, router, isNewMobileLayout]);

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

  const activeClasses =
    'bg-blur-highlight shadow-[0_4px_30px_rgba(0,0,0.1)] backdrop-blur-[2.5rem]';

  return (
    <div
      className={classNames(
        'sticky bottom-0 left-0 z-2 mt-auto w-full',
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
          <NewComment post={post} className={{ container: activeClasses }} />
        </div>
      ) : (
        <ScrollToTopButton />
      )}
      <Flipper
        flipKey={selectedTab}
        spring="veryGentle"
        element="nav"
        className={classNames(
          'grid h-14 w-full grid-flow-col items-center justify-between border-t border-theme-divider-tertiary',
          !showNav && 'hidden',
          styles.footerNavBar,
          isNewMobileLayout
            ? classNames('rounded-16', !post && activeClasses)
            : 'rounded-t-24 bg-background-default',
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
