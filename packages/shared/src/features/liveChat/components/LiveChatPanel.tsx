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
  // The viewer may open the chat when nobody has yet (the daily.dev team).
  canStart: boolean;
  // A sheet is already a dialog; a rail panel draws its own frame; the
  // inline block under a post draws a louder one, since it has to be seen
  // on the way to the comments.
  variant?: 'rail' | 'sheet' | 'inline';
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
  const isInline = variant === 'inline';
  let startCopy = 'Open a live chat about this post for everyone to join.';
  if (isOpen) {
    startCopy = isInline
      ? 'People are talking about this post right now. Jump in while it is on.'
      : 'Jump in while it is hot.';
  }
  let heading = 'Live chat';
  if (isInline && isOpen) {
    heading = 'Live chat is on for this post';
  }
  let subtitle = 'Open for 24 hours, then gone';
  if (hasEnded) {
    subtitle = 'This chat has ended';
  } else if (isOpen && timeLeft) {
    subtitle = `Ends in ${timeLeft} · nothing is saved`;
  }
  // Under a post the block is an invitation first: until the viewer joins
  // there is no empty list to scroll past, only the room and the way in.
  const showMessages = !isInline || isJoined;

  return (
    <section
      aria-label="Live chat"
      className={classNames(
        'flex min-h-0 flex-col bg-background-default',
        variant === 'rail' &&
          'overflow-hidden rounded-16 border border-border-subtlest-tertiary',
        isInline &&
          'live-chat-frame overflow-hidden rounded-16 border border-brand-default',
        className,
      )}
    >
      <header
        className={classNames(
          'flex flex-col gap-1 px-3 py-2.5',
          isInline ? 'px-4 py-3' : 'border-b border-border-subtlest-tertiary',
          isInline &&
            showMessages &&
            'border-b border-border-subtlest-tertiary',
        )}
      >
        <div className="flex items-center gap-2">
          <LiveDot
            isLive={isOpen}
            className={isInline ? 'size-2.5' : undefined}
          />
          <h3
            className={classNames(
              'font-bold',
              isInline ? 'typo-title3' : 'typo-callout',
            )}
          >
            {heading}
          </h3>
          {isOpen && room?.occupantCount != null && (
            <span
              className={classNames(
                'ml-auto',
                isInline
                  ? 'rounded-10 bg-brand-float px-2 py-0.5 font-bold text-brand-default typo-footnote'
                  : 'text-text-tertiary typo-caption1',
              )}
            >
              {room.occupantCount} here
            </span>
          )}
        </div>
        <p
          className={classNames(
            'text-text-tertiary',
            isInline ? 'typo-footnote' : 'typo-caption1',
          )}
        >
          {subtitle}
        </p>
      </header>

      {showMessages && (
        <LiveChatMessageList
          messages={messages}
          typingUserIds={typingUserIds}
          people={people}
          usernames={usernames}
          viewerId={user?.id}
          viewerUsername={user?.username}
          onReact={isJoined ? react : undefined}
          emptyCopy={emptyCopy}
          // In a sheet the list takes whatever the keyboard leaves, so it must
          // shrink; a minimum here would push the composer out of view. Under
          // a post it is capped so the comments stay within reach.
          className={classNames(
            variant === 'sheet' && 'min-h-0',
            variant === 'rail' && 'min-h-[16rem]',
            isInline && 'max-h-[26rem] min-h-[14rem]',
          )}
        />
      )}

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
          <div
            className={classNames(
              'flex flex-col gap-2 px-3 py-3',
              isInline
                ? 'px-4 pb-4 pt-1'
                : 'border-t border-border-subtlest-tertiary bg-surface-float',
            )}
          >
            {status === 'failed' && failure && (
              <p className="text-status-error typo-caption1">
                {failureCopy[failure]}
              </p>
            )}
            <div
              className={classNames(
                'flex flex-col gap-3',
                isInline && 'tablet:flex-row tablet:items-center',
              )}
            >
              <p
                className={classNames(
                  'text-text-secondary typo-callout',
                  isInline && 'min-w-0 flex-1',
                )}
              >
                {startCopy}{' '}
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
                size={isInline ? ButtonSize.Large : ButtonSize.Medium}
                loading={status === 'joining'}
                onClick={onJoin}
              >
                {isOpen ? 'Join the chat' : 'Start the live chat'}
              </Button>
            </div>
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
