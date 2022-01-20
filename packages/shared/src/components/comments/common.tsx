import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';
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
  'py-3 px-4 bg-theme-bg-secondary rounded-lg break-words-overflow typo-callout';

const StyledCommentBox = classed('div', commentBoxClassNames);

export const CommentBox = ({
  children,
  ...props
}: {
  children?: ReactNode;
  props?: HTMLAttributes<HTMLDivElement>;
}): ReactElement => {
  return <StyledCommentBox {...props}>{children}</StyledCommentBox>;
};
