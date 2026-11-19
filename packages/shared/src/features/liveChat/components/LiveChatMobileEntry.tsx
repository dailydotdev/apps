import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Drawer, DrawerPosition } from '../../../components/drawers/Drawer';
import {
  postCapsuleTransition,
  usePostCapsulePosition,
} from '../../../components/post/PostCapsule';
import { field } from '../../../components/shell/constants';
import { useIsPhone } from '../../../hooks/useViewSize';
import { useReading } from '../../../components/shell/readingStore';
import { RootPortal } from '../../../components/tooltips/Portal';
import { ChatRoomStatus } from '../graphql';
import { postChatRoomQueryOptions } from '../queries';
import { LiveChatPanel } from './LiveChatPanel';
import { LiveDot } from './LiveDot';
import { formatOccupants } from '../timeLeft';

// A phone has no rail, so the chat is a pill over the post that opens a
// bottom sheet. The sheet keeps the seat: closing it leaves the room.
// On a phone the pill stands one gap above the post's action capsule (or in
// its slot when there is none) and moves with it, so it never covers the
// upvote, comment and share actions. `bottom` is not transitioned, so it
// holds the resting offset and the capsule's height change while reading
// rides on the transform, which is. The pill is drawn at the root, outside
// the page's flow: a fixed element inside a page piece makes the reading
// drawer split that piece, and it arrives as the post is being lifted.
export const LiveChatMobileEntry = ({
  postId,
  origin,
  canStart,
  canModerate,
  hasCapsule,
  openOnMount,
}: {
  postId: string;
  origin: string;
  canStart: boolean;
  canModerate?: boolean;
  hasCapsule?: boolean;
  // The viewer came here to join (a "Join" row elsewhere): the sheet opens
  // at once and joins on its own.
  openOnMount?: boolean;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const isPhone = useIsPhone();
  const capsule = usePostCapsulePosition();
  // While the article is behind the post, the drawer's controls own that
  // band; the pill comes back once the post is lifted over the article.
  const { open: isReading, up: isPostUp } = useReading();
  const capsuleOffset = hasCapsule ? field.rest + field.gap : 0;
  const capsuleShrink = hasCapsule ? field.rest - capsule.height : 0;
  const [isOpen, setIsOpen] = useState(!!openOnMount);
  const { data: room, isPending } = useQuery(
    postChatRoomQueryOptions(user, postId),
  );
  const isLive = room?.status === ChatRoomStatus.Active;
  const occupants = formatOccupants(room?.occupantCount);

  if (isPending || (!isLive && !canStart)) {
    return null;
  }

  return (
    <RootPortal>
      {(!isReading || isPostUp) && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={
            isPhone
              ? {
                  bottom: `calc(${capsule.bottom} + ${capsuleOffset}px)`,
                  transform: `translateY(${
                    capsule.translateY + capsuleShrink
                  }px)`,
                  transition: postCapsuleTransition,
                }
              : undefined
          }
          className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-popup flex h-12 items-center gap-2.5 rounded-16 border border-border-subtlest-secondary bg-background-popover px-4 shadow-2 motion-reduce:!transition-none laptop:hidden"
        >
          <LiveDot isLive={isLive} />
          <span className="font-bold typo-callout">Live chat</span>
          {isLive && occupants && (
            <span className="text-text-tertiary typo-footnote">
              {occupants}
            </span>
          )}
          <span className="ml-auto rounded-10 bg-brand-default px-3 py-1 font-bold text-white typo-footnote">
            {isLive ? 'Join' : 'Start'}
          </span>
        </button>
      )}
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
            canModerate={canModerate}
            variant="sheet"
            // The pill said "Join"; opening the sheet is that tap, so the
            // room is joined without asking a second time.
            joinOnOpen={isLive}
            className="flex-1"
          />
        </Drawer>
      )}
    </RootPortal>
  );
};
