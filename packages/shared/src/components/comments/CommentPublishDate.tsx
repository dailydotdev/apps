import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Comment } from '../../graphql/comments';
import { TimeFormatType } from '../../lib/dateFormat';
import { DateFormat } from '../utilities';

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
    <DateFormat
      date={date}
      type={TimeFormatType.Comment}
      className={classNames('typo-callout', className)}
      prefix={edited ? 'Modified ' : ''}
    />
  );
}
