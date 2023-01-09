import React, { ReactElement } from 'react';
import classed from '../../lib/classed';
import { Comment } from '../../graphql/comments';
import { commentDateFormat } from '../../lib/dateFormat';

export function CommentPublishDate({
  comment,
}: {
  comment: Comment;
}): ReactElement {
  const edited = !!comment.lastUpdatedAt;
  const date = edited ? comment.lastUpdatedAt : comment.createdAt;
  return (
    <time dateTime={date} className="text-theme-label-tertiary typo-callout">
      {`${edited ? 'Modified ' : ''}${commentDateFormat(date)}`}
    </time>
  );
}

export const commentBoxClassNames =
  'rounded-lg break-words-overflow typo-callout';

export const CommentBox = classed('div', commentBoxClassNames);
