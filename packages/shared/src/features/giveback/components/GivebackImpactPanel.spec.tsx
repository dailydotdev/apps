import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { GivebackImpactPanel } from './GivebackImpactPanel';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionRewards } from '../hooks/useContributionRewards';
import { useContributionUserRewards } from '../hooks/useContributionUserRewards';
import { useClaimContributionReward } from '../hooks/useClaimContributionReward';
import { useContributionCausePicker } from '../hooks/useContributionCausePicker';
import { useContributionActions } from '../hooks/useContributionActions';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent } from '../../../lib/log';
import { ContributionRewardType, type ContributionRewardTier } from '../types';

jest.mock('../hooks/useGivebackContribution');
jest.mock('../hooks/useContributionRewards');
jest.mock('../hooks/useContributionUserRewards');
jest.mock('../hooks/useClaimContributionReward');
jest.mock('../hooks/useContributionCausePicker');
jest.mock('../hooks/useContributionActions');
jest.mock('../../../contexts/LogContext');
jest.mock('../../../contexts/AuthContext');

// Resolve the reveal/count-up animations synchronously so assertions read final
// values, not mid-animation frames.
jest.mock('../useGivebackMotion', () => ({
  useInView: () => ({ ref: { current: null }, inView: true }),
  useCountUp: (target: number) => target,
}));

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
const mockCausePicker = useContributionCausePicker as jest.MockedFunction<
  typeof useContributionCausePicker
>;
const mockActions = useContributionActions as jest.MockedFunction<
  typeof useContributionActions
>;
const mockLog = useLogContext as jest.MockedFunction<typeof useLogContext>;
const mockAuth = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const logEvent = jest.fn();

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
  mockUserRewards.mockReturnValue({ claimedRewardIds: [], isPending: false });
  mockClaim.mockReturnValue({
    claim: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  });
  mockCausePicker.mockReturnValue({
    causes: [],
    selectedCauseIds: [],
    isPending: false,
  });
  mockActions.mockReturnValue({
    actions: [],
    categories: [],
    rewardTiers: [],
    claimedRewardIds: [],
    isPending: false,
  });
  mockLog.mockReturnValue({ logEvent } as unknown as ReturnType<
    typeof useLogContext
  >);
  mockAuth.mockReturnValue({ user: null } as unknown as ReturnType<
    typeof useAuthContext
  >);
});

it('renders the reward-ladder journey with the current level', () => {
  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  expect(screen.getByText(/for causes you love/)).toBeInTheDocument();
  expect(screen.getByText('Sticker pack')).toBeInTheDocument();
  expect(screen.getByText('One month of Plus')).toBeInTheDocument();
  expect(screen.getByText('Hoodie')).toBeInTheDocument();
  // $40 earned: the next milestone is the $100 tier.
  expect(screen.getByText('$60 to your next reward')).toBeInTheDocument();
  expect(screen.getByText('$60 to go')).toBeInTheDocument();
});

it('offers a claim for an unlocked, unclaimed tier and logs it', async () => {
  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  // The $25 tier is reached at $40 and not yet claimed.
  const claimButton = screen.getByRole('button', { name: /Claim reward/ });
  expect(claimButton).toBeInTheDocument();
  expect(screen.getByText(/ready to claim/)).toBeInTheDocument();

  await act(async () => {
    fireEvent.click(claimButton);
  });

  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ClaimGivebackReward,
    target_id: 't1',
    extra: JSON.stringify({
      reward_type: ContributionRewardType.Custom,
      threshold: 25,
    }),
  });
});

it('shows an empty journey when no reward tiers exist', () => {
  mockRewards.mockReturnValue({ rewardTiers: [], isPending: false });
  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  expect(screen.getByText('Your journey starts soon')).toBeInTheDocument();
});
