import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import classNames from 'classnames';
import { addDays, subDays } from 'date-fns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { HotIcon } from '@dailydotdev/shared/src/components/icons';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  freezeTooltipCopy,
  Streak,
} from '@dailydotdev/shared/src/components/streak/popup/DayStreak';
import {
  getStreak,
  useReadingStreak30Days,
} from '@dailydotdev/shared/src/hooks/streaks/useStreakDays';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import {
  dateFormatInTimezone,
  isSameDayInTimezone,
} from '@dailydotdev/shared/src/lib/timezones';
import tooltipArt from './assets/gta-vi-tooltip.webp';

/*
 * The GTA VI release day on every surface that draws streak days. Production
 * has none of this yet: the calendar, week strip and widget here are copies
 * of StreakMonthCalendar, ReadingStreakPopup's strip and the feed
 * StreakWidget with the VI day added, built on production's day-state logic
 * (getStreak) and its Tooltip. A Scene pins "today" so every date-driven
 * state can be shown side by side.
 */

export const GTA_VI_RELEASE_DAY = '2026-11-19';

/** Noon on a calendar day, so a fixed "today" never slips a day by timezone. */
export const day = (isoDay: string): Date => new Date(`${isoDay}T12:00:00`);

const timezone = 'Europe/Helsinki';
const mockUser = { id: 'gta-vi-streak-user', timezone };

const isGtaViReleaseDay = (date: Date): boolean =>
  dateFormatInTimezone(date, 'yyyy-MM-dd', timezone) === GTA_VI_RELEASE_DAY;

type ReadMarker = 'none' | 'flame';

interface SceneState {
  today: Date;
  isEnabled: boolean;
  forceOpen: boolean;
  readMarker: ReadMarker;
}

const SceneContext = createContext<SceneState>({
  today: new Date(),
  isEnabled: true,
  forceOpen: false,
  readMarker: 'none',
});

const useScene = (): SceneState => useContext(SceneContext);

interface SceneProps {
  /** The day the story pretends it is. */
  today: Date;
  /** Days before today (0 is today) the reader read. */
  reads?: number[];
  /** The gta_vi_freeze_day flag; off is production's control. */
  isEnabled?: boolean;
  /** Pins the VI tooltip open, for side-by-side review. */
  forceOpen?: boolean;
  /** How release day shows a read: VI only, or VI with a flame badge. */
  readMarker?: ReadMarker;
  children: ReactNode;
}

/** Seeds the reading history and auth the calendar reads, around a fixed day. */
export const Scene = ({
  today,
  reads = [4, 1, 0],
  isEnabled = true,
  forceOpen = false,
  readMarker = 'none',
  children,
}: SceneProps): ReactElement => {
  const [client] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    queryClient.setQueryData(
      generateQueryKey(RequestKey.ReadingStreak30Days, mockUser),
      reads.map((offset) => ({
        date: subDays(today, offset).toISOString(),
        reads: 1,
      })),
    );
    return queryClient;
  });
  const scene = useMemo(
    () => ({ today, isEnabled, forceOpen, readMarker }),
    [today, isEnabled, forceOpen, readMarker],
  );

  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{ user: mockUser } as unknown as AuthContextData}
      >
        <SceneContext.Provider value={scene}>{children}</SceneContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

const releaseDay = day(GTA_VI_RELEASE_DAY);

/** The copy for where today sits against release day. */
export const getGtaViCopy = (today: Date): { title: string; body: string } => {
  const todayKey = dateFormatInTimezone(today, 'yyyy-MM-dd', timezone);
  if (todayKey < GTA_VI_RELEASE_DAY) {
    return {
      title: 'GTA VI drops Nov 19',
      body: "Here's a free Freeze Day so you can dive into Vice City without breaking your streak.",
    };
  }
  if (todayKey === GTA_VI_RELEASE_DAY) {
    return {
      title: 'GTA VI is out!',
      body: "Here's a free Freeze Day so you can dive into Vice City without breaking your streak.",
    };
  }
  return {
    title: 'GTA VI is out!',
    body: 'Release day was on us: a free Freeze Day kept your streak safe.',
  };
};

/** Production's Tooltip: hover on laptop, tap on phone and tablet. */
const GtaViTooltip = ({ children }: { children: ReactNode }): ReactElement => {
  const { today, forceOpen } = useScene();
  const { title, body } = getGtaViCopy(today);

  return (
    <Tooltip
      side="bottom"
      showArrow
      enableMobileClick
      open={forceOpen || undefined}
      avoidCollisions={!forceOpen}
      className="!p-0"
      content={
        <div className="relative flex w-full flex-col gap-1 overflow-hidden rounded-8 p-3 pr-20">
          <img
            src={tooltipArt}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-4/5 object-cover object-right"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background-subtle from-50% to-transparent to-95%"
          />
          <span className="relative flex items-center gap-1.5 font-bold text-text-primary typo-callout">
            <span aria-hidden>🎮</span>
            {title}
          </span>
          <span className="relative font-normal text-text-secondary typo-footnote">
            {body}
          </span>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

// Vice City sunset: violet, magenta, pink, orange, gold, from the accent tokens.
const sunsetStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to bottom, color-mix(in srgb, var(--theme-accent-onion-default) 55%, var(--theme-accent-cabbage-default)) 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 55%, var(--theme-accent-bacon-default)) 32%, var(--theme-accent-bacon-default) 55%, var(--theme-accent-bun-default) 78%, color-mix(in srgb, var(--theme-accent-bun-default) 55%, var(--theme-accent-cheese-default)) 100%)',
};

const GtaViDisc = ({
  className,
  isToday,
  isRead,
}: {
  className: string;
  isToday?: boolean;
  isRead?: boolean;
}): ReactElement => {
  const { readMarker } = useScene();

  return (
    <span
      className={classNames(
        'relative flex items-center justify-center rounded-full font-bold leading-none text-white',
        className,
      )}
      style={sunsetStyle}
    >
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
        <text
          x="50"
          y="52"
          textAnchor="middle"
          dominantBaseline="central"
          textLength="60"
          lengthAdjust="spacingAndGlyphs"
          fontSize="64"
          fill="currentColor"
        >
          VI
        </text>
      </svg>
      {isToday && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-1 rounded-full ring-1 ring-text-primary"
        />
      )}
      {isRead && readMarker === 'flame' && (
        <span
          aria-hidden
          className="absolute -bottom-1 -right-1 z-2 flex size-3 items-center justify-center rounded-full bg-accent-bacon-default ring-2 ring-background-default"
        >
          <HotIcon
            secondary
            size={IconSize.XXSmall}
            className="!size-2 text-white"
          />
        </span>
      )}
    </span>
  );
};

const getLabel = (date: Date, isRead: boolean): string =>
  `${dateFormatInTimezone(
    date,
    'EEEE, MMMM d',
    timezone,
  )}: GTA VI release day, free Freeze Day${isRead ? ', read' : ''}`;

const freezePattern = (gap: string): string =>
  gap === '4'
    ? 'bg-[repeating-linear-gradient(135deg,currentColor_0_1.5px,transparent_1.5px_4px)] text-text-quaternary'
    : 'bg-[repeating-linear-gradient(135deg,currentColor_0_1.5px,transparent_1.5px_5px)] text-text-quaternary';

const DAYS = 30;
const LEADING_DAYS = 4;

const useDays = (start: Date, count: number) => {
  const { today } = useScene();
  const history = useReadingStreak30Days();

  return useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const date = addDays(start, index);
        return {
          date,
          state: getStreak({ value: date, today, history, timezone }),
          isToday: isSameDayInTimezone(date, today, timezone),
        };
      }),
    [count, history, start, today],
  );
};

/** StreakMonthCalendar (sidebar panel, phone drawer, feed widget). */
export const GtaViCalendar = (): ReactElement => {
  const { today, isEnabled } = useScene();
  const start = useMemo(() => subDays(today, LEADING_DAYS), [today]);
  const days = useDays(start, DAYS);

  return (
    <div className="grid grid-cols-10 gap-x-2 gap-y-2.5">
      {days.map(({ date, state, isToday }) => {
        const isRead = state === Streak.Completed;
        if (isEnabled && isGtaViReleaseDay(date)) {
          return (
            <GtaViTooltip key={date.getTime()}>
              <button
                type="button"
                aria-label={getLabel(date, isRead)}
                className="place-self-center rounded-full"
              >
                <GtaViDisc
                  className="-m-px size-[1.125rem]"
                  isToday={isToday}
                  isRead={isRead}
                />
              </button>
            </GtaViTooltip>
          );
        }
        const isFreeze = state === Streak.Freeze || state === Streak.UsedFreeze;
        let stateClass = 'border-text-quaternary';
        if (isRead) {
          stateClass = 'border-transparent bg-accent-bacon-default';
        } else if (isToday) {
          stateClass = 'border-transparent';
        } else if (isFreeze) {
          stateClass = freezePattern('4');
        }
        const cell = (
          <div
            key={date.getTime()}
            className={classNames(
              'relative flex size-4 items-center justify-center place-self-center rounded-full border',
              stateClass,
            )}
          >
            {isRead && (
              <HotIcon
                secondary
                size={IconSize.XXSmall}
                className="text-white"
              />
            )}
            {isToday && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-1 rounded-full ring-1 ring-text-primary"
              />
            )}
          </div>
        );
        const tooltipContent = freezeTooltipCopy[state];
        if (!tooltipContent) {
          return cell;
        }
        return (
          <Tooltip
            key={date.getTime()}
            content={tooltipContent}
            side="bottom"
            className="max-w-44 !p-2 text-center"
          >
            {cell}
          </Tooltip>
        );
      })}
    </div>
  );
};

/**
 * ReadingStreakPopup's strip: today and four days each side, so release day
 * shows from Nov 15 to Nov 23. Dots follow the calendar's look, and the VI
 * disc is a touch bigger.
 */
export const GtaViWeekStrip = (): ReactElement => {
  const { today, isEnabled } = useScene();
  const start = useMemo(() => subDays(today, 4), [today]);
  const days = useDays(start, 9);

  return (
    <div className="flex justify-between">
      {days.map(({ date, state, isToday }) => {
        const isRead = state === Streak.Completed;
        const letter = (
          <span
            className={classNames(
              'typo-caption1',
              isToday ? 'font-bold text-text-primary' : 'text-text-tertiary',
            )}
          >
            {dateFormatInTimezone(date, 'iiiii', timezone)}
          </span>
        );
        if (isEnabled && isGtaViReleaseDay(date)) {
          return (
            <GtaViTooltip key={date.getTime()}>
              <button
                type="button"
                aria-label={getLabel(date, isRead)}
                className="flex flex-col items-center gap-1.5"
              >
                <GtaViDisc
                  className="-m-0.5 size-7"
                  isToday={isToday}
                  isRead={isRead}
                />
                {letter}
              </button>
            </GtaViTooltip>
          );
        }
        const isFreeze = state === Streak.Freeze || state === Streak.UsedFreeze;
        let stateClass = 'border-text-quaternary';
        if (isRead) {
          stateClass = 'border-transparent bg-accent-bacon-default';
        } else if (isToday) {
          stateClass = 'border-transparent';
        } else if (isFreeze) {
          stateClass = freezePattern('5');
        }
        return (
          <div
            key={date.getTime()}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className={classNames(
                'relative flex size-6 items-center justify-center rounded-full border',
                stateClass,
              )}
            >
              {isRead && (
                <HotIcon
                  secondary
                  size={IconSize.XSmall}
                  className="text-white"
                />
              )}
              {isToday && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-1 rounded-full ring-1 ring-text-primary"
                />
              )}
            </span>
            {letter}
          </div>
        );
      })}
    </div>
  );
};

// Production StreakWidget's fire panel and flame halo.
const firePanelStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(120% 100% at 80% 0%, color-mix(in srgb, var(--theme-accent-bacon-default) 30%, transparent) 0%, color-mix(in srgb, var(--theme-accent-bacon-default) 16%, transparent) 42%, transparent 78%), linear-gradient(200deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 14%, transparent) 0%, transparent 60%)',
};

const haloStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(closest-side, color-mix(in srgb, var(--theme-accent-bacon-default) 55%, transparent) 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 25%, transparent) 55%, transparent 100%)',
};

const TodayLine = (): ReactElement => {
  const { today } = useScene();

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-bold text-text-primary">
        Today, {dateFormatInTimezone(today, 'MMM d', timezone)}
      </span>
      <span className="truncate text-text-tertiary">{timezone}</span>
    </div>
  );
};

/** The streak button's popover on laptop (ReadingStreakPopup). */
export const GtaViPopover = (): ReactElement => (
  <div
    className="flex w-[22rem] flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
    style={firePanelStyle}
  >
    <span className="font-bold text-text-primary typo-callout">Your week</span>
    <GtaViWeekStrip />
  </div>
);

/** The sidebar's "Current Streak" panel (StreakQuestsSection), to the grid. */
export const GtaViSidebarPanel = ({
  className = 'w-80',
}: {
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-4 bg-background-default p-4',
      className,
    )}
  >
    <span className="font-bold typo-title3">Current Streak</span>
    <div className="flex flex-col gap-1">
      <span className="font-bold typo-large-title">2</span>
      <span className="text-text-tertiary typo-callout">
        31 Longest · 759 Total
      </span>
    </div>
    <div className="typo-callout">
      <TodayLine />
    </div>
    <GtaViCalendar />
  </div>
);

const DrawerSheet = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col rounded-t-24 border border-b-0 border-border-subtlest-tertiary bg-background-default pt-2',
      className,
    )}
  >
    <span className="mx-auto mb-2 h-1 w-10 rounded-full bg-text-quaternary" />
    {children}
  </div>
);

/** Phone: the streak button opens the sidebar panel in a bottom drawer. */
export const GtaViPhoneDrawer = (): ReactElement => (
  <DrawerSheet className="w-[23.4375rem]">
    <GtaViSidebarPanel className="w-full" />
  </DrawerSheet>
);

/** Tablet portrait: the streak button opens the full-width popup in a drawer. */
export const GtaViTabletDrawer = (): ReactElement => (
  <DrawerSheet className="w-[48rem] px-6 pb-6">
    <span className="mb-3 font-bold text-text-primary typo-callout">
      Your week
    </span>
    <GtaViWeekStrip />
  </DrawerSheet>
);

const WidgetSummary = ({ isSmall }: { isSmall: boolean }): ReactElement => {
  const { today } = useScene();
  const history = useReadingStreak30Days();
  const hasReadToday = !!history?.some(
    ({ date, reads }) =>
      reads > 0 && isSameDayInTimezone(new Date(date), today, timezone),
  );

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={classNames(
            'font-bold tabular-nums leading-none text-text-primary',
            isSmall ? 'typo-large-title' : 'typo-mega2',
          )}
        >
          2
        </span>
        <span
          className={classNames(
            'mt-1 truncate font-bold typo-footnote',
            hasReadToday ? 'text-accent-bacon-default' : 'text-text-tertiary',
          )}
        >
          day streak · {hasReadToday ? 'safe today' : 'read a post to keep it'}
        </span>
        <span className="truncate tabular-nums text-text-tertiary typo-caption1">
          31 longest · 759 total
        </span>
      </span>
      <span
        className={classNames(
          'relative flex shrink-0 items-center justify-center',
          isSmall ? 'size-14' : 'size-20',
        )}
      >
        <span
          aria-hidden
          className={classNames(
            'absolute -inset-3',
            !hasReadToday && 'opacity-40',
          )}
          style={haloStyle}
        />
        <ReadingStreakIcon
          secondary
          size={isSmall ? IconSize.XXLarge : IconSize.XXXLarge}
          className={classNames(
            'relative',
            hasReadToday ? 'text-accent-bacon-default' : 'text-text-tertiary',
          )}
        />
      </span>
    </div>
  );
};

/** The feed StreakWidget at Small (count and calendar) or Tall. */
export const GtaViWidget = ({
  size = 'small',
}: {
  size?: 'small' | 'tall';
}): ReactElement => {
  const isSmall = size === 'small';

  return (
    <div
      className={classNames(
        'flex w-80 flex-col gap-4 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-4 py-3',
        isSmall ? 'h-60 justify-between' : 'h-[30rem]',
      )}
      style={firePanelStyle}
    >
      <WidgetSummary isSmall={isSmall} />
      {!isSmall && (
        <div className="typo-caption1">
          <TodayLine />
        </div>
      )}
      <GtaViCalendar />
      {!isSmall && (
        <div className="mt-auto flex flex-col gap-2 typo-caption1">
          <div className="flex justify-between">
            <span className="font-bold text-text-primary">
              Today&apos;s goal
            </span>
            <span className="text-text-tertiary">1 of 1</span>
          </div>
          <span className="h-1 rounded-full bg-accent-avocado-default" />
        </div>
      )}
    </div>
  );
};

export { releaseDay };
