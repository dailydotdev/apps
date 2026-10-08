import { DirectMessageAccess } from './graphql';

export enum DmAccess {
  Allowed = 'allowed',
  BlockedByMe = 'blocked_by_me',
  SelfDisabled = 'self_disabled',
  PeerUnavailable = 'peer_unavailable',
  // The peer asked to message the viewer, who hasn't answered yet.
  RequestReceived = 'request_received',
  // The users don't follow each other, so the viewer has to ask first.
  RequestRequired = 'request_required',
  RequestPending = 'request_pending',
}

type DmAccessInput = {
  isBlockedByMe: boolean;
  allowsMessages: boolean;
  peerAccess: DirectMessageAccess;
  hasIncomingRequest: boolean;
};

// Client-side mirror of the rule the backend enforces. Turning direct
// messages off also stops you sending, so no conversation is one-way.
export const getDmAccess = ({
  isBlockedByMe,
  allowsMessages,
  peerAccess,
  hasIncomingRequest,
}: DmAccessInput): DmAccess => {
  if (isBlockedByMe) {
    return DmAccess.BlockedByMe;
  }

  if (!allowsMessages) {
    return DmAccess.SelfDisabled;
  }

  if (peerAccess === DirectMessageAccess.Unavailable) {
    return DmAccess.PeerUnavailable;
  }

  // The server already lets a recipient reply, which would accept the
  // request; asking first keeps that a deliberate choice.
  if (hasIncomingRequest) {
    return DmAccess.RequestReceived;
  }

  if (peerAccess === DirectMessageAccess.Request) {
    return DmAccess.RequestRequired;
  }

  if (peerAccess === DirectMessageAccess.Pending) {
    return DmAccess.RequestPending;
  }

  return DmAccess.Allowed;
};
