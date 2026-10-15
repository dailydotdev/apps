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
import { CompactQuestRow } from '@dailydotdev/shared/src/components/quest/CompactQuestList';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '@dailydotdev/shared/src/graphql/quests';
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

const makeQuest = (
  id: string,
  name: string,
  description: string,
  progress: number,
  targetCount: number,
  status: QuestStatus,
): UserQuest =>
  ({
    userQuestId: id,
    rotationId: 'rotation-today',
    progress,
    status,
    completedAt: null,
    claimedAt: null,
    locked: false,
    claimable: status === QuestStatus.Completed,
    rewards: [{ type: QuestRewardType.Xp, amount: 50 }],
    quest: {
      id,
      name,
      description,
      type: QuestType.Daily,
      eventType: 'read_post',
      targetCount,
    },
  } as UserQuest);

const quests: UserQuest[] = [
  makeQuest(
    'q-read',
    'Read 3 posts',
    'Any post in your feed counts',
    2,
    3,
    QuestStatus.InProgress,
  ),
  makeQuest(
    'q-upvote',
    'Upvote a post',
    'Tell the feed what you like',
    1,
    1,
    QuestStatus.Completed,
  ),
  makeQuest(
    'q-comment',
    'Join a discussion',
    'Comment on any post',
    0,
    1,
    QuestStatus.InProgress,
  ),
  makeQuest(
    'q-squad',
    'Post in a squad',
    'Share a link or start a thread',
    0,
    1,
    QuestStatus.InProgress,
  ),
  makeQuest(
    'q-bookmark',
    'Save 2 posts for later',
    'Build your reading list',
    1,
    2,
    QuestStatus.InProgress,
  ),
];

/** The v2 streak panel's own quest rows. */
const Quests = ({ limit }: { limit?: number }): ReactElement => (
  <div className="flex flex-col gap-1">
    <span className="px-2 text-text-quaternary typo-footnote">
      Daily quests
    </span>
    {quests.slice(0, limit).map((quest) => (
      <CompactQuestRow
        key={quest.userQuestId}
        quest={quest}
        isClaiming={false}
        onClaim={() => undefined}
      />
    ))}
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
            label="Streak freezes"
            value={1}
            max={2}
            hint="One left for a day off"
          />
        </div>
      </div>
    )}
    {size === 'l' && (
      <div className="flex h-full min-h-0 gap-8">
        <div className="flex shrink-0 flex-col gap-4">
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
              label="Streak freezes"
              value={1}
              max={2}
              hint="One left for a day off"
            />
          </div>
        </div>
        <div className="no-scrollbar -my-4 -mr-2 min-w-0 flex-1 overflow-y-auto py-4 [mask-image:linear-gradient(to_bottom,black_calc(100%-2.5rem),transparent)]">
          <Quests />
        </div>
      </div>
    )}
  </StreakData>
);
