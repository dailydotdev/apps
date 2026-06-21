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
          variant={ButtonVariant.Float}
          // Visible by default on mobile (no hover); reveal on hover from
          // tablet up.
          className="tablet:invisible tablet:group-hover:visible"
          icon={<MenuIcon className="rotate-90" />}
          size={ButtonSize.XSmall}
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

  const [primaryAvatar] = filteredAvatars;
  const hasAvatar = filteredAvatars.length > 0;
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
  // squad activity). Source posts & system land in `Updates` and stay clean.
  const showBadge =
    hasAvatar && category !== NotificationFilterCategory.Updates;

  // A single actor renders one avatar (with a corner badge). Multiple actors
  // render as a 2x2 grid the size of one avatar — up to three faces plus the
  // action icon — so the lead never grows wider and every row stays aligned.
  let avatarContent: ReactElement | null = null;
  if (filteredAvatars.length === 1) {
    avatarContent = (
      <NotificationItemAvatar className="z-1" {...primaryAvatar} />
    );
  } else if (filteredAvatars.length > 1) {
    // 2x2 of separate, individually-rounded face boxes (no connecting frame,
    // no "+N" count) plus a circular action cell, sized like one avatar so the
    // lead width never grows. Each face keeps its hover profile tooltip.
    const slots = showBadge ? 3 : 4;
    const cells: ReactElement[] = filteredAvatars
      .slice(0, slots)
      .map((avatar) => {
        const image = (
          <Image
            className="size-full rounded-4 object-cover"
            src={avatar.image}
            alt={`${avatar.name} avatar`}
          />
        );
        return avatar.type === NotificationAvatarType.User ? (
          <ProfileTooltip
            key={avatar.referenceId}
            userId={avatar.referenceId}
            link={{ href: avatar.targetUrl }}
          >
            {image}
          </ProfileTooltip>
        ) : (
          <Image
            key={avatar.referenceId}
            className="size-full rounded-4 object-cover"
            src={avatar.image}
            alt={`${avatar.name} avatar`}
          />
        );
      });
    // Pad empty face cells so the circular action always lands bottom-right.
    while (cells.length < slots) {
      cells.push(<span key={`empty-${cells.length}`} />);
    }
    if (showBadge) {
      cells.push(
        <span
          key="action"
          className={classNames(
            'flex items-center justify-center rounded-full',
            badge.bg,
          )}
        >
          <BadgeIcon secondary size={IconSize.XXSmall} className="text-white" />
        </span>,
      );
    }

    avatarContent = (
      <div className="grid size-8 grid-cols-2 grid-rows-2 gap-0.5">{cells}</div>
    );
  }
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
        'group relative flex min-h-16 flex-row items-start gap-3 px-4 py-3 hover:bg-surface-hover focus:bg-theme-active',
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
      <div className="flex w-10 shrink-0 items-center justify-start self-center">
        <div className="relative flex items-center">
          {hasAvatar ? avatarContent : leadIcon}
          {showBadge && filteredAvatars.length === 1 && (
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
        {/* Meta line leads with the time, then a dot, then the comment (or the
            post title when there's no comment). */}
        {(timeText || showDescription || showAttachmentTitle) && (
          <div className="multi-truncate line-clamp-3 break-words text-text-tertiary typo-footnote [&_p]:m-0 [&_p]:inline">
            {timeText && (
              <Tooltip content={fullDate}>
                <time className="relative z-1 text-text-quaternary">
                  {timeText}
                </time>
              </Tooltip>
            )}
            {timeText && (showDescription || showAttachmentTitle) && (
              <span className="text-text-quaternary"> · </span>
            )}
            {showDescription ? (
              <span dangerouslySetInnerHTML={{ __html: memoizedDescription }} />
            ) : (
              showAttachmentTitle && <span>{attachmentTitle}</span>
            )}
          </div>
        )}
        {/* When there's both a comment and a post, name the post on its own
            line so it's clear which article it's about. */}
        {showDescription && showAttachmentTitle && (
          <div className="multi-truncate line-clamp-1 break-words text-text-quaternary typo-footnote">
            {attachmentTitle}
          </div>
        )}
        {type === NotificationType.UserFollow && (
          <span className="relative z-1 mt-1">
            <NotificationFollowUserButton {...props} />
          </span>
        )}
      </div>

      {/* Square post cover sits on the right, vertically centered, just left of
          (and with a gap from) the menu. */}
      {attachment?.image && (
        <Image
          data-testid="postImage"
          loading="lazy"
          type={ImageType.Post}
          className="mr-2 size-12 shrink-0 self-center rounded-12 object-cover"
          src={attachment.image}
          alt={`Cover preview of: ${attachment.title}`}
        />
      )}
      {/* Small rotated kebab in the title row, top-right (flat Float button) */}
      {hasOptions && (
        <span className="absolute right-2 top-2.5 z-1">
          <NotificationOptionsButton notification={{ type, referenceId }} />
        </span>
      )}
    </div>
  );
}

export default NotificationItem;
