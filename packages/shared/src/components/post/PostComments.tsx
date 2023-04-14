import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import { graphqlUrl } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';
import {
  Comment,
  POST_COMMENTS_QUERY,
  PostCommentsData,
  deleteComment,
} from '../../graphql/comments';
import { Post } from '../../graphql/posts';
import MainComment from '../comments/MainComment';
import PlaceholderCommentList from '../comments/PlaceholderCommentList';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { initialDataKey } from '../../lib/constants';
import { Origin } from '../../lib/analytics';
import { AuthTriggers } from '../../lib/auth';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import {
  getParentComment,
  UsePostComment,
  usePostComment,
} from '../../hooks/usePostComment';
import { useToastNotification } from '../../hooks/useToastNotification';

interface PostCommentsProps {
  post: Post;
  origin: Origin;
  permissionNotificationCommentId?: string;
  modalParentSelector?: () => HTMLElement;
  onClick?: UsePostComment['onCommentClick'];
  onShare?: (comment: Comment) => void;
  onClickUpvote?: (commentId: string, upvotes: number) => unknown;
}

export function PostComments({
  post,
  origin,
  onClick,
  onShare,
  onClickUpvote,
  modalParentSelector,
  permissionNotificationCommentId,
}: PostCommentsProps): ReactElement {
  const { id } = post;
  const container = useRef<HTMLDivElement>();
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const { requestMethod } = useRequestProtocol();
  const { showPrompt } = usePrompt();
  const queryKey = ['post_comments', id];
  const { data: comments, isLoading: isLoadingComments } =
    useQuery<PostCommentsData>(
      queryKey,
      () =>
        requestMethod(
          graphqlUrl,
          POST_COMMENTS_QUERY,
          { postId: id, [initialDataKey]: comments, first: 500 },
          { requestKey: JSON.stringify(queryKey) },
        ),
      {
        enabled: !!id && tokenRefreshed,
        refetchInterval: 60 * 1000,
      },
    );
  const { hash: commentHash } = window.location;
  const commentsCount = comments?.postComments?.edges?.length || 0;
  const commentRef = useRef<HTMLElement>(null);
  const { deleteCommentCache } = usePostComment(post);
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
    if (await showPrompt(options)) {
      await deleteComment(commentId, requestMethod);
      displayToast('The comment has been deleted');
      deleteCommentCache(commentId, parentId);
    }
  };

  const [scrollToComment, setScrollToComment] = useState(!!commentHash);
  useEffect(() => {
    if (commentsCount > 0 && scrollToComment && commentRef.current) {
      commentRef.current.scrollIntoView({ block: 'center', inline: 'nearest' });
      setScrollToComment(false);
    }
  }, [commentsCount, scrollToComment]);

  if (post.numComments === 0) {
    return (
      <div className="mt-8 mb-12 text-center text-theme-label-quaternary typo-subhead">
        Be the first to comment.
      </div>
    );
  }

  if (isLoadingComments || comments === null) {
    return <PlaceholderCommentList placeholderAmount={post.numComments} />;
  }

  const getReplyTo = (comment: Comment) =>
    comment.author.id === user.id ? '' : `@${comment.author.username} `;

  const onCommentClick = (comment: Comment, parentId: string | null) => {
    if (user) {
      const parent = getParentComment(post, comment);
      parent.commentId = parentId;
      const replyTo = getReplyTo(comment);
      onClick(parent, replyTo);
    } else {
      showLogin(AuthTriggers.Comment);
    }
  };

  const onEditClick = (comment: Comment, localParentComment?: Comment) => {
    const shared = { editContent: comment.content, editId: comment.id };
    const replyTo = getReplyTo(comment);
    onClick(getParentComment(post, localParentComment, shared), replyTo);
  };

  return (
    <div className="flex flex-col gap-4 mb-12" ref={container}>
      {comments.postComments.edges.map((e) => (
        <MainComment
          post={post}
          origin={origin}
          commentHash={commentHash}
          commentRef={commentRef}
          comment={e.node}
          key={e.node.id}
          onComment={onCommentClick}
          onShare={onShare}
          onDelete={(comment, parentId) =>
            deleteCommentPrompt(comment.id, parentId)
          }
          onEdit={onEditClick}
          onShowUpvotes={onClickUpvote}
          postAuthorId={post.author?.id}
          postScoutId={post.scout?.id}
          appendTooltipTo={modalParentSelector ?? (() => container?.current)}
          permissionNotificationCommentId={permissionNotificationCommentId}
        />
      ))}
    </div>
  );
}
