import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { addDays, subDays } from 'date-fns';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { HotIcon } from '@dailydotdev/shared/src/components/icons';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import {
  IconSize,
  iconSizeToClassName,
} from '@dailydotdev/shared/src/components/Icon';
import {
  DayStreak,
  freezeTooltipCopy,
  Streak,
} from '@dailydotdev/shared/src/components/streak/popup/DayStreak';
import {
  getStreak,
  useReadingStreak30Days,
} from '@dailydotdev/shared/src/hooks/streaks/useStreakDays';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  DEFAULT_TIMEZONE,
  dateFormatInTimezone,
  isSameDayInTimezone,
} from '@dailydotdev/shared/src/lib/timezones';
import tooltipArt from './assets/gta-vi-tooltip.webp';

/*
 * The GTA VI release day on every surface that draws streak days. Production
 * has none of this yet: the calendar, popup strip and widget here are copies
 * of StreakMonthCalendar, ReadingStreakPopup's DayStreak strip and the feed
 * StreakWidget with the VI day added, built on production's day-state logic
 * and its Tooltip.
 */

export const GTA_VI_RELEASE_DAY = '2026-11-19';

const isGtaViReleaseDay = (date: Date, timezone: string): boolean =>
  dateFormatInTimezone(date, 'yyyy-MM-dd', timezone) === GTA_VI_RELEASE_DAY;

const getTitle = (timezone: string): string =>
  dateFormatInTimezone(new Date(), 'yyyy-MM-dd', timezone) < GTA_VI_RELEASE_DAY
    ? 'GTA VI drops Nov 19'
    : 'GTA VI is out!';

const useTimezone = (): string => {
  const { user } = useAuthContext();
  return user?.timezone ?? DEFAULT_TIMEZONE;
};

/** Production's Tooltip: hover on laptop, tap on phone and tablet. */
const GtaViTooltip = ({ children }: { children: ReactNode }): ReactElement => {
  const timezone = useTimezone();

  return (
    <Tooltip
      side="bottom"
      showArrow
      enableMobileClick
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
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background-subtle from-30% to-transparent to-85%"
          />
          <span className="relative flex items-center gap-1.5 font-bold text-text-primary typo-callout">
            <span aria-hidden>🎮</span>
            {getTitle(timezone)}
          </span>
          <span className="relative font-normal text-text-secondary typo-footnote">
            Here&apos;s a free Freeze Day so you can dive into Vice City without
            breaking your streak.
          </span>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

const GtaViDisc = ({
  className,
  isToday,
}: {
  className: string;
  isToday?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'relative flex items-center justify-center rounded-full bg-gradient-to-b from-accent-cabbage-default via-accent-bacon-default to-accent-bun-default font-bold leading-none text-white',
      className,
    )}
  >
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        textLength="70"
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
  </span>
);

const DAYS = 30;
const LEADING_DAYS = 4;

/** StreakMonthCalendar (sidebar panel and feed widget) with the VI day. */
export const GtaViCalendar = (): ReactElement => {
  const timezone = useTimezone();
  const history = useReadingStreak30Days();

  const days = useMemo(() => {
    const today = new Date();
    const start = subDays(today, LEADING_DAYS);
    return Array.from({ length: DAYS }, (_, index) => {
      const date = addDays(start, index);
      return {
        date,
        state: getStreak({ value: date, today, history, timezone }),
        isToday: isSameDayInTimezone(date, today, timezone),
      };
    });
  }, [history, timezone]);

  return (
    <div className="grid grid-cols-10 gap-x-2 gap-y-2.5">
      {days.map(({ date, state, isToday }) => {
        if (isGtaViReleaseDay(date, timezone)) {
          return (
            <GtaViTooltip key={date.getTime()}>
              <button
                type="button"
                aria-label="GTA VI release day"
                className="place-self-center rounded-full"
              >
                <GtaViDisc className="-m-1 size-6" isToday={isToday} />
              </button>
            </GtaViTooltip>
          );
        }
        const isRead = state === Streak.Completed;
        const isFreeze = state === Streak.Freeze || state === Streak.UsedFreeze;
        let stateClass = 'border-text-quaternary';
        if (isRead) {
          stateClass = 'border-transparent bg-accent-bacon-default';
        } else if (isToday) {
          stateClass = 'border-transparent';
        } else if (isFreeze) {
          stateClass =
            'bg-[repeating-linear-gradient(135deg,currentColor_0_1.5px,transparent_1.5px_4px)] text-text-quaternary';
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
 * The streak button popup's 9-day strip (header, mobile feed actions, profile
 * button), centered on release day since today's strip may not reach it.
 */
export const GtaViPopupStrip = (): ReactElement => {
  const timezone = useTimezone();
  const releaseDay = new Date(`${GTA_VI_RELEASE_DAY}T12:00:00`);

  return (
    <div className="flex justify-between">
      {Array.from({ length: 9 }, (_, index) => {
        const date = addDays(releaseDay, index - 4);
        if (index === 4) {
          return (
            <GtaViTooltip key={date.getTime()}>
              <button
                type="button"
                aria-label="GTA VI release day"
                className="relative flex flex-col items-center gap-1"
              >
                <GtaViDisc className={iconSizeToClassName[IconSize.Medium]} />
                {dateFormatInTimezone(date, 'iiiii', timezone)}
              </button>
            </GtaViTooltip>
          );
        }
        return (
          <DayStreak
            key={date.getTime()}
            streak={index < 4 ? Streak.Completed : Streak.Upcoming}
            date={date}
          />
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

/** The small feed StreakWidget: count, flame and the calendar. */
export const GtaViWidget = (): ReactElement => (
  <div
    className="flex h-60 w-80 flex-col justify-between gap-3 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-4 py-3"
    style={firePanelStyle}
  >
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold tabular-nums leading-none text-text-primary typo-large-title">
          2
        </span>
        <span className="mt-1 truncate font-bold text-accent-bacon-default typo-footnote">
          day streak · safe today
        </span>
        <span className="truncate tabular-nums text-text-tertiary typo-caption1">
          31 longest · 759 total
        </span>
      </span>
      <span className="relative flex size-14 shrink-0 items-center justify-center">
        <span aria-hidden className="absolute -inset-3" style={haloStyle} />
        <ReadingStreakIcon
          secondary
          size={IconSize.XXLarge}
          className="relative text-accent-bacon-default"
        />
      </span>
    </div>
    <GtaViCalendar />
  </div>
);
