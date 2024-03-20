import React, { ReactElement } from 'react';
import { SquadTitle, SquadTitleColor } from '../../squads/utils';

interface ReadingHistoryTitleProps {
  hasNoData: boolean;
}

export function ReadingHistoryTitle({
  hasNoData,
}: ReadingHistoryTitleProps): ReactElement {
  return (
    <>
      <SquadTitle className="hidden tablet:block">
        {hasNoData ? 'Read' : 'Share'} <SquadTitleColor>a post</SquadTitleColor>
      </SquadTitle>
      <p className="py-4 text-center">
        {hasNoData
          ? 'Your reading history is empty! Please read at least one post by clicking on a post to start sharing with your Squad.'
          : 'Pick a post that you would like to discuss with your Squad members.'}
      </p>
    </>
  );
}
