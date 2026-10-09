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
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  getReadHistoryDateFormat,
  isDateOnlyEqual,
} from '../../../lib/dateFormat';
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
  dmPeerQueryOptions,
  dmConversationQueryOptions,
  dmThreadQueryOptions,
} from '../queries';
import { DirectMessageAccess } from '../graphql';
import { DmAccess, getDmAccess } from '../access';
import { useDmSettings } from '../hooks/useDmSettings';
import { useSendMessage } from '../hooks/useSendMessage';
import { useReactToMessage } from '../hooks/useReactToMessage';
import { useMarkThreadRead } from '../hooks/useMarkThreadRead';
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
import { findPostIdInText, splitLinks } from '../messageLinks';
import { getMessagesUrl } from '../urls';
import type { DmOrigin } from '../urls';
import { MessagePostPreview } from './MessagePostPreview';
import { ConversationIntro } from './ConversationIntro';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LogEvent } from '../../../lib/log';

const formatTime = (value: string): string =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const toDate = (value?: string): Date | undefined => {
  const date = value ? new Date(value) : undefined;

  return date && !Number.isNaN(date.getTime()) ? date : undefined;
};

const isSameDay = (left?: string, right?: string): boolean => {
  const leftDate = toDate(left);
  const rightDate = toDate(right);

  return !!leftDate && !!rightDate && isDateOnlyEqual(leftDate, rightDate);
};

const DaySeparator = ({ date }: { date: Date }): ReactElement => {
  const label = getReadHistoryDateFormat(date);

  return (
    <div
      role="separator"
      aria-label={label}
      className="flex items-center gap-3 py-3"
    >
      <span className="h-px flex-1 bg-border-subtlest-tertiary" />
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {label}
      </Typography>
      <span className="h-px flex-1 bg-border-subtlest-tertiary" />
    </div>
  );
};

const MessageText = ({ text }: { text: string }): ReactElement => (
  <>
    {splitLinks(text).map((segment, index) =>
      segment.type === 'link' ? (
        <a
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          href={segment.url}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          className="break-all text-text-link underline"
        >
          {segment.url}
        </a>
      ) : (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={index}>{segment.text}</React.Fragment>
      ),
    )}
  </>
);

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
  const postId = findPostIdInText(
    parts.map((part) => (part.type === 'text' ? part.text : '')).join('\n'),
  );
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
                  title={formatDateTime(message.createdAt)}
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
                title={formatDateTime(message.createdAt)}
                className={classNames(
                  'max-w-full whitespace-pre-wrap break-words rounded-16 px-3 py-2 typo-callout',
                  isMine
                    ? 'bg-surface-float text-text-primary'
                    : 'border border-border-subtlest-tertiary text-text-primary',
                  shape,
                )}
              >
                <MessageText text={part.text} />
              </div>
            );
          })}
          {postId && (
            <MessagePostPreview
              postId={postId}
              className="w-full tablet:w-[20rem]"
            />
          )}
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
  origin,
  onCommentContextUsed,
}: {
  peerId: string;
  commentId?: string;
  origin?: DmOrigin;
  onCommentContextUsed?: () => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const router = useRouter();
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
  // The URL drops the origin once the page has read it, so the first value is
  // the one that's logged.
  const [openOrigin] = useState(origin);
  const [isFarFromBottom, setIsFarFromBottom] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const renderedCountRef = useRef(0);
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
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const isLoadError = peerQuery.isError || threadQuery.isError;
  // Decided on the first load only, so the intro stays put once the first
  // message lands instead of vanishing under it.
  const startedEmptyRef = useRef<boolean>();
  if (startedEmptyRef.current === undefined && threadQuery.isSuccess) {
    startedEmptyRef.current = archived.length === 0;
  }
  useLogEventOnce(
    () => ({
      event_name: LogEvent.OpenDirectMessage,
      target_id: peerId,
      extra: JSON.stringify({
        has_comment_ref: !!commentId,
        origin: openOrigin ?? null,
      }),
    }),
    { condition: !!peer },
  );
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
  useMarkThreadRead({
    peerId,
    lastIncomingId: [...archived]
      .reverse()
      .find(({ senderId }) => senderId === peerId)?.id,
    isLoaded: threadQuery.isSuccess,
  });
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

  // The first load and the viewer's own messages jump to the newest one. A
  // message arriving while the viewer reads further up waits behind the
  // "new messages" button instead of pulling them down.
  useLayoutEffect(() => {
    const { current } = messagesRef;
    const previousCount = renderedCountRef.current;
    renderedCountRef.current = current.length;
    const container = scrollRef.current;

    if (!container || current.length <= previousCount) {
      return;
    }

    const isOwn = current[current.length - 1]?.senderId === user?.id;

    if (!previousCount || isOwn || isAtBottomRef.current) {
      container.scrollTop = container.scrollHeight;
      return;
    }

    const arrived = current
      .slice(previousCount)
      .filter(({ senderId }) => senderId === peerId).length;
    setUnseenCount((count) => count + arrived);
  }, [messages.length, peerId, user?.id]);

  const jumpToLatest = () => {
    const container = scrollRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  };
  const showJump = isFarFromBottom || unseenCount > 0;

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
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto"
          onScroll={({ currentTarget }) => {
            const distance =
              currentTarget.scrollHeight -
              currentTarget.scrollTop -
              currentTarget.clientHeight;
            isAtBottomRef.current = distance < 80;
            setIsFarFromBottom(distance > currentTarget.clientHeight);
            if (isAtBottomRef.current) {
              setUnseenCount(0);
            }
          }}
        >
          <FlexCol className="mx-auto w-full max-w-[45rem] gap-1.5 px-4 py-6 tablet:px-6">
            {peer && startedEmptyRef.current && (
              <ConversationIntro peer={peer} />
            )}
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const next = messages[index + 1];
              const day = toDate(message.createdAt);
              const isNewDay =
                !!day && !isSameDay(previous?.createdAt, message.createdAt);

              return (
                <React.Fragment key={message.id}>
                  {isNewDay && <DaySeparator date={day} />}
                  <MessageBubble
                    message={message}
                    isMine={message.senderId === user?.id}
                    isGroupEnd={
                      !next ||
                      next.senderId !== message.senderId ||
                      !isSameDay(message.createdAt, next.createdAt)
                    }
                    peerUsername={peer?.username ?? ''}
                    viewerId={user?.id ?? ''}
                    onRetry={retry}
                    // A blocked peer or DMs turned off would bounce the
                    // reaction.
                    onReact={access === DmAccess.Allowed ? react : undefined}
                    onMediaLoad={onMediaLoad}
                  />
                </React.Fragment>
              );
            })}
          </FlexCol>
        </div>
        {showJump && (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="rotate-180" />}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-2"
            aria-label={unseenCount > 0 ? undefined : 'Jump to latest'}
            onClick={jumpToLatest}
          >
            {unseenCount > 0
              ? `${unseenCount} new ${
                  unseenCount === 1 ? 'message' : 'messages'
                }`
              : undefined}
          </Button>
        )}
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
