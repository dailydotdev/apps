import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { webappUrl } from '../../../lib/constants';
import { DEFAULT_TIMEZONE, dateFormatInTimezone } from '../../../lib/timezones';
import { useStreakRingState } from '../../../hooks/streaks/useStreakRingState';
import {
  STREAK_FREEZE_CAP,
  useStreakFreeze,
} from '../../../hooks/streaks/useStreakFreeze';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { StreakMonthCalendar } from '../../../components/streak/popup/StreakMonthCalendar';
import { useIsStreakFreezeEnabled } from '../../../components/streak/popup/StreakFreezeRow';
import { CompactQuestList } from '../../../components/quest/CompactQuestList';
import { useQuestDashboard } from '../../../hooks/useQuestDashboard';
import { ReadingStreakIcon } from '../../../components/icons/ReadingStreak';
import { IconSize } from '../../../components/Icon';
import Link from '../../../components/utilities/Link';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';

// Where the sidebar's streak tab and the You page send readers.
const gameCenterUrl = `${webappUrl}game-center`;

const MINUTE_MS = 60 * 1000;

// The milestone pop-up's fire panel, behind the whole widget.
const firePanelStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(120% 100% at 80% 0%, color-mix(in srgb, var(--theme-accent-bacon-default) 30%, transparent) 0%, color-mix(in srgb, var(--theme-accent-bacon-default) 16%, transparent) 42%, transparent 78%), linear-gradient(200deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 14%, transparent) 0%, transparent 60%)',
};

// The flame's halo, a gradient that fades on its own so no edge is clipped.
const haloStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(closest-side, color-mix(in srgb, var(--theme-accent-bacon-default) 55%, transparent) 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 25%, transparent) 55%, transparent 100%)',
};

/** The time, ticking each minute, for the parts that show the day. */
const useNow = (): Date => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), MINUTE_MS);
    return () => clearInterval(id);
  }, []);

  return now;
};

/** Minutes until midnight where the reader is, when today's read resets. */
const minutesLeftToday = (now: Date, timezone: string): number => {
  const [hours, minutes] = dateFormatInTimezone(now, 'HH:mm', timezone)
    .split(':')
    .map((part) => parseInt(part, 10));

  return Number.isNaN(hours) ? 0 : 24 * 60 - (hours * 60 + (minutes || 0));
};

const formatTimeLeft = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours} hr ${minutes % 60} min` : `${minutes} min`;
};

/**
 * The usage-meter grammar: what was used, of what, and what happens next, on
 * one thin bar.
 */
const UsageMeter = ({
  label,
  value,
  max,
  hint,
  action,
}: {
  label: string;
  value: number;
  max: number;
  hint: string;
  action?: ReactElement;
}): ReactElement => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between gap-2">
      <span className="font-bold text-text-primary typo-footnote">{label}</span>
      <span className="tabular-nums text-text-secondary typo-caption1">
        {value} of {max}
      </span>
    </div>
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-1.5 overflow-hidden rounded-max bg-surface-float"
    >
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
    <div className="flex items-center justify-between gap-2">
      <span className="min-w-0 truncate text-text-quaternary typo-caption1">
        {hint}
      </span>
      {action}
    </div>
  </div>
);

const freezeHint = (count: number): string => {
  if (count === 0) {
    return 'None left, protect your streak';
  }
  return count === 1 ? 'One left for a day off' : `${count} left for days off`;
};

/** The freeze balance as a meter, with the way to buy more. */
const FreezeMeter = (): ReactElement | null => {
  const isEnabled = useIsStreakFreezeEnabled();
  const { freezesAvailable } = useStreakFreeze({ enabled: isEnabled });
  const { openModal } = useLazyModal();

  if (!isEnabled) {
    return null;
  }

  return (
    <UsageMeter
      label="Streak freezes"
      value={freezesAvailable}
      max={STREAK_FREEZE_CAP}
      hint={freezeHint(freezesAvailable)}
      action={
        <Button
          type="button"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.XSmall}
          onClick={() => openModal({ type: LazyModal.StreakFreezePurchase })}
          className="shrink-0"
        >
          {freezesAvailable > 0 ? 'Buy more' : 'Buy freezes'}
        </Button>
      }
    />
  );
};

/** Today's date where the reader is, beside their timezone. */
const TodayLine = ({ timezone }: { timezone: string }): ReactElement => {
  const now = useNow();

  return (
    <div className="flex items-center justify-between gap-2 typo-caption1">
      <span className="font-bold text-text-primary">
        Today, {dateFormatInTimezone(now, 'MMM d', timezone)}
      </span>
      <span className="truncate text-text-tertiary">{timezone}</span>
    </div>
  );
};

/** Today's one read, and how long is left for it or until it resets. */
const TodayGoal = ({
  timezone,
  hasReadToday,
  isRestDay,
}: {
  timezone: string;
  hasReadToday: boolean;
  isRestDay: boolean;
}): ReactElement => {
  const timeLeft = formatTimeLeft(minutesLeftToday(useNow(), timezone));
  let hint = `${timeLeft} left to read`;
  if (hasReadToday) {
    hint = `Resets in ${timeLeft}`;
  } else if (isRestDay) {
    hint = 'Rest day, your streak is safe';
  }

  return (
    <UsageMeter
      label="Today’s goal"
      value={hasReadToday || isRestDay ? 1 : 0}
      max={1}
      hint={hint}
    />
  );
};

/**
 * The reader's reading streak, from the same streak query and state machine
 * the sidebar's streak tab uses, as that panel at widget scale: the count with
 * its flame and the 30-day calendar at every size, then today's goal and the
 * freeze balance, and at Large the day's quests beside it.
 */
export const StreakWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.Streak>): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const scroll = useWidgetScroll();
  const {
    isEnabled,
    isLoading,
    streak,
    state,
    count,
    hasReadToday,
    countClassName,
  } = useStreakRingState();
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const { data: questDashboard } = useQuestDashboard({
    enabled: size === FeedWidgetSize.Large,
  });

  const onClick = useCallback(
    () =>
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.FeedWidget,
        target_id: FeedWidgetKind.Streak,
        extra: JSON.stringify({ origin: Origin.FeedWidgets, size }),
      }),
    [logEvent, size],
  );

  if (!isEnabled || isLoading || !streak) {
    let message = 'No streak to show right now.';
    if (!user) {
      message = 'Log in to keep a reading streak.';
    } else if (!isEnabled) {
      message = 'Reading streaks are turned off.';
    }

    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.Streak}
        isPending={isEnabled && isLoading}
        message={message}
      />
    );
  }

  const isSmall = size === FeedWidgetSize.Small;
  const isLarge = size === FeedWidgetSize.Large;
  // A rest day, a weekend or a freeze, keeps the streak without a read.
  const isRestDay = !hasReadToday && state === 'freeze';
  let status = 'read a post to keep it';
  if (hasReadToday) {
    status = 'safe today';
  } else if (isRestDay) {
    status = 'rest day';
  }

  const summary = (
    <Link href={gameCenterUrl} passHref>
      <a
        href={gameCenterUrl}
        onClick={onClick}
        aria-label={`${count}-day reading streak, open Game Center`}
        className="flex min-w-0 items-center gap-3"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            className={classNames(
              'font-bold tabular-nums leading-none text-text-primary',
              isSmall ? 'typo-large-title' : 'typo-mega2',
            )}
          >
            {count}
          </span>
          <span
            className={classNames(
              'mt-1 truncate font-bold typo-footnote',
              hasReadToday ? 'text-accent-bacon-default' : countClassName,
            )}
          >
            day streak · {status}
          </span>
          <span className="truncate tabular-nums text-text-tertiary typo-caption1">
            {streak.max} longest · {streak.total.toLocaleString()} total
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
              hasReadToday ? 'text-accent-bacon-default' : countClassName,
            )}
          />
        </span>
      </a>
    </Link>
  );

  const panel = isSmall ? (
    <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 px-4">
      {summary}
      <StreakMonthCalendar streak={streak} />
    </div>
  ) : (
    <div
      className={classNames(
        'flex min-h-0 flex-col gap-4 px-4',
        isLarge ? 'w-1/2 shrink-0' : 'flex-1',
      )}
    >
      {summary}
      <TodayLine timezone={timezone} />
      <StreakMonthCalendar streak={streak} />
      <div className="mt-auto flex flex-col gap-4">
        <TodayGoal
          timezone={timezone}
          hasReadToday={hasReadToday}
          isRestDay={isRestDay}
        />
        <FreezeMeter />
      </div>
    </div>
  );

  return (
    <div
      className="relative isolate flex min-h-0 min-w-0 flex-1"
      data-size={size}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-1"
        style={firePanelStyle}
      />
      {panel}
      {isLarge && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            ref={scroll.ref}
            onScroll={scroll.onScroll}
            style={scroll.style}
            className={classNames('px-2', scroll.className)}
          >
            {questDashboard && (
              <>
                <span className="block px-2 text-text-quaternary typo-footnote">
                  Daily quests
                </span>
                <div className="mt-1">
                  <CompactQuestList period="daily" />
                </div>
                <span className="mt-3 block px-2 text-text-quaternary typo-footnote">
                  Weekly quests
                </span>
                <div className="mt-1">
                  <CompactQuestList period="weekly" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
