import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import {
  Comment,
  POST_COMMENTS_QUERY,
  PostCommentsData,
} from '../../graphql/comments';
import { Post } from '../../graphql/posts';
import MainComment, { MainCommentProps } from '../comments/MainComment';
import PlaceholderCommentList from '../comments/PlaceholderCommentList';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { initialDataKey } from '../../lib/constants';
import { Origin } from '../../lib/log';
import { CommentClassName } from '../fields/MarkdownInput/CommentMarkdownInput';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useDeleteComment } from '../../hooks/comments/useDeleteComment';
import { lazyCommentThreshold } from '../utilities';
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
  const container = useRef<HTMLDivElement>();
  const { tokenRefreshed } = useContext(AuthContext);
  const { requestMethod } = useRequestProtocol();
  const queryKey = generateQueryKey(RequestKey.PostComments, null, id);
  const { data: comments, isLoading: isLoadingComments } =
    useQuery<PostCommentsData>(
      queryKey,
      () =>
        requestMethod(
          POST_COMMENTS_QUERY,
          { postId: id, [initialDataKey]: comments, first: 500 },
          { requestKey: JSON.stringify(queryKey) },
        ),
      {
        enabled: !!id && tokenRefreshed,
        refetchInterval: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    );
  const { hash: commentHash } = globalThis?.window?.location || {};
  const commentsCount = comments?.postComments?.edges?.length || 0;
  const commentRef = useRef<HTMLElement>(null);
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
      <div className="mb-12 mt-8 text-center text-text-quaternary typo-subhead">
        Be the first to comment.
      </div>
    );
  }

  return (
    <div className="mb-12 mt-6 flex flex-col gap-4" ref={container}>
      {comments.postComments.edges.map((e, index) => (
        <MainComment
          className={{ commentBox: className }}
          post={post}
          origin={origin}
          commentHash={commentHash}
          commentRef={commentRef}
          comment={e.node}
          key={e.node.id}
          onShare={onShare}
          onDelete={(comment, parentId) =>
            deleteComment(comment.id, parentId, post)
          }
          onShowUpvotes={onClickUpvote}
          postAuthorId={post.author?.id}
          postScoutId={post.scout?.id}
          appendTooltipTo={modalParentSelector ?? (() => container?.current)}
          permissionNotificationCommentId={permissionNotificationCommentId}
          joinNotificationCommentId={joinNotificationCommentId}
          onCommented={onCommented}
          lazy={!commentHash && index >= lazyCommentThreshold}
        />
      ))}
    </div>
  );
}
