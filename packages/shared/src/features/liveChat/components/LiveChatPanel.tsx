import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import { useAuthContext } from '../../../contexts/AuthContext';
import { AuthTriggers } from '../../../lib/auth';
import type { RoomJoinFailure } from '../../messages/types';
import { ChatRoomStatus } from '../graphql';
import { useLiveChatRoom } from '../hooks/useLiveChatRoom';
import { useRoomPeople } from '../hooks/useRoomPeople';
import { useRoomPresence } from '../hooks/useRoomPresence';
import { LiveChatMessageList } from './LiveChatMessageList';
import { LiveChatComposer } from './LiveChatComposer';
import { LiveChatLockedComposer } from './LiveChatLockedComposer';
import { formatEndsIn, formatOccupants, formatTimeLeft } from '../timeLeft';

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
  // The viewer already said yes somewhere else (a "Join" row, the phone
  // pill): join as soon as the room is known instead of asking again.
  joinOnOpen?: boolean;
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
  joinOnOpen,
  className,
  onVisibilityChange,
}: LiveChatPanelProps): ReactElement | null => {
  const { user, showLogin, isAuthReady } = useAuthContext();
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInline = variant === 'inline';
  // Under a post the seat is held while the block is on screen or close to
  // it (the comments just below still count), and given back once the
  // reader has scrolled well past.
  const { ref: viewRef, inView } = useInView({
    rootMargin: '400px 0px',
    fallbackInView: true,
  });
  const {
    room,
    isRoomLoading,
    status,
    failure,
    messages,
    typingUserIds,
    senderIds,
    isParticipating,
    participate,
    send,
    react,
    onDraftChange,
  } = useLiveChatRoom({ postId, origin, preview: isInline && inView });
  const { people, usernames } = useRoomPeople(senderIds);
  // Asked only from a seat: that is when the messages on screen are current.
  const presenceOf = useRoomPresence({
    roomId: room?.id,
    messages,
    enabled: status === 'joined' && room?.status === ChatRoomStatus.Active,
  });
  const hasEnded = status === 'ended';
  // The room poll can lag the presence that ended it.
  const isOpen = room?.status === ChatRoomStatus.Active && !hasEnded;
  const isVisible = isOpen || canStart || hasEnded;

  useEffect(() => {
    onVisibilityChange?.(!isRoomLoading && isVisible);
  }, [isRoomLoading, isVisible, onVisibilityChange]);

  const onJoin = useCallback(() => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.LiveChat });
      return;
    }
    participate().catch(() => undefined);
  }, [participate, showLogin, user]);

  // The yes was given on the way here; the first open room is joined once,
  // and under a post the block is brought into view so the join is seen.
  const hasAutoJoined = useRef(false);
  useEffect(() => {
    if (
      !joinOnOpen ||
      hasAutoJoined.current ||
      isRoomLoading ||
      !isOpen ||
      !isAuthReady
    ) {
      return;
    }
    hasAutoJoined.current = true;
    onJoin();
    if (isInline) {
      sectionRef.current?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isAuthReady, isInline, isOpen, isRoomLoading, joinOnOpen, onJoin]);

  if (isRoomLoading || !isVisible) {
    return null;
  }

  const isSeated = status === 'joined';
  // Reading along: seated by the preview, composer not asked for yet.
  const isReadingAlong = isSeated && !isParticipating;
  const isJoined = isSeated && isParticipating;
  // The clock only once the end is close enough to hurry for; the count
  // only once it is a crowd.
  const isEndingSoon = !!formatEndsIn(room?.expiresAt);
  const occupants = formatOccupants(room?.occupantCount);
  let emptyCopy = 'Nobody has started this chat yet.';
  if (isJoined) {
    emptyCopy = 'Quiet for now. Say the first thing.';
  } else if (isReadingAlong) {
    emptyCopy = 'Quiet for now. Join and say the first thing.';
  } else if (status === 'joining') {
    emptyCopy = 'Tuning in…';
  } else if (isOpen) {
    emptyCopy = 'Join to see what people are saying.';
  }
  // The locked composer says what its button does.
  let lockedPlaceholder = 'Open a live chat on this post for everyone';
  if (!user) {
    lockedPlaceholder = 'Sign in to join the chat';
  } else if (isOpen) {
    lockedPlaceholder = 'Join to say something';
  }
  let heading = 'Live chat';
  if (isInline && isOpen) {
    heading = 'Live chat is on for this post';
  }
  let subtitle = 'Open for 4 hours, then gone';
  if (hasEnded) {
    subtitle = 'This chat has ended';
  } else if (isOpen && isEndingSoon && room?.expiresAt) {
    subtitle = `Ends in ${formatTimeLeft(room.expiresAt)} · nothing is saved`;
  } else if (isOpen) {
    subtitle = 'On now · nothing is saved';
  }
  // Under a post the preview seats the viewer, so the chat itself is the
  // invitation: the messages run live above the way in. Until the seat is
  // there, and if it never is, there is no empty list to scroll past. Once the
  // room ends, or the seat is given back off screen, the last messages stay
  // so nothing jumps.
  const showMessages =
    !isInline ||
    isSeated ||
    status === 'joining' ||
    hasEnded ||
    messages.length > 0;
  // A preview that could not take a seat says nothing; the viewer only hears
  // about it when their own join fails.
  const showFailure = status === 'failed' && failure && isParticipating;

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        viewRef(node);
      }}
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
          <h3
            className={classNames(
              'font-bold',
              isInline ? 'typo-title3' : 'typo-callout',
            )}
          >
            {heading}
          </h3>
          {isOpen && occupants && (
            <span
              className={classNames(
                'ml-auto',
                isInline
                  ? 'rounded-10 bg-brand-float px-2 py-0.5 font-bold text-brand-default typo-footnote'
                  : 'text-text-tertiary typo-caption1',
              )}
            >
              {occupants}
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
          presenceOf={presenceOf}
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
          autoFocus={variant === 'sheet'}
        />
      ) : (
        !hasEnded && (
          <LiveChatLockedComposer
            placeholder={lockedPlaceholder}
            action={isOpen ? 'Join' : 'Start'}
            loading={status === 'joining' && isParticipating}
            failure={showFailure ? failureCopy[failure] : undefined}
            onAction={onJoin}
          />
        )
      )}
    </section>
  );
};
