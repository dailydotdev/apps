import type { ReactElement } from 'react';
import React, { useContext, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';
import EnableNotification from '../notifications/EnableNotification';
import type { CommentBoxProps } from './CommentBox';
import CommentBox from './CommentBox';
import SubComment from './SubComment';
import CollapsedRepliesPreview from './CollapsedRepliesPreview';
import AuthContext from '../../contexts/AuthContext';
import { LogEvent, NotificationPromptSource, TargetType } from '../../lib/log';
import type { CommentMarkdownInputProps } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useComments } from '../../hooks/post';
import { SquadCommentJoinBanner } from '../squads/SquadCommentJoinBanner';
import type { Squad } from '../../graphql/sources';
import { SourceType } from '../../graphql/sources';
import type { Comment } from '../../graphql/comments';
import { DiscussIcon, ThreadIcon } from '../icons';
import usePersistentContext from '../../hooks/usePersistentContext';
import { SQUAD_COMMENT_JOIN_BANNER_KEY } from '../../graphql/squads';
import { useEditCommentProps } from '../../hooks/post/useEditCommentProps';
import { useLogContext } from '../../contexts/LogContext';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useNotificationPreference } from '../../hooks/notifications';
import { NotificationType } from '../notifications/utils';
import { useNotificationCtaExperiment } from '../../hooks/notifications/useNotificationCtaExperiment';

const CommentInputOrModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "commentInputOrModal" */ './CommentInputOrModal'
    ),
);

type ClassName = {
  container?: string;
  commentBox?: CommentBoxProps['className'];
};

export interface MainCommentProps
  extends Omit<CommentBoxProps, 'onEdit' | 'onComment' | 'className'> {
  permissionNotificationCommentId?: string;
  joinNotificationCommentId?: string;
  upvoteNotificationCommentId?: string;
  onCommented: CommentMarkdownInputProps['onCommented'];
  className?: ClassName;
  lazy?: boolean;
  logImpression?: boolean;
  logClick?: boolean;
  isModalThread?: boolean;
}

const shouldShowBannerOnComment = (
  commentId: string,
  comment: Comment,
): boolean =>
  commentId === comment.id ||
  (comment.children?.edges?.some(({ node }) => node.id === commentId) ?? false);

export default function MainComment({
  className,
  comment,
  appendTooltipTo,
  permissionNotificationCommentId,
  joinNotificationCommentId,
  upvoteNotificationCommentId,
  onCommented,
  lazy = false,
  logImpression,
  logClick,
  isModalThread = false,
  ...props
}: MainCommentProps): ReactElement {
  const { user } = useContext(AuthContext);
  const { logEvent } = useLogContext();
  const showNotificationPermissionBanner = useMemo(
    () => shouldShowBannerOnComment(permissionNotificationCommentId, comment),
    [permissionNotificationCommentId, comment],
  );
  const { isEnabled: isNotificationCtaExperimentEnabled } =
    useNotificationCtaExperiment();
  const showUpvoteNotificationPermissionBanner =
    isNotificationCtaExperimentEnabled &&
    upvoteNotificationCommentId === comment.id;

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
  const replyNotificationType =
    props.post.source?.type === SourceType.Squad
      ? NotificationType.SquadReply
      : NotificationType.CommentReply;
  const { subscribeNotification } = useNotificationPreference({ params: [] });

  const onEnableUpvoteNotification = async () => {
    if (!upvoteNotificationCommentId) {
      return;
    }

    await subscribeNotification({
      type: replyNotificationType,
      referenceId: upvoteNotificationCommentId,
    });
  };

  const {
    commentId,
    inputProps: replyProps,
    onReplyTo,
  } = useComments(props.post);
  const { inputProps: editProps, onEdit } = useEditCommentProps();

  const replyCount = comment.children?.edges?.length ?? 0;

  const initialInView = !lazy;
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    initialInView,
  });

  const [areRepliesExpanded, setAreRepliesExpanded] = useState(true);
  const showThreadRepliesToggle = isModalThread && replyCount > 0;
  const showUpvoteCtaInReplyFlow =
    showUpvoteNotificationPermissionBanner && isModalThread && replyCount > 0;
  const shouldRenderStandaloneUpvoteCta =
    showUpvoteNotificationPermissionBanner && !showUpvoteCtaInReplyFlow;

  const onClick = () => {
    if (!logClick && !props.linkToComment) {
      return;
    }

    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Comment,
      target_id: comment.id,
      extra: JSON.stringify({ origin: props.origin }),
    });
  };

  return (
    <section
      ref={inViewRef}
      className={classNames(
        'flex scroll-mt-16 flex-col items-stretch border-border-subtlest-tertiary',
        isModalThread
          ? 'relative rounded-none border-0 bg-transparent'
          : 'rounded-16',
        className?.container,
        !isModalThread && inView && 'border',
      )}
      data-testid="comment"
      style={{
        contentVisibility: initialInView ? 'visible' : 'auto',
      }}
    >
      {!editProps && (logImpression || inView) && (
        <div className="relative">
          {isModalThread && replyCount > 0 && (
            // Vertical connector starts at avatar bottom (top-10 = 2.5rem = 40px) and ends above action row.
            // bottom-8 = 2rem = 32px stops just above the ~32px action row.
            <div className="pointer-events-none absolute bottom-8 left-5 top-10 w-px bg-accent-pepper-subtle" />
          )}
          <CommentBox
            {...props}
            comment={comment}
            parentId={comment.id}
            className={{
              container: classNames(
                comment.children?.edges?.length > 0 &&
                  !isModalThread &&
                  'border-b',
                isModalThread &&
                  'rounded-none border-0 bg-transparent px-0 pb-0 pt-0 hover:bg-transparent',
              ),
              content: classNames(isModalThread && 'ml-[52px] mt-1'),
              markdown: classNames(
                isModalThread &&
                  '!text-[0.9375rem] [&_a]:!text-[0.9375rem] [&_li]:!text-[0.9375rem] [&_li]:!leading-[1.55] [&_p]:!text-[0.9375rem] [&_p]:!leading-[1.55]',
              ),
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
            onClick={onClick}
            isModalThread={isModalThread}
            threadRepliesControl={
              showThreadRepliesToggle && (
                <Button
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  iconSecondaryOnHover
                  icon={<ThreadIcon open={areRepliesExpanded} />}
                  className="z-10"
                  onClick={() => setAreRepliesExpanded((expanded) => !expanded)}
                  aria-label={
                    areRepliesExpanded
                      ? 'Collapse replies thread'
                      : 'Expand replies thread'
                  }
                />
              )
            }
          />
        </div>
      )}
      {editProps && (
        <CommentInputOrModal
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
        <div className={classNames(isModalThread && 'mt-2')}>
          <CommentInputOrModal
            {...replyProps}
            post={props.post}
            onCommented={(...params) => {
              onReplyTo(null);
              onCommented(...params);
            }}
            onClose={() => onReplyTo(null)}
            className={{ input: className?.commentBox }}
            replyToCommentId={commentId}
          />
        </div>
      )}
      {showJoinSquadBanner && (
        <SquadCommentJoinBanner
          className={!comment.children?.edges?.length && 'mt-3'}
          squad={props.post?.source as Squad}
          logOrigin={props.origin}
          post={props.post}
        />
      )}
      {shouldRenderStandaloneUpvoteCta && (
        <EnableNotification
          className={!comment.children?.edges?.length && 'mt-3'}
          source={NotificationPromptSource.CommentUpvote}
          contentName={
            user?.id !== comment?.author.id ? comment?.author?.name : undefined
          }
          onEnableAction={onEnableUpvoteNotification}
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
      {showUpvoteCtaInReplyFlow && (
        <div className="relative mb-1">
          <div className="pointer-events-none absolute -bottom-4 -top-4 left-5 w-px bg-accent-pepper-subtle" />
          <EnableNotification
            source={NotificationPromptSource.CommentUpvote}
            contentName={
              user?.id !== comment?.author.id
                ? comment?.author?.name
                : undefined
            }
            onEnableAction={onEnableUpvoteNotification}
          />
        </div>
      )}
      {inView && replyCount > 0 && !areRepliesExpanded && (
        <CollapsedRepliesPreview
          replies={comment.children.edges}
          onExpand={() => setAreRepliesExpanded(true)}
          isThreadStyle={isModalThread}
          className={isModalThread ? 'ml-12 mt-3' : undefined}
        />
      )}
      {inView && replyCount > 0 && areRepliesExpanded && (
        <div
          className={classNames(
            isModalThread ? 'relative mt-1 flex flex-col' : '',
            isModalThread && commentId === comment.id && 'mt-2',
          )}
        >
          {!isModalThread && (
            <button
              type="button"
              className="mx-4 my-2 flex cursor-pointer items-center gap-1.5 text-text-tertiary typo-callout hover:underline"
              onClick={() => setAreRepliesExpanded(false)}
              data-testid="hide-replies-button"
            >
              <DiscussIcon className="text-xl" />
              <span>Hide replies</span>
            </button>
          )}
          {comment.children?.edges.map(({ node }, index) => (
            <SubComment
              {...props}
              key={node.id}
              comment={node}
              parentComment={comment}
              upvoteNotificationCommentId={upvoteNotificationCommentId}
              appendTooltipTo={appendTooltipTo}
              className={className?.commentBox}
              onCommented={onCommented}
              isModalThread={isModalThread}
              isFirst={
                index === 0 && !(showUpvoteCtaInReplyFlow && areRepliesExpanded)
              }
              isLast={index === comment.children.edges.length - 1}
              extendTopConnector={isModalThread && commentId === comment.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
