import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { subDays } from 'date-fns';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { DEFAULT_TIMEZONE, isSameDayInTimezone } from '../../lib/timezones';
import { isWeekend } from '../../lib/date';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ReadingDay } from '../../graphql/users';
import { getReadingStreak30Days } from '../../graphql/users';
import { ReadingStreakIcon } from '../icons';
import { IconSize } from '../Icon';
import { Typography, TypographyType } from '../typography/Typography';
import { StreakPopover } from '../sidebar/StreakPopover';

type DailyState = 'completed' | 'pending' | 'freeze';

const WEEK_LENGTH = 7;

// The reading streak is kept by reading at least one post per day (weekends are
// auto-frozen). So the daily state is binary: completed (read today), pending
// (a weekday with nothing read yet — the streak is at risk) or freeze (a rest
// day). The HUD turns that into a glanceable, always-on signal on the content
// card so the streak follows the reader across every page.
export const ReadingStreakHud = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { streak, isStreaksEnabled } = useReadingStreak();
  const { logEvent } = useLogContext();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasReadTodayRef = useRef<boolean | null>(null);

  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const userId = user?.id;

  const { data: history } = useQuery<ReadingDay[]>({
    queryKey: generateQueryKey(RequestKey.ReadingStreak30Days, user),
    queryFn: () => getReadingStreak30Days(userId ?? ''),
    staleTime: StaleTime.Default,
    enabled: !!userId && isStreaksEnabled,
  });

  const hasReadToday =
    !!streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), timezone);

  // Fire a one-off celebration the moment today's first read lands (pending ->
  // completed). Skip the very first render so it never flashes on mount.
  useEffect(() => {
    const previous = wasReadTodayRef.current;
    wasReadTodayRef.current = hasReadToday;
    if (previous === false && hasReadToday) {
      setIsCelebrating(true);
      const timeout = setTimeout(() => setIsCelebrating(false), 1800);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [hasReadToday]);

  const dailyState: DailyState = useMemo(() => {
    if (hasReadToday) {
      return 'completed';
    }
    if (isWeekend(new Date(), streak?.weekStart, timezone)) {
      return 'freeze';
    }
    return 'pending';
  }, [hasReadToday, streak?.weekStart, timezone]);

  const weekDots = useMemo(() => {
    const today = new Date();
    return Array.from({ length: WEEK_LENGTH }, (_, index) => {
      const date = subDays(today, WEEK_LENGTH - 1 - index);
      const isToday = isSameDayInTimezone(date, today, timezone);
      const didRead = history?.some(
        ({ date: historyDate, reads }) =>
          reads > 0 &&
          isSameDayInTimezone(new Date(historyDate), date, timezone),
      );
      const isFreeze = isWeekend(date, streak?.weekStart, timezone);
      return { key: date.getTime(), didRead: !!didRead, isToday, isFreeze };
    });
  }, [history, streak?.weekStart, timezone]);

  const onToggle = useCallback(() => {
    setIsPopoverOpen((open) => {
      const next = !open;
      if (next) {
        logEvent({ event_name: LogEvent.OpenStreaks });
      }
      return next;
    });
  }, [logEvent]);

  if (!user || !isStreaksEnabled || !streak) {
    return null;
  }

  const count = streak.current ?? 0;
  const isAtRisk = dailyState === 'pending';

  return (
    // Floats over the content in the bottom-right corner — costs zero layout
    // space and stays put while the page scrolls (fixed). z-header keeps it
    // above content but below its own popover (z-tooltip) and modals.
    <div className="pointer-events-none fixed bottom-4 right-4 z-header hidden laptop:bottom-6 laptop:right-6 laptop:flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-label={`Reading streak: ${count} days.${
          isAtRisk ? ' At risk — read a post to keep it.' : ''
        }`}
        aria-expanded={isPopoverOpen}
        className={classNames(
          'focus-outline group pointer-events-auto flex items-center gap-1.5 rounded-full border bg-background-default py-1.5 pl-2 pr-2.5 shadow-2 transition-colors hover:bg-surface-hover',
          isAtRisk
            ? 'border-accent-bacon-default'
            : 'border-border-subtlest-tertiary',
        )}
      >
        <span
          className={classNames(
            'flex size-5 shrink-0 items-center justify-center',
            (isCelebrating || isAtRisk) && 'animate-pulse',
          )}
          aria-hidden
        >
          <ReadingStreakIcon
            secondary={hasReadToday}
            size={IconSize.XSmall}
            className="text-accent-bacon-default"
          />
        </span>

        <Typography
          type={TypographyType.Footnote}
          bold
          className={classNames(
            'tabular-nums',
            isAtRisk ? 'text-accent-bacon-default' : 'text-text-primary',
          )}
        >
          {count}
        </Typography>

        {/* The week track stays hidden until hover/focus, so at rest the HUD is
            just a small flame + number. */}
        <span
          className="flex max-w-0 items-center gap-0.5 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-w-24 group-hover:opacity-100 group-focus-visible:max-w-24 group-focus-visible:opacity-100"
          aria-hidden
        >
          {weekDots.map((dot) => (
            <span
              key={dot.key}
              className={classNames(
                'h-1 w-2.5 shrink-0 rounded-full',
                dot.didRead && 'bg-accent-bacon-default',
                !dot.didRead &&
                  dot.isToday &&
                  (isAtRisk
                    ? 'bg-accent-bacon-default'
                    : 'bg-accent-bacon-subtler'),
                !dot.didRead &&
                  !dot.isToday &&
                  (dot.isFreeze
                    ? 'bg-border-subtlest-tertiary'
                    : 'bg-border-subtlest-secondary'),
              )}
            />
          ))}
        </span>
      </button>

      {isPopoverOpen && (
        <StreakPopover
          streak={streak}
          triggerRef={triggerRef}
          onClose={() => setIsPopoverOpen(false)}
          placement="top"
        />
      )}
    </div>
  );
};
