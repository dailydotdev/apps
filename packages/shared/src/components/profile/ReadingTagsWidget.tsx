import React, { ReactElement } from 'react';
import { MostReadTag } from '../../graphql/users';
import { ActivityContainer, ActivitySectionHeader } from './ActivitySection';
import { weeklyGoal } from '../../lib/constants';
import { ReadingTagProgress } from './ReadingTagProgress';

export interface ReadingTagsWidgetProps {
  mostReadTags: MostReadTag[];
}

export function ReadingTagsWidget({
  mostReadTags,
}: ReadingTagsWidgetProps): ReactElement {
  return (
    <ActivityContainer>
      <ActivitySectionHeader
        title="Top tags by reading days"
        subtitle="Learn how we count"
        clickableTitle="top tags"
        link={weeklyGoal}
      />
      <div className="grid max-w-[17rem] grid-cols-1 gap-3 tablet:max-w-full tablet:grid-cols-2 tablet:gap-x-10">
        {mostReadTags?.map((tag) => (
          <ReadingTagProgress key={tag.value} tag={tag} />
        ))}
      </div>
    </ActivityContainer>
  );
}
