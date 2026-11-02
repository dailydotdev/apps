import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import Link from '../../../components/utilities/Link';
import type { ChatRoom } from '../graphql';
import { formatTimeLeft } from '../timeLeft';
import { LiveDot } from './LiveDot';

// Happening Now rows share one list, so the live room and the highlights must
// keep the same padding and headline type. Both rows build on these.
export const highlightRowClassName = (isSmall: boolean): string =>
  classNames(
    'flex flex-col rounded-12 px-2 transition-colors duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover motion-reduce:transition-none',
    isSmall ? 'py-1.5' : 'py-2',
  );

// `typo-callout` is emitted after core utilities, so its leading needs `!`.
export const highlightHeadlineClassName = (isSmall: boolean): string =>
  classNames(
    'break-words font-medium text-text-primary',
    isSmall ? 'line-clamp-2 typo-footnote' : '!leading-[1.375rem] typo-callout',
  );

// The chip that says what a tap does; the row is a link, so it stays a span.
export const LiveChatJoinChip = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'shrink-0 rounded-8 bg-brand-default px-2 py-0.5 font-bold text-white typo-caption2',
      className,
    )}
  >
    Join
  </span>
);

// A live room as the first line of Happening Now: the post, and that people
// are talking about it right now. It is framed in brand, apart from the
// headlines below it, since it is the one line a reader can step into.
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
          className={classNames(
            highlightRowClassName(isSmall),
            'live-chat-frame mb-1 border border-brand-default hover:bg-brand-float focus-visible:bg-brand-float',
          )}
        >
          <span className={highlightHeadlineClassName(isSmall)}>
            {room.post?.title || room.title}
          </span>
          <span className="flex items-center gap-1.5">
            <LiveDot />
            {/* base.css sets flex-shrink: 0 on everything, so the meta has
                to be allowed to shrink before `truncate` can do anything. */}
            <span className="min-w-0 flex-1 truncate text-brand-default typo-caption1">
              {meta}
            </span>
            <LiveChatJoinChip />
          </span>
        </a>
      </Link>
    </li>
  );
};
