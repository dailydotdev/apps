import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Comment } from '../../graphql/comments';
import { CommentBox, CommentPublishDate } from './common';
import CommentActionButtons, {
  CommentActionProps,
} from './CommentActionButtons';
import SubComment from './SubComment';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import CommentAuthor from './CommentAuthor';
import classed from '../../lib/classed';
import Markdown from '../Markdown';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import ScoutBadge from './ScoutBadge';

export interface Props extends CommentActionProps {
  comment: Comment;
  postAuthorId: string | null;
  className?: string;
  appendTooltipTo?: () => HTMLElement;
}

const MainCommentBox = classed(CommentBox, 'my-2');

export default function MainComment({
  comment,
  onComment,
  onDelete,
  onEdit,
  onShowUpvotes,
  appendTooltipTo,
  className,
  postAuthorId,
}: Props): ReactElement {
  return (
    <article
      className={classNames('flex flex-col items-stretch mt-4', className)}
      data-testid="comment"
    >
      <div className="flex items-center">
        <ProfileTooltip
          user={comment.author}
          tooltip={{ appendTo: appendTooltipTo }}
        >
          <ProfileImageLink user={comment.author} />
        </ProfileTooltip>
        <div className="flex flex-col ml-2">
          <div className="flex">
            <CommentAuthor
            postAuthorId={postAuthorId}
            author={comment.author}
            appendTooltipTo={appendTooltipTo}
          />
            <ScoutBadge />
          </div>
          <CommentPublishDate comment={comment} />
        </div>
      </div>
      <MainCommentBox>
        <Markdown content={comment.contentHtml} />
      </MainCommentBox>
      <CommentActionButtons
        comment={comment}
        parentId={comment.id}
        onComment={onComment}
        onDelete={onDelete}
        onEdit={onEdit}
        onShowUpvotes={onShowUpvotes}
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
          onShowUpvotes={onShowUpvotes}
          postAuthorId={postAuthorId}
          appendTooltipTo={appendTooltipTo}
        />
      ))}
    </article>
  );
}
