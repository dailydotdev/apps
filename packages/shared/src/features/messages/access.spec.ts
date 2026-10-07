import { DmAccess, getDmAccess } from './access';

describe('getDmAccess', () => {
  const open = {
    isBlockedByMe: false,
    allowsMessages: true,
    peerAcceptsMessages: true,
  };

  it('allows messaging when nothing stands in the way', () => {
    expect(getDmAccess(open)).toBe(DmAccess.Allowed);
  });

  it('puts an existing block ahead of every other reason', () => {
    expect(
      getDmAccess({
        isBlockedByMe: true,
        allowsMessages: false,
        peerAcceptsMessages: false,
      }),
    ).toBe(DmAccess.BlockedByMe);
  });

  it('stops sending when the viewer turned direct messages off', () => {
    expect(getDmAccess({ ...open, allowsMessages: false })).toBe(
      DmAccess.SelfDisabled,
    );
  });

  it('reports a peer who does not accept messages', () => {
    expect(getDmAccess({ ...open, peerAcceptsMessages: false })).toBe(
      DmAccess.PeerUnavailable,
    );
  });
});
