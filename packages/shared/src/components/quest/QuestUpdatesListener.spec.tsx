import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { QuestDashboard } from '../../graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
  QUEST_ROTATION_UPDATE_SUBSCRIPTION,
  QUEST_UPDATE_SUBSCRIPTION,
} from '../../graphql/quests';
import { QuestUpdatesListener } from './QuestUpdatesListener';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import useSubscription from '../../hooks/useSubscription';
import { LogEvent, TargetType } from '../../lib/log';
import { generateQueryKey, RequestKey } from '../../lib/query';

jest.mock('../../hooks/useQuestDashboard', () => ({
  ...jest.requireActual('../../hooks/useQuestDashboard'),
  useQuestDashboard: jest.fn(),
}));

jest.mock('../../hooks/useSubscription', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseQuestDashboard = useQuestDashboard as jest.Mock;
const mockUseSubscription = useSubscription as jest.Mock;

const questDashboard = {
  level: {
    level: 7,
    totalXp: 650,
    xpInLevel: 250,
    xpToNextLevel: 150,
  },
  currentStreak: 0,
  longestStreak: 0,
  daily: {
    regular: [
      {
        rotationId: 'daily-quest-1',
        userQuestId: null,
        progress: 1,
        status: QuestStatus.InProgress,
        locked: false,
        claimable: false,
        quest: {
          id: 'quest-1',
          name: 'Read posts',
          description: 'Read 3 posts today',
          type: QuestType.Daily,
          eventType: 'read_post',
          targetCount: 3,
        },
        rewards: [
          { type: QuestRewardType.Xp, amount: 150 },
          { type: QuestRewardType.Reputation, amount: 20 },
        ],
      },
    ],
    plus: [],
  },
  weekly: {
    regular: [],
    plus: [],
  },
  milestone: [],
  intro: [],
};

beforeEach(() => {
  mockUseQuestDashboard.mockReturnValue({
    data: questDashboard,
    isPending: false,
    isError: false,
    dataUpdatedAt: 1,
  });
  mockUseSubscription.mockReset();
});

it('should subscribe to quest update and rotation channels and invalidate the dashboard', () => {
  const subscriptions: Array<{
    query: string;
    next?: () => unknown;
  }> = [];
  const client = new QueryClient();
  const invalidateQueries = jest
    .spyOn(client, 'invalidateQueries')
    .mockResolvedValue(undefined);

  mockUseSubscription.mockImplementation(
    (request: () => { query: string }, callbacks: { next?: () => unknown }) => {
      subscriptions.push({
        query: request().query,
        next: callbacks.next,
      });
    },
  );

  render(
    <TestBootProvider client={client}>
      <QuestUpdatesListener />
    </TestBootProvider>,
  );

  expect(
    Array.from(
      new Set(subscriptions.map((subscription) => subscription.query)),
    ),
  ).toEqual([QUEST_UPDATE_SUBSCRIPTION, QUEST_ROTATION_UPDATE_SUBSCRIPTION]);

  subscriptions
    .find((subscription) => subscription.query === QUEST_UPDATE_SUBSCRIPTION)
    ?.next?.();
  subscriptions
    .find(
      (subscription) =>
        subscription.query === QUEST_ROTATION_UPDATE_SUBSCRIPTION,
    )
    ?.next?.();

  expect(invalidateQueries).toHaveBeenCalledTimes(2);
  expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
    queryKey: generateQueryKey(RequestKey.QuestDashboard),
    exact: true,
  });
});

it('should not subscribe when the user has opted out of the quest system', () => {
  mockUseSubscription.mockImplementation(() => undefined);

  render(
    <TestBootProvider
      client={new QueryClient()}
      settings={{ optOutQuestSystem: true }}
    >
      <QuestUpdatesListener />
    </TestBootProvider>,
  );

  expect(mockUseSubscription).not.toHaveBeenCalled();
});

it('should log when a quest becomes claimable after a quest update', () => {
  const logEvent = jest.fn();
  const client = new QueryClient();
  const subscriptions: Array<{
    query: string;
    next?: () => unknown;
  }> = [];
  let questDashboardState: {
    data: QuestDashboard;
    isPending: boolean;
    isError: boolean;
    dataUpdatedAt: number;
  } = {
    data: questDashboard,
    isPending: false,
    isError: false,
    dataUpdatedAt: 1,
  };

  mockUseQuestDashboard.mockImplementation(() => questDashboardState);
  mockUseSubscription.mockImplementation(
    (request: () => { query: string }, callbacks: { next?: () => unknown }) => {
      subscriptions.push({
        query: request().query,
        next: callbacks.next,
      });
    },
  );

  const view = render(
    <TestBootProvider client={client} log={{ logEvent }}>
      <QuestUpdatesListener />
    </TestBootProvider>,
  );

  questDashboardState = {
    data: {
      ...questDashboard,
      daily: {
        ...questDashboard.daily,
        regular: [
          {
            ...questDashboard.daily.regular[0],
            userQuestId: 'user-quest-1',
            status: QuestStatus.Completed,
            claimable: true,
            completedAt: new Date('2026-04-13T10:00:00.000Z'),
          },
        ],
      },
    },
    isPending: false,
    isError: false,
    dataUpdatedAt: 2,
  };

  subscriptions
    .find((subscription) => subscription.query === QUEST_UPDATE_SUBSCRIPTION)
    ?.next?.();

  view.rerender(
    <TestBootProvider client={client} log={{ logEvent }}>
      <QuestUpdatesListener />
    </TestBootProvider>,
  );

  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.QuestClaimable,
    target_id: 'quest-1',
    target_type: TargetType.Quest,
    extra: JSON.stringify({
      questType: QuestType.Daily,
      userQuestId: 'user-quest-1',
      userId: undefined,
      rotationId: 'daily-quest-1',
    }),
  });
});

it('should not log claimable for a locked plus quest after a quest update', () => {
  const logEvent = jest.fn();
  const client = new QueryClient();
  const subscriptions: Array<{
    query: string;
    next?: () => unknown;
  }> = [];
  let questDashboardState: {
    data: QuestDashboard;
    isPending: boolean;
    isError: boolean;
    dataUpdatedAt: number;
  } = {
    data: {
      ...questDashboard,
      daily: {
        ...questDashboard.daily,
        plus: [
          {
            rotationId: 'daily-plus-quest-1',
            userQuestId: null,
            progress: 1,
            status: QuestStatus.InProgress,
            locked: true,
            claimable: false,
            quest: {
              id: 'plus-quest-1',
              name: 'Plus read posts',
              description: 'Read 3 posts today',
              type: QuestType.Daily,
              eventType: 'read_post',
              targetCount: 3,
            },
            rewards: [{ type: QuestRewardType.Xp, amount: 150 }],
          },
        ],
      },
    },
    isPending: false,
    isError: false,
    dataUpdatedAt: 1,
  };

  mockUseQuestDashboard.mockImplementation(() => questDashboardState);
  mockUseSubscription.mockImplementation(
    (request: () => { query: string }, callbacks: { next?: () => unknown }) => {
      subscriptions.push({
        query: request().query,
        next: callbacks.next,
      });
    },
  );

  const view = render(
    <TestBootProvider client={client} log={{ logEvent }}>
      <QuestUpdatesListener />
    </TestBootProvider>,
  );

  questDashboardState = {
    data: {
      ...questDashboardState.data,
      daily: {
        ...questDashboardState.data.daily,
        plus: [
          {
            ...questDashboardState.data.daily.plus[0],
            userQuestId: 'user-plus-quest-1',
            status: QuestStatus.Completed,
            progress: 3,
            completedAt: new Date('2026-04-13T10:00:00.000Z'),
          },
        ],
      },
    },
    isPending: false,
    isError: false,
    dataUpdatedAt: 2,
  };

  subscriptions
    .find((subscription) => subscription.query === QUEST_UPDATE_SUBSCRIPTION)
    ?.next?.();

  view.rerender(
    <TestBootProvider client={client} log={{ logEvent }}>
      <QuestUpdatesListener />
    </TestBootProvider>,
  );

  expect(logEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.QuestClaimable,
      target_id: 'plus-quest-1',
    }),
  );
});
