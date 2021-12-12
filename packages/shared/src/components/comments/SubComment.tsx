import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Comment } from '../../graphql/comments';
import { CommentBox, CommentPublishDate } from './common';
import CommentActionButtons, {
  CommentActionProps,
} from './CommentActionButtons';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import CommentAuthor from './CommentAuthor';
import classed from '../../lib/classed';
import Markdown from '../Markdown';
import { ProfileTooltip } from '../profile/ProfileTooltip';

export interface Props extends CommentActionProps {
  comment: Comment;
  firstComment: boolean;
  lastComment: boolean;
  parentId: string;
  postAuthorId: string | null;
}

const SubCommentBox = classed(CommentBox, 'mb-1');

export default function SubComment({
  comment,
  firstComment,
  lastComment,
  parentId,
  onComment,
  onDelete,
  onEdit,
  onShowUpvotes,
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
        <ProfileTooltip user={comment.author}>
          <ProfileImageLink
            user={comment.author}
            picture={{ size: 'medium' }}
          />
        </ProfileTooltip>
      </div>
      <div className="flex flex-col flex-1 items-stretch ml-2">
        <SubCommentBox>
          <CommentAuthor postAuthorId={postAuthorId} author={comment.author} />
          <CommentPublishDate comment={comment} />
          <div className="mt-2">
            <Markdown content={comment.contentHtml} />
          </div>
        </SubCommentBox>
        <CommentActionButtons
          comment={comment}
          parentId={parentId}
          onComment={onComment}
          onDelete={onDelete}
          onEdit={onEdit}
          onShowUpvotes={onShowUpvotes}
        />
      </div>
    </article>
  );
}
