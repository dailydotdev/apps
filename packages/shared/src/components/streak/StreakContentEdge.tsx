import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import { useReadingStreakSummary } from '../../hooks/streaks/useReadingStreakSummary';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { ReadingStreakIcon } from '../icons';
import { IconSize } from '../Icon';
import { Typography, TypographyType } from '../typography/Typography';
import { StreakPopover } from '../sidebar/StreakPopover';

// Option D: the reading streak *is* the content card's top accent line — the
// filled portion tracks the past week, with a small flame + count anchored in
// the corner. Absolutely positioned, so it costs zero layout space and rides
// the chrome you already have rather than sitting on top of content.
export const StreakContentEdge = (): ReactElement | null => {
  const { isEnabled, streak, count, hasReadToday, isAtRisk, weekProgress } =
    useReadingStreakSummary();
  const { logEvent } = useLogContext();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const onToggle = useCallback(() => {
    setIsPopoverOpen((open) => {
      const next = !open;
      if (next) {
        logEvent({ event_name: LogEvent.OpenStreaks });
      }
      return next;
    });
  }, [logEvent]);

  if (!isEnabled || !streak) {
    return null;
  }

  const fillPct = Math.max(6, Math.round(weekProgress * 100));

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-1 hidden h-1 overflow-hidden bg-border-subtlest-tertiary laptop:block"
      >
        <div
          className={classNames(
            'h-full rounded-r-full bg-accent-bacon-default transition-[width] duration-500',
            isAtRisk && 'animate-pulse',
          )}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-label={`Reading streak: ${count} days.${
          isAtRisk ? ' At risk — read a post to keep it.' : ''
        }`}
        aria-expanded={isPopoverOpen}
        className="focus-outline absolute left-3 top-2 z-1 hidden items-center gap-1 rounded-full bg-background-default px-2 py-0.5 transition-colors hover:bg-surface-hover laptop:flex"
      >
        <ReadingStreakIcon
          secondary={hasReadToday}
          size={IconSize.Size16}
          className={classNames(
            'text-accent-bacon-default',
            isAtRisk && 'animate-pulse',
          )}
          aria-hidden
        />
        <Typography
          type={TypographyType.Caption1}
          bold
          className={classNames(
            'tabular-nums',
            isAtRisk ? 'text-accent-bacon-default' : 'text-text-primary',
          )}
        >
          {count}
        </Typography>
      </button>

      {isPopoverOpen && (
        <StreakPopover
          streak={streak}
          triggerRef={triggerRef}
          onClose={() => setIsPopoverOpen(false)}
          placement="bottom"
        />
      )}
    </>
  );
};
