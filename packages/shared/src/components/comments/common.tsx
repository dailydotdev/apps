import React, { HTMLAttributes, ReactElement } from 'react';
import Linkify from 'linkifyjs/react';
import classed from '../../lib/classed';
import styles from './comments.module.css';
import { Comment } from '../../graphql/comments';
import { commentDateFormat } from '../../lib/dateFormat';

export const unqiueAuthors = (comments: Comment[]): Comment[] =>
  comments.filter(
    (comment, i) =>
      comments.findIndex(
        (matchComment) =>
          matchComment?.author?.username === comment?.author?.username,
      ) === i,
  );

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

export const commentBoxClassNames = `py-3 px-4 bg-theme-bg-secondary rounded-lg whitespace-pre-wrap break-words typo-callout ${styles.commentBox}`;

const StyledLinkfy = classed(Linkify, commentBoxClassNames);

export const CommentBox = (
  props: HTMLAttributes<HTMLDivElement>,
): ReactElement => (
  <StyledLinkfy
    tagName="div"
    options={{ attributes: { rel: 'noopener nofollow' } }}
    {...props}
  />
);
