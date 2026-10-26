import type * as StropheNamespace from 'strophe.js';
import type {
  DmConversation,
  DmEvent,
  DmMessage,
  DmTransport,
  RoomMessage,
} from './types';
import { DmMessageStatus } from './types';
import {
  DirectMessageAccess,
  getDirectMessageConversations,
  getDirectMessageToken,
  markDirectMessageSent,
  markDirectMessagesRead,
  startDirectMessage,
} from './graphql';
import { getMessagePushPreview } from './media';
import { createStreamManagementStorage } from './streamManagementStorage';
import {
  NS_CARBONS,
  NS_CHAT_STATES,
  NS_COMMENT_REF,
  NS_CORRECT,
  NS_DATA,
  NS_HINTS,
  NS_MAM,
  NS_REACTIONS,
  NS_RSM,
  NS_SID,
  applyEdit,
  applyReaction,
  bareJid,
  isMamResult,
  jidForUser,
  parseChatMessage,
  parseChatState,
  parseCorrection,
  parseMamResult,
  parseReaction,
  unwrapCarbon,
} from './stanzas';
import {
  NS_MUC,
  ROOM_HISTORY_STANZAS,
  occupantJid,
  parseRoomChatState,
  parseRoomMessage,
  parseRoomPresence,
  parseRoomReaction,
} from './muc';

// ejabberd over the websocket. daily-api hands out the login token and opens
// conversations; this only ever talks XMPP, never to skirnir directly.

type StropheModule = typeof StropheNamespace;
type Connection = InstanceType<StropheModule['Strophe']['Connection']>;

type Session = {
  strophe: StropheModule;
  connection: Connection;
  ownBareJid: string;
  domain: string;
};

type PendingAck = {
  peerId: string;
  failTimer: ReturnType<typeof setTimeout>;
} & (
  | { kind: 'message'; preview: string }
  // An edit of `messageId`; the stanza id is the key.
  | { kind: 'edit'; messageId: string }
);

const NS_SM = 'urn:xmpp:sm:3';
const historyPageSize = 50;
// Reactions are archived too, so the latest message can sit behind a few.
const inboxPageSize = 10;
const errorWatchMs = 60 * 1000;
// A message without a server ack by then is shown as failed; a late ack (e.g.
// after the session resumes) still flips it back to sent.
const ackTimeoutMs = 15 * 1000;
const maxReconnectDelayMs = 30 * 1000;
const maxReconnectAttempts = 8;
const iqTimeoutMs = 10 * 1000;

const stanzaIdPattern = /\sid="([^"]+)"/;

export const createXmppTransport = ({
  userId,
  url,
}: {
  userId: string;
  url: string;
}): DmTransport => {
  const listeners = new Set<(event: DmEvent) => void>();
  // One startDirectMessage per peer, shared by concurrent sends so the first
  // messages to someone new go out in the order they were written.
  const openingPeers = new Map<string, Promise<void>>();
  const pendingAcks = new Map<string, PendingAck>();
  let session: Session | null = null;
  let connecting: Promise<Session> | null = null;
  let rejectConnecting: ((error: Error) => void) | undefined;
  // Callbacks from a replaced connection must not touch the current one, or a
  // late disconnect would tear it down and open a second socket.
  let activeConnection: Connection | null = null;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let isClosed = false;
  // Rooms the viewer is in, rejoined after a reconnect until they leave.
  const joinedRooms = new Set<string>();

  const emit = (event: DmEvent) =>
    listeners.forEach((listener) => listener(event));

  const sendJoin = (
    { strophe, connection }: Pick<Session, 'strophe' | 'connection'>,
    roomJid: string,
  ) =>
    connection.send(
      strophe
        .$pres({ to: occupantJid(roomJid, userId) })
        .c('x', { xmlns: NS_MUC })
        .c('history', { maxstanzas: String(ROOM_HISTORY_STANZAS) }),
    );

  // Only the viewer's own room presence matters (see parseRoomPresence).
  const onPresence = (stanza: Element): boolean => {
    const presence = parseRoomPresence(stanza);
    if (!presence) {
      return true;
    }

    if (presence.kind === 'joined') {
      emit({ type: 'roomJoined', roomJid: presence.roomJid });
    } else if (presence.kind === 'left') {
      joinedRooms.delete(presence.roomJid);
      emit({ type: 'roomLeft', roomJid: presence.roomJid });
    } else if (presence.kind === 'ended') {
      joinedRooms.delete(presence.roomJid);
      emit({ type: 'roomEnded', roomJid: presence.roomJid });
    } else {
      joinedRooms.delete(presence.roomJid);
      emit({
        type: 'roomJoinFailed',
        roomJid: presence.roomJid,
        reason: presence.reason,
      });
    }

    return true;
  };

  const onMessage =
    (ownBareJid: string) =>
    (stanza: Element): boolean => {
      // Archive results belong to the query that asked for them.
      if (isMamResult(stanza)) {
        return true;
      }

      // Room traffic never concerns a direct message thread.
      if (stanza.getAttribute('type') === 'groupchat') {
        const roomMessage = parseRoomMessage(stanza);
        const roomReaction = !roomMessage && parseRoomReaction(stanza);
        const roomState =
          !roomMessage && !roomReaction && parseRoomChatState(stanza);
        if (roomMessage) {
          emit({ type: 'roomMessage', message: roomMessage });
        } else if (roomReaction) {
          emit({ type: 'roomReaction', ...roomReaction });
        } else if (roomState && roomState.senderId !== userId) {
          emit({ type: 'roomChatState', ...roomState });
        }
        return true;
      }

      const carbon = unwrapCarbon(stanza, ownBareJid);
      const payload = carbon === undefined ? stanza : carbon;
      const message = payload && parseChatMessage(payload, { ownBareJid });
      const edit =
        payload && !message && parseCorrection(payload, { ownBareJid });
      const reaction =
        payload && !message && !edit && parseReaction(payload, ownBareJid);
      const chatState =
        payload &&
        !message &&
        !edit &&
        !reaction &&
        parseChatState(payload, ownBareJid);

      if (message) {
        emit({ type: 'message', message });
      } else if (edit) {
        emit({ type: 'edit', edit });
      } else if (reaction) {
        emit({ type: 'reaction', reaction });
      } else if (chatState && chatState.senderId !== userId) {
        // Our other sessions' typing arrives as carbons; it isn't the peer's.
        emit({
          type: 'chatState',
          peerId: chatState.peerId,
          state: chatState.state,
        });
      }

      // Returning true keeps the handler registered.
      return true;
    };

  // Strophe's own handler reconciles its unacked queue first, so any pending
  // message no longer in it has reached the server.
  const onAck = (connection: Connection) => (): boolean => {
    const unacked = new Set(
      (connection.sm?.state.unacked ?? []).map(
        ({ stanza }: { stanza: string }) => stanzaIdPattern.exec(stanza)?.[1],
      ),
    );

    pendingAcks.forEach((pending, stanzaId) => {
      if (unacked.has(stanzaId)) {
        return;
      }

      clearTimeout(pending.failTimer);
      pendingAcks.delete(stanzaId);

      // An edit changes nothing the peer hasn't been told about, so it
      // neither counts as unread nor pushes.
      if (pending.kind === 'edit') {
        return;
      }

      emit({ type: 'sent', peerId: pending.peerId, messageId: stanzaId });
      // Feeds the peer's unread count and push. Losing one only leaves a
      // badge a message short, so it isn't retried.
      markDirectMessageSent(pending.peerId, pending.preview || undefined).catch(
        () => undefined,
      );
    });

    return true;
  };

  // Arms (or re-arms) the "no ack in time" fallback. The entry outlives the
  // timeout so a late ack after a resume still flips the message to sent.
  const watchAck = (messageId: string, peerId: string, preview: string) => {
    clearTimeout(pendingAcks.get(messageId)?.failTimer);
    pendingAcks.set(messageId, {
      kind: 'message',
      peerId,
      preview,
      failTimer: setTimeout(
        () => emit({ type: 'failed', peerId, messageId }),
        ackTimeoutMs,
      ),
    });
  };

  // An edit that isn't acked in time is reported as rejected: the optimistic
  // copy goes, and if the queued stanza still lands after a resume the
  // archive shows it on the next load.
  const watchEditAck = (stanzaId: string, peerId: string, messageId: string) =>
    pendingAcks.set(stanzaId, {
      kind: 'edit',
      peerId,
      messageId,
      failTimer: setTimeout(() => {
        pendingAcks.delete(stanzaId);
        emit({ type: 'editRejected', peerId, messageId });
      }, ackTimeoutMs),
    });

  const scheduleReconnect = () => {
    // After the cap the next user action (opening messages, sending) tries
    // again instead of retrying in the background forever.
    if (
      isClosed ||
      !listeners.size ||
      reconnectTimer ||
      reconnectAttempt >= maxReconnectAttempts
    ) {
      return;
    }

    const delay = Math.min(1000 * 2 ** reconnectAttempt, maxReconnectDelayMs);
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = undefined;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      ensureSession()
        .then(() => emit({ type: 'reconnected' }))
        .catch(scheduleReconnect);
    }, delay);
  };

  const connect = async (): Promise<Session> => {
    const [strophe, token] = await Promise.all([
      import('strophe.js'),
      getDirectMessageToken(),
    ]);

    // Logging out while the token was in flight must not open a socket.
    if (isClosed) {
      throw new Error('Chat transport is closed');
    }

    const { Strophe, $pres, $iq } = strophe;
    const ownBareJid = bareJid(token.jid);

    return new Promise((resolve, reject) => {
      rejectConnecting = reject;
      const connection = new Strophe.Connection(url, {
        // The token is only valid as an X-OAUTH2 password; letting Strophe
        // pick SCRAM or PLAIN by priority would send it to the wrong mechanism.
        mechanisms: [Strophe.SASLXOAuth2],
        // Resumes the session after a drop and resends what the server never
        // acked. The resumable state is stored per bare JID and cleared on a
        // clean disconnect, so another account can't pick it up.
        enableStreamManagement: true,
        // Ask for an ack after every stanza so each message is confirmed.
        streamManagement: {
          maxUnacked: 1,
          storage: createStreamManagementStorage(),
        },
      });
      let isConnected = false;
      activeConnection = connection;

      connection.connect(token.jid, token.token, (status) => {
        if (connection !== activeConnection) {
          return;
        }

        if (status === Strophe.Status.CONNECTED) {
          isConnected = true;
          reconnectAttempt = 0;
          rejectConnecting = undefined;
          connection.addHandler(onMessage(ownBareJid), null, 'message', null);
          connection.addHandler(onPresence, null, 'presence', null);
          connection.addHandler(onAck(connection), NS_SM, 'a', null);
          connection.send($pres());
          connection.sendIQ(
            $iq({ type: 'set' }).c('enable', { xmlns: NS_CARBONS }),
          );
          // A dropped socket took the viewer out of their rooms.
          joinedRooms.forEach((roomJid) =>
            sendJoin({ strophe, connection }, roomJid),
          );
          resolve({
            strophe,
            connection,
            ownBareJid,
            domain: ownBareJid.split('@')[1],
          });
          return;
        }

        if (
          status === Strophe.Status.AUTHFAIL ||
          status === Strophe.Status.CONNFAIL ||
          status === Strophe.Status.DISCONNECTED
        ) {
          session = null;
          activeConnection = null;

          if (!isConnected) {
            rejectConnecting = undefined;
            reject(new Error(`Chat connection failed with status ${status}`));
            return;
          }

          // A rejected login won't fix itself by retrying with the same token.
          if (status !== Strophe.Status.AUTHFAIL) {
            scheduleReconnect();
          }
        }
      });
    });
  };

  const ensureSession = async (): Promise<Session> => {
    if (isClosed) {
      throw new Error('Chat transport is closed');
    }

    if (session) {
      return session;
    }

    if (!connecting) {
      connecting = connect()
        .then((established) => {
          session = established;
          return established;
        })
        .finally(() => {
          connecting = null;
        });
    }

    return connecting;
  };

  const openConversation = (peerId: string): Promise<void> => {
    const existing = openingPeers.get(peerId);
    if (existing) {
      return existing;
    }

    const opening = startDirectMessage(peerId).then(() => undefined);
    openingPeers.set(peerId, opening);
    // A refusal or outage must not stick; the next send asks again.
    opening.catch(() => openingPeers.delete(peerId));

    return opening;
  };

  // Newest page of the archive with one peer, oldest first. The newest stamp
  // covers reactions too, which take archive slots but aren't messages.
  const queryArchive = async (
    peerJid: string,
    max: number,
  ): Promise<{ messages: DmMessage[]; newestStamp?: string }> => {
    const { strophe, connection, ownBareJid } = await ensureSession();
    const { $iq } = strophe;
    const queryId = connection.getUniqueId('mam');
    let messages: DmMessage[] = [];
    let newestStamp: string | undefined;

    const handler = connection.addHandler(
      (stanza) => {
        const result = parseMamResult(stanza, queryId, ownBareJid);
        newestStamp = result?.stamp ?? newestStamp;
        const message =
          result &&
          parseChatMessage(result.message, {
            ownBareJid,
            stanzaId: result.stanzaId,
            stamp: result.stamp,
          });
        // Results arrive oldest first, so a correction or reaction always
        // finds its message unless that one is older than this page.
        const edit =
          result &&
          !message &&
          parseCorrection(result.message, { ownBareJid, stamp: result.stamp });
        const reaction =
          result &&
          !message &&
          !edit &&
          parseReaction(result.message, ownBareJid);

        if (message) {
          messages.push(message);
        } else if (edit) {
          messages = applyEdit(messages, edit);
        } else if (reaction) {
          messages = applyReaction(messages, reaction);
        }

        return true;
      },
      null,
      'message',
      null,
    );

    const query = $iq({ type: 'set' })
      .c('query', { xmlns: NS_MAM, queryid: queryId })
      .c('x', { xmlns: NS_DATA, type: 'submit' })
      .c('field', { var: 'FORM_TYPE', type: 'hidden' })
      .c('value')
      .t(NS_MAM)
      .up()
      .up()
      .c('field', { var: 'with' })
      .c('value')
      .t(peerJid)
      .up()
      .up()
      .up()
      .c('set', { xmlns: NS_RSM })
      .c('max')
      .t(String(max))
      .up()
      // An empty <before/> asks for the last page.
      .c('before');

    return new Promise((resolve, reject) => {
      connection.sendIQ(
        query,
        () => {
          connection.deleteHandler(handler);
          resolve({ messages, newestStamp });
        },
        () => {
          connection.deleteHandler(handler);
          reject(new Error('Chat history query failed'));
        },
        // Strophe calls the errback with null on timeout.
        iqTimeoutMs,
      );
    });
  };

  return {
    listConversations: async () => {
      const [conversations, { domain }] = await Promise.all([
        getDirectMessageConversations(),
        ensureSession(),
      ]);
      // Until the inbox module exists, the last message comes from one
      // archive lookup per conversation; unread counts come from the API.
      // One slow lookup drops that row instead of failing the whole inbox.
      const withLastMessage = await Promise.allSettled(
        conversations.map(
          async ({
            peer,
            peerJid,
            unreadCount,
          }): Promise<DmConversation | null> => {
            openingPeers.set(peer.id, Promise.resolve());
            const jid = peerJid || jidForUser(peer.id, domain);
            const recent = await queryArchive(jid, inboxPageSize);
            // A burst of reactions can fill the small page; one bigger
            // lookup covers it until the inbox module lands.
            const page =
              recent.messages.length || !recent.newestStamp
                ? recent
                : await queryArchive(jid, historyPageSize);
            // A conversation with only reactions that recent keeps its row,
            // just without a preview.
            const lastMessage: DmMessage | undefined =
              page.messages.pop() ??
              (page.newestStamp
                ? {
                    id: `reactions-${peer.id}`,
                    peerId: peer.id,
                    senderId: peer.id,
                    body: '',
                    createdAt: page.newestStamp,
                    status: DmMessageStatus.Sent,
                  }
                : undefined);

            return lastMessage
              ? {
                  peer: {
                    ...peer,
                    username: peer.username ?? '',
                    access: DirectMessageAccess.Open,
                  },
                  lastMessage,
                  unreadCount,
                }
              : null;
          },
        ),
      );

      return withLastMessage
        .flatMap((result) =>
          result.status === 'fulfilled' && result.value ? [result.value] : [],
        )
        .sort((a, b) =>
          b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt),
        );
    },
    getMessages: async (peerId) => {
      const { domain } = await ensureSession();

      const { messages } = await queryArchive(
        jidForUser(peerId, domain),
        historyPageSize,
      );

      return messages;
    },
    send: async (peer, body, context, { retryOf } = {}) => {
      const message = (id: string, status: DmMessageStatus): DmMessage => ({
        id,
        peerId: peer.id,
        senderId: userId,
        body,
        createdAt: new Date().toISOString(),
        status,
        ...(context && { context }),
      });

      const preview = getMessagePushPreview(body);

      // A message that timed out is still in Strophe's stream-management
      // queue, which resends it once the session resumes. Sending it again
      // would deliver it twice, so a retry only waits for that again.
      if (retryOf && pendingAcks.has(retryOf)) {
        watchAck(retryOf, peer.id, preview);
        reconnectAttempt = 0;
        ensureSession().catch(scheduleReconnect);

        return message(retryOf, DmMessageStatus.Sending);
      }

      await openConversation(peer.id);

      const { strophe, connection, domain } = await ensureSession();
      const { $msg } = strophe;
      // A retry keeps its id as the origin id, so if the first copy surfaces
      // after all both ends see one message.
      const id = retryOf ?? connection.getUniqueId('dm');
      const stanza = $msg({ to: jidForUser(peer.id, domain), type: 'chat', id })
        .c('body')
        .t(body)
        .up()
        .c('origin-id', { xmlns: NS_SID, id })
        .up();

      // Only the comment id matters to the recipient, who loads the comment
      // itself; the snapshot is kept for clients that can't.
      if (context) {
        stanza.c('comment-ref', {
          xmlns: NS_COMMENT_REF,
          id: context.commentId,
          'author-id': context.authorId,
          url: context.permalink,
        });
        if (context.postTitle) {
          stanza.c('title').t(context.postTitle).up();
        }
        stanza.c('snippet').t(context.snippet).up().up();
      }

      // Blocked or DMs-off bounce back as service-unavailable with our id.
      const errorHandler = connection.addHandler(
        () => {
          const pending = pendingAcks.get(id);
          if (pending) {
            clearTimeout(pending.failTimer);
            pendingAcks.delete(id);
          }
          emit({ type: 'rejected', peerId: peer.id, messageId: id });
          return false;
        },
        null,
        'message',
        'error',
        id,
      );
      setTimeout(() => connection.deleteHandler(errorHandler), errorWatchMs);

      // Tracking starts when <enable/> goes out, before <enabled/> comes
      // back, so this also covers a send in a fresh session's first round
      // trip.
      const isTracked = !!connection.sm?.isTracking();
      if (isTracked) {
        watchAck(id, peer.id, preview);
      }

      connection.send(stanza);

      // Without stream management there is nothing to wait for.
      return message(
        id,
        isTracked ? DmMessageStatus.Sending : DmMessageStatus.Sent,
      );
    },
    react: async (peer, messageId, emojis) => {
      const { strophe, connection, domain } = await ensureSession();
      const { $msg } = strophe;
      const id = connection.getUniqueId('reaction');
      const stanza = $msg({
        to: jidForUser(peer.id, domain),
        type: 'chat',
        id,
      }).c('reactions', { xmlns: NS_REACTIONS, id: messageId });
      emojis.forEach((emoji) => stanza.c('reaction').t(emoji).up());
      // ejabberd decides on the hint before looking for a body, so a bodyless
      // reaction is still archived and held for offline peers.
      stanza.up().c('store', { xmlns: NS_HINTS });

      // Bounces like a message does when the peer blocked us or turned
      // direct messages off since the thread loaded.
      const errorHandler = connection.addHandler(
        () => {
          emit({ type: 'reactionRejected', peerId: peer.id });
          return false;
        },
        null,
        'message',
        'error',
        id,
      );
      setTimeout(() => connection.deleteHandler(errorHandler), errorWatchMs);

      connection.send(stanza);
    },
    edit: async (peer, messageId, body) => {
      const { strophe, connection, domain } = await ensureSession();
      const { $msg } = strophe;
      const id = connection.getUniqueId('edit');
      const stanza = $msg({
        to: jidForUser(peer.id, domain),
        type: 'chat',
        id,
      })
        .c('body')
        .t(body)
        .up()
        .c('replace', { xmlns: NS_CORRECT, id: messageId })
        .up()
        .c('origin-id', { xmlns: NS_SID, id });

      const errorHandler = connection.addHandler(
        () => {
          const pending = pendingAcks.get(id);
          if (pending) {
            clearTimeout(pending.failTimer);
            pendingAcks.delete(id);
          }
          emit({ type: 'editRejected', peerId: peer.id, messageId });
          return false;
        },
        null,
        'message',
        'error',
        id,
      );
      setTimeout(() => connection.deleteHandler(errorHandler), errorWatchMs);

      if (connection.sm?.isTracking()) {
        watchEditAck(id, peer.id, messageId);
      }

      connection.send(stanza);
    },
    sendChatState: async (peer, state) => {
      const { strophe, connection, domain } = await ensureSession();
      const { $msg } = strophe;
      // Standalone chat states are neither archived nor held for offline
      // peers; ejabberd treats them as transient on its own.
      connection.send(
        $msg({ to: jidForUser(peer.id, domain), type: 'chat' }).c(state, {
          xmlns: NS_CHAT_STATES,
        }),
      );
    },
    markRead: (peerId) => markDirectMessagesRead(peerId),
    joinRoom: async (roomJid) => {
      joinedRooms.add(roomJid);
      reconnectAttempt = 0;
      const established = await ensureSession();
      // Left while the session was coming up.
      if (joinedRooms.has(roomJid)) {
        sendJoin(established, roomJid);
      }
    },
    leaveRoom: async (roomJid) => {
      joinedRooms.delete(roomJid);
      // Nothing to leave without a session; a reconnect won't rejoin it.
      if (!session) {
        return;
      }
      const { strophe, connection } = session;
      connection.send(
        strophe.$pres({
          to: occupantJid(roomJid, userId),
          type: 'unavailable',
        }),
      );
    },
    sendRoomMessage: async (roomJid, body) => {
      const { strophe, connection } = await ensureSession();
      const { $msg } = strophe;
      const id = connection.getUniqueId('room');
      connection.send(
        $msg({ to: roomJid, type: 'groupchat', id })
          .c('body')
          .t(body)
          .up()
          .c('origin-id', { xmlns: NS_SID, id }),
      );

      const message: RoomMessage = {
        id,
        roomJid,
        senderId: userId,
        body,
        createdAt: new Date().toISOString(),
      };

      return message;
    },
    sendRoomReaction: async (roomJid, messageId, emojis) => {
      const { strophe, connection } = await ensureSession();
      const { $msg } = strophe;
      const stanza = $msg({
        to: roomJid,
        type: 'groupchat',
        id: connection.getUniqueId('room-reaction'),
      }).c('reactions', { xmlns: NS_REACTIONS, id: messageId });
      emojis.forEach((emoji) => stanza.c('reaction').t(emoji).up());
      connection.send(stanza);
    },
    sendRoomChatState: async (roomJid, state) => {
      const { strophe, connection } = await ensureSession();
      connection.send(
        strophe.$msg({ to: roomJid, type: 'groupchat' }).c(state, {
          xmlns: NS_CHAT_STATES,
        }),
      );
    },
    subscribe: (listener) => {
      listeners.add(listener);
      // A new subscriber is a fresh user action, so the retry budget resets.
      reconnectAttempt = 0;
      ensureSession().catch(scheduleReconnect);

      return () => {
        listeners.delete(listener);
      };
    },
    close: () => {
      isClosed = true;
      clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
      pendingAcks.forEach(({ failTimer }) => clearTimeout(failTimer));
      pendingAcks.clear();
      joinedRooms.clear();
      listeners.clear();
      // Settles a connect still in its handshake; its callbacks are ignored
      // once activeConnection is cleared.
      rejectConnecting?.(new Error('Chat transport is closed'));
      rejectConnecting = undefined;
      const connection = activeConnection;
      activeConnection = null;
      session = null;
      // A clean disconnect also drops the resumable stream state.
      connection?.disconnect('logout');
    },
  };
};
