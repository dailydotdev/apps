import React, { ReactElement, useMemo } from 'react';
import classNames from 'classnames';
import { useDomPurify } from '../../hooks/useDomPurify';
import classed from '../../lib/classed';
import NotificationItemIcon from './NotificationIcon';
import { NotificationItemProps } from './NotificationItem';
import NotificationItemAvatar from './NotificationItemAvatar';
import styles from './InAppNotification.module.css';

const NotificationLink = classed(
  'a',
  'flex flex-row p-3 pr-10 hover:bg-theme-hover focus:bg-theme-active rounded-16 w-full h-full overflow-hidden',
);
const NotificationAvatar = classed(
  'span',
  classNames(styles.inAppNotificationAvatar, 'flex flex-row gap-[0.375rem]'),
);
const NotificationText = classed(
  'p',
  'flex flex-col flex-1 ml-4 w-full text-left typo-callout multi-truncate line-clamp-3 h-16',
);

export function InAppNotificationItem({
  icon,
  title,
  avatars,
  targetUrl,
}: NotificationItemProps): ReactElement {
  const purify = useDomPurify();
  const { title: memoizedTitle } = useMemo(() => {
    if (!purify?.sanitize) {
      return { title: '', description: '' };
    }

    return {
      title: purify.sanitize(title),
    };
  }, [purify, title]);

  if (!purify) {
    return null;
  }

  const avatarComponents =
    avatars?.map?.((avatar) => (
      <NotificationItemAvatar key={avatar.referenceId} {...avatar} />
    )) ?? [];

  return (
    <NotificationLink href={targetUrl}>
      <NotificationAvatar>
        <NotificationItemIcon icon={icon} />
        {avatarComponents}
      </NotificationAvatar>
      <NotificationText
        dangerouslySetInnerHTML={{
          __html: memoizedTitle,
        }}
      />
    </NotificationLink>
  );
}
