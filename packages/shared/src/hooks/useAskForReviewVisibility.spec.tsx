import React from 'react';
import nock from 'nock';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import { useAskForReviewVisibility } from './useAskForReviewVisibility';
import * as actionsHook from './useActions';
import * as streakHook from './streaks/useReadingStreak';
import * as askForReviewLib from '../lib/askForReview';
import type { ReviewDestination } from '../lib/askForReview';
import { ActionType } from '../graphql/actions';
import { DayOfWeek } from '../lib/date';
import type { AskForReviewFeatureValue } from '../lib/featureManagement';

const CHROME_DEST: ReviewDestination = {
  id: 'chrome_web_store',
  label: 'Chrome Web Store',
  href: 'https://example.test/chrome',
};

const buildStreak = (current: number) => ({
  isLoading: false,
  isStreaksEnabled: true,
  isUpdatingConfig: false,
  streak: {
    current,
    max: current,
    total: current,
    weekStart: DayOfWeek.Monday,
    lastViewAt: new Date(),
  },
  updateStreakConfig: jest.fn(),
  checkReadingStreak: jest.fn(),
});

const buildGrowthBook = (value: AskForReviewFeatureValue): GrowthBook => {
  const gb = new GrowthBook();
  gb.setFeatures({
    ask_for_review: {
      defaultValue: value,
    },
  });
  return gb;
};

const renderVisibility = (
  current = 3,
  featureValue: AskForReviewFeatureValue = {
    enabled: true,
    streakThreshold: 3,
    cooldownDays: 14,
  },
  checkHasCompletedImpl: (type: ActionType) => boolean = () => false,
  destination: ReviewDestination | null = CHROME_DEST,
) => {
  jest
    .spyOn(streakHook, 'useReadingStreak')
    .mockReturnValue(buildStreak(current));
  jest.spyOn(actionsHook, 'useActions').mockReturnValue({
    completeAction: jest.fn(),
    checkHasCompleted: checkHasCompletedImpl,
    isActionsFetched: true,
    actions: [],
  });
  jest
    .spyOn(askForReviewLib, 'getReviewDestination')
    .mockReturnValue(destination);

  const client = new QueryClient();
  return renderHook(() => useAskForReviewVisibility(), {
    wrapper: ({ children }) => (
      <TestBootProvider
        client={client}
        gb={buildGrowthBook(featureValue)}
        auth={{
          user: {
            id: 'u1',
            email: 'u1@daily.dev',
            name: 'User One',
            username: 'u1',
          } as never,
        }}
        settings={{ loadedSettings: true, optOutReadingStreak: false }}
      >
        {children}
      </TestBootProvider>
    ),
  });
};

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  nock.cleanAll();
  nock('http://localhost:3000')
    .post('/graphql')
    .optionally()
    .times(10)
    .reply(200, { data: {} });
});

it('is visible when all gates pass', async () => {
  const { result } = renderVisibility();
  await waitFor(() => expect(result.current.visible).toBe(true));
  expect(result.current.destination?.id).toBe('chrome_web_store');
});

it('is hidden when the feature flag is disabled', async () => {
  const { result } = renderVisibility(3, {
    enabled: false,
    streakThreshold: 3,
    cooldownDays: 14,
  });
  await waitFor(() => expect(result.current.variantEnabled).toBe(false));
  expect(result.current.visible).toBe(false);
});

it('is hidden when current streak is below threshold', async () => {
  const { result } = renderVisibility(2);
  await waitFor(() => expect(result.current.streakValue).toBe(2));
  expect(result.current.visible).toBe(false);
});

it('is hidden when the permanent action is already completed', async () => {
  const { result } = renderVisibility(
    3,
    { enabled: true, streakThreshold: 3, cooldownDays: 14 },
    (type) => type === ActionType.AskedForReviewComplete,
  );
  await waitFor(() => expect(result.current.visible).toBe(false));
});

it('is hidden when there is no destination for the current platform', async () => {
  const { result } = renderVisibility(
    3,
    { enabled: true, streakThreshold: 3, cooldownDays: 14 },
    () => false,
    null,
  );
  await waitFor(() => expect(result.current.destination).toBeNull());
  expect(result.current.visible).toBe(false);
});

it('is hidden while inside the cooldown window', async () => {
  askForReviewLib.setDismissedAt(Date.now() - 1000);
  const { result } = renderVisibility();
  await waitFor(() => expect(result.current.visible).toBe(false));
});

it('becomes visible again after the cooldown elapses (loop)', async () => {
  const fifteenDays = 15 * 24 * 60 * 60 * 1000;
  askForReviewLib.setDismissedAt(Date.now() - fifteenDays);
  const { result } = renderVisibility();
  await waitFor(() => expect(result.current.visible).toBe(true));
});

it('is hidden after the session-shown flag is set', async () => {
  askForReviewLib.markShownThisSession();
  const { result } = renderVisibility();
  await waitFor(() => expect(result.current.visible).toBe(false));
});
