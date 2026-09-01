import React from 'react';
import nock from 'nock';
import { render, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import type { QuestDashboard, UserQuest } from '../../../graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '../../../graphql/quests';
import type { UserOffer } from '../../../graphql/offers';
import { USER_OFFERS_QUERY } from '../../../graphql/offers';
import { LazyModal } from '../common/types';
import { MODAL_KEY } from '../../../hooks/useLazyModal';
import * as conditionalFeatureHook from '../../../hooks/useConditionalFeature';
import * as questDashboardHook from '../../../hooks/useQuestDashboard';
import { QuestOffersPopup } from './QuestOffersPopup';

const mockSetLastSeen = jest.fn();
let mockLastSeen: string | null = null;

jest.mock('../../../hooks/usePersistentContext', () => ({
  ...jest.requireActual('../../../hooks/usePersistentContext'),
  __esModule: true,
  default: () => [mockLastSeen, mockSetLastSeen, true, false],
}));

const makeQuest = (overrides: Partial<UserQuest> = {}): UserQuest => ({
  userQuestId: 'uq-1',
  rotationId: 'rot-1',
  progress: 3,
  status: QuestStatus.Claimed,
  completedAt: null,
  claimedAt: null,
  locked: false,
  claimable: false,
  rewards: [{ type: QuestRewardType.Xp, amount: 50 }],
  quest: {
    id: 'q-1',
    name: 'Read 3 posts',
    description: 'Read three posts today.',
    type: QuestType.Daily,
    eventType: 'read_post',
    targetCount: 3,
  },
  ...overrides,
});

const makeDashboard = (daily: UserQuest[]): QuestDashboard => ({
  level: { level: 12, totalXp: 1240, xpInLevel: 40, xpToNextLevel: 60 },
  currentStreak: 4,
  longestStreak: 9,
  daily: { regular: daily, plus: [] },
  weekly: { regular: [], plus: [] },
  milestone: [],
  intro: [],
});

const offers: UserOffer[] = [
  {
    impressionUid: '10000000-0000-4000-8000-000000000001',
    clickUrl: 'https://link.encorekit.com/one',
    title: '3 Months of Music, Free',
    advertiserName: 'Acme Music',
    perk: '3 months free',
    badgeLabel: 'free_trial',
  },
];

const mockOffersResponse = (userOffers: UserOffer[]) => {
  nock.cleanAll();
  mockGraphQL({
    request: {
      query: USER_OFFERS_QUERY,
      variables: { placement: 'QUEST_COMPLETION' },
    },
    result: { data: { userOffers } },
  });
  nock('http://localhost:3000')
    .post('/graphql')
    .optionally()
    .times(10)
    .reply(200, { data: {} });
};

const renderComponent = (dashboard: QuestDashboard | undefined) => {
  const queryClient = new QueryClient();

  jest.spyOn(questDashboardHook, 'useQuestDashboard').mockReturnValue({
    data: dashboard,
  } as ReturnType<typeof questDashboardHook.useQuestDashboard>);

  return {
    queryClient,
    ...render(
      <TestBootProvider client={queryClient}>
        <QuestOffersPopup />
      </TestBootProvider>,
    ),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLastSeen = null;
  window.scrollTo = jest.fn();
  jest
    .spyOn(conditionalFeatureHook, 'useConditionalFeature')
    .mockReturnValue({ value: true, isLoading: false });
  mockOffersResponse(offers);
});

// The day's first claim is the moment; waiting for the whole set is too rare.
it('opens the offers modal on the first claimed daily quest of the day', async () => {
  const { queryClient } = renderComponent(
    makeDashboard([
      makeQuest(),
      makeQuest({
        rotationId: 'rot-2',
        userQuestId: 'uq-2',
        status: QuestStatus.Completed,
        claimable: true,
      }),
    ]),
  );

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
      type: LazyModal.QuestOffers,
      props: {
        level: 12,
        summary: { total: 2, claimed: 1, xpEarned: 50 },
        offers,
      },
    }),
  );
  expect(mockSetLastSeen).toHaveBeenCalled();
});

// The API stamps claimedAt without always flipping status, so keying off
// status alone counted zero claims and the popup never fired.
it('counts a quest claimed by timestamp even when its status lags', async () => {
  const { queryClient } = renderComponent(
    makeDashboard([
      makeQuest({
        status: QuestStatus.Completed,
        claimedAt: new Date(),
      }),
    ]),
  );

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
      type: LazyModal.QuestOffers,
      props: { summary: { total: 1, claimed: 1, xpEarned: 50 } },
    }),
  );
});

it('does not open before anything has been claimed', async () => {
  const { queryClient } = renderComponent(
    makeDashboard([
      makeQuest({ status: QuestStatus.InProgress }),
      makeQuest({
        rotationId: 'rot-2',
        userQuestId: 'uq-2',
        status: QuestStatus.Completed,
        claimable: true,
      }),
    ]),
  );

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined(),
  );
  expect(mockSetLastSeen).not.toHaveBeenCalled();
});

// A free user can never claim the Plus bucket, so counting it would show them
// a progress denominator they can never close.
it('keeps locked quests out of the progress total', async () => {
  const dashboard = makeDashboard([makeQuest()]);
  dashboard.daily.plus = [
    makeQuest({
      rotationId: 'rot-plus',
      userQuestId: null,
      status: QuestStatus.InProgress,
      locked: true,
    }),
  ];

  const { queryClient } = renderComponent(dashboard);

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
      type: LazyModal.QuestOffers,
      props: { summary: { total: 1, claimed: 1, xpEarned: 50 } },
    }),
  );
});

it('does not open twice on the same day', async () => {
  mockLastSeen = new Date().toISOString();

  const { queryClient } = renderComponent(makeDashboard([makeQuest()]));

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined(),
  );
});

it('opens again once the stamped day has passed', async () => {
  mockLastSeen = subDays(new Date(), 1).toISOString();

  const { queryClient } = renderComponent(makeDashboard([makeQuest()]));

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
      type: LazyModal.QuestOffers,
    }),
  );
});

it('shows nothing to the control group', async () => {
  jest
    .spyOn(conditionalFeatureHook, 'useConditionalFeature')
    .mockReturnValue({ value: false, isLoading: false });

  const { queryClient } = renderComponent(makeDashboard([makeQuest()]));

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined(),
  );
  expect(mockSetLastSeen).not.toHaveBeenCalled();
});

// No inventory must not burn the day: offers can appear later, and there is no
// classic popup to fall back to.
it('shows nothing, and keeps the day unstamped, when no offers return', async () => {
  mockOffersResponse([]);

  const { queryClient } = renderComponent(makeDashboard([makeQuest()]));

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined(),
  );
  expect(mockSetLastSeen).not.toHaveBeenCalled();
});

it('does not open for a user who opted out of the quest system', async () => {
  const queryClient = new QueryClient();

  jest.spyOn(questDashboardHook, 'useQuestDashboard').mockReturnValue({
    data: makeDashboard([makeQuest()]),
  } as ReturnType<typeof questDashboardHook.useQuestDashboard>);

  render(
    <TestBootProvider
      client={queryClient}
      settings={{ loadedSettings: true, optOutQuestSystem: true }}
    >
      <QuestOffersPopup />
    </TestBootProvider>,
  );

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined(),
  );
});
