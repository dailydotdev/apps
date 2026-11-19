import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import Link from '../../../components/utilities/Link';
import { useLiveChatHighlight } from '../hooks/useLiveChatHighlight';
import { formatOccupants, formatTimeLeft } from '../timeLeft';
import { getChatRoomHref } from '../joinLink';
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
  // The row is the yes: landing on the post joins the chat right away, and
  // a topic room's page joins on its own.
  const href = room ? getChatRoomHref(room) : undefined;
  // The card has painted by the time the rooms answer; holding the row's
  // height meanwhile keeps the headlines from jumping.
  if (isPending) {
    return (
      <div aria-hidden className={compact ? 'h-[4.375rem]' : 'h-[3.875rem]'} />
    );
  }
  if (!room || !href) {
    return null;
  }

  // The count only once it is a crowd; the clock always, so the reader
  // knows the room will not wait for them.
  const meta = [
    formatOccupants(room.occupantCount),
    room.expiresAt && `ends in ${formatTimeLeft(room.expiresAt)}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link href={href}>
      <a
        className={classNames(
          // No width utility: a flex-col child of the card's column already
          // stretches, and `w-full` would fight the compact inset margins.
          'live-chat-frame flex flex-col gap-0.5 rounded-12 border border-brand-default text-left transition-colors hover:bg-brand-float focus-visible:bg-brand-float',
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
        {/* Headline first, like the rows under it and the Happening Now
            widget: what it is about, then that it is live. */}
        <span className="break-words font-bold text-text-primary typo-callout">
          {room.post?.title || room.title}
        </span>
        <span className="flex items-center gap-1.5 text-brand-default typo-footnote">
          <LiveDot />
          {/* base.css sets flex-shrink: 0 on everything, so the label has to
              be allowed to shrink before `truncate` can do anything. */}
          <span className="min-w-0 flex-1 truncate">
            Live chat
            {meta && (
              <>
                <span aria-hidden> · </span>
                {meta}
              </>
            )}
          </span>
          <LiveChatJoinChip />
        </span>
      </a>
    </Link>
  );
};
