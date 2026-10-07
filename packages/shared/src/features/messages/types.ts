import type { PublicProfile } from '../../lib/user';

export const DM_MAX_LENGTH = 2000;

export type DmPeer = Pick<
  PublicProfile,
  'id' | 'name' | 'image' | 'permalink'
> & {
  username: string;
  // False when the peer turned direct messages off, or blocked the viewer. The
  // two are deliberately indistinguishable so a block is never revealed.
  acceptsMessages: boolean;
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
export const DM_CONTEXT_SNIPPET_LENGTH = 280;

export type DmCommentContext = {
  type: 'comment';
  commentId: string;
  authorId: string;
  snippet: string;
  permalink: string;
  postTitle?: string;
};

export type DmMessage = {
  id: string;
  peerId: string;
  senderId: string;
  body: string;
  createdAt: string;
  status: DmMessageStatus;
  context?: DmCommentContext;
};

export type DmConversation = {
  peer: DmPeer;
  lastMessage: DmMessage;
  unreadCount: number;
};

export type DmEvent =
  | { type: 'message'; message: DmMessage }
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
  ) => Promise<DmMessage>;
  markRead: (peerId: string) => Promise<void>;
  subscribe: (listener: (event: DmEvent) => void) => () => void;
  // Ends the session for good, e.g. on logout.
  close: () => void;
}
