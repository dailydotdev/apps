import React, { ReactElement, useMemo } from 'react';
import { addDays, isSameDay, subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { StreakSection } from './StreakSection';
import { DayStreak, Streak } from './DayStreak';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getReadingStreak30Days, UserStreak } from '../../../graphql/users';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Weekends } from '../../../lib/dateFormat';

const today = new Date();
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

interface ReadingStreakPopupProps {
  streak: UserStreak;
}

export function ReadingStreakPopup({
  streak,
}: ReadingStreakPopupProps): ReactElement {
  const { user } = useAuthContext();
  const { data: history } = useQuery(
    generateQueryKey(RequestKey.ReadingStreak30Days, user),
    () => getReadingStreak30Days(user.id),
  );

  const streaks = useMemo(() => {
    return streakDays.map((value) => {
      const day = value.getDay();
      const date = value.getDate();
      const isFuture = value > today;
      const isCompleted =
        !isFuture &&
        history?.some(({ date: historyDate, reads }) => {
          const dateToCompare = new Date(historyDate);
          const sameDate = isSameDay(dateToCompare, value);

          return sameDate && reads > 0;
        });

      const getStreak = () => {
        if (isCompleted) {
          return Streak.Completed;
        }

        if (Weekends.includes(day)) {
          return Streak.Freeze;
        }

        if (date === dateToday) {
          return Streak.Pending;
        }

        return Streak.Upcoming;
      };

      return (
        <DayStreak
          key={value.getTime()}
          streak={getStreak()}
          day={day}
          shouldShowArrow={date === dateToday}
        />
      );
    });
  }, [history]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <StreakSection streak={streak.current} label="Current streak" />
        <StreakSection streak={streak.max} label="Longest streak 🏆" />
      </div>
      <div className="mt-6 flex flex-row gap-2">{streaks}</div>
      <div className="mt-4 rounded-10 font-bold leading-8 text-theme-label-tertiary">
        Total reading days: {streak.total}
      </div>
    </div>
  );
}
