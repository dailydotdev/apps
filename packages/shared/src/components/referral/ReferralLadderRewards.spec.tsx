import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ReferralLadderStep } from '../../graphql/users';
import {
  getReferralLadderHeadline,
  ReferralLadderRewards,
} from './ReferralLadderRewards';

const steps: ReferralLadderStep[] = [
  { step: 1, invites: 1, months: 1, unlockedAt: '2026-11-05T13:38:25.673Z' },
  { step: 2, invites: 2, months: 3, unlockedAt: null },
  { step: 3, invites: 3, months: 12, unlockedAt: null },
];

describe('getReferralLadderHeadline', () => {
  it('celebrates when every step is reached and granted', () => {
    expect(
      getReferralLadderHeadline({ referredCount: 3, remainingInvites: 0 }),
    ).toBe('You climbed the whole ladder');
  });

  it('does not celebrate while reached steps are still in review', () => {
    expect(
      getReferralLadderHeadline({
        referredCount: 3,
        remainingInvites: 0,
        hasPendingRewards: true,
      }),
    ).toBe('Your rewards are in review');
  });

  it('asks for more invites when a next step exists', () => {
    expect(
      getReferralLadderHeadline({
        referredCount: 2,
        nextStep: steps[2],
        remainingInvites: 1,
        hasPendingRewards: true,
      }),
    ).toBe('Invite 1 more friend to get 1 year of Plus');
  });
});

describe('ReferralLadderRewards', () => {
  it('marks reached but ungranted steps as in review, not locked', () => {
    render(<ReferralLadderRewards steps={steps} referredCount={2} />);

    expect(screen.getByLabelText('Unlocked')).toBeInTheDocument();
    expect(screen.getAllByLabelText('In review')).toHaveLength(1);
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Locked')).toHaveLength(1);
    expect(screen.getByText('3 friends')).toBeInTheDocument();
  });

  it('keeps unreached steps locked', () => {
    render(<ReferralLadderRewards steps={steps} referredCount={1} />);

    expect(screen.queryByText('In review')).not.toBeInTheDocument();
    expect(screen.getAllByLabelText('Locked')).toHaveLength(2);
  });
});
