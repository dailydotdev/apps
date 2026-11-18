import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReputationEvent } from '../../../graphql/reputation';
import {
  ReputationEventFilter,
  ReputationReason,
} from '../../../graphql/reputation';
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
        filter={ReputationEventFilter.All}
        onFilterChange={jest.fn()}
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

  it('should ask for the picked filter instead of filtering loaded events', () => {
    const onFilterChange = jest.fn();
    render(
      <ReputationActivity
        filter={ReputationEventFilter.All}
        onFilterChange={onFilterChange}
        events={[event('1', ReputationReason.PostUpvoted, 10)]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Losses' }));

    expect(onFilterChange).toHaveBeenCalledWith(ReputationEventFilter.Losses);
    expect(screen.getByText('Post upvoted')).toBeInTheDocument();
  });

  it('should show the events it is given for the active filter', () => {
    render(
      <ReputationActivity
        filter={ReputationEventFilter.Losses}
        onFilterChange={jest.fn()}
        events={[event('1', ReputationReason.PostDownvoted, -10)]}
        untracked={40}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Losses', pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByText('−10')).toBeInTheDocument();
    expect(screen.queryByText('Before tracking')).not.toBeInTheDocument();
  });

  it('should say when there are no losses', () => {
    render(
      <ReputationActivity
        filter={ReputationEventFilter.Losses}
        onFilterChange={jest.fn()}
        events={[]}
      />,
    );

    expect(screen.getByText('No reputation lost yet')).toBeInTheDocument();
  });

  it('should keep the filter and swap the list for the placeholder', () => {
    render(
      <ReputationActivity
        filter={ReputationEventFilter.Gains}
        onFilterChange={jest.fn()}
        events={[event('1', ReputationReason.PostUpvoted, 10)]}
        placeholder={<span>Loading activity</span>}
        untracked={40}
        hasMore
      />,
    );

    expect(screen.getByRole('button', { name: 'Gains' })).toBeInTheDocument();
    expect(screen.getByText('Loading activity')).toBeInTheDocument();
    expect(screen.queryByText('Post upvoted')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No reputation gained yet'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Before tracking')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show more' }),
    ).not.toBeInTheDocument();
  });
});
