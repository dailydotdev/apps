import { fallbackImages } from '../../lib/config';
import type {
  DmConversation,
  DmEvent,
  DmMessage,
  DmPeer,
  DmTransport,
} from './types';
import { DmMessageStatus } from './types';

// In-memory stand-in for ejabberd until the backend exists. It persists to
// localStorage so a demo survives reloads, answers every message after a short
// delay, and fails any message that is exactly `/fail` to show the retry flow.

type StoredConversation = {
  peer: DmPeer;
  messages: DmMessage[];
  unreadCount: number;
};

type Store = Record<string, StoredConversation>;

const storageVersion = 1;
const sendDelayMs = 400;
const replyDelayMs = 1800;

const cannedReplies = [
  'Ha, that is exactly what I was thinking.',
  'Interesting, do you have a link to that?',
  'Agreed. Shipping it behind a flag first sounds right.',
  'Let me check and get back to you 👀',
  'Nice! Did you see the discussion on that post yesterday?',
];

const mockPeer = (
  id: string,
  name: string,
  username: string,
  acceptsMessages = true,
): DmPeer => ({
  id,
  name,
  username,
  image: fallbackImages.avatar,
  permalink: `https://app.daily.dev/${username}`,
  acceptsMessages,
});

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

const seedStore = (userId: string): Store => {
  const conversation = (
    peer: DmPeer,
    lines: [fromPeer: boolean, body: string, minutes: number][],
    unreadCount = 0,
  ): StoredConversation => ({
    peer,
    unreadCount,
    messages: lines.map(([fromPeer, body, minutes], index) => ({
      id: `seed-${peer.id}-${index}`,
      peerId: peer.id,
      senderId: fromPeer ? peer.id : userId,
      body,
      createdAt: minutesAgo(minutes),
      status: DmMessageStatus.Sent,
    })),
  });

  const ada = mockPeer('mock-ada', 'Ada Lovelace', 'ada');
  const linus = mockPeer('mock-linus', 'Linus Torvalds', 'linus');
  const grace = mockPeer('mock-grace', 'Grace Hopper', 'grace', false);

  return {
    [ada.id]: conversation(
      ada,
      [
        [true, 'Hey! Loved your comment on the Rust post.', 180],
        [false, 'Thanks! That borrow checker thread got wild.', 175],
        [true, 'Want to pair on that side project this week?', 4],
      ],
      1,
    ),
    [linus.id]: conversation(linus, [
      [false, 'Any tips for getting started with kernel dev?', 60 * 26],
      [true, 'Start small. Read the mailing list for a month first.', 60 * 25],
    ]),
    [grace.id]: conversation(grace, [
      [
        true,
        'It is always easier to ask forgiveness than permission.',
        60 * 72,
      ],
    ]),
  };
};

const sortByLatest = (a: DmConversation, b: DmConversation): number =>
  b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt);

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const createMockTransport = (userId: string): DmTransport => {
  const storageKey = `dm_mock_v${storageVersion}_${userId}`;
  const listeners = new Set<(event: DmEvent) => void>();

  const load = (): Store => {
    try {
      const raw = globalThis.localStorage?.getItem(storageKey);
      if (raw) {
        return JSON.parse(raw) as Store;
      }
    } catch {
      // Private windows and blocked storage fall through to a fresh seed.
    }

    return seedStore(userId);
  };

  let store = load();

  const persist = () => {
    try {
      globalThis.localStorage?.setItem(storageKey, JSON.stringify(store));
    } catch {
      // The demo still works for the session without storage.
    }
  };

  const append = (peer: DmPeer, message: DmMessage, isIncoming: boolean) => {
    const existing = store[peer.id];
    store = {
      ...store,
      [peer.id]: {
        peer: existing?.peer ?? peer,
        messages: [...(existing?.messages ?? []), message],
        unreadCount: (existing?.unreadCount ?? 0) + (isIncoming ? 1 : 0),
      },
    };
    persist();
  };

  const scheduleReply = (peer: DmPeer) => {
    setTimeout(() => {
      const message: DmMessage = {
        id: `mock-${Date.now()}-${peer.id}`,
        peerId: peer.id,
        senderId: peer.id,
        body: cannedReplies[Math.floor(Math.random() * cannedReplies.length)],
        createdAt: new Date().toISOString(),
        status: DmMessageStatus.Sent,
      };
      append(peer, message, true);
      listeners.forEach((listener) => listener({ type: 'message', message }));
    }, replyDelayMs);
  };

  return {
    listConversations: async () =>
      Object.values(store)
        .filter(({ messages }) => messages.length > 0)
        .map(({ peer, messages, unreadCount }) => ({
          peer,
          unreadCount,
          lastMessage: messages[messages.length - 1],
        }))
        .sort(sortByLatest),
    getMessages: async (peerId) => store[peerId]?.messages ?? [],
    send: async (peer, body, context) => {
      await wait(sendDelayMs);

      if (body.trim() === '/fail' || !peer.acceptsMessages) {
        throw new Error('Message could not be delivered');
      }

      const message: DmMessage = {
        id: `mock-${Date.now()}-${userId}`,
        peerId: peer.id,
        senderId: userId,
        body,
        createdAt: new Date().toISOString(),
        status: DmMessageStatus.Sent,
        ...(context && { context }),
      };
      append(peer, message, false);
      scheduleReply(peer);

      return message;
    },
    markRead: async (peerId) => {
      if (!store[peerId]?.unreadCount) {
        return;
      }

      store = { ...store, [peerId]: { ...store[peerId], unreadCount: 0 } };
      persist();
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};
