import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ReputationReasonTotal } from '../../../graphql/reputation';
import { ReputationReason } from '../../../graphql/reputation';
import { ReputationShape } from './ReputationShape';

const total = (
  reason: string,
  amount: number,
  count: number,
): ReputationReasonTotal => ({
  reason: reason as ReputationReason,
  amount,
  count,
});

describe('ReputationShape', () => {
  it('should list losses and gains from reasons the axes do not cover', () => {
    render(
      <ReputationShape
        breakdown={[
          total(ReputationReason.CommentUpvoted, 500, 10),
          total(ReputationReason.Manual, 300, 1),
          total(ReputationReason.ManualLegacy, 100, 1),
          total('some_future_gain', 40, 2),
          total(ReputationReason.StreakRestored, -225, 9),
          total('some_future_loss', -10, 1),
        ]}
      />,
    );

    expect(
      screen.getByText('from streak restores (9), other changes (1)', {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('granted by daily.dev')).toBeInTheDocument();
    expect(screen.getByText('+400')).toBeInTheDocument();
    expect(screen.getByText('other changes')).toBeInTheDocument();
  });
});
