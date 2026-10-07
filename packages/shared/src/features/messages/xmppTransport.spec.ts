import { createXmppTransport } from './xmppTransport';
import type { DmEvent, DmPeer } from './types';
import { DmMessageStatus } from './types';
import { getDirectMessageToken, startDirectMessage } from './graphql';

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
};

const mockStatus = { CONNECTED: 5, AUTHFAIL: 4, CONNFAIL: 2, DISCONNECTED: 6 };

const connections: MockConnection[] = [];

class MockConnection {
  options: Record<string, unknown>;

  handlers: Handler[] = [];

  sent: string[] = [];

  statusCallback?: StatusCallback;

  sm = { enabled: true, state: { unacked: [] as { stanza: string }[] } };

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
  ) {
    const handler = { callback, ns, name };
    this.handlers.push(handler);
    return handler;
  }

  deleteHandler(handler: Handler) {
    this.handlers = this.handlers.filter((item) => item !== handler);
  }

  getUniqueId(suffix: string) {
    this.id += 1;
    return `${this.id}:${suffix}`;
  }

  send(stanza: { id?: string }) {
    if (stanza.id) {
      this.sent.push(stanza.id);
      this.sm.state.unacked.push({ stanza: `<message id="${stanza.id}"/>` });
    }
  }

  iqs = 0;

  sendIQ() {
    this.iqs += 1;
    return 'iq';
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
});
