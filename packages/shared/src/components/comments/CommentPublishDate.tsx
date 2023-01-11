import React, { ReactElement } from 'react';
import classNames from 'classnames';
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
    <time dateTime={date} className={classNames('typo-callout', className)}>
      {`${edited ? 'Modified ' : ''}${commentDateFormat(date)}`}
    </time>
  );
}
