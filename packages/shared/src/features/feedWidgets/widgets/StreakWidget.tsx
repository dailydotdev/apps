import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { webappUrl } from '../../../lib/constants';
import { useStreakRingState } from '../../../hooks/streaks/useStreakRingState';
import { StreakMonthCalendar } from '../../../components/streak/popup/StreakMonthCalendar';
import { StreakFreezeRow } from '../../../components/streak/popup/StreakFreezeRow';
import { ReadingStreakIcon } from '../../../components/icons/ReadingStreak';
import { IconSize } from '../../../components/Icon';
import Link from '../../../components/utilities/Link';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';

// Where the sidebar's streak tab and the You page send readers.
const gameCenterUrl = `${webappUrl}game-center`;

/**
 * The reader's reading streak, from the same streak query and state machine
 * the sidebar's streak tab uses: the count and today's status at every size,
 * then the 30-day calendar and the freeze balance once there is room.
 */
export const StreakWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.Streak>): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const {
    isEnabled,
    isLoading,
    streak,
    count,
    hasReadToday,
    countClassName,
    copy,
  } = useStreakRingState();

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

  const summary = (
    <Link href={gameCenterUrl} passHref>
      <a
        href={gameCenterUrl}
        onClick={onClick}
        aria-label={`${count}-day reading streak, open Game Center`}
        className={classNames(
          'flex min-w-0 flex-col px-4',
          (isSmall || isLarge) && 'flex-1',
        )}
      >
        <span className="flex items-center gap-2">
          <ReadingStreakIcon
            secondary={hasReadToday}
            size={IconSize.Large}
            className={countClassName}
          />
          <span className="font-bold tabular-nums text-text-primary typo-title1">
            {count}
          </span>
        </span>
        <span className="mt-1 tabular-nums text-text-tertiary typo-footnote">
          {streak.max} Longest · {streak.total} Total
        </span>
        <span
          className={classNames(
            'mt-auto pt-3 text-text-secondary typo-callout',
            isSmall ? 'line-clamp-2' : 'line-clamp-3',
          )}
        >
          {hasReadToday ? 'Read today, your streak is safe.' : copy}
        </span>
      </a>
    </Link>
  );

  if (isSmall) {
    return summary;
  }

  const details = (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="px-4 pt-4">
        <StreakMonthCalendar streak={streak} />
      </div>
      <StreakFreezeRow variant="panel" />
    </div>
  );

  if (isLarge) {
    return (
      <div className="flex min-h-0 flex-1 flex-row" data-size={size}>
        {summary}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {details}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col justify-between"
      data-size={size}
    >
      {summary}
      {details}
    </div>
  );
};
