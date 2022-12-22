import React, { ReactElement, useMemo } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { Notification } from '../../graphql/notifications';
import { useDomPurify } from '../../hooks/useDomPurify';
import NotificationItemIcon from './NotificationIcon';
import NotificationItemAttachment from './NotificationItemAttachment';
import NotificationItemAvatar from './NotificationItemAvatar';

export interface NotificationItemProps
  extends Pick<
    Notification,
    'type' | 'icon' | 'title' | 'description' | 'avatars' | 'attachments'
  > {
  isUnread?: boolean;
  targetUrl: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function NotificationItem({
  icon,
  title,
  isUnread,
  description,
  avatars,
  attachments,
  targetUrl,
  onClick,
}: NotificationItemProps): ReactElement {
  const purify = useDomPurify();
  const { title: memoizedTitle, description: memoizedDescription } =
    useMemo(() => {
      if (!purify?.sanitize) {
        return { title: '', description: '' };
      }

      return {
        title: purify.sanitize(title),
        description: purify.sanitize(description),
      };
    }, [purify, title, description]);

  if (!purify) {
    return null;
  }

  const avatarComponents =
    avatars
      ?.map?.((avatar) => (
        <NotificationItemAvatar key={avatar.referenceId} {...avatar} />
      ))
      .filter((avatar) => avatar) ?? [];
  const hasAvatar = avatarComponents.length > 0;

  return (
    <Link href={targetUrl} passHref>
      <a
        href="#"
        onClick={onClick}
        className={classNames(
          'flex flex-row py-4 pl-6 pr-4 hover:bg-theme-hover focus:bg-theme-active border-y border-theme-bg-primary',
          isUnread && 'bg-theme-float',
        )}
      >
        <NotificationItemIcon icon={icon} />
        <div className="flex flex-col flex-1 ml-4 w-full text-left typo-callout">
          {hasAvatar && (
            <span className="flex flex-row gap-2 mb-4">{avatarComponents}</span>
          )}
          <span
            className="break-words"
            dangerouslySetInnerHTML={{
              __html: memoizedTitle,
            }}
          />
          {description && (
            <p
              className="mt-2 w-4/5 break-words text-theme-label-quaternary"
              dangerouslySetInnerHTML={{
                __html: memoizedDescription,
              }}
            />
          )}
          {attachments?.map(({ image, title: attachment }) => (
            <NotificationItemAttachment
              key={attachment}
              image={image}
              title={attachment}
            />
          ))}
        </div>
      </a>
    </Link>
  );
}

export default NotificationItem;
