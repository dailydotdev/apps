import React, { useEffect, useMemo } from 'react';
import type { ReactElement, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { addMinutes } from 'date-fns';
import useTimer from '../../../hooks/useTimer';
import { sanitizeMessage } from '../lib/utils';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import { TimerIcon } from '../../../components/icons';

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

export enum DiscountTimerVariant {
  Simple = 'simple',
  WithSlot = 'with-slot',
}

export interface DiscountTimerProps extends PropsWithChildren {
  discountMessage: string;
  durationInMinutes: number;
  startDate?: Date;
  className?: string;
  onTimerEnd?: () => void;
  isActive?: boolean;
  variant?: DiscountTimerVariant;
}

const calculateTimeLeft = (
  startDate: Date,
  durationInMinutes: number,
): number => {
  const now = new Date();
  const endTime = addMinutes(startDate, durationInMinutes);
  return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
};

const useDiscountTimer = ({
  discountMessage,
  durationInMinutes,
  startDate = new Date(),
  onTimerEnd,
  isActive,
}: DiscountTimerProps) => {
  const {
    timer: timeLeft,
    runTimer,
    setTimer,
    clearTimer,
  } = useTimer(
    () => {
      onTimerEnd?.();
      clearTimer();
    },
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

  return {
    timeLeft,
    sanitizedMessage,
  };
};

export function DiscountTimer({
  children,
  className,
  variant = DiscountTimerVariant.Simple,
  ...props
}: DiscountTimerProps): ReactElement {
  const { timeLeft, sanitizedMessage } = useDiscountTimer(props);
  const isWithSlot = variant === DiscountTimerVariant.WithSlot;

  return (
    <div
      className={classNames(
        'flex flex-row items-center gap-6 bg-background-default px-4 py-2',
        'tablet:relative tablet:left-1/2 tablet:min-w-[100dvw] tablet:-translate-x-1/2 tablet:justify-center',
        !isWithSlot && 'text-text-primary',
        className,
      )}
      data-testid="discount-timer-container"
    >
      <ConditionalWrapper
        condition={isWithSlot}
        wrapper={(content) => (
          <div className="flex flex-1 items-center justify-between gap-2 tablet:max-w-md">
            <div className="flex-1">{content}</div>
            {children}
          </div>
        )}
      >
        <p
          className={classNames(
            'min-w-0 max-w-full flex-1 tablet:max-w-70',
            isWithSlot ? 'typo-footnote' : 'typo-callout',
          )}
          dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
          data-testid="discount-message"
        />
        <div
          className={classNames(
            'font-bold tabular-nums',
            isWithSlot
              ? 'typo-title1'
              : 'inline-flex h-8 w-[4.75rem] items-center justify-center rounded-8 border border-status-success typo-title3',
          )}
          data-testid="timer-display"
        >
          {formatTime(timeLeft)}
        </div>
      </ConditionalWrapper>
    </div>
  );
}

export function DiscountTimerReminder({
  className,
  ...props
}: Omit<DiscountTimerProps, 'variant'>): ReactElement {
  const { timeLeft, sanitizedMessage } = useDiscountTimer(props);
  return (
    <div
      className={classNames(
        'flex items-center justify-center gap-2 rounded-12 bg-action-plus-float px-4 py-2 text-center text-action-plus-default typo-callout',
        className,
      )}
      data-testid="mini-discount-timer-container"
    >
      <TimerIcon aria-hidden />
      <span
        className="font-bold typo-callout"
        data-testid="mini-discount-timer"
      >
        {sanitizedMessage}{' '}
        <span className="tabular-nums">{formatTime(timeLeft)}</span> min
      </span>
    </div>
  );
}
