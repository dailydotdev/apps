import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useObjectPurify } from '../../hooks/useDomPurify';
import classed from '../../lib/classed';
import NotificationItemIcon from './NotificationIcon';
import NotificationItemAvatar from './NotificationItemAvatar';
import styles from './InAppNotification.module.css';
import type { NewNotification } from '../../graphql/notifications';

const NotificationWrapper = classed(
  'div',
  'relative flex h-full w-full flex-row overflow-hidden rounded-16 p-3 pr-10 hover:bg-surface-hover focus:bg-theme-active',
);
const NotificationLink = classed('a', 'absolute inset-0 h-full w-full');
const NotificationAvatar = classed(
  'span',
  classNames(
    styles.inAppNotificationAvatar,
    'flex flex-row items-start gap-[0.375rem]',
  ),
);
const NotificationText = classed(
  'p',
  'flex flex-col flex-1 ml-4 w-full text-left typo-callout multi-truncate line-clamp-3 h-16',
);

interface InAppNotificationItemProps extends NewNotification {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function InAppNotificationItem({
  icon,
  title,
  avatars,
  targetUrl,
  onClick,
}: InAppNotificationItemProps): ReactElement {
  const { title: memoizedTitle, isReady } = useObjectPurify({ title });

  if (!isReady) {
    return null;
  }

  const [avatar] = avatars ?? [];
  return (
    <NotificationWrapper>
      <NotificationLink href={targetUrl} onClick={onClick} />
      <NotificationAvatar>
        <NotificationItemIcon icon={icon} />
        {!!avatar && <NotificationItemAvatar {...avatar} className="z-1" />}
      </NotificationAvatar>
      <NotificationText
        dangerouslySetInnerHTML={{
          __html: memoizedTitle,
        }}
      />
    </NotificationWrapper>
  );
}
