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

// Compact menu in the rail hover card. Lists the destinations the
// notifications rail icon can reach so the hover preview matches the
// rail's click model. Rendered as a Section so its rows align with every
// other v2 rail panel (same row layout, spacing, and active highlight).
export const NotificationsRailPanel = (): ReactElement => {
  const router = useRouter();
  const activePage = router.asPath ?? router.pathname ?? '';
  const { unreadCount } = useNotificationContext();
  const hasUnread = !!unreadCount;

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const allActivityPath = `${webappUrl}notifications`;
    // Category-owned settings shortcut: keeps the Notifications panel active
    // (the canonical /settings/notifications page keeps the Settings panel).
    const settingsPath = `${webappUrl}notifications/settings`;

    return [
      {
        title: 'All activity',
        path: allActivityPath,
        active: isSidebarItemActive(activePage, allActivityPath),
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
      },
      {
        title: 'Settings',
        path: settingsPath,
        active: isSidebarItemActive(activePage, settingsPath),
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SettingsIcon secondary={active} />} />
        ),
      },
    ];
  }, [activePage, hasUnread, unreadCount]);

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
