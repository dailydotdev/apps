import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Scroll } from './scroll';
import { streakLadder, tierArt } from '../../milestone-rewards/data';
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
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import type { WidgetSize } from './catalog';

const mockUser = { id: 'hero-streak-user', timezone: 'Asia/Jerusalem' };

/*
 * Every state production's reading streak has (hooks/streaks/
 * useStreakRingState.ts, StreakRecoverModal, NewStreakModal, the v2 panel
 * in sidebar/sections/StreakQuestsSection.tsx), as scenes the widget can
 * show. Copy is production's own where it exists.
 */
export type StreakScene =
  | 'none'
  | 'dayOne'
  | 'pending'
  | 'atRisk'
  | 'critical'
  | 'safe'
  | 'extended'
  | 'restDay'
  | 'usedFreeze'
  | 'noFreezes'
  | 'brokenFree'
  | 'brokenCores'
  | 'brokenNoCores'
  | 'brokenExpired'
  | 'newRecord'
  | 'milestone'
  | 'timezone'
  | 'optedOut'
  | 'loading';

type Tone = 'bacon' | 'cheese' | 'ketchup' | 'water' | 'avocado' | 'onion';

type Status = {
  tone: Tone;
  title: string;
  detail?: string;
  action?: string;
};

type SceneData = {
  current: number;
  max: number;
  /** Days back that were read; 0 is today. */
  readOffsets: number[];
  freezes: number;
  status?: Status;
};

const run = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const scenes: Record<
  Exclude<StreakScene, 'optedOut' | 'loading'>,
  SceneData
> = {
  none: {
    current: 0,
    max: 0,
    readOffsets: [],
    freezes: 0,
    status: {
      tone: 'bacon',
      title: 'Read a post to start your reading streak.',
      action: 'Find something to read',
    },
  },
  dayOne: {
    current: 1,
    max: 1,
    readOffsets: [0],
    freezes: 0,
    status: {
      tone: 'bacon',
      title: 'Day one. Come back tomorrow to make it two.',
    },
  },
  pending: {
    current: 849,
    max: 912,
    readOffsets: run(1, 15),
    freezes: 1,
    status: {
      tone: 'bacon',
      title: 'You haven’t read today. Keep your 849-day streak going.',
      detail: '9 hr 12 min left',
    },
  },
  atRisk: {
    current: 849,
    max: 912,
    readOffsets: run(1, 15),
    freezes: 1,
    status: {
      tone: 'cheese',
      title: 'Your 849-day streak ends tonight. Read 1 post to keep it.',
      detail: '5 hr 40 min left',
      action: 'Read a post',
    },
  },
  critical: {
    current: 849,
    max: 912,
    readOffsets: run(1, 15),
    freezes: 0,
    status: {
      tone: 'ketchup',
      title: 'Last chance. Read 1 post to save your 849-day streak.',
      detail: '1 hr 12 min left',
      action: 'Read a post',
    },
  },
  safe: {
    current: 849,
    max: 912,
    readOffsets: run(0, 15),
    freezes: 1,
  },
  extended: {
    current: 850,
    max: 912,
    readOffsets: run(0, 15),
    freezes: 1,
    status: { tone: 'avocado', title: 'Streak extended. 850 days!' },
  },
  restDay: {
    current: 849,
    max: 912,
    readOffsets: run(1, 15),
    freezes: 1,
    status: {
      tone: 'water',
      title: 'Rest day. Your streak is safe.',
      detail: 'Weekends are auto-frozen; reading still counts.',
    },
  },
  usedFreeze: {
    current: 849,
    max: 912,
    readOffsets: [0, ...run(2, 15)],
    freezes: 0,
    status: {
      tone: 'water',
      title: 'A streak freeze saved yesterday.',
      detail: 'No freezes left for the next day off.',
    },
  },
  noFreezes: {
    current: 849,
    max: 912,
    readOffsets: run(0, 15),
    freezes: 0,
    status: {
      tone: 'water',
      title: 'No freezes left. Protect your streak.',
      action: 'Buy freezes',
    },
  },
  brokenFree: {
    current: 0,
    max: 912,
    readOffsets: run(2, 15),
    freezes: 0,
    status: {
      tone: 'ketchup',
      title: 'Oh no! Your 849-day streak has been broken.',
      detail: 'Lucky you! The first restore is on us.',
      action: 'Restore for free',
    },
  },
  brokenCores: {
    current: 0,
    max: 912,
    readOffsets: run(2, 15),
    freezes: 0,
    status: {
      tone: 'ketchup',
      title: 'Oh no! Your 849-day streak has been broken.',
      detail: 'Use 100 Cores to keep going.',
      action: 'Restore my streak',
    },
  },
  brokenNoCores: {
    current: 0,
    max: 912,
    readOffsets: run(2, 15),
    freezes: 0,
    status: {
      tone: 'ketchup',
      title: 'Oh no! Your 849-day streak has been broken.',
      detail: 'You don’t have enough Cores to restore it.',
      action: 'Buy Cores',
    },
  },
  brokenExpired: {
    current: 0,
    max: 912,
    readOffsets: run(4, 15),
    freezes: 0,
    status: {
      tone: 'bacon',
      title: 'Your 849-day streak ended. Start a new one today.',
      detail: '912 days is still your record.',
      action: 'Read a post',
    },
  },
  newRecord: {
    current: 913,
    max: 913,
    readOffsets: run(0, 15),
    freezes: 1,
    status: {
      tone: 'avocado',
      title: 'New streak record! 913 days.',
      detail: 'Epic win! You are in a league of your own.',
    },
  },
  milestone: {
    current: 100,
    max: 912,
    readOffsets: run(0, 15),
    freezes: 1,
    status: {
      tone: 'onion',
      title: '100-day streak. New milestone reached!',
      detail: 'You are unstoppable.',
    },
  },
  timezone: {
    current: 849,
    max: 912,
    readOffsets: run(0, 15),
    freezes: 1,
    status: {
      tone: 'cheese',
      title: 'Streak timezone mismatch',
      detail:
        'Your streak counts days in Asia/Jerusalem, not your device’s timezone.',
      action: 'Go to settings',
    },
  },
};

const total = 1204;

const streakFor = (data: SceneData): UserStreak => ({
  current: data.current,
  max: data.max,
  total,
  weekStart: DayOfWeek.Sunday,
  lastViewAt: data.readOffsets.includes(0)
    ? new Date()
    : subDays(new Date(), 1),
  freezesAvailable: data.freezes,
});

const historyFor = (data: SceneData): ReadingDay[] =>
  data.readOffsets.map((offset) => ({
    date: subDays(new Date(), offset).toISOString(),
    reads: 1,
  }));

/**
 * The calendar reads the reading history from the query cache and the timezone
 * from auth, so the widget seeds both instead of hitting the API.
 */
const StreakData = ({
  history,
  children,
}: {
  history: ReadingDay[];
  children: ReactNode;
}): ReactElement => {
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

/** The tier the reader has reached: the highest rung at or below today. */
const currentTier = (days: number) =>
  [...streakLadder].reverse().find((rung) => rung.day <= days) ??
  streakLadder[0];

/**
 * The milestone pop-up's grammar at widget scale: the count, and beside it the
 * 3D flame of the tier the reader holds, on its own halo.
 */
const StreakCount = ({
  streak,
  isLarge,
}: {
  streak: UserStreak;
  isLarge?: boolean;
}): ReactElement => {
  const tier = currentTier(streak.current);
  const isZero = streak.current === 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={classNames(
            'font-bold tabular-nums leading-none text-text-primary',
            isLarge ? 'typo-mega2' : 'typo-large-title',
          )}
        >
          {streak.current}
        </span>
        <span className="mt-1 font-bold text-accent-bacon-default typo-footnote">
          {isZero ? 'day streak' : `day streak · ${tier.label}`}
        </span>
        <span className="tabular-nums text-text-tertiary typo-caption1">
          {streak.max} longest · {(streak.total ?? 0).toLocaleString()} total
        </span>
      </div>
      <div
        className={classNames(
          'relative flex shrink-0 items-center justify-center',
          isLarge ? 'size-24' : 'size-16',
        )}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-max blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgba(236,82,122,0.55) 0%, rgba(177,75,215,0.25) 45%, transparent 70%)',
          }}
        />
        <img
          src={tierArt(tier.tier)}
          alt={tier.label}
          className={classNames(
            'relative h-full w-full object-contain',
            isZero && 'opacity-40 grayscale',
          )}
          style={{ filter: 'drop-shadow(0 6px 18px rgba(236, 82, 122, 0.4))' }}
        />
      </div>
    </div>
  );
};

/** The milestone pop-up's fire panel, behind the whole widget. */
const firePanel =
  'radial-gradient(120% 100% at 80% 0%, rgba(236,82,122,0.38) 0%, rgba(236,82,122,0.22) 42%, rgba(15,18,24,0) 78%), linear-gradient(200deg, rgba(177,75,215,0.18) 0%, rgba(15,18,24,0) 60%)';

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
            : 'bg-gradient-to-r from-accent-bacon-default to-accent-cabbage-default',
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

const toneText: Record<Tone, string> = {
  bacon: 'text-accent-bacon-default',
  cheese: 'text-accent-cheese-default',
  ketchup: 'text-accent-ketchup-default',
  water: 'text-accent-water-default',
  avocado: 'text-accent-avocado-default',
  onion: 'text-accent-onion-default',
};

const toneDot: Record<Tone, string> = {
  bacon: 'bg-accent-bacon-default',
  cheese: 'bg-accent-cheese-default',
  ketchup: 'bg-accent-ketchup-default',
  water: 'bg-accent-water-default',
  avocado: 'bg-accent-avocado-default',
  onion: 'bg-accent-onion-default',
};

/**
 * What the streak needs from the reader right now, in production's words,
 * with its one action where there is one. Urgent tones pulse their dot.
 */
const StatusLine = ({
  status,
  isCompact,
}: {
  status: Status;
  isCompact?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <div className="flex items-start gap-2">
      <span
        className={classNames(
          'mt-1.5 size-2 shrink-0 rounded-max',
          toneDot[status.tone],
          status.tone === 'ketchup' && 'animate-pulse',
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={classNames(
            'font-bold text-text-primary typo-footnote',
            isCompact && 'line-clamp-2',
          )}
        >
          {status.title}
        </span>
        {status.detail && !isCompact && (
          <span
            className={classNames(
              'typo-caption1',
              status.tone === 'cheese' || status.tone === 'ketchup'
                ? toneText[status.tone]
                : 'text-text-tertiary',
            )}
          >
            {status.detail}
          </span>
        )}
      </span>
    </div>
    {status.action && !isCompact && (
      <Button
        variant={
          status.tone === 'ketchup' || status.tone === 'cheese'
            ? ButtonVariant.Primary
            : ButtonVariant.Float
        }
        size={ButtonSize.Small}
        className="self-start"
      >
        {status.action}
      </Button>
    )}
  </div>
);

/** With a status, the status says what today needs, so only freezes stay. */
const Meters = ({ data }: { data: SceneData }): ReactElement => {
  const isReadToday = data.readOffsets.includes(0);
  return (
    <div className="flex flex-col gap-4">
      {!data.status && (
        <UsageMeter
          label="Today’s goal"
          value={isReadToday ? 2 : 0}
          max={3}
          hint="Resets in 9 hr 12 min"
        />
      )}
      <UsageMeter
        label="Streak freezes"
        value={data.freezes}
        max={2}
        hint={
          data.freezes
            ? 'One left for a day off'
            : 'None left. Buy one with Cores.'
        }
      />
    </div>
  );
};

const LoadingBlock = ({ className }: { className: string }): ReactElement => (
  <span
    className={classNames(
      'animate-pulse rounded-8 bg-surface-float',
      className,
    )}
  />
);

/** Streaks turned off in settings: the panel is quests only, as production. */
const QuestsOnly = ({ size }: { size: WidgetSize }): ReactElement => (
  <Scroll isUnderHeader={false} className="-mx-2 min-h-0">
    <Quests limit={size === 's' ? 2 : undefined} />
  </Scroll>
);

/**
 * The whole v2 streak panel at widget scale: the count, what the streak
 * needs today, the 30-day calendar the rail already uses, and where there
 * is room, usage meters and quests.
 */
export const StreakWidget = ({
  size,
  scene = 'safe',
}: {
  size: WidgetSize;
  scene?: StreakScene;
}): ReactElement => {
  if (scene === 'loading') {
    return (
      <div className="flex h-full flex-col gap-3">
        <LoadingBlock className="h-10 w-24" />
        <LoadingBlock className="h-4 w-40" />
        <LoadingBlock className="mt-auto h-16 w-full" />
        {size !== 's' && <LoadingBlock className="h-24 w-full" />}
      </div>
    );
  }
  if (scene === 'optedOut') {
    return <QuestsOnly size={size} />;
  }
  const data = scenes[scene];
  const streak = streakFor(data);
  const history = historyFor(data);
  const status = data.status;
  const today = status ? (
    <StatusLine status={status} isCompact={size === 's'} />
  ) : (
    <TodayLine />
  );
  return (
    <StreakData key={scene} history={history}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: firePanel }}
      />
      {size === 's' && (
        <div className="relative flex h-full min-h-0 flex-col justify-between gap-3">
          <StreakCount streak={streak} />
          {status ? today : <StreakMonthCalendar streak={streak} />}
        </div>
      )}
      {size === 'm' && (
        <div className="relative flex h-full min-h-0 flex-col gap-4">
          <StreakCount streak={streak} isLarge />
          {today}
          <StreakMonthCalendar streak={streak} />
          <div className="mt-auto">
            <Meters data={data} />
          </div>
        </div>
      )}
      {size === 'l' && (
        <div className="relative flex h-full min-h-0 gap-8">
          <div className="flex w-[15.25rem] shrink-0 flex-col gap-4">
            <StreakCount streak={streak} isLarge />
            {today}
            <StreakMonthCalendar streak={streak} />
            <div className="mt-auto">
              <Meters data={data} />
            </div>
          </div>
          <Scroll isUnderHeader={false} className="!-mt-4 -mr-2 min-w-0 pt-4">
            <Quests />
          </Scroll>
        </div>
      )}
    </StreakData>
  );
};
