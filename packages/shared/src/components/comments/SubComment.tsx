import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Comment, getCommentHash } from '../../graphql/comments';
import { CommentBox, CommentPublishDate } from './common';
import CommentActionButtons, {
  CommentActionProps,
} from './CommentActionButtons';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import CommentAuthor from './CommentAuthor';
import classed from '../../lib/classed';
import Markdown from '../Markdown';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import ScoutBadge from './ScoutBadge';
import { Post } from '../../graphql/posts';
import { Origin } from '../../lib/analytics';

export interface Props extends CommentActionProps {
  post: Post;
  comment: Comment;
  origin: Origin;
  firstComment: boolean;
  lastComment: boolean;
  parentId: string;
  postAuthorId: string | null;
  postScoutId: string | null;
  commentHash?: string;
  commentRef?: React.MutableRefObject<HTMLElement>;
  appendTooltipTo?: () => HTMLElement;
}

const SubCommentBox = classed(CommentBox, 'mb-1');

export default function SubComment({
  post,
  comment,
  origin,
  firstComment,
  lastComment,
  parentId,
  commentHash,
  commentRef,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onShowUpvotes,
  appendTooltipTo,
  postAuthorId,
  postScoutId,
}: Props): ReactElement {
  return (
    <article
      className="flex items-stretch mt-4 scroll-mt-16"
      data-testid="subcomment"
      ref={commentHash === getCommentHash(comment.id) ? commentRef : null}
    >
      <div className="relative">
        <div
          data-testid="timeline"
          className={classNames(
            'absolute inset-x-0 w-px mx-auto bg-theme-divider-tertiary',
            firstComment ? 'top-0' : '-top-4',
            lastComment ? 'h-4' : 'bottom-0',
          )}
        />
        <ProfileTooltip
          user={comment.author}
          tooltip={{ appendTo: appendTooltipTo }}
        >
          <ProfileImageLink
            user={comment.author}
            picture={{ size: 'medium' }}
          />
        </ProfileTooltip>
      </div>
      <div className="flex flex-col flex-1 items-stretch ml-2">
        <SubCommentBox>
          <div className="flex">
            <CommentAuthor
              postAuthorId={postAuthorId}
              author={comment.author}
              appendTooltipTo={appendTooltipTo}
            />
            {comment.author?.id === postScoutId && <ScoutBadge />}
          </div>
          <CommentPublishDate comment={comment} />
          <div className="mt-2">
            <Markdown content={comment.contentHtml} />
          </div>
        </SubCommentBox>
        <CommentActionButtons
          post={post}
          origin={origin}
          comment={comment}
          parentId={parentId}
          onComment={onComment}
          onShare={onShare}
          onDelete={onDelete}
          onEdit={onEdit}
          onShowUpvotes={onShowUpvotes}
        />
      </div>
    </article>
  );
}
