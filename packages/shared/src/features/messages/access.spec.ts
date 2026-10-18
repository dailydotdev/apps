import { DmAccess, getDmAccess } from './access';
import { DirectMessageAccess } from './graphql';

describe('getDmAccess', () => {
  const open = {
    isBlockedByMe: false,
    allowsMessages: true,
    peerAccess: DirectMessageAccess.Open,
    hasIncomingRequest: false,
  };

  it('allows messaging when nothing stands in the way', () => {
    expect(getDmAccess(open)).toBe(DmAccess.Allowed);
  });

  it('puts an existing block ahead of every other reason', () => {
    expect(
      getDmAccess({
        isBlockedByMe: true,
        allowsMessages: false,
        peerAccess: DirectMessageAccess.Unavailable,
        hasIncomingRequest: true,
      }),
    ).toBe(DmAccess.BlockedByMe);
  });

  it('stops sending when the viewer turned direct messages off', () => {
    expect(getDmAccess({ ...open, allowsMessages: false })).toBe(
      DmAccess.SelfDisabled,
    );
  });

  it('reports a peer who does not accept messages', () => {
    expect(
      getDmAccess({ ...open, peerAccess: DirectMessageAccess.Unavailable }),
    ).toBe(DmAccess.PeerUnavailable);
  });

  it('asks the recipient of a request to answer it before replying', () => {
    expect(getDmAccess({ ...open, hasIncomingRequest: true })).toBe(
      DmAccess.RequestReceived,
    );
  });

  it.each([
    [DirectMessageAccess.Request, DmAccess.RequestRequired],
    [DirectMessageAccess.Pending, DmAccess.RequestPending],
  ])('maps the server access %s', (peerAccess, expected) => {
    expect(getDmAccess({ ...open, peerAccess })).toBe(expected);
  });
});
