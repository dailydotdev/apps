import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import createDOMPurify from 'dompurify';
import { addMinutes } from 'date-fns';
import useTimer from '../../../hooks/useTimer';

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
}

const calculateTimeLeft = (
  startDate: Date,
  durationInMinutes: number,
): number => {
  const now = new Date();
  const endTime = addMinutes(startDate, durationInMinutes);
  return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
};

/**
 * Sanitizes HTML string and allows only bold tags
 */
const sanitizeMessage = (message: string): string => {
  // Only run on client-side
  if (typeof window === 'undefined') {
    return message;
  }

  const purify = createDOMPurify(window);

  // Configure DOMPurify to only allow <b> and <strong> tags
  return purify.sanitize(message, {
    ALLOWED_TAGS: ['b', 'strong'],
    ALLOWED_ATTR: [],
  });
};

export function DiscountTimer({
  discountMessage,
  durationInMinutes,
  startDate = new Date(),
  className,
  onTimerEnd,
}: DiscountTimerProps): ReactElement {
  const { timer: timeLeft } = useTimer(
    onTimerEnd,
    calculateTimeLeft(startDate, durationInMinutes),
  );

  const sanitizedMessage = useMemo(
    () => sanitizeMessage(discountMessage),
    [discountMessage],
  );

  return (
    <div
      className={classNames(
        'flex flex-row items-center gap-6 bg-background-default px-4 py-2',
        className,
      )}
      data-testid="discount-timer-container"
    >
      <p
        className="flex-1 text-text-primary typo-callout"
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
