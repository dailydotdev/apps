import React from 'react';
import { render, screen } from '@testing-library/react';
import { GivebackFundingSummary } from './GivebackFundingSummary';
import { useContributionStatus } from '../hooks/useContributionStatus';
import type { ContributionStatus } from '../types';

jest.mock('../hooks/useContributionStatus');

// Resolve the reveal/count-up animations synchronously so assertions read the
// final values instead of mid-animation frames.
jest.mock('../useGivebackMotion', () => ({
  useInView: () => ({ ref: { current: null }, inView: true }),
  useCountUp: (target: number) => target,
}));

const mockUseContributionStatus = useContributionStatus as jest.MockedFunction<
  typeof useContributionStatus
>;

const renderSummary = (status: Partial<ContributionStatus>) => {
  mockUseContributionStatus.mockReturnValue({
    status: {
      enabled: true,
      eligible: null,
      currentCyclePoints: 0,
      currentCycleTargetPoints: 0,
      lifetimePoints: 0,
      lifetimeAmountCents: 0,
      contributorsCount: 0,
      userPoints: null,
      ...status,
    },
    isPending: false,
  });

  return render(<GivebackFundingSummary />);
};

it('renders campaign points as dollars against the cycle goal with contributors', () => {
  renderSummary({
    currentCyclePoints: 5000,
    currentCycleTargetPoints: 10000,
    contributorsCount: 12480,
  });

  expect(screen.getByText('$5,000')).toBeInTheDocument();
  expect(screen.getByText('unlocked of $10,000 goal')).toBeInTheDocument();
  expect(screen.getByText('50.00%')).toBeInTheDocument();
  expect(screen.getByText(/12,480 contributors/)).toBeInTheDocument();
});

it('shows two decimal places for small funding percentages', () => {
  renderSummary({
    currentCyclePoints: 1,
    currentCycleTargetPoints: 10000,
    contributorsCount: 1,
  });

  expect(screen.getByText('0.01%')).toBeInTheDocument();
});

it('shows a goal-forward empty state when nothing is unlocked yet', () => {
  renderSummary({
    currentCyclePoints: 0,
    currentCycleTargetPoints: 10000,
    contributorsCount: 0,
  });

  expect(screen.getByText('$10,000')).toBeInTheDocument();
  expect(screen.getByText("goal we'll fund together")).toBeInTheDocument();
  expect(
    screen.getByText('Be the first to move the meter.'),
  ).toBeInTheDocument();
  // None of the "$0 / 0% / 0 contributors" zeros leak through.
  expect(screen.queryByText('$0')).not.toBeInTheDocument();
  expect(screen.queryByText(/0 contributors/)).not.toBeInTheDocument();
});

it('renders a skeleton without zeros before data arrives', () => {
  mockUseContributionStatus.mockReturnValue({
    status: undefined,
    isPending: true,
  });

  render(<GivebackFundingSummary />);

  expect(screen.queryByText('$0')).not.toBeInTheDocument();
  expect(screen.queryByText(/unlocked of/)).not.toBeInTheDocument();
});
