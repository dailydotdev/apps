import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
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
} from './utils';
import { useNotificationFilterCategories } from '../../hooks/notifications/useNotificationFilterCategories';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureNotificationsRedesign } from '../../lib/featureManagement';
import { isExtension } from '../../lib/func';

const notificationsPath = (
  category: NotificationFilterCategory | null,
): string => `${webappUrl}notifications${category ? `?type=${category}` : ''}`;

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
  // Category filters only exist in the redesigned page; the control page
  // ignores `?type=`, so when the experiment is off keep the simple nav.
  const { value: isRedesign } = useConditionalFeature({
    feature: featureNotificationsRedesign,
  });
  const filterCategories = useNotificationFilterCategories({
    shouldEvaluate: isRedesign,
  });

  // On the webapp, filters navigate via `action` (button), NOT `path`.
  // SidebarItem treats any `?type=` path as active for the whole
  // `/notifications` route (its matcher strips the query), so a path would light
  // up every row at once. With no path, the explicit `active` flag is the sole
  // source of truth. Use a shallow `replace` to match the in-page filter bar —
  // toggling a filter shouldn't push a new history entry or refetch.
  const navigate = useCallback(
    (category: NotificationFilterCategory | null) =>
      router.replace(
        {
          pathname: '/notifications',
          query: category ? { type: category } : {},
        },
        undefined,
        { shallow: true },
      ),
    [router],
  );

  // The extension has no /notifications route to shallow-replace into, so the
  // filters can't navigate in place there — they link out to the webapp
  // instead, and no row can ever be the page you're on.
  const navigationFor = useCallback(
    (category: NotificationFilterCategory | null): Partial<SidebarMenuItem> =>
      isExtension
        ? {
            path: notificationsPath(category),
            isForcedLink: true,
            disableActiveState: true,
          }
        : { action: () => navigate(category) },
    [navigate],
  );

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    // Category-owned settings shortcut: keeps the Notifications panel active
    // (the canonical /settings/notifications page keeps the Settings panel).
    const settingsPath = `${webappUrl}notifications/settings`;
    const allActivityPath = `${webappUrl}notifications`;
    const unreadBadge = hasUnread && {
      rightIcon: () => (
        <Typography
          type={TypographyType.Caption1}
          bold
          // Cabbage, matching the bell's unread badge — red reads as an
          // error, not an unread count.
          className="rounded-6 bg-accent-cabbage-default px-1.5 text-white"
        >
          {unreadCount}
        </Typography>
      ),
    };

    const settings: SidebarMenuItem = {
      title: 'Settings',
      path: settingsPath,
      active: isSidebarItemActive(activePage, settingsPath),
      icon: (active: boolean) => (
        <ListIcon Icon={() => <SettingsIcon secondary={active} />} />
      ),
    };

    if (!isRedesign) {
      const allActivity: SidebarMenuItem = {
        title: 'All activity',
        path: allActivityPath,
        active: isSidebarItemActive(activePage, allActivityPath),
        icon: (active: boolean) => (
          <ListIcon Icon={() => <BellIcon secondary={active} />} />
        ),
        ...unreadBadge,
      };

      return [allActivity, settings];
    }

    const allActivity: SidebarMenuItem = {
      title: 'All activity',
      active: isListPage && !activeType,
      ...navigationFor(null),
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BellIcon secondary={active} />} />
      ),
      ...unreadBadge,
    };

    const categoryItems: SidebarMenuItem[] = filterCategories.map(
      (category) => {
        const { Icon } = notificationCategoryBadge[category];
        return {
          title: notificationFilterCategoryLabel[category],
          active: isListPage && activeType === category,
          ...navigationFor(category),
          icon: (active: boolean) => (
            <ListIcon Icon={() => <Icon secondary={active} />} />
          ),
        };
      },
    );

    return [allActivity, ...categoryItems, settings];
  }, [
    activePage,
    activeType,
    filterCategories,
    hasUnread,
    isListPage,
    isRedesign,
    navigationFor,
    unreadCount,
  ]);

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
