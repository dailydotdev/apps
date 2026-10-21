import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useShellState } from '../../../contexts/ShellStateContext';
import Link from '../../../components/utilities/Link';
import { useMessagesEnabled } from '../../messages/hooks/useMessagesEnabled';
import {
  dmConversationPeersQueryOptions,
  dmRequestCountQueryOptions,
  dmUnreadCountQueryOptions,
} from '../../messages/queries';
import { PendingConversationRow } from '../../messages/components/ConversationList';
import { DmOrigin, getMessagesUrl } from '../../messages/urls';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';

const rowsBySize: Record<FeedWidgetSize, number> = {
  [FeedWidgetSize.Small]: 1,
  [FeedWidgetSize.Tall]: 4,
  [FeedWidgetSize.Large]: 8,
};

const pluralize = (count: number, word: string): string =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

/**
 * The inbox as the API knows it: who, and how many unread. The last message
 * only comes over the chat connection, which the feed never opens, so the
 * rows show the unread state instead of a preview.
 */
export const MessagesWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.Messages>): ReactElement => {
  const { user } = useAuthContext();
  const { isSettled } = useShellState();
  const { isEnabled } = useMessagesEnabled();
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
        .slice(0, rowsBySize[size] ?? rowsBySize[FeedWidgetSize.Tall]),
    [conversations, size],
  );

  if (!isEnabled) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.Messages}
        message="Messages aren't available here."
      />
    );
  }

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      data-size={size}
    >
      <header className="flex items-center gap-2 px-4 pb-2">
        <h3 className="font-bold text-text-primary typo-title3">Messages</h3>
        {unreadCount > 0 && (
          <span
            aria-label={pluralize(unreadCount, 'unread conversation')}
            className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-8 bg-accent-cabbage-default px-1 font-bold tabular-nums text-white typo-footnote"
          >
            {unreadCount}
          </span>
        )}
      </header>
      {rows.length ? (
        <nav
          aria-label="Conversations"
          className={classNames(
            'grid min-h-0 flex-1 content-start gap-0.5 overflow-hidden px-1',
            size === FeedWidgetSize.Large ? 'grid-cols-2' : 'grid-cols-1',
          )}
        >
          {rows.map((conversation) => (
            <PendingConversationRow
              key={conversation.peer.id}
              conversation={conversation}
              origin={DmOrigin.FeedWidget}
              subtitle={
                conversation.unreadCount > 0
                  ? pluralize(conversation.unreadCount, 'new message')
                  : `@${conversation.peer.username}`
              }
            />
          ))}
        </nav>
      ) : (
        <FeedWidgetEmpty
          kind={FeedWidgetKind.Messages}
          isPending={isPending}
          message="No messages yet."
        />
      )}
      <footer className="flex items-center gap-3 px-4 pt-2 typo-callout">
        <Link href={getMessagesUrl(undefined, { origin: DmOrigin.FeedWidget })}>
          <a
            href={getMessagesUrl(undefined, { origin: DmOrigin.FeedWidget })}
            className="flex h-8 items-center text-text-secondary hover:text-text-primary"
          >
            Open messages
          </a>
        </Link>
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
              className="ml-auto flex h-8 items-center text-text-tertiary hover:text-text-primary"
            >
              {pluralize(requestCount, 'request')}
            </a>
          </Link>
        )}
      </footer>
    </div>
  );
};
