import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { UserTopList } from './UserTopList';

jest.mock('../../widgets/PostUsersHighlights', () => ({
  UserHighlight: ({ username }: { username: string }) => (
    <span>{username}</span>
  ),
}));

const makeItem = (level?: {
  level: number;
  totalXp: number;
  xpInLevel: number;
  xpToNextLevel: number;
}) => ({
  score: 1,
  user: {
    ...loggedUser,
    id: 'user-1',
    username: 'user-1',
    permalink: '/users/user-1',
  },
  level,
});

describe('UserTopList', () => {
  it('should render level progress circle when showLevel is enabled and level data exists', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <UserTopList
          containerProps={{ title: 'Leaderboard' }}
          items={[
            makeItem({
              level: 42,
              totalXp: 9999,
              xpInLevel: 50,
              xpToNextLevel: 50,
            }),
          ]}
          isLoading={false}
          showLevel
        />
      </TestBootProvider>,
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should not render level progress circle when showLevel is disabled', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <UserTopList
          containerProps={{ title: 'Leaderboard' }}
          items={[
            makeItem({
              level: 42,
              totalXp: 9999,
              xpInLevel: 50,
              xpToNextLevel: 50,
            }),
          ]}
          isLoading={false}
        />
      </TestBootProvider>,
    );

    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });
});
