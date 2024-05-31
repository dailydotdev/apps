import React, { ReactElement } from 'react';
import { ActivityContainer, ActivitySectionHeader } from './ActivitySection';
import { ReadingStreakIcon } from '../icons';
import { useReadingStreak } from '../../hooks/streaks';

interface StreakTagProps {
  streak: number;
  title: string;
  isLoading: boolean;
}
const StreakTag = ({ streak, title, isLoading }: StreakTagProps) => {
  return (
    <div className="relative flex h-[4.25rem] w-[10.125rem] flex-col rounded-10 border border-background-subtle p-3">
      {!isLoading && (
        <>
          <strong className="typo-title3">{streak}</strong>
          <p className="text-text-quaternary typo-subhead">{title}</p>
        </>
      )}
    </div>
  );
};

export function ReadingStreaksWidget(): ReactElement {
  const { streak, isLoading } = useReadingStreak();

  return (
    <ActivityContainer>
      <ActivitySectionHeader title="Reading streaks" Icon={ReadingStreakIcon} />
      <div className="flex gap-5">
        <StreakTag
          streak={streak?.max}
          title="Longest streak 🏆"
          isLoading={isLoading}
        />
        <StreakTag
          streak={streak?.total}
          title="Total reading days"
          isLoading={isLoading}
        />
      </div>
    </ActivityContainer>
  );
}
