import type { ReactNode } from 'react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { QuestType } from '../../graphql/quests';
import type { QuestClaim } from '../useClaimQuestReward';
import {
  questClaimQueryKey,
  useClaimQuestReward,
} from '../useClaimQuestReward';

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

const claimKey = questClaimQueryKey({ id: '1' });

const renderClaim = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    queryClient,
    ...renderHook(() => useClaimQuestReward(), { wrapper }),
  };
};

describe('useClaimQuestReward', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestMethod.mockResolvedValue({ claimQuestReward: claimResult });
  });

  // The offers popup lives in MainLayout, far from every claim surface, and
  // observes this cache entry rather than inferring a claim from the dashboard.
  it('publishes a successful claim to the query cache', async () => {
    const { result, queryClient } = renderClaim();

    result.current.mutate({
      userQuestId: 'uq-1',
      questId: 'q-1',
      questType: QuestType.Daily,
    });

    await waitFor(() =>
      expect(queryClient.getQueryData<QuestClaim>(claimKey)).toEqual({
        questId: 'q-1',
        questType: QuestType.Daily,
      }),
    );
  });

  it('publishes nothing when the claim fails', async () => {
    mockRequestMethod.mockRejectedValue(new Error('nope'));

    const { result, queryClient } = renderClaim();

    result.current.mutate({
      userQuestId: 'uq-1',
      questId: 'q-1',
      questType: QuestType.Daily,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(claimKey)).toBeUndefined();
  });
});
