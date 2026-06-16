import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks';
import { useLogContext } from '../../contexts/LogContext';
import { isSameDayInTimezone } from '../../lib/timezones';
import { LogEvent } from '../../lib/log';
import { Tooltip } from '../tooltip/Tooltip';
import { IconSize } from '../Icon';
import { ReadingStreakIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';
import { StreakPopover } from './StreakPopover';

// Compact reading-streak chip (icon + count) shown beside the profile in the
// sidebar header. Clicking opens the streak popover below it. In the collapsed
// rail (`iconOnly`) only the small flame shows — the count doesn't fit a 32px
// square and a long streak would overflow it.
export const SidebarStreakButton = ({
  iconOnly = false,
}: {
  iconOnly?: boolean;
} = {}): ReactElement | null => {
  const { user } = useAuthContext();
  const { streak, isStreaksEnabled } = useReadingStreak();
  const { logEvent } = useLogContext();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const onClick = useCallback(() => {
    setIsOpen((open) => {
      const next = !open;
      if (next) {
        logEvent({ event_name: LogEvent.OpenStreaks });
      }
      return next;
    });
  }, [logEvent]);

  if (!user || !isStreaksEnabled) {
    return null;
  }

  const value = streak?.current ?? 0;
  const hasReadToday =
    !!streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), user.timezone);

  const button = (
    <button
      type="button"
      onClick={streak ? onClick : undefined}
      aria-label={`Reading streak: ${value}`}
      className={
        iconOnly
          ? 'focus-outline flex size-8 items-center justify-center rounded-10 text-text-primary transition-colors hover:bg-surface-hover'
          : 'focus-outline flex items-center gap-1 rounded-10 px-2 py-1.5 text-text-primary transition-colors hover:bg-surface-hover'
      }
    >
      {!iconOnly && (
        <Typography
          bold
          type={TypographyType.Footnote}
          className="tabular-nums"
        >
          {value}
        </Typography>
      )}
      <ReadingStreakIcon
        secondary={hasReadToday}
        size={iconOnly ? IconSize.XXSmall : IconSize.Size16}
        className="text-accent-bacon-default"
      />
    </button>
  );

  return (
    <div ref={triggerRef} className="flex">
      {isOpen ? (
        button
      ) : (
        <Tooltip side="top" content="Reading streak">
          {button}
        </Tooltip>
      )}
      {streak && isOpen && (
        <StreakPopover
          streak={streak}
          triggerRef={triggerRef}
          onClose={() => setIsOpen(false)}
          placement="bottom"
        />
      )}
    </div>
  );
};
