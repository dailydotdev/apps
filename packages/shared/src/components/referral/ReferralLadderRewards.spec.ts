import { getNextReferralLadderStep } from '../../lib/referral';
import { getReferralLadderHeadline } from './ReferralLadderRewards';

const headlineFor = (referredCount: number): string => {
  const nextStep = getNextReferralLadderStep(referredCount);

  return getReferralLadderHeadline({
    referredCount,
    nextStep,
    remainingInvites: nextStep ? nextStep.invites - referredCount : 0,
  });
};

describe('getReferralLadderHeadline', () => {
  it('asks for a first friend without saying "more"', () => {
    expect(headlineFor(0)).toBe('Invite 1 friend to get 1 month of Plus');
  });

  it('asks for one more friend once someone joined', () => {
    expect(headlineFor(1)).toBe('Invite 1 more friend to get 3 months of Plus');
  });

  it('celebrates once the last step is reached', () => {
    expect(headlineFor(3)).toBe('You climbed the whole ladder');
  });
});
