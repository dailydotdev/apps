import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { addDays } from 'date-fns';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { UserStreak, UserStreakPause } from '../../graphql/users';
import {
  CANCEL_STREAK_PAUSE_MUTATION,
  MIN_STREAK_FOR_PAUSE,
  SCHEDULE_STREAK_PAUSE_MUTATION,
} from '../../graphql/streakPause';
import { DayOfWeek } from '../../lib/date';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { LogEvent } from '../../lib/log';
import {
  formatStreakPauseDate,
  toStreakLocalDate,
} from '../../hooks/streaks/useStreakPause';
import {
  streakPauseHelperCopy,
  StreakPauseSettings,
} from './StreakPauseSettings';

const mockDisplayToast = jest.fn();

jest.mock('../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../hooks/useToastNotification'),
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

const user = { ...loggedUser, timezone: 'Etc/UTC' };
const localDate = (days: number) =>
  toStreakLocalDate(addDays(new Date(), days), user.timezone);

const renderSettings = ({
  current = 10,
  pause = null,
  isFlagOn = true,
  logEvent = jest.fn(),
}: {
  current?: number;
  pause?: UserStreakPause | null;
  isFlagOn?: boolean;
  logEvent?: jest.Mock;
} = {}) => {
  const client = new QueryClient();
  const streak: UserStreak = {
    max: current,
    total: current,
    current,
    weekStart: DayOfWeek.Monday,
    lastViewAt: new Date(),
    freezesAvailable: 0,
    pause,
  };
  client.setQueryData(generateQueryKey(RequestKey.UserStreak, user), streak);

  render(
    <TestBootProvider
      client={client}
      auth={{ user }}
      log={{ logEvent }}
      settings={{ optOutReadingStreak: false }}
      gb={
        new GrowthBook({
          features: { streak_pause: { defaultValue: isFlagOn } },
        })
      }
    >
      <StreakPauseSettings />
    </TestBootProvider>,
  );

  return { client, logEvent };
};

const fillDates = (start: string, end: string) => {
  fireEvent.change(screen.getByLabelText('From'), {
    target: { value: start },
  });
  fireEvent.change(screen.getByLabelText('Until'), { target: { value: end } });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('StreakPauseSettings', () => {
  it('renders nothing while the flag is off', () => {
    renderSettings({ isFlagOn: false });

    expect(screen.queryByText('Pause my streak')).not.toBeInTheDocument();
  });

  it('explains the limits and disables pausing below the minimum streak', () => {
    renderSettings({ current: MIN_STREAK_FOR_PAUSE - 1 });

    expect(screen.getByText(streakPauseHelperCopy)).toBeInTheDocument();
    expect(
      screen.getByText(
        `You can pause once your streak reaches ${MIN_STREAK_FOR_PAUSE} days.`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause streak' })).toBeDisabled();
  });

  it('schedules a pause with the picked dates', async () => {
    const start = localDate(2);
    const end = localDate(5);
    let mutationCalled = false;
    mockGraphQL({
      request: {
        query: SCHEDULE_STREAK_PAUSE_MUTATION,
        variables: { start, end },
      },
      result: () => {
        mutationCalled = true;
        return { data: { scheduleStreakPause: { start, end } } };
      },
    });
    const { logEvent } = renderSettings();

    fillDates(start, end);
    fireEvent.click(screen.getByRole('button', { name: 'Pause streak' }));

    await waitForNock();
    await waitFor(() => expect(mutationCalled).toBe(true));
    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.ScheduleStreakPause,
        extra: JSON.stringify({ days: 4 }),
      }),
    );
    expect(mockDisplayToast).toHaveBeenCalledWith(
      expect.stringContaining('Your streak is paused from'),
    );
  });

  it('shows a friendly message when the yearly limit is reached', async () => {
    const start = localDate(1);
    const end = localDate(1);
    mockGraphQL({
      request: {
        query: SCHEDULE_STREAK_PAUSE_MUTATION,
        variables: { start, end },
      },
      result: {
        errors: [
          {
            message: 'You can schedule at most 2 streak pauses a year',
            extensions: { code: 'CONFLICT' },
          },
        ],
      },
    });
    renderSettings();

    fillDates(start, end);
    fireEvent.click(screen.getByRole('button', { name: 'Pause streak' }));

    await waitFor(() =>
      expect(mockDisplayToast).toHaveBeenCalledWith(
        "You've already paused your streak twice this year.",
      ),
    );
  });

  it('shows a scheduled pause and cancels it', async () => {
    let mutationCalled = false;
    mockGraphQL({
      request: { query: CANCEL_STREAK_PAUSE_MUTATION },
      result: () => {
        mutationCalled = true;
        return { data: { cancelStreakPause: true } };
      },
    });
    const start = localDate(3);
    const end = localDate(6);
    const { logEvent } = renderSettings({ pause: { start, end } });

    expect(
      screen.getByText(
        `Paused from ${formatStreakPauseDate(start)} to ${formatStreakPauseDate(
          end,
        )}`,
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel pause' }));

    await waitFor(() => expect(mutationCalled).toBe(true));
    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.CancelStreakPause,
      }),
    );
    expect(mockDisplayToast).toHaveBeenCalledWith(
      'Your streak pause was canceled.',
    );
  });
});
