import type { PublicProfile } from '../../lib/user';
import type { DirectMessageAccess } from './graphql';

export const DM_MAX_LENGTH = 2000;

export type DmPeer = Pick<
  PublicProfile,
  'id' | 'name' | 'image' | 'permalink' | 'bio'
> & {
  username: string;
  // Unavailable when the peer turned direct messages off, or blocked the
  // viewer. The two are deliberately indistinguishable so a block is never
  // revealed.
  access: DirectMessageAccess;
};

export enum DmMessageStatus {
  Sending = 'sending',
  Sent = 'sent',
  Failed = 'failed',
  // Refused for good (peer unavailable, daily limit), so retrying is pointless.
  Rejected = 'rejected',
}

// Carried as a snapshot so the card still reads after the comment is edited
// or deleted.
export type DmPostPreview = {
  id: string;
  title?: string | null;
  image?: string | null;
  commentsPermalink: string;
  source?: { name: string } | null;
};

export const DM_CONTEXT_SNIPPET_LENGTH = 280;

export type DmCommentContext = {
  type: 'comment';
  commentId: string;
  authorId: string;
  snippet: string;
  permalink: string;
  postTitle?: string;
};

// Emoji to the ids of the users who reacted with it, in reaction order.
export type DmReactions = Record<string, string[]>;

export const DM_MAX_REACTIONS_PER_USER = 10;

export type DmMessage = {
  id: string;
  peerId: string;
  senderId: string;
  body: string;
  createdAt: string;
  status: DmMessageStatus;
  context?: DmCommentContext;
  reactions?: DmReactions;
};

// XEP-0444: each reaction stanza carries the sender's full set for a message,
// so an empty set clears it.
export type DmReaction = {
  peerId: string;
  senderId: string;
  messageId: string;
  emojis: string[];
};

export type DmConversation = {
  peer: DmPeer;
  lastMessage: DmMessage;
  unreadCount: number;
};

export type DmEvent =
  | { type: 'message'; message: DmMessage }
  | { type: 'reaction'; reaction: DmReaction }
  // The server bounced one of our reactions, so the optimistic copy is wrong.
  | { type: 'reactionRejected'; peerId: string }
  // The server acknowledged a message we sent (XEP-0198), so it can't be lost.
  | { type: 'sent'; peerId: string; messageId: string }
  // No acknowledgement arrived in time; the user can retry.
  | { type: 'failed'; peerId: string; messageId: string }
  // The server bounced a message after it left the client, e.g. because the
  // peer blocked the sender or turned direct messages off.
  | { type: 'rejected'; peerId: string; messageId: string }
  // The connection came back; anything that arrived meanwhile is only in the
  // archive, so cached threads must refetch.
  | { type: 'reconnected' };

// The seam the ejabberd client will implement: everything the UI needs goes
// through here, so swapping the mock for XMPP leaves the components untouched.
export interface DmTransport {
  listConversations: () => Promise<DmConversation[]>;
  getMessages: (peerId: string) => Promise<DmMessage[]>;
  send: (
    peer: DmPeer,
    body: string,
    context?: DmCommentContext,
    // Retrying a failed message keeps its id, so a copy that still reaches
    // the server can't arrive as a second message.
    options?: { retryOf?: string },
  ) => Promise<DmMessage>;
  // Replaces the viewer's reactions on a message with `emojis`.
  react: (peer: DmPeer, messageId: string, emojis: string[]) => Promise<void>;
  markRead: (peerId: string) => Promise<void>;
  subscribe: (listener: (event: DmEvent) => void) => () => void;
  // Ends the session for good, e.g. on logout.
  close: () => void;
}

// The intro note sent with a message request. Mirrors the API limit.
export const DM_REQUEST_MAX_LENGTH = 280;
