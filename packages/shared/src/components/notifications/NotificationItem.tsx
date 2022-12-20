import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { ReactElement, useMemo } from 'react';
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
  targetUrl?: string;
}

function NotificationItem({
  icon,
  title,
  isUnread,
  description,
  avatars,
  attachments,
  targetUrl,
}: NotificationItemProps): ReactElement {
  const purify = useDomPurify();
  const router = useRouter();
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

  const onClick = () => {
    router.push(targetUrl);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'flex flex-row py-4 pl-6 pr-4 hover:bg-theme-hover focus:bg-theme-active',
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
    </button>
  );
}

export default NotificationItem;
