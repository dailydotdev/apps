import type {
  DmCommentContext,
  DmMessage,
  DmReaction,
  DmReactions,
} from './types';
import { DM_MAX_REACTIONS_PER_USER, DmMessageStatus } from './types';

export const NS_MAM = 'urn:xmpp:mam:2';
export const NS_RSM = 'http://jabber.org/protocol/rsm';
export const NS_DATA = 'jabber:x:data';
export const NS_FORWARD = 'urn:xmpp:forward:0';
export const NS_DELAY = 'urn:xmpp:delay';
export const NS_SID = 'urn:xmpp:sid:0';
export const NS_CARBONS = 'urn:xmpp:carbons:2';
export const NS_REACTIONS = 'urn:xmpp:reactions:0';
export const NS_HINTS = 'urn:xmpp:hints';
// Agreed with the skirnir owner; bump the trailing version on breaking changes.
export const NS_COMMENT_REF = 'urn:daily:chat:comment-ref:0';

// Local part and domain compare case-insensitively; only the resource, which
// this drops, is case-sensitive.
export const bareJid = (jid: string): string => jid.split('/')[0].toLowerCase();

// ejabberd case-folds the local part while user ids are mixed-case, so the
// SkirnirService contract encodes each uppercase letter as "_" plus its
// lowercase form. Ids never contain "_", which keeps the mapping reversible.
export const encodeJidLocal = (userId: string): string =>
  userId.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const decodeJidLocal = (local: string): string =>
  local.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

export const userIdFromJid = (jid: string): string =>
  decodeJidLocal(bareJid(jid).split('@')[0]);

export const jidForUser = (userId: string, domain: string): string =>
  `${encodeJidLocal(userId)}@${domain}`;

const childOf = (el: Element, name: string, ns?: string): Element | undefined =>
  Array.from(el.children).find(
    (child) =>
      child.localName === name &&
      (!ns || child.namespaceURI === ns || child.getAttribute('xmlns') === ns),
  );

const textOf = (el: Element, name: string): string | undefined =>
  childOf(el, name)?.textContent ?? undefined;

export const parseCommentRef = (
  message: Element,
): DmCommentContext | undefined => {
  const ref = childOf(message, 'comment-ref', NS_COMMENT_REF);
  const commentId = ref?.getAttribute('id');
  const authorId = ref?.getAttribute('author-id');
  const permalink = ref?.getAttribute('url');
  const snippet = ref && textOf(ref, 'snippet');

  if (!ref || !commentId || !authorId || !permalink || !snippet) {
    return undefined;
  }

  return {
    type: 'comment',
    commentId,
    authorId,
    permalink,
    snippet,
    postTitle: textOf(ref, 'title'),
  };
};

type ParseOptions = {
  ownBareJid: string;
  // MAM results carry these on the wrapper rather than the message itself.
  stanzaId?: string;
  stamp?: string;
};

type Parties = { peerId: string; senderId: string };

const getParties = (message: Element, ownBareJid: string): Parties | null => {
  const type = message.getAttribute('type');

  if (type && type !== 'chat') {
    return null;
  }

  // Our own archived messages may omit `from`; it is always us then.
  const from = bareJid(message.getAttribute('from') ?? ownBareJid);
  const isMine = from === ownBareJid;
  const to = message.getAttribute('to');
  const peerJid = isMine ? to && bareJid(to) : from;
  const ownDomain = ownBareJid.split('@')[1];

  // Ids only identify a daily.dev user on our own chat domain; anything else
  // (federation, a forged sender) would land in that user's thread.
  if (!peerJid || peerJid.split('@')[1] !== ownDomain) {
    return null;
  }

  return { peerId: userIdFromJid(peerJid), senderId: userIdFromJid(from) };
};

export const parseChatMessage = (
  message: Element,
  { ownBareJid, stanzaId, stamp }: ParseOptions,
): DmMessage | null => {
  const body = textOf(message, 'body');
  const parties = body && getParties(message, ownBareJid);

  if (!parties) {
    return null;
  }

  const context = parseCommentRef(message);
  const originId = childOf(message, 'origin-id', NS_SID)?.getAttribute('id');
  const serverId = Array.from(message.children)
    .find(
      (child) =>
        child.localName === 'stanza-id' &&
        bareJid(child.getAttribute('by') ?? '') === ownBareJid,
    )
    ?.getAttribute('id');

  return {
    // The origin id is ours and survives archiving, so it matches the
    // optimistic bubble; the server id is the fallback for other clients.
    id:
      originId ??
      stanzaId ??
      serverId ??
      message.getAttribute('id') ??
      `${parties.senderId}-${stamp ?? Date.now()}`,
    ...parties,
    body,
    createdAt:
      stamp ??
      childOf(message, 'delay', NS_DELAY)?.getAttribute('stamp') ??
      new Date().toISOString(),
    status: DmMessageStatus.Sent,
    ...(context && { context }),
  };
};

const maxEmojiLength = 32;
const emojiPattern =
  /^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|\u200d|\ufe0f|\u20e3)+$/u;
const pictographPattern =
  /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u;

// Reactions are free text on the wire, so anything that isn't a short emoji
// (words, markup, a wall of flags) is dropped rather than rendered.
export const sanitizeReactionEmojis = (emojis: string[]): string[] =>
  Array.from(
    new Set(
      emojis
        .map((emoji) => emoji.trim())
        .filter(
          (emoji) =>
            emoji.length <= maxEmojiLength &&
            emojiPattern.test(emoji) &&
            pictographPattern.test(emoji),
        ),
    ),
  ).slice(0, DM_MAX_REACTIONS_PER_USER);

// XEP-0444. A reaction has no body, so parseChatMessage skips it.
export const parseReaction = (
  message: Element,
  ownBareJid: string,
): DmReaction | null => {
  const reactions = childOf(message, 'reactions', NS_REACTIONS);
  const messageId = reactions?.getAttribute('id');
  const parties = messageId && getParties(message, ownBareJid);

  if (!reactions || !parties) {
    return null;
  }

  return {
    ...parties,
    messageId,
    emojis: sanitizeReactionEmojis(
      Array.from(reactions.children)
        .filter((child) => child.localName === 'reaction')
        .map((child) => child.textContent ?? ''),
    ),
  };
};

export const applyReaction = (
  messages: DmMessage[],
  { messageId, senderId, emojis }: DmReaction,
): DmMessage[] =>
  messages.map((message) => {
    if (message.id !== messageId) {
      return message;
    }

    const reactions: DmReactions = {};
    Object.entries(message.reactions ?? {}).forEach(([emoji, userIds]) => {
      const others = userIds.filter((id) => id !== senderId);
      if (others.length) {
        reactions[emoji] = others;
      }
    });
    emojis.forEach((emoji) => {
      reactions[emoji] = [...(reactions[emoji] ?? []), senderId];
    });

    return { ...message, reactions };
  });

export const getOwnReactions = (message: DmMessage, userId: string): string[] =>
  Object.entries(message.reactions ?? {})
    .filter(([, userIds]) => userIds.includes(userId))
    .map(([emoji]) => emoji);

// Carbons (XEP-0280) wrap a copy of a message another of our sessions sent or
// received. Only the account itself may send them, or anyone could forge
// messages "from" us.
export const unwrapCarbon = (
  stanza: Element,
  ownBareJid: string,
): Element | null | undefined => {
  const wrapper =
    childOf(stanza, 'received', NS_CARBONS) ??
    childOf(stanza, 'sent', NS_CARBONS);

  if (!wrapper) {
    return undefined;
  }

  if (bareJid(stanza.getAttribute('from') ?? '') !== ownBareJid) {
    return null;
  }

  const forwarded = childOf(wrapper, 'forwarded', NS_FORWARD);

  return (forwarded && childOf(forwarded, 'message')) ?? null;
};

export type MamResult = {
  stanzaId: string;
  stamp?: string;
  message: Element;
};

export const parseMamResult = (
  stanza: Element,
  queryId: string,
  ownBareJid: string,
): MamResult | null => {
  const result = childOf(stanza, 'result', NS_MAM);
  const from = stanza.getAttribute('from');

  // XEP-0313: results come from our own archive, so the wrapper has no from
  // or our bare JID; anything else is a forged "archived" message.
  if (
    !result ||
    result.getAttribute('queryid') !== queryId ||
    (from && bareJid(from) !== ownBareJid)
  ) {
    return null;
  }

  const forwarded = childOf(result, 'forwarded', NS_FORWARD);
  const message = forwarded && childOf(forwarded, 'message');

  if (!forwarded || !message) {
    return null;
  }

  return {
    stanzaId: result.getAttribute('id') ?? '',
    stamp:
      childOf(forwarded, 'delay', NS_DELAY)?.getAttribute('stamp') ?? undefined,
    message,
  };
};

export const isMamResult = (stanza: Element): boolean =>
  !!childOf(stanza, 'result', NS_MAM);
