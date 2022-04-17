import React, { ReactElement } from 'react';
import { CreateMyFeedModalTagPill } from '../utilities';

const RankTagItem = ({ tag }): ReactElement => {
  const isPlaceholder = !tag.length;
  const className = isPlaceholder
    ? 'flex-1 rounded-10 bg-theme-float'
    : 'flex-shrink w-auto bg-theme-label-disabled';

  return (
    <CreateMyFeedModalTagPill className={className}>
      {isPlaceholder ? '' : `#${tag}`}
    </CreateMyFeedModalTagPill>
  );
};
export default RankTagItem;
