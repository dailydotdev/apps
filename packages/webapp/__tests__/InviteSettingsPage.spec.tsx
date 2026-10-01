import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { ReferralLadder } from '@dailydotdev/shared/src/graphql/users';
import {
  REFERRAL_LADDER_QUERY,
  referralLadderQueryOptions,
} from '@dailydotdev/shared/src/graphql/users';
import InvitePage from '../pages/settings/invite';

jest.mock('next/router', () => ({
  useRouter: () => ({ isFallback: false, push: jest.fn() }),
}));

let client: QueryClient;

const renderPage = (isReferralLadderEligible: boolean) => {
  client = new QueryClient();

  return render(
    <TestBootProvider
      client={client}
      auth={{ user: { ...loggedUser, isReferralLadderEligible } }}
    >
      <InvitePage />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  nock.cleanAll();
});

it('should render the current invite page for ineligible users', async () => {
  renderPage(false);

  expect(await screen.findByText('Grow the community')).toBeInTheDocument();
  expect(screen.queryByText(/of Plus/)).not.toBeInTheDocument();
  expect(
    client.getQueryState(referralLadderQueryOptions(loggedUser).queryKey),
  ).toMatchObject({
    fetchStatus: 'idle',
    dataUpdateCount: 0,
    errorUpdateCount: 0,
  });
});

it('should render the ladder with rewards unlocked by the API', async () => {
  const ladder: ReferralLadder = {
    eligible: true,
    referredCount: 2,
    steps: [
      { step: 1, invites: 1, months: 1, unlockedAt: '2026-09-20T00:00:00Z' },
      // Counted but not rewarded yet, so the row stays locked.
      { step: 2, invites: 2, months: 3, unlockedAt: null },
      { step: 3, invites: 3, months: 12, unlockedAt: null },
    ],
    friends: [],
  };
  mockGraphQL({
    request: { query: REFERRAL_LADDER_QUERY },
    result: { data: { referralLadder: ladder } },
  });
  renderPage(true);

  expect(
    await screen.findByText('Invite 1 more friend to get 1 year of Plus'),
  ).toBeInTheDocument();
  expect(screen.queryByText('Grow the community')).not.toBeInTheDocument();

  const getRow = (reward: string): HTMLElement => {
    const row = screen.getByText(reward).closest('li');

    if (!row) {
      throw new Error(`No reward row for ${reward}`);
    }

    return row;
  };
  expect(
    within(getRow('1 month of Plus')).getByLabelText('Unlocked'),
  ).toBeInTheDocument();
  expect(
    within(getRow('3 months of Plus')).getByLabelText('Locked'),
  ).toBeInTheDocument();
  expect(
    within(getRow('1 year of Plus')).getByLabelText('Locked'),
  ).toBeInTheDocument();
});
