import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { LeaderboardInviteCard } from './LeaderboardInviteCard';

beforeEach(() => {
  nock.cleanAll();
});

describe('LeaderboardInviteCard', () => {
  it('should render the loading state before the ladder arrives', () => {
    render(
      <TestBootProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
        auth={{ user: { ...loggedUser, isReferralLadderEligible: true } }}
      >
        <LeaderboardInviteCard />
      </TestBootProvider>,
    );

    expect(screen.getAllByText('Copy invite link')).toHaveLength(2);
  });
});
