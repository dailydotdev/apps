import { renderHook } from '@testing-library/react';
import { useHasIntroQuests } from '../useHasIntroQuests';
import { useQuestDashboard } from '../useQuestDashboard';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
  type UserQuest,
} from '../../graphql/quests';

jest.mock('../useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

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

describe('useHasIntroQuests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns false when intro quests are empty', () => {
    mockUseQuestDashboard.mockReturnValue({ data: { intro: [] } });

    const { result } = renderHook(() =>
      useHasIntroQuests({ shouldEvaluate: true }),
    );

    expect(result.current).toBe(false);
    expect(mockUseQuestDashboard).toHaveBeenCalledWith({ enabled: true });
  });

  it('returns false while quest dashboard data is unavailable', () => {
    mockUseQuestDashboard.mockReturnValue({ data: undefined });

    const { result } = renderHook(() =>
      useHasIntroQuests({ shouldEvaluate: true }),
    );

    expect(result.current).toBe(false);
  });

  it('returns true when intro quests exist', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: { intro: [buildIntroQuest()] },
    });

    const { result } = renderHook(() =>
      useHasIntroQuests({ shouldEvaluate: true }),
    );

    expect(result.current).toBe(true);
  });

  it('returns false without evaluating when shouldEvaluate is false', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: { intro: [buildIntroQuest()] },
    });

    const { result } = renderHook(() =>
      useHasIntroQuests({ shouldEvaluate: false }),
    );

    expect(result.current).toBe(false);
    expect(mockUseQuestDashboard).toHaveBeenCalledWith({ enabled: false });
  });

  it('treats missing shouldEvaluate as true', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: { intro: [buildIntroQuest()] },
    });

    const { result } = renderHook(() => useHasIntroQuests());

    expect(result.current).toBe(true);
    expect(mockUseQuestDashboard).toHaveBeenCalledWith({ enabled: true });
  });
});
