import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import Link from '../utilities/Link';
import type { NotificationsData } from '../../graphql/notifications';
import { NOTIFICATIONS_QUERY } from '../../graphql/notifications';
import { gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { Typography, TypographyType } from '../typography/Typography';
import { webappUrl } from '../../lib/constants';
import { Loader } from '../Loader';

interface NotificationsRailPanelProps {
  enabled: boolean;
}

const PREVIEW_LIMIT = 5;

// Compact preview of the most recent notifications shown in the
// sidebar's hover rail card. Click the row or the View all link to
// reach the full notifications page — preview content matches the
// click destination, in line with the rest of the rail hover model.
export const NotificationsRailPanel = ({
  enabled,
}: NotificationsRailPanelProps): ReactElement => {
  const { user } = useAuthContext();
  const { data, isLoading } = useQuery<NotificationsData>({
    queryKey: ['notifications', 'rail-preview', user?.id],
    queryFn: () =>
      gqlClient.request(NOTIFICATIONS_QUERY, { first: PREVIEW_LIMIT }),
    enabled: enabled && !!user,
    staleTime: 30_000,
  });

  const notifications =
    data?.notifications.edges
      .map((edge) => edge.node)
      .slice(0, PREVIEW_LIMIT) ?? [];

  return (
    <div className="flex flex-col">
      {isLoading && notifications.length === 0 ? (
        <div className="flex h-20 items-center justify-center">
          <Loader />
        </div>
      ) : notifications.length === 0 ? (
        <Typography
          type={TypographyType.Footnote}
          className="px-4 py-3 text-text-tertiary"
        >
          You&rsquo;re all caught up.
        </Typography>
      ) : (
        <ul className="flex flex-col">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <Link
                href={notification.targetUrl ?? `${webappUrl}notifications`}
                passHref
              >
                <a
                  className={classNames(
                    'focus-outline group flex flex-col gap-1 rounded-10 px-4 py-2 transition-colors hover:bg-surface-hover',
                    !notification.readAt && 'bg-surface-float/40',
                  )}
                >
                  <Typography
                    type={TypographyType.Footnote}
                    bold
                    truncate
                    className="text-text-primary"
                  >
                    {notification.title}
                  </Typography>
                  {notification.description && (
                    <Typography
                      type={TypographyType.Caption1}
                      truncate
                      className="text-text-tertiary"
                    >
                      {notification.description}
                    </Typography>
                  )}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href={`${webappUrl}notifications`} passHref>
        <a className="focus-outline mt-1 flex h-9 items-center justify-center rounded-10 px-2 text-text-link typo-callout hover:bg-surface-hover">
          View all
        </a>
      </Link>
    </div>
  );
};
