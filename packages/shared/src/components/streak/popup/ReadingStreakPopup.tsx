import React, { ReactElement } from 'react';
import { Button, ButtonVariant } from '../../buttons/ButtonV2';
import { StreakSection } from './StreakSection';
import { DayStreak, Streak } from './DayStreak';
import { ButtonSize } from '../../buttons/Button';

const today = new Date();
const days = 9;
const list = Array.from<number>({ length: days }).fill(1);

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
          <DayStreak key={value} streak={getStreak(index)} day={index} />
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
