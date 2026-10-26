import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import { formatDate, TimeFormatType } from '../../../lib/dateFormat';
import { dmPeerQueryOptions } from '../../messages/queries';
import type { RoomMessage } from '../../messages/types';

// Messages from the same sender within this close together share a header.
const groupWithinMs = 2 * 60 * 1000;

// Rooms only carry a sender's id; the profile is one cached lookup per
// sender, shared with direct messages.
const useSender = (senderId: string) => {
  const { user } = useAuthContext();
  const isMe = senderId === user?.id;
  const { data: peer } = useQuery({
    ...dmPeerQueryOptions(user, senderId),
    enabled: !isMe && !!user?.id,
  });

  if (isMe && user) {
    return { id: user.id, name: user.name, image: user.image, isMe };
  }

  return peer
    ? { id: peer.id, name: peer.name, image: peer.image, isMe }
    : null;
};

const SenderName = ({ senderId }: { senderId: string }): ReactElement => {
  const sender = useSender(senderId);

  return <>{sender?.isMe ? 'You' : sender?.name ?? '…'}</>;
};

const MessageRow = ({
  message,
  showHeader,
}: {
  message: RoomMessage;
  showHeader: boolean;
}): ReactElement => {
  const sender = useSender(message.senderId);
  const time = formatDate({
    value: message.createdAt,
    type: TimeFormatType.Comment,
  });

  return (
    <li
      className={classNames(
        'flex gap-2',
        showHeader ? 'mt-3' : 'mt-0.5',
        message.isHistory && 'opacity-80',
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
                sender?.isMe ? 'text-brand-default' : 'text-text-primary',
              )}
            >
              {sender?.isMe ? 'You' : sender?.name ?? '…'}
            </span>
            <span className="text-text-quaternary">{time}</span>
          </span>
        )}
        <span className="whitespace-pre-wrap break-words text-text-primary typo-callout">
          {message.body}
        </span>
      </div>
    </li>
  );
};

const typingCopy = (names: ReactElement[]): ReactElement => {
  if (names.length === 1) {
    return <>{names[0]} is typing…</>;
  }
  if (names.length === 2) {
    return (
      <>
        {names[0]} and {names[1]} are typing…
      </>
    );
  }
  return <>Several people are typing…</>;
};

export const LiveChatMessageList = ({
  messages,
  typingUserIds,
  emptyCopy,
  className,
}: {
  messages: RoomMessage[];
  typingUserIds: string[];
  emptyCopy: string;
  className?: string;
}): ReactElement => {
  const list = useRef<HTMLDivElement>(null);
  const lastId = messages[messages.length - 1]?.id;

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
              showHeader={showHeader}
            />
          );
        })}
      </ul>
      {typingUserIds.length > 0 && (
        <p role="status" className="mt-2 pl-8 text-text-tertiary typo-caption1">
          {typingCopy(
            typingUserIds
              .slice(0, 2)
              .map((id) => <SenderName key={id} senderId={id} />),
          )}
        </p>
      )}
    </div>
  );
};
