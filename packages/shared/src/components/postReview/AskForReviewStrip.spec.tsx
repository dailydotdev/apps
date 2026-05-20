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

it('renders step 1 with explicit copy that mentions daily.dev', () => {
  renderStrip();
  expect(screen.getByText('Enjoying daily.dev so far?')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
});

it('marks the session-shown flag on mount', () => {
  renderStrip();
  expect(window.sessionStorage.getItem(ASK_FOR_REVIEW_SESSION_KEY)).toBe('1');
});

it('advances to the review step when user clicks Yes', () => {
  renderStrip();
  fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
  expect(
    screen.getByText('Awesome! Leave a quick Chrome Web Store review'),
  ).toBeInTheDocument();
  const cta = screen.getByRole('link', { name: 'Leave a review' });
  expect(cta).toHaveAttribute('href', CHROME_DEST.href);
  expect(cta).toHaveAttribute('target', '_blank');
});

it('marks the action complete when user clicks Leave a review', async () => {
  renderStrip();
  fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
  fireEvent.click(screen.getByRole('link', { name: 'Leave a review' }));
  await waitFor(() => {
    expect(completeAction).toHaveBeenCalledWith(
      ActionType.AskedForReviewComplete,
    );
  });
});

it('opens the Feedback modal with UxIssue category and marks complete on No', async () => {
  renderStrip();
  fireEvent.click(screen.getByRole('button', { name: 'No' }));
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

it('writes the dismissed-at timestamp when user dismisses step 1 without engaging', () => {
  renderStrip();
  fireEvent.click(
    screen.getByRole('button', { name: 'Dismiss review prompt' }),
  );
  expect(completeAction).not.toHaveBeenCalled();
  expect(
    window.localStorage.getItem(ASK_FOR_REVIEW_DISMISSED_KEY),
  ).not.toBeNull();
});

it('marks the action complete when user dismisses step 2', async () => {
  renderStrip();
  fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
  fireEvent.click(
    screen.getByRole('button', { name: 'Dismiss review prompt' }),
  );
  await waitFor(() => {
    expect(completeAction).toHaveBeenCalledWith(
      ActionType.AskedForReviewComplete,
    );
  });
});

it('renders the destination label dynamically (App Store)', () => {
  renderStrip({
    id: 'app_store',
    label: 'App Store',
    href: 'https://example.test/app-store',
  });
  fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
  expect(
    screen.getByText('Awesome! Leave a quick App Store review'),
  ).toBeInTheDocument();
});
