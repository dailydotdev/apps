import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useObjectPurify } from '../../hooks/useDomPurify';
import classed from '../../lib/classed';
import NotificationItemIcon from './NotificationIcon';
import NotificationItemAvatar from './NotificationItemAvatar';
import styles from './InAppNotification.module.css';
import { NewNotification } from '../../graphql/notifications';

const NotificationLink = classed(
  'a',
  'flex flex-row p-3 pr-10 hover:bg-surface-hover focus:bg-theme-active rounded-16 w-full h-full overflow-hidden',
);
const NotificationAvatar = classed(
  'span',
  classNames(styles.inAppNotificationAvatar, 'flex flex-row gap-[0.375rem]'),
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
    <NotificationLink href={targetUrl} onClick={onClick}>
      <NotificationAvatar>
        <NotificationItemIcon icon={icon} />
        {!!avatar && <NotificationItemAvatar {...avatar} />}
      </NotificationAvatar>
      <NotificationText
        dangerouslySetInnerHTML={{
          __html: memoizedTitle,
        }}
      />
    </NotificationLink>
  );
}
