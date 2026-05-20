import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { AskForReviewStripView } from './AskForReviewStrip';
import type { ReviewDestination } from '../../lib/askForReview';
import * as actionsHook from '../../hooks/useActions';
import * as lazyModalHook from '../../hooks/useLazyModal';
import { ActionType } from '../../graphql/actions';
import { LazyModal } from '../modals/common/types';
import { FeedbackCategory } from '../../graphql/feedback';
import {
  ASK_FOR_REVIEW_DISMISSED_KEY,
  ASK_FOR_REVIEW_SESSION_KEY,
} from '../../lib/askForReview';

const CHROME_DEST: ReviewDestination = {
  id: 'chrome_web_store',
  label: 'Chrome Web Store',
  href: 'https://example.test/chrome',
};

const completeAction = jest.fn();
const openModal = jest.fn();

const renderStrip = (
  destination: ReviewDestination = CHROME_DEST,
  streakValue = 3,
): void => {
  const client = new QueryClient();
  render(
    <TestBootProvider client={client}>
      <AskForReviewStripView
        destination={destination}
        streakValue={streakValue}
      />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  completeAction.mockReset();
  openModal.mockReset();
  jest.spyOn(actionsHook, 'useActions').mockReturnValue({
    completeAction,
    checkHasCompleted: () => false,
    isActionsFetched: true,
    actions: [],
  });
  jest.spyOn(lazyModalHook, 'useLazyModal').mockReturnValue({
    modal: undefined as never,
    openModal,
    closeModal: jest.fn(),
  });
  nock.cleanAll();
  nock('http://localhost:3000')
    .post('/graphql')
    .optionally()
    .times(10)
    .reply(200, { data: {} });
});

it('renders the question with explicit daily.dev copy and Yes/No buttons', () => {
  renderStrip();
  expect(screen.getByText('Are you enjoying daily.dev?')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Yes, I enjoy it' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Not really' }),
  ).toBeInTheDocument();
});

it('marks the session-shown flag on mount', () => {
  renderStrip();
  expect(window.sessionStorage.getItem(ASK_FOR_REVIEW_SESSION_KEY)).toBe('1');
});

it('opens the AskForReviewConfirm modal with destination + streak when user clicks Yes', async () => {
  renderStrip();
  fireEvent.click(screen.getByRole('button', { name: 'Yes, I enjoy it' }));
  await waitFor(() => {
    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.AskForReviewConfirm,
      props: { destination: CHROME_DEST, streakValue: 3 },
    });
  });
  expect(completeAction).not.toHaveBeenCalled();
});

it('opens the Feedback modal with UxIssue category and marks complete on No', async () => {
  renderStrip();
  fireEvent.click(screen.getByRole('button', { name: 'Not really' }));
  await waitFor(() => {
    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.Feedback,
      props: { defaultCategory: FeedbackCategory.UxIssue },
    });
    expect(completeAction).toHaveBeenCalledWith(
      ActionType.AskedForReviewComplete,
    );
  });
});

it('writes the dismissed-at timestamp when user dismisses without engaging', () => {
  renderStrip();
  fireEvent.click(
    screen.getByRole('button', { name: 'Dismiss review prompt' }),
  );
  expect(completeAction).not.toHaveBeenCalled();
  expect(
    window.localStorage.getItem(ASK_FOR_REVIEW_DISMISSED_KEY),
  ).not.toBeNull();
});

it('passes the destination through to the confirm modal (App Store)', async () => {
  const appStore: ReviewDestination = {
    id: 'app_store',
    label: 'App Store',
    href: 'https://example.test/app-store',
  };
  renderStrip(appStore);
  fireEvent.click(screen.getByRole('button', { name: 'Yes, I enjoy it' }));
  await waitFor(() => {
    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.AskForReviewConfirm,
      props: { destination: appStore, streakValue: 3 },
    });
  });
});
