import type { ReactElement } from 'react';
import React from 'react';
import type { MostReadTag } from '../../graphql/users';
import { ActivityContainer, ActivitySectionHeader } from './ActivitySection';
import { ReadingTagProgress } from './ReadingTagProgress';

export interface ReadingTagsWidgetProps {
  mostReadTags: MostReadTag[];
}

export function ReadingTagsWidget({
  mostReadTags,
}: ReadingTagsWidgetProps): ReactElement {
  return (
    <ActivityContainer>
      <ActivitySectionHeader title="Top tags by reading days" />
      <div className="grid max-w-[17rem] grid-cols-1 gap-3 tablet:max-w-full tablet:grid-cols-2 tablet:gap-x-10">
        {mostReadTags?.map((tag) => (
          <ReadingTagProgress key={tag.value} tag={tag} />
        ))}
      </div>
    </ActivityContainer>
  );
}
