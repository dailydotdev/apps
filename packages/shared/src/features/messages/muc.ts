import { NS_DELAY, NS_SID, bareJid, encodeJidLocal } from './stanzas';

// XEP-0045 multi-user chat, as company page support chats use it. daily-api
// creates the members-only room and affiliates its members; the client only
// joins it and talks. The room archives its messages (XEP-0313), so history
// comes from the archive and the join asks for none.
//
// Rooms are non-anonymous, so the server tells every occupant the real JID
// behind each nick. A nick is whatever the joining client asked for, so it
// never says who wrote a message: the sender comes from the real JID, which
// the server puts on presence and on archived messages, and live messages are
// matched to it through their occupant id (XEP-0421) or nick.
//
// Only the archive's <item jid/> is the server's. On a live message ejabberd
// passes a client's own muc#user element through untouched, so it is never
// read there; the occupant id, which the room overwrites, is.

export const NS_MUC = 'http://jabber.org/protocol/muc';
export const NS_MUC_USER = `${NS_MUC}#user`;
export const NS_OCCUPANT_ID = 'urn:xmpp:occupant-id:0';

// The nick the viewer asks for: their own JID local part, so it is unique
// unless someone else took it first. After a conflict a suffixed one is used;
// nothing reads identity off it either way.
export const roomNickForUser = (userId: string, attempt = 0): string =>
  attempt
    ? `${encodeJidLocal(userId)}~${attempt.toString(36)}${Math.random()
        .toString(36)
        .slice(2, 6)}`
    : encodeJidLocal(userId);

export const occupantJid = (roomJid: string, nick: string): string =>
  `${roomJid}/${nick}`;

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

const itemJidsOf = (el: Element): string[] =>
  Array.from(el.children)
    .filter(
      (child) =>
        child.localName === 'x' && child.getAttribute('xmlns') === NS_MUC_USER,
    )
    .flatMap((x) =>
      Array.from(x.children)
        .filter((child) => child.localName === 'item')
        .map((item) => item.getAttribute('jid'))
        .filter((jid): jid is string => !!jid),
    );

// The real JID the server attached, from <x xmlns="…muc#user"><item jid/>.
// More than one means someone else added theirs, so none is trusted.
const realJidOf = (el: Element): string | undefined => {
  const jids = itemJidsOf(el);

  return jids.length === 1 ? bareJid(jids[0]) : undefined;
};

const occupantIdOf = (el: Element): string | undefined =>
  childOf(el, 'occupant-id', NS_OCCUPANT_ID)?.getAttribute('id') ?? undefined;

// A groupchat message as it arrived, before its sender is resolved.
export type RawRoomMessage = {
  id: string;
  roomJid: string;
  nick: string;
  occupantId?: string;
  // Only set on an archived copy, where the server put it.
  realJid?: string;
  isArchived: boolean;
  body: string;
  createdAt: string;
};

// A groupchat message with a body, live or from the room's archive. The
// archive passes its own stamp and id, since the forwarded copy may lack them.
export const parseRoomMessage = (
  message: Element,
  {
    stamp,
    stanzaId,
    isArchived = false,
  }: { stamp?: string; stanzaId?: string; isArchived?: boolean } = {},
): RawRoomMessage | null => {
  if (message.getAttribute('type') !== 'groupchat') {
    return null;
  }

  const body = childOf(message, 'body')?.textContent;
  const occupant = splitOccupant(message.getAttribute('from'));
  // Subject changes and bodyless stanzas (chat states) are not messages.
  if (!body || !occupant || childOf(message, 'subject')) {
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
    id: originId ?? message.getAttribute('id') ?? stanzaId ?? createdAt,
    roomJid: occupant.roomJid,
    nick: occupant.nick,
    occupantId: occupantIdOf(message),
    realJid: isArchived ? realJidOf(message) : undefined,
    isArchived,
    body,
    createdAt,
  };
};

export type RoomJoinFailure = 'conflict' | 'forbidden' | 'gone' | 'unknown';

export type RoomPresence =
  // Someone, maybe the viewer, is in the room as `nick`.
  | {
      kind: 'occupant';
      roomJid: string;
      nick: string;
      occupantId?: string;
      realJid?: string;
      isSelf: boolean;
    }
  // Someone left. For the viewer this also covers being removed from the
  // room, e.g. after losing their membership.
  | { kind: 'left'; roomJid: string; nick: string; isSelf: boolean }
  // The room was destroyed, or the service shut down.
  | { kind: 'ended'; roomJid: string }
  | { kind: 'joinFailed'; roomJid: string; reason: RoomJoinFailure };

const joinFailure = (presence: Element): RoomJoinFailure => {
  const error = childOf(presence, 'error');
  const names = new Set(
    Array.from(error?.children ?? []).map((child) => child.localName),
  );
  if (names.has('conflict')) {
    return 'conflict';
  }
  // Not a member (any more), or banned.
  if (names.has('registration-required') || names.has('forbidden')) {
    return 'forbidden';
  }
  if (names.has('item-not-found') || names.has('gone')) {
    return 'gone';
  }

  return 'unknown';
};

export const parseRoomPresence = (presence: Element): RoomPresence | null => {
  const occupant = splitOccupant(presence.getAttribute('from'));
  if (!occupant) {
    return null;
  }
  const { roomJid, nick } = occupant;
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
  // 332: the service shut down; the room is as good as ended.
  if (codes.has('332')) {
    return { kind: 'ended', roomJid };
  }
  // 110: this presence is about the viewer themselves.
  const isSelf = codes.has('110');

  // 303: a nick change. The occupant stays; their new nick follows.
  if (type === 'unavailable' && codes.has('303')) {
    return null;
  }

  if (type === 'unavailable') {
    return { kind: 'left', roomJid, nick, isSelf };
  }

  return {
    kind: 'occupant',
    roomJid,
    nick,
    occupantId: occupantIdOf(presence),
    realJid: realJidOf(presence),
    isSelf,
  };
};
