import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import type { Notification } from '../../graphql/notifications';
import { useObjectPurify } from '../../hooks/useDomPurify';
import NotificationItemIcon from './NotificationIcon';
import NotificationItemAttachment from './NotificationItemAttachment';
import NotificationItemAvatar from './NotificationItemAvatar';
import {
  notificationMutingCopy,
  NotificationType,
  notificationTypeTheme,
} from './utils';
import { KeyboardCommand } from '../../lib/element';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { ProfilePictureGroup } from '../ProfilePictureGroup';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BellDisabledIcon, BellIcon, MenuIcon } from '../icons';
import { useNotificationPreference } from '../../hooks/notifications';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import { Loader } from '../Loader';

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
}

const NotificationOptionsButton = ({
  notification,
}: {
  notification: Pick<Notification, 'type' | 'referenceId'>;
}): ReactElement => {
  const {
    preferences,
    isFetching,
    clearNotificationPreference,
    muteNotification,
  } = useNotificationPreference({
    params: notification
      ? [
          {
            notificationType: notification.type,
            referenceId: notification.referenceId,
          },
        ]
      : [],
  });

  const onItemClick = () => {
    const isMuted =
      preferences?.[0]?.status === NotificationPreferenceStatus.Muted;
    const preferenceCommand = isMuted
      ? clearNotificationPreference
      : muteNotification;

    return preferenceCommand({
      type: notification.type,
      referenceId: notification.referenceId,
    });
  };

  const Icon = (): ReactElement => {
    if (!notification) {
      return null;
    }

    if (isFetching) {
      return <Loader />;
    }

    const NotifIcon =
      preferences[0]?.status === NotificationPreferenceStatus.Muted
        ? BellIcon
        : BellDisabledIcon;

    return <NotifIcon />;
  };

  const label = useMemo((): string => {
    if (!notification) {
      return null;
    }

    if (isFetching) {
      return 'Fetching your preference';
    }

    const isMuted =
      preferences[0]?.status === NotificationPreferenceStatus.Muted;
    const copy = notificationMutingCopy[notification?.type];

    return isMuted ? copy.unmute : copy.mute;
  }, [notification, preferences, isFetching]);
  const options = [{ icon: <Icon />, label, action: onItemClick }];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        tooltip={{
          content: 'Options',
        }}
      >
        <Button
          variant={ButtonVariant.Tertiary}
          className="invisible absolute right-2 top-3 my-auto group-hover:visible"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function NotificationItem({
  icon,
  type,
  title,
  isUnread,
  description,
  avatars,
  attachments,
  onClick,
  targetUrl,
  numTotalAvatars,
  referenceId,
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
      {Object.keys(notificationMutingCopy).includes(type) && (
        <NotificationOptionsButton notification={{ type, referenceId }} />
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
