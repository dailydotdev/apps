import type { DmChatState, RoomJoinFailure, RoomMessage } from './types';
import {
  NS_CHAT_STATES,
  NS_DELAY,
  NS_REACTIONS,
  NS_SID,
  bareJid,
  encodeJidLocal,
  sanitizeReactionEmojis,
  userIdFromJid,
} from './stanzas';

// XEP-0045 multi-user chat, as live chat rooms use it. Rooms live on the
// conference service; daily-api creates them and hands out their JIDs, and
// the client only ever joins, talks and leaves.
//
// Who an occupant is comes from the server, never from their nick: a room is
// non-anonymous, so every occupant's presence carries the real JID of the
// session behind it, and the client maps nick to user id from that. A nick
// is just a label an occupant picked, which is why nothing here decodes one.

export const NS_MUC = 'http://jabber.org/protocol/muc';
export const NS_MUC_USER = `${NS_MUC}#user`;
const NS_ADDRESS = 'http://jabber.org/protocol/address';

// How much of the room's recent history ejabberd replays on join. The room
// keeps nothing older anyway: live rooms are not archived.
export const ROOM_HISTORY_STANZAS = 50;

// The viewer's own nick is their JID local part: unique in the room.
export const roomNickForUser = (userId: string): string =>
  encodeJidLocal(userId);

export const occupantJid = (roomJid: string, userId: string): string =>
  `${roomJid}/${roomNickForUser(userId)}`;

const childOf = (el: Element, name: string, ns?: string): Element | undefined =>
  Array.from(el.children).find(
    (child) =>
      child.localName === name && (!ns || child.getAttribute('xmlns') === ns),
  );

const textOf = (el: Element, name: string): string | undefined =>
  childOf(el, name)?.textContent ?? undefined;

// `from` of anything a room sends is room@service/nick.
const splitOccupant = (
  from: string | null,
): { roomJid: string; nick: string } | null => {
  if (!from) {
    return null;
  }
  const [room, nick] = from.split('/');
  if (!room || !nick) {
    return null;
  }

  return { roomJid: bareJid(room), nick };
};

// A daily.dev user id from a real JID the server put in a stanza, or null
// for anything off our own chat domain.
const userIdFromRealJid = (
  jid: string | null | undefined,
  ownDomain: string,
): string | null => {
  if (!jid || bareJid(jid).split('@')[1] !== ownDomain) {
    return null;
  }
  try {
    return userIdFromJid(jid) || null;
  } catch {
    return null;
  }
};

export const parseRoomMessage = (
  message: Element,
  ownDomain: string,
): RoomMessage | null => {
  if (message.getAttribute('type') !== 'groupchat') {
    return null;
  }

  const body = textOf(message, 'body');
  const occupant = splitOccupant(message.getAttribute('from'));
  // Subject changes and bodyless stanzas (chat states) are not messages.
  if (!body || !occupant || childOf(message, 'subject')) {
    return null;
  }

  const stamp = childOf(message, 'delay', NS_DELAY)?.getAttribute('stamp');
  const originId = childOf(message, 'origin-id', NS_SID)?.getAttribute('id');
  // Replayed history names the original sender (XEP-0033 ofrom), since they
  // may have left; a live message's sender is whoever holds the nick now.
  const ofrom = Array.from(
    childOf(message, 'addresses', NS_ADDRESS)?.children ?? [],
  ).find(
    (child) =>
      child.localName === 'address' && child.getAttribute('type') === 'ofrom',
  );

  return {
    id:
      originId ??
      message.getAttribute('id') ??
      `${occupant.nick}-${stamp ?? Date.now()}`,
    roomJid: occupant.roomJid,
    nick: occupant.nick,
    senderId: userIdFromRealJid(ofrom?.getAttribute('jid'), ownDomain),
    body,
    createdAt: stamp ?? new Date().toISOString(),
    ...(stamp && { isHistory: true }),
  };
};

const chatStates: DmChatState[] = [
  'active',
  'composing',
  'paused',
  'inactive',
  'gone',
];

export const parseRoomChatState = (
  message: Element,
): { roomJid: string; nick: string; state: DmChatState } | null => {
  if (message.getAttribute('type') !== 'groupchat' || textOf(message, 'body')) {
    return null;
  }

  const state = chatStates.find((name) =>
    childOf(message, name, NS_CHAT_STATES),
  );
  const occupant = state && splitOccupant(message.getAttribute('from'));

  return occupant && state ? { ...occupant, state } : null;
};

export const parseRoomReaction = (
  message: Element,
): {
  roomJid: string;
  nick: string;
  messageId: string;
  emojis: string[];
} | null => {
  if (message.getAttribute('type') !== 'groupchat') {
    return null;
  }
  const reactions = childOf(message, 'reactions', NS_REACTIONS);
  const messageId = reactions?.getAttribute('id');
  const occupant = splitOccupant(message.getAttribute('from'));
  if (!reactions || !messageId || !occupant) {
    return null;
  }

  return {
    ...occupant,
    messageId,
    emojis: sanitizeReactionEmojis(
      Array.from(reactions.children)
        .filter((child) => child.localName === 'reaction')
        .map((child) => child.textContent ?? ''),
    ),
  };
};

export type RoomOccupant = {
  roomJid: string;
  nick: string;
  // The user behind the nick, from the real JID the server attached; null
  // when it attached none (a room that hides JIDs) or it is off our domain.
  userId: string | null;
  isPresent: boolean;
};

// Every occupant presence the room sends, the viewer's own included.
export const parseRoomOccupant = (
  presence: Element,
  ownDomain: string,
): RoomOccupant | null => {
  const occupant = splitOccupant(presence.getAttribute('from'));
  const type = presence.getAttribute('type');
  if (!occupant || (type && type !== 'unavailable')) {
    return null;
  }
  const item = childOf(childOf(presence, 'x', NS_MUC_USER) ?? presence, 'item');
  if (!item) {
    return null;
  }

  return {
    ...occupant,
    userId: userIdFromRealJid(item.getAttribute('jid'), ownDomain),
    isPresent: type !== 'unavailable',
  };
};

export type RoomPresence =
  | { kind: 'joined'; roomJid: string }
  // The viewer is out: they left, or were kicked or banned.
  | { kind: 'left'; roomJid: string }
  | { kind: 'ended'; roomJid: string }
  | { kind: 'joinFailed'; roomJid: string; reason: RoomJoinFailure };

const joinFailure = (presence: Element): RoomJoinFailure => {
  const error = childOf(presence, 'error');
  const names = new Set(
    Array.from(error?.children ?? []).map((child) => child.localName),
  );
  if (names.has('forbidden')) {
    return 'banned';
  }
  if (names.has('service-unavailable')) {
    return 'full';
  }
  if (names.has('item-not-found') || names.has('gone')) {
    return 'gone';
  }

  return 'unknown';
};

// What the viewer's own presence in a room says about their seat.
export const parseRoomPresence = (presence: Element): RoomPresence | null => {
  const occupant = splitOccupant(presence.getAttribute('from'));
  if (!occupant) {
    return null;
  }
  const { roomJid } = occupant;
  const type = presence.getAttribute('type');

  if (type === 'error') {
    return { kind: 'joinFailed', roomJid, reason: joinFailure(presence) };
  }

  const user = childOf(presence, 'x', NS_MUC_USER);
  if (!user) {
    return null;
  }

  if (childOf(user, 'destroy')) {
    return { kind: 'ended', roomJid };
  }

  const codes = new Set(
    Array.from(user.children)
      .filter((child) => child.localName === 'status')
      .map((child) => child.getAttribute('code')),
  );
  // 110: this presence is about the viewer themselves.
  if (!codes.has('110')) {
    return null;
  }
  // 332: the service shut down; the room is as good as ended.
  if (codes.has('332')) {
    return { kind: 'ended', roomJid };
  }

  return { kind: type === 'unavailable' ? 'left' : 'joined', roomJid };
};
