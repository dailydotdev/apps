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

// A message in a live chat room (XEP-0045). Rooms keep no archive, so what a
// joiner sees is the room's recent history replayed on join plus what
// arrives while they are in it.
export type RoomMessage = {
  id: string;
  roomJid: string;
  senderId: string;
  body: string;
  createdAt: string;
  // Replayed on join rather than received live.
  isHistory?: boolean;
  reactions?: DmReactions;
};

export type RoomJoinFailure = 'banned' | 'full' | 'gone' | 'unknown';

export type RoomEvent =
  | { type: 'roomMessage'; message: RoomMessage }
  // A sender's full set of reactions on a room message (XEP-0444).
  | {
      type: 'roomReaction';
      roomJid: string;
      senderId: string;
      messageId: string;
      emojis: string[];
    }
  | {
      type: 'roomChatState';
      roomJid: string;
      senderId: string;
      state: DmChatState;
    }
  // The room confirmed the viewer is in.
  | { type: 'roomJoined'; roomJid: string }
  // The viewer is out: they left, or a moderator removed them.
  | { type: 'roomLeft'; roomJid: string }
  | { type: 'roomJoinFailed'; roomJid: string; reason: RoomJoinFailure }
  // The room was destroyed; nothing in it survives.
  | { type: 'roomEnded'; roomJid: string };

export const isRoomEvent = (event: { type: string }): event is RoomEvent =>
  event.type.startsWith('room');

export type DmConversation = {
  peer: DmPeer;
  lastMessage: DmMessage;
  unreadCount: number;
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
  | RoomEvent;

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
  subscribe: (listener: (event: DmEvent) => void) => () => void;
  // Live chat rooms, over the same session. Joining replays the room's
  // recent history as `roomMessage` events and resolves once the join is
  // sent; `roomJoined` confirms it. A joined room is rejoined after a
  // reconnect until it is left.
  joinRoom: (roomJid: string) => Promise<void>;
  leaveRoom: (roomJid: string) => Promise<void>;
  // Resolves with the optimistic copy; the room reflects it back as a
  // `roomMessage` with the same id.
  sendRoomMessage: (roomJid: string, body: string) => Promise<RoomMessage>;
  sendRoomChatState: (roomJid: string, state: DmChatState) => Promise<void>;
  // Replaces the viewer's reactions on a room message with `emojis`; the
  // room reflects it back as a `roomReaction`.
  sendRoomReaction: (
    roomJid: string,
    messageId: string,
    emojis: string[],
  ) => Promise<void>;
  // Ends the session for good, e.g. on logout.
  close: () => void;
}

// The intro note sent with a message request. Mirrors the API limit.
export const DM_REQUEST_MAX_LENGTH = 500;
