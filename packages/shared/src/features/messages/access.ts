export enum DmAccess {
  Allowed = 'allowed',
  BlockedByMe = 'blocked_by_me',
  SelfDisabled = 'self_disabled',
  PeerUnavailable = 'peer_unavailable',
}

type DmAccessInput = {
  isBlockedByMe: boolean;
  allowsMessages: boolean;
  peerAcceptsMessages: boolean;
};

// Client-side mirror of the rule the backend must enforce. Turning direct
// messages off also stops you sending, so no conversation is one-way.
export const getDmAccess = ({
  isBlockedByMe,
  allowsMessages,
  peerAcceptsMessages,
}: DmAccessInput): DmAccess => {
  if (isBlockedByMe) {
    return DmAccess.BlockedByMe;
  }

  if (!allowsMessages) {
    return DmAccess.SelfDisabled;
  }

  if (!peerAcceptsMessages) {
    return DmAccess.PeerUnavailable;
  }

  return DmAccess.Allowed;
};
