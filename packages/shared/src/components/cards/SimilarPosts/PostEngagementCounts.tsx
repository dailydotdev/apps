import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { singleLineClamp } from '../../utilities';
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
      className={classNames('typo-footnote', singleLineClamp, className)}
      data-testid="post-engagements-count"
    >
      {upvotes ? `${upvotes} Upvotes` : ''}
      {upvotes && comments ? <> {separatorCharacter} </> : ''}
      {comments ? `${comments} Comments` : ''}
    </p>
  );
}
