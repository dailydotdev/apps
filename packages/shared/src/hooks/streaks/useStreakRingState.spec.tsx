import React from 'react';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { UserStreak } from '../../graphql/users';
import type { StreakGoal } from '../../graphql/settings';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { DayOfWeek } from '../../lib/date';
import { useStreakRingState } from './useStreakRingState';

const streak: UserStreak = {
  max: 9,
  total: 30,
  current: 3,
  weekStart: DayOfWeek.Monday,
  lastViewAt: new Date(),
  freezesAvailable: 0,
};

const renderRingState = ({
  goal,
  flag = true,
  current = streak.current,
}: {
  goal: StreakGoal | null;
  flag?: boolean;
  current?: number;
}) => {
  const client = new QueryClient();
  client.setQueryData(generateQueryKey(RequestKey.UserStreak, loggedUser), {
    ...streak,
    current,
  });
  const gb = new GrowthBook({
    features: { streak_goals: { defaultValue: flag } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider
      client={client}
      auth={{ user: loggedUser }}
      gb={gb}
      settings={{
        loadedSettings: true,
        optOutReadingStreak: false,
        streakGoal: goal,
      }}
    >
      {children}
    </TestBootProvider>
  );

  return renderHook(() => useStreakRingState(), { wrapper });
};

describe('useStreakRingState goalProgress', () => {
  it('fills as current/goal while the goal is in progress', () => {
    const { result } = renderRingState({ goal: 7 });

    expect(result.current.goalProgress).toEqual({
      current: 3,
      goal: 7,
      ratio: 3 / 7,
    });
  });

  it('is null without a goal, once it is reached, or with the flag off', () => {
    expect(renderRingState({ goal: null }).result.current.goalProgress).toBe(
      null,
    );
    expect(
      renderRingState({ goal: 7, current: 7 }).result.current.goalProgress,
    ).toBe(null);
    expect(
      renderRingState({ goal: 7, flag: false }).result.current.goalProgress,
    ).toBe(null);
  });
});
