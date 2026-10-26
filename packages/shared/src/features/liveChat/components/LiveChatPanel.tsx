import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { AuthTriggers } from '../../../lib/auth';
import type { RoomJoinFailure } from '../../messages/types';
import { ChatRoomStatus } from '../graphql';
import { useLiveChatRoom } from '../hooks/useLiveChatRoom';
import { useRoomPeople } from '../hooks/useRoomPeople';
import { LiveChatMessageList } from './LiveChatMessageList';
import { LiveChatComposer } from './LiveChatComposer';
import { LiveDot } from './LiveDot';
import { formatTimeLeft } from '../timeLeft';

const failureCopy: Record<RoomJoinFailure, string> = {
  banned: "You've been removed from this chat.",
  full: 'This chat is full right now. Try again in a bit.',
  gone: 'This chat has ended.',
  unknown: "Couldn't join the chat. Try again.",
};

export type LiveChatPanelProps = {
  postId: string;
  origin: string;
  // The post can host a chat that nobody opened yet (it is trending).
  canStart: boolean;
  // A sheet is already a dialog; a rail panel draws its own frame.
  variant?: 'rail' | 'sheet';
  className?: string;
  // Reports whether there is anything to show, so a rail can drop the slot.
  onVisibilityChange?: (isVisible: boolean) => void;
};

/**
 * One post's live chat: who is in, how long is left, the messages, and the
 * viewer's seat in it. Nothing persists; a closed tab is a seat left.
 */
export const LiveChatPanel = ({
  postId,
  origin,
  canStart,
  variant = 'rail',
  className,
  onVisibilityChange,
}: LiveChatPanelProps): ReactElement | null => {
  const { user, showLogin } = useAuthContext();
  const {
    room,
    isRoomLoading,
    status,
    failure,
    messages,
    typingUserIds,
    senderIds,
    join,
    leave,
    send,
    react,
    onDraftChange,
  } = useLiveChatRoom({ postId, origin });
  const { people, usernames } = useRoomPeople(senderIds);
  const hasEnded = status === 'ended';
  // The room poll can lag the presence that ended it.
  const isOpen = room?.status === ChatRoomStatus.Active && !hasEnded;
  const isVisible = isOpen || canStart || hasEnded;

  React.useEffect(() => {
    onVisibilityChange?.(!isRoomLoading && isVisible);
  }, [isRoomLoading, isVisible, onVisibilityChange]);

  if (isRoomLoading || !isVisible) {
    return null;
  }

  const onJoin = () => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.LiveChat });
      return;
    }
    join().catch(() => undefined);
  };

  const isJoined = status === 'joined';
  const timeLeft = room?.expiresAt ? formatTimeLeft(room.expiresAt) : null;
  let emptyCopy = 'Nobody has started this chat yet.';
  if (isJoined) {
    emptyCopy = 'Quiet for now. Say the first thing.';
  } else if (isOpen) {
    emptyCopy = 'Join to see what people are saying.';
  }
  let subtitle = 'Open for 24 hours, then gone';
  if (hasEnded) {
    subtitle = 'This chat has ended';
  } else if (isOpen && timeLeft) {
    subtitle = `Ends in ${timeLeft} · nothing is saved`;
  }

  return (
    <section
      aria-label="Live chat"
      className={classNames(
        'flex min-h-0 flex-col bg-background-default',
        variant === 'rail' &&
          'overflow-hidden rounded-16 border border-border-subtlest-tertiary',
        className,
      )}
    >
      <header className="flex flex-col gap-1 border-b border-border-subtlest-tertiary px-3 py-2.5">
        <div className="flex items-center gap-2">
          <LiveDot isLive={isOpen} />
          <h3 className="font-bold typo-callout">Live chat</h3>
          {isOpen && room?.occupantCount != null && (
            <span className="ml-auto text-text-tertiary typo-caption1">
              {room.occupantCount} here
            </span>
          )}
        </div>
        <p className="text-text-tertiary typo-caption1">{subtitle}</p>
      </header>

      <LiveChatMessageList
        messages={messages}
        typingUserIds={typingUserIds}
        people={people}
        usernames={usernames}
        viewerId={user?.id}
        viewerUsername={user?.username}
        onReact={isJoined ? react : undefined}
        emptyCopy={emptyCopy}
        className={variant === 'sheet' ? 'min-h-[40vh]' : 'min-h-[16rem]'}
      />

      {isJoined ? (
        <LiveChatComposer
          people={people}
          viewerId={user?.id}
          onSend={send}
          onDraftChange={onDraftChange}
          onLeave={leave}
          autoFocus={variant === 'sheet'}
        />
      ) : (
        !hasEnded && (
          <div className="flex flex-col gap-2 border-t border-border-subtlest-tertiary bg-surface-float px-3 py-3">
            {status === 'failed' && failure && (
              <p className="text-status-error typo-caption1">
                {failureCopy[failure]}
              </p>
            )}
            <p className="text-text-secondary typo-callout">
              {isOpen
                ? 'Jump in while it is hot.'
                : 'This post is trending. Open a live chat about it.'}{' '}
              {user && (
                <>
                  You will show up as{' '}
                  <strong className="text-text-primary">
                    @{user.username}
                  </strong>
                  .
                </>
              )}
            </p>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              loading={status === 'joining'}
              onClick={onJoin}
            >
              {isOpen ? 'Join the chat' : 'Start the live chat'}
            </Button>
            <p className="text-text-quaternary typo-caption2">
              Be kind. The same rules as comments apply, and moderators can
              remove anyone.
            </p>
          </div>
        )
      )}
    </section>
  );
};
