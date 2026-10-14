import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { format, subDays } from 'date-fns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import { StreakMonthCalendar } from '@dailydotdev/shared/src/components/streak/popup/StreakMonthCalendar';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { DayOfWeek } from '@dailydotdev/shared/src/lib/date';
import type {
  ReadingDay,
  UserStreak,
} from '@dailydotdev/shared/src/graphql/users';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import type { WidgetSize } from './catalog';

const mockUser = { id: 'hero-streak-user', timezone: 'Asia/Jerusalem' };

const streak: UserStreak = {
  current: 849,
  max: 912,
  total: 1204,
  weekStart: DayOfWeek.Sunday,
  lastViewAt: new Date(),
  freezesAvailable: 1,
};

const READ_OFFSETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

const history: ReadingDay[] = READ_OFFSETS.map((offset) => ({
  date: subDays(new Date(), offset).toISOString(),
  reads: 1,
}));

/**
 * The calendar reads the reading history from the query cache and the timezone
 * from auth, so the widget seeds both instead of hitting the API.
 */
const StreakData = ({ children }: { children: ReactNode }): ReactElement => {
  const [client] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    queryClient.setQueryData(
      generateQueryKey(RequestKey.ReadingStreak30Days, mockUser),
      history,
    );
    return queryClient;
  });

  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{ user: mockUser } as unknown as AuthContextData}
      >
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

const StreakCount = ({ isLarge }: { isLarge?: boolean }): ReactElement => (
  <div className="flex flex-col gap-1">
    <span className="flex items-center gap-1.5">
      <ReadingStreakIcon
        secondary
        size={isLarge ? IconSize.Large : IconSize.Medium}
        className="text-accent-bacon-default"
      />
      <span
        className={classNames(
          'font-bold tabular-nums leading-none text-text-primary',
          isLarge ? 'typo-large-title' : 'typo-title1',
        )}
      >
        {streak.current}
      </span>
    </span>
    <span className="tabular-nums text-text-tertiary typo-caption1">
      {streak.max} Longest · {streak.total.toLocaleString()} Total
    </span>
  </div>
);

const TodayLine = (): ReactElement => (
  <div className="flex items-center justify-between gap-2 typo-caption1">
    <span className="font-bold text-text-primary">
      Today, {format(new Date(), 'MMM d')}
    </span>
    <span className="text-text-tertiary">{mockUser.timezone}</span>
  </div>
);

/**
 * The usage-meter grammar from Claude's usage screen: what you used, of what,
 * and when it resets, on one thin bar.
 */
const UsageMeter = ({
  label,
  value,
  max,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  hint: string;
}): ReactElement => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between gap-2">
      <span className="font-bold text-text-primary typo-footnote">{label}</span>
      <span className="tabular-nums text-text-secondary typo-caption1">
        {value} of {max}
      </span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-max bg-surface-float">
      <div
        className={classNames(
          'h-full rounded-max',
          value >= max
            ? 'bg-accent-avocado-default'
            : 'bg-accent-bacon-default',
        )}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
    <span className="text-text-quaternary typo-caption1">{hint}</span>
  </div>
);

const Meters = (): ReactElement => (
  <div className="flex flex-col gap-4">
    <UsageMeter
      label="Today’s goal"
      value={2}
      max={3}
      hint="1 post to keep the streak · resets in 9 hr 12 min"
    />
    <UsageMeter
      label="This week"
      value={5}
      max={7}
      hint="Weekends freeze on their own"
    />
    <UsageMeter
      label="Streak freezes"
      value={1}
      max={2}
      hint="One left for a day off"
    />
  </div>
);

const quests = [
  { title: 'Read 3 posts', value: 2, max: 3, reward: 10 },
  { title: 'Upvote a post you liked', value: 1, max: 1, reward: 5 },
  { title: 'Join a discussion', value: 0, max: 1, reward: 15 },
];

const Quests = (): ReactElement => (
  <div className="flex flex-col gap-2">
    <span className="text-text-quaternary typo-callout">Daily quests</span>
    {quests.map((quest) => {
      const isDone = quest.value >= quest.max;
      return (
        <div key={quest.title} className="flex items-center gap-3">
          <span
            className={classNames(
              'flex size-5 shrink-0 items-center justify-center rounded-max border typo-caption2',
              isDone
                ? 'border-transparent bg-accent-avocado-default text-surface-invert'
                : 'border-text-quaternary text-text-quaternary',
            )}
          >
            {isDone ? '✓' : ''}
          </span>
          <span
            className={classNames(
              'min-w-0 flex-1 truncate typo-footnote',
              isDone ? 'text-text-tertiary line-through' : 'text-text-primary',
            )}
          >
            {quest.title}
          </span>
          <span className="tabular-nums text-text-tertiary typo-caption1">
            {quest.value}/{quest.max} · +{quest.reward} XP
          </span>
        </div>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/* The widget                                                          */
/* ------------------------------------------------------------------ */

/**
 * The whole v2 streak panel at widget scale: the count, the 30-day calendar
 * the rail already uses, and, where there is room, usage meters and quests.
 */
export const StreakWidget = ({ size }: { size: WidgetSize }): ReactElement => (
  <StreakData>
    {size === 's' && (
      <div className="flex h-full min-h-0 flex-col justify-between gap-3">
        <StreakCount />
        <StreakMonthCalendar streak={streak} />
      </div>
    )}
    {size === 'm' && (
      <div className="flex h-full min-h-0 flex-col gap-4">
        <StreakCount isLarge />
        <TodayLine />
        <StreakMonthCalendar streak={streak} />
        <div className="mt-auto flex flex-col gap-4">
          <UsageMeter
            label="Today’s goal"
            value={2}
            max={3}
            hint="Resets in 9 hr 12 min"
          />
          <UsageMeter
            label="This week"
            value={5}
            max={7}
            hint="Weekends freeze on their own"
          />
        </div>
      </div>
    )}
    {size === 'w' && (
      <div className="flex h-full min-h-0 gap-6">
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <StreakCount isLarge />
          <UsageMeter
            label="Today’s goal"
            value={2}
            max={3}
            hint="Resets in 9 hr 12 min"
          />
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          <TodayLine />
          <StreakMonthCalendar streak={streak} />
        </div>
      </div>
    )}
    {size === 'l' && (
      <div className="flex h-full min-h-0 gap-8">
        <div className="flex shrink-0 flex-col gap-4">
          <StreakCount isLarge />
          <TodayLine />
          <StreakMonthCalendar streak={streak} />
          <div className="mt-auto">
            <Quests />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <Meters />
        </div>
      </div>
    )}
  </StreakData>
);
