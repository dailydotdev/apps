import type { ReactElement, ReactNode } from 'react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
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
  canReply?: MainCommentProps['canReply'];
  onReplyBlocked?: MainCommentProps['onReplyBlocked'];
  /**
   * Renders after the top-level comment at which the running total of
   * comments — replies included, every comment counts — crosses a multiple
   * of `interleaveEvery`. Used by the ad template to break a long thread up;
   * never after the last top-level comment, where whatever follows the
   * thread already sits. Both props are required together, and without them
   * the list keeps its original markup.
   */
  interleaveEvery?: number;
  renderInterleaved?: (occurrence: number) => ReactNode;
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
  canReply,
  onReplyBlocked,
  interleaveEvery,
  renderInterleaved,
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
      {(() => {
        // Replies count too: the interval is over everything the reader
        // scrolls past, not just top-level rows (loaded replies — collapsed
        // pagination beyond the first page is not on screen and not counted),
        // and the boundary can only sit after a top-level block. One prefix
        // pass instead of two reductions per row.
        const totals: number[] = [0];
        comments!.postComments.edges.forEach((edge, i) => {
          totals.push(totals[i] + 1 + (edge.node.children?.edges?.length ?? 0));
        });
        return comments!.postComments.edges.map((e, index, edges) => {
          const isLast = index === edges.length - 1;
          const seen = totals[index + 1];
          const shouldInterleave =
            !!interleaveEvery &&
            !!renderInterleaved &&
            !isLast &&
            Math.floor(seen / interleaveEvery) >
              Math.floor(totals[index] / interleaveEvery);

          // Always the Fragment, even rows that interleave nothing: the type at
          // a given key must not flip as the boundary moves (a new comment
          // landing shifts every index), or React remounts that comment's
          // subtree and open reply boxes lose their state.
          return (
            <Fragment key={e.node.id}>
              <MainComment
                isModalThread={isModalThread}
                className={{ commentBox: className }}
                post={post}
                origin={origin}
                commentHash={commentHash ?? undefined}
                commentRef={commentRef as React.MutableRefObject<HTMLElement>}
                comment={e.node}
                onShare={onShare ?? noopShare}
                onDelete={(comment, parentId) =>
                  deleteComment(comment.id, parentId ?? null, post)
                }
                onShowUpvotes={onClickUpvote ?? noopShowUpvotes}
                postAuthorId={post.author?.id ?? null}
                postScoutId={post.scout?.id ?? null}
                appendTooltipTo={getAppendTooltipParent}
                permissionNotificationCommentId={
                  permissionNotificationCommentId
                }
                joinNotificationCommentId={joinNotificationCommentId}
                onCommented={onCommented}
                lazy={!commentHash && index >= lazyCommentThreshold}
                canReply={canReply}
                onReplyBlocked={onReplyBlocked}
              />
              {shouldInterleave &&
                renderInterleaved(Math.floor(seen / interleaveEvery))}
            </Fragment>
          );
        });
      })()}
    </div>
  );
}
