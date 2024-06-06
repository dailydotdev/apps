import React, { ReactElement, useMemo } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Notification } from '../../graphql/notifications';
import { useObjectPurify } from '../../hooks/useDomPurify';
import NotificationItemIcon from './NotificationIcon';
import NotificationItemAttachment from './NotificationItemAttachment';
import NotificationItemAvatar from './NotificationItemAvatar';
import { NotificationType, notificationTypeTheme } from './utils';
import OptionsButton from '../buttons/OptionsButton';
import { KeyboardCommand } from '../../lib/element';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { ProfilePictureGroup } from '../ProfilePictureGroup';

export interface NotificationItemProps
  extends Pick<
    Notification,
    | 'type'
    | 'icon'
    | 'title'
    | 'description'
    | 'avatars'
    | 'attachments'
    | 'numTotalAvatars'
  > {
  isUnread?: boolean;
  targetUrl: string;
  onClick?: (
    e:
      | React.MouseEvent<HTMLAnchorElement>
      | React.KeyboardEvent<HTMLAnchorElement>,
  ) => void;
  onOptionsClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function NotificationItem({
  icon,
  type,
  title,
  isUnread,
  description,
  avatars,
  attachments,
  onClick,
  onOptionsClick,
  targetUrl,
  numTotalAvatars,
}: NotificationItemProps): ReactElement {
  const {
    isReady,
    title: memoizedTitle,
    description: memoizedDescription,
  } = useObjectPurify({ title, description });
  const router = useRouter();

  const filteredAvatars = useMemo(() => {
    return avatars?.filter((avatar) => avatar) || [];
  }, [avatars]);

  if (!isReady) {
    return null;
  }

  const avatarComponents =
    type === NotificationType.CollectionUpdated ? (
      <ProfilePictureGroup
        total={numTotalAvatars}
        size={ProfileImageSize.Medium}
      >
        {filteredAvatars.map((avatar) => (
          <ProfilePicture
            key={avatar.referenceId}
            rounded="full"
            size={ProfileImageSize.Medium}
            user={{ image: avatar.image }}
          />
        ))}
      </ProfilePictureGroup>
    ) : (
      filteredAvatars
        .map((avatar) => (
          <NotificationItemAvatar
            key={avatar.referenceId}
            className="z-1"
            {...avatar}
          />
        ))
        .filter((avatar) => avatar) ?? []
    );
  const hasAvatar = filteredAvatars.length > 0;

  return (
    <div
      className={classNames(
        'group relative flex flex-row border-y border-background-default py-4 pl-6 pr-4 hover:bg-surface-hover focus:bg-theme-active',
        isUnread && 'bg-surface-float',
      )}
    >
      {onClick && (
        <Link href={targetUrl} passHref>
          <a
            role="link"
            aria-label="Open notification"
            className="absolute inset-0 z-0"
            onClick={onClick}
            title="Open notification"
            data-testid="openNotification"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.code === KeyboardCommand.Space) {
                onClick(e);
                router.push(targetUrl);
              }
              return true;
            }}
          >
            <span />
          </a>
        </Link>
      )}
      {onOptionsClick && (
        <OptionsButton
          className="absolute right-2 top-3 hidden group-hover:flex"
          type="button"
          onClick={onOptionsClick}
        />
      )}
      <NotificationItemIcon
        icon={icon}
        iconTheme={notificationTypeTheme[type]}
      />
      <div className="ml-4 flex w-full flex-1 flex-col text-left typo-callout">
        {hasAvatar && (
          <span className="mb-4 flex flex-row gap-2">{avatarComponents}</span>
        )}
        <span
          className="break-words"
          dangerouslySetInnerHTML={{
            __html: memoizedTitle,
          }}
        />
        {description && (
          <p
            className="mt-2 w-4/5 break-words text-text-quaternary"
            dangerouslySetInnerHTML={{
              __html: memoizedDescription,
            }}
          />
        )}
        {attachments?.map(({ title: attachment, ...props }) => (
          <NotificationItemAttachment
            key={attachment}
            title={attachment}
            {...props}
          />
        ))}
      </div>
    </div>
  );
}

export default NotificationItem;
