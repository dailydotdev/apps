import type { UserStreak } from '../graphql/users';
import { DayOfWeek } from './date';
import {
  getNextStreakGoal,
  getStreakBreakKey,
  getStreakGoalProgress,
  hasSeenStreakGoalBreakPrompt,
  markStreakGoalBreakPromptSeen,
} from './streakGoal';

const brokenStreak: UserStreak = {
  current: 0,
  max: 12,
  total: 40,
  weekStart: DayOfWeek.Monday,
  lastViewAt: new Date('2026-11-10T09:00:00.000Z'),
  freezesAvailable: 0,
  lastReset: null,
};

describe('getStreakBreakKey', () => {
  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it('offers the break prompt once when the API did not record the reset', () => {
    jest.useFakeTimers({ now: new Date('2026-11-16T10:00:00.000Z') });
    const firstDay = getStreakBreakKey(brokenStreak);
    markStreakGoalBreakPromptSeen('u1', firstDay!);

    jest.setSystemTime(new Date('2026-11-17T10:00:00.000Z'));
    const nextDay = getStreakBreakKey(brokenStreak);

    expect(nextDay).toEqual(firstDay);
    expect(hasSeenStreakGoalBreakPrompt('u1', nextDay!)).toBe(true);
  });

  it('keys on the recorded reset when there is one', () => {
    expect(
      getStreakBreakKey({
        ...brokenStreak,
        lastReset: {
          missedDate: '2026-11-11',
          timezone: 'UTC',
          at: '2026-11-12T00:05:00.000Z',
        },
      }),
    ).toEqual('2026-11-12T00:05:00.000Z');
  });

  it('has no key without a reset or a read', () => {
    expect(
      getStreakBreakKey({
        lastReset: null,
        lastViewAt: undefined as unknown as Date,
      }),
    ).toBe(null);
  });
});

describe('goals outside the picker options', () => {
  it('shows progress towards a goal another build set', () => {
    expect(getStreakGoalProgress(7, 21)).toEqual({
      current: 7,
      goal: 21,
      ratio: 1 / 3,
    });
  });

  it('offers the next larger option as the next goal', () => {
    expect(getNextStreakGoal(21)).toBe(30);
    expect(getNextStreakGoal(14)).toBe(30);
    expect(getNextStreakGoal(60)).toBeNull();
  });
});
