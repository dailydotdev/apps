import React, { ReactElement } from 'react';
import { Comment } from '../../graphql/comments';
import { CommentBox, CommentPublishDate } from './common';
import CommentActionButtons from './CommentActionButtons';
import SubComment from './SubComment';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import CommentAuthor from './CommentAuthor';
import classed from '../../lib/classed';

export interface Props {
  comment: Comment;
  postAuthorId: string | null;
  onComment: (comment: Comment, parentId: string | null) => void;
  onDelete: (comment: Comment, parentId: string | null) => void;
  onEdit: (comment: Comment, parentComment?: Comment) => void;
}

const MainCommentBox = classed(CommentBox, 'my-2');

export default function MainComment({
  comment,
  onComment,
  onDelete,
  onEdit,
  postAuthorId,
}: Props): ReactElement {
  return (
    <article className="flex flex-col items-stretch mt-4" data-testid="comment">
      <div className="flex items-center">
        <ProfileImageLink user={comment.author} />
        <div className="flex flex-col ml-2">
          <CommentAuthor postAuthorId={postAuthorId} author={comment.author} />
          <CommentPublishDate comment={comment} />
        </div>
      </div>
      <MainCommentBox>{comment.content}</MainCommentBox>
      <CommentActionButtons
        comment={comment}
        parentId={comment.id}
        onComment={onComment}
        onDelete={onDelete}
        onEdit={onEdit}
      />
      {comment.children?.edges.map((e, i) => (
        <SubComment
          comment={e.node}
          key={e.node.id}
          firstComment={i === 0}
          lastComment={i === comment.children.edges.length - 1}
          parentId={comment.id}
          onComment={onComment}
          onDelete={onDelete}
          onEdit={(childComment) => onEdit(childComment, comment)}
          postAuthorId={postAuthorId}
        />
      ))}
    </article>
  );
}
