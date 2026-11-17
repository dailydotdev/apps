import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ReputationEvent } from '../../../graphql/reputation';
import { ReputationReason } from '../../../graphql/reputation';
import { ReputationActivity } from './ReputationActivity';

const event = (
  id: string,
  reason: string,
  amount: number,
): ReputationEvent => ({
  id,
  reason: reason as ReputationReason,
  amount,
  createdAt: '2025-04-10T08:26:34.000Z',
  target: null,
});

describe('ReputationActivity', () => {
  it('should label every reason, including ones it does not know', () => {
    render(
      <ReputationActivity
        events={[
          event('1', ReputationReason.StreakRestored, -25),
          event('2', ReputationReason.RestoredAfterReview, 250),
          event('3', 'some_future_reason', 5),
        ]}
      />,
    );

    expect(screen.getByText('Streak restored')).toBeInTheDocument();
    expect(
      screen.getByText('Reputation restored after review'),
    ).toBeInTheDocument();
    expect(screen.getByText('Reputation adjusted')).toBeInTheDocument();
  });
});
