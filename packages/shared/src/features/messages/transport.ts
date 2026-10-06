import type { DmTransport } from './types';
import { createMockTransport } from './mockTransport';
import { createXmppTransport } from './xmppTransport';

const chatWebsocketUrl = process.env.NEXT_PUBLIC_CHAT_WS_URL;

// Without a chat server configured (local dev, previews) the UI runs on the
// in-browser mock, so it can be worked on without ejabberd.
export const isDmMockMode = !chatWebsocketUrl;

const transports = new Map<string, DmTransport>();

// One transport per signed-in user, so every hook shares the same connection
// and listeners.
export const getDmTransport = (userId: string): DmTransport => {
  const existing = transports.get(userId);
  if (existing) {
    return existing;
  }

  const transport = chatWebsocketUrl
    ? createXmppTransport({ userId, url: chatWebsocketUrl })
    : createMockTransport(userId);
  transports.set(userId, transport);

  return transport;
};
