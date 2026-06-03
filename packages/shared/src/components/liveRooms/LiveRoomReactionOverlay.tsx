import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import type { LiveRoomReaction } from '../../contexts/LiveRoomContext';

export const LiveRoomReactionOverlay = ({
  reactions,
}: {
  reactions: LiveRoomReaction[];
}): ReactElement | null => {
  if (reactions.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 top-1/4 z-3 overflow-hidden"
      aria-hidden
    >
      {reactions.map((reaction) => (
        <span
          key={reaction.id}
          className="live-room-reaction absolute bottom-0 text-4xl"
          style={
            {
              '--live-room-reaction-left': `${16 + reaction.lane * 16}%`,
              '--live-room-reaction-drift':
                reaction.lane % 2 === 0 ? '-1rem' : '1rem',
            } as CSSProperties
          }
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
};
