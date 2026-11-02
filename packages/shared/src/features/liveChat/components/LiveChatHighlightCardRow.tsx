import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import Link from '../../../components/utilities/Link';
import { useLiveChatHighlight } from '../hooks/useLiveChatHighlight';
import { formatEndsIn, formatOccupants } from '../timeLeft';
import { LiveDot } from './LiveDot';
import { LiveChatJoinChip } from './LiveChatHighlightRow';

// The newest live room as the first row of the Happening Now card, framed
// in brand so it stands apart from the headline rows under it. Renders
// nothing for readers outside live chat or when no room is open.
export const LiveChatHighlightCardRow = ({
  compact,
}: {
  compact?: boolean;
}): ReactElement | null => {
  const { logEvent } = useLogContext();
  const { room, isPending } = useLiveChatHighlight();
  const href = room?.post?.commentsPermalink;
  // The card has painted by the time the rooms answer; holding the row's
  // height meanwhile keeps the headlines from jumping.
  if (isPending) {
    return (
      <div aria-hidden className={compact ? 'h-[4.25rem]' : 'h-[3.75rem]'} />
    );
  }
  if (!room || !href) {
    return null;
  }

  // The count and the clock only once they work for the room: a crowd, or
  // an end close enough to hurry for.
  const meta = [
    formatOccupants(room.occupantCount),
    formatEndsIn(room.expiresAt),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link href={href}>
      <a
        className={classNames(
          // No width utility: a flex-col child of the card's column already
          // stretches, and `w-full` would fight the compact inset margins.
          'live-chat-frame flex flex-col gap-0 rounded-12 border border-brand-default text-left transition-colors hover:bg-brand-float focus-visible:bg-brand-float',
          compact ? 'mx-4 mb-2 px-4 py-3' : 'mb-2 px-3 py-2',
        )}
        href={href}
        onClick={() =>
          logEvent({
            event_name: LogEvent.OpenLiveChat,
            target_type: TargetType.ChatRoom,
            target_id: room.id,
            extra: JSON.stringify({
              origin: Origin.HighlightsCard,
              post_id: room.post?.id,
            }),
          })
        }
      >
        <span className="flex items-center gap-1.5 text-brand-default typo-footnote">
          <LiveDot />
          Live chat
          {/* base.css sets flex-shrink: 0 on everything, so the meta has to
              be allowed to shrink before `truncate` can do anything. */}
          {meta && (
            <span className="min-w-0 flex-1 truncate text-text-tertiary">
              <span aria-hidden> · </span>
              {meta}
            </span>
          )}
          <LiveChatJoinChip className="ml-auto" />
        </span>
        <span className="break-words font-bold text-text-primary typo-callout">
          {room.post?.title || room.title}
        </span>
      </a>
    </Link>
  );
};
