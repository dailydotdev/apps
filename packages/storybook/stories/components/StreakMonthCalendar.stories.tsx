import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import { StreakMonthCalendar } from '@dailydotdev/shared/src/components/streak/popup/StreakMonthCalendar';
import { generateQueryKey, RequestKey } from '@dailydotdev/shared/src/lib/query';
import { DayOfWeek } from '@dailydotdev/shared/src/lib/date';
import type {
  ReadingDay,
  UserStreak,
} from '@dailydotdev/shared/src/graphql/users';

// Minimal auth + streak so the calendar can resolve a timezone and week start.
const mockUser = { id: 'storybook-user', timezone: 'America/New_York' };
const streak: UserStreak = {
  current: 12,
  max: 30,
  total: 120,
  weekStart: DayOfWeek.Monday,
  lastViewAt: new Date(),
};

// A realistic spread of recently-read days. Weekends left unread show the
// frozen dashed pattern; future days render as upcoming. `todayRead` toggles
// whether today carries a read flame (so we can see the today ring both over a
// filled cell and on an empty one).
const READ_OFFSETS = [0, 1, 2, 3, 5, 6, 8, 9, 10, 13, 14];
const buildHistory = (todayRead: boolean): ReadingDay[] => {
  const today = new Date();
  return READ_OFFSETS.filter((offset) => todayRead || offset !== 0).map(
    (offset) => ({ date: subDays(today, offset).toISOString(), reads: 1 }),
  );
};

// Seeds the 30-day reading-history query once (useState initializer) so the
// calendar reads it straight from the cache without a network call.
const CalendarDemo = ({ todayRead }: { todayRead: boolean }): ReactElement => {
  const [client] = useState(() => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      generateQueryKey(RequestKey.ReadingStreak30Days, mockUser),
      buildHistory(todayRead),
    );
    return queryClient;
  });

  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={{ user: mockUser } as unknown as AuthContextData}>
        <div className="dark w-72 rounded-16 bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))] p-4">
          <StreakMonthCalendar streak={streak} />
        </div>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof StreakMonthCalendar> = {
  title: 'Components/Streak/MonthCalendar',
  component: StreakMonthCalendar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StreakMonthCalendar>;

// Today read: the white "today" ring sits ON TOP of the read-day pink flame so
// you can still tell which day is today.
export const Default: Story = {
  render: () => <CalendarDemo todayRead />,
};

// Today not yet read: the ring sits on an empty cell.
export const TodayNotRead: Story = {
  render: () => <CalendarDemo todayRead={false} />,
};
