import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { graphqlUrl } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';
import {
  Comment,
  POST_COMMENTS_QUERY,
  PostCommentsData,
  deleteComment,
} from '../../graphql/comments';
import { Post } from '../../graphql/posts';
import MainComment, { MainCommentProps } from '../comments/MainComment';
import PlaceholderCommentList from '../comments/PlaceholderCommentList';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { initialDataKey } from '../../lib/constants';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import { useToastNotification } from '../../hooks/useToastNotification';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { removePostComments } from '../../hooks/usePostById';
import { CommentClassName } from '../fields/MarkdownInput/CommentMarkdownInput';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { isNullOrUndefined } from '../../lib/func';

interface PostCommentsProps {
  post: Post;
  origin: Origin;
  permissionNotificationCommentId?: string;
  joinNotificationCommentId?: string;
  modalParentSelector?: () => HTMLElement;
  onShare?: (comment: Comment) => void;
  onClickUpvote?: (commentId: string, upvotes: number) => unknown;
  className?: CommentClassName;
  onCommented?: MainCommentProps['onCommented'];
}

export function PostComments({
  post,
  origin,
  onShare,
  onClickUpvote,
  modalParentSelector,
  permissionNotificationCommentId,
  joinNotificationCommentId,
  className = {},
  onCommented,
}: PostCommentsProps): ReactElement {
  const { id } = post;
  const client = useQueryClient();
  const container = useRef<HTMLDivElement>();
  const { tokenRefreshed } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { displayToast } = useToastNotification();
  const { requestMethod } = useRequestProtocol();
  const { showPrompt } = usePrompt();
  const queryKey = generateQueryKey(RequestKey.PostComments, null, id);
  const { data: comments, isLoading: isLoadingComments } =
    useQuery<PostCommentsData>(
      queryKey,
      () =>
        requestMethod(
          graphqlUrl,
          POST_COMMENTS_QUERY,
          { postId: id, [initialDataKey]: comments, first: 50 },
          { requestKey: JSON.stringify(queryKey) },
        ),
      {
        enabled: !!id && tokenRefreshed,
        refetchInterval: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    );
  const { hash: commentHash } = window.location;
  const commentsCount = comments?.postComments?.edges?.length || 0;
  const commentRef = useRef<HTMLElement>(null);
  const deleteCommentPrompt = async (
    commentId: string,
    parentId: string | null,
  ) => {
    const options: PromptOptions = {
      title: 'Delete comment?',
      description:
        'Are you sure you want to delete your comment? This action cannot be undone.',
      okButton: {
        title: 'Delete',
        className: 'btn-primary-cabbage',
      },
    };
    if (!(await showPrompt(options))) {
      return;
    }

    trackEvent(postAnalyticsEvent(AnalyticsEvent.DeleteComment, post));
    await deleteComment(commentId, requestMethod);
    displayToast('The comment has been deleted');
    removePostComments(client, post, commentId, parentId);
  };

  const [scrollToComment, setScrollToComment] = useState(!!commentHash);
  useEffect(() => {
    if (commentsCount > 0 && scrollToComment && commentRef.current) {
      commentRef.current.scrollIntoView({ block: 'center', inline: 'nearest' });
      setScrollToComment(false);
    }
  }, [commentsCount, scrollToComment]);

  if (commentsCount === 0) {
    return (
      <div className="mt-8 mb-12 text-center text-theme-label-quaternary typo-subhead">
        Be the first to comment.
      </div>
    );
  }

  if (isLoadingComments || isNullOrUndefined(comments)) {
    return <PlaceholderCommentList placeholderAmount={post.numComments} />;
  }

  return (
    <div className="flex flex-col gap-4 mb-12" ref={container}>
      {comments.postComments.edges.map((e) => (
        <MainComment
          className={className}
          post={post}
          origin={origin}
          commentHash={commentHash}
          commentRef={commentRef}
          comment={e.node}
          key={e.node.id}
          onShare={onShare}
          onDelete={(comment, parentId) =>
            deleteCommentPrompt(comment.id, parentId)
          }
          onShowUpvotes={onClickUpvote}
          postAuthorId={post.author?.id}
          postScoutId={post.scout?.id}
          appendTooltipTo={modalParentSelector ?? (() => container?.current)}
          permissionNotificationCommentId={permissionNotificationCommentId}
          joinNotificationCommentId={joinNotificationCommentId}
          onCommented={onCommented}
        />
      ))}
    </div>
  );
}
