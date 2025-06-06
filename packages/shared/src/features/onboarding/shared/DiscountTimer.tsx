import React, { useEffect, useMemo } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { addMinutes } from 'date-fns';
import useTimer from '../../../hooks/useTimer';
import { sanitizeMessage } from '../lib/utils';

/**
 * Formats seconds to MM:SS format
 */
const formatTime = (seconds: number): string => {
  if (seconds <= 0) {
    return '00:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

export interface DiscountTimerProps {
  discountMessage: string;
  durationInMinutes: number;
  startDate?: Date;
  className?: string;
  onTimerEnd?: () => void;
  isActive?: boolean;
}

const calculateTimeLeft = (
  startDate: Date,
  durationInMinutes: number,
): number => {
  const now = new Date();
  const endTime = addMinutes(startDate, durationInMinutes);
  return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
};

export function DiscountTimer({
  discountMessage,
  durationInMinutes,
  startDate = new Date(),
  className,
  onTimerEnd,
  isActive,
}: DiscountTimerProps): ReactElement {
  const {
    timer: timeLeft,
    runTimer,
    setTimer,
    clearTimer,
  } = useTimer(
    onTimerEnd,
    isActive ? calculateTimeLeft(startDate, durationInMinutes) : 0,
  );

  const sanitizedMessage = useMemo(
    () => sanitizeMessage(discountMessage),
    [discountMessage],
  );

  useEffect(() => {
    if (isActive) {
      setTimer(calculateTimeLeft(startDate, durationInMinutes));
      runTimer();
    } else {
      clearTimer();
    }
  }, [isActive, runTimer, setTimer, startDate, durationInMinutes, clearTimer]);

  return (
    <div
      className={classNames(
        'flex flex-row items-center gap-6 bg-background-default px-4 py-2',
        'tablet:relative tablet:left-1/2 tablet:min-w-[100dvw] tablet:-translate-x-1/2 tablet:justify-center',
        className,
      )}
      data-testid="discount-timer-container"
    >
      <p
        className="flex-1 text-text-primary typo-callout tablet:max-w-70"
        dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
        data-testid="discount-message"
      />
      <div>
        <div
          className="inline-flex h-8 w-[4.75rem] items-center justify-center rounded-8 border border-status-success font-bold text-text-primary typo-title3"
          data-testid="timer-display"
        >
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
}
