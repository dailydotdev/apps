import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import type {
  CompanyLeaderboard,
  UserLeaderboard,
} from '../../graphql/leaderboard';
import {
  LEADERBOARD_POSITION_QUERY,
  LeaderboardType,
} from '../../graphql/leaderboard';
import type { LoggedUser } from '../../lib/user';
import { LeaderboardBoardPage } from './LeaderboardBoardPage';

const makeUsers = (count: number): UserLeaderboard[] =>
  Array.from({ length: count }, (_, index) => ({
    score: 1000 - index,
    user: {
      id: `Dev-${index}`,
      username: `Dev-${index}`,
      name: `Dev ${index}`,
      image: '',
      permalink: `/Dev-${index}`,
      createdAt: new Date().toISOString(),
      bio: '',
      reputation: 10,
    },
  }));

const companies: CompanyLeaderboard[] = [
  { score: 30, company: { name: 'Acme', image: '' } },
  { score: 20, company: { name: 'daily.dev', image: '' } },
] as CompanyLeaderboard[];

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderPage = (
  props: Partial<React.ComponentProps<typeof LeaderboardBoardPage>>,
  user: LoggedUser | undefined = loggedUser,
) =>
  render(
    <TestBootProvider client={createClient()} auth={{ user }}>
      <LeaderboardBoardPage
        type={LeaderboardType.HighestReputation}
        title="Highest reputation"
        {...props}
      />
    </TestBootProvider>,
  );

const mockPosition = (rank: number | null, score: number) =>
  mockGraphQL({
    request: {
      query: LEADERBOARD_POSITION_QUERY,
      variables: { type: LeaderboardType.HighestReputation },
    },
    result: {
      data: { leaderboardPosition: { rank, score, cappedAt: 100000 } },
    },
  });

beforeEach(() => {
  nock.cleanAll();
});

describe('LeaderboardBoardPage', () => {
  it('should list every row as a profile link', () => {
    renderPage({ userItems: makeUsers(3) }, undefined);

    expect(
      screen.getByRole('heading', { name: 'Highest reputation' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Dev 2').closest('a')).toHaveAttribute(
      'href',
      '/Dev-2',
    );
    expect(screen.queryByText('You')).not.toBeInTheDocument();
  });

  it('should pin your row under the list when you are further down', async () => {
    mockPosition(842, 3120);
    renderPage({ userItems: makeUsers(3) });

    const you = await screen.findByText('You');
    expect(you.closest('a')).toHaveAttribute('href', loggedUser.permalink);
    expect(screen.getByText('842')).toBeInTheDocument();
  });

  it('should light your row in place instead of pinning it when listed', async () => {
    mockPosition(2, 999);
    const items = makeUsers(3);
    items[1] = { ...items[1], user: { ...items[1].user, id: loggedUser.id } };
    renderPage({ userItems: items });

    const row = screen.getByText('Dev 1');
    expect(row).toHaveClass('text-accent-cabbage-default');
    expect(screen.queryByText('You')).not.toBeInTheDocument();
  });

  it('should light your verified company on Most verified employees', () => {
    renderPage(
      {
        type: LeaderboardType.MostVerifiedUsers,
        title: 'Most verified employees',
        companyItems: companies,
        userItems: undefined,
      },
      {
        ...loggedUser,
        companies: [{ name: 'daily.dev' }],
      } as LoggedUser,
    );

    expect(screen.getByText('daily.dev')).toHaveClass(
      'text-accent-cabbage-default',
    );
    expect(screen.getByText('Acme')).not.toHaveClass(
      'text-accent-cabbage-default',
    );
  });

  it('should say so when the board is empty', () => {
    renderPage({ userItems: [] }, undefined);

    expect(
      screen.getByText('Nothing here right now. Check back soon.'),
    ).toBeInTheDocument();
  });
});
