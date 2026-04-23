import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getFirstName } from '../../../lib/user';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { summarizeWeek, useFocusHistory } from '../store/focusHistory.store';

export const getTimeSalutation = (date: Date = new Date()): string => {
  const hour = date.getHours();
  if (hour < 5) {
    return 'Still up';
  }
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
};

export const formatFocusDuration = (totalMinutes: number): string => {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
};

interface ZenGreetingProps {
  className?: string;
}

export const ZenGreeting = ({ className }: ZenGreetingProps): ReactElement => {
  const { user } = useAuthContext();
  const { entries } = useFocusHistory();
  const firstName = useMemo(
    () => (user?.name ? getFirstName(user.name) : undefined),
    [user?.name],
  );

  const weekSummary = useMemo(() => summarizeWeek(entries), [entries]);

  const title = firstName
    ? `${getTimeSalutation()}, ${firstName}.`
    : `${getTimeSalutation()}.`;

  return (
    <div className={classNames('flex flex-col items-center gap-1', className)}>
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.LargeTitle}
        bold
        className="text-balance text-center"
      >
        {title}
      </Typography>
      {weekSummary.sessions > 0 ? (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          You&apos;ve focused for{' '}
          {formatFocusDuration(weekSummary.totalMinutes)} this week &middot;{' '}
          {weekSummary.sessions === 1
            ? '1 session'
            : `${weekSummary.sessions} sessions`}
          .
        </Typography>
      ) : null}
    </div>
  );
};
