import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import {
  FIRST_REPUTATION_GAIN_QUERY,
  ReputationReason,
  ReputationTargetType,
} from '../../graphql/reputation';
import type { ReputationEvent } from '../../graphql/reputation';
import { reputationPrivileges } from '../../lib/constants';
import { useLazyModal } from '../../hooks/useLazyModal';
import FirstReputationModal from './FirstReputationModal';

jest.mock('../../hooks/useLazyModal', () => ({
  ...jest.requireActual('../../hooks/useLazyModal'),
  useLazyModal: jest.fn(),
}));

const closeModal = jest.fn();
const onAfterClose = jest.fn();

const commentUpvote: ReputationEvent = {
  id: 'e1',
  reason: ReputationReason.CommentUpvoted,
  amount: 50,
  createdAt: '2026-11-26T10:00:00.000Z',
  target: {
    id: 'c1',
    type: ReputationTargetType.Comment,
    title: 'Scaling our cache layer without a rewrite',
    permalink: 'https://app.daily.dev/posts/p1#c-c1',
  },
};

const mockFirstGain = (event: ReputationEvent | null) =>
  mockGraphQL({
    request: { query: FIRST_REPUTATION_GAIN_QUERY },
    result: { data: { firstReputationGain: event } },
  });

const renderModal = (client = new QueryClient()) =>
  render(
    <TestBootProvider
      auth={{ user: { ...loggedUser, reputation: 60 } }}
      client={client}
    >
      <FirstReputationModal
        ariaHideApp={false}
        isOpen
        onRequestClose={jest.fn()}
        onAfterClose={onAfterClose}
      />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLazyModal).mockReturnValue({
    openModal: jest.fn(),
    closeModal,
    modal: null,
  } as unknown as ReturnType<typeof useLazyModal>);
});

it('says what earned the first reputation and where it leads', async () => {
  mockFirstGain(commentUpvote);
  renderModal();

  expect(
    await screen.findByRole('heading', {
      name: 'Your comment earned +50 reputation',
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByText('On “Scaling our cache layer without a rewrite”'),
  ).toBeInTheDocument();
  expect(screen.getByText('190 to 250')).toBeInTheDocument();

  const links = screen.getAllByRole('link');
  expect(links.map((link) => link.textContent)).toEqual([
    'See your reputation',
    'See all privileges',
    'See your comment',
  ]);
  expect(
    screen.getByRole('link', { name: 'See all privileges' }),
  ).toHaveAttribute('href', reputationPrivileges);
  expect(
    screen.getByRole('link', { name: 'See your comment' }),
  ).toHaveAttribute('href', commentUpvote.target?.permalink);
});

it('closes without showing anything when the gain is gone', async () => {
  mockFirstGain(null);
  renderModal();

  await waitFor(() => expect(closeModal).toHaveBeenCalled());
  expect(onAfterClose).toHaveBeenCalled();
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
});

it('keeps the alert when the request fails', async () => {
  mockGraphQL({
    request: { query: FIRST_REPUTATION_GAIN_QUERY },
    result: { errors: [{ message: 'Unexpected error' }] },
  });
  renderModal(
    new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );

  await waitFor(() => expect(closeModal).toHaveBeenCalled());
  expect(onAfterClose).not.toHaveBeenCalled();
});
