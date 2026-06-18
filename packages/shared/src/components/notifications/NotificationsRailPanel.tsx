import type { ComponentType, ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { Typography, TypographyType } from '../typography/Typography';
import { webappUrl } from '../../lib/constants';
import {
  AddUserIcon,
  AtIcon,
  BellIcon,
  DiscussIcon,
  MegaphoneIcon,
  SettingsIcon,
  SquadIcon,
  UpvoteIcon,
} from '../icons';
import type { IconProps } from '../Icon';
import type { SidebarMenuItem } from '../sidebar/common';
import { ListIcon, isSidebarItemActive } from '../sidebar/common';
import { Section } from '../sidebar/Section';
import {
  NotificationFilterCategory,
  notificationFilterCategoryLabel,
  notificationFilterCategoryList,
} from './utils';

const categoryIcon: Record<
  NotificationFilterCategory,
  ComponentType<IconProps>
> = {
  [NotificationFilterCategory.Upvotes]: UpvoteIcon,
  [NotificationFilterCategory.Mentions]: AtIcon,
  [NotificationFilterCategory.Comments]: DiscussIcon,
  [NotificationFilterCategory.Followers]: AddUserIcon,
  [NotificationFilterCategory.Squads]: SquadIcon,
  [NotificationFilterCategory.Updates]: MegaphoneIcon,
};

// Compact menu in the rail / v2 context panel. Lists the notification type
// filters (driven by the `?type=` query param on the notifications page) plus
// the settings shortcut, rendered as a Section so its rows align with every
// other v2 rail panel (same row layout, spacing, and active highlight).
export const NotificationsRailPanel = (): ReactElement => {
  const router = useRouter();
  const activePage = router.asPath ?? router.pathname ?? '';
  const { unreadCount } = useNotificationContext();
  const hasUnread = !!unreadCount;
  const isListPage = router.pathname === '/notifications';
  const activeType =
    typeof router.query?.type === 'string' ? router.query.type : undefined;

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const allActivityPath = `${webappUrl}notifications`;
    // Category-owned settings shortcut: keeps the Notifications panel active
    // (the canonical /settings/notifications page keeps the Settings panel).
    const settingsPath = `${webappUrl}notifications/settings`;

    const allActivity: SidebarMenuItem = {
      title: 'All activity',
      path: allActivityPath,
      active: isListPage && !activeType,
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BellIcon secondary={active} />} />
      ),
      ...(hasUnread && {
        rightIcon: () => (
          <Typography
            type={TypographyType.Caption1}
            bold
            className="rounded-6 bg-accent-ketchup-default px-1.5 text-white"
          >
            {unreadCount}
          </Typography>
        ),
      }),
    };

    const categoryItems: SidebarMenuItem[] = notificationFilterCategoryList.map(
      (category) => {
        const Icon = categoryIcon[category];
        return {
          title: notificationFilterCategoryLabel[category],
          path: `${allActivityPath}?type=${category}`,
          active: isListPage && activeType === category,
          icon: (active: boolean) => (
            <ListIcon Icon={() => <Icon secondary={active} />} />
          ),
        };
      },
    );

    const settings: SidebarMenuItem = {
      title: 'Settings',
      path: settingsPath,
      active: isSidebarItemActive(activePage, settingsPath),
      icon: (active: boolean) => (
        <ListIcon Icon={() => <SettingsIcon secondary={active} />} />
      ),
    };

    return [allActivity, ...categoryItems, settings];
  }, [activePage, activeType, hasUnread, isListPage, unreadCount]);

  return (
    <Section
      items={menuItems}
      isItemsButton={false}
      sidebarExpanded
      shouldShowLabel
      activePage={activePage}
    />
  );
};
