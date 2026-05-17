import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { LiveRoomPost } from '../../../graphql/liveRooms';
import { LiveRoomStatus } from '../../../graphql/liveRooms';
import { webappUrl } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';
import { formatLiveRoomScheduledStart } from '../../../lib/liveRoom/date';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BellIcon, CalendarIcon, MicrophoneIcon, VIcon } from '../../icons';
import { IconSize } from '../../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { CardLink } from '../common/Card';
import { useFeedPreviewMode } from '../../../hooks';
import { useLiveRoomSubscriptionAction } from '../../../hooks/liveRooms/useLiveRoomSubscriptionAction';

export const getLiveRoomPostRoom = (post: Post): LiveRoomPost => {
  if (!post.liveRoom) {
    throw new Error(`Live room post ${post.id} is missing liveRoom`);
  }

  return post.liveRoom;
};

export const getLiveRoomPostTitle = (post: Post): string => {
  const room = getLiveRoomPostRoom(post);
  const topic = room.topic || post.title;

  if (!topic) {
    throw new Error(`Live room post ${post.id} is missing a title`);
  }

  return topic;
};

export const LiveRoomPostStatusBadge = ({
  className,
  room,
}: {
  className?: string;
  room: LiveRoomPost;
}): ReactElement | null => {
  if (room.status === LiveRoomStatus.Live) {
    return (
      <span
        className={classNames(
          'inline-flex items-center gap-1 rounded-6 bg-accent-ketchup-default px-1.5 py-0.5 font-bold uppercase tracking-wide text-white typo-caption2',
          className,
        )}
      >
        <span className="size-1 animate-pulse rounded-full bg-white" />
        Live
      </span>
    );
  }

  if (room.status === LiveRoomStatus.Ended) {
    return (
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
        bold
        className={classNames('uppercase tracking-wide', className)}
      >
        Ended
      </Typography>
    );
  }

  return null;
};

export const LiveRoomPostKicker = ({
  className,
  room,
}: {
  className?: string;
  room: LiveRoomPost;
}): ReactElement => (
  <div className={classNames('flex items-center gap-2', className)}>
    <Typography
      type={TypographyType.Caption2}
      bold
      className="inline-flex items-center gap-1 uppercase tracking-[0.18em] text-accent-bacon-default"
    >
      <MicrophoneIcon size={IconSize.XSmall} secondary />
      Standup
    </Typography>
    <LiveRoomPostStatusBadge room={room} />
  </div>
);

export const getLiveRoomPostPath = (room: Pick<LiveRoomPost, 'id'>): string =>
  `/standups/${room.id}`;

export const LiveRoomPostScheduledStart = ({
  className,
  room,
}: {
  className?: string;
  room: LiveRoomPost;
}): ReactElement | null => {
  if (!room.scheduledStart) {
    return null;
  }

  return (
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className={classNames('inline-flex items-center gap-1.5', className)}
    >
      <CalendarIcon size={IconSize.XSmall} secondary />
      {formatLiveRoomScheduledStart(room.scheduledStart)}
    </Typography>
  );
};

export const LiveRoomPostRsvpButton = ({
  buttonVariant = ButtonVariant.Primary,
  hostUserId,
  room,
}: {
  buttonVariant?: ButtonVariant;
  hostUserId?: string;
  room: LiveRoomPost;
}): ReactElement | null => {
  const {
    canToggleSubscription,
    subscribed,
    subscriptionBusy,
    toggleSubscription,
  } = useLiveRoomSubscriptionAction({
    room,
    hostUserId,
    surface: 'feed_card',
  });

  if (!canToggleSubscription) {
    return null;
  }

  return (
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={subscribed ? ButtonVariant.Secondary : buttonVariant}
      icon={
        subscribed ? (
          <VIcon secondary data-testid="live-room-post-rsvp-set-icon" />
        ) : (
          <BellIcon data-testid="live-room-post-rsvp-icon" />
        )
      }
      className="mr-2"
      loading={subscriptionBusy}
      disabled={subscriptionBusy}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        toggleSubscription(event);
      }}
    >
      {subscribed ? "RSVP'd" : 'RSVP'}
    </Button>
  );
};

export const LiveRoomPostOverlay = ({
  onPostCardAuxClick,
  onPostCardClick,
  post,
  room,
}: {
  onPostCardAuxClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onPostCardClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  post: Post;
  room: LiveRoomPost;
}): ReactElement | null => {
  const isFeedPreview = useFeedPreviewMode();

  if (isFeedPreview) {
    return null;
  }

  const title = getLiveRoomPostTitle(post);

  return (
    <CardLink
      title={title}
      aria-label={title}
      href={`${webappUrl}standups/${room.id}`}
      rel={anchorDefaultRel}
      onClick={(event) => {
        if (event.ctrlKey || event.metaKey) {
          onPostCardAuxClick?.(event);
          return;
        }

        onPostCardClick?.(event);
      }}
      onAuxClick={(event) => onPostCardAuxClick?.(event)}
    />
  );
};
