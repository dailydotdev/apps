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

const historyPageSize = 50;
const errorWatchMs = 60 * 1000;
const maxReconnectDelayMs = 30 * 1000;

export const createXmppTransport = ({
  userId,
  url,
}: {
  userId: string;
  url: string;
}): DmTransport => {
  const listeners = new Set<(event: DmEvent) => void>();
  // daily-api's startDirectMessage is idempotent, so this only saves calls.
  const openedPeers = new Set<string>();
  let session: Session | null = null;
  let connecting: Promise<Session> | null = null;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

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

  const scheduleReconnect = () => {
    if (!listeners.size || reconnectTimer) {
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
    const { Strophe, $pres, $iq } = strophe;
    const ownBareJid = bareJid(token.jid);

    return new Promise((resolve, reject) => {
      const connection = new Strophe.Connection(url, {
        // The token is only valid as an X-OAUTH2 password; letting Strophe
        // pick SCRAM or PLAIN by priority would send it to the wrong mechanism.
        mechanisms: [Strophe.SASLXOAuth2],
        streamManagement: {},
      });
      let isConnected = false;

      connection.connect(token.jid, token.token, (status) => {
        if (status === Strophe.Status.CONNECTED) {
          isConnected = true;
          reconnectAttempt = 0;
          connection.addHandler(onMessage(ownBareJid), null, 'message', null);
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

          if (isConnected) {
            scheduleReconnect();
          } else {
            reject(new Error(`Chat connection failed with status ${status}`));
          }
        }
      });
    });
  };

  const ensureSession = async (): Promise<Session> => {
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
        const result = parseMamResult(stanza, queryId);
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
      // archive lookup per conversation and unread counts are unknown.
      const withLastMessage = await Promise.all(
        conversations.map(
          async ({ peer, peerJid }): Promise<DmConversation | null> => {
            openedPeers.add(peer.id);
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
        .filter(
          (conversation): conversation is DmConversation => !!conversation,
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
      if (!openedPeers.has(peer.id)) {
        await startDirectMessage(peer.id);
        openedPeers.add(peer.id);
      }

      const { strophe, connection, domain } = await ensureSession();
      const { $msg } = strophe;
      const id = connection.getUniqueId('dm');
      const stanza = $msg({ to: jidForUser(peer.id, domain), type: 'chat', id })
        .c('body')
        .t(body)
        .up()
        .c('origin-id', { xmlns: NS_SID, id })
        .up();

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
          emit({ type: 'failed', peerId: peer.id, messageId: id });
          return false;
        },
        null,
        'message',
        'error',
        id,
      );
      setTimeout(() => connection.deleteHandler(errorHandler), errorWatchMs);

      // Stream management resends anything unacked after a reconnect, so a
      // stanza handed to the connection counts as sent.
      connection.send(stanza);

      return {
        id,
        peerId: peer.id,
        senderId: userId,
        body,
        createdAt: new Date().toISOString(),
        status: DmMessageStatus.Sent,
        ...(context && { context }),
      };
    },
    // Read state needs the inbox module on the server; nothing to do yet.
    markRead: async () => undefined,
    subscribe: (listener) => {
      listeners.add(listener);
      ensureSession().catch(scheduleReconnect);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};
