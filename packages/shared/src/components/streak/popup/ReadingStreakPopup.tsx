import React, { ReactElement, useEffect, useMemo } from 'react';
import { addDays, isSameDay, subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { StreakSection } from './StreakSection';
import { DayStreak, Streak } from './DayStreak';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import {
  getReadingStreak30Days,
  ReadingDay,
  UserStreak,
} from '../../../graphql/users';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Weekends } from '../../../lib/dateFormat';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { Button, ButtonVariant } from '../../buttons/Button';
import { SettingsIcon } from '../../icons';
import StreakReminderSwitch from '../StreakReminderSwitch';
import ReadingStreakSwitch from '../ReadingStreakSwitch';
import { useToggle } from '../../../hooks/useToggle';

const getStreak = ({
  value,
  today,
  dateToday,
  history,
}: {
  value: Date;
  today: Date;
  dateToday: number;
  history?: ReadingDay[];
}): Streak => {
  const day = value.getDay();
  const date = value.getDate();
  const isFreezeDay = Weekends.includes(day);
  const isToday = date === dateToday;
  const isFuture = value > today;
  const isCompleted =
    !isFuture &&
    history?.some(({ date: historyDate, reads }) => {
      const dateToCompare = new Date(historyDate);
      const sameDate = isSameDay(dateToCompare, value);

      return sameDate && reads > 0;
    });

  if (isCompleted) {
    return Streak.Completed;
  }

  if (isFreezeDay) {
    return Streak.Freeze;
  }

  if (isToday) {
    return Streak.Pending;
  }

  return Streak.Upcoming;
};

const getStreakDays = (today: Date) => {
  return [
    subDays(today, 4),
    subDays(today, 3),
    subDays(today, 2),
    subDays(today, 1),
    today,
    addDays(today, 1),
    addDays(today, 2),
    addDays(today, 3),
    addDays(today, 4),
  ]; // these dates will then be compared to the user's post views
};

interface ReadingStreakPopupProps {
  streak: UserStreak;
  fullWidth?: boolean;
}

export function ReadingStreakPopup({
  streak,
  fullWidth,
}: ReadingStreakPopupProps): ReactElement {
  const { user } = useAuthContext();
  const { completeAction } = useActions();
  const { data: history } = useQuery<ReadingDay[]>(
    generateQueryKey(RequestKey.ReadingStreak30Days, user),
    () => getReadingStreak30Days(user.id),
    { staleTime: StaleTime.Default },
  );
  const [showStreakConfig, toggleShowStreakConfig] = useToggle(false);

  const dateToday = new Date().getDate();

  const streaks = useMemo(() => {
    const today = new Date();
    const streakDays = getStreakDays(today);

    return streakDays.map((value) => {
      const isToday = value.getDate() === dateToday;
      const streakDef = getStreak({ value, today, dateToday, history });

      return (
        <DayStreak
          key={value.getTime()}
          streak={streakDef}
          day={value.getDay()}
          shouldShowArrow={isToday}
          onClick={() => toggleShowStreakConfig()}
        />
      );
    });
  }, [dateToday, history, toggleShowStreakConfig]);

  useEffect(() => {
    if ([streak.max, streak.current].some((value) => value >= 2)) {
      completeAction(ActionType.StreakMilestone);
    }
  }, [completeAction, streak]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col-reverse p-4 tablet:flex-col">
        <div>
          <div className="flex flex-row">
            <StreakSection streak={streak.current} label="Current streak" />
            <StreakSection streak={streak.max} label="Longest streak 🏆" />
          </div>
          <div
            className={classNames(
              'mt-6 flex flex-row gap-2',
              fullWidth && 'justify-between',
            )}
          >
            {streaks}
          </div>
          <div className="mt-4 flex items-center">
            <div className="font-bold text-text-tertiary">
              Total reading days: {streak.total}
            </div>
            <Button
              onClick={() => toggleShowStreakConfig()}
              variant={ButtonVariant.Float}
              pressed={showStreakConfig}
              icon={<SettingsIcon />}
              className="ml-auto"
            />
          </div>
        </div>
      </div>
      {showStreakConfig && (
        <div className="flex flex-col gap-5 border-t border-border-subtlest-tertiary p-4">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-text-secondary typo-subhead">
              General
            </p>
            <StreakReminderSwitch />
            <ReadingStreakSwitch />
          </div>
        </div>
      )}
    </div>
  );
}
