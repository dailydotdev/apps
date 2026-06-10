import React from 'react';
import { render, screen } from '@testing-library/react';
import { GivebackImpactPanel } from './GivebackImpactPanel';
import { useContributionImpact } from '../hooks/useContributionImpact';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import {
  UserContributionRewardStatus,
  type ContributionCauseStat,
  type UserContributionReward,
} from '../types';

jest.mock('../hooks/useContributionImpact');
jest.mock('../hooks/useGivebackContribution');

const mockImpact = useContributionImpact as jest.MockedFunction<
  typeof useContributionImpact
>;
const mockContribution = useGivebackContribution as jest.MockedFunction<
  typeof useGivebackContribution
>;

const causeStat = (
  overrides: Partial<ContributionCauseStat> = {},
): ContributionCauseStat => ({
  cause: {
    id: 'c1',
    title: 'Open Source Fund',
    url: 'https://example.com',
    description: null,
    category: null,
    logoUrl: null,
  },
  points: 45,
  amountCents: 4500,
  ...overrides,
});

const reward = (
  overrides: Partial<UserContributionReward> = {},
): UserContributionReward => ({
  tier: { id: 't1', title: 'Plus for a month', thresholdPoints: 25 },
  status: UserContributionRewardStatus.Claimed,
  claimedAt: '2026-01-01T00:00:00.000Z',
  fulfilledAt: null,
  ...overrides,
});

const setContribution = (earnedPoints = 40) =>
  mockContribution.mockReturnValue({
    earnedPoints,
    nextReward: null,
    pointsToNext: 0,
    progressPercentage: 100,
    currentLevel: 2,
    hasRewards: true,
    isPending: false,
  });

beforeEach(() => {
  jest.clearAllMocks();
  setContribution();
});

it('renders a skeleton while loading', () => {
  mockImpact.mockReturnValue({
    causeStats: [],
    rewards: [],
    isPending: true,
  });
  render(<GivebackImpactPanel />);

  expect(
    screen.getByRole('status', { name: 'Loading impact' }),
  ).toBeInTheDocument();
});

it('shows empty states when there is no impact yet', () => {
  mockImpact.mockReturnValue({
    causeStats: [],
    rewards: [],
    isPending: false,
  });
  render(<GivebackImpactPanel />);

  expect(
    screen.getByText('Your funded causes will show up here'),
  ).toBeInTheDocument();
  expect(screen.getByText(/No rewards yet/)).toBeInTheDocument();
});

it('renders funded causes with the amount and an outbound link', () => {
  mockImpact.mockReturnValue({
    causeStats: [causeStat()],
    rewards: [],
    isPending: false,
  });
  render(<GivebackImpactPanel />);

  expect(screen.getByText('Open Source Fund')).toBeInTheDocument();
  expect(screen.getByText('$45')).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /Open Source Fund/ }),
  ).toHaveAttribute('href', 'https://example.com');
});

it('renders earned rewards with their status', () => {
  mockImpact.mockReturnValue({
    causeStats: [],
    rewards: [
      reward(),
      reward({
        tier: { id: 't2', title: 'Sticker pack', thresholdPoints: 100 },
        status: UserContributionRewardStatus.Fulfilled,
      }),
    ],
    isPending: false,
  });
  render(<GivebackImpactPanel />);

  expect(screen.getByText('Plus for a month')).toBeInTheDocument();
  expect(screen.getByText('Claimed')).toBeInTheDocument();
  expect(screen.getByText('Sticker pack')).toBeInTheDocument();
  expect(screen.getByText('Delivered')).toBeInTheDocument();
});
