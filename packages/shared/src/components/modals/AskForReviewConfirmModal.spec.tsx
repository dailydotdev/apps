import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import AskForReviewConfirmModal from './AskForReviewConfirmModal';
import type { ReviewDestination } from '../../lib/askForReview';
import { ASK_FOR_REVIEW_DISMISSED_KEY } from '../../lib/askForReview';
import * as actionsHook from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';

const CHROME_DEST: ReviewDestination = {
  id: 'chrome_web_store',
  label: 'Chrome Web Store',
  href: 'https://example.test/chrome',
  headline: 'Help fellow devs find daily.dev',
  body: 'Take 10 seconds to rate daily.dev on the Chrome Web Store.',
  ctaText: 'Rate on Chrome Web Store',
  image: 'https://example.test/image.png',
};

const APP_STORE_DEST: ReviewDestination = {
  id: 'app_store',
  label: 'App Store',
  href: 'https://example.test/app-store',
  headline: 'Help fellow devs find daily.dev',
  body: 'Take 10 seconds to rate daily.dev on the App Store.',
  ctaText: 'Rate on the App Store',
  image: 'https://example.test/image.png',
};

const completeAction = jest.fn();
const onRequestClose = jest.fn();

const renderModal = (destination: ReviewDestination = CHROME_DEST): void => {
  const client = new QueryClient();
  render(
    <TestBootProvider client={client}>
      <AskForReviewConfirmModal
        isOpen
        destination={destination}
        streakValue={5}
        onRequestClose={onRequestClose}
      />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  window.localStorage.clear();
  completeAction.mockReset();
  onRequestClose.mockReset();
  jest.spyOn(actionsHook, 'useActions').mockReturnValue({
    completeAction,
    checkHasCompleted: () => false,
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

it('renders the destination-specific headline, body, and CTA text', () => {
  renderModal();
  expect(
    screen.getByText('Help fellow devs find daily.dev'),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      'Take 10 seconds to rate daily.dev on the Chrome Web Store.',
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Rate on Chrome Web Store' }),
  ).toBeInTheDocument();
});

it('points the CTA at the destination href with target=_blank', () => {
  renderModal();
  const cta = screen.getByRole('link', { name: 'Rate on Chrome Web Store' });
  expect(cta).toHaveAttribute('href', 'https://example.test/chrome');
  expect(cta).toHaveAttribute('target', '_blank');
});

it('renders the destination hero image with a meaningful alt', () => {
  renderModal();
  const image = screen.getByAltText('Leave a review on Chrome Web Store');
  expect(image).toHaveAttribute('src', 'https://example.test/image.png');
});

it('marks the action complete and closes when the CTA is clicked', () => {
  renderModal();
  fireEvent.click(
    screen.getByRole('link', { name: 'Rate on Chrome Web Store' }),
  );
  expect(completeAction).toHaveBeenCalledWith(
    ActionType.AskedForReviewComplete,
  );
  expect(onRequestClose).toHaveBeenCalled();
});

it('writes a cooldown timestamp and closes when dismissed without engaging', () => {
  renderModal();
  fireEvent.click(
    screen.getByRole('button', { name: 'Dismiss review prompt' }),
  );
  expect(completeAction).not.toHaveBeenCalled();
  expect(
    window.localStorage.getItem(ASK_FOR_REVIEW_DISMISSED_KEY),
  ).not.toBeNull();
  expect(onRequestClose).toHaveBeenCalled();
});

it('reflects a different destination when passed App Store', () => {
  renderModal(APP_STORE_DEST);
  expect(
    screen.getByRole('link', { name: 'Rate on the App Store' }),
  ).toHaveAttribute('href', 'https://example.test/app-store');
});
