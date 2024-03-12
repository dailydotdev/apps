import React, { ReactElement } from 'react';
import classNames from 'classnames';
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
      {upvotes ? `${upvotes} Upvotes` : ''}
      {upvotes && comments ? <> {separatorCharacter} </> : ''}
      {comments ? `${comments} Comments` : ''}
    </p>
  );
}
