import type { ReactNode } from 'react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { QuestType } from '../../graphql/quests';
import type { QuestClaimedEventDetail } from '../../lib/questClaimed';
import { QUEST_CLAIMED_EVENT } from '../../lib/questClaimed';
import { useClaimQuestReward } from '../useClaimQuestReward';

const mockRequestMethod = jest.fn();
const mockLogEvent = jest.fn();

jest.mock('../useRequestProtocol', () => ({
  useRequestProtocol: () => ({ requestMethod: mockRequestMethod }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: '1' }, refetchBoot: jest.fn() }),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

const claimResult = {
  level: { level: 3, totalXp: 300, xpInLevel: 0, xpToNextLevel: 100 },
  daily: { regular: [], plus: [] },
  weekly: { regular: [], plus: [] },
  milestone: [],
  intro: [],
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={
      new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    }
  >
    {children}
  </QueryClientProvider>
);

describe('useClaimQuestReward', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestMethod.mockResolvedValue({ claimQuestReward: claimResult });
  });

  // The offers popup lives in MainLayout, far from every claim surface, and
  // listens for this event instead of inferring a claim from the dashboard.
  it('announces a successful claim on window', async () => {
    const listener = jest.fn();
    window.addEventListener(QUEST_CLAIMED_EVENT, listener);

    const { result } = renderHook(() => useClaimQuestReward(), { wrapper });

    result.current.mutate({
      userQuestId: 'uq-1',
      questId: 'q-1',
      questType: QuestType.Daily,
    });

    await waitFor(() => expect(listener).toHaveBeenCalledTimes(1));

    const { detail } = listener.mock
      .calls[0][0] as CustomEvent<QuestClaimedEventDetail>;

    expect(detail).toEqual({ questId: 'q-1', questType: QuestType.Daily });

    window.removeEventListener(QUEST_CLAIMED_EVENT, listener);
  });

  it('stays quiet when the claim fails', async () => {
    mockRequestMethod.mockRejectedValue(new Error('nope'));

    const listener = jest.fn();
    window.addEventListener(QUEST_CLAIMED_EVENT, listener);

    const { result } = renderHook(() => useClaimQuestReward(), { wrapper });

    result.current.mutate({
      userQuestId: 'uq-1',
      questId: 'q-1',
      questType: QuestType.Daily,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(listener).not.toHaveBeenCalled();

    window.removeEventListener(QUEST_CLAIMED_EVENT, listener);
  });
});
