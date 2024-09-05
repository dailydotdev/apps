import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { largeNumberFormat } from '../../../lib';
import { separatorCharacter } from '../common';

interface PostEngagementCountsProps {
  upvotes: number;
  comments: number;
  className?: string;
}

export function PostEngagementCounts({
  upvotes,
  comments,
  className,
}: PostEngagementCountsProps): ReactElement {
  return (
    <p
      className={classNames('truncate typo-footnote', className)}
      data-testid="post-engagements-count"
    >
      {upvotes ? `${largeNumberFormat(upvotes)} Upvotes` : ''}
      {upvotes && comments ? <> {separatorCharacter} </> : ''}
      {comments ? `${largeNumberFormat(comments)} Comments` : ''}
    </p>
  );
}
