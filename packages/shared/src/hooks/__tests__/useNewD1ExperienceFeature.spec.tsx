import { renderHook } from '@testing-library/react';
import { useNewD1ExperienceFeature } from '../useNewD1ExperienceFeature';
import { useConditionalFeature } from '../useConditionalFeature';
import { useQuestDashboard } from '../useQuestDashboard';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
  type UserQuest,
} from '../../graphql/quests';
import { featureNewD1Experience } from '../../lib/featureManagement';

jest.mock('../useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseQuestDashboard = useQuestDashboard as jest.Mock;

const buildIntroQuest = (overrides: Partial<UserQuest> = {}): UserQuest => ({
  userQuestId: 'uq-1',
  rotationId: 'rot-1',
  progress: 0,
  status: QuestStatus.InProgress,
  completedAt: null,
  claimedAt: null,
  locked: false,
  claimable: false,
  quest: {
    id: 'quest-1',
    name: 'Install the browser extension',
    description: 'Pin daily.dev.',
    type: QuestType.Intro,
    eventType: 'extension_install',
    targetCount: 1,
  },
  rewards: [{ type: QuestRewardType.Xp, amount: 10 }],
  ...overrides,
});

describe('useNewD1ExperienceFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });
  });

  it('returns false when intro quests are empty even if GrowthBook resolves true', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: { intro: [] },
      isLoading: false,
    });

    const { result } = renderHook(() =>
      useNewD1ExperienceFeature({ shouldEvaluate: true }),
    );

    expect(result.current.value).toBe(false);
    expect(mockUseConditionalFeature).toHaveBeenCalledWith({
      feature: featureNewD1Experience,
      shouldEvaluate: false,
    });
  });

  it('returns false while quest dashboard data is unavailable', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() =>
      useNewD1ExperienceFeature({ shouldEvaluate: true }),
    );

    expect(result.current.value).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('delegates to GrowthBook value when intro quests exist', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: { intro: [buildIntroQuest()] },
      isLoading: false,
    });

    const { result } = renderHook(() =>
      useNewD1ExperienceFeature({ shouldEvaluate: true }),
    );

    expect(result.current.value).toBe(true);
    expect(mockUseConditionalFeature).toHaveBeenCalledWith({
      feature: featureNewD1Experience,
      shouldEvaluate: true,
    });
  });

  it('returns false when GrowthBook value is false even with intro quests', () => {
    mockUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });
    mockUseQuestDashboard.mockReturnValue({
      data: { intro: [buildIntroQuest()] },
      isLoading: false,
    });

    const { result } = renderHook(() =>
      useNewD1ExperienceFeature({ shouldEvaluate: true }),
    );

    expect(result.current.value).toBe(false);
  });

  it('returns false without evaluating when shouldEvaluate is false', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: { intro: [buildIntroQuest()] },
      isLoading: false,
    });

    const { result } = renderHook(() =>
      useNewD1ExperienceFeature({ shouldEvaluate: false }),
    );

    expect(result.current.value).toBe(false);
    expect(mockUseConditionalFeature).toHaveBeenCalledWith({
      feature: featureNewD1Experience,
      shouldEvaluate: false,
    });
  });

  it('treats missing shouldEvaluate as true', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: { intro: [buildIntroQuest()] },
      isLoading: false,
    });

    const { result } = renderHook(() => useNewD1ExperienceFeature());

    expect(result.current.value).toBe(true);
    expect(mockUseConditionalFeature).toHaveBeenCalledWith({
      feature: featureNewD1Experience,
      shouldEvaluate: true,
    });
  });
});
