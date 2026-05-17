import {
  INVITE_MILESTONES,
  getCurrentInviteTier,
  getInviteTierProgress,
  getInvitesUntilNextTier,
  getNextInviteMilestone,
} from './milestones';

describe('invite milestones', () => {
  it('starts with no tier when user has zero invites', () => {
    expect(getCurrentInviteTier(0)).toBeNull();
    expect(getNextInviteMilestone(0)).toEqual(INVITE_MILESTONES[0]);
    expect(getInvitesUntilNextTier(0)).toBe(INVITE_MILESTONES[0].invites);
    expect(getInviteTierProgress(0)).toBe(0);
  });

  it('returns the first tier once one invite lands', () => {
    expect(getCurrentInviteTier(1)?.invites).toBe(1);
    expect(getNextInviteMilestone(1)?.invites).toBe(3);
    expect(getInvitesUntilNextTier(1)).toBe(2);
  });

  it('computes progress between two tiers', () => {
    // current 3 (Open Door) → next 5 (Inner Circle), at 4 we are 50%.
    expect(getInviteTierProgress(4)).toBe(50);
  });

  it('clamps progress at 100 when the top tier is reached', () => {
    const top = INVITE_MILESTONES[INVITE_MILESTONES.length - 1];
    expect(getNextInviteMilestone(top.invites)).toBeNull();
    expect(getInviteTierProgress(top.invites + 5)).toBe(100);
    expect(getInvitesUntilNextTier(top.invites + 5)).toBe(0);
  });
});
