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

  const label = (() => {
    if (isAtRisk) {
      return count > 0
        ? `Read 1 post to keep your ${count}-day streak`
        : 'Read 1 post to start a streak';
    }
    if (dailyState === 'freeze') {
      return `${count} day streak · rest day`;
    }
    return `${count} day streak`;
  })();

  return (
    <div className="flex justify-center px-4 pb-2 pt-3">
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-label={`Reading streak: ${count} days. ${
          isAtRisk ? 'At risk — read a post to keep it.' : ''
        }`}
        aria-expanded={isPopoverOpen}
        className={classNames(
          'focus-outline flex items-center gap-2.5 rounded-12 border px-3 py-1.5 transition-colors',
          isAtRisk
            ? 'border-accent-bacon-default bg-accent-bacon-subtlest hover:bg-accent-bacon-subtler'
            : 'border-border-subtlest-tertiary bg-surface-float hover:bg-surface-hover',
        )}
      >
        <span
          className={classNames(
            'flex size-6 shrink-0 items-center justify-center',
            isCelebrating && 'animate-pulse',
          )}
          aria-hidden
        >
          <ReadingStreakIcon
            secondary={hasReadToday}
            size={IconSize.Medium}
            className="text-accent-bacon-default"
          />
        </span>

        <Typography
          type={TypographyType.Footnote}
          bold
          className={classNames(
            'whitespace-nowrap',
            isAtRisk ? 'text-accent-bacon-default' : 'text-text-primary',
          )}
        >
          {label}
        </Typography>

        <span className="ml-1 flex items-center gap-1" aria-hidden>
          {weekDots.map((dot) => (
            <span
              key={dot.key}
              className={classNames(
                'size-2 rounded-full border',
                dot.didRead &&
                  'border-accent-bacon-default bg-accent-bacon-default',
                !dot.didRead &&
                  dot.isToday &&
                  'border-accent-bacon-default bg-transparent',
                !dot.didRead &&
                  !dot.isToday &&
                  (dot.isFreeze
                    ? 'border-border-subtlest-tertiary bg-border-subtlest-tertiary'
                    : 'border-border-subtlest-secondary bg-transparent'),
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
          placement="bottom"
        />
      )}
    </div>
  );
};
