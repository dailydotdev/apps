import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import { apiUrl } from '../../lib/config';
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
import { usePostComment } from '../../hooks/usePostComment';

export interface ParentComment {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
  contentHtml: string;
  commentId: string | null;
  post: Post;
  editContent?: string;
  editId?: string;
}

interface PostCommentsProps {
  post: Post;
  origin: Origin;
  permissionNotificationCommentId?: string;
  modalParentSelector?: () => HTMLElement;
  onClick?: (parent: ParentComment) => unknown;
  onShare?: (comment: Comment) => void;
  onClickUpvote?: (commentId: string, upvotes: number) => unknown;
}

interface SharedData {
  editContent?: string;
  editId?: string;
}

const getParentComment = (
  post: Post,
  comment?: Comment,
  shared: SharedData = {},
) => {
  if (comment) {
    return {
      authorName: comment.author.name,
      authorImage: comment.author.image,
      content: comment.content,
      contentHtml: comment.contentHtml,
      publishDate: comment.lastUpdatedAt || comment.createdAt,
      commentId: comment.id,
      post,
      ...shared,
    };
  }

  return {
    authorName: post.source.name,
    authorImage: post.source.image,
    content: post.title,
    contentHtml: post.title,
    publishDate: post.createdAt,
    commentId: null,
    post,
    ...shared,
  };
};

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
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const { requestMethod } = useRequestProtocol();
  const { showPrompt } = usePrompt();
  const queryKey = ['post_comments', id];
  const { data: comments, isLoading: isLoadingComments } =
    useQuery<PostCommentsData>(
      queryKey,
      () =>
        requestMethod(
          `${apiUrl}/graphql`,
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
  const commentRef = useRef(null);
  const { deleteCommentCache } = usePostComment(post);
  const deleteCommentPrompt = async (
    commentId: string,
    parentId: string | null,
  ) => {
    const options: PromptOptions = {
      title: 'Delete comment',
      description:
        'Are you sure you want to delete your comment? This action cannot be undone.',
      okButton: {
        title: 'Delete',
        className: 'btn-primary-ketchup',
      },
    };
    if (await showPrompt(options)) {
      await deleteComment(commentId, requestMethod);
      deleteCommentCache(commentId, parentId);
    }
  };

  const [scrollToComment, setScrollToComment] = useState(!!commentHash);
  useEffect(() => {
    if (commentsCount > 0 && scrollToComment && commentRef.current) {
      commentRef.current.scrollIntoView();
      setScrollToComment(false);
    }
  }, [commentsCount, scrollToComment]);

  if (isLoadingComments || comments === null) {
    return <PlaceholderCommentList placeholderAmount={post.numComments} />;
  }

  if (commentsCount === 0) {
    return (
      <div className="mt-8 mb-12 text-center text-theme-label-quaternary typo-subhead">
        Be the first to comment.
      </div>
    );
  }

  const onCommentClick = (comment: Comment, parentId: string | null) => {
    if (user) {
      const parent = getParentComment(post, comment);
      parent.commentId = parentId;

      onClick(parent);
    } else {
      showLogin(AuthTriggers.Comment);
    }
  };

  const onEditClick = (comment: Comment, localParentComment?: Comment) => {
    const shared = { editContent: comment.content, editId: comment.id };
    onClick(getParentComment(post, localParentComment, shared));
  };
  return (
    <div className="flex flex-col gap-4 mb-12">
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
          appendTooltipTo={modalParentSelector}
          permissionNotificationCommentId={permissionNotificationCommentId}
        />
      ))}
    </div>
  );
}
