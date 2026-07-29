import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { Decorator } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { PromptElement } from '@dailydotdev/shared/src/components/modals/Prompt';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { sampleWeeklyQuiz } from '@dailydotdev/shared/src/features/weeklyQuiz/sampleWeeklyQuiz';
import { demoLeaderboard } from '@dailydotdev/shared/src/features/weeklyQuiz/demoMode';
import type { WeeklyQuizStatus } from '@dailydotdev/shared/src/features/weeklyQuiz/types';
import { WeeklyQuizPeriod } from '@dailydotdev/shared/src/features/weeklyQuiz/types';

// A single signed-in user so every weekly-quiz query key resolves to the same
// id. Matches the giveback story harness.
export const MOCK_USER = {
  id: 'sb-user',
  name: 'Dev Dana',
  username: 'devdana',
  image:
    'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  permalink: 'https://app.daily.dev/devdana',
  bio: null,
  createdAt: '2021-01-01T00:00:00.000Z',
  reputation: 42,
  providers: ['github'],
} as const;

const noop = (): void => undefined;

type LeaderboardNode = {
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    reputation: number;
  };
  correctCount: number;
  totalQuestions: number;
  timeMs: number;
  rank: number;
  isAllTimeSuperstar?: boolean;
};

export const mockStatus = (
  overrides: Partial<WeeklyQuizStatus> = {},
): WeeklyQuizStatus => ({
  isActive: true,
  activeQuizId: sampleWeeklyQuiz.id,
  hasCompletedThisWeek: false,
  hasCompletedLastWeek: false,
  thisWeekResult: null,
  lastWeekResult: null,
  ...overrides,
});

// Real daily.dev members (shared with the deployed preview's demoLeaderboard)
// so the Storybook board matches production faces during testing. Ranked
// correct-first with time as the tiebreak; `seed` rotates the order per period
// so the tabs visibly switch the whole board. The signed-in mock user is NOT in
// this list — their standing comes through weeklyQuizViewerEntry so the pinned
// "your rank" row is exercised. Superstar chip on rank 1.
const mockLeaderboard = (seed: number, withSuperstar: boolean): LeaderboardNode[] => {
  const rotated = [
    ...demoLeaderboard.slice(seed),
    ...demoLeaderboard.slice(0, seed),
  ];
  return rotated.map((entry, index): LeaderboardNode => {
    const rank = index + 1;
    return {
      user: {
        id: entry.id,
        name: entry.name,
        username: entry.username ?? entry.id,
        image: entry.image,
        reputation: entry.reputation ?? 0,
      },
      correctCount: Math.max(1, 10 - Math.floor(index / 2)),
      totalQuestions: 10,
      timeMs: 34000 + index * 2500 - seed * 400,
      rank,
      isAllTimeSuperstar: withSuperstar && rank === 1,
    };
  });
};

export interface WeeklyQuizMockOptions {
  loggedIn?: boolean;
  status?: WeeklyQuizStatus;
}

const WeeklyQuizProviders = ({
  children,
  loggedIn = true,
  status = mockStatus(),
}: WeeklyQuizMockOptions & { children: ReactNode }): ReactElement => {
  const user = loggedIn ? MOCK_USER : undefined;

  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          staleTime: Infinity,
          gcTime: Infinity,
        },
      },
    });

    client.setQueryData(generateQueryKey(RequestKey.WeeklyQuizStatus, user), {
      weeklyQuizStatus: status,
    });

    client.setQueryData(
      generateQueryKey(RequestKey.WeeklyQuiz, user, sampleWeeklyQuiz.id),
      { weeklyQuiz: sampleWeeklyQuiz },
    );

    // Distinct data per period so the tabs visibly change the whole board.
    [
      { period: WeeklyQuizPeriod.Weekly, seed: 0, superstar: true, rank: 42 },
      { period: WeeklyQuizPeriod.Monthly, seed: 7, superstar: true, rank: 18 },
      { period: WeeklyQuizPeriod.AllTime, seed: 13, superstar: true, rank: 63 },
    ].forEach(({ period, seed, superstar, rank }) => {
      client.setQueryData(
        generateQueryKey(RequestKey.WeeklyQuizLeaderboard, user, period),
        {
          weeklyQuizLeaderboard: {
            edges: mockLeaderboard(seed, superstar).map((node) => ({ node })),
          },
          weeklyQuizViewerEntry: loggedIn
            ? { correctCount: 6, totalQuestions: 10, timeMs: 62000, rank }
            : null,
        },
      );
    });

    return client;
  }, [loggedIn, status, user]);

  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={(loggedIn ? MOCK_USER : null) as never}
        firstLoad={false}
        isFetched
        loadingUser={false}
        tokenRefreshed
        loadedUserFromCache
        getRedirectUri={() => ''}
        updateUser={noop as never}
        refetchBoot={noop as never}
        visit={{ visitId: 'sb', sessionId: 'sb' } as never}
        accessToken={null as never}
        squads={[]}
        feeds={undefined}
        geo={{} as never}
        isAndroidApp={false}
      >
        <LogContext.Provider
          value={{
            logEvent: noop,
            logEventStart: noop,
            logEventEnd: noop,
            sendBeacon: noop,
          }}
        >
          {/* #__next satisfies react-modal's appElement (set in Modal.tsx),
              matching how the app mounts under Next.js. */}
          <div
            id="__next"
            className="min-h-screen bg-black p-8 text-text-primary"
          >
            {children}
            <PromptElement />
          </div>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

export const withWeeklyQuiz =
  (options: WeeklyQuizMockOptions = {}): Decorator =>
  (Story) =>
    (
      <WeeklyQuizProviders {...options}>
        <Story />
      </WeeklyQuizProviders>
    );
