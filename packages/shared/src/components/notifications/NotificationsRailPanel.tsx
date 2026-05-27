import type { ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { Typography, TypographyType } from '../typography/Typography';
import { webappUrl } from '../../lib/constants';

// Compact preview in the rail hover card. Mirrors the click destination
// (the notifications page) — hover reveals the unread summary, click
// commits to the full page. Uses only NotificationsContext so we don't
// fire an extra GraphQL request just to render the preview.
export const NotificationsRailPanel = (): ReactElement => {
  const { unreadCount } = useNotificationContext();

  const summary = (() => {
    if (!unreadCount) {
      return "You're all caught up.";
    }
    if (unreadCount === 1) {
      return 'You have 1 new notification.';
    }
    return `You have ${unreadCount} new notifications.`;
  })();

  return (
    <div className="flex flex-col px-2 pb-2">
      <Typography
        type={TypographyType.Footnote}
        className="px-2 py-2 text-text-tertiary"
      >
        {summary}
      </Typography>
      <Link href={`${webappUrl}notifications`} passHref>
        <a className="focus-outline mt-1 flex h-9 items-center rounded-10 px-2 text-text-link typo-callout hover:bg-surface-hover">
          View all notifications
        </a>
      </Link>
    </div>
  );
};
