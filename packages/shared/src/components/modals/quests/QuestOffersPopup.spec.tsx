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
import { LogEvent, TargetType } from '../../../lib/log';
import * as conditionalFeatureHook from '../../../hooks/useConditionalFeature';
import * as questDashboardHook from '../../../hooks/useQuestDashboard';
import { QuestOffersPopup } from './QuestOffersPopup';

const mockSetLastSeen = jest.fn();
const mockSetEligibleLoggedAt = jest.fn();
let mockLastSeen: string | null = null;
let mockEligibleLoggedAt: string | null = null;
// The two stamps are independent idb reads that can resolve in either order.
let mockIsEligibleLogFetched = true;

// The modal stamp and the eligibility-event stamp are deliberately separate,
// so the mock has to keep them apart too.
jest.mock('../../../hooks/usePersistentContext', () => ({
  ...jest.requireActual('../../../hooks/usePersistentContext'),
  __esModule: true,
  default: (key: string) =>
    key === 'quest_offers_last_seen'
      ? [mockLastSeen, mockSetLastSeen, true, false]
      : [
          mockEligibleLoggedAt,
          mockSetEligibleLoggedAt,
          mockIsEligibleLogFetched,
          false,
        ],
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

const logEvent = jest.fn();

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
      <TestBootProvider client={queryClient} log={{ logEvent }}>
        <QuestOffersPopup />
      </TestBootProvider>,
    ),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLastSeen = null;
  mockEligibleLoggedAt = null;
  mockIsEligibleLogFetched = true;
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
        // The stamp is delegated to the modal so it can only be written for a
        // popup that reached the screen; the collision case below is what
        // pins the trigger not writing it itself.
        onShown: expect.any(Function),
      },
    }),
  );
  // LazyModalElement is in the test tree, so the modal really mounts and runs
  // the delegated stamp — end-to-end, not just the prop handover.
  await waitFor(() => expect(mockSetLastSeen).toHaveBeenCalled());
});

// MainLayout mounts three independent MODAL_KEY writers whose effects run in
// the same commit, and `modal` is only a render snapshot.
it('yields to a sibling popup that already claimed the modal slot', async () => {
  const queryClient = new QueryClient();

  jest.spyOn(questDashboardHook, 'useQuestDashboard').mockReturnValue({
    data: makeDashboard([makeQuest()]),
  } as ReturnType<typeof questDashboardHook.useQuestDashboard>);

  render(
    <TestBootProvider client={queryClient} log={{ logEvent }}>
      <QuestOffersPopup />
    </TestBootProvider>,
  );

  // Land a sibling's write before our effect can read the live value.
  queryClient.setQueryData(MODAL_KEY, {
    type: LazyModal.NewStreak,
    props: {},
  });

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
      type: LazyModal.NewStreak,
    }),
  );
  expect(mockSetLastSeen).not.toHaveBeenCalled();
});

// The stamps are separate idb reads. If the modal could open while the
// eligibility stamp was still resolving, opening would flip `shouldShow` false
// for the day and the event would be lost — only for treatment-with-inventory,
// which is precisely where the numerator lives.
it('waits for both day stamps before doing anything', async () => {
  mockIsEligibleLogFetched = false;

  const { queryClient } = renderComponent(makeDashboard([makeQuest()]));

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined(),
  );
  expect(logEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({ event_name: LogEvent.QuestOffersEligible }),
  );
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

// The total is the day's potential and has to match the quest panel, which
// shows locked Plus quests too — a free user counting the screen must not get
// a different number from the popup.
it('counts locked quests toward the progress total', async () => {
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
      props: { summary: { total: 2, claimed: 1, xpEarned: 50 } },
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

describe('eligibility logging', () => {
  const expectEligible = (extra: Record<string, unknown>) =>
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.QuestOffersEligible,
      target_type: TargetType.QuestOffer,
      target_id: '1',
      extra: JSON.stringify(extra),
    });

  it('logs the treatment arm with the offers it found', async () => {
    renderComponent(makeDashboard([makeQuest()]));

    await waitFor(() =>
      expectEligible({ enabled: true, offers: 1, failed: false }),
    );
    expect(mockSetEligibleLoggedAt).toHaveBeenCalled();
  });

  // Without this the control arm is invisible and the experiment has no
  // denominator to compare the treatment against.
  it('logs the control arm, which renders nothing', async () => {
    jest
      .spyOn(conditionalFeatureHook, 'useConditionalFeature')
      .mockReturnValue({ value: false, isLoading: false });

    const { queryClient } = renderComponent(makeDashboard([makeQuest()]));

    await waitFor(() =>
      expectEligible({ enabled: false, offers: 0, failed: false }),
    );
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined();
  });

  // This is the case that cost us four rounds of debugging: treatment reached
  // the moment but Encore had no stock, which looks identical to a dud
  // experiment unless it is logged.
  it('logs treatment separately when no offers came back', async () => {
    mockOffersResponse([]);

    renderComponent(makeDashboard([makeQuest()]));

    await waitFor(() =>
      expectEligible({ enabled: true, offers: 0, failed: false }),
    );
  });

  // `retry: false` means a failed fetch also settles with no offers, so
  // without this flag a broken query reads as healthy-but-empty inventory.
  it('separates a failed offers fetch from empty inventory', async () => {
    nock.cleanAll();
    nock('http://localhost:3000').post('/graphql').reply(500, {});
    nock('http://localhost:3000')
      .post('/graphql')
      .optionally()
      .times(10)
      .reply(200, { data: {} });

    renderComponent(makeDashboard([makeQuest()]));

    await waitFor(() =>
      expectEligible({ enabled: true, offers: 0, failed: true }),
    );
  });

  it('logs once per day, on its own stamp', async () => {
    mockEligibleLoggedAt = new Date().toISOString();

    const { queryClient } = renderComponent(makeDashboard([makeQuest()]));

    // Anchor on the modal opening: it proves the effects ran, so the absent
    // eligibility event is a real suppression rather than a race won early.
    await waitFor(() =>
      expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
        type: LazyModal.QuestOffers,
      }),
    );
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.QuestOffersEligible,
      }),
    );
    expect(mockSetEligibleLoggedAt).not.toHaveBeenCalled();
  });

  // The stamps are independent in the direction that matters: an earlier
  // eligibility event — logged by control, or by a treatment that found no
  // stock — must not stop the modal showing once offers do turn up.
  it('still opens the modal when eligibility was already logged today', async () => {
    mockEligibleLoggedAt = new Date().toISOString();

    const { queryClient } = renderComponent(makeDashboard([makeQuest()]));

    await waitFor(() =>
      expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
        type: LazyModal.QuestOffers,
      }),
    );
  });
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
