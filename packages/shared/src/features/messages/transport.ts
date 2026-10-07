import type { DmEvent, DmTransport } from './types';

const chatWebsocketUrl = process.env.NEXT_PUBLIC_CHAT_WS_URL;

// The in-browser mock is strictly opt-in for working on the UI without
// ejabberd. A build with neither setting has no direct messages at all, so a
// surface that lacks the URL (e.g. the extension) can never fall back to
// fake conversations.
export const isDmMockMode =
  !chatWebsocketUrl && process.env.NEXT_PUBLIC_CHAT_MOCK === 'true';

export const isDmAvailable = !!chatWebsocketUrl || isDmMockMode;

// Unread counts need the server-side inbox module; until then only the mock
// has them, and asking the real server would open a session on every page.
export const supportsUnreadCounts = isDmMockMode;

// Both implementations load on first use, so pages without messages never
// download the client or the mock's seed data.
const lazyTransport = (load: () => Promise<DmTransport>): DmTransport => {
  let loaded: Promise<DmTransport> | undefined;
  let isClosed = false;
  const get = () => {
    if (!loaded) {
      loaded = load();
      // A failed chunk load (network blip, stale chunk after a deploy) must
      // not stick, or every retry fails until a full reload.
      loaded.catch(() => {
        loaded = undefined;
      });
    }

    return loaded;
  };

  return {
    listConversations: async () => (await get()).listConversations(),
    getMessages: async (peerId) => (await get()).getMessages(peerId),
    send: async (peer, body, context, options) =>
      (await get()).send(peer, body, context, options),
    react: async (peer, messageId, emojis) =>
      (await get()).react(peer, messageId, emojis),
    markRead: async (peerId) => (await get()).markRead(peerId),
    subscribe: (listener: (event: DmEvent) => void) => {
      let unsubscribe: (() => void) | undefined;
      let isActive = true;
      get()
        .then((transport) => {
          if (isActive && !isClosed) {
            unsubscribe = transport.subscribe(listener);
          }
        })
        // Queries surface the failure and retry; live updates resume with
        // the next subscriber.
        .catch(() => undefined);

      return () => {
        isActive = false;
        unsubscribe?.();
      };
    },
    close: () => {
      isClosed = true;
      loaded?.then((transport) => transport.close()).catch(() => undefined);
    },
  };
};

const transports = new Map<string, DmTransport>();

export const closeDmTransports = (exceptUserId?: string): void => {
  transports.forEach((transport, userId) => {
    if (userId !== exceptUserId) {
      transport.close();
      transports.delete(userId);
    }
  });
};

// One transport per signed-in user, so every hook shares the same connection
// and listeners. Switching accounts closes the previous user's session.
export const getDmTransport = (userId: string): DmTransport => {
  const existing = transports.get(userId);
  if (existing) {
    return existing;
  }

  closeDmTransports(userId);
  const transport = lazyTransport(async () => {
    if (chatWebsocketUrl) {
      const { createXmppTransport } = await import('./xmppTransport');
      return createXmppTransport({ userId, url: chatWebsocketUrl });
    }

    if (!isDmMockMode) {
      throw new Error('Direct messages are not configured for this build');
    }

    const { createMockTransport } = await import('./mockTransport');
    return createMockTransport(userId);
  });
  transports.set(userId, transport);

  return transport;
};
