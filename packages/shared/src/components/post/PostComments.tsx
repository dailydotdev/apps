import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Comment, SortCommentsBy } from '../../graphql/comments';
import type { Post } from '../../graphql/posts';
import type { MainCommentProps } from '../comments/MainComment';
import MainComment from '../comments/MainComment';
import PlaceholderCommentList from '../comments/PlaceholderCommentList';
import { Origin } from '../../lib/log';
import type { CommentClassName } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useDeleteComment } from '../../hooks/comments/useDeleteComment';
import { usePostComments } from '../../hooks/comments/usePostComments';
import { lazyCommentThreshold } from '../utilities';
import { isNullOrUndefined } from '../../lib/func';
import { useCommentContentPreferenceMutationSubscription } from './useCommentContentPreferenceMutationSubscription';
import { CharmEmptyState } from '../charm/CharmEmptyState';
import { cloudinaryCharmNoComments } from '../../lib/image';

const threadCommentOrigins = new Set<Origin>([
  Origin.ArticleModal,
  Origin.ReaderModal,
  Origin.ArticlePage,
  Origin.CollectionModal,
  Origin.BriefModal,
  Origin.BriefPage,
]);

interface PostCommentsProps {
  post: Post;
  origin: Origin;
  sortBy?: SortCommentsBy;
  isComposerOpen?: boolean;
  permissionNotificationCommentId?: string;
  joinNotificationCommentId?: string;
  modalParentSelector?: () => HTMLElement;
  onShare?: (comment: Comment) => void;
  onClickUpvote?: (commentId: string, upvotes: number) => unknown;
  className?: CommentClassName;
  onCommented?: MainCommentProps['onCommented'];
  /**
   * Drop the list's top margin. Use when comments are the first element in
   * their container (e.g. the redesign discussion panel) so they don't get an
   * extra gap above the first item.
   */
  removeTopSpacing?: boolean;
}

const noopShare = (): void => {};
const noopShowUpvotes = (): void => {};

export function PostComments({
  post,
  origin,
  sortBy,
  isComposerOpen = false,
  onShare,
  onClickUpvote,
  modalParentSelector,
  permissionNotificationCommentId,
  joinNotificationCommentId,
  className = {},
  onCommented,
  removeTopSpacing = false,
}: PostCommentsProps): ReactElement {
  const { id } = post;
  const container = useRef<HTMLDivElement | null>(null);
  const isModalThread = threadCommentOrigins.has(origin);
  const {
    queryKey,
    comments,
    isLoading: isLoadingComments,
    commentsCount,
  } = usePostComments({ postId: id, sortBy });

  useCommentContentPreferenceMutationSubscription({ queryKey });

  const { hash: commentHash } = globalThis?.window?.location || {};
  const commentRef = useRef<HTMLElement | null>(null);
  const { deleteComment } = useDeleteComment();

  const [scrollToComment, setScrollToComment] = useState(!!commentHash);
  useEffect(() => {
    if (commentsCount > 0 && scrollToComment && commentRef.current) {
      commentRef.current.scrollIntoView({ block: 'center', inline: 'nearest' });
      setScrollToComment(false);
    }
  }, [commentsCount, scrollToComment]);

  if (isLoadingComments || isNullOrUndefined(comments)) {
    return <PlaceholderCommentList placeholderAmount={post.numComments} />;
  }

  if (commentsCount === 0) {
    return (
      <CharmEmptyState
        className="mb-12 mt-8"
        image={cloudinaryCharmNoComments}
        imageAlt="daily.dev charm peeking over a glowing speech bubble"
        title="No comments yet"
        description="The discussion is waiting for a spark. Share your take and get it started."
      />
    );
  }

  const getAppendTooltipParent = (): HTMLElement =>
    modalParentSelector?.() ?? container.current ?? document.body;

  return (
    <div
      className={
        isModalThread
          ? classNames(
              'mb-12 flex flex-col gap-4',
              !removeTopSpacing && (isComposerOpen ? 'mt-2' : 'mt-5'),
            )
          : classNames(
              '-mx-4 mb-12 flex flex-col gap-4 mobileL:mx-0',
              !removeTopSpacing && 'mt-6',
            )
      }
      ref={container}
    >
      {comments!.postComments.edges.map((e, index) => (
        <MainComment
          isModalThread={isModalThread}
          className={{ commentBox: className }}
          post={post}
          origin={origin}
          commentHash={commentHash ?? undefined}
          commentRef={commentRef as React.MutableRefObject<HTMLElement>}
          comment={e.node}
          key={e.node.id}
          onShare={onShare ?? noopShare}
          onDelete={(comment, parentId) =>
            deleteComment(comment.id, parentId ?? null, post)
          }
          onShowUpvotes={onClickUpvote ?? noopShowUpvotes}
          postAuthorId={post.author?.id ?? null}
          postScoutId={post.scout?.id ?? null}
          appendTooltipTo={getAppendTooltipParent}
          permissionNotificationCommentId={permissionNotificationCommentId}
          joinNotificationCommentId={joinNotificationCommentId}
          onCommented={onCommented}
          lazy={!commentHash && index >= lazyCommentThreshold}
        />
      ))}
    </div>
  );
}
