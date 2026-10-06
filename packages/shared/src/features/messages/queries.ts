import { queryOptions } from '@tanstack/react-query';
import type { LoggedUser } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import { getDmTransport, isDmMockMode } from './transport';
import { getCanDirectMessage } from './graphql';
import type {
  DmCommentContext,
  DmConversation,
  DmMessage,
  DmPeer,
} from './types';
import { DM_CONTEXT_SNIPPET_LENGTH } from './types';

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

export const dmThreadQueryOptions = (user: QueryUser, peerId: string) =>
  queryOptions<DmMessage[]>({
    queryKey: dmThreadQueryKey(user, peerId),
    queryFn: () => getDmTransport(user!.id).getMessages(peerId),
    enabled: !!user?.id && !!peerId,
  });

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

      const [res, acceptsMessages] = await Promise.all([
        gqlClient.request<{
          user: Omit<DmPeer, 'acceptsMessages'> | null;
        }>(DM_PEER_QUERY, { id: peerId }),
        // The mock has no backend to ask, so every real user accepts there.
        isDmMockMode ? true : getCanDirectMessage(peerId),
      ]);

      return res.user ? { ...res.user, acceptsMessages } : null;
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
