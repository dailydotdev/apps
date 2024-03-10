import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { singleLineClamp } from '../../utilities';

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
    <p className={classNames('typo-footnote', singleLineClamp, className)}>
      {upvotes ? `${upvotes} Upvotes` : ''}
      {upvotes && comments ? <> &#x2022; </> : ''}
      {comments ? `${comments} Comments` : ''}
    </p>
  );
}
