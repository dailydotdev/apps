import type * as StropheNamespace from 'strophe.js';
import type { DmConversation, DmEvent, DmMessage, DmTransport } from './types';
import { DmMessageStatus } from './types';
import {
  getDirectMessageConversations,
  getDirectMessageToken,
  startDirectMessage,
} from './graphql';
import {
  NS_CARBONS,
  NS_COMMENT_REF,
  NS_DATA,
  NS_MAM,
  NS_RSM,
  NS_SID,
  bareJid,
  isMamResult,
  jidForUser,
  parseChatMessage,
  parseMamResult,
  unwrapCarbon,
} from './stanzas';

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

type PendingAck = { peerId: string; failTimer: ReturnType<typeof setTimeout> };

const NS_SM = 'urn:xmpp:sm:3';
const historyPageSize = 50;
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

  const emit = (event: DmEvent) =>
    listeners.forEach((listener) => listener(event));

  const onMessage =
    (ownBareJid: string) =>
    (stanza: Element): boolean => {
      // Archive results belong to the query that asked for them.
      if (isMamResult(stanza)) {
        return true;
      }

      const carbon = unwrapCarbon(stanza, ownBareJid);
      const message =
        carbon === undefined
          ? parseChatMessage(stanza, { ownBareJid })
          : carbon && parseChatMessage(carbon, { ownBareJid });

      if (message) {
        emit({ type: 'message', message });
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

    pendingAcks.forEach(({ peerId, failTimer }, messageId) => {
      if (!unacked.has(messageId)) {
        clearTimeout(failTimer);
        pendingAcks.delete(messageId);
        emit({ type: 'sent', peerId, messageId });
      }
    });

    return true;
  };

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
        streamManagement: { maxUnacked: 1 },
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
          connection.addHandler(onAck(connection), NS_SM, 'a', null);
          connection.send($pres());
          connection.sendIQ(
            $iq({ type: 'set' }).c('enable', { xmlns: NS_CARBONS }),
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

  // Newest page of the archive with one peer, oldest first.
  const queryArchive = async (
    peerJid: string,
    max: number,
  ): Promise<DmMessage[]> => {
    const { strophe, connection, ownBareJid } = await ensureSession();
    const { $iq } = strophe;
    const queryId = connection.getUniqueId('mam');
    const messages: DmMessage[] = [];

    const handler = connection.addHandler(
      (stanza) => {
        const result = parseMamResult(stanza, queryId, ownBareJid);
        const message =
          result &&
          parseChatMessage(result.message, {
            ownBareJid,
            stanzaId: result.stanzaId,
            stamp: result.stamp,
          });

        if (message) {
          messages.push(message);
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
          resolve(messages);
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
      // archive lookup per conversation and unread counts are unknown. One
      // slow lookup drops that row instead of failing the whole inbox.
      const withLastMessage = await Promise.allSettled(
        conversations.map(
          async ({ peer, peerJid }): Promise<DmConversation | null> => {
            openingPeers.set(peer.id, Promise.resolve());
            const [lastMessage] = await queryArchive(
              peerJid || jidForUser(peer.id, domain),
              1,
            );

            return lastMessage
              ? {
                  peer: {
                    ...peer,
                    username: peer.username ?? '',
                    acceptsMessages: true,
                  },
                  lastMessage,
                  unreadCount: 0,
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

      return queryArchive(jidForUser(peerId, domain), historyPageSize);
    },
    send: async (peer, body, context) => {
      await openConversation(peer.id);

      const { strophe, connection, domain } = await ensureSession();
      const { $msg } = strophe;
      const id = connection.getUniqueId('dm');
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

      const isTracked = !!connection.sm?.enabled;
      if (isTracked) {
        pendingAcks.set(id, {
          peerId: peer.id,
          failTimer: setTimeout(
            () => emit({ type: 'failed', peerId: peer.id, messageId: id }),
            ackTimeoutMs,
          ),
        });
      }

      connection.send(stanza);

      return {
        id,
        peerId: peer.id,
        senderId: userId,
        body,
        createdAt: new Date().toISOString(),
        // Without stream management there is nothing to wait for.
        status: isTracked ? DmMessageStatus.Sending : DmMessageStatus.Sent,
        ...(context && { context }),
      };
    },
    // Read state needs the inbox module on the server; nothing to do yet.
    markRead: async () => undefined,
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
