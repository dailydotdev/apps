import React, { ReactElement, useContext } from 'react';
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
import EnableNotification, {
  NotificationPromptSource,
} from '../notifications/EnableNotification';
import AuthContext from '../../contexts/AuthContext';

export interface Props extends CommentActionProps {
  post: Post;
  comment: Comment;
  origin: Origin;
  firstComment: boolean;
  lastComment: boolean;
  parentComment: Comment;
  postAuthorId: string | null;
  postScoutId: string | null;
  commentHash?: string;
  permissionNotificationCommentId?: string;
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
  parentComment,
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
  permissionNotificationCommentId,
}: Props): ReactElement {
  const { user } = useContext(AuthContext);
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
        <SubCommentBox
          className={
            commentHash === getCommentHash(comment.id) &&
            'border border-theme-color-cabbage'
          }
        >
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
            <Markdown
              content={comment.contentHtml}
              appendTooltipTo={appendTooltipTo}
            />
          </div>
        </SubCommentBox>
        <CommentActionButtons
          post={post}
          origin={origin}
          comment={comment}
          parentId={parentComment.id}
          onComment={onComment}
          onShare={onShare}
          onDelete={onDelete}
          onEdit={onEdit}
          onShowUpvotes={onShowUpvotes}
        />
        {permissionNotificationCommentId === comment.id && (
          <EnableNotification
            parentCommentAuthorName={
              parentComment.author?.id !== user?.id
                ? parentComment.author?.name
                : undefined
            }
            source={NotificationPromptSource.NewComment}
          />
        )}
      </div>
    </article>
  );
}
