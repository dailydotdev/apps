import React, { ReactElement, useContext } from 'react';
import { Comment, getCommentHash } from '../../graphql/comments';
import { CommentBox, CommentPublishDate } from './common';
import CommentActionButtons, {
  CommentActionProps,
} from './CommentActionButtons';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import CommentAuthor from './CommentAuthor';
import Markdown from '../Markdown';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import ScoutBadge from './ScoutBadge';
import { Post } from '../../graphql/posts';
import { Origin } from '../../lib/analytics';
import EnableNotification from '../notifications/EnableNotification';
import AuthContext from '../../contexts/AuthContext';
import { NotificationPromptSource } from '../../hooks/useEnableNotification';

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

export default function SubComment({
  post,
  comment,
  origin,
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
      className="flex flex-row items-start mt-6 scroll-mt-16"
      data-testid="subcomment"
      ref={commentHash === getCommentHash(comment.id) ? commentRef : null}
    >
      <ProfileTooltip
        user={comment.author}
        tooltip={{ appendTo: appendTooltipTo }}
      >
        <ProfileImageLink user={comment.author} />
      </ProfileTooltip>
      <div className="flex flex-col flex-1 ml-2">
        <CommentBox
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
          <div className="my-4">
            <Markdown
              content={comment.contentHtml}
              appendTooltipTo={appendTooltipTo}
            />
          </div>
        </CommentBox>
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
