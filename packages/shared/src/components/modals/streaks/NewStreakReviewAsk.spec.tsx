import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { get as getCache, set as setCache } from 'idb-keyval';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import * as actionHook from '../../../hooks/useActions';
import { PersistentContextKeys } from '../../../hooks/usePersistentContext';
import { LogEvent, TargetType } from '../../../lib/log';
import {
  iOSSupportsReview,
  openIOSWriteReview,
  requestIOSReview,
} from '../../../lib/ios';
import {
  appStoreReviewCopy,
  streakReviewRequestDelayMs,
  streakReviewTargetId,
} from '../../appStoreReview/common';
import NewStreakModal from './NewStreakModal';

jest.mock('../../../lib/ios', () => ({
  ...jest.requireActual('../../../lib/ios'),
  iOSSupportsReview: jest.fn(() => true),
  openIOSWriteReview: jest.fn(() => true),
  requestIOSReview: jest.fn(() => true),
}));

const logEvent = jest.fn();
const onRequestClose = jest.fn();

const renderModal = ({
  currentStreak = 30,
  client = new QueryClient(),
  isEnabled = true,
}: {
  currentStreak?: number;
  client?: QueryClient;
  isEnabled?: boolean;
} = {}) =>
  render(
    <TestBootProvider
      gb={
        new GrowthBook({
          features: { app_store_review: { defaultValue: isEnabled } },
        })
      }
      auth={{ user: loggedUser }}
      client={client}
      log={{ logEvent }}
    >
      <NewStreakModal
        currentStreak={currentStreak}
        maxStreak={currentStreak + 10}
        isOpen
        onRequestClose={onRequestClose}
      />
    </TestBootProvider>,
  );

const findRateButton = () =>
  screen.findByRole('button', { name: appStoreReviewCopy.ctaLabel });

const expectNoAsk = async () => {
  await screen.findByText('Never show this again');
  await act(async () => {
    await jest.runOnlyPendingTimersAsync();
  });
  expect(
    screen.queryByRole('button', { name: appStoreReviewCopy.ctaLabel }),
  ).not.toBeInTheDocument();
};

describe('NewStreakModal App Store review ask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ doNotFake: ['setImmediate', 'queueMicrotask'] });
    jest.mocked(iOSSupportsReview).mockReturnValue(true);
    window.scrollTo = jest.fn();
    jest.spyOn(actionHook, 'useActions').mockReturnValue({
      completeAction: jest.fn(),
      checkHasCompleted: jest.fn().mockReturnValue(false),
      isActionsFetched: true,
      actions: [],
    });
    nock.cleanAll();
    nock('http://localhost:3000')
      .post('/graphql')
      .optionally()
      .times(10)
      .reply(200, { data: {} });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows the card on iOS with the bridge at 30+ days', async () => {
    renderModal();

    expect(await findRateButton()).toHaveTextContent(appStoreReviewCopy.cta);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.AppStoreReview,
      target_id: streakReviewTargetId,
    });
    expect(requestIOSReview).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(streakReviewRequestDelayMs);
    });

    expect(requestIOSReview).toHaveBeenCalledTimes(1);
    expect(await getCache(PersistentContextKeys.ReviewPrompt)).toMatchObject({
      lastAskedAt: expect.any(String),
    });
  });

  it('opens the write-a-review screen and skips the pop-up once Rate was tapped', async () => {
    renderModal();

    fireEvent.click(await findRateButton());

    act(() => {
      jest.advanceTimersByTime(streakReviewRequestDelayMs);
    });

    expect(openIOSWriteReview).toHaveBeenCalledTimes(1);
    expect(requestIOSReview).not.toHaveBeenCalled();
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('is unchanged outside the iOS app with the bridge', async () => {
    jest.mocked(iOSSupportsReview).mockReturnValue(false);
    renderModal();

    await expectNoAsk();
    expect(requestIOSReview).not.toHaveBeenCalled();
  });

  it('is unchanged when the app_store_review flag is off', async () => {
    renderModal({ isEnabled: false });

    await expectNoAsk();
    expect(requestIOSReview).not.toHaveBeenCalled();
  });

  it('is unchanged below a 30-day milestone', async () => {
    renderModal({ currentStreak: 29 });

    await expectNoAsk();
  });

  it('is unchanged within 120 days of the last ask', async () => {
    await setCache(PersistentContextKeys.ReviewPrompt, {
      lastAskedAt: new Date().toISOString(),
    });
    renderModal();

    await expectNoAsk();
  });
});
