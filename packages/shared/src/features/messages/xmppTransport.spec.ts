import { createXmppTransport } from './xmppTransport';
import type { DmEvent, DmPeer, DmTransport } from './types';
import { DmMessageStatus } from './types';
import type { CompanySupportChat } from './graphql';
import {
  DirectMessageAccess,
  getCompanySupportChat,
  getCompanySupportChats,
  getDirectMessageConversations,
  getDirectMessageToken,
  markCompanySupportChatRead,
  markCompanySupportMessageSent,
  markDirectMessageSent,
  startDirectMessage,
} from './graphql';
import { supportChatToPeer } from './support';

jest.mock('./graphql', () => ({
  ...jest.requireActual('./graphql'),
  getDirectMessageToken: jest.fn(),
  getDirectMessageConversations: jest.fn(),
  getCompanySupportChats: jest.fn(),
  getCompanySupportChat: jest.fn(),
  markCompanySupportMessageSent: jest.fn(),
  markCompanySupportChatRead: jest.fn(),
  markDirectMessageSent: jest.fn(),
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

  // The socket goes away without closing the stream, as Strophe reports it.
  dropSocket = jest.fn(() => this.statusCallback?.(mockStatus.DISCONNECTED));

  _doDisconnect = () => this.dropSocket();

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

// Names of the bare elements built with $build, i.e. <r/> probes.
const mockBuilt: string[] = [];
// Where each addressed presence went, i.e. room joins.
const mockPresenceTo: string[] = [];

jest.mock(
  'strophe.js',
  () => ({
    Strophe: {
      Connection: MockConnection,
      Status: mockStatus,
      SASLXOAuth2: MockSASLXOAuth2,
    },
    $pres: (attrs?: { to?: string }) => {
      if (attrs?.to) {
        mockPresenceTo.push(attrs.to);
      }
      return mockBuilder();
    },
    $iq: () => mockBuilder(),
    $msg: (attrs: { id: string }) => mockBuilder(attrs),
    $build: (name: string) => {
      mockBuilt.push(name);
      return mockBuilder();
    },
  }),
  { virtual: true },
);

const peer: DmPeer = {
  id: 'peer',
  name: 'Peer',
  username: 'peer',
  image: '',
  permalink: '',
  access: DirectMessageAccess.Open,
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// Every transport listens for page events, so one left open would answer the
// next test's as well.
const openTransports: DmTransport[] = [];
const openTransport = () => {
  const transport = createXmppTransport({ userId: 'me', url: 'wss://x' });
  openTransports.push(transport);
  return transport;
};

afterEach(() => {
  openTransports.splice(0).forEach((transport) => transport.close());
  jest.restoreAllMocks();
});

// For tests that need the clock faked before the transport exists.
const connectedWithFakeTimers = async () => {
  await jest.advanceTimersByTimeAsync(0);
  const connection = connections[connections.length - 1];
  connection.statusCallback?.(mockStatus.CONNECTED);
  await jest.advanceTimersByTimeAsync(0);
  return connection;
};

const setVisibility = (state: DocumentVisibilityState) => {
  jest.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
  document.dispatchEvent(new Event('visibilitychange'));
};

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
  mockBuilt.length = 0;
  mockPresenceTo.length = 0;
  jest.mocked(getDirectMessageToken).mockResolvedValue({
    token: 'token',
    jid: 'me@chat.daily.dev',
    expiresAt: '2026-10-07T12:00:00Z',
  });
  jest.mocked(markDirectMessageSent).mockReset().mockResolvedValue();
  jest.mocked(getCompanySupportChats).mockReset().mockResolvedValue([]);
  jest.mocked(markCompanySupportMessageSent).mockReset().mockResolvedValue();
  jest.mocked(markCompanySupportChatRead).mockReset().mockResolvedValue();
  jest.mocked(startDirectMessage).mockResolvedValue({
    id: 'c1',
    jid: 'me@chat.daily.dev',
    peerJid: 'peer@chat.daily.dev',
    requestMessage: null,
    createdByViewer: true,
    isRequest: false,
    unreadCount: 0,
    createdAt: '',
    peer,
  });
});

describe('createXmppTransport', () => {
  it('logs in with X-OAUTH2 only and turns on stream management', async () => {
    const transport = openTransport();
    transport.subscribe(() => undefined);
    await connected();

    expect(connections[0].options).toMatchObject({
      mechanisms: [MockSASLXOAuth2],
      enableStreamManagement: true,
    });
  });

  it('keeps a message sending until the server acks it', async () => {
    const events: DmEvent[] = [];
    const transport = openTransport();
    transport.subscribe((event) => events.push(event));
    const connection = await connected();

    const sent = await transport.send(peer, 'hi');

    expect(sent.status).toBe(DmMessageStatus.Sending);
    expect(events).toEqual([]);
    expect(markDirectMessageSent).not.toHaveBeenCalled();

    connection.ackAll();

    expect(events).toEqual([
      { type: 'sent', peerId: 'peer', messageId: sent.id },
    ]);
    expect(markDirectMessageSent).toHaveBeenCalledWith('peer', 'hi');
  });

  it('reports a push preview without image markdown', async () => {
    const transport = openTransport();
    transport.subscribe(() => undefined);
    const connection = await connected();

    await transport.send(
      peer,
      `look\n\n![a](https://media.daily.dev/image/upload/x.png) ${'b'.repeat(
        200,
      )}`,
    );
    connection.ackAll();

    const [, preview] = jest.mocked(markDirectMessageSent).mock.calls[0];
    expect(preview).toHaveLength(100);
    expect(preview?.startsWith('look Image bbb')).toBe(true);
  });

  it('marks a message failed when no ack arrives in time', async () => {
    const events: DmEvent[] = [];
    const transport = openTransport();
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
    const transport = openTransport();
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

  it('drops a socket that does not answer an ack request and resumes', async () => {
    const events: DmEvent[] = [];
    const transport = openTransport();
    transport.subscribe((event) => events.push(event));
    const connection = await connected();
    jest.useFakeTimers();

    const sent = await transport.send(peer, 'hi');
    // Well before the message would be shown as failed.
    jest.advanceTimersByTime(2 * 1000);

    expect(mockBuilt).toEqual(['r']);
    expect(connection.dropSocket).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2 * 1000);

    // Not a clean disconnect, which would drop the resumable state.
    expect(connection.dropSocket).toHaveBeenCalledTimes(1);
    expect(connection.disconnect).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    jest.useRealTimers();
    const resumed = await connected();
    expect(resumed).not.toBe(connection);

    // The resumed stream resends the message and the server acks it.
    resumed.ackAll();

    expect(events).toContainEqual({
      type: 'sent',
      peerId: 'peer',
      messageId: sent.id,
    });
    expect(markDirectMessageSent).toHaveBeenCalledTimes(1);
  });

  it('keeps a socket that answers the ack request', async () => {
    const transport = openTransport();
    transport.subscribe(() => undefined);
    const connection = await connected();
    jest.useFakeTimers();

    await transport.send(peer, 'hi');
    jest.advanceTimersByTime(2 * 1000);
    connection.ackAll();
    jest.advanceTimersByTime(5 * 1000);

    expect(connection.dropSocket).not.toHaveBeenCalled();
  });

  it('does not check the socket for a send that is acked promptly', async () => {
    const transport = openTransport();
    transport.subscribe(() => undefined);
    const connection = await connected();
    jest.useFakeTimers();

    await transport.send(peer, 'hi');
    connection.ackAll();
    jest.advanceTimersByTime(15 * 1000);

    expect(mockBuilt).toEqual([]);
  });

  it('checks an idle socket while the page is visible', async () => {
    jest.useFakeTimers();
    const transport = openTransport();
    transport.subscribe(() => undefined);
    await jest.advanceTimersByTimeAsync(0);
    const connection = connections[connections.length - 1];
    connection.statusCallback?.(mockStatus.CONNECTED);
    await jest.advanceTimersByTimeAsync(0);

    jest.advanceTimersByTime(25 * 1000);
    expect(mockBuilt).toEqual(['r']);
    connection.ackAll();
    jest.advanceTimersByTime(5 * 1000);
    expect(connection.dropSocket).not.toHaveBeenCalled();

    // The next check goes unanswered: the socket died without a close event.
    jest.advanceTimersByTime(20 * 1000);
    expect(mockBuilt).toEqual(['r', 'r']);
    jest.advanceTimersByTime(5 * 1000);
    expect(connection.dropSocket).toHaveBeenCalledTimes(1);

    transport.close();
  });

  it('leaves the socket alone while the page is hidden', async () => {
    jest.useFakeTimers();
    const transport = openTransport();
    transport.subscribe(() => undefined);
    await jest.advanceTimersByTimeAsync(0);
    connections[connections.length - 1].statusCallback?.(mockStatus.CONNECTED);
    await jest.advanceTimersByTimeAsync(0);
    const visibility = jest
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('hidden');

    jest.advanceTimersByTime(60 * 1000);
    expect(mockBuilt).toEqual([]);

    visibility.mockRestore();
    transport.close();
  });

  it('checks the socket when a retry waits on a queued message', async () => {
    const transport = openTransport();
    transport.subscribe(() => undefined);
    const connection = await connected();
    jest.useFakeTimers();

    await transport.send(peer, 'hi');
    jest.advanceTimersByTime(2 * 1000);
    connection.ackAll();
    mockBuilt.length = 0;

    // A slow ack, then the user taps retry before the probe settles.
    const again = await transport.send(peer, 'again');
    jest.advanceTimersByTime(2 * 1000);
    await transport.send(peer, 'again', undefined, { retryOf: again.id });

    // One probe in flight at a time.
    expect(mockBuilt).toEqual(['r']);
    jest.advanceTimersByTime(5 * 1000);
    expect(connection.dropSocket).toHaveBeenCalledTimes(1);
  });

  it('opens a new conversation once for concurrent first messages, in order', async () => {
    const transport = openTransport();
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
    const transport = openTransport();
    const history = transport.getMessages('peer');

    transport.close();

    await expect(history).rejects.toThrow('closed');
    expect(connections).toHaveLength(0);
  });

  it('settles a pending connect when closed mid-handshake', async () => {
    const transport = openTransport();
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
      const transport = openTransport();
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
          requestMessage: null,
          createdByViewer: true,
          isRequest: false,
          unreadCount: 2,
          createdAt: '',
          peer,
        },
      ]);
      const transport = openTransport();
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
      expect(conversation?.unreadCount).toBe(2);
    });

    it('keeps the row without a preview when only reactions are recent', async () => {
      jest.mocked(getDirectMessageConversations).mockResolvedValue([
        {
          id: 'c1',
          jid: '',
          peerJid: 'peer@chat.daily.dev',
          requestMessage: null,
          createdByViewer: true,
          isRequest: false,
          unreadCount: 2,
          createdAt: '',
          peer,
        },
      ]);
      const transport = openTransport();
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

  it('folds corrections into the messages they replace', async () => {
    const transport = openTransport();
    transport.subscribe(() => undefined);
    const connection = await connected();
    const archived = (queryId: string, id: string, inner: string) =>
      `<message xmlns="jabber:client">
        <result xmlns="urn:xmpp:mam:2" queryid="${queryId}" id="${id}">
          <forwarded xmlns="urn:xmpp:forward:0">
            <delay xmlns="urn:xmpp:delay" stamp="2026-10-07T10:00:0${id}Z"/>
            <message xmlns="jabber:client" type="chat"
              from="peer@chat.daily.dev" to="me@chat.daily.dev">${inner}</message>
          </forwarded>
        </result>
      </message>`;
    connection.archivePages.push((queryId) => [
      archived(
        queryId,
        '1',
        '<body>helo</body><origin-id xmlns="urn:xmpp:sid:0" id="m1"/>',
      ),
      archived(
        queryId,
        '2',
        '<body>hello</body><replace xmlns="urn:xmpp:message-correct:0" id="m1"/>',
      ),
      archived(
        queryId,
        '3',
        '<body>lost</body><replace xmlns="urn:xmpp:message-correct:0" id="older"/>',
      ),
    ]);

    const messages = await transport.getMessages('peer');

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'm1',
      body: 'hello',
      createdAt: '2026-10-07T10:00:01Z',
      editedAt: '2026-10-07T10:00:02Z',
    });
  });

  it('sends an edit without counting it as a new message for the peer', async () => {
    const events: DmEvent[] = [];
    const transport = openTransport();
    transport.subscribe((event) => events.push(event));
    const connection = await connected();

    await transport.edit(peer, 'm1', 'fixed');
    connection.ackAll();

    expect(connection.sent).toHaveLength(1);
    expect(events).toEqual([]);
    expect(markDirectMessageSent).not.toHaveBeenCalled();
  });

  it('reports an edit the server bounced', async () => {
    const events: DmEvent[] = [];
    const transport = openTransport();
    transport.subscribe((event) => events.push(event));
    const connection = await connected();

    await transport.edit(peer, 'm1', 'fixed');
    connection.bounce(connection.sent[0]);

    expect(events).toEqual([
      { type: 'editRejected', peerId: 'peer', messageId: 'm1' },
    ]);
  });

  it('relays the peer’s typing but not our other sessions’', async () => {
    const events: DmEvent[] = [];
    const transport = openTransport();
    transport.subscribe((event) => events.push(event));
    const connection = await connected();
    const deliver = (source: string) =>
      connection.handlers
        .filter(({ name, type }) => name === 'message' && !type)
        .forEach(({ callback }) =>
          callback(
            new DOMParser().parseFromString(source, 'text/xml').documentElement,
          ),
        );

    deliver(`<message xmlns="jabber:client" type="chat"
      from="peer@chat.daily.dev/web" to="me@chat.daily.dev/web">
      <composing xmlns="http://jabber.org/protocol/chatstates"/>
    </message>`);
    deliver(`<message xmlns="jabber:client" from="me@chat.daily.dev" to="me@chat.daily.dev/web">
      <sent xmlns="urn:xmpp:carbons:2">
        <forwarded xmlns="urn:xmpp:forward:0">
          <message xmlns="jabber:client" type="chat"
            from="me@chat.daily.dev/other" to="peer@chat.daily.dev">
            <composing xmlns="http://jabber.org/protocol/chatstates"/>
          </message>
        </forwarded>
      </sent>
    </message>`);

    expect(events).toEqual([
      { type: 'chatState', peerId: 'peer', state: 'composing' },
    ]);
  });

  it('reports a bounced reaction', async () => {
    const events: DmEvent[] = [];
    const transport = openTransport();
    transport.subscribe((event) => events.push(event));
    const connection = await connected();

    await transport.react(peer, 'm1', ['👍']);
    connection.bounce(connection.sent[connection.sent.length - 1]);

    expect(events).toContainEqual({ type: 'reactionRejected', peerId: 'peer' });
  });

  it('checks the socket when the page comes back after a short absence', async () => {
    jest.useFakeTimers();
    const transport = openTransport();
    transport.subscribe(() => undefined);
    const connection = await connectedWithFakeTimers();

    setVisibility('hidden');
    jest.advanceTimersByTime(5 * 1000);
    setVisibility('visible');

    expect(mockBuilt).toEqual(['r']);
    expect(connection.dropSocket).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2 * 1000);
    expect(connection.dropSocket).toHaveBeenCalledTimes(1);
  });

  it('reconnects without checking when the page was away for a while', async () => {
    jest.useFakeTimers();
    const events: DmEvent[] = [];
    const transport = openTransport();
    transport.subscribe((event) => events.push(event));
    const connection = await connectedWithFakeTimers();

    setVisibility('hidden');
    jest.advanceTimersByTime(20 * 1000);
    setVisibility('visible');

    // No probe to wait on, and not a clean disconnect, which would drop
    // the resumable state.
    expect(mockBuilt).toEqual([]);
    expect(connection.dropSocket).toHaveBeenCalledTimes(1);
    expect(connection.disconnect).not.toHaveBeenCalled();

    // The new socket is opened right away rather than after a backoff.
    const resumed = await connectedWithFakeTimers();
    expect(resumed).not.toBe(connection);
    expect(events).toContainEqual({ type: 'reconnected' });
  });

  it('resends a message written into the dead socket once it resumes', async () => {
    jest.useFakeTimers();
    const events: DmEvent[] = [];
    const transport = openTransport();
    transport.subscribe((event) => events.push(event));
    await connectedWithFakeTimers();

    setVisibility('hidden');
    jest.advanceTimersByTime(60 * 1000);
    setVisibility('visible');
    const resumed = await connectedWithFakeTimers();

    const sent = await transport.send(peer, 'hi');
    resumed.ackAll();

    expect(resumed.sent).toEqual([sent.id]);
    expect(events).toContainEqual({
      type: 'sent',
      peerId: 'peer',
      messageId: sent.id,
    });
  });

  it('does not wait out a reconnect backoff when the page comes back', async () => {
    jest.useFakeTimers();
    const transport = openTransport();
    transport.subscribe(() => undefined);
    const connection = await connectedWithFakeTimers();

    // The socket closes on its own; the retry is a second away.
    connection.dropSocket();
    await jest.advanceTimersByTimeAsync(0);
    expect(connections).toHaveLength(1);

    setVisibility('visible');
    await jest.advanceTimersByTimeAsync(0);

    expect(connections).toHaveLength(2);
  });

  it('reconnects when the network comes back', async () => {
    jest.useFakeTimers();
    const transport = openTransport();
    transport.subscribe(() => undefined);
    const connection = await connectedWithFakeTimers();

    window.dispatchEvent(new Event('online'));

    expect(mockBuilt).toEqual([]);
    expect(connection.dropSocket).toHaveBeenCalledTimes(1);
  });

  it('reconnects when its timers were frozen while the page stayed visible', async () => {
    jest.useFakeTimers();
    const transport = openTransport();
    transport.subscribe(() => undefined);
    const connection = await connectedWithFakeTimers();

    // A laptop lid: the clock moves on, the timers don't.
    jest.setSystemTime(Date.now() + 10 * 60 * 1000);
    jest.advanceTimersByTime(25 * 1000);

    expect(mockBuilt).toEqual([]);
    expect(connection.dropSocket).toHaveBeenCalledTimes(1);
  });

  it('shortens a check already in flight when the user is waiting', async () => {
    jest.useFakeTimers();
    const transport = openTransport();
    transport.subscribe(() => undefined);
    const connection = await connectedWithFakeTimers();

    jest.advanceTimersByTime(25 * 1000);
    expect(mockBuilt).toEqual(['r']);

    await transport.send(peer, 'hi');
    jest.advanceTimersByTime(2 * 1000);

    // Still the one request, now due sooner than the idle check's 5s.
    expect(mockBuilt).toEqual(['r']);
    expect(connection.dropSocket).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2 * 1000);
    expect(connection.dropSocket).toHaveBeenCalledTimes(1);
  });
});

describe('company page support chats', () => {
  const room = 'c1@conference.chat.daily.dev';
  const chat: CompanySupportChat = {
    id: 'c1',
    jid: room,
    unreadCount: 1,
    lastMessageAt: '2026-11-23T10:00:00Z',
    createdAt: '2026-11-23T09:00:00Z',
    source: {
      id: 's1',
      name: 'Acme',
      handle: 'acme',
      image: '',
      permalink: '',
    },
    members: [],
  };
  const MUC_USER = 'http://jabber.org/protocol/muc#user';
  const OCCUPANT = 'urn:xmpp:occupant-id:0';
  const founderJid = '28849d86070e4c099c877ab6837c61f0@chat.daily.dev';
  const stanza = (xml: string): Element =>
    new DOMParser().parseFromString(xml, 'text/xml').documentElement;
  const deliver = (connection: MockConnection, xml: string) =>
    connection.handlers
      .filter(({ name, type }) => name === 'message' && !type)
      .forEach(({ callback }) => callback(stanza(xml)));
  const deliverPresence = (connection: MockConnection, xml: string) =>
    connection.handlers
      .filter(({ name }) => name === 'presence')
      .forEach(({ callback }) => callback(stanza(xml)));
  // An occupant as the non-anonymous room shows them: nick, occupant id and
  // the real JID behind them.
  const occupant = (
    nick: string,
    occupantId: string,
    jid: string,
    isSelf = false,
  ) =>
    `<presence xmlns="jabber:client" from="${room}/${nick}"><occupant-id xmlns="${OCCUPANT}" id="${occupantId}"/><x xmlns="${MUC_USER}"><item affiliation="member" role="participant" jid="${jid}/res"/>${isSelf ? '<status code="110"/>' : ''}</x></presence>`;
  const confirmJoin = (connection: MockConnection) =>
    deliverPresence(
      connection,
      occupant('me', 'occ-me', 'me@chat.daily.dev', true),
    );
  const live = (nick: string, body: string, extra = '', id = 'o1') =>
    `<message xmlns="jabber:client" type="groupchat" from="${room}/${nick}"><origin-id xmlns="urn:xmpp:sid:0" id="${id}"/>${extra}<body>${body}</body></message>`;
  const occupantId = (id: string) =>
    `<occupant-id xmlns="${OCCUPANT}" id="${id}"/>`;
  const forgedItem = `<x xmlns="${MUC_USER}"><item jid="${founderJid}/forged"/></x>`;
  const archived = (
    queryId: string,
    id: string,
    nick: string,
    items: string[],
    body: string,
  ) =>
    `<message xmlns="jabber:client" from="${room}">
      <result xmlns="urn:xmpp:mam:2" queryid="${queryId}" id="${id}">
        <forwarded xmlns="urn:xmpp:forward:0">
          <delay xmlns="urn:xmpp:delay" stamp="2026-11-23T10:00:0${id}Z"/>
          <message xmlns="jabber:client" type="groupchat" from="${room}/${nick}">${items
            .map((jid) => `<x xmlns="${MUC_USER}"><item jid="${jid}/res"/></x>`)
            .join('')}<body>${body}</body></message>
        </forwarded>
      </result>
    </message>`;
  const connectedTransport = async (events: DmEvent[] = []) => {
    const transport = openTransport();
    transport.subscribe((event) => events.push(event));
    const connection = await connected();
    await flush();
    return { transport, connection, events };
  };
  // Opening the thread is what joins the room.
  const openThread = async (events: DmEvent[] = []) => {
    const opened = await connectedTransport(events);
    opened.connection.archivePages.push(() => []);
    const loading = opened.transport.getMessages('support:c1');
    await flush();
    confirmJoin(opened.connection);
    await loading;
    return opened;
  };

  beforeEach(() => {
    jest.mocked(getCompanySupportChats).mockResolvedValue([chat]);
    jest.mocked(getCompanySupportChat).mockResolvedValue(chat);
    jest.mocked(getDirectMessageConversations).mockResolvedValue([]);
  });

  it('joins no room until its thread opens, then joins under the viewer’s nick', async () => {
    const { transport, connection } = await connectedTransport();
    connection.archivePages.push(() => []);
    await transport.listConversations();
    await flush();
    expect(mockPresenceTo).toEqual([]);

    await openThread();

    expect(mockPresenceTo).toEqual([`${room}/me`]);
  });

  it('names the sender by the real JID behind the occupant, not the nick', async () => {
    const { connection, events } = await openThread();
    // Another admin took the founder's nick while the founder was away.
    deliverPresence(
      connection,
      occupant('founder', 'occ-2', 'h4_v_l_vhbl@chat.daily.dev'),
    );

    deliver(
      connection,
      live('founder', 'i am the founder', occupantId('occ-2')),
    );

    expect(events).toContainEqual({
      type: 'message',
      message: expect.objectContaining({
        senderId: 'h4VLVhbl',
        body: 'i am the founder',
      }),
    });
  });

  // As ejabberd 26.9 relays it: the forged element passes through, the
  // occupant id is the room's own.
  it('ignores an item jid the sender put on a live message', async () => {
    const { connection, events } = await openThread();
    deliverPresence(
      connection,
      occupant('h4_v_l_vhbl', 'occ-2', 'h4_v_l_vhbl@chat.daily.dev'),
    );

    deliver(
      connection,
      live(
        'h4_v_l_vhbl',
        'forged founder message',
        `${forgedItem}${occupantId('occ-2')}`,
      ),
    );

    expect(events).toContainEqual({
      type: 'message',
      message: expect.objectContaining({ senderId: 'h4VLVhbl' }),
    });
    expect(
      events.some(
        (event) =>
          event.type === 'message' &&
          event.message.senderId === '28849d86070e4c099c877ab6837c61f0',
      ),
    ).toBe(false);
  });

  it('leaves a live message unattributed when only a forged item names someone', async () => {
    const { connection, events } = await openThread();

    deliver(connection, live('stranger', 'who am i', forgedItem));

    expect(events).toContainEqual({
      type: 'threadStale',
      peerId: 'support:c1',
    });
    expect(events.some(({ type }) => type === 'message')).toBe(false);
  });

  it('reads senders from the real JID on archived messages, but not from two', async () => {
    const { transport, connection } = await openThread();
    connection.archivePages.push((queryId) => [
      archived(queryId, '1', 'a_b1', ['a_b1@chat.daily.dev'], 'hello'),
      archived(
        queryId,
        '2',
        'h4_v_l_vhbl',
        [founderJid, 'h4_v_l_vhbl@chat.daily.dev'],
        'forged',
      ),
    ]);

    const messages = await transport.getMessages('support:c1');

    expect(messages).toEqual([
      expect.objectContaining({ senderId: 'aB1', body: 'hello' }),
      expect.objectContaining({ senderId: '', body: 'forged' }),
    ]);
  });

  it('retries the join under another nick when someone holds the viewer’s', async () => {
    const { transport, connection } = await connectedTransport();
    connection.archivePages.push(() => []);
    // Settles when the transport closes after the test.
    transport.getMessages('support:c1').catch(() => undefined);
    await flush();

    deliverPresence(
      connection,
      `<presence xmlns="jabber:client" from="${room}/me" type="error"><error type="cancel"><conflict xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></presence>`,
    );

    expect(mockPresenceTo).toHaveLength(2);
    expect(mockPresenceTo[1]).toMatch(new RegExp(`^${room}/me~1`));
  });

  it('rejoins an opened room after a new session', async () => {
    const { connection } = await openThread();
    expect(mockPresenceTo).toEqual([`${room}/me`]);

    connection.dropSocket();
    await new Promise((resolve) => setTimeout(resolve, 1100));
    connections[connections.length - 1].statusCallback?.(mockStatus.CONNECTED);
    await flush();
    await flush();

    expect(mockPresenceTo.filter((to) => to === `${room}/me`)).toHaveLength(2);
  });

  it('previews the top rows once, from the archive, without joining', async () => {
    const { transport, connection, events } = await connectedTransport();
    connection.archivePages.push((queryId) => [
      archived(queryId, '1', 'a_b1', ['a_b1@chat.daily.dev'], 'hello'),
    ]);

    const [row] = await transport.listConversations();
    expect(row).toMatchObject({
      peer: { id: 'support:c1', name: 'Acme' },
      lastMessage: { body: '', createdAt: '2026-11-23T10:00:00Z' },
      unreadCount: 1,
      isPreviewLoading: true,
    });
    await flush();
    await flush();
    expect(events).toContainEqual({
      type: 'conversationPreview',
      peerId: 'support:c1',
      message: expect.objectContaining({ senderId: 'aB1', body: 'hello' }),
    });

    const queries = connection.iqs;
    const [again] = await transport.listConversations();
    await flush();

    // Nothing newer per lastMessageAt: the loaded preview is reused.
    expect(again.lastMessage).toMatchObject({ body: 'hello' });
    expect(again.isPreviewLoading).toBeUndefined();
    expect(connection.iqs).toBe(queries);
    expect(mockPresenceTo).toEqual([]);
  });

  it('rereads the support rows from the API on refresh', async () => {
    const { transport, events } = await connectedTransport();
    jest
      .mocked(getCompanySupportChats)
      .mockResolvedValue([
        { ...chat, unreadCount: 3, lastMessageAt: '2026-11-23T11:00:00Z' },
      ]);

    transport.refreshSupportChats();
    await flush();
    await flush();

    expect(events).toContainEqual({
      type: 'supportConversations',
      conversations: [
        expect.objectContaining({
          unreadCount: 3,
          lastMessage: expect.objectContaining({
            createdAt: '2026-11-23T11:00:00Z',
          }),
        }),
      ],
    });
    expect(mockPresenceTo).toEqual([]);
  });

  it('sends to the room and reports the message to the support chat', async () => {
    const { transport, connection } = await openThread();

    const sent = await transport.send(supportChatToPeer(chat), 'hello');
    connection.ackAll();
    await transport.markRead('support:c1');

    expect(sent).toMatchObject({
      peerId: 'support:c1',
      status: DmMessageStatus.Sending,
    });
    expect(startDirectMessage).not.toHaveBeenCalled();
    expect(markDirectMessageSent).not.toHaveBeenCalled();
    expect(markCompanySupportMessageSent).toHaveBeenCalledWith('c1', 'hello');
    expect(markCompanySupportChatRead).toHaveBeenCalledWith('c1');
  });
});
