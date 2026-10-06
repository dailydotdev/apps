import type { ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FlexCol } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ArrowIcon } from '../../../components/icons/Arrow';
import { BlockIcon } from '../../../components/icons/Block';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { webappUrl } from '../../../lib/constants';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from '../../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import {
  dmCommentContextQueryOptions,
  dmConversationsQueryKey,
  dmConversationsQueryOptions,
  dmPeerQueryOptions,
  dmThreadQueryOptions,
} from '../queries';
import { getDmTransport } from '../transport';
import { DmAccess, getDmAccess } from '../access';
import { useDmSettings } from '../hooks/useDmSettings';
import { useSendMessage } from '../hooks/useSendMessage';
import type { DmMessage } from '../types';
import { DmMessageStatus } from '../types';
import { MessageComposer } from './MessageComposer';
import { DmAccessNotice } from './DmAccessNotice';
import { DmContextCard } from './DmContextCard';

const formatTime = (value: string): string =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const MessageBubble = ({
  message,
  isMine,
  isGroupEnd,
  peerUsername,
  onRetry,
}: {
  message: DmMessage;
  isMine: boolean;
  isGroupEnd: boolean;
  peerUsername: string;
  onRetry: (message: DmMessage) => void;
}): ReactElement => (
  <FlexCol
    className={classNames('gap-1', isMine ? 'items-end' : 'items-start')}
  >
    {message.context && (
      <DmContextCard
        context={message.context}
        label={isMine ? `@${peerUsername}'s comment` : 'Your comment'}
        className="w-full max-w-[85%] tablet:max-w-[30rem]"
      />
    )}
    <div
      title={formatTime(message.createdAt)}
      className={classNames(
        'max-w-[85%] whitespace-pre-wrap break-words rounded-16 px-3 py-2 typo-callout tablet:max-w-[30rem]',
        isMine
          ? 'bg-surface-float text-text-primary'
          : 'border border-border-subtlest-tertiary text-text-primary',
        isMine && isGroupEnd && 'rounded-br-4',
        !isMine && isGroupEnd && 'rounded-bl-4',
        message.status === DmMessageStatus.Sending && 'opacity-64',
      )}
    >
      {message.body}
    </div>
    {message.status === DmMessageStatus.Failed && (
      <button
        type="button"
        className="text-status-error typo-caption1 hover:underline"
        onClick={() => onRetry(message)}
      >
        Not delivered · Retry
      </button>
    )}
    {isGroupEnd && message.status === DmMessageStatus.Sent && (
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
      >
        {formatTime(message.createdAt)}
      </Typography>
    )}
  </FlexCol>
);

export const ConversationThread = ({
  peerId,
  commentId,
  onCommentContextUsed,
}: {
  peerId: string;
  commentId?: string;
  onCommentContextUsed?: () => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isContextDismissed, setIsContextDismissed] = useState(false);
  const { data: commentContext } = useQuery(
    dmCommentContextQueryOptions(user, commentId),
  );
  // A link can carry any comment id, so only the peer's own comment counts.
  const pendingContext =
    !isContextDismissed && commentContext?.authorId === peerId
      ? commentContext
      : undefined;
  const clearContext = () => {
    setIsContextDismissed(true);
    onCommentContextUsed?.();
  };
  const { data: peer, isPending: isPeerPending } = useQuery(
    dmPeerQueryOptions(user, peerId),
  );
  const { data: messages = [] } = useQuery(dmThreadQueryOptions(user, peerId));
  const { data: conversations } = useQuery(dmConversationsQueryOptions(user));
  const { data: preference } = useContentPreferenceStatusQuery({
    id: peerId,
    entity: ContentPreferenceType.User,
  });
  const { block, unblock } = useContentPreference();
  const { allowsMessages } = useDmSettings();
  const { send, retry } = useSendMessage(peer);

  const isBlockedByMe = preference?.status === ContentPreferenceStatus.Blocked;
  const access = getDmAccess({
    isBlockedByMe,
    allowsMessages,
    peerAcceptsMessages: peer?.acceptsMessages ?? true,
  });
  const unreadCount =
    conversations?.find((conversation) => conversation.peer.id === peerId)
      ?.unreadCount ?? 0;

  useEffect(() => {
    if (!user || !unreadCount) {
      return;
    }

    getDmTransport(user.id)
      .markRead(peerId)
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: dmConversationsQueryKey(user),
        }),
      );
  }, [peerId, queryClient, unreadCount, user]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length, peerId]);

  if (!isPeerPending && !peer) {
    return (
      <FlexCol className="flex-1 items-center justify-center px-6 text-center">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          This conversation isn&apos;t available.
        </Typography>
      </FlexCol>
    );
  }

  const blockArgs = peer && {
    id: peer.id,
    entity: ContentPreferenceType.User,
    entityName: `@${peer.username}`,
  };

  return (
    <FlexCol className="min-h-0 flex-1">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-3 tablet:px-4">
        <Link href={`${webappUrl}messages`} passHref>
          <Button
            tag="a"
            className="laptop:hidden"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="-rotate-90" />}
            aria-label="Back to messages"
          />
        </Link>
        {peer && (
          <>
            <Link href={peer.permalink} passHref>
              <a className="flex min-w-0 flex-1 items-center gap-2">
                <ProfilePicture user={peer} size={ProfileImageSize.Medium} />
                <FlexCol className="min-w-0">
                  <Typography type={TypographyType.Callout} bold truncate>
                    {peer.name}
                  </Typography>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    truncate
                  >
                    @{peer.username}
                  </Typography>
                </FlexCol>
              </a>
            </Link>
            <Tooltip
              content={isBlockedByMe ? 'Unblock' : `Block @${peer.username}`}
            >
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<BlockIcon secondary={isBlockedByMe} />}
                aria-label={
                  isBlockedByMe ? 'Unblock' : `Block @${peer.username}`
                }
                aria-pressed={isBlockedByMe}
                onClick={() =>
                  blockArgs &&
                  (isBlockedByMe ? unblock(blockArgs) : block(blockArgs))
                }
              />
            </Tooltip>
          </>
        )}
      </header>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <FlexCol className="mx-auto w-full max-w-[45rem] gap-1.5 px-4 py-6 tablet:px-6">
          {messages.map((message, index) => {
            const next = messages[index + 1];

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isMine={message.senderId === user?.id}
                isGroupEnd={!next || next.senderId !== message.senderId}
                peerUsername={peer?.username ?? ''}
                onRetry={retry}
              />
            );
          })}
        </FlexCol>
      </div>
      {peer &&
        (access === DmAccess.Allowed ? (
          <div className="mx-auto w-full max-w-[45rem]">
            <MessageComposer
              username={peer.username}
              attachment={
                pendingContext && (
                  <DmContextCard
                    context={pendingContext}
                    label={`Replying to @${peer.username}'s comment`}
                    onDismiss={clearContext}
                  />
                )
              }
              onSend={(body) => {
                send(body, pendingContext);
                if (pendingContext) {
                  clearContext();
                }
              }}
            />
          </div>
        ) : (
          <DmAccessNotice
            access={access}
            onUnblock={() => blockArgs && unblock(blockArgs)}
          />
        ))}
    </FlexCol>
  );
};
