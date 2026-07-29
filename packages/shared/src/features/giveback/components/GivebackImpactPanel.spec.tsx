import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { GivebackImpactPanel } from './GivebackImpactPanel';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionRewards } from '../hooks/useContributionRewards';
import { useContributionUserRewards } from '../hooks/useContributionUserRewards';
import { useClaimContributionReward } from '../hooks/useClaimContributionReward';
import { useContributionCausePicker } from '../hooks/useContributionCausePicker';
import { useContributionActions } from '../hooks/useContributionActions';
import { useContributionFoundingAward } from '../hooks/useContributionFoundingAward';
import { useClaimContributionFoundingAward } from '../hooks/useClaimContributionFoundingAward';
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
jest.mock('../hooks/useContributionFoundingAward');
jest.mock('../hooks/useClaimContributionFoundingAward');
jest.mock('../../../contexts/LogContext');
jest.mock('../../../contexts/AuthContext');

// Resolve the reveal/count-up animations synchronously so assertions read final
// values, not mid-animation frames.
jest.mock('../useGivebackMotion', () => ({
  useInView: () => ({ ref: { current: null }, inView: true }),
  useCountUp: (target: number) => target,
  // Claiming now opens the reward reveal (confetti burst), which reads this.
  usePrefersReducedMotion: () => true,
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
const mockFoundingAward = useContributionFoundingAward as jest.MockedFunction<
  typeof useContributionFoundingAward
>;
const mockClaimFoundingAward =
  useClaimContributionFoundingAward as jest.MockedFunction<
    typeof useClaimContributionFoundingAward
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
    metadata: {},
  },
  {
    id: 't2',
    title: 'One month of Plus',
    description: null,
    thresholdPoints: 100,
    rewardType: ContributionRewardType.PlusDays,
    metadata: { days: 30 },
  },
  {
    id: 't3',
    title: 'Hoodie',
    description: null,
    thresholdPoints: 250,
    rewardType: ContributionRewardType.Custom,
    metadata: {},
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
  mockFoundingAward.mockReturnValue({
    foundingAward: {
      totalSpots: 1000,
      claimedCount: 743,
      isFoundingMember: false,
      memberNumber: null,
    },
    isPending: false,
  });
  mockClaimFoundingAward.mockReturnValue({
    claim: jest.fn().mockResolvedValue({
      totalSpots: 1000,
      claimedCount: 744,
      isFoundingMember: true,
      memberNumber: 744,
    }),
    isPending: false,
  });
  mockLog.mockReturnValue({ logEvent } as unknown as ReturnType<
    typeof useLogContext
  >);
  mockAuth.mockReturnValue({ user: null } as unknown as ReturnType<
    typeof useAuthContext
  >);
});

it('renders every reward level without a show-more toggle', () => {
  const manyTiers: ContributionRewardTier[] = Array.from(
    { length: 12 },
    (_, index) => ({
      id: `tier-${index + 1}`,
      title: `Reward ${index + 1}`,
      description: null,
      thresholdPoints: (index + 1) * 25,
      rewardType: ContributionRewardType.Custom,
      metadata: {},
    }),
  );
  mockRewards.mockReturnValue({ rewardTiers: manyTiers, isPending: false });

  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  manyTiers.forEach((tier) => {
    expect(screen.getByText(tier.title)).toBeInTheDocument();
  });
  expect(
    screen.queryByRole('button', { name: /Show \d+ more levels?/ }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /Show \d+ completed levels?/ }),
  ).not.toBeInTheDocument();
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

it('keeps joke and trivia rewards a mystery until claimed', () => {
  mockRewards.mockReturnValue({
    rewardTiers: [
      {
        id: 'joke',
        title: 'Your parents will be proud of you.',
        description: 'A little note from us.',
        thresholdPoints: 25,
        rewardType: ContributionRewardType.Joke,
        metadata: {},
      },
      {
        id: 'trivia',
        title: 'daily.dev secret fact',
        description: 'The palette has a shade called bacon.',
        thresholdPoints: 250,
        rewardType: ContributionRewardType.Trivia,
        metadata: {},
      },
    ],
    isPending: false,
  });
  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  // The joke's punchline (its title) and the trivia fact stay hidden…
  expect(
    screen.queryByText('Your parents will be proud of you.'),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText('The palette has a shade called bacon.'),
  ).not.toBeInTheDocument();
  // …shown instead as teased mystery labels echoing their claim reveals.
  expect(screen.getByText('A note from daily.dev')).toBeInTheDocument();
  expect(screen.getByText('A daily.dev secret')).toBeInTheDocument();
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

  // The reward reveal opens once the claim lands (the "note from daily.dev"
  // card for a custom reward with no bespoke preset).
  expect(
    await screen.findByText('With love, the daily.dev team'),
  ).toBeInTheDocument();
});

it('claims the founding award through the mutation and reveals it', async () => {
  const claim = jest.fn().mockResolvedValue({
    totalSpots: 1000,
    claimedCount: 744,
    isFoundingMember: true,
    memberNumber: 744,
  });
  mockClaimFoundingAward.mockReturnValue({ claim, isPending: false });

  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  const claimButton = screen.getByRole('button', {
    name: /Claim your award/,
  });
  await act(async () => {
    fireEvent.click(claimButton);
  });

  expect(claim).toHaveBeenCalledTimes(1);
  expect(
    await screen.findByText("You're a founding contributor."),
  ).toBeInTheDocument();
});

it('does not reveal the founding award when claiming fails', async () => {
  const claim = jest.fn().mockRejectedValue(new Error('sold out'));
  mockClaimFoundingAward.mockReturnValue({ claim, isPending: false });

  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  const claimButton = screen.getByRole('button', {
    name: /Claim your award/,
  });
  await act(async () => {
    fireEvent.click(claimButton);
  });

  expect(claim).toHaveBeenCalledTimes(1);
  expect(
    screen.queryByText("You're a founding contributor."),
  ).not.toBeInTheDocument();
});

it('shows an empty journey when no reward tiers exist', () => {
  mockRewards.mockReturnValue({ rewardTiers: [], isPending: false });
  render(<GivebackImpactPanel onTakeAction={jest.fn()} />);

  expect(screen.getByText('Your journey starts soon')).toBeInTheDocument();
});
