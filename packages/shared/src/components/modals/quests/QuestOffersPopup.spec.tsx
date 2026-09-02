import type { ReactElement } from 'react';
import React from 'react';
import nock from 'nock';
import { act, render, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import type { SettingsContextData } from '../../../contexts/SettingsContext';
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
import { RequestKey } from '../../../lib/query';
import { LogEvent, TargetType } from '../../../lib/log';
import { QUEST_CLAIMED_EVENT } from '../../../lib/questClaimed';
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

const makeDashboard = (
  daily: UserQuest[],
  plus: UserQuest[] = [],
): QuestDashboard => ({
  level: { level: 12, totalXp: 1240, xpInLevel: 40, xpToNextLevel: 60 },
  currentStreak: 4,
  longestStreak: 9,
  daily: { regular: daily, plus },
  weekly: { regular: [], plus: [] },
  milestone: [],
  intro: [],
});

/** One claimed daily quest. */
const claimed = () => makeDashboard([makeQuest()]);

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
let mockDashboard: QuestDashboard | undefined;

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

const tree = (
  queryClient: QueryClient,
  settings?: Partial<SettingsContextData>,
): ReactElement => (
  <TestBootProvider client={queryClient} log={{ logEvent }} settings={settings}>
    <QuestOffersPopup />
  </TestBootProvider>
);

// Whether the offers query is live. React Query flips fetchStatus during the
// mount commit that `render`/`act` flushes, so this is synchronous and
// deterministic — no elapsed time to guess at.
const isFetchingOffers = (queryClient: QueryClient) =>
  queryClient
    .getQueryCache()
    .findAll()
    .some(
      (query) =>
        query.queryKey.includes(RequestKey.UserOffers) &&
        query.state.fetchStatus === 'fetching',
    );

/** Renders with the dashboard already loaded, and nothing newly claimed. */
const renderLoaded = (
  dashboard: QuestDashboard | undefined,
  settings?: Partial<SettingsContextData>,
) => {
  const queryClient = new QueryClient();

  mockDashboard = dashboard;

  return { queryClient, ...render(tree(queryClient, settings)) };
};

// What `useClaimQuestReward` dispatches once a claim succeeds.
const dispatchClaim = (questType = QuestType.Daily) =>
  act(() => {
    window.dispatchEvent(
      new CustomEvent(QUEST_CLAIMED_EVENT, {
        detail: { questId: 'q-1', questType },
      }),
    );
  });

// The dashboard is already current by the time the event fires — the mutation
// writes the cache before dispatching.
const renderAndClaim = (
  dashboard: QuestDashboard,
  settings?: Partial<SettingsContextData>,
) => {
  const view = renderLoaded(dashboard, settings);

  dispatchClaim();

  return view;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLastSeen = null;
  mockEligibleLoggedAt = null;
  mockIsEligibleLogFetched = true;
  window.scrollTo = jest.fn();
  jest
    .spyOn(questDashboardHook, 'useQuestDashboard')
    .mockImplementation(
      () =>
        ({ data: mockDashboard } as ReturnType<
          typeof questDashboardHook.useQuestDashboard
        >),
    );
  jest
    .spyOn(conditionalFeatureHook, 'useConditionalFeature')
    .mockReturnValue({ value: true, isLoading: false });
  mockOffersResponse(offers);
});

it('opens the offers modal when a claim lands while the app is open', async () => {
  const { queryClient } = renderAndClaim(claimed());

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
      type: LazyModal.QuestOffers,
      props: {
        level: 12,
        summary: { total: 1, claimed: 1, xpEarned: 50 },
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

// The reported bug: the reward turned up on a later visit, detached from the
// action that earned it. Having claimed today is no longer the trigger.
//
// Anchored on whether the offers query went live rather than on elapsed time.
// Under the old state check the entry render enables it during mount, so this
// reads `true` before any claim — which is what makes the test discriminating
// without a wall-clock sleep to lose races against on CI.
it('stays shut on app entry, and opens only once a claim is dispatched', () => {
  const view = renderLoaded(claimed());

  expect(isFetchingOffers(view.queryClient)).toBe(false);
  expect(view.queryClient.getQueryData(MODAL_KEY)).toBeUndefined();
  expect(mockSetLastSeen).not.toHaveBeenCalled();

  // Positive anchor: the claim does put the query live, so the check above was
  // the entry gate and not an assertion that can never fail.
  dispatchClaim();

  expect(isFetchingOffers(view.queryClient)).toBe(true);
});

// Any real claim is a reward moment; the quest's cadence is not the point.
it.each([QuestType.Daily, QuestType.Weekly, QuestType.Milestone])(
  'opens on a %s claim',
  async (questType) => {
    const view = renderLoaded(claimed());

    dispatchClaim(questType);

    await waitFor(() =>
      expect(view.queryClient.getQueryData(MODAL_KEY)).toMatchObject({
        type: LazyModal.QuestOffers,
      }),
    );
  },
);

// Intro quests are onboarding: they have their own celebration in
// IntroQuestModal, and since that is a LazyModal this trigger would defer
// behind it and land a sponsored offer as someone's first-run experience.
it('ignores an intro quest claim', async () => {
  const view = renderLoaded(claimed());

  dispatchClaim(QuestType.Intro);

  expect(isFetchingOffers(view.queryClient)).toBe(false);

  // Positive anchor, so the check above cannot pass vacuously.
  dispatchClaim(QuestType.Daily);

  await waitFor(() =>
    expect(view.queryClient.getQueryData(MODAL_KEY)).toMatchObject({
      type: LazyModal.QuestOffers,
    }),
  );
});

// A claim nobody acts on has to expire, or it stops being a moment: a tab
// open past midnight finds the day stamp cleared and would open on no action.
it('expires a claim that never got acted on', async () => {
  jest.useFakeTimers();

  try {
    const { queryClient } = renderLoaded(claimed());

    // Hold the slot so the claim cannot be spent, then let the window pass.
    queryClient.setQueryData(MODAL_KEY, {
      type: LazyModal.NewStreak,
      props: {},
    });
    dispatchClaim();

    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    // The sibling closing is no longer enough — the claim is gone. The extra
    // tick flushes React Query's notify batching, which fake timers stall;
    // without it the listener never re-renders and this would pass whether the
    // claim expired or not.
    act(() => {
      queryClient.setQueryData(MODAL_KEY, null);
      jest.advanceTimersByTime(1);
    });

    expect(isFetchingOffers(queryClient)).toBe(false);
    expect(queryClient.getQueryData(MODAL_KEY)).toBeNull();
  } finally {
    jest.useRealTimers();
  }
});

// A treatment that came back empty must not be revived by a later refetch
// landing inventory long after the claim.
it('spends the claim even when no offers came back', async () => {
  mockOffersResponse([]);

  const { queryClient } = renderAndClaim(claimed());

  // Waits for the offers fetch to settle, which is when the claim is spent.
  await waitFor(() =>
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.QuestOffersEligible }),
    ),
  );

  // Inventory turns up later in the same session. With the claim spent the
  // query is disabled, so invalidating it cannot put it back in flight —
  // checked synchronously, since a `toBeUndefined` on the modal would pass at
  // t=0 whether the claim was spent or not.
  mockOffersResponse(offers);
  act(() => {
    queryClient.invalidateQueries();
  });

  expect(isFetchingOffers(queryClient)).toBe(false);
  expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined();
});

// MainLayout mounts three independent MODAL_KEY writers whose effects run in
// the same commit, and `modal` is only a render snapshot.
it('defers to a sibling popup that already claimed the modal slot', async () => {
  const { queryClient } = renderLoaded(claimed());

  queryClient.setQueryData(MODAL_KEY, {
    type: LazyModal.NewStreak,
    props: {},
  });

  dispatchClaim();

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

  const { queryClient } = renderAndClaim(claimed());

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
  const { queryClient } = renderAndClaim(
    makeDashboard([
      makeQuest({ status: QuestStatus.Completed, claimedAt: new Date() }),
    ]),
  );

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
      type: LazyModal.QuestOffers,
      props: { summary: { total: 1, claimed: 1, xpEarned: 50 } },
    }),
  );
});

// The total is the day's potential and has to match the quest panel, which
// shows locked Plus quests too — a free user counting the screen must not get
// a different number from the popup.
it('counts locked quests toward the progress total', async () => {
  const lockedPlus = [
    makeQuest({
      rotationId: 'rot-plus',
      userQuestId: null,
      status: QuestStatus.InProgress,
      locked: true,
    }),
  ];

  const { queryClient } = renderAndClaim(
    makeDashboard([makeQuest()], lockedPlus),
  );

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
      type: LazyModal.QuestOffers,
      props: { summary: { total: 2, claimed: 1, xpEarned: 50 } },
    }),
  );
});

// Claiming a second quest in the same session must not bring it back.
it('does not open twice on the same day', async () => {
  mockLastSeen = new Date().toISOString();

  const { queryClient } = renderAndClaim(claimed());

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined(),
  );
});

it('opens again once the stamped day has passed', async () => {
  mockLastSeen = subDays(new Date(), 1).toISOString();

  const { queryClient } = renderAndClaim(claimed());

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

  const { queryClient } = renderAndClaim(claimed());

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined(),
  );
  expect(mockSetLastSeen).not.toHaveBeenCalled();
});

// No inventory must not burn the day: offers can appear later, and there is no
// classic popup to fall back to.
it('shows nothing, and keeps the day unstamped, when no offers return', async () => {
  mockOffersResponse([]);

  const { queryClient } = renderAndClaim(claimed());

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
    renderAndClaim(claimed());

    await waitFor(() =>
      expectEligible({
        enabled: true,
        offers: 1,
        questType: QuestType.Daily,
        failed: false,
      }),
    );
    expect(mockSetEligibleLoggedAt).toHaveBeenCalled();
  });

  // Without this the control arm is invisible and the experiment has no
  // denominator to compare the treatment against.
  it('logs the control arm, which renders nothing', async () => {
    jest
      .spyOn(conditionalFeatureHook, 'useConditionalFeature')
      .mockReturnValue({ value: false, isLoading: false });

    const { queryClient } = renderAndClaim(claimed());

    await waitFor(() =>
      expectEligible({
        enabled: false,
        offers: 0,
        questType: QuestType.Daily,
        failed: false,
      }),
    );
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined();
  });

  // Treatment reached the moment but Encore had no stock, which looks
  // identical to a dud experiment unless it is logged.
  it('logs treatment separately when no offers came back', async () => {
    mockOffersResponse([]);

    renderAndClaim(claimed());

    await waitFor(() =>
      expectEligible({
        enabled: true,
        offers: 0,
        questType: QuestType.Daily,
        failed: false,
      }),
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

    renderAndClaim(claimed());

    await waitFor(() =>
      expectEligible({
        enabled: true,
        offers: 0,
        questType: QuestType.Daily,
        failed: true,
      }),
    );
  });

  it('logs once per day, on its own stamp', async () => {
    mockEligibleLoggedAt = new Date().toISOString();

    const { queryClient } = renderAndClaim(claimed());

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

    const { queryClient } = renderAndClaim(claimed());

    await waitFor(() =>
      expect(queryClient.getQueryData(MODAL_KEY)).toMatchObject({
        type: LazyModal.QuestOffers,
      }),
    );
  });
});

it('does not open for a user who opted out of the quest system', async () => {
  const { queryClient } = renderAndClaim(claimed(), {
    loadedSettings: true,
    optOutQuestSystem: true,
  });

  await waitFor(() =>
    expect(queryClient.getQueryData(MODAL_KEY)).toBeUndefined(),
  );
});
