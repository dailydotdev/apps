import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import type { Notification } from '../../graphql/notifications';
import { useObjectPurify } from '../../hooks/useDomPurify';
import NotificationItemIcon from './NotificationIcon';
import NotificationItemAvatar from './NotificationItemAvatar';
import {
  notificationMutingCopy,
  NotificationType,
  notificationTypeNotClickable,
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
import { Image, ImageType } from '../image/Image';
import { Loader } from '../Loader';
import { NotificationFollowUserButton } from './NotificationFollowUserButton';

import { DateFormat } from '../utilities';
import { TimeFormatType } from '../../lib/dateFormat';
import { NotificationItemDescriptionIcon } from './NotificationDescriptionIcon';

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
    | 'referenceId'
  > {
  isUnread?: boolean;
  targetUrl: string;
  createdAt?: Date;
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

  const Icon = (): ReactElement | null => {
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
      return '';
    }

    if (isFetching) {
      return 'Fetching your preference';
    }

    const isMuted =
      preferences[0]?.status === NotificationPreferenceStatus.Muted;
    const copy = notificationMutingCopy[notification?.type];

    if (!copy) {
      return '';
    }

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
          className="invisible group-hover:visible"
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

function NotificationItem(props: NotificationItemProps): ReactElement | null {
  const {
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
    createdAt,
  } = props;

  const {
    isReady,
    title: memoizedTitle,
    description: memoizedDescription,
  } = useObjectPurify({ title, description: description ?? '' });
  const router = useRouter();
  const isClickable = !notificationTypeNotClickable[type];

  const filteredAvatars = useMemo(() => {
    return avatars?.filter((avatar) => avatar) || [];
  }, [avatars]);

  if (!isReady) {
    return null;
  }

  const isAvatarGroup = [
    NotificationType.CollectionUpdated,
    NotificationType.ArticleUpvoteMilestone,
    NotificationType.CommentUpvoteMilestone,
    NotificationType.WarmIntro,
  ].includes(type);

  const avatarContent = isAvatarGroup ? (
    <ProfilePictureGroup total={numTotalAvatars} size={ProfileImageSize.Medium}>
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
    <span className="flex flex-row gap-1">
      {filteredAvatars.map((avatar) => (
        <NotificationItemAvatar
          key={avatar.referenceId}
          className="z-1"
          {...avatar}
        />
      ))}
    </span>
  );

  const hasAvatar = filteredAvatars.length > 0;
  const renderLink = onClick && isClickable;
  const hasOptions = Object.keys(notificationMutingCopy).includes(type);
  const [attachment] = attachments ?? [];

  // When there is a person/source involved we show their avatar; otherwise
  // (system/digest/streak) the type icon stands in as the lead. Kept flat and
  // single — no overlaid badge — to match the settings-page aesthetic.
  const leadIcon = (
    <NotificationItemIcon icon={icon} iconTheme={notificationTypeTheme[type]} />
  );

  return (
    <div
      className={classNames(
        'group relative flex flex-row items-start gap-3 px-4 py-3 hover:bg-surface-hover focus:bg-theme-active',
        isUnread && 'bg-surface-float',
      )}
    >
      {renderLink && targetUrl && (
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

      {/* Fixed-width lead column so every row's text starts at the same x */}
      <div
        className={classNames(
          'flex shrink-0 justify-center',
          !isAvatarGroup && 'w-10',
        )}
      >
        {hasAvatar ? avatarContent : leadIcon}
      </div>

      {/* Two text levels only (best practice): the event title, then a single
          muted secondary line — the comment when there is one, otherwise the
          referenced post title. The post's image rides on the right. */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span
          className="multi-truncate line-clamp-2 break-words typo-callout [&_p]:m-0"
          dangerouslySetInnerHTML={{
            __html: memoizedTitle,
          }}
        />
        {description ? (
          <div className="flex gap-1 text-text-tertiary typo-footnote">
            <NotificationItemDescriptionIcon type={type} key="icon" />
            <div
              className="multi-truncate line-clamp-2 min-w-0 flex-1 break-words [&_p]:m-0"
              dangerouslySetInnerHTML={{
                __html: memoizedDescription,
              }}
            />
          </div>
        ) : (
          attachment?.title && (
            <span className="multi-truncate line-clamp-1 break-words text-text-tertiary typo-footnote">
              {attachment.title}
            </span>
          )
        )}
        {type === NotificationType.UserFollow && (
          <span className="relative z-1 mt-1">
            <NotificationFollowUserButton {...props} />
          </span>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex flex-row items-center gap-1">
          {hasOptions && (
            <span className="relative z-1">
              <NotificationOptionsButton notification={{ type, referenceId }} />
            </span>
          )}
          {createdAt && (
            <DateFormat
              className="whitespace-nowrap text-text-quaternary typo-caption1"
              date={createdAt}
              type={TimeFormatType.LastActivity}
            />
          )}
        </div>
        {attachment?.image && (
          <Image
            data-testid="postImage"
            loading="lazy"
            type={ImageType.Post}
            className="h-12 w-12 rounded-12 object-cover"
            src={attachment.image}
            alt={`Cover preview of: ${attachment.title}`}
          />
        )}
      </div>
    </div>
  );
}

export default NotificationItem;
