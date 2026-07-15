import { renderHook } from '@testing-library/react';
import { useGivebackContribution } from './useGivebackContribution';
import { useContributionStatus } from './useContributionStatus';
import { useContributionRewards } from './useContributionRewards';
import { ContributionRewardType } from '../types';
import type { ContributionStatus } from '../types';

jest.mock('./useContributionStatus');
jest.mock('./useContributionRewards');

const mockUseStatus = useContributionStatus as jest.MockedFunction<
  typeof useContributionStatus
>;
const mockUseRewards = useContributionRewards as jest.MockedFunction<
  typeof useContributionRewards
>;

const tier = (id: string, thresholdPoints: number) => ({
  id,
  title: `Reward ${id}`,
  description: null,
  thresholdPoints,
  rewardType: ContributionRewardType.Custom,
  metadata: {},
});

const setStatus = (userPoints: number | null, isPending = false) =>
  mockUseStatus.mockReturnValue({
    status: { userPoints } as ContributionStatus,
    isPending,
  });

beforeEach(() => {
  jest.clearAllMocks();
  setStatus(0);
  mockUseRewards.mockReturnValue({ rewardTiers: [], isPending: false });
});

it('targets the next tier above the visitor points', () => {
  setStatus(30);
  mockUseRewards.mockReturnValue({
    rewardTiers: [tier('a', 25), tier('b', 100), tier('c', 250)],
    isPending: false,
  });

  const { result } = renderHook(() => useGivebackContribution(true));

  expect(result.current.earnedPoints).toBe(30);
  expect(result.current.nextReward?.thresholdPoints).toBe(100);
  expect(result.current.pointsToNext).toBe(70);
  // Progress through the 25 -> 100 segment: (30 - 25) / 75.
  expect(Math.round(result.current.progressPercentage)).toBe(7);
  expect(result.current.hasRewards).toBe(true);
  // One tier (25) unlocked, so the visitor is on level 2.
  expect(result.current.currentLevel).toBe(2);
});

it('measures from zero when no tier is unlocked yet', () => {
  setStatus(0);
  mockUseRewards.mockReturnValue({
    rewardTiers: [tier('a', 25)],
    isPending: false,
  });

  const { result } = renderHook(() => useGivebackContribution(true));

  expect(result.current.nextReward?.thresholdPoints).toBe(25);
  expect(result.current.pointsToNext).toBe(25);
  expect(result.current.progressPercentage).toBe(0);
  // No tier unlocked yet: level 1.
  expect(result.current.currentLevel).toBe(1);
});

it('reports completion once every tier is unlocked', () => {
  setStatus(1000);
  mockUseRewards.mockReturnValue({
    rewardTiers: [tier('a', 25), tier('b', 100)],
    isPending: false,
  });

  const { result } = renderHook(() => useGivebackContribution(true));

  expect(result.current.nextReward).toBeNull();
  expect(result.current.progressPercentage).toBe(100);
  expect(result.current.hasRewards).toBe(true);
  // Both tiers cleared, so one past the top: level 3.
  expect(result.current.currentLevel).toBe(3);
});

it('reports no rewards when none are configured', () => {
  setStatus(50);

  const { result } = renderHook(() => useGivebackContribution(true));

  expect(result.current.nextReward).toBeNull();
  expect(result.current.hasRewards).toBe(false);
});

it('treats null user points as zero earned', () => {
  setStatus(null);
  mockUseRewards.mockReturnValue({
    rewardTiers: [tier('a', 25)],
    isPending: false,
  });

  const { result } = renderHook(() => useGivebackContribution(true));

  expect(result.current.earnedPoints).toBe(0);
  expect(result.current.pointsToNext).toBe(25);
});

it('propagates pending from either query', () => {
  setStatus(0, true);

  const { result } = renderHook(() => useGivebackContribution(true));

  expect(result.current.isPending).toBe(true);
});
