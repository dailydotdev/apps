import React, { ReactElement } from 'react';
import { addDays, subDays } from 'date-fns';
import { Button, ButtonVariant } from '../../buttons/ButtonV2';
import { StreakSection } from './StreakSection';
import { DayStreak, Streak } from './DayStreak';
import { ButtonSize } from '../../buttons/Button';

const today = new Date();
const list = [
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
  // this is just a dummy logic to simulate the popup with different values
  const getStreak = (index: number) => {
    const day = today.getDay();
    if (index === day) {
      return Streak.Pending;
    }

    if (day > index) {
      return Streak.Completed;
    }

    if (index === 6 || index === 7) {
      return Streak.Freeze;
    }

    return Streak.Upcoming;
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <StreakSection streak={44} label="Current streak" />
        <StreakSection streak={100} label="Longest streak 🏆" />
      </div>
      <div className="mt-6 flex flex-row gap-2">
        {list.map((value, index) => (
          <DayStreak
            key={value.getTime()}
            streak={getStreak(index)}
            day={index}
            shouldShowArrow={value.getDate() === today.getDate()}
          />
        ))}
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
