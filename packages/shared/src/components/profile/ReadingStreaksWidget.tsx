import React, { ReactElement } from 'react';
import { ActivityContainer, ActivitySectionHeader } from './ActivitySection';
import { ReadingStreakIcon } from '../icons';

export function ReadingStreaksWidget(): ReactElement {
  return (
    <ActivityContainer>
      <ActivitySectionHeader title="Reading streaks" Icon={ReadingStreakIcon} />
    </ActivityContainer>
  );
}
