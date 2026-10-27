import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Drawer, DrawerPosition } from '../../../components/drawers/Drawer';
import { ChatRoomStatus } from '../graphql';
import { postChatRoomQueryOptions } from '../queries';
import { LiveChatPanel } from './LiveChatPanel';
import { LiveDot } from './LiveDot';

// A phone has no rail, so the chat is a pill over the post that opens a
// bottom sheet. The sheet keeps the seat: closing it leaves the room.
export const LiveChatMobileEntry = ({
  postId,
  origin,
  canStart,
  isTrending,
}: {
  postId: string;
  origin: string;
  canStart: boolean;
  isTrending?: boolean;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const { data: room, isPending } = useQuery(
    postChatRoomQueryOptions(user, postId),
  );
  const isLive = room?.status === ChatRoomStatus.Active;

  if (isPending || (!isLive && !canStart)) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-popup flex h-12 items-center gap-2.5 rounded-16 border border-border-subtlest-secondary bg-background-popover px-4 shadow-2 laptop:hidden"
      >
        <LiveDot isLive={isLive} />
        <span className="font-bold typo-callout">Live chat</span>
        {isLive && room?.occupantCount != null && (
          <span className="text-text-tertiary typo-footnote">
            {room.occupantCount} here
          </span>
        )}
        <span className="ml-auto rounded-10 bg-brand-default px-3 py-1 font-bold text-white typo-footnote">
          {isLive ? 'Join' : 'Start'}
        </span>
      </button>
      {isOpen && (
        <Drawer
          isOpen
          onClose={() => setIsOpen(false)}
          position={DrawerPosition.Bottom}
          appendOnRoot
          // A fixed height, capped by the drawer at the visible viewport, so
          // the keyboard shrinks the message list and the composer stays in
          // view above it instead of being pushed below the fold.
          className={{ drawer: 'p-0', wrapper: 'h-[85vh]' }}
        >
          <LiveChatPanel
            postId={postId}
            origin={origin}
            canStart={canStart}
            isTrending={isTrending}
            variant="sheet"
            className="flex-1"
          />
        </Drawer>
      )}
    </>
  );
};
