import React, { ReactElement } from 'react';
import { addDays, subDays } from 'date-fns';
import { Button, ButtonVariant } from '../../buttons/ButtonV2';
import { StreakSection } from './StreakSection';
import { DayStreak, Streak } from './DayStreak';
import { ButtonSize } from '../../buttons/Button';

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

export function ReadingStreakPopup(): ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <StreakSection streak={44} label="Current streak" />
        <StreakSection streak={100} label="Longest streak 🏆" />
      </div>
      <div className="mt-6 flex flex-row gap-2">
        {streakDays.map((value) => {
          const day = value.getDay();
          const date = value.getDate();

          // this is just a dummy logic to simulate the popup with different values
          const getStreak = () => {
            if (date === dateToday) {
              return Streak.Pending;
            }

            if (day === 0 || day === 6) {
              return Streak.Freeze;
            }

            if (dateToday > date) {
              return Streak.Completed;
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
        })}
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        className="mt-4"
      >
        Total reading days: 44
      </Button>
    </div>
  );
}
