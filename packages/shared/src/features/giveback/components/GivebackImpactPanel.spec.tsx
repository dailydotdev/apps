import React from 'react';
import { render, screen } from '@testing-library/react';
import { GivebackImpactPanel } from './GivebackImpactPanel';
import { useContributionStatus } from '../hooks/useContributionStatus';
import { useContributionSponsors } from '../hooks/useContributionSponsors';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionRewards } from '../hooks/useContributionRewards';
import { useContributionUserRewards } from '../hooks/useContributionUserRewards';
import { useClaimContributionReward } from '../hooks/useClaimContributionReward';
import { ContributionRewardType, type ContributionRewardTier } from '../types';

jest.mock('../hooks/useContributionStatus');
jest.mock('../hooks/useContributionSponsors');
jest.mock('../hooks/useGivebackContribution');
jest.mock('../hooks/useContributionRewards');
jest.mock('../hooks/useContributionUserRewards');
jest.mock('../hooks/useClaimContributionReward');

// Resolve the reveal/count-up animations synchronously so assertions read final
// values, not mid-animation frames.
jest.mock('../useGivebackMotion', () => ({
  useInView: () => ({ ref: { current: null }, inView: true }),
  useCountUp: (target: number) => target,
}));

const mockStatus = useContributionStatus as jest.MockedFunction<
  typeof useContributionStatus
>;
const mockSponsors = useContributionSponsors as jest.MockedFunction<
  typeof useContributionSponsors
>;
const mockContribution = useGivebackContribution as jest.MockedFunction<
  typeof useGivebackContribution
>;
const mockRewards = useContributionRewards as jest.MockedFunction<
  typeof useContributionRewards
>;
const mockUserRewards = useContributionUserRewards as jest.MockedFunction<
  typeof useContributionUserRewards
>;
const mockClaim = useClaimContributionReward as jest.MockedFunction<
  typeof useClaimContributionReward
>;

const tiers: ContributionRewardTier[] = [
  {
    id: 't1',
    title: 'Sticker pack',
    description: 'A pack of daily.dev stickers',
    thresholdPoints: 25,
    rewardType: ContributionRewardType.Custom,
  },
  {
    id: 't2',
    title: 'One month of Plus',
    description: null,
    thresholdPoints: 100,
    rewardType: ContributionRewardType.PlusDays,
  },
  {
    id: 't3',
    title: 'Hoodie',
    description: null,
    thresholdPoints: 250,
    rewardType: ContributionRewardType.Custom,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockStatus.mockReturnValue({
    status: {
      enabled: true,
      eligible: true,
      currentCyclePoints: 4000,
      currentCycleTargetPoints: 10000,
      lifetimePoints: 0,
      lifetimeAmountCents: 0,
      contributorsCount: 128,
      userPoints: 40,
    },
    isPending: false,
  });
  mockSponsors.mockReturnValue({ sponsors: [], isPending: false });
  mockContribution.mockReturnValue({
    earnedPoints: 40,
    nextReward: tiers[1],
    pointsToNext: 60,
    progressPercentage: 20,
    currentLevel: 2,
    hasRewards: true,
    isPending: false,
  });
  mockRewards.mockReturnValue({ rewardTiers: tiers, isPending: false });
  mockUserRewards.mockReturnValue({ rewards: [], isPending: false });
  mockClaim.mockReturnValue({ claim: jest.fn(), isPending: false });
});

it('renders the funding progress section with live totals', () => {
  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  expect(screen.getByText('Funding progress')).toBeInTheDocument();
  expect(screen.getByText('$4,000')).toBeInTheDocument();
  expect(screen.getByText('128')).toBeInTheDocument();
});

it('renders the reward-ladder journey with the current level', () => {
  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  expect(screen.getByText('Your journey')).toBeInTheDocument();
  expect(screen.getByText('Sticker pack')).toBeInTheDocument();
  expect(screen.getByText('One month of Plus')).toBeInTheDocument();
  expect(screen.getByText('Hoodie')).toBeInTheDocument();
  // $40 earned: the next milestone is the $100 tier.
  expect(screen.getByText('Next up: One month of Plus')).toBeInTheDocument();
  expect(screen.getByText('$60 to go')).toBeInTheDocument();
});

it('offers a claim for an unlocked, unclaimed tier', () => {
  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  // The $25 tier is reached at $40 and not yet claimed.
  expect(screen.getByRole('button', { name: 'Claim' })).toBeInTheDocument();
  expect(screen.getByText(/ready to claim/)).toBeInTheDocument();
});

it('shows an empty journey when no reward tiers exist', () => {
  mockRewards.mockReturnValue({ rewardTiers: [], isPending: false });
  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  expect(screen.getByText('Your journey starts soon')).toBeInTheDocument();
});
