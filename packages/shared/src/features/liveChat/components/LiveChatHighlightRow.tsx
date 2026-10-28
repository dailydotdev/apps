import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import Link from '../../../components/utilities/Link';
import type { ChatRoom } from '../graphql';
import { formatTimeLeft } from '../timeLeft';
import { LiveDot } from './LiveDot';

// A live room as the first line of Happening Now: the post, and that people
// are talking about it right now.
export const LiveChatHighlightRow = ({
  room,
  isSmall,
  widget,
}: {
  room: ChatRoom;
  isSmall: boolean;
  // Which widget shows it, for the click event.
  widget: string;
}): ReactElement | null => {
  const { logEvent } = useLogContext();
  const href = room.post?.commentsPermalink;
  if (!href) {
    return null;
  }

  const meta = [
    'Live chat',
    room.occupantCount != null && `${room.occupantCount} here`,
    room.expiresAt && `ends in ${formatTimeLeft(room.expiresAt)}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="snap-start break-inside-avoid">
      <Link href={href}>
        <a
          href={href}
          onClick={() =>
            logEvent({
              event_name: LogEvent.OpenLiveChat,
              target_type: TargetType.ChatRoom,
              target_id: room.id,
              extra: JSON.stringify({
                origin: Origin.FeedWidgets,
                post_id: room.post?.id,
                widget,
              }),
            })
          }
          className="flex flex-col rounded-12 px-2 py-1.5 transition-colors duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover motion-reduce:transition-none"
        >
          <span
            className={classNames(
              'break-words font-bold text-text-primary',
              isSmall ? 'line-clamp-2 typo-footnote' : 'typo-callout',
            )}
          >
            {room.post?.title || room.title}
          </span>
          <span className="flex items-center gap-1.5 truncate text-brand-default typo-caption1">
            <LiveDot />
            {meta}
          </span>
        </a>
      </Link>
    </li>
  );
};
