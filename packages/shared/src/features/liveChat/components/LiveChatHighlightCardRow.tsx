import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import Link from '../../../components/utilities/Link';
import { useLiveChatHighlight } from '../hooks/useLiveChatHighlight';
import { formatTimeLeft } from '../timeLeft';
import { LiveDot } from './LiveDot';

// The newest live room as the first row of the Happening Now card, drawn
// like the headline rows around it. Renders nothing for readers outside
// live chat or when no room is open.
export const LiveChatHighlightCardRow = ({
  compact,
}: {
  compact?: boolean;
}): ReactElement | null => {
  const { logEvent } = useLogContext();
  const room = useLiveChatHighlight();
  const href = room?.post?.commentsPermalink;
  if (!room || !href) {
    return null;
  }

  const meta = [
    room.occupantCount != null && `${room.occupantCount} here`,
    room.expiresAt && `ends in ${formatTimeLeft(room.expiresAt)}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link href={href}>
      <a
        className={classNames(
          'flex w-full flex-col gap-0 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover',
          compact
            ? 'relative rounded-12 px-4 py-3 after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-border-subtlest-tertiary'
            : 'rounded-8 border-b border-border-subtlest-tertiary px-3 py-2',
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
          {meta && (
            <span className="text-text-tertiary">
              <span aria-hidden> · </span>
              {meta}
            </span>
          )}
        </span>
        <span className="break-words font-bold text-text-primary typo-callout">
          {room.post?.title || room.title}
        </span>
      </a>
    </Link>
  );
};
