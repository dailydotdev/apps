import React, { ReactElement, useMemo, useState } from 'react';
import { addDays, isSameDay, subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { StreakSection } from './StreakSection';
import { DayStreak, Streak } from './DayStreak';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { getReadingStreak30Days, UserStreak } from '../../../graphql/users';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Weekends } from '../../../lib/dateFormat';

const getStreak = ({
  isCompleted,
  isToday,
  isFreezeDay,
}: {
  isCompleted: boolean;
  isToday: boolean;
  isFreezeDay: boolean;
}) => {
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
  const dateToday = today.getDate();
  const streakDays = [
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

  return { dateToday, streakDays };
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
  const [today, setToday] = useState(new Date());
  const { data: history } = useQuery(
    generateQueryKey(RequestKey.ReadingStreak30Days, user),
    () => getReadingStreak30Days(user.id),
    { staleTime: StaleTime.Default },
  );

  // only change today and streakDays if the current day changed to the next one
  if (!isSameDay(new Date(), today)) {
    setToday(new Date());
  }
  const { dateToday, streakDays } = useMemo(
    () => getStreakDays(today),
    [today],
  );

  const streaks = useMemo(
    () =>
      streakDays.map((value) => {
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

        const streakDef = getStreak({ isCompleted, isToday, isFreezeDay });

        return (
          <DayStreak
            key={value.getTime()}
            streak={streakDef}
            day={day}
            shouldShowArrow={date === dateToday}
          />
        );
      }),
    [history, today, dateToday, streakDays],
  );

  return (
    <div className="flex flex-col">
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
      <div className="mt-4 text-center font-bold leading-8 text-text-tertiary">
        Total reading days: {streak.total}
      </div>
    </div>
  );
}
