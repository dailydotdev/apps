import { getDemoSnapshot } from './fixtures';
import { INVITE_LEDGER_CORES_PER_INVITE } from './types';

describe('inviteLedger/fixtures', () => {
  it('empty mode returns zero rows and no news', () => {
    const snap = getDemoSnapshot('empty');
    expect(snap.rows).toHaveLength(0);
    expect(snap.invitesAccepted).toBe(0);
    expect(snap.hasNews).toBe(false);
    expect(snap.newsCohortKey).toBe('');
  });

  it('single mode returns one row that drives the strip', () => {
    const snap = getDemoSnapshot('single');
    expect(snap.rows).toHaveLength(1);
    expect(snap.invitesAccepted).toBe(1);
    expect(snap.recentJoins).toHaveLength(1);
    expect(snap.hasNews).toBe(true);
    expect(snap.coresGiftedToFriends).toBe(INVITE_LEDGER_CORES_PER_INVITE);
  });

  it('full mode includes joined + pending + expired and at least 2 recent joins', () => {
    const snap = getDemoSnapshot('full');
    const statuses = snap.rows.map((r) => r.status);
    expect(statuses).toContain('joined');
    expect(statuses).toContain('pending');
    expect(statuses).toContain('expired');
    expect(snap.recentJoins.length).toBeGreaterThanOrEqual(2);
    expect(snap.hasNews).toBe(true);
    // invitesAccepted only counts joined
    expect(snap.invitesAccepted).toBe(
      snap.rows.filter((r) => r.status === 'joined').length,
    );
  });
});
