import React from 'react';
import { render, screen } from '@testing-library/react';
import { GivebackPage } from './GivebackPage';
import { useContributionCauseBreakdown } from '../hooks/useContributionCauseBreakdown';

jest.mock('../hooks/useContributionCauseBreakdown');

// Resolve the reveal/count-up animations synchronously so assertions read the
// final values instead of mid-animation frames.
jest.mock('../useGivebackMotion', () => ({
  useInView: () => ({ ref: { current: null }, inView: true }),
  useCountUp: (target: number) => target,
}));

const mockUseContributionCauseBreakdown =
  useContributionCauseBreakdown as jest.MockedFunction<
    typeof useContributionCauseBreakdown
  >;

const renderPage = (
  result: Partial<ReturnType<typeof useContributionCauseBreakdown>> = {},
) => {
  mockUseContributionCauseBreakdown.mockReturnValue({
    breakdown: [
      { category: 'Open source', points: 14000 },
      { category: 'Education', points: 10500 },
    ],
    isPending: false,
    ...result,
  });

  return render(<GivebackPage />);
};

it('thanks contributors and marks the campaign as closed', () => {
  renderPage();

  expect(screen.getByText('Campaign closed')).toBeInTheDocument();
  expect(screen.getByText('Thank you for giving back.')).toBeInTheDocument();
});

it('renders where the money goes with the pool total', () => {
  renderPage();

  expect(screen.getByText('Where the money goes')).toBeInTheDocument();
  expect(screen.getByText('Open source')).toBeInTheDocument();
  expect(screen.getByText('Education')).toBeInTheDocument();
  expect(screen.getByText('$24,500')).toBeInTheDocument();
});

it('keeps the thank-you when the breakdown fails to load', () => {
  renderPage({ breakdown: [], isPending: false });

  expect(screen.getByText('Thank you for giving back.')).toBeInTheDocument();
  expect(screen.queryByText('Where the money goes')).not.toBeInTheDocument();
});
