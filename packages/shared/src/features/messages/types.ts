import type { PublicProfile } from '../../lib/user';
import type { DirectMessageAccess } from './graphql';

export const DM_MAX_LENGTH = 2000;

export type DmPeer = Pick<
  PublicProfile,
  'id' | 'name' | 'image' | 'permalink' | 'bio'
> & {
  username: string;
  // Known when the peer was looked up as a daily.dev user; a peer taken from
  // the chat server's archive carries none.
  reputation?: number;
  // Unavailable when the peer turned direct messages off, or blocked the
  // viewer. The two are deliberately indistinguishable so a block is never
  // revealed.
  access: DirectMessageAccess;
  // Set on a group chat, such as a company page's support chat. The peer is
  // then the group itself and its id a synthetic one (see support.ts).
  group?: DmGroup;
};

export type DmGroupMember = Pick<
  PublicProfile,
  'id' | 'name' | 'image' | 'permalink'
> & { username: string };

export type DmGroup = {
  chatId: string;
  // The room on the chat server; null until it's created.
  roomJid: string | null;
  members: DmGroupMember[];
  // When the last message was sent, as the API knows it; null when none was.
  lastMessageAt: string | null;
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
type DmPostPreviewContent = {
  title?: string | null;
  image?: string | null;
  source?: { name: string } | null;
};

export type DmPostPreview = DmPostPreviewContent & {
  id: string;
  commentsPermalink: string;
  sharedPost?: DmPostPreviewContent | null;
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
  // When the sender last corrected it (XEP-0308).
  editedAt?: string;
};

// A correction replaces the body of an earlier message by the same sender;
// everything else about it (time, context, reactions) stays.
export type DmEdit = {
  peerId: string;
  senderId: string;
  messageId: string;
  body: string;
  editedAt: string;
};

// XEP-0085. Only `composing` and `paused` go over the wire here; the rest is
// what a peer's client may still send.
export type DmChatState =
  | 'active'
  | 'composing'
  | 'paused'
  | 'inactive'
  | 'gone';

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
  // A support chat's row shows before its last message loads; the
  // `conversationPreview` event fills it in.
  isPreviewLoading?: boolean;
};

export type DmEvent =
  | { type: 'message'; message: DmMessage }
  | { type: 'edit'; edit: DmEdit }
  | { type: 'reaction'; reaction: DmReaction }
  | { type: 'chatState'; peerId: string; state: DmChatState }
  // The server bounced an edit, or never acked it; the archive has the truth.
  | { type: 'editRejected'; peerId: string; messageId: string }
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
  | { type: 'reconnected' }
  // A support chat's last message, loaded after its inbox row. Null when it
  // couldn't be loaded in time.
  | { type: 'conversationPreview'; peerId: string; message: DmMessage | null }
  // A support chat message arrived whose sender the room hasn't named yet;
  // the archive has them, so the thread refetches.
  | { type: 'threadStale'; peerId: string };

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
  // Replaces the body of a message the viewer sent.
  edit: (peer: DmPeer, messageId: string, body: string) => Promise<void>;
  // Tells the peer whether the viewer is typing. Best effort: nothing waits
  // on it and nothing retries it.
  sendChatState: (peer: DmPeer, state: DmChatState) => Promise<void>;
  markRead: (peerId: string) => Promise<void>;
  // Picks up support chats created since the list was loaded and joins their
  // rooms. Only acts on a session that is already up.
  refreshSupportChats: () => void;
  subscribe: (listener: (event: DmEvent) => void) => () => void;
  // Ends the session for good, e.g. on logout.
  close: () => void;
}

// The intro note sent with a message request. Mirrors the API limit.
export const DM_REQUEST_MAX_LENGTH = 500;
