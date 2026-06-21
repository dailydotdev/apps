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
  getNotificationCategory,
  NotificationFilterCategory,
  notificationCategoryBadge,
  notificationMutingCopy,
  NotificationType,
  notificationTypeNotClickable,
  notificationTypeTheme,
} from './utils';
import { KeyboardCommand } from '../../lib/element';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BellDisabledIcon, BellIcon, MenuIcon } from '../icons';
import { useNotificationPreference } from '../../hooks/notifications';
import {
  NotificationAvatarType,
  NotificationPreferenceStatus,
} from '../../graphql/notifications';
import { Image, ImageType } from '../image/Image';
import { IconSize } from '../Icon';
import { Loader } from '../Loader';
import { NotificationFollowUserButton } from './NotificationFollowUserButton';
import {
  getFullNotificationDate,
  publishTimeRelativeShort,
} from '../../lib/dateFormat';
import { stripHtmlTags } from '../../lib/strings';
import { Tooltip } from '../tooltip/Tooltip';

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

  // Multiple actors (e.g. several upvoters) render as an overlapping stack;
  // a single actor renders one avatar. Both sit in a fixed-width lead so the
  // title always starts at the same x regardless of avatar count.
  const [primaryAvatar] = filteredAvatars;
  const hasAvatar = filteredAvatars.length > 0;
  const totalAvatars = numTotalAvatars ?? filteredAvatars.length;
  const maxFaces = 3;
  const showAvatarCount = totalAvatars > maxFaces;
  const stackFaces = filteredAvatars.slice(
    0,
    showAvatarCount ? maxFaces - 1 : maxFaces,
  );

  let avatarContent: ReactElement | null = null;
  if (filteredAvatars.length === 1) {
    avatarContent = (
      <NotificationItemAvatar className="z-1" {...primaryAvatar} />
    );
  } else if (filteredAvatars.length > 1) {
    avatarContent = (
      <div className="flex items-center">
        {stackFaces.map((avatar, index) => {
          // Stacked faces are rounded rectangles (a circle is reserved for a
          // single source/user). Each one keeps a hover profile tooltip.
          const picture = (
            <ProfilePicture
              size={ProfileImageSize.Small}
              className="!rounded-8 border-2 border-background-default"
              user={{ image: avatar.image }}
            />
          );

          return (
            <div
              key={avatar.referenceId}
              style={{ zIndex: stackFaces.length - index }}
              className={classNames('relative', index > 0 && '-ml-3')}
            >
              {avatar.type === NotificationAvatarType.User ? (
                <ProfileTooltip
                  userId={avatar.referenceId}
                  link={{ href: avatar.targetUrl }}
                >
                  {picture}
                </ProfileTooltip>
              ) : (
                picture
              )}
            </div>
          );
        })}
        {showAvatarCount && (
          <span className="-ml-3 flex size-6 items-center justify-center rounded-8 border-2 border-background-default bg-surface-float font-bold text-text-tertiary typo-caption2">
            +{totalAvatars - stackFaces.length}
          </span>
        )}
      </div>
    );
  }
  const renderLink = onClick && isClickable;
  const hasOptions = Object.keys(notificationMutingCopy).includes(type);
  const [attachment] = attachments ?? [];

  // When there is a person/source involved we show their avatar with a colored
  // type badge; otherwise (system/digest/streak) the type icon is the lead.
  const leadIcon = (
    <NotificationItemIcon icon={icon} iconTheme={notificationTypeTheme[type]} />
  );
  const category = getNotificationCategory(type);
  const badge = notificationCategoryBadge[category];
  const BadgeIcon = badge.Icon;
  // Badge only for notifications about you (upvotes/comments/mentions/follows/
  // squad activity). Source posts & system land in `Updates` and would just
  // stamp the same loud badge on most rows, so they keep a clean avatar/icon.
  const showBadge =
    hasAvatar && category !== NotificationFilterCategory.Updates;
  const timeText = createdAt ? publishTimeRelativeShort(createdAt) : '';
  const fullDate = createdAt ? getFullNotificationDate(createdAt) : '';

  // Subtitle can carry two things: the comment (what was said) AND the title
  // of the referenced post (which article/post it's about), so a mention or
  // comment makes clear where it happened. Each is hidden when it just repeats
  // the headline or the other, so we never show the same text twice (e.g.
  // source-post rows whose title already is the post title).
  const normalize = (html: string) =>
    stripHtmlTags(html).replace(/\s+/g, ' ').trim().toLowerCase();
  const titleNorm = normalize(memoizedTitle);
  const descriptionNorm = description ? normalize(memoizedDescription) : '';
  const showDescription = !!description && descriptionNorm !== titleNorm;
  const attachmentTitle = attachment?.title;
  const attachmentTitleNorm = attachmentTitle ? normalize(attachmentTitle) : '';
  const showAttachmentTitle =
    !!attachmentTitle &&
    attachmentTitleNorm !== titleNorm &&
    attachmentTitleNorm !== descriptionNorm;

  return (
    <div
      className={classNames(
        'group relative flex min-h-20 flex-row items-start gap-3 px-4 py-3 hover:bg-surface-hover focus:bg-theme-active',
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

      {/* Leading avatar + colored type badge — the eye-catching, type-at-a-
          glance cue (Instagram/Facebook/TikTok). System rows with no person
          fall back to the plain type icon. */}
      <div className="flex w-12 shrink-0 items-start justify-start">
        <div className="relative flex items-center">
          {hasAvatar ? avatarContent : leadIcon}
          {showBadge && (
            <span
              className={classNames(
                'absolute -bottom-1 -right-1 z-2 flex size-5 items-center justify-center rounded-full border-2 border-background-default',
                badge.bg,
              )}
            >
              <BadgeIcon
                secondary
                size={IconSize.XXSmall}
                className="text-white"
              />
            </span>
          )}
        </div>
      </div>

      {/* Bold headline, then the comment (if any), then the referenced post's
          title so it's clear which post/article the notification is about. */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span
          className="multi-truncate line-clamp-2 break-words font-bold text-text-primary typo-callout [&_p]:m-0"
          dangerouslySetInnerHTML={{
            __html: memoizedTitle,
          }}
        />
        {showDescription && (
          <div
            className="multi-truncate line-clamp-3 break-words text-text-tertiary typo-footnote [&_p]:m-0 [&_p]:inline"
            dangerouslySetInnerHTML={{
              __html: memoizedDescription,
            }}
          />
        )}
        {showAttachmentTitle && (
          <div className="multi-truncate mt-0.5 line-clamp-1 break-words text-text-quaternary typo-footnote">
            {attachmentTitle}
          </div>
        )}
        {type === NotificationType.UserFollow && (
          <span className="relative z-1 mt-1">
            <NotificationFollowUserButton {...props} />
          </span>
        )}
      </div>

      {/* Small content thumbnail, then the date as the fixed right-most element
          so it always lands in the same place and stays easy to scan. */}
      {(timeText || attachment?.image) && (
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {timeText && (
            <Tooltip content={fullDate}>
              <time className="relative z-1 whitespace-nowrap text-text-tertiary typo-caption1">
                {timeText}
              </time>
            </Tooltip>
          )}
          {attachment?.image && (
            <Image
              data-testid="postImage"
              loading="lazy"
              type={ImageType.Post}
              className="size-12 rounded-12 object-cover"
              src={attachment.image}
              alt={`Cover preview of: ${attachment.title}`}
            />
          )}
        </div>
      )}
      {hasOptions && (
        <span className="invisible absolute bottom-2.5 right-3 z-1 group-hover:visible">
          <NotificationOptionsButton notification={{ type, referenceId }} />
        </span>
      )}
    </div>
  );
}

export default NotificationItem;
