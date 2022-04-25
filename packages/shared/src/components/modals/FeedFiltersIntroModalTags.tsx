import React, { ReactElement } from 'react';
import { FeedFiltersIntroModalTagPill } from '../utilities';

const RankTagItem = ({ tag }): ReactElement => {
  const isPlaceholder = !tag.length;
  const className = isPlaceholder
    ? 'flex-1 rounded-10 bg-theme-float'
    : 'flex-shrink w-auto bg-theme-label-disabled';

  return (
    <FeedFiltersIntroModalTagPill className={className}>
      {isPlaceholder ? '' : `#${tag}`}
    </FeedFiltersIntroModalTagPill>
  );
};
export default RankTagItem;
