import type { DmMessage } from './types';
import { DmMessageStatus } from './types';
import {
  NS_DELAY,
  NS_SID,
  bareJid,
  decodeJidLocal,
  encodeJidLocal,
} from './stanzas';

// XEP-0045 multi-user chat, as company page support chats use it. daily-api
// creates the members-only room and affiliates its members; the client only
// joins it and talks. The room archives its messages (XEP-0313), so history
// comes from the archive and the join asks for none.

export const NS_MUC = 'http://jabber.org/protocol/muc';
export const NS_MUC_USER = `${NS_MUC}#user`;

// The occupant nick is the user's own JID local part, so every occupant is
// unique in the room and a sender's user id is read straight off the nick.
export const roomNickForUser = (userId: string): string =>
  encodeJidLocal(userId);

export const occupantJid = (roomJid: string, userId: string): string =>
  `${roomJid}/${roomNickForUser(userId)}`;

const childOf = (el: Element, name: string, ns?: string): Element | undefined =>
  Array.from(el.children).find(
    (child) =>
      child.localName === name && (!ns || child.getAttribute('xmlns') === ns),
  );

// `from` of anything a room sends is room@service/nick.
const splitOccupant = (
  from: string | null,
): { roomJid: string; nick: string } | null => {
  if (!from) {
    return null;
  }
  const slash = from.indexOf('/');
  if (slash <= 0 || slash === from.length - 1) {
    return null;
  }

  return {
    roomJid: bareJid(from.slice(0, slash)),
    nick: from.slice(slash + 1),
  };
};

const senderFromNick = (nick: string): string | null => {
  try {
    return decodeJidLocal(nick) || null;
  } catch {
    return null;
  }
};

export type RoomMessage = Omit<DmMessage, 'peerId'> & { roomJid: string };

// A groupchat message with a body, live or from the room's archive. The
// archive passes its own stamp and id, since the forwarded copy may lack them.
export const parseRoomMessage = (
  message: Element,
  { stamp, stanzaId }: { stamp?: string; stanzaId?: string } = {},
): RoomMessage | null => {
  if (message.getAttribute('type') !== 'groupchat') {
    return null;
  }

  const body = childOf(message, 'body')?.textContent;
  const occupant = splitOccupant(message.getAttribute('from'));
  // Subject changes and bodyless stanzas (chat states) are not messages.
  if (!body || !occupant || childOf(message, 'subject')) {
    return null;
  }

  const senderId = senderFromNick(occupant.nick);
  if (!senderId) {
    return null;
  }

  const createdAt =
    stamp ??
    childOf(message, 'delay', NS_DELAY)?.getAttribute('stamp') ??
    new Date().toISOString();
  const originId = childOf(message, 'origin-id', NS_SID)?.getAttribute('id');

  return {
    // The origin id is what the sender's optimistic copy carries, so the
    // room's reflection of it replaces that copy instead of doubling it.
    id:
      originId ??
      message.getAttribute('id') ??
      stanzaId ??
      `${senderId}-${createdAt}`,
    roomJid: occupant.roomJid,
    senderId,
    body,
    createdAt,
    status: DmMessageStatus.Sent,
  };
};

// The viewer's own presence in a room: status code 110 marks it. Whether the
// join went through or failed is all the transport waits on.
export const parseOwnRoomPresence = (
  presence: Element,
): { roomJid: string; isJoined: boolean } | null => {
  const occupant = splitOccupant(presence.getAttribute('from'));
  if (!occupant) {
    return null;
  }

  if (presence.getAttribute('type') === 'error') {
    return { roomJid: occupant.roomJid, isJoined: false };
  }

  const user = childOf(presence, 'x', NS_MUC_USER);
  const isOwn = Array.from(user?.children ?? []).some(
    (child) =>
      child.localName === 'status' && child.getAttribute('code') === '110',
  );
  if (!isOwn) {
    return null;
  }

  return {
    roomJid: occupant.roomJid,
    isJoined: presence.getAttribute('type') !== 'unavailable',
  };
};
