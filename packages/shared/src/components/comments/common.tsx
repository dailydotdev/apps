import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { Comment } from '../../graphql/comments';
import { commentDateFormat } from '../../lib/dateFormat';

interface CommentPublishDateProps {
  comment: Comment;
  className?: string;
}

export function CommentPublishDate({
  comment,
  className,
}: CommentPublishDateProps): ReactElement {
  const edited = !!comment.lastUpdatedAt;
  const date = edited ? comment.lastUpdatedAt : comment.createdAt;
  return (
    <time
      dateTime={date}
      className={classNames(
        'text-theme-label-tertiary typo-callout',
        className,
      )}
    >
      {`${edited ? 'Modified ' : ''}${commentDateFormat(date)}`}
    </time>
  );
}

export const CommentContainer = classed('article', 'flex px-3 py-2 rounded-16');

export const commentBoxClassNames =
  'rounded-lg break-words-overflow typo-callout';
export const CommentBox = classed('div', commentBoxClassNames);
