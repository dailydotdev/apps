import type { CSSProperties, ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useShellState } from '../../../contexts/ShellStateContext';
import Link from '../../../components/utilities/Link';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { IconSize } from '../../../components/Icon';
import { MailIcon } from '../../../components/icons/Mail';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import { useMessagesEnabled } from '../../messages/hooks/useMessagesEnabled';
import type { DirectMessageConversation } from '../../messages/graphql';
import {
  dmConversationPeersQueryOptions,
  dmRequestCountQueryOptions,
  dmUnreadCountQueryOptions,
} from '../../messages/queries';
import { DmOrigin, getMessagesUrl } from '../../messages/urls';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';

// The list scrolls, so this covers every size.
const MAX_CONVERSATIONS = 12;

// The widget's own material: conversation, two soft bubbles of color.
const inboxStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(60% 45% at 100% 100%, color-mix(in srgb, var(--theme-accent-cabbage-default) 18%, transparent) 0%, transparent 70%), radial-gradient(50% 40% at 0% 100%, color-mix(in srgb, var(--theme-accent-water-default) 14%, transparent) 0%, transparent 70%)',
};

const pluralize = (count: number, word: string): string =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

const inboxHref = getMessagesUrl(undefined, { origin: DmOrigin.FeedWidget });

const conversationHref = (conversation: DirectMessageConversation): string =>
  getMessagesUrl(conversation.peer.id, { origin: DmOrigin.FeedWidget });

/** What a row says in place of a preview, which only the chat carries. */
const subtitleOf = (conversation: DirectMessageConversation): string => {
  if (conversation.unreadCount > 0) {
    return pluralize(conversation.unreadCount, 'new message');
  }
  return conversation.requestMessage || `@${conversation.peer.username}`;
};

const ConversationRow = ({
  conversation,
}: {
  conversation: DirectMessageConversation;
}): ReactElement => {
  const isUnread = conversation.unreadCount > 0;
  const href = conversationHref(conversation);

  return (
    <li className="snap-start">
      <Link href={href} passHref>
        <a
          href={href}
          className="flex items-start gap-2.5 rounded-12 px-2 py-1.5 transition-colors duration-150 hover:bg-surface-hover motion-reduce:transition-none"
        >
          <ProfilePicture
            user={conversation.peer}
            size={ProfileImageSize.Medium}
            rounded="full"
            nativeLazyLoading
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span
              className={classNames(
                'min-w-0 truncate text-text-primary typo-footnote',
                isUnread && 'font-bold',
              )}
            >
              {conversation.peer.name}
            </span>
            <span
              className={classNames(
                'line-clamp-2 typo-caption1',
                isUnread ? 'text-text-primary' : 'text-text-tertiary',
              )}
            >
              {subtitleOf(conversation)}
            </span>
          </span>
          {isUnread && (
            <span
              aria-label={`${conversation.unreadCount} unread`}
              className="mt-1.5 size-2 shrink-0 rounded-max bg-accent-cabbage-default"
            />
          )}
        </a>
      </Link>
    </li>
  );
};

/** The newest conversation, open beside the inbox at Large. */
const LatestConversation = ({
  conversation,
}: {
  conversation: DirectMessageConversation;
}): ReactElement => {
  const href = conversationHref(conversation);
  const hasNote = !!conversation.requestMessage;

  return (
    <div className="flex w-1/2 shrink-0 flex-col border-l border-border-subtlest-tertiary px-4">
      <div className="flex h-6 shrink-0 items-center gap-2">
        <ProfilePicture
          user={conversation.peer}
          size={ProfileImageSize.Small}
          rounded="full"
          nativeLazyLoading
        />
        <span className="min-w-0 truncate font-bold text-text-primary typo-caption1">
          {conversation.peer.name}
        </span>
        <span className="shrink-0 text-text-quaternary typo-caption1">
          @{conversation.peer.username}
        </span>
      </div>
      <div className="mt-auto flex flex-col gap-3">
        <span
          className={classNames(
            'max-w-[85%] self-start rounded-12 rounded-bl-4 border border-border-subtlest-tertiary px-3 py-2 text-text-primary typo-footnote',
            !hasNote && 'font-bold',
          )}
        >
          {hasNote ? conversation.requestMessage : subtitleOf(conversation)}
        </span>
        <Link href={href} passHref>
          <Button
            tag="a"
            href={href}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            className="self-start"
          >
            Open conversation
          </Button>
        </Link>
      </div>
    </div>
  );
};

/**
 * The inbox as the API knows it: who, and how many unread. The last message
 * only comes over the chat connection, which the feed never opens, so rows
 * say how many are new, or the request's note, in place of a preview.
 */
export const MessagesWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.Messages>): ReactElement => {
  const { user } = useAuthContext();
  const { isSettled } = useShellState();
  const { isEnabled } = useMessagesEnabled();
  const scroll = useWidgetScroll();
  // The shell state seeds both counts; these only fetch as a fallback.
  const { data: unreadCount = 0 } = useQuery({
    ...dmUnreadCountQueryOptions(user),
    enabled: isEnabled && isSettled && !!user?.id,
  });
  const { data: requestCount = 0 } = useQuery({
    ...dmRequestCountQueryOptions(user),
    enabled: isEnabled && isSettled && !!user?.id,
  });
  const peersQuery = dmConversationPeersQueryOptions(user);
  const { data: conversations, isPending } = useQuery({
    ...peersQuery,
    enabled: isEnabled && peersQuery.enabled,
  });

  // The API orders by when a conversation started, so the ones waiting on
  // the reader lead.
  const rows = useMemo(
    () =>
      [...(conversations ?? [])]
        .sort((a, b) => Number(b.unreadCount > 0) - Number(a.unreadCount > 0))
        .slice(0, MAX_CONVERSATIONS),
    [conversations],
  );

  if (!isEnabled) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.Messages}
        message="Messages aren't available here."
      />
    );
  }

  const isLarge = size === FeedWidgetSize.Large && rows.length > 0;
  const inbox = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
        {unreadCount > 0 ? (
          <span
            aria-label={pluralize(unreadCount, 'unread conversation')}
            className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-6 bg-accent-cabbage-default px-1.5 font-bold tabular-nums text-white typo-caption2"
          >
            {unreadCount}
          </span>
        ) : (
          <MailIcon
            secondary
            size={IconSize.Size16}
            className="shrink-0 text-accent-cheese-default"
          />
        )}
        <span className="truncate font-bold text-text-primary typo-caption1">
          Messages
        </span>
        {requestCount > 0 && (
          <Link
            href={getMessagesUrl(undefined, {
              requests: true,
              origin: DmOrigin.FeedWidget,
            })}
          >
            <a
              href={getMessagesUrl(undefined, {
                requests: true,
                origin: DmOrigin.FeedWidget,
              })}
              className="shrink-0 text-text-tertiary typo-caption1 hover:text-text-primary"
            >
              {pluralize(requestCount, 'request')}
            </a>
          </Link>
        )}
        <Link href={inboxHref} passHref>
          <Button
            tag="a"
            href={inboxHref}
            variant={ButtonVariant.Primary}
            size={ButtonSize.XSmall}
            className="ml-auto"
          >
            Open
          </Button>
        </Link>
      </header>
      {rows.length ? (
        <div
          ref={scroll.ref}
          onScroll={scroll.onScroll}
          style={scroll.style}
          className={classNames('mt-2 px-2', scroll.className)}
        >
          <ul aria-label="Conversations" className="flex flex-col gap-1">
            {rows.map((conversation) => (
              <ConversationRow
                key={conversation.peer.id}
                conversation={conversation}
              />
            ))}
          </ul>
        </div>
      ) : (
        <FeedWidgetEmpty
          kind={FeedWidgetKind.Messages}
          isPending={isPending}
          message="No messages yet."
        />
      )}
    </div>
  );

  return (
    <div
      className="relative isolate flex min-h-0 min-w-0 flex-1"
      data-size={size}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-1"
        style={inboxStyle}
      />
      {inbox}
      {isLarge && <LatestConversation conversation={rows[0]} />}
    </div>
  );
};
