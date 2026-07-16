import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import type { Notification } from '../../graphql/notifications';
import { useObjectPurify } from '../../hooks/useDomPurify';
import NotificationItemAvatar from './NotificationItemAvatar';
import { NotificationItemLead } from './NotificationItemLead';
import { NotificationCategoryBadge } from './NotificationCategoryBadge';
import { getNotificationLeadAvatar } from './leadAvatar';
import {
  getNotificationCategory,
  NotificationFilterCategory,
  notificationMutingCopy,
  NotificationType,
  notificationTypeNotClickable,
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
import { BellDisabledIcon, BellIcon, MenuIcon, PlayIcon } from '../icons';
import { useNotificationPreference } from '../../hooks/notifications';
import {
  NotificationAttachmentType,
  NotificationAvatarType,
  NotificationPreferenceStatus,
} from '../../graphql/notifications';
import { Image, ImageType } from '../image/Image';
import { IconSize } from '../Icon';
import { Loader } from '../Loader';
import { NotificationFollowUserButton } from './NotificationFollowUserButton';
import { NotificationSayThanksButton } from './NotificationSayThanksButton';
import {
  getFullNotificationDate,
  publishTimeRelativeShort,
} from '../../lib/dateFormat';
import { stripHtmlTags } from '../../lib/strings';
import { Tooltip } from '../tooltip/Tooltip';

// Strip markup + collapse whitespace so two HTML strings can be compared for
// "is this just the same text again" de-duplication. Pure + module-scoped so
// it isn't re-allocated on every row render.
const normalizeText = (html: string): string =>
  stripHtmlTags(html).replace(/\s+/g, ' ').trim().toLowerCase();

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
    | 'hasThanks'
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
          // Tertiary is the flat variant — transparent, no background or
          // border (Float carries a faint surface-float background).
          variant={ButtonVariant.Tertiary}
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
    numTotalAvatars,
    referenceId,
    hasThanks,
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

  // Lead with the human actor, not whatever avatar the backend listed first
  // (squad comments/posts arrive source-first). Falls back to the source for
  // source-only notifications.
  const leadAvatar = getNotificationLeadAvatar(filteredAvatars);
  const hasAvatar = filteredAvatars.length > 0;
  // `numTotalAvatars` can arrive as 0 from the backend even when avatars are
  // present, so take the larger of the two rather than `??` (which keeps 0).
  const totalAvatars = Math.max(numTotalAvatars ?? 0, filteredAvatars.length);
  const renderLink = onClick && isClickable;
  const hasOptions = Object.keys(notificationMutingCopy).includes(type);
  const [attachment] = attachments ?? [];

  const category = getNotificationCategory(type);
  // Badge only for notifications about you (upvotes/comments/mentions/follows/
  // squad activity). Source posts & system land in `Updates` and stay clean.
  const showBadge =
    hasAvatar && category !== NotificationFilterCategory.Updates;
  // More than three actors render as a tight overlapping stack of up to three
  // rounded-square faces — sized like one avatar so the lead never grows wider
  // and every row stays aligned. The exact count still lives in the title.
  const showStack = filteredAvatars.length > 1 && totalAvatars > 3;

  let avatarContent: ReactElement | null = null;
  if (showStack) {
    const faces = filteredAvatars.slice(0, 3);
    avatarContent = (
      <div className="flex -space-x-4">
        {faces.map((avatar, index) => {
          // Icon-backed types (briefs/digests/badges) never reach a >3 stack,
          // but fall back to the full avatar renderer rather than a broken
          // <img> if one ever does.
          const isImageBacked =
            avatar.type === NotificationAvatarType.User ||
            avatar.type === NotificationAvatarType.Source ||
            avatar.type === NotificationAvatarType.Organization;
          const isFront = index === faces.length - 1;
          const face = isImageBacked ? (
            <Image
              className="size-6 rounded-8 border-2 border-background-default object-cover"
              src={avatar.image}
              alt={`${avatar.name} avatar`}
            />
          ) : (
            <NotificationItemAvatar {...avatar} />
          );
          return (
            <span
              key={avatar.referenceId ?? index}
              className={classNames('relative', isFront && 'z-1')}
            >
              {avatar.type === NotificationAvatarType.User ? (
                <ProfileTooltip
                  userId={avatar.referenceId}
                  link={{ href: avatar.targetUrl }}
                >
                  {face}
                </ProfileTooltip>
              ) : (
                face
              )}
              {/* Same category badge as the single-actor lead, straddling the
                  front face's bottom-right corner (translate centering keeps it
                  from swamping the smaller stacked face). */}
              {isFront && showBadge && (
                <NotificationCategoryBadge
                  category={category}
                  className="bottom-0 right-0 translate-x-1/2 translate-y-1/2"
                />
              )}
            </span>
          );
        })}
      </div>
    );
  }
  const timeText = createdAt ? publishTimeRelativeShort(createdAt) : '';
  const fullDate = createdAt ? getFullNotificationDate(createdAt) : '';

  // Subtitle can carry two things: the comment (what was said) AND the title
  // of the referenced post (which article/post it's about), so a mention or
  // comment makes clear where it happened. Each is hidden when it just repeats
  // the headline or the other, so we never show the same text twice (e.g.
  // source-post rows whose title already is the post title).
  const titleNorm = normalizeText(memoizedTitle);
  const descriptionNorm = description ? normalizeText(memoizedDescription) : '';
  const showDescription = !!description && descriptionNorm !== titleNorm;
  const attachmentTitle = attachment?.title;
  const attachmentTitleNorm = attachmentTitle
    ? normalizeText(attachmentTitle)
    : '';
  const showAttachmentTitle =
    !!attachmentTitle &&
    attachmentTitleNorm !== titleNorm &&
    attachmentTitleNorm !== descriptionNorm;

  return (
    <div
      className={classNames(
        'relative flex min-h-14 flex-row items-start gap-3 px-4 py-3 hover:bg-surface-hover focus:bg-theme-active laptop:min-h-16 laptop:py-4',
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
          fall back to the plain type icon. More than three actors render as an
          overlapping stack; everything else uses the shared single-actor lead. */}
      <div className="flex w-10 shrink-0 items-center justify-start">
        {showStack ? (
          avatarContent
        ) : (
          <NotificationItemLead type={type} icon={icon} avatar={leadAvatar} />
        )}
      </div>

      {/* Headline (actor name bold, the rest regular for a scannable
          hierarchy) with the relative time flowing inline right after it — so a
          row reads "what happened" first and the time is a quiet suffix, not a
          right-aligned column. Then the comment, then the post's title. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <div className="break-words font-normal text-text-primary typo-callout [&_b]:font-bold [&_p]:m-0 [&_p]:inline [&_strong]:font-bold">
          <span dangerouslySetInnerHTML={{ __html: memoizedTitle }} />
          {timeText && (
            <Tooltip content={fullDate}>
              <time className="relative z-1 ml-1.5 whitespace-nowrap text-text-tertiary typo-footnote">
                · {timeText}
              </time>
            </Tooltip>
          )}
        </div>
        {(showDescription || showAttachmentTitle) && (
          <div className="multi-truncate line-clamp-2 break-words text-text-tertiary typo-subhead [&_p]:m-0 [&_p]:inline">
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
          <div className="multi-truncate line-clamp-1 break-words text-text-tertiary typo-footnote">
            {attachmentTitle}
          </div>
        )}
        {type === NotificationType.UserFollow && (
          <span className="relative z-1 mt-1">
            <NotificationFollowUserButton {...props} />
          </span>
        )}
        {type === NotificationType.UserReceivedAward && (
          <span className="relative z-1 mt-1">
            <NotificationSayThanksButton
              referenceId={referenceId}
              hasThanks={hasThanks}
            />
          </span>
        )}
      </div>

      {/* Trailing: the post cover and/or the options menu, both top-aligned with
          the title (the menu is the rightmost element, so it pins to the
          top-right corner). The menu column is only reserved when the row
          actually has a menu — otherwise the cover sits flush to the right edge
          instead of leaving an empty gap. */}
      {(attachment?.image || hasOptions) && (
        <div className="flex shrink-0 items-start gap-2">
          {attachment?.image && (
            <span className="relative flex size-12 shrink-0">
              <Image
                data-testid="postImage"
                loading="lazy"
                type={ImageType.Post}
                className="size-12 rounded-12 object-cover"
                src={attachment.image}
                alt={
                  attachment.title
                    ? `Cover preview of: ${attachment.title}`
                    : 'Post cover preview'
                }
              />
              {attachment.type === NotificationAttachmentType.Video && (
                <span className="absolute inset-0 flex items-center justify-center rounded-12 bg-overlay-tertiary-black">
                  <PlayIcon
                    secondary
                    size={IconSize.Small}
                    className="text-white"
                  />
                </span>
              )}
            </span>
          )}
          {hasOptions && (
            <div className="relative z-1 flex w-7 shrink-0 justify-center">
              <NotificationOptionsButton notification={{ type, referenceId }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationItem;
