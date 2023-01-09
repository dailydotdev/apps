import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Comment, getCommentHash } from '../../graphql/comments';
import { CommentBox, CommentContainer, CommentPublishDate } from './common';
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
import { Origin } from '../../lib/analytics';
import { Post } from '../../graphql/posts';
import EnableNotification from '../notifications/EnableNotification';
import { NotificationPromptSource } from '../../hooks/useEnableNotification';

export interface Props extends CommentActionProps {
  post: Post;
  comment: Comment;
  origin: Origin;
  postAuthorId: string | null;
  postScoutId: string | null;
  commentHash?: string;
  commentRef?: React.MutableRefObject<HTMLElement>;
  className?: string;
  permissionNotificationCommentId?: string;
  appendTooltipTo?: () => HTMLElement;
}

const MainCommentBox = classed(CommentBox, 'my-2 py-2');

export default function MainComment({
  post,
  comment,
  origin,
  commentHash,
  commentRef,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onShowUpvotes,
  appendTooltipTo,
  className,
  postAuthorId,
  postScoutId,
  permissionNotificationCommentId,
}: Props): ReactElement {
  return (
    <section
      className="flex flex-col items-stretch mt-2 scroll-mt-16"
      ref={commentHash === getCommentHash(comment.id) ? commentRef : null}
      data-testid="comment"
    >
      <CommentContainer className={classNames('flex-col', className)}>
        <div className="flex items-center px-3">
          <ProfileTooltip
            user={comment.author}
            tooltip={{ appendTo: appendTooltipTo }}
          >
            <ProfileImageLink user={comment.author} />
          </ProfileTooltip>
          <div className="flex flex-col ml-4">
            <div className="flex">
              <CommentAuthor
                postAuthorId={postAuthorId}
                author={comment.author}
                appendTooltipTo={appendTooltipTo}
              />
              {comment.author?.id === postScoutId && <ScoutBadge />}
            </div>
            <CommentPublishDate comment={comment} />
          </div>
        </div>
        <MainCommentBox
          className={classNames(
            'px-3',
            commentHash === getCommentHash(comment.id) &&
              'border border-theme-color-cabbage rounded-8',
          )}
        >
          <Markdown
            content={comment.contentHtml}
            appendTooltipTo={appendTooltipTo}
          />
        </MainCommentBox>
        <CommentActionButtons
          post={post}
          comment={comment}
          origin={origin}
          parentId={comment.id}
          onShare={onShare}
          onComment={onComment}
          onDelete={onDelete}
          onEdit={onEdit}
          onShowUpvotes={onShowUpvotes}
          className="ml-2"
        />
      </CommentContainer>
      {comment.children?.edges.map((e, i) => (
        <SubComment
          post={post}
          origin={origin}
          commentHash={commentHash}
          commentRef={commentRef}
          comment={e.node}
          parentComment={comment}
          key={e.node.id}
          firstComment={i === 0}
          lastComment={i === comment.children.edges.length - 1}
          onComment={onComment}
          onShare={onShare}
          onDelete={onDelete}
          onEdit={(childComment) => onEdit(childComment, comment)}
          onShowUpvotes={onShowUpvotes}
          postAuthorId={postAuthorId}
          postScoutId={postScoutId}
          appendTooltipTo={appendTooltipTo}
          permissionNotificationCommentId={permissionNotificationCommentId}
        />
      ))}
      {permissionNotificationCommentId === comment.id && (
        <EnableNotification source={NotificationPromptSource.NewComment} />
      )}
    </section>
  );
}
