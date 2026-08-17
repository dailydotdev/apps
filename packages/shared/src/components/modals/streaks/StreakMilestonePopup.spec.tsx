import React from 'react';
import nock from 'nock';
import { render, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { Alerts } from '../../../graphql/alerts';
import { StreakMilestonePopup } from './StreakMilestonePopup';
import * as actionHook from '../../../hooks/useActions';
import * as streakHook from '../../../hooks/streaks/useReadingStreak';
import * as conditionalFeatureHook from '../../../hooks/useConditionalFeature';
import { ActionType } from '../../../graphql/actions';
import type { UserOffer } from '../../../graphql/offers';
import { USER_OFFERS_QUERY } from '../../../graphql/offers';
import { LazyModal } from '../common/types';
import { MODAL_KEY } from '../../../hooks/useLazyModal';
import { DayOfWeek } from '../../../lib/date';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';

const defaultAlerts: Alerts = {
  filter: true,
  rankLastSeen: undefined,
  bootPopup: true,
  showStreakMilestone: true,
};

const checkHasCompleted = jest.fn().mockReturnValue(false);
const updateAlerts = jest.fn();

type ReadingStreakReturn = ReturnType<typeof streakHook.useReadingStreak>;

const defaultStreak: ReadingStreakReturn = {
  isLoading: false,
  isStreaksEnabled: true,
  isUpdatingConfig: false,
  streak: {
    current: 5,
    max: 5,
    total: 5,
    weekStart: DayOfWeek.Monday,
    lastViewAt: new Date(),
    freezesAvailable: 0,
  },
  updateStreakConfig: jest.fn(),
  checkReadingStreak: jest.fn(),
};

const renderComponent = ({
  alerts = defaultAlerts,
  streak = defaultStreak,
}: {
  alerts?: Alerts;
  streak?: ReadingStreakReturn;
} = {}) => {
  const queryClient = new QueryClient();

  jest.spyOn(streakHook, 'useReadingStreak').mockReturnValue(streak);

  return {
    queryClient,
    ...render(
      <TestBootProvider
        client={queryClient}
        alerts={{ alerts, updateAlerts }}
        settings={{ loadedSettings: true, optOutReadingStreak: false }}
      >
        <StreakMilestonePopup />
      </TestBootProvider>,
    ),
  };
};

beforeEach(() => {
  window.scrollTo = jest.fn();

  jest
    .spyOn(conditionalFeatureHook, 'useConditionalFeature')
    .mockReturnValue({ value: false, isLoading: false });

  jest.spyOn(actionHook, 'useActions').mockReturnValue({
    completeAction: jest.fn(),
    checkHasCompleted,
    isActionsFetched: true,
    actions: [],
  });

  checkHasCompleted.mockReset().mockReturnValue(false);
  updateAlerts.mockReset();
  nock.cleanAll();
  nock('http://localhost:3000')
    .post('/graphql')
    .optionally()
    .times(10)
    .reply(200, { data: {} });
});

it('should open milestone modal when all conditions are met', async () => {
  const { queryClient } = renderComponent();

  await waitFor(() => {
    const modal = queryClient.getQueryData(MODAL_KEY);
    expect(modal).toMatchObject({
      type: LazyModal.NewStreak,
      props: { currentStreak: 5, maxStreak: 5 },
    });
  });
});

it('should not open when showStreakMilestone is false', async () => {
  const { queryClient } = renderComponent({
    alerts: { ...defaultAlerts, showStreakMilestone: false },
  });

  await waitFor(() => {
    const modal = queryClient.getQueryData(MODAL_KEY);
    expect(modal).toBeUndefined();
  });
});

it('should not open when streak is 0', async () => {
  const { queryClient } = renderComponent({
    streak: {
      ...defaultStreak,
      streak: {
        current: 0,
        max: 5,
        total: 5,
        weekStart: DayOfWeek.Monday,
        lastViewAt: new Date(),
        freezesAvailable: 0,
      },
    },
  });

  await waitFor(() => {
    const modal = queryClient.getQueryData(MODAL_KEY);
    expect(modal).toBeUndefined();
  });
});

it('should not open when user disabled milestone popup', async () => {
  checkHasCompleted.mockImplementation(
    (action: ActionType) => action === ActionType.DisableReadingStreakMilestone,
  );

  const { queryClient } = renderComponent();

  await waitFor(() => {
    const modal = queryClient.getQueryData(MODAL_KEY);
    expect(modal).toBeUndefined();
  });
});

it('should not open when streaks are disabled', async () => {
  const { queryClient } = renderComponent({
    streak: { ...defaultStreak, isStreaksEnabled: false },
  });

  await waitFor(() => {
    const modal = queryClient.getQueryData(MODAL_KEY);
    expect(modal).toBeUndefined();
  });
});

describe('streak milestone offers experiment', () => {
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
        variables: { placement: 'STREAK_MILESTONE' },
      },
      result: { data: { userOffers } },
    });
    nock('http://localhost:3000')
      .post('/graphql')
      .optionally()
      .times(10)
      .reply(200, { data: {} });
  };

  beforeEach(() => {
    jest
      .spyOn(conditionalFeatureHook, 'useConditionalFeature')
      .mockReturnValue({ value: true, isLoading: false });
  });

  it('should open the offers modal when treatment returns offers', async () => {
    mockOffersResponse(offers);

    const { queryClient } = renderComponent();

    await waitFor(() => {
      const modal = queryClient.getQueryData(MODAL_KEY);
      expect(modal).toMatchObject({
        type: LazyModal.StreakOffers,
        props: { currentStreak: 5, maxStreak: 5, offers },
      });
    });
  });

  it('should fall back to the classic modal when treatment has no offers', async () => {
    mockOffersResponse([]);

    const { queryClient } = renderComponent();

    await waitFor(() => {
      const modal = queryClient.getQueryData(MODAL_KEY);
      expect(modal).toMatchObject({
        type: LazyModal.NewStreak,
        props: { currentStreak: 5, maxStreak: 5 },
      });
    });
  });
});

it('should not open when another modal is already showing', async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(MODAL_KEY, {
    type: LazyModal.GenericReferral,
    props: {},
  });

  jest.spyOn(streakHook, 'useReadingStreak').mockReturnValue(defaultStreak);

  render(
    <TestBootProvider
      client={queryClient}
      alerts={{ alerts: defaultAlerts, updateAlerts }}
      settings={{ loadedSettings: true, optOutReadingStreak: false }}
    >
      <StreakMilestonePopup />
    </TestBootProvider>,
  );

  await waitFor(() => {
    const modal = queryClient.getQueryData(MODAL_KEY);
    expect(modal).toMatchObject({ type: LazyModal.GenericReferral });
  });
});
