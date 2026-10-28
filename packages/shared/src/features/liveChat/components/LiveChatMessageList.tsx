import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import { formatDate, TimeFormatType } from '../../../lib/dateFormat';
import type { RoomMessage } from '../../messages/types';
import {
  AddReactionButton,
  MessageReactions,
} from '../../messages/components/MessageReactions';
import type { RoomPerson } from '../hooks/useRoomPeople';

// Messages from the same sender within this close together share a header.
const groupWithinMs = 2 * 60 * 1000;

const mentionPattern = /(@[A-Za-z0-9_.-]+)/g;

// `@username` in a message is a mention: styled, and the viewer's own lights
// the whole row up.
export const renderMentions = (
  body: string,
  viewerUsername?: string,
): ReactNode[] =>
  body.split(mentionPattern).map((part, index) => {
    if (!part.startsWith('@')) {
      return part;
    }
    const isViewer =
      !!viewerUsername &&
      part.slice(1).toLowerCase() === viewerUsername.toLowerCase();

    return (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className={classNames(
          'rounded-4 px-0.5 font-bold',
          isViewer ? 'bg-brand-float text-brand-default' : 'text-text-link',
        )}
      >
        {part}
      </span>
    );
  });

export const mentionsUser = (body: string, username?: string): boolean =>
  !!username &&
  new RegExp(`(^|[^A-Za-z0-9_.-])@${username}(?![A-Za-z0-9_.-])`, 'i').test(
    body,
  );

const hoverActionClassName =
  'opacity-0 transition-opacity group-hover/message:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none';

const MessageRow = ({
  message,
  sender,
  showHeader,
  viewerId,
  viewerUsername,
  usernames,
  onReact,
}: {
  message: RoomMessage;
  sender?: RoomPerson;
  showHeader: boolean;
  viewerId?: string;
  viewerUsername?: string;
  usernames: Record<string, string>;
  onReact?: (messageId: string, emoji: string) => void;
}): ReactElement => {
  const isMe = message.senderId === viewerId;
  const time = formatDate({
    value: message.createdAt,
    type: TimeFormatType.Comment,
  });
  const reactions = message.reactions ?? {};
  const isMentioned = !isMe && mentionsUser(message.body, viewerUsername);
  const react = onReact
    ? (emoji: string) => onReact(message.id, emoji)
    : undefined;

  return (
    <li
      className={classNames(
        'group/message -mx-1 flex gap-2 rounded-8 px-1',
        showHeader ? 'mt-3' : 'mt-0.5',
        message.isHistory && 'opacity-80',
        isMentioned && 'bg-brand-float',
      )}
    >
      <span className="w-6 shrink-0">
        {showHeader && sender && (
          <ProfilePicture
            user={{ id: sender.id, image: sender.image, username: sender.name }}
            size={ProfileImageSize.Small}
            nativeLazyLoading
          />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        {showHeader && (
          <span className="flex items-baseline gap-2 typo-caption1">
            <span
              className={classNames(
                'truncate font-bold',
                isMe ? 'text-brand-default' : 'text-text-primary',
              )}
            >
              {isMe ? 'You' : sender?.name ?? '…'}
            </span>
            <span className="text-text-quaternary">{time}</span>
          </span>
        )}
        <div className="flex items-start gap-1">
          <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-text-primary typo-callout">
            {renderMentions(message.body, viewerUsername)}
          </span>
          {react && (
            <AddReactionButton
              onReact={react}
              className={hoverActionClassName}
            />
          )}
        </div>
        {Object.keys(reactions).length > 0 && viewerId && (
          <div className="mt-1">
            <MessageReactions
              reactions={reactions}
              viewerId={viewerId}
              usernames={usernames}
              onToggle={react}
            />
          </div>
        )}
      </div>
    </li>
  );
};

const typingCopy = (names: string[]): string => {
  if (names.length === 1) {
    return `${names[0]} is typing…`;
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]} are typing…`;
  }
  return 'Several people are typing…';
};

export const LiveChatMessageList = ({
  messages,
  typingUserIds,
  people,
  usernames,
  viewerId,
  viewerUsername,
  onReact,
  emptyCopy,
  className,
}: {
  messages: RoomMessage[];
  typingUserIds: string[];
  people: RoomPerson[];
  usernames: Record<string, string>;
  viewerId?: string;
  viewerUsername?: string;
  // Missing while the viewer is not in the room, so messages are read-only.
  onReact?: (messageId: string, emoji: string) => void;
  emptyCopy: string;
  className?: string;
}): ReactElement => {
  const list = useRef<HTMLDivElement>(null);
  const lastId = messages[messages.length - 1]?.id;
  const personOf = (id: string) => people.find((person) => person.id === id);

  // Stick to the bottom as messages arrive, unless the reader scrolled up to
  // read something.
  useEffect(() => {
    const el = list.current;
    if (!el) {
      return;
    }
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distance < 160) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lastId, typingUserIds.length]);

  return (
    <div
      ref={list}
      className={classNames('flex-1 overflow-y-auto px-3 py-2', className)}
    >
      {messages.length === 0 && (
        <p className="py-6 text-center text-text-tertiary typo-callout">
          {emptyCopy}
        </p>
      )}
      <ul className="flex flex-col">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const showHeader =
            !previous ||
            previous.senderId !== message.senderId ||
            new Date(message.createdAt).getTime() -
              new Date(previous.createdAt).getTime() >
              groupWithinMs;

          return (
            <MessageRow
              key={message.id}
              message={message}
              sender={personOf(message.senderId)}
              showHeader={showHeader}
              viewerId={viewerId}
              viewerUsername={viewerUsername}
              usernames={usernames}
              onReact={onReact}
            />
          );
        })}
      </ul>
      {typingUserIds.length > 0 && (
        <p role="status" className="mt-2 pl-8 text-text-tertiary typo-caption1">
          {typingCopy(
            typingUserIds
              .slice(0, 2)
              .map((id) => personOf(id)?.name ?? 'Someone'),
          )}
        </p>
      )}
    </div>
  );
};
