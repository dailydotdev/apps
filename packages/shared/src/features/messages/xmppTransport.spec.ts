import { createXmppTransport } from './xmppTransport';
import type { DmEvent, DmPeer } from './types';
import { DmMessageStatus } from './types';
import {
  getDirectMessageConversations,
  getDirectMessageToken,
  startDirectMessage,
} from './graphql';

jest.mock('./graphql', () => ({
  getDirectMessageToken: jest.fn(),
  getDirectMessageConversations: jest.fn(),
  startDirectMessage: jest.fn(),
}));

type StatusCallback = (status: number) => void;
type Handler = {
  callback: (stanza: Element) => boolean;
  ns: string | null;
  name: string | null;
  type?: string | null;
  id?: string | null;
};

const mockStatus = { CONNECTED: 5, AUTHFAIL: 4, CONNFAIL: 2, DISCONNECTED: 6 };

const connections: MockConnection[] = [];

class MockConnection {
  options: Record<string, unknown>;

  handlers: Handler[] = [];

  sent: string[] = [];

  statusCallback?: StatusCallback;

  sm = {
    enabled: true,
    isTracking: () => true,
    state: { unacked: [] as { stanza: string }[] },
  };

  disconnect = jest.fn();

  private id = 0;

  constructor(_url: string, options: Record<string, unknown>) {
    this.options = options;
    connections.push(this);
  }

  connect(_jid: string, _pass: string, callback: StatusCallback) {
    this.statusCallback = callback;
  }

  addHandler(
    callback: Handler['callback'],
    ns: string | null,
    name: string | null,
    type?: string | null,
    id?: string | null,
  ) {
    const handler = { callback, ns, name, type, id };
    this.handlers.push(handler);
    return handler;
  }

  deleteHandler(handler: Handler) {
    this.handlers = this.handlers.filter((item) => item !== handler);
  }

  getUniqueId(suffix: string) {
    this.id += 1;
    const id = `${this.id}:${suffix}`;
    if (suffix === 'mam') {
      this.queryId = id;
    }
    return id;
  }

  queryId?: string;

  // Each archive query answers with the next page, given its query id.
  archivePages: ((queryId: string) => string[])[] = [];

  send(stanza: { id?: string }) {
    if (stanza.id) {
      this.sent.push(stanza.id);
      this.sm.state.unacked.push({ stanza: `<message id="${stanza.id}"/>` });
    }
  }

  iqs = 0;

  sendIQ(_iq: unknown, onSuccess?: () => void) {
    this.iqs += 1;
    const page = this.queryId && this.archivePages.shift();
    if (page && onSuccess) {
      page(this.queryId!).forEach((source) => {
        const stanza = new DOMParser().parseFromString(
          source,
          'text/xml',
        ).documentElement;
        this.handlers
          .filter(({ name, type }) => name === 'message' && !type)
          .forEach(({ callback }) => callback(stanza));
      });
      onSuccess();
    }
    return 'iq';
  }

  // The server refuses a stanza we sent, e.g. because the peer blocked us.
  bounce(id: string) {
    this.handlers
      .filter((handler) => handler.type === 'error' && handler.id === id)
      .forEach(({ callback }) => callback({} as Element));
  }

  // The server acks everything sent so far, as Strophe reconciles it.
  ackAll() {
    this.sm.state.unacked = [];
    this.handlers
      .filter(({ name }) => name === 'a')
      .forEach(({ callback }) => callback({} as Element));
  }
}

const mockBuilder = (attrs: { id?: string } = {}) => {
  const self = {
    id: attrs.id,
    c: () => self,
    t: () => self,
    up: () => self,
  };
  return self;
};

const MockSASLXOAuth2 = function MockSASLXOAuth2() {};

jest.mock(
  'strophe.js',
  () => ({
    Strophe: {
      Connection: MockConnection,
      Status: mockStatus,
      SASLXOAuth2: MockSASLXOAuth2,
    },
    $pres: () => mockBuilder(),
    $iq: () => mockBuilder(),
    $msg: (attrs: { id: string }) => mockBuilder(attrs),
  }),
  { virtual: true },
);

const peer: DmPeer = {
  id: 'peer',
  name: 'Peer',
  username: 'peer',
  image: '',
  permalink: '',
  acceptsMessages: true,
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const connected = async () => {
  await flush();
  const connection = connections[connections.length - 1];
  connection.statusCallback?.(mockStatus.CONNECTED);
  await flush();
  return connection;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  connections.length = 0;
  jest.mocked(getDirectMessageToken).mockResolvedValue({
    token: 'token',
    jid: 'me@chat.daily.dev',
    expiresAt: '2026-10-07T12:00:00Z',
  });
  jest.mocked(startDirectMessage).mockResolvedValue({
    id: 'c1',
    jid: 'me@chat.daily.dev',
    peerJid: 'peer@chat.daily.dev',
    createdAt: '',
    peer,
  });
});

describe('createXmppTransport', () => {
  it('logs in with X-OAUTH2 only and turns on stream management', async () => {
    const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
    transport.subscribe(() => undefined);
    await connected();

    expect(connections[0].options).toMatchObject({
      mechanisms: [MockSASLXOAuth2],
      enableStreamManagement: true,
    });
  });

  it('keeps a message sending until the server acks it', async () => {
    const events: DmEvent[] = [];
    const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
    transport.subscribe((event) => events.push(event));
    const connection = await connected();

    const sent = await transport.send(peer, 'hi');

    expect(sent.status).toBe(DmMessageStatus.Sending);
    expect(events).toEqual([]);

    connection.ackAll();

    expect(events).toEqual([
      { type: 'sent', peerId: 'peer', messageId: sent.id },
    ]);
  });

  it('marks a message failed when no ack arrives in time', async () => {
    const events: DmEvent[] = [];
    const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
    transport.subscribe((event) => events.push(event));
    await connected();
    jest.useFakeTimers();

    const sent = await transport.send(peer, 'hi');
    jest.advanceTimersByTime(15 * 1000);

    expect(events).toContainEqual({
      type: 'failed',
      peerId: 'peer',
      messageId: sent.id,
    });
  });

  it('does not send a timed-out message again on retry', async () => {
    const events: DmEvent[] = [];
    const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
    transport.subscribe((event) => events.push(event));
    const connection = await connected();
    jest.useFakeTimers();

    const sent = await transport.send(peer, 'hi');
    jest.advanceTimersByTime(15 * 1000);
    const retried = await transport.send(peer, 'hi', undefined, {
      retryOf: sent.id,
    });

    // Still queued for resend by stream management, so no second stanza.
    expect(retried).toMatchObject({
      id: sent.id,
      status: DmMessageStatus.Sending,
    });
    expect(connection.sent).toEqual([sent.id]);

    connection.ackAll();

    expect(events).toContainEqual({
      type: 'sent',
      peerId: 'peer',
      messageId: sent.id,
    });
  });

  it('opens a new conversation once for concurrent first messages, in order', async () => {
    const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
    transport.subscribe(() => undefined);
    const connection = await connected();

    const [first, second] = await Promise.all([
      transport.send(peer, 'first'),
      transport.send(peer, 'second'),
    ]);

    expect(startDirectMessage).toHaveBeenCalledTimes(1);
    expect(connection.sent).toEqual([first.id, second.id]);
  });

  it('does not keep a socket when closed while the token is in flight', async () => {
    const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
    const history = transport.getMessages('peer');

    transport.close();

    await expect(history).rejects.toThrow('closed');
    expect(connections).toHaveLength(0);
  });

  it('settles a pending connect when closed mid-handshake', async () => {
    const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
    const history = transport.getMessages('peer');
    await flush();

    transport.close();

    await expect(history).rejects.toThrow('closed');
    expect(connections[0].disconnect).toHaveBeenCalledWith('logout');
  });

  describe('reactions in the archive', () => {
    const archived = (
      queryId: string,
      id: string,
      inner: string,
      from = 'peer@chat.daily.dev',
    ) => `<message xmlns="jabber:client">
      <result xmlns="urn:xmpp:mam:2" queryid="${queryId}" id="${id}">
        <forwarded xmlns="urn:xmpp:forward:0">
          <delay xmlns="urn:xmpp:delay" stamp="2026-10-07T10:00:0${id}Z"/>
          <message xmlns="jabber:client" type="chat" from="${from}"
            to="me@chat.daily.dev">${inner}</message>
        </forwarded>
      </result>
    </message>`;
    const text = (originId: string, body: string) =>
      `<body>${body}</body><origin-id xmlns="urn:xmpp:sid:0" id="${originId}"/>`;
    const reaction = (messageId: string, emoji: string) =>
      `<reactions xmlns="urn:xmpp:reactions:0" id="${messageId}"><reaction>${emoji}</reaction></reactions>`;

    it('folds reactions into the messages they point at', async () => {
      const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
      transport.subscribe(() => undefined);
      const connection = await connected();
      connection.archivePages.push((queryId) => [
        archived(queryId, '1', text('m1', 'hi')),
        archived(queryId, '2', reaction('m1', '🔥')),
        archived(queryId, '3', reaction('older', '👍')),
      ]);

      const messages = await transport.getMessages('peer');

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        id: 'm1',
        reactions: { '🔥': ['peer'] },
      });
    });

    it('keeps a conversation in the inbox when reactions fill the last page', async () => {
      jest.mocked(getDirectMessageConversations).mockResolvedValue([
        {
          id: 'c1',
          jid: '',
          peerJid: 'peer@chat.daily.dev',
          createdAt: '',
          peer,
        },
      ]);
      const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
      transport.subscribe(() => undefined);
      const connection = await connected();
      connection.archivePages.push(
        (queryId) => [archived(queryId, '2', reaction('m1', '🔥'))],
        (queryId) => [
          archived(queryId, '1', text('m1', 'hi')),
          archived(queryId, '2', reaction('m1', '🔥')),
        ],
      );

      const [conversation] = await transport.listConversations();

      expect(conversation?.lastMessage).toMatchObject({ id: 'm1', body: 'hi' });
    });

    it('keeps the row without a preview when only reactions are recent', async () => {
      jest.mocked(getDirectMessageConversations).mockResolvedValue([
        {
          id: 'c1',
          jid: '',
          peerJid: 'peer@chat.daily.dev',
          createdAt: '',
          peer,
        },
      ]);
      const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
      transport.subscribe(() => undefined);
      const connection = await connected();
      connection.archivePages.push(
        (queryId) => [archived(queryId, '3', reaction('m1', '🔥'))],
        (queryId) => [archived(queryId, '3', reaction('m1', '🔥'))],
      );

      const [conversation] = await transport.listConversations();

      expect(conversation?.lastMessage).toMatchObject({
        body: '',
        createdAt: '2026-10-07T10:00:03Z',
      });
    });
  });

  it('reports a bounced reaction', async () => {
    const events: DmEvent[] = [];
    const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
    transport.subscribe((event) => events.push(event));
    const connection = await connected();

    await transport.react(peer, 'm1', ['👍']);
    connection.bounce(connection.sent[connection.sent.length - 1]);

    expect(events).toContainEqual({ type: 'reactionRejected', peerId: 'peer' });
  });
});
