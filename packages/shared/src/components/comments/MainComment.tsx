import React, { ReactElement, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import EnableNotification from '../notifications/EnableNotification';
import CommentBox, { CommentBoxProps } from './CommentBox';
import SubComment from './SubComment';
import AuthContext from '../../contexts/AuthContext';
import { NotificationPromptSource } from '../../lib/analytics';
import { CommentMarkdownInputProps } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useComments } from '../../hooks/post';
import { SquadCommentJoinBanner } from '../squads/SquadCommentJoinBanner';
import { Squad } from '../../graphql/sources';
import { Comment } from '../../graphql/comments';
import usePersistentContext from '../../hooks/usePersistentContext';
import { SQUAD_COMMENT_JOIN_BANNER_KEY } from '../../graphql/squads';
import { useEditCommentProps } from '../../hooks/post/useEditCommentProps';
import CommentInputOrPage from './CommentInputOrPage';

type ClassName = {
  container?: string;
  commentBox?: CommentBoxProps['className'];
};

export interface MainCommentProps
  extends Omit<CommentBoxProps, 'onEdit' | 'onComment' | 'className'> {
  permissionNotificationCommentId?: string;
  joinNotificationCommentId?: string;
  onCommented: CommentMarkdownInputProps['onCommented'];
  className?: ClassName;
  lazy?: boolean;
}

const shouldShowBannerOnComment = (
  commentId: string,
  comment: Comment,
): boolean =>
  commentId === comment.id ||
  comment.children?.edges?.some(({ node }) => node.id === commentId);

export default function MainComment({
  className,
  comment,
  appendTooltipTo,
  permissionNotificationCommentId,
  joinNotificationCommentId,
  onCommented,
  lazy = false,
  ...props
}: MainCommentProps): ReactElement {
  const { user } = useContext(AuthContext);
  const showNotificationPermissionBanner = useMemo(
    () => shouldShowBannerOnComment(permissionNotificationCommentId, comment),
    [permissionNotificationCommentId, comment],
  );
  const [isJoinSquadBannerDismissed] = usePersistentContext(
    SQUAD_COMMENT_JOIN_BANNER_KEY,
    false,
  );
  const showJoinSquadBanner =
    useMemo(
      () => shouldShowBannerOnComment(joinNotificationCommentId, comment),
      [joinNotificationCommentId, comment],
    ) &&
    !props.post.source?.currentMember &&
    !isJoinSquadBannerDismissed;

  const {
    commentId,
    inputProps: replyProps,
    onReplyTo,
  } = useComments(props.post);
  const { inputProps: editProps, onEdit } = useEditCommentProps();

  const initialInView = !lazy;
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    initialInView,
  });

  return (
    <section
      ref={inViewRef}
      className={classNames(
        'flex scroll-mt-16 flex-col items-stretch rounded-24 border-theme-divider-tertiary',
        className?.container,
        inView && 'border',
      )}
      data-testid="comment"
      style={{
        contentVisibility: initialInView ? 'visible' : 'auto',
      }}
    >
      {!editProps && inView && (
        <CommentBox
          {...props}
          comment={comment}
          parentId={comment.id}
          className={{
            container: comment.children?.edges?.length > 0 && 'border-b',
            ...className?.commentBox,
          }}
          appendTooltipTo={appendTooltipTo}
          onComment={(selected, parentId) =>
            onReplyTo({
              username: selected.author.username,
              parentCommentId: parentId,
              commentId: selected.id,
            })
          }
          onEdit={({ id, lastUpdatedAt }) =>
            onEdit({ commentId: id, lastUpdatedAt })
          }
        />
      )}
      {editProps && (
        <CommentInputOrPage
          {...editProps}
          post={props.post}
          onCommented={(...params) => {
            onEdit(null);
            onCommented(...params);
          }}
          onClose={() => onEdit(null)}
          className={{ input: className?.commentBox }}
        />
      )}
      {commentId === comment.id && (
        <CommentInputOrPage
          {...replyProps}
          post={props.post}
          onCommented={(...params) => {
            onReplyTo(null);
            onCommented(...params);
          }}
          onClose={() => onReplyTo(null)}
          className={{ input: className?.commentBox }}
        />
      )}
      {inView &&
        comment.children?.edges.map(({ node }) => (
          <SubComment
            {...props}
            key={node.id}
            comment={node}
            parentComment={comment}
            appendTooltipTo={appendTooltipTo}
            className={className?.commentBox}
            onCommented={onCommented}
          />
        ))}
      {showJoinSquadBanner && (
        <SquadCommentJoinBanner
          className={!comment.children?.edges?.length && 'mt-3'}
          squad={props.post?.source as Squad}
          analyticsOrigin={props.origin}
          post={props.post}
        />
      )}
      {!showJoinSquadBanner && showNotificationPermissionBanner && (
        <EnableNotification
          className={!comment.children?.edges?.length && 'mt-3'}
          source={NotificationPromptSource.NewComment}
          contentName={
            user?.id !== comment?.author.id ? comment?.author?.name : undefined
          }
        />
      )}
    </section>
  );
}
