import type { CompanySupportChat } from './graphql';
import { DirectMessageAccess } from './graphql';
import type { DmPeer } from './types';

// A company page's support chat travels through the direct message pipeline
// as a peer of its own, so the inbox, thread and live updates carry it
// without a second set of caches. Its id can never clash with a user id,
// which has no colon.
const SUPPORT_PEER_PREFIX = 'support:';

export const toSupportPeerId = (chatId: string): string =>
  `${SUPPORT_PEER_PREFIX}${chatId}`;

export const getSupportChatId = (peerId?: string): string | undefined =>
  peerId?.startsWith(SUPPORT_PEER_PREFIX)
    ? peerId.slice(SUPPORT_PEER_PREFIX.length) || undefined
    : undefined;

export const isSupportPeerId = (peerId?: string): boolean =>
  !!getSupportChatId(peerId);

export const supportChatToPeer = (chat: CompanySupportChat): DmPeer => ({
  id: toSupportPeerId(chat.id),
  name: chat.source.name,
  image: chat.source.image,
  permalink: chat.source.permalink,
  username: chat.source.handle,
  access: DirectMessageAccess.Open,
  group: {
    chatId: chat.id,
    roomJid: chat.jid,
    members: chat.members.map((member) => ({
      ...member,
      username: member.username ?? '',
    })),
  },
});
