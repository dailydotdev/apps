import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { Typography, TypographyType } from '../typography/Typography';
import { webappUrl } from '../../lib/constants';
import { BellIcon, SettingsIcon } from '../icons';
import type { SidebarMenuItem } from '../sidebar/common';
import { ListIcon, isSidebarItemActive } from '../sidebar/common';
import { Section } from '../sidebar/Section';
import type { NotificationFilterCategory } from './utils';
import {
  notificationCategoryBadge,
  notificationFilterCategoryLabel,
  notificationFilterCategoryList,
} from './utils';

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
    // Category-owned settings shortcut: keeps the Notifications panel active
    // (the canonical /settings/notifications page keeps the Settings panel).
    const settingsPath = `${webappUrl}notifications/settings`;

    // Filters navigate via `action` (button), NOT `path`. SidebarItem treats
    // any `?type=` path as active for the whole `/notifications` route (its
    // matcher strips the query), so a path would light up every row at once.
    // With no path, the explicit `active` flag is the sole source of truth.
    const navigate = (category: NotificationFilterCategory | null) =>
      router.push({
        pathname: '/notifications',
        query: category ? { type: category } : {},
      });

    const allActivity: SidebarMenuItem = {
      title: 'All activity',
      active: isListPage && !activeType,
      action: () => navigate(null),
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
        const { Icon } = notificationCategoryBadge[category];
        return {
          title: notificationFilterCategoryLabel[category],
          active: isListPage && activeType === category,
          action: () => navigate(category),
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
  }, [activePage, activeType, hasUnread, isListPage, router, unreadCount]);

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
