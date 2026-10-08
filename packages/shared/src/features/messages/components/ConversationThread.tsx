import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
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
import { IconSize } from '../../../components/Icon';
import { ShellPage } from '../../../components/shell/ShellPageContext';
import { ShellSquare } from '../../../components/shell/ShellSquare';
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
  dmConversationQueryOptions,
  dmThreadQueryOptions,
} from '../queries';
import { DirectMessageAccess } from '../graphql';
import { getDmTransport, supportsUnreadCounts } from '../transport';
import { DmAccess, getDmAccess } from '../access';
import { useDmSettings } from '../hooks/useDmSettings';
import { useSendMessage } from '../hooks/useSendMessage';
import { useReactToMessage } from '../hooks/useReactToMessage';
import type { DmMessage } from '../types';
import { DmMessageStatus } from '../types';
import { MessageComposer } from './MessageComposer';
import { DmAccessNotice } from './DmAccessNotice';
import { MessageRequestComposer } from './MessageRequestComposer';
import { MessageRequestResponse } from './MessageRequestResponse';
import { DmContextCard } from './DmContextCard';
import { MessageCommentRef } from './MessageCommentRef';
import { AddReactionButton, MessageReactions } from './MessageReactions';
import { parseMessageBody } from '../media';
import { getMessagesUrl } from '../urls';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LogEvent } from '../../../lib/log';

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
  viewerId,
  onRetry,
  onReact,
  onMediaLoad,
}: {
  message: DmMessage;
  isMine: boolean;
  isGroupEnd: boolean;
  peerUsername: string;
  viewerId: string;
  onRetry: (message: DmMessage) => void;
  onReact?: (message: DmMessage, emoji: string) => void;
  onMediaLoad: () => void;
}): ReactElement => {
  const parts = parseMessageBody(message.body);
  // Only a delivered message has the id a reaction refers to.
  const react =
    onReact && message.status === DmMessageStatus.Sent
      ? (emoji: string) => onReact(message, emoji)
      : undefined;
  const reactions = message.reactions ?? {};

  return (
    <FlexCol
      className={classNames('gap-1', isMine ? 'items-end' : 'items-start')}
    >
      {message.context && (
        <MessageCommentRef
          commentId={message.context.commentId}
          // A message I sent refers to the peer's comment, one I received to
          // mine.
          expectedAuthorId={isMine ? message.peerId : viewerId}
          label={isMine ? `@${peerUsername}'s comment` : 'Your comment'}
          className="w-full max-w-[85%] tablet:max-w-[30rem]"
        />
      )}
      <div
        className={classNames(
          'group flex w-full items-center gap-1',
          isMine ? 'flex-row-reverse' : 'flex-row',
        )}
      >
        <FlexCol
          className={classNames(
            'min-w-0 max-w-[85%] gap-1 tablet:max-w-[30rem]',
            isMine ? 'items-end' : 'items-start',
          )}
        >
          {parts.map((part, index) => {
            const isLast = index === parts.length - 1;
            const shape = classNames(
              isMine && isGroupEnd && isLast && 'rounded-br-4',
              !isMine && isGroupEnd && isLast && 'rounded-bl-4',
              message.status === DmMessageStatus.Sending && 'opacity-64',
            );

            if (part.type === 'image') {
              return (
                <a
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  href={part.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={formatTime(message.createdAt)}
                  className="block max-w-full tablet:max-w-[20rem]"
                >
                  <img
                    src={part.url}
                    alt={part.alt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onLoad={onMediaLoad}
                    className={classNames(
                      'max-h-80 max-w-full rounded-16 bg-surface-float object-contain',
                      shape,
                    )}
                  />
                </a>
              );
            }

            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                title={formatTime(message.createdAt)}
                className={classNames(
                  'max-w-full whitespace-pre-wrap break-words rounded-16 px-3 py-2 typo-callout',
                  isMine
                    ? 'bg-surface-float text-text-primary'
                    : 'border border-border-subtlest-tertiary text-text-primary',
                  shape,
                )}
              >
                {part.text}
              </div>
            );
          })}
        </FlexCol>
        {react && (
          <AddReactionButton
            onReact={react}
            className="mouse:invisible mouse:group-focus-within:visible mouse:group-hover:visible"
          />
        )}
      </div>
      {Object.keys(reactions).length > 0 && (
        <MessageReactions
          reactions={reactions}
          viewerId={viewerId}
          peerUsername={peerUsername}
          onToggle={react}
        />
      )}
      {message.status === DmMessageStatus.Failed && (
        <button
          type="button"
          className="text-status-error typo-caption1 hover:underline"
          onClick={() => onRetry(message)}
        >
          Not delivered · Retry
        </button>
      )}
      {message.status === DmMessageStatus.Rejected && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.StatusError}
        >
          Not delivered
        </Typography>
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
};

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  // Images finish loading after the jump to the newest message, so they'd
  // push it out of view unless the reader had scrolled up on purpose.
  const isAtBottomRef = useRef(true);
  const onMediaLoad = () => {
    const container = scrollRef.current;
    if (container && isAtBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  };
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
  const peerQuery = useQuery(dmPeerQueryOptions(user, peerId));
  const { data: peer, isPending: isPeerPending } = peerQuery;
  const threadQuery = useQuery(dmThreadQueryOptions(user, peerId));
  const { data: archived = [] } = threadQuery;
  const { data: pairing } = useQuery(dmConversationQueryOptions(user, peerId));
  const hasIncomingRequest = !!pairing?.isRequest && !pairing.createdByViewer;
  // The intro note lives in the API, not the chat archive, so it opens the
  // thread for both sides, before and after the request is accepted.
  const messages: DmMessage[] = pairing?.requestMessage
    ? [
        {
          id: `request-${pairing.id}`,
          peerId,
          senderId: pairing.createdByViewer ? user?.id ?? '' : peerId,
          body: pairing.requestMessage,
          createdAt: pairing.createdAt,
          status: DmMessageStatus.Sent,
        },
        ...archived,
      ]
    : archived;
  const isLoadError = peerQuery.isError || threadQuery.isError;
  useLogEventOnce(
    () => ({
      event_name: LogEvent.OpenDirectMessage,
      target_id: peerId,
      extra: JSON.stringify({ has_comment_ref: !!commentId }),
    }),
    { condition: !!peer },
  );
  // Only for the unread count; the real server has none yet, and loading the
  // inbox there costs an archive query per conversation.
  const { data: conversations } = useQuery({
    ...dmConversationsQueryOptions(user),
    enabled: supportsUnreadCounts && !!user?.id,
  });
  const { data: preference } = useContentPreferenceStatusQuery({
    id: peerId,
    entity: ContentPreferenceType.User,
  });
  const { block, unblock } = useContentPreference();
  const { allowsMessages } = useDmSettings();
  const { send, retry } = useSendMessage(peer);
  const react = useReactToMessage(peer);

  const isBlockedByMe = preference?.status === ContentPreferenceStatus.Blocked;
  const access = getDmAccess({
    isBlockedByMe,
    allowsMessages,
    peerAccess: peer?.access ?? DirectMessageAccess.Open,
    hasIncomingRequest,
  });
  const unreadCount =
    conversations?.find((conversation) => conversation.peer.id === peerId)
      ?.unreadCount ?? 0;
  const blockArgs = peer && {
    id: peer.id,
    entity: ContentPreferenceType.User,
    entityName: `@${peer.username}`,
  };
  const blockLabel = isBlockedByMe ? 'Unblock' : `Block @${peer?.username}`;
  const toggleBlock = () =>
    blockArgs && (isBlockedByMe ? unblock(blockArgs) : block(blockArgs));
  const backToInbox = useCallback(
    () => router.push(getMessagesUrl()),
    [router],
  );

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

  // The keyboard opening (or the composer growing) shrinks the list from
  // below; a reader at the newest message stays on it.
  const hasList = !!peer && !isLoadError;
  useEffect(() => {
    const container = scrollRef.current;
    if (!hasList || !container || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      if (isAtBottomRef.current) {
        container.scrollTop = container.scrollHeight;
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [hasList, peerId]);

  // On phones the shell's top block is the thread header, so there is one
  // back (to the inbox, not history) and no second bar under it.
  const shellPage = (
    <ShellPage
      title={
        peer && (
          <Link href={peer.permalink} passHref>
            <a className="flex min-w-0 items-center gap-2">
              <ProfilePicture user={peer} size={ProfileImageSize.Small} />
              <span className="truncate">{peer.name}</span>
            </a>
          </Link>
        )
      }
      actions={
        peer && (
          <ShellSquare
            aria-label={blockLabel}
            aria-pressed={isBlockedByMe}
            onClick={toggleBlock}
          >
            <BlockIcon size={IconSize.Small} secondary={isBlockedByMe} />
          </ShellSquare>
        )
      }
      onBack={backToInbox}
    />
  );

  // A network or chat-server failure is not the same as a missing user, so it
  // gets a way to try again instead of a dead end.
  if (isLoadError) {
    return (
      <FlexCol className="flex-1 items-center justify-center gap-3 px-6 text-center">
        {shellPage}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Couldn&apos;t load this conversation. Check your connection and try
          again.
        </Typography>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() => {
            peerQuery.refetch();
            threadQuery.refetch();
          }}
        >
          Try again
        </Button>
      </FlexCol>
    );
  }

  if (!isPeerPending && !peer) {
    return (
      <FlexCol className="flex-1 items-center justify-center px-6 text-center">
        {shellPage}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          This conversation isn&apos;t available.
        </Typography>
      </FlexCol>
    );
  }

  return (
    <FlexCol className="min-h-0 flex-1">
      {shellPage}
      <header className="hidden h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-3 tablet:flex tablet:px-4">
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
            <Tooltip content={blockLabel}>
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<BlockIcon secondary={isBlockedByMe} />}
                aria-label={blockLabel}
                aria-pressed={isBlockedByMe}
                onClick={toggleBlock}
              />
            </Tooltip>
          </>
        )}
      </header>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto"
        onScroll={({ currentTarget }) => {
          isAtBottomRef.current =
            currentTarget.scrollHeight -
              currentTarget.scrollTop -
              currentTarget.clientHeight <
            80;
        }}
      >
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
                viewerId={user?.id ?? ''}
                onRetry={retry}
                // A blocked peer or DMs turned off would bounce the reaction.
                onReact={access === DmAccess.Allowed ? react : undefined}
                onMediaLoad={onMediaLoad}
              />
            );
          })}
        </FlexCol>
      </div>
      {peer && access === DmAccess.RequestReceived && (
        <MessageRequestResponse peer={peer} />
      )}
      {peer && access === DmAccess.RequestRequired && (
        <div className="mx-auto w-full max-w-[45rem]">
          <MessageRequestComposer peer={peer} />
        </div>
      )}
      {peer &&
        access !== DmAccess.RequestReceived &&
        access !== DmAccess.RequestRequired &&
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
              // The comment reference belongs to the typed reply, so a GIF
              // picked first neither takes nor clears it.
              onSendGif={(body) => send(body)}
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
