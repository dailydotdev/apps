import React, { ReactElement } from 'react';
import { Comment } from '../../graphql/comments';
import { CommentBox, CommentPublishDate } from './common';
import { commentDateFormat } from '../../lib/dateFormat';
import CommentActionButtons from './CommentActionButtons';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import CommentAuthor from './CommentAuthor';
import classNames from 'classnames';
import classed from '../../lib/classed';

export interface Props {
  comment: Comment;
  firstComment: boolean;
  lastComment: boolean;
  parentId: string;
  onComment: (comment: Comment, parentId: string | null) => void;
  onDelete: (comment: Comment, parentId: string | null) => void;
  postAuthorId: string | null;
}

const SubCommentBox = classed(CommentBox, 'mb-1');

export default function SubComment({
  comment,
  firstComment,
  lastComment,
  onComment,
  parentId,
  onDelete,
  postAuthorId,
}: Props): ReactElement {
  return (
    <article className="flex items-stretch mt-4" data-testid="subcomment">
      <div className="relative">
        <div
          data-testid="timeline"
          className={classNames(
            'absolute inset-x-0 w-px mx-auto bg-theme-divider-tertiary',
            firstComment ? 'top-0' : '-top-4',
            lastComment ? 'h-4' : 'bottom-0',
          )}
        />
        <ProfileImageLink className="w-8 h-8" user={comment.author} />
      </div>
      <div className="flex flex-col items-stretch flex-1 ml-2">
        <SubCommentBox>
          <CommentAuthor postAuthorId={postAuthorId} author={comment.author} />
          <CommentPublishDate dateTime={comment.createdAt}>
            {commentDateFormat(comment.createdAt)}
          </CommentPublishDate>
          <div className="mt-2">{comment.content}</div>
        </SubCommentBox>
        <CommentActionButtons
          comment={comment}
          parentId={parentId}
          onComment={onComment}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
