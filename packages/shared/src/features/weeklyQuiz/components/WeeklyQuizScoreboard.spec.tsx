import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { WeeklyQuizScoreboard } from './WeeklyQuizScoreboard';
import { useWeeklyQuizLeaderboard } from '../hooks/useWeeklyQuizLeaderboard';
import { useAuthContext } from '../../../contexts/AuthContext';
import { WeeklyQuizPeriod } from '../types';

jest.mock('../hooks/useWeeklyQuizLeaderboard');
jest.mock('../../../contexts/AuthContext');

const mockLeaderboard = jest.mocked(useWeeklyQuizLeaderboard);
const mockAuth = jest.mocked(useAuthContext);
const showLogin = jest.fn();

const renderScoreboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <WeeklyQuizScoreboard
        period={WeeklyQuizPeriod.Weekly}
        onPeriodChange={jest.fn()}
      />
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLeaderboard.mockReturnValue({
    leaderboard: [
      {
        id: 'a',
        rank: 1,
        name: 'Ada',
        username: 'ada',
        image: 'https://example.com/a.png',
        correctCount: 5,
        totalQuestions: 5,
        timeMs: 42000,
      },
      {
        id: 'b',
        rank: 2,
        name: 'Bob',
        username: 'bob',
        image: 'https://example.com/b.png',
        correctCount: 4,
        totalQuestions: 5,
        timeMs: 30000,
      },
    ],
    viewerEntry: null,
    isPending: false,
  });
});

it('locks the scoreboard behind login for anonymous visitors', () => {
  mockAuth.mockReturnValue({ user: null, showLogin } as never);

  renderScoreboard();

  expect(screen.getByText('Log in to see the scoreboard')).toBeInTheDocument();
  // Real standings must not be exposed to anonymous visitors.
  expect(screen.queryByText('Ada')).not.toBeInTheDocument();
});

it('renders ranked rows with scores for logged-in players', () => {
  mockAuth.mockReturnValue({
    user: { id: 'a', name: 'Ada' },
    showLogin,
  } as never);

  renderScoreboard();

  expect(screen.getByText('Ada')).toBeInTheDocument();
  expect(screen.getByText('Bob')).toBeInTheDocument();
  expect(
    screen.queryByText('Log in to see the scoreboard'),
  ).not.toBeInTheDocument();
});

it('pins the viewer row when they rank outside the visible list', () => {
  mockAuth.mockReturnValue({
    user: { id: 'me', name: 'Me' },
    showLogin,
  } as never);
  mockLeaderboard.mockReturnValue({
    leaderboard: [
      {
        id: 'a',
        rank: 1,
        name: 'Ada',
        username: 'ada',
        image: 'https://example.com/a.png',
        correctCount: 5,
        totalQuestions: 5,
        timeMs: 42000,
      },
    ],
    viewerEntry: {
      id: 'me',
      rank: 42,
      name: 'Me',
      username: 'me',
      image: 'https://example.com/me.png',
      correctCount: 3,
      totalQuestions: 5,
      timeMs: 60000,
      isCurrentUser: true,
    },
    isPending: false,
  });

  renderScoreboard();

  // The pinned row shows the viewer's own out-of-list rank.
  expect(screen.getByText('42')).toBeInTheDocument();
  expect(screen.getByText('Me')).toBeInTheDocument();
});
