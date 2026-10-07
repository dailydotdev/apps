import type { QueryClient } from '@tanstack/react-query';
import { queryOptions } from '@tanstack/react-query';
import type { LoggedUser } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import {
  getDmTransport,
  isDmMockMode,
  supportsUnreadCounts,
} from './transport';
import {
  DirectMessageAccess,
  getDirectMessageAccess,
  getDirectMessageRequestCount,
  getDirectMessageRequests,
} from './graphql';
import type { DirectMessageConversation } from './graphql';
import type {
  DmCommentContext,
  DmConversation,
  DmMessage,
  DmPeer,
} from './types';
import { DM_CONTEXT_SNIPPET_LENGTH, DmMessageStatus } from './types';

type QueryUser = Pick<LoggedUser, 'id'> | undefined;

const DM_COMMENT_CONTEXT_QUERY = `
  query DmCommentContext($id: ID!) {
    comment(id: $id) {
      id
      content
      permalink
      author {
        id
      }
      post {
        title
      }
    }
  }
`;

type DmCommentContextData = {
  comment: {
    id: string;
    content: string;
    permalink: string;
    author: { id: string };
    post?: { title?: string };
  } | null;
};

const toSnippet = (content: string): string => {
  const flat = content.replace(/\s+/g, ' ').trim();

  return flat.length > DM_CONTEXT_SNIPPET_LENGTH
    ? `${flat.slice(0, DM_CONTEXT_SNIPPET_LENGTH - 1)}…`
    : flat;
};

const DM_PEER_QUERY = `
  query DmPeer($id: ID!) {
    user(id: $id) {
      id
      name
      image
      username
      permalink
    }
  }
`;

export const dmConversationsQueryKey = (user: QueryUser) =>
  generateQueryKey(RequestKey.DirectMessages, user, 'list');

export const dmThreadQueryKey = (user: QueryUser, peerId: string) =>
  generateQueryKey(RequestKey.DirectMessages, user, 'thread', {
    peerId,
  });

export const dmConversationsQueryOptions = (user: QueryUser) =>
  queryOptions<DmConversation[]>({
    queryKey: dmConversationsQueryKey(user),
    queryFn: () => getDmTransport(user!.id).listConversations(),
    enabled: !!user?.id,
  });

// Server copies win, but messages that never reached the server only exist
// in the cache, so no refetch may drop them.
export const mergeWithLocalMessages = (
  fromServer: DmMessage[],
  cached: DmMessage[] = [],
): DmMessage[] => {
  // A retried message shares its origin id with the original, so if both
  // copies reached the archive they collapse into one.
  const known = new Set<string>();
  const unique = fromServer.filter(({ id }) => {
    if (known.has(id)) {
      return false;
    }

    known.add(id);
    return true;
  });
  const localOnly = cached.filter(
    ({ id, status }) => status !== DmMessageStatus.Sent && !known.has(id),
  );

  return [...unique, ...localOnly];
};

export const dmThreadQueryOptions = (user: QueryUser, peerId: string) =>
  queryOptions<DmMessage[]>({
    queryKey: dmThreadQueryKey(user, peerId),
    // Merged at resolve time, so a bubble added while the fetch was in
    // flight survives too.
    queryFn: async ({ client, queryKey }) =>
      mergeWithLocalMessages(
        await getDmTransport(user!.id).getMessages(peerId),
        client.getQueryData<DmMessage[]>(queryKey),
      ),
    enabled: !!user?.id && !!peerId,
  });

// Moves the conversation to the top with its new last message instead of
// refetching the inbox, which costs one archive query per conversation on
// the real server. Returns false when the peer isn't in the cached list.
export const upsertConversationMessage = (
  client: QueryClient,
  user: QueryUser,
  message: DmMessage,
  { isIncoming }: { isIncoming: boolean },
): boolean => {
  const key = dmConversationsQueryKey(user);
  const conversations = client.getQueryData<DmConversation[]>(key);
  const existing = conversations?.find(
    ({ peer }) => peer.id === message.peerId,
  );

  if (!conversations || !existing) {
    return false;
  }

  client.setQueryData<DmConversation[]>(key, [
    {
      ...existing,
      lastMessage: message,
      unreadCount:
        existing.unreadCount + (isIncoming && supportsUnreadCounts ? 1 : 0),
    },
    ...conversations.filter((conversation) => conversation !== existing),
  ]);

  return true;
};

// A peer we already talk to comes from the conversation; anyone else, such as
// a profile's "Message" button, is looked up as a regular daily.dev user.
export const dmPeerQueryOptions = (user: QueryUser, peerId: string) =>
  queryOptions<DmPeer | null>({
    queryKey: generateQueryKey(RequestKey.DirectMessagePeer, user, peerId),
    queryFn: async () => {
      if (isDmMockMode) {
        const conversations = await getDmTransport(
          user!.id,
        ).listConversations();
        const known = conversations.find(({ peer }) => peer.id === peerId);
        if (known) {
          return known.peer;
        }
      }

      const [res, access] = await Promise.all([
        gqlClient.request<{
          user: Omit<DmPeer, 'access'> | null;
        }>(DM_PEER_QUERY, { id: peerId }),
        // The mock has no backend to ask, so every real user accepts there.
        isDmMockMode
          ? DirectMessageAccess.Open
          : getDirectMessageAccess(peerId),
      ]);

      return res.user ? { ...res.user, access } : null;
    },
    staleTime: StaleTime.Default,
    enabled: !!user?.id && !!peerId,
  });

export const dmCommentContextQueryOptions = (
  user: QueryUser,
  commentId: string | undefined,
) =>
  queryOptions<DmCommentContext | null>({
    queryKey: generateQueryKey(
      RequestKey.DirectMessages,
      user,
      'comment_context',
      { commentId },
    ),
    queryFn: async () => {
      const { comment } = await gqlClient.request<DmCommentContextData>(
        DM_COMMENT_CONTEXT_QUERY,
        { id: commentId },
      );

      return comment
        ? {
            type: 'comment',
            commentId: comment.id,
            authorId: comment.author.id,
            snippet: toSnippet(comment.content),
            permalink: comment.permalink,
            postTitle: comment.post?.title,
          }
        : null;
    },
    staleTime: StaleTime.Default,
    enabled: !!user?.id && !!commentId,
  });

export const dmRequestsQueryKey = (user: QueryUser) =>
  generateQueryKey(RequestKey.DirectMessages, user, 'requests');

export const dmRequestCountQueryKey = (user: QueryUser) =>
  generateQueryKey(RequestKey.DirectMessages, user, 'request_count');

// Requests live in the API, not the chat server, so the mock has the real ones
// too.
export const dmRequestsQueryOptions = (user: QueryUser) =>
  queryOptions<DirectMessageConversation[]>({
    queryKey: dmRequestsQueryKey(user),
    queryFn: getDirectMessageRequests,
    staleTime: StaleTime.Default,
    enabled: !!user?.id,
  });

export const dmRequestCountQueryOptions = (user: QueryUser) =>
  queryOptions<number>({
    queryKey: dmRequestCountQueryKey(user),
    queryFn: getDirectMessageRequestCount,
    staleTime: StaleTime.Default,
    enabled: !!user?.id,
  });

// After a request is sent, accepted or declined: the peer's access, the
// request lists and the inbox all change.
export const invalidateDmRequestQueries = (
  client: QueryClient,
  user: QueryUser,
  peerId: string,
): Promise<unknown> =>
  Promise.all([
    client.invalidateQueries({
      queryKey: generateQueryKey(RequestKey.DirectMessagePeer, user, peerId),
    }),
    client.invalidateQueries({ queryKey: dmRequestsQueryKey(user) }),
    client.invalidateQueries({ queryKey: dmRequestCountQueryKey(user) }),
    client.invalidateQueries({ queryKey: dmConversationsQueryKey(user) }),
  ]);
