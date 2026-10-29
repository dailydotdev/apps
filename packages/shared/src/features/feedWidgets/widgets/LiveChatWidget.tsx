import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import Link from '../../../components/utilities/Link';
import type { ChatRoom } from '../../liveChat/graphql';
import { liveChatRoomsQueryOptions } from '../../liveChat/queries';
import { useLiveChatEnabled } from '../../liveChat/hooks/useLiveChatEnabled';
import { LiveDot } from '../../liveChat/components/LiveDot';
import { formatTimeLeft } from '../../liveChat/timeLeft';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';

const roomHref = (room: ChatRoom): string | undefined =>
  room.post?.commentsPermalink;

const RoomRow = ({
  room,
  isSmall,
  onClick,
}: {
  room: ChatRoom;
  isSmall: boolean;
  onClick: () => void;
}): ReactElement | null => {
  const href = roomHref(room);
  if (!href) {
    return null;
  }
  const meta = [
    room.occupantCount != null && `${room.occupantCount} here`,
    room.expiresAt && `ends in ${formatTimeLeft(room.expiresAt)}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="snap-start">
      <Link href={href}>
        <a
          href={href}
          onClick={onClick}
          className="flex flex-col gap-0.5 rounded-12 px-2 py-1.5 transition-colors duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover motion-reduce:transition-none"
        >
          <span
            className={classNames(
              'break-words font-bold text-text-primary',
              isSmall
                ? 'line-clamp-2 typo-footnote'
                : 'line-clamp-3 typo-callout',
            )}
          >
            {room.post?.title || room.title}
          </span>
          <span className="truncate text-text-tertiary typo-caption1">
            {meta}
          </span>
        </a>
      </Link>
    </li>
  );
};

/**
 * The live chats open right now, newest first. Small shows the latest one;
 * Tall lists what fits.
 */
export const LiveChatWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.LiveChat>): ReactElement => {
  const { user } = useAuthContext();
  const { isEnabled } = useLiveChatEnabled();
  const { logEvent } = useLogContext();
  const scroll = useWidgetScroll();
  const { data: rooms = [], isPending } = useQuery({
    ...liveChatRoomsQueryOptions(user),
    enabled: isEnabled && !!user?.id,
  });
  const isSmall = size === FeedWidgetSize.Small;
  const shown = isSmall ? rooms.slice(0, 1) : rooms;

  if (!isEnabled || !shown.length) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.LiveChat}
        isPending={isEnabled && isPending}
        message="No live chats right now. They open when a post takes off."
      />
    );
  }

  // The same header and list inset as Happening Now, so the two read as one
  // family on the rail.
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
        <span className="flex size-4 shrink-0 items-center justify-center">
          <LiveDot />
        </span>
        <span className="truncate font-bold text-text-primary typo-caption1">
          Live now
        </span>
      </header>
      <div
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        style={scroll.style}
        className={classNames('mt-2 px-2', scroll.className)}
      >
        <ul aria-label="Live chats" className="flex flex-col gap-1">
          {shown.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              isSmall={isSmall}
              onClick={() =>
                logEvent({
                  event_name: LogEvent.OpenLiveChat,
                  target_type: TargetType.ChatRoom,
                  target_id: room.id,
                  extra: JSON.stringify({
                    origin: Origin.FeedWidgets,
                    post_id: room.post?.id,
                  }),
                })
              }
            />
          ))}
        </ul>
      </div>
    </div>
  );
};
