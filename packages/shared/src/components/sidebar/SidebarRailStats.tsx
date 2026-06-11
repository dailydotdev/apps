import type { MouseEvent, ReactElement, ReactNode } from 'react';
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

const slotClass =
  'focus-outline flex w-full flex-col items-center justify-center gap-0.5 rounded-12 py-2 text-text-primary transition-colors hover:bg-surface-hover';
const iconBoxClass = 'flex size-8 shrink-0 items-center justify-center';

type RailSlotProps = {
  ariaLabel: string;
  icon: ReactNode;
  value: string | number | null;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

const RailSlot = ({
  ariaLabel,
  icon,
  value,
  onClick,
}: RailSlotProps): ReactElement => {
  const inner = (
    <>
      {icon}
      <Typography bold type={TypographyType.Footnote} className="tabular-nums">
        {value}
      </Typography>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={slotClass}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }

  return (
    <span className={slotClass} aria-label={ariaLabel}>
      {inner}
    </span>
  );
};

// Reading-streak signal pinned to the bottom of the always-visible desktop
// rail. Reputation and Cores live in the profile dropdown (see
// SidebarProfileStats); only the streak stays on the rail itself.
export const SidebarRailStats = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { streak, isStreaksEnabled } = useReadingStreak();
  const { logEvent } = useLogContext();
  const [isStreaksOpen, setIsStreaksOpen] = useState(false);
  const streakSlotRef = useRef<HTMLDivElement>(null);

  const handleStreakClick = useCallback(() => {
    setIsStreaksOpen((open) => {
      const next = !open;
      if (next) {
        logEvent({ event_name: LogEvent.OpenStreaks });
      }
      return next;
    });
  }, [logEvent]);

  if (!user) {
    return null;
  }

  const streakValue = streak?.current ?? 0;
  const hasReadToday =
    !!streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), user.timezone);

  const streakSlot = (
    <RailSlot
      ariaLabel={`Current reading streak: ${streakValue}`}
      icon={
        <span className={iconBoxClass} aria-hidden>
          <ReadingStreakIcon
            secondary={hasReadToday}
            size={IconSize.Large}
            className="text-accent-bacon-default"
          />
        </span>
      }
      value={streakValue}
      onClick={streak ? handleStreakClick : undefined}
    />
  );

  if (!isStreaksEnabled) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-stretch">
      <div ref={streakSlotRef} className="flex w-full">
        {isStreaksOpen ? (
          streakSlot
        ) : (
          <Tooltip side="right" content="Reading streak">
            {streakSlot}
          </Tooltip>
        )}
      </div>
      {streak && isStreaksOpen && (
        <StreakPopover
          streak={streak}
          triggerRef={streakSlotRef}
          onClose={() => setIsStreaksOpen(false)}
          placement="right"
        />
      )}
    </div>
  );
};
